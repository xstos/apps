using System;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using PixelFarm.CpuBlit;
using PixelFarm.CpuBlit.PixelProcessing;
using PixelFarm.CpuBlit.Rasterization;
using PixelFarm.Drawing;
using Image = System.Windows.Controls.Image;

namespace RasterFromScratch
{
    static class Program2
    {
        public static unsafe void PixelFarmExample()
        {
            int width = 1920, height = 1080, dpi = 96;
            var surface = Sprite.New(width, height);
            surface.Fill(new BGRA() {Red = 255, Alpha = 255});

            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);

            var image = new Image();
            image.Source = bmp;
            RenderOptions.SetBitmapScalingMode(image, BitmapScalingMode.NearestNeighbor);

            MemBitmap membitmap = new MemBitmap(width, height);
            
            //TEST
            //this is low-level scanline rasterizer
            //1. create vertex store
            VertexStore vxs = new VertexStore();
            // vxs.AddMoveTo(0, 0);
            // vxs.AddLineTo(width, 0);
            // vxs.AddLineTo(width, height);
            // vxs.AddLineTo(0, height);
            // vxs.AddCloseFigure();
            for (int i = 0; i < 100; i += 4)
            {
                for (int j = 0; j < 1000; j += 4)
                {
                    vxs.AddMoveTo(i, j);
                    vxs.AddLineTo(i, j + 2);
                    vxs.AddLineTo(i + 2, j + 2);
                    vxs.AddLineTo(i + 2, j);
                    vxs.AddCloseFigure();
                }
            }

            //2. create scanline rasterizer
            ScanlineRasterizer sclineRas = new ScanlineRasterizer();
            sclineRas.AddPath(vxs);

            //3. create destination bitmap
            DestBitmapRasterizer destBmpRasterizer = new DestBitmapRasterizer();

            //4. create 32bit rgba bitmap blender

            MyBitmapBlender myBitmapBlender = new MyBitmapBlender();
            //6. attach target bitmap to bitmap blender
            myBitmapBlender.Attach(membitmap);

            //7. rasterizer sends the vector content inside sclineRas
            //   to the bitmap blender and  

            destBmpRasterizer.RenderWithColor(myBitmapBlender, //blender+ output 
                sclineRas, //with vectors input inside
                new ScanlinePacked8(),
                PixelFarm.Drawing.Color.Red);

            void SurfaceToScreen()
            {
                bmp.Lock();
                unsafe
                {
                    IntPtr mem_ptr = membitmap.GetRawBufferHead();
                    Buffer.MemoryCopy((byte*) mem_ptr, (byte*) bmp.BackBuffer, surface.NumBytesInt, surface.NumBytesInt);
                }

                bmp.AddDirtyRect(surface.Rect);
                bmp.Unlock();
            }

            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = width,
                Height = height,
            };
            win.Loaded += (sender, eventArgs) => { SurfaceToScreen(); };
            win.Content = image;
            var app = new Application();
            app.Run(win);
        }
    }
    class MyBitmapBlender : BitmapBlenderBase
    {

        //custom implementation of BitmapBlender

        public override void WriteBuffer(int[] newbuffer)
        {

        }
    }
}