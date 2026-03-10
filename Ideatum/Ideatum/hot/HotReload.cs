using System;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using CommunityToolkit.HighPerformance;
using Ideatum;

namespace RENAME_ME
{
    public static class Hot
    {
        static char TheWay = '道';
        public static void Run()
        {
            var NextColor = Program.MakeGetNextHue(1000);
            var ints = GetLetterPixels();
            int[] GetLetterPixels()
            {
                var canvas = new Canvas { Width = 100, Height = 100 };
                canvas.Children.Add(new TextBlock
                {
                    Text = "道",
                    FontSize = 48,
                    Foreground = Brushes.Cyan,
                    FontFamily = new FontFamily("Arial")
                });

                // Measure and arrange
                canvas.Measure(new Size(100, 100));
                canvas.Arrange(new Rect(0, 0, 100, 100));

                // Render to bitmap
                var bitmap = new RenderTargetBitmap(100, 100, 96, 96, PixelFormats.Pbgra32);
                bitmap.Render(canvas);
                
                int stride = (bitmap.PixelWidth * bitmap.Format.BitsPerPixel + 7) / 8;
                byte[] pixelBytes = new byte[bitmap.PixelHeight * stride];
                bitmap.CopyPixels(pixelBytes, stride, 0); 
                int[] ret = new int[pixelBytes.Length / 4];
                Buffer.BlockCopy(pixelBytes, 0, ret, 0, pixelBytes.Length);
                return ret;
            }
            void Render2(int[] surface, int width, int height)
            {
                int c = NextColor();//
                //int c = BitConverter.ToInt32([0, 0, 128, 0]);
                for (int i = 0; i < surface.Length; i++)
                {
                    //pixels[i] = c;
                }

                var mem = new Memory2D<int>(surface, height, width);
                var dest = mem.Slice(0, 0, 100, 100);
                var write = dest.Span;
                var inti = 0;
                for (int i = 0; i < 100; i++)
                {
                    for (int j = 0; j < 100; j++)
                    {
                        write[i, j] = ints[inti++];
                    }
                }
            }
            
            void DoRender()
            {
                var surface = Program.Surface;
                var width = Program.Width;
                var height = Program.Height;
                var len = width * height;
                var numPixels = surface.Length;
                if (len != numPixels) return; //race condition caught between Width/Height update;
                Render2(surface,width, height);
            }

            Program.Render = DoRender;
        }
    }
    
}