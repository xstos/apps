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

namespace Ideatum;

public static partial class Program
{
    static int Count = 0;
    static FileSystemWatcher fsw;
    static void Watch()
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

                var ass = CompileAssembly(name, src, refs.Cast<MetadataReference>().ToArray());
                var type = ass.GetType(name + "." + "Hot");
                // Get the type

                type.GetMethod("Run", BindingFlags.Public | BindingFlags.Static).Invoke(null, null);
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

    static Assembly CompileAssembly(string assname, string source, MetadataReference[] refs,
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
}