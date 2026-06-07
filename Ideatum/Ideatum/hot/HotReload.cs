using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using CommunityToolkit.HighPerformance;
using Ideatum;

namespace RENAME_ME;

public static class Hot
{
    static char TheWay = '道';
    static char YY = '☯';
    static string CURSOR = "█";

    public static void Run()
    {
        var NextColor = Program.MakeGetNextHue(15);
        Console.WriteLine("Enter " + Ideatum.Program.HotNum);
        var win = new Window();
        var blit = new Button() { Content = "hi" };

        var pnl = new Grid();
        var debugCanvas = new Canvas();
        pnl.RowDefinitions.Add(new RowDefinition() { Height = new GridLength(1, GridUnitType.Star) });
        pnl.RowDefinitions.Add(new RowDefinition() { Height = new GridLength(1, GridUnitType.Star) });
        Grid.SetRow(blit, 0);
        Grid.SetRow(debugCanvas, 1);
        pnl.Children.Add(blit);
        pnl.Children.Add(debugCanvas);
        debugCanvas.Background = System.Windows.Media.Brushes.DarkBlue;
        //var pts = FontToVerts.Test("A").ToList();


        //pnl.Background = Brushes.White;
        win.Background = System.Windows.Media.Brushes.Black;
        win.Content = pnl;
        //win.Background = Brushes.Black;
        win.Loaded += (sender, args) =>
        {
            var w = SystemParameters.PrimaryScreenWidth;
            var h = SystemParameters.PrimaryScreenHeight;
            var w2 = w / 2;
            var h2 = h / 2;
            win.Left = w2;
            win.Top = 0;
            win.Width = w2;
            win.Height = h;
            win.Title = "hi2";
        };
        int r(double n) => (int)Math.Round(n, MidpointRounding.AwayFromZero);
        win.KeyDown += (sender, args) =>
        {
            Console.WriteLine(Enum.GetName(args.Key));
            debugCanvas.Children.Clear();
            var chr = args.Key.ToString()[0];
            //DrawOnCanvas(chr);
            //drawLetter(chr + "");
        };

        

        pnl.Loaded += (sender, args) =>
        {
            
        };

        win.Closed += (sender, args) => { Console.WriteLine("Exit " + Program.HotNum); };
        win.Show();

        void ShutDown()
        {
            win.Close();
            Program.ShutDown = () => { }; //
        }

        Program.ShutDown = ShutDown;

    }
}

public static class Ext2
{
    internal static int ToBgraInt(this System.Windows.Media.Color color)
    {
        return BitConverter.ToInt32([color.B, color.G, color.R, color.A]);
    }

    internal static IEnumerable<UIElement> Enu(this UIElementCollection c)
    {
        return c.Cast<UIElement>();
    }

    internal static void Save(this BitmapSource bmp, string path)
    {
        var encoder = new PngBitmapEncoder();
        var bitmapFrame = BitmapFrame.Create(bmp);
        encoder.Frames.Add(bitmapFrame);
        using var fileStream = new FileStream(path, FileMode.Create);
        encoder.Save(fileStream);
    }

    internal static BitmapSource Crop(this BitmapSource bmp, Int32Rect rect)
    {
        return new CroppedBitmap(bmp, rect);
    }


}