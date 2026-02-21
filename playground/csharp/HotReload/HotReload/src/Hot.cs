
namespace RENAME_ME
{
    public static class Hot
    {
        public static void Run()
        {
            HotReload.MainWindow.Win.Dispatcher.Invoke(() =>
            {
                HotReload.MainWindow.Win.Title = ""._Get();

            });
        }
        public static string _Get(this object o)
        {
            return "D";
        }
    }
}
