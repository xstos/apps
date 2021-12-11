using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using CSScriptLib;
using Mono.CSharp;
[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace ScriptingTests
{
    public class Program
    {
        public static object Value { get; set; }
        [STAThread]
        public static void Main(string[] args)
        {
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1200,
                Height = 1200,
            };
            CSScript.Evaluator.ReferenceAssembly(typeof(Program).Assembly);
            CSScript.Evaluator.LoadCode(@"
public class Derp {
static Derp() {
ScriptingTests.Program.Value=new Derp();
}
}
");
            
            var sp = new StackPanel();
            var login = new Button() {Content = "Login"};
            var logout = new Button() {Content = "Logout"};
            sp.Children.Add(login);
            sp.Children.Add(logout);
            win.Content = sp;
            var app = new Application();
            app.Run(win);
        }

    }
}
