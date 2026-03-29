using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.CodeAnalysis.Text;

namespace Ideatum;

public static partial class I
{
    static int Count = 0;
    static FileSystemWatcher fsw;
    static void Watch(Action<Action> callback)
    {
        var srcPath = GetSrcPath();
        var hotPath = Path.Combine(srcPath, "HotReload.cs");

        void Reload()
        {
            try
            {
                var name = "X" + Count++;
                var src = LoadFile(hotPath);
                src = src.Replace("RENAME_ME", name);
                var refs = new HashSet<PortableExecutableReference>();
                AddLoadedReferences(refs);

                var metadataReferences = refs.Cast<MetadataReference>().ToArray();
                var ass = CompileAssembly(src, metadataReferences,hotPath);
                var type = ass.GetType(name + "." + "Hot");
                // Get the type
                Console.WriteLine("Compiled "+DateTime.Now);
                var method = type?.GetMethod("Run", BindingFlags.Public | BindingFlags.Static);
                if (method != null)
                {
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
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        Reload();
        fsw = new FileSystemWatcher(srcPath);
        fsw.EnableRaisingEvents = true;

        fsw.Changed += (o, eventArgs) =>
        {
            var path = eventArgs.FullPath.ToLower();
            if (path.EndsWith("~")) return;
            if (!path.EndsWith("hotreload.cs"))
            {
                return;
            }

            Reload();
        };
    }
    static string GetSrcPath()
    {
        var location = Directory.GetCurrentDirectory();
        var dir = location + "../../../../hot";
        return Path.GetFullPath(dir);
    }
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
    static bool AddAssembly(this HashSet<PortableExecutableReference> References, string assemblyDll)
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

    static void AddLoadedReferences(HashSet<PortableExecutableReference> refs)
    {
        var assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(a=>!a.IsDynamic);

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

    static Assembly CompileAssembly(string code, MetadataReference[] refs, string sourceCodePath)
    {
        var assemblyName = Path.GetRandomFileName();
        var symbolsName = Path.ChangeExtension(assemblyName, "pdb");
        var encoding = Encoding.UTF8;
        var OutputAssembly = "";
        //var tree = SyntaxFactory.ParseSyntaxTree(code);
        var CompileWithDebug = true;
        Assembly Assembly = null;
        var buffer = encoding.GetBytes(code);
        var sourceText = SourceText.From(buffer, buffer.Length, encoding, canBeEmbedded: true);
        var syntaxTree = CSharpSyntaxTree.ParseText(
            sourceText, 
            new CSharpParseOptions(), 
            path: sourceCodePath);
        var syntaxRootNode = syntaxTree.GetRoot() as CSharpSyntaxNode;
        var encoded = CSharpSyntaxTree.Create(syntaxRootNode, null, sourceCodePath, encoding);

        var optimizationLevel = CompileWithDebug ? OptimizationLevel.Debug : OptimizationLevel.Release;

        var compilation = CSharpCompilation.Create(assemblyName)
            .WithOptions(new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                optimizationLevel: optimizationLevel, 
                platform: Platform.AnyCpu)
            )
            .AddReferences(refs)
            .AddSyntaxTrees(encoded);

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
                
                var emitOptions = new EmitOptions(
                    debugInformationFormat: DebugInformationFormat.PortablePdb,
                    pdbFilePath:symbolsName);
                var embeddedTexts = new List<EmbeddedText>
                {
                    EmbeddedText.FromSource(sourceCodePath, sourceText),
                };
                compilationResult = compilation.Emit(
                    peStream: peStream, 
                    pdbStream: pdbStream, 
                    embeddedTexts: embeddedTexts,
                    options: emitOptions
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