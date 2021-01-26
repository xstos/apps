using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace KriterisEngine
{
    public class WpfGui
    {
        public static void Run()
        {
            var win = new Window
            {
                WindowStartupLocation = WindowStartupLocation.CenterScreen,
                Width = 1920,
                Height = 1080,
            };
            
            var app = new Application();
            
            new WrapPanel().Out(out var wrap);
            wrap.Add(
                new TextBox().Out(out var tb1),
                new TextBox().Out(out var tb2),
                AutoComplete.ExampleUsage(context =>
                {
                    context.SearchBox.Focus();
                    context.SearchBox.KeyUp += (sender, args) =>
                    {
                        var data = context.GetSelectedItem().Data;
                        if (args.Key == Key.Enter)
                        {
                            wrap.Children.Add(new TextBlock() {Text = data.ToString()});
                        }
                    };
                })
            );
            
            win.Loaded += (sender, args) =>
            {
                win.KeyDown += (o, eventArgs) =>
                {
                    switch (eventArgs.Key)
                    {
                        case Key.Oem3: // `
                            
                            break;
                    }
                };
            };
            
            win.Content = wrap;
            app.Run(win);
        }
    }
}