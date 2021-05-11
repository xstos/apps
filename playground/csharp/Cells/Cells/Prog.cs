using System;
using System.Collections.Generic;
using System.Text;
using System.Windows;
using System.Windows.Controls;

namespace Cells
{
    public static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            var app = BuildApp();
            app.Run(app.MainWindow);
        }

        static Application BuildApp()
        {
            var app = new Application();
            var window = new Window();
            app.MainWindow = window;

            Application.Current.Resources.MergedDictionaries.Add(new DarkTheme());
            window.SetResourceReference(Control.StyleProperty, "FlatWindowStyle");
            void Activated(object? sender, EventArgs args)
            {
                app.Activated -= Activated;
                BuildWindow(window);
            }

            app.Activated += Activated;
            return app;
        }
    }
}
