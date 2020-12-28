using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Color = System.Drawing.Color;
using Image = System.Windows.Controls.Image;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace RasterFromScratch
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            //Program2.PixelFarmExample();

            RawPixelsExample();
        }

        static void RawPixelsExample()
        {
            int width = 10, height = 10, dpi = 96;
            var surface = Sprite.New(width, height);
            //surface.Fill(new BGRA() {Red = 255, Alpha = 255});

            surface.Fill((x, y, color) =>
            {
                if (x % 2 == 0)
                {
                    return y % 2 != 0 ? Color.LightGray : Color.White;
                }
                return y % 2 == 0 ? Color.LightGray : Color.White;
            });

            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);

            var image = new Image();
            image.Source = bmp;
            RenderOptions.SetBitmapScalingMode(image, BitmapScalingMode.NearestNeighbor);

            void SurfaceToScreen()
            {
                bmp.Lock();
                unsafe
                {
                    Buffer.MemoryCopy((void*) surface.Ptr, (void*) bmp.BackBuffer, surface.NumBytesInt, surface.NumBytesInt);
                }
                bmp.AddDirtyRect(surface.Rect);
                bmp.Unlock();
            }

            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1200,
                Height = 1200,
            };
            win.Loaded += (sender, eventArgs) => { SurfaceToScreen(); };
            win.Content = image;
            var app = new Application();
            app.Run(win);
        }
    }
    
}
