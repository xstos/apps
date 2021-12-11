using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace EmptyWpf
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
            var sp = new StackPanel();
            
            win.Content = sp;
            var app = new Application();
            app.Run(win);
        }

    }
}
