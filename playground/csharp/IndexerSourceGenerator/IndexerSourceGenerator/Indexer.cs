using System;
using System.CodeDom.Compiler;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.CodeAnalysis;

namespace IndexerSourceGenerator
{
    
    public class Watcher : ISyntaxReceiver
    {
        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            
        }
    }
    [Generator]
    public class Indexer: ISourceGenerator
    {
        public void Initialize(GeneratorInitializationContext context)
        {
            context.RegisterForSyntaxNotifications(()=>new Watcher());
        }

        public void Execute(GeneratorExecutionContext context)
        {
#if DEBUG
            if (!Debugger.IsAttached)
            {
                Debugger.Launch();
            }
#endif
            var file = context.Compilation.SyntaxTrees.First(st =>
                Path.GetFileName(st.FilePath).ToLower().Contains("assemblyinfo.cs"));
        }

    }

    
}
