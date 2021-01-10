using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Bitmap = System.Drawing.Bitmap;
using Color = System.Drawing.Color;
using Font = System.Drawing.Font;
using FontFamily = System.Drawing.FontFamily;
using Graphics = System.Drawing.Graphics;
using Image = System.Windows.Controls.Image;
using PixelFormat = System.Drawing.Imaging.PixelFormat;
using Point = System.Drawing.Point;
using SolidBrush = System.Drawing.SolidBrush;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace KriterisEngine
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            int width = 300, height = 100, dpi = 96;
            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);
            var surface = Sprite.New(width, height);
            surface.Fill(Color.Transparent);
            
            surface.Fill((x, y, color) =>
            {
                if (x % 2 == 0)
                {
                    return y % 2 != 0 ? Color.LightGray : Color.Transparent;
                }
                return y % 2 == 0 ? Color.LightGray : Color.Transparent;
            });
            
            var image = new Image();
            image.Source = bmp;
            image.Width = width;
            image.Height = height;
            RenderOptions.SetBitmapScalingMode(image, BitmapScalingMode.NearestNeighbor);
            void SurfaceToScreen()
            {
                bmp.Lock();
                unsafe
                {
                    Buffer.MemoryCopy((void*)surface.Ptr, (void*)bmp.BackBuffer, surface.NumBytesInt, surface.NumBytesInt);
                }
                bmp.AddDirtyRect(surface.Rect);
                bmp.Unlock();
            }
            var win = new Window
            {
                WindowStartupLocation = WindowStartupLocation.CenterScreen,
                Width = 1920,
                Height = 1080,
            };
            
            var b = new Bitmap(1, 1);
            var g = Graphics.FromImage(b);

            var fontFamily = new FontFamily("Consolas");
            
            var font = new Font(fontFamily, 24);
            var text = "aWH█\nfoo";
            var fontSize = g.MeasureString(text, font);

            var dp = new DockPanel();
            dp.LayoutTransform = new ScaleTransform(5.0, 5.0);
            var wrapLeft = new WrapPanel();
            var debugPanel = new WrapPanel().Dock(Dock.Bottom);

            wrapLeft.Background = new SolidColorBrush(Colors.Chartreuse);
            debugPanel.Background = new SolidColorBrush(Colors.Bisque);

            wrapLeft.Children.Add(image);
            
            
            dp.Children.Add(debugPanel);
            dp.Children.Add(wrapLeft);
            
            Sprite RenderText()
            {
                //https://docs.microsoft.com/en-us/dotnet/desktop/winforms/advanced/how-to-obtain-font-metrics?view=netframeworkdesktop-4.8
                var txtBmp = new Bitmap((int)fontSize.Width, (int)fontSize.Height);
                txtBmp.SetResolution(dpi,dpi);
                var brush = new SolidBrush(Color.Black);
                var g2 = Graphics.FromImage(txtBmp);
                g2.InterpolationMode = InterpolationMode.NearestNeighbor;
                g2.SmoothingMode = SmoothingMode.None;
                //g.Clear(Color.Transparent);
                g2.DrawString(text,font,brush,0,0);
                var p = new System.Drawing.Pen(Color.Black);
                g2.FillRectangle(brush,0,0,1,1);
                g2.FillRectangle(brush,0,txtBmp.Height-2,1,1);
                g2.FillRectangle(brush,txtBmp.Width-2,txtBmp.Height-2,1,1);
                g2.FillRectangle(brush,txtBmp.Width-2,0,1,1);
                //g2.CompositingQuality = CompositingQuality.HighQuality;
                debugPanel.Children.Add(txtBmp.ToImage());
                var data = txtBmp.LockBits(new Rectangle(new Point(0,0), fontSize.ToSize()),ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                var sprite = Sprite.New((int) fontSize.Width, (int) fontSize.Height);
                unsafe
                {
                    Buffer.MemoryCopy((void*)data.Scan0, (void*)sprite.Ptr, sprite.NumBytesInt, sprite.NumBytesInt);
                }

                return sprite;
            }

            surface.Draw(RenderText(), 0,0);

            win.Loaded += (sender, eventArgs) =>
            {
                SurfaceToScreen();
            };
            
            win.Content = dp;
            var app = new Application();
            app.Run(win);
        }

    }

    public static class Extensions
    {
        public static Image ToImage(this Bitmap bmp)
        {
            var img = new Image();
            img.Width = bmp.Width;
            img.Height = bmp.Height;
            RenderOptions.SetBitmapScalingMode(img, BitmapScalingMode.NearestNeighbor);
            img.Source =
             Imaging.CreateBitmapSourceFromHBitmap(
                bmp.GetHbitmap(), 
                IntPtr.Zero, 
                Int32Rect.Empty, 
                BitmapSizeOptions.FromWidthAndHeight(bmp.Width, bmp.Height));
            return img;
        }

        public static T Dock<T>(this T item, Dock dock) where T : UIElement
        {
            DockPanel.SetDock(item,dock);
            return item;
        }
        public static Border BorderAround<T>(this T item, System.Windows.Media.Color c) where T: UIElement
        {
            var b = new Border();
            b.BorderBrush = new SolidColorBrush(c);
            b.BorderThickness = new Thickness(1);
            b.Child = item;
            return b;
        }
    }
}

