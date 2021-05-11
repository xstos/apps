using System;
using System.Windows;
using System.Windows.Controls;
using Microsoft.ClearScript.V8;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace ClearScriptDemo
{
    public class Program
    {
        public static Action<string> LogMethod;

        public static void Log(string s)
        {
            LogMethod(s);
        }
        [STAThread]
        public static void Main(string[] args)
        {
            
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 400,
                Height = 300,
            };
            var txt = new TextBox();
            win.Content = txt;
            var app = new Application();
            LogMethod = (s) => txt.AppendText(s);

            var engine = new V8ScriptEngine();
            engine.AddHostType("Prog", typeof(Program));

            engine.Execute(
            @"
            var x = { foo: 'hi'}; 
            var { foo } = x;
            Prog.Log(foo); 
            ");

            app.Run(win);
        }

    }
}
