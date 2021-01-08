using System;
using System.Drawing;
using System.Drawing.Imaging;
using Image = System.Windows.Controls.Image;

[assembly: System.Windows.ThemeInfo(System.Windows.ResourceDictionaryLocation.None, System.Windows.ResourceDictionaryLocation.SourceAssembly)]

namespace KriterisEngine
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            int width = 50, height = 50, dpi = 96;
            var bmp = new System.Windows.Media.Imaging.WriteableBitmap(width, height, dpi, dpi, System.Windows.Media.PixelFormats.Bgra32, null);
            var surface = Sprite.New(width, height);
            surface.Fill(Color.Beige);
            var image = new Image();
            image.Source = bmp;
            System.Windows.Media.RenderOptions.SetBitmapScalingMode(image, System.Windows.Media.BitmapScalingMode.NearestNeighbor);
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
            var win = new System.Windows.Window
            {
                WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen,
                Width = 1200,
                Height = 1200,
            };
            
            var b = new Bitmap(1, 1);
            var g = Graphics.FromImage(b);
            var font = new Font(new FontFamily("Consolas"), 12);
            var fontSize = g.MeasureString("H", font);

            Sprite RenderText()
            {

                var b = new Bitmap((int)fontSize.Width, (int)fontSize.Height);
                
                var brush = new SolidBrush(Color.Black);
                var g = Graphics.FromImage(b);
                var transparent = new SolidBrush(Color.FromArgb(0, 255, 255, 255));
                g.FillRectangle(transparent, new Rectangle(0,0,(int)fontSize.Width, (int)fontSize.Height));
                g.DrawString("H",font,brush,0,0);
                var data = b.LockBits(new Rectangle(new Point(0,0), fontSize.ToSize()),ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                var sprite = Sprite.New((int) fontSize.Width, (int) fontSize.Height);
                unsafe
                {
                    Buffer.MemoryCopy((void*)data.Scan0, (void*)sprite.Ptr, sprite.NumBytesInt, sprite.NumBytesInt);
                }

                return sprite;
            }

            surface.Draw(RenderText(), 4,4);

            win.Loaded += (sender, eventArgs) => { SurfaceToScreen(); };
            win.Content = image;
            var app = new System.Windows.Application();
            app.Run(win);
        }

    }
}

