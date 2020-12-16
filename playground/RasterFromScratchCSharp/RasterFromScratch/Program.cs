using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace RasterFromScratch
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            int width = 1920, height = 1080, dpi = 96;
            var surface = Sprite.New(width, height);
            surface.Fill(new BGRA() { Red = 255 , Alpha = 255});

            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);
            
            var image = new Image();
            image.Source = bmp;
            RenderOptions.SetBitmapScalingMode(image, BitmapScalingMode.NearestNeighbor);
            
            void SurfaceToScreen()
            {
                unsafe
                {
                    bmp.Lock();
                    Buffer.MemoryCopy((void*) surface.Ptr, (void*) bmp.BackBuffer, surface.NumBytesInt,surface.NumBytesInt);
                    bmp.AddDirtyRect(surface.Rect);
                    bmp.Unlock();
                }
            }
            
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = width,
                Height = height,
            };
            win.Loaded += (sender, eventArgs) =>
            {
                SurfaceToScreen();
            };
            win.Content = image;
            var app = new Application();
            app.Run(win);
        }
    }
}
