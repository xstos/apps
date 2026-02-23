using System.Windows.Controls;
using System.Windows.Media;
namespace RENAME_ME
{


    public static class Hot
    {
        public static void Run()
        {
            var win = HotReload.MainWindow.Win;
            HotReload.MainWindow.Mono.ReferenceAssembly(typeof(DockPanel).Assembly);

            //
            win.Dispatcher.Invoke(() =>
            {
                win.Title = ""._Get();
                var dock = new DockPanel();
                win.Content = dock;
                dock.Background = new SolidColorBrush(Colors.Black);
                
;            });
        }
        public static string _Get(this object o)
        {
            return "derp"; //
        }
    }
}
