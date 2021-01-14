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
            // https://www.reddit.com/r/GraphicsProgramming/comments/hhbw93/how_to_write_own_software_rasterizer/
            // https://magcius.github.io/xplain/article/rast1.html
            // https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/
            // https://stackoverflow.com/questions/43267557/c-sharp-fonts-as-2d-points
            // https://gamedev.stackexchange.com/questions/81267/how-do-i-generalise-bresenhams-line-algorithm-to-floating-point-endpoints/81332#81332
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
