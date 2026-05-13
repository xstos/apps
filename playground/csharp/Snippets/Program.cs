using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace Snippets;

public class Program
{
    [STAThread]
    public static void Main()
    {
        var app = new Application();
       
        var window = new Window();
        var grid = new Grid();
        //var canvas = new Canvas();
        //grid.Children.Add(canvas);
        window.Content = grid;

        window.Loaded += (sender, args) =>
        {
            //tinygl.Program.Run();
            var img = new Image();
            img.Source = scanline.ScanlinePolygonFiller.Example();
            //img.Source = tinygl.PolygonRasterizer.Example();
            grid.Children.Add(img);
        };
        System.Windows.Application.Current.Run(window);
    }
}