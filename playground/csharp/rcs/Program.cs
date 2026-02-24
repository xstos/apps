using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Newtonsoft.Json;

namespace rcs
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.WriteLine("to use the tool provide a path to a json file of the following form: "+ JsonConvert.SerializeObject(CsProjCollection.Example(),new JsonSerializerSettings() {Formatting=Formatting.Indented}));
                return;
            }

            var cfg = JsonConvert.DeserializeObject<CsProjCollection>(args[0]);
            foreach (var project in cfg.Projects)
            {
                project.Compile();
            }
        }
    }

    public class CsProjCollection
    {
        public List<CsProj> Projects { get; set; }

        public static CsProjCollection Example() => new CsProjCollection()
        {
            Projects = new List<CsProj>
            {
                new CsProj()
                {
                    OutputKind = String.Join(" OR ", Enum.GetNames(typeof(OutputKind))),
                    OutputPath = @"c:\temp\myprogram.compiled.output.exe",
                    References = new List<string>()
                    {
                        @"c:\temp\SomeReferencedAssembly.dll"
                    },
                    SourceFilePaths = new List<string>()
                    {
                        @"c:\temp\myprogram.compile.me.1.cs",
                        @"c:\temp\myprogram.compile.me.2.cs"
                    }
                }
            }
        };
    }

    public class CsProj
    {
        public string OutputKind { get; set; }
        public string OutputPath { get; set; }
        public List<string> References { get; set; }
        public List<string> SourceFilePaths { get; set; }
    }

    public static class RoslynUtil
    {
        public static void Compile(this CsProj project)
        {
            var foo = project.References.Select(MakeRef).ToList();
            RoslynUtil.Compile(foo, project.OutputPath, project.SourceFilePaths.Select(File.ReadAllText).ToArray());
        }

        public static MetadataReference MakeRef(string filePath)
        {
            return MetadataReference.CreateFromFile(filePath);
        }
        //public static string _GetAssemblyFullName(Assembly ass)
        //{
        //    var codeBase = ass.CodeBase;
        //    var uri = new UriBuilder(codeBase);
        //    var path = Uri.UnescapeDataString(uri.Path);
        //    return path;
        //}
        //static string Compile(IEnumerable<Assembly> references, params string[] sources)
        //{
        //    return Compile(references.Select(r => MakeRef(_GetAssemblyFullName(r))), "c:\\temp\\tests.dll", sources).Item2;
        //}
        //https://github.com/dotnet/roslyn/issues/27899
        public static (bool, string path, string status) Compile(IEnumerable<MetadataReference> references,string destinationPath, params string[] sources)
        {
            var compilation = CSharpCompilation.Create(destinationPath,
                options: new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, metadataReferenceResolver: null),
                syntaxTrees: sources.Select(source => CSharpSyntaxTree.ParseText(source)),
                references: references
                );

            using var ms = new MemoryStream();
            var emitResult = compilation.Emit(ms);
                
            if (!emitResult.Success) return (false,destinationPath, emitResult.ToString());
            using (var fileStream = File.Create(destinationPath))
            {
                ms.Seek(0, SeekOrigin.Begin);
                ms.CopyTo(fileStream);
            }
            return (true,destinationPath, emitResult.ToString());

        }
    }
}
