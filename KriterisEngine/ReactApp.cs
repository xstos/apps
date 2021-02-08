using System;
using System.Windows;
using System.Windows.Threading;
using AdonisUI;
using KriterisEngine.ReactRedux;

namespace KriterisEngine
{
    public class ReactApp
    {
        public static void Run()
        {
            var window = new Window
            {
                WindowStartupLocation = WindowStartupLocation.CenterScreen,
                Width = 800,
                Height = 600,
            };

            var app = new Application().MakeDark(window);
            
            ExampleApp.New(app, window).Out(out var exampleApp);
            
            //wait til window loads and is ready to receive focus
            app.Dispatcher.InvokeAsync(() =>
            {
                ReactDOM.Render(exampleApp, window);
                exampleApp.GetStore().Replay();
                window.Activate();
                window.Focus();
            }, DispatcherPriority.ContextIdle);
            
            app.Run(window);
        }
    }

    public static class WpfGuiExtensions
    {
        public static Application MakeDark(this Application app, Window win)
        {
            app.Resources.MergedDictionaries.Add(new ResourceDictionary()
                {Source = new Uri("pack://application:,,,/AdonisUI;component/ColorSchemes/Dark.xaml")});
            app.Resources.MergedDictionaries.Add(new ResourceDictionary()
                {Source = new Uri("pack://application:,,,/AdonisUI.ClassicTheme;component/Resources.xaml")});
            win.Style = new Style(typeof(Window), (Style) app.FindResource(typeof(Window)));

            ResourceLocator.SetColorScheme(Application.Current.Resources, ResourceLocator.DarkColorScheme);
            return app;
        }
    }
}