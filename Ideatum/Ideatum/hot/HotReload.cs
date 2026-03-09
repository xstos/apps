using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Ideatum;

namespace RENAME_ME
{
    public static class Hot
    {
        static char TheWay = '道';

        public static void Run()
        {
            var NextColor = Program.MakeGetNextHue(1000);

            void Render(int[,] pixels, int width, int height)
            {
                int c = NextColor();
                //int c = BitConverter.ToInt32([0, 0, 128, 0]);
                int j;//
                for (int i = 0; i < width; i++)
                {
                    for (j = 0; j < height; j++)
                    {
                        pixels[i,j] = c;
                    }
                }
            }

            Program.Render = Render;

            void test()
            {
                var canvas = new Canvas { Width = 100, Height = 100 };
                canvas.Children.Add(new TextBlock
                {
                    Text = "A",
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
                /*
                 int width = source.PixelWidth;
int height = source.PixelHeight;
int stride = width * ((source.Format.BitsPerPixel + 7) / 8);

byte[] bits = new byte[height * stride];

source.CopyPixels(bits, stride, 0);
                 */
                int stride = (bitmap.PixelWidth * bitmap.Format.BitsPerPixel + 7) / 8;
                byte[] pixelBytes = new byte[bitmap.PixelHeight * stride];
                int[] pixels = new int[pixelBytes.Length / 4];
                
                bitmap.CopyPixels(pixels, stride, 0);

                // Convert to int array (BGRA format)
                Buffer.BlockCopy(pixelBytes, 0, pixels, 0, pixelBytes.Length);
            }
        }
    }
}