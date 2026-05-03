using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.CodeAnalysis.Text;
using RENAME_ME;

namespace Ideatum;

public static partial class I
{
    static string LoadFile(string path)
    {
        try
        {
            using FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using StreamReader streamReader = new StreamReader(fileStream);
            return streamReader.ReadToEnd();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error loading file: " + ex.Message);
        }

        return "";
    }
}

public static partial class I
{
    static int Count = 0;
    static FileSystemWatcher fsw;

    static I()
    {
        var refs = Assembly.GetEntryAssembly().GetReferencedAssemblies();
        Parallel.ForEach(refs, name =>
        {
            var ass = Assembly.Load(name);
            ass.GetTypes();
        });
    }
    static void Watch(Action<Action> callback, string srcPath)
    {
        void ReloadCore()
        {
            var name =  "X" + Count++;
            var files = Directory.GetFiles(srcPath,"*.cs",SearchOption.AllDirectories)
                .Select(path =>
                {
                    var ns = $"{nameof(RENAME_ME)}";
                    var code = LoadFile(path).Replace(ns, name);
                    return (code, path);
                });
            var refs = new HashSet<PortableExecutableReference>();

            void AddLoadedReferences()
            {
                bool AddAssembly(string assemblyDll)
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

                    if (refs.Any(r => r.FilePath == file)) return true;

                    try
                    {
                        var reference = MetadataReference.CreateFromFile(file);
                        //Console.WriteLine("AddAssembly "+reference.FilePath);
                        refs.Add(reference);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        return false;
                    }

                    return true;
                }

                var assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(a => !a.IsDynamic);

                foreach (var assembly in assemblies)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(assembly.Location)) continue;
                        AddAssembly(assembly.Location);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }
                
                AddAssembly("Microsoft.CSharp.dll"); // dynamic
                AddAssembly("System.Linq.Expressions.dll");
                AddAssembly("System.Text.RegularExpressions.dll");
            }

            AddLoadedReferences();

            var metadataReferences = refs.Cast<MetadataReference>().ToArray();
            var ass = CompileAssembly(files, metadataReferences);
            
            var type = ass.GetType($"{name}.{nameof(Hot)}");
            // Get the type
            Console.WriteLine("Compiled " + DateTime.Now);
            var method = type?.GetMethod(nameof(Hot.Run), BindingFlags.Public | BindingFlags.Static);
            if (method == null) return;
            var run = (Action)Delegate.CreateDelegate(typeof(Action), method);

            void Run()
            {
                try
                {
                    run();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }

            callback(Run);
        }

        void Reload()
        {
            try
            {
                ReloadCore();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        Reload();
        fsw = new FileSystemWatcher(srcPath);
        fsw.EnableRaisingEvents = true;
        fsw.IncludeSubdirectories = true;
        var prevHash = LookForChanges();

        List<(string path, int hash)> LookForChanges()
        {
            return Directory.GetFiles(srcPath)
                .Select(path => (path, LoadFile(path).GetHashCode())).ToList();
        }

        bool dirty = false;
        fsw.Changed += (o, eventArgs) =>
        {
            var path = eventArgs.FullPath.ToLower();
            if (path.EndsWith("~")) return;
            dirty = true;
        };
        _ = Task.Run(async () =>
        {
            while (true)
            {
                await Task.Delay(100);
                if (!dirty) continue;
                dirty = false;
                var changes = LookForChanges();
                if (!prevHash.Intersect(changes).Any()) return;
                prevHash = changes;
                Reload();
            }
        });
    }

    static Assembly CompileAssembly(IEnumerable<(string code, string path)> files, MetadataReference[] refs)
    {
        var assemblyName = Path.GetRandomFileName();
        var symbolsName = Path.ChangeExtension(assemblyName, "pdb");
        var encoding = Encoding.UTF8;
        var OutputAssembly = "";
        //var tree = SyntaxFactory.ParseSyntaxTree(code);
        var CompileWithDebug = true;
        Assembly Assembly = null;
        var trees = files.Select(tuple =>
        {
            var (code, path) = tuple;
            var buffer = encoding.GetBytes(code);
            var sourceText = SourceText.From(buffer, buffer.Length, encoding, canBeEmbedded: true);
            var syntaxTree = CSharpSyntaxTree.ParseText(
                sourceText,
                new CSharpParseOptions(),
                path);
            var syntaxRootNode = syntaxTree.GetRoot() as CSharpSyntaxNode;
            var tree = CSharpSyntaxTree.Create(syntaxRootNode, null, path, encoding);
            return (tree, path, sourceText);
        });

        var optimizationLevel = CompileWithDebug ? OptimizationLevel.Debug : OptimizationLevel.Release;

        var compilation = CSharpCompilation.Create(assemblyName)
            .WithOptions(new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                optimizationLevel: optimizationLevel,
                platform: Platform.AnyCpu)
            )
            .AddReferences(refs)
            .AddSyntaxTrees(trees.Select(t => t.tree));

        //if (SaveGeneratedCode)
        //    GeneratedClassCode = tree.ToString();

        bool isFileAssembly = false;
        Stream peStream = null;
        if (string.IsNullOrEmpty(OutputAssembly))
        {
            peStream = new MemoryStream(); // in-memory assembly
        }
        else
        {
            peStream = new FileStream(OutputAssembly, FileMode.Create, FileAccess.Write);
            isFileAssembly = true;
        }

        using (var pdbStream = new MemoryStream())
        using (peStream)
        {
            EmitResult compilationResult = null;
            if (CompileWithDebug)
            {
                var options = new EmitOptions(
                    debugInformationFormat: DebugInformationFormat.PortablePdb,
                    pdbFilePath: symbolsName);
                var embeddedTexts = trees.Select(tuple =>
                {
                    var (tree, path, sourceText) = tuple;
                    return EmbeddedText.FromSource(path, sourceText);
                });
                compilationResult = compilation.Emit(
                    peStream: peStream,
                    pdbStream: pdbStream,
                    embeddedTexts: embeddedTexts,
                    options: options
                );
            }
            else
                compilationResult = compilation.Emit(peStream);

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

            peStream.Position = 0;
            pdbStream.Position = 0;
            var assembly = AssemblyLoadContext.Default.LoadFromStream(peStream, pdbStream);
            return assembly;
        }
    }
}