using System;
using System.ComponentModel.Composition.Hosting;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace KriterisEdit
{
    public class Scripting
    {
        static ScriptOptions options;
        
        static Scripting()
        {
            var dc = new DirectoryCatalog("."); //https://stackoverflow.com/a/2384679/1618433
            var references = AppDomain.CurrentDomain.GetAssemblies().Where(a=>!a.IsDynamic);
            options = ScriptOptions.Default.WithReferences(references);
        }
        
        public static object Eval(string code)
        {
            return CSharpScript.EvaluateAsync(code,options).GetAwaiter().GetResult();
        }
        
        public void Example()
        {
            Eval("System.Windows.MessageBox.Show(\"hi\");");
        } 
    }
}