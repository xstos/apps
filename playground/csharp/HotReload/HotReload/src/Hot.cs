using System;
using System.IO;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace RENAME_ME
{
    public static class Hot
    {
        public static void Run()
        {
            var win = HotReload.MainWindow.Win;


            //
            win.Dispatcher.Invoke(() =>
            {
                win.Title = "hello world";
                var dock = new DockPanel();
                win.Content = dock;

                dock.Children.Add(new Button() { Content = "hi" }.SetDock(Dock.Top));
                var box = new TextBox();
                dock.Children.Add(box);
                Action<string> Write = (t) =>
                {
                    box.Text += t;
                };
;            });
        }
        
        public static T SetDock<T>(this T c, Dock d) where T: UIElement
        {
            DockPanel.SetDock(c,d);
            return c;
        }

        public static string Up(this string path)
        {
            return null;
        }
    }
}
