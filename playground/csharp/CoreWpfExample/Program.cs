using System;
using System.Windows;
using System.Windows.Controls;
using System.Drawing.Imaging;
using System.Drawing;
using System;
using System.Linq;
using WpfScreenHelper;
using Size = System.Drawing.Size;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace CoreWpfExample
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            Capture();
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1200,
                Height = 1200,
            };
            win.Content = new Button() {Content = "hi!"};
            var app = new Application();
            app.Run(win);
        }

        public static void Capture()
        {
            Bitmap captureBitmap = new Bitmap(1024, 768, PixelFormat.Format32bppArgb);
            var captureRectangle = Screen.AllScreens.First().Bounds;
            
            Graphics captureGraphics = Graphics.FromImage(captureBitmap);
            Size s = new Size((int)captureRectangle.Size.Width, (int)captureRectangle.Size.Height);
            captureGraphics.CopyFromScreen((int)captureRectangle.Left,(int)captureRectangle.Top,0,0,s);
            captureBitmap.Save(@"d:\Capture.jpg",ImageFormat.Jpeg);
        }
    }
}
