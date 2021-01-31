using System;
using System.Windows;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

// https://github.com/waf/replay-csharp/tree/e433ad0da9c637d44ebe79ef13b25a3a89b27c35
// https://carlos.mendible.com/2017/03/02/create-a-class-with-net-core-and-roslyn/
namespace KriterisEngine
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            ReactApp.Run();
        }
    }
}

