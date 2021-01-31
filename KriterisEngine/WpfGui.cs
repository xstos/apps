using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;
using AdonisUI;
using KriterisEngine.ReactRedux;
using static KriterisEngine.Common;
using static KriterisEngine.Global;
using Brushes = System.Windows.Media.Brushes;

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
            MakeDark(app, win);
            
            
            void BuildWindow()
            {
                // win.Activate();
                // win.Focus();
                win.KeyDown += (o, eventArgs) =>
                {
                    switch (eventArgs.Key)
                    {
                        case Key.Oem3: // `

                            break;
                    }
                };
                Cell().AddChild(
                    Cell(),
                    Cell()
                ).Out(out var cell);
                
                // AutoComplete.ExampleUsage(context =>
                // {
                //     context.SearchBox.KeyUp += (sender, args) =>
                //     {
                //         var selectedItem = context.GetSelectedItem();
                //         if (selectedItem == null) return;
                //         var data = selectedItem.Data;
                //         if (args.Key == Key.Enter)
                //         {
                //             wrap.Children.Add(new TextBlock() {Text = data.ToString()});
                //         }
                //     };
                //     context.SearchBox.SetFocus();
                // })
                win.Content = cell.GetContent();
            }

            app.Dispatcher.InvokeAsync(() =>
            {
                ReactDOM.Render(Example.MakeApp(), win);
                win.Activate();
                win.Focus();
            }, DispatcherPriority.ContextIdle);
            app.Run(win);
        }
        
        static void MakeDark(Application app, Window win)
        {
            app.Resources.MergedDictionaries.Add(new ResourceDictionary()
                {Source = new Uri("pack://application:,,,/AdonisUI;component/ColorSchemes/Dark.xaml")});
            app.Resources.MergedDictionaries.Add(new ResourceDictionary()
                {Source = new Uri("pack://application:,,,/AdonisUI.ClassicTheme;component/Resources.xaml")});
            win.Style = new Style(typeof(Window), (Style) app.FindResource(typeof(Window)));

            ResourceLocator.SetColorScheme(Application.Current.Resources, ResourceLocator.DarkColorScheme);
        }
        static void OnNextIsVisibleChanged(UIElement win, Action action)
        {
            void Callback(object sender, DependencyPropertyChangedEventArgs args)
            {
                win.IsVisibleChanged -= Callback;
                if (args.NewValue.Equals(false)) return;
                action();
            }

            win.IsVisibleChanged += Callback;
        }
    }
}