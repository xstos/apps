using System;
using System.CodeDom.Compiler;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace IndexerSourceGenerator
{
    public static class CompilationExtensions
    {
        static IEnumerable<INamespaceSymbol> TraverseNamespaces(this ISymbol symbol)
        {
            var containingNamespace = symbol.ContainingNamespace;
            while (containingNamespace is { IsGlobalNamespace: false })
            {
                yield return containingNamespace;
                containingNamespace = containingNamespace.ContainingNamespace;
            }
        }
        public static string GetQualifiedName(this ISymbol symbol, params string[] concat)
        {
            var path = symbol.TraverseNamespaces().Reverse().Select(cn => cn.Name).Concat(concat);
            return string.Join(".", path);
        }
    }

    public class Watcher : ISyntaxReceiver
    {
        public Action<SyntaxNode> Action { get; set; }
        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            Action(syntaxNode);
        }
    }

    public class Index
    {

    }
    public class Indexes
    {
        public List<Index> Values { get; set; }
    }
    [Generator]
    public class Indexer: ISourceGenerator
    {
        private string artifacts = null;
        private string index = null;
        private List<ClassDeclarationSyntax> classes = new List<ClassDeclarationSyntax>();

        public void Initialize(GeneratorInitializationContext context)
        {
#if DEBUG
            if (!Debugger.IsAttached)
            {
                Debugger.Launch();
            }
#endif
            context.RegisterForSyntaxNotifications(()=>new Watcher()
            {
                Action = node =>
                {
                    if (node is ClassDeclarationSyntax syn)
                    {
                        classes.Add(syn);
                    } else if (node is VariableDeclaratorSyntax vds)
                    {
                    }
                }
            });
        }

        public void Execute(GeneratorExecutionContext context)
        {

            if (artifacts == null)
            {
                IEnumerable<FileInfo> GetSourcePaths() =>
                context.Compilation.SyntaxTrees
                    .Where(st => !string.IsNullOrWhiteSpace(st.FilePath))
                    .Select(st => new FileInfo(st.FilePath));

                var dir = GetSourcePaths().First(fi =>
                    fi.Name.Equals("assemblyinfo.cs", StringComparison.InvariantCultureIgnoreCase))
                    .Directory;

                while (!dir.GetDirectories(".git").Any()) //find git root
                {
                    dir = dir.Parent;
                }

                artifacts = Path.Combine(dir.FullName, "artifacts");
                if (!Directory.Exists(artifacts))
                {
                    Directory.CreateDirectory(artifacts);
                }

                index = Path.Combine(artifacts, context.Compilation.Assembly.Name + ".iocindex.json");
                File.Delete(index);
            }

            var toAppend = classes.Select((ClassDeclarationSyntax classSyn) =>
            {
                SemanticModel semanticModel = context.Compilation.GetSemanticModel(classSyn.SyntaxTree);
                
                ISymbol? typeSymbol = ModelExtensions.GetDeclaredSymbol(semanticModel, classSyn);
                return typeSymbol.GetQualifiedName(classSyn.Identifier.ValueText);
            });
            
            File.AppendAllLines(index, toAppend);
            var tree = CSharpSyntaxTree.ParseText(context.Compilation.SyntaxTrees.First(t => t.FilePath.Contains("Program.cs"))
                .GetText());
            var root = tree.GetRoot() as CompilationUnitSyntax;
            foreach (var descendantNode in root.DescendantNodes())
            {
                if (descendantNode is VariableDeclaratorSyntax vds)
                {
                    
                }
            }
            var foo = "";
            static Compilation CreateCompilation(params string[] sources)
            {
                return CSharpCompilation.Create(
                    assemblyName: "compilation",
                    syntaxTrees: sources.Where(source => !string.IsNullOrWhiteSpace(source)).Select(source =>
                        CSharpSyntaxTree.ParseText(source, new CSharpParseOptions(LanguageVersion.Preview))),
                    references: new[] { MetadataReference.CreateFromFile(typeof(Binder).GetTypeInfo().Assembly.Location) },
                    options: new CSharpCompilationOptions(OutputKind.ConsoleApplication)
                );
            }
        }
    }
}
