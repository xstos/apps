using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Color = System.Drawing.Color;
using FontFamily = System.Drawing.FontFamily;
using Image = System.Windows.Controls.Image;
using PixelFormat = System.Drawing.Imaging.PixelFormat;
using Point = System.Drawing.Point;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace KriterisEngine
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            
            
            int width = 50, height = 50, dpi = 96;
            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);
            var surface = Sprite.New(width, height);
            surface.Fill(Color.Transparent);
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
                Width = 1200,
                Height = 1200,
            };
            
            var b = new Bitmap(1, 1);
            var g = Graphics.FromImage(b);
            var font = new Font(new FontFamily("Consolas"), 24);
            var fontSize = g.MeasureString("a", font);

            var dp = new DockPanel();
            var wrapLeft = new WrapPanel();
            var wrap2 = new WrapPanel();
            DockPanel.SetDock(wrapLeft,Dock.Left);



            wrapLeft.Background = new SolidColorBrush(Colors.Chartreuse);
            wrap2.Background = new SolidColorBrush(Colors.Bisque);

            wrapLeft.Children.Add(image);
            
            dp.Children.Add(wrapLeft.BorderAround(Colors.Yellow));
            dp.Children.Add(wrap2.BorderAround(Colors.Green));
            
            
            
            Sprite RenderText()
            {

                var txtBmp = new Bitmap((int)fontSize.Width, (int)fontSize.Height);
                txtBmp.SetResolution(dpi,dpi);
                var brush = new SolidBrush(Color.Black);
                var g2 = Graphics.FromImage(txtBmp);
                g2.InterpolationMode = InterpolationMode.NearestNeighbor;
                g2.SmoothingMode = SmoothingMode.None;
                //g.Clear(Color.Transparent);
                g2.DrawString("a",font,brush,0,0);
                g2.CompositingQuality = CompositingQuality.HighQuality;
                wrap2.Children.Add(txtBmp.ToImage().BorderAround(Colors.Black));
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
            
            dp.LayoutTransform = new ScaleTransform(5.0, 5.0);
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

