using System;
using System.Collections.Generic;
using System.ComponentModel.Composition.Hosting;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
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

    public class Persist
    {
        public static List<object> Vars = new List<object>();
        List<string> commands = new List<string>();
        public object Value => Vars[Index];
        public int Index { get; set; }

        string Escape(object? o)
        {
            if (o == null) return "null";
            if (o is string s) return Microsoft.CodeAnalysis.CSharp.SymbolDisplay.FormatLiteral(s, true);
            var ret = o.ToString();
            if (ret == null) return "null";
            return ret;
        }
        public Persist Set(string prop, object value)
        {
            var typeName = Value.GetType().GetFriendlyName();
            $"(({typeName})KriterisEdit.Persist.Vars[{Index}]).{prop}={Escape(value)};".Var(out var cmd);
            Eval(cmd);
            return this;
        }
        
        public Persist Add(Persist child)
        {
            switch (Value)
            {
                case DockPanel dock:
@$"
var parent = ({typeof(DockPanel).GetFriendlyName()})KriterisEdit.Persist.Vars[{Index}];
var child = ({typeof(UIElement).GetFriendlyName()})KriterisEdit.Persist.Vars[{child.Index}];
parent.Children.Add(child);
".Var(out var cmd);
                Eval(cmd);
                    break;
            }
            return this;
        }

        public void Eval(string cmd)
        {
            commands.Add(cmd);
            Console.WriteLine(cmd);
            Scripting.Eval(cmd);
        }
        public Persist New<T>()
        {
            var name = typeof(T).GetFriendlyName();
            var index = Vars.Count;
            var cmd = $"KriterisEdit.Persist.Vars.Add(new {name}());";
            Eval(cmd);
            return new Persist() {
                commands = commands,
                Index = index,
            };
        }

        public static Persist New()
        {
            return new Persist();
        }

        public static Persist Example()
        {
            var persist = new Persist();
            var textBlock = persist.New<TextBlock>();
            persist.New<DockPanel>().Var(out var dockPanel).Add(textBlock);
            textBlock.Set(nameof(TextBlock.Text), "hello!");
            return dockPanel;
        }
    }
}