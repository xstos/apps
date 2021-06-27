using System;
using System.CodeDom.Compiler;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace IndexerSourceGenerator
{
    
    public class Watcher : ISyntaxReceiver
    {
        public Action<SyntaxNode> Action { get; set; }
        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            Action(syntaxNode);
        }
    }
    [Generator]
    public class Indexer: ISourceGenerator
    {
        private string artifacts = null;
        private string index = null;
        private List<string> names = new List<string>();
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
                        names.Add(syn.Identifier.ValueText);
                    }
                }
            });
        }

        public void Execute(GeneratorExecutionContext context)
        {

            if (artifacts == null)
            {
                IEnumerable<FileInfo> GetSourcePaths() => 
                    context.Compilation.SyntaxTrees.Select(st => new FileInfo(st.FilePath));

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

            File.AppendAllLines(index, names);
        }
    }
}
