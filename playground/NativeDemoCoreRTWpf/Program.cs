using System;
using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace NativeDemoCoreRTWpf
{
    class Program
    {
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
            win.Content = new Button() {Content = "hi!"};
            var app = new Application();
            app.Run(win);
        }

    }
}
