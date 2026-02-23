using System;
using System.IO;
using System.Reflection;
using System.Reflection.Metadata;
using System.Runtime.Loader;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.CodeAnalysis.Scripting;
using Westwind.Scripting;

namespace HotReload2
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public static MainWindow Win { get; set; }
        static int Count = 0;
        static FileSystemWatcher fsw;
        static string LoadFile(string path)
        {
            try
            {
                using (FileStream fileStream =
                       new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    using (StreamReader streamReader = new StreamReader(fileStream))
                    {
                        return streamReader.ReadToEnd();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading log file: " + ex.Message);
            }

            return "";
        }

        static string GetSrcPath()
        {
            var location = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var dir = location + "../../../../src";
            return Path.GetFullPath(dir);
        }

        public MainWindow()
        {
            InitializeComponent();
            var foo = AdonisUI.Brushes.AccentBrush;
            this.Loaded += (sender, args) =>
            {
                Win = this;

                var srcPath = GetSrcPath();
                var hotPath = Path.Combine(srcPath, "Hot.cs");

                void reload()
                {
                    try
                    {
                        var name = "X" + Count++;
                        var src = LoadFile(hotPath);
                        src = src.Replace("RENAME_ME", name);
                        var refs = new HashSet<PortableExecutableReference>();
                        Ext.AddLoadedReferences(refs);

                        var ass = Ext.CompileAssembly(name, src, refs.Cast<MetadataReference>().ToArray());
                        var type = ass.GetType(name + "." + "Hot");
                        // Get the type

                        type.GetMethod("Run", BindingFlags.Public | BindingFlags.Static).Invoke(null, null);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }

                reload();
                fsw = new FileSystemWatcher(srcPath);
                fsw.EnableRaisingEvents = true;

                fsw.Changed += (o, eventArgs) =>
                {
                    var path = eventArgs.FullPath.ToLower();
                    if (path.EndsWith("~")) return;
                    if (!path.EndsWith("hot.cs"))
                    {
                        return;
                    }

                    reload();
                };
            };
        }
    }

    public static class Ext
    {
        public static bool AddAssembly(this HashSet<PortableExecutableReference> References, string assemblyDll)
        {
            if (string.IsNullOrEmpty(assemblyDll)) return false;

            var file = Path.GetFullPath(assemblyDll);

            if (!File.Exists(file))
            {
                // check framework or dedicated runtime app folder
                var path = Path.GetDirectoryName(typeof(object).Assembly.Location);
                file = Path.Combine(path, assemblyDll);
                if (!File.Exists(file))
                    return false;
            }

            if (References.Any(r => r.FilePath == file)) return true;

            try
            {
                var reference = MetadataReference.CreateFromFile(file);
                References.Add(reference);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }

            return true;
        }

        public static void AddLoadedReferences(HashSet<PortableExecutableReference> refs)
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in assemblies)
            {
                try
                {
                    if (string.IsNullOrEmpty(assembly.Location)) continue;
                    AddAssembly(refs, assembly.Location);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }

            AddAssembly(refs, "Microsoft.CSharp.dll"); // dynamic
            AddAssembly(refs, "System.Linq.Expressions.dll");
            AddAssembly(refs, "System.Text.RegularExpressions.dll");
        }

        public static Assembly CompileAssembly(string assname, string source, MetadataReference[] refs,
            bool noLoad = false)
        {
            var OutputAssembly = "";
            var tree = SyntaxFactory.ParseSyntaxTree(source.Trim());
            var CompileWithDebug = true;
            Assembly Assembly = null;
            var optimizationLevel = CompileWithDebug ? OptimizationLevel.Debug : OptimizationLevel.Release;

            var compilation = CSharpCompilation.Create(assname)
                .WithOptions(new CSharpCompilationOptions(
                    OutputKind.DynamicallyLinkedLibrary,
                    optimizationLevel: optimizationLevel)
                )
                .AddReferences(refs)
                .AddSyntaxTrees(tree);

            //if (SaveGeneratedCode)
            //    GeneratedClassCode = tree.ToString();

            bool isFileAssembly = false;
            Stream codeStream = null;
            if (string.IsNullOrEmpty(OutputAssembly))
            {
                codeStream = new MemoryStream(); // in-memory assembly
            }
            else
            {
                codeStream = new FileStream(OutputAssembly, FileMode.Create, FileAccess.Write);
                isFileAssembly = true;
            }

            using (codeStream)
            {
                EmitResult compilationResult = null;
                if (CompileWithDebug)
                {
                    var debugOptions = CompileWithDebug ? DebugInformationFormat.Embedded : DebugInformationFormat.Pdb;
                    compilationResult = compilation.Emit(codeStream,
                        options: new EmitOptions(debugInformationFormat: debugOptions));
                }
                else
                    compilationResult = compilation.Emit(codeStream);

                // Compilation Error handling
                if (!compilationResult.Success)
                {
                    var sb = new StringBuilder();
                    foreach (var diag in compilationResult.Diagnostics)
                    {
                        sb.AppendLine(diag.ToString());
                    }

                    Console.WriteLine(sb.ToString());
                    return null;
                }

                codeStream.Position = 0;
                AssemblyLoadContext alc = new AssemblyLoadContext(null);
                var ass = alc.LoadFromStream(codeStream);
                return ass;
            }
        }

        public static bool AddAssembly(HashSet<PortableExecutableReference> References, Type type)
        {
            try
            {
                // *** TODO: need a better way to identify for in memory dlls that don't have location
                if (References.Any(r => r.FilePath == type.Assembly.Location))
                    return true;

                if (string.IsNullOrEmpty(type.Assembly.Location))
                {
                    unsafe
                    {
                        bool result = type.Assembly.TryGetRawMetadata(out byte* metaData, out int size);
                        var moduleMetaData = ModuleMetadata.CreateFromMetadata((nint)metaData, size);
                        var assemblyMetaData = AssemblyMetadata.Create(moduleMetaData);
                        References.Add(assemblyMetaData.GetReference());
                    }

                    return false;
                }
                else
                {
                    var systemReference = MetadataReference.CreateFromFile(type.Assembly.Location);
                    References.Add(systemReference);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }

            return true;
        }
    }
}