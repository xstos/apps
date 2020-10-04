using System;
using System.Collections.Generic;
using System.DirectoryServices.ActiveDirectory;
using System.IO;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;

namespace KriterisEdit
{
    public class Persist
    {
        public static List<object> Vars = new List<object>();
        List<string> commands = new List<string>();
        public object Value => Vars[Index];
        public int Index { get; set; }
        public static string VARS = typeof(Persist).FullName + "." + nameof(Vars);
        static string Escape(object? o)
        {
            if (o == null) return "null";
            if (o is Enum e)
            {
                var n = Enum.GetName(o.GetType(), e);
                return o.GetType().GetFriendlyName() + "." + n;
            }
            if (o is string s) return Microsoft.CodeAnalysis.CSharp.SymbolDisplay.FormatLiteral(s, true);
            var ret = o.ToString();
            if (ret == null) return "null";
            return ret;
        }
        public Persist Set(string prop, object value)
        {
            $"(({Value.NAME()}){VARS}[{Index}]).{prop}={Escape(value)};".Var(out var cmd);
            Eval(cmd);
            return this;
        }
        
        public Persist Add(Persist child)
        {
            switch (Value)
            {
                case Panel dock:
                    var p = "parent_"+Guid.NewGuid().ToString("N");
                    var c = "child_"+Guid.NewGuid().ToString("N");
@$"
var {p} = ({TYPE<Panel>()}){VARS}[{Index}];
var {c} = ({TYPE<UIElement>()}){VARS}[{child.Index}];
{p}.Children.Add({c});
".Var(out var cmd);
                    Eval(cmd);
                    break;
            }
            return this;
        }

        public static string ProgramTxt = Path.Combine(Assembly.GetExecutingAssembly()._GetAssemblyDirectoryPath(), "program.txt");
        public static string TYPE<T>() => typeof(T).GetFriendlyName();
        public void Eval(string cmd)
        {
            if (on)
            {
                commands.Add(cmd);
                Console.WriteLine(cmd);
                File.AppendAllText(ProgramTxt, cmd + Environment.NewLine);
            }

            Scripting.Eval(cmd);
        }

        static bool on = false;
        public Persist New<T>()
        {
            var index = Vars.Count;
            var cmd = $"{VARS}.Add(new {TYPE<T>()}());";
            Eval(cmd);
            return new Persist() {
                commands = commands,
                Index = index,
            };
        }

        public void LoadProgram()
        {
            if (!File.Exists(ProgramTxt)) return;
            File.ReadAllText(ProgramTxt).Var(out var txt);
            if (txt.IsNullOrEmpty()) return;
            Scripting.Eval(txt);
        }

        public static Persist New()
        {
            var ret = new Persist();
            return ret;
        }

        public static Persist Example(Window window)
        {
            
            var persist = Persist.New();
            
            var textBlock = persist.New<TextBlock>();
            textBlock.Set(nameof(TextBlock.Text), "hello!");
            var textBlock2 = persist.New<TextBlock>();
            textBlock2.Set(nameof(TextBlock.Text), "hello2!");
            persist.New<StackPanel>().Var(out var dockPanel).Add(textBlock);
            dockPanel.Add(textBlock2);
            dockPanel.Set(nameof(StackPanel.Orientation), Orientation.Horizontal);
            persist.LoadProgram();
            Persist.on = true;
            
            window.PreviewKeyDown += (sender, args) =>
            {
                var textBlock2 = persist.New<TextBlock>();
                textBlock2.Set(nameof(TextBlock.Text), args.Key.ToString());
                dockPanel.Add(textBlock2);
            };
            
            return dockPanel;
        }
    }

    public static class PersistExt
    {
        public static string NAME(this object o) => o.GetType().GetFriendlyName();
    }
}