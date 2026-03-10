using System;
using System.Drawing;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using CommunityToolkit.HighPerformance;
using Ideatum;
using Brushes = System.Windows.Media.Brushes;
using FontFamily = System.Windows.Media.FontFamily;
using Size = System.Windows.Size;

namespace RENAME_ME
{
    public static class Hot
    {
        static char TheWay = '道';

        public static void Run()
        {
            int letterWidth = 512;
            int letterHeight = 512;
            var NextColor = Program.MakeGetNextHue(1000);
            var ints = GetLetterPixels();
            int[] GetLetterPixels()
            {
                var canvas = new Canvas { Width = letterWidth, Height = letterHeight };
                canvas.Background = new SolidColorBrush(Colors.Green);
                canvas.Children.Add(new TextBlock
                {
                    Text = "道",
                    FontSize = 180,
                    Background = new SolidColorBrush(Colors.Red),
                    Foreground = Brushes.Cyan,
                    FontFamily = new FontFamily("Courier New")
                });

                // Measure and arrange
                canvas.Measure(new Size(letterWidth, letterHeight));
                canvas.Arrange(new Rect(0, 0, letterWidth, letterHeight));

                // Render to bitmap
                var bitmap = new RenderTargetBitmap(letterWidth, letterHeight, 96, 96, PixelFormats.Pbgra32);
                bitmap.Render(canvas);

                int stride = (bitmap.PixelWidth * bitmap.Format.BitsPerPixel + 7) / 8;
                byte[] pixelBytes = new byte[bitmap.PixelHeight * stride];
                bitmap.CopyPixels(pixelBytes, stride, 0);
                int[] ret = new int[pixelBytes.Length / 4];
                Buffer.BlockCopy(pixelBytes, 0, ret, 0, pixelBytes.Length);
                return ret;
            }

            // Define a square in 3D space
            float[,] verts =
            {
                { -1, -1, 2 }, // bottom-left
                { 1, -1, 2 }, // bottom-right
                { 1, 1, 2 }, // top-right
                { -1, 1, 2 } // top-left
            };

            // Texture coordinates
            (float, float)[] texCoords =
            {
                (0, 1), // bottom-left
                (1, 1), // bottom-right
                (1, 0), // top-right
                (0, 0) // top-left
            };
            var (bl, br, tr, tl) = (texCoords[0], texCoords[1], texCoords[2], texCoords[3]);
            // Project 3D to 2D
            PointF[] points = new PointF[4];
            float fov = 256; // Simple perspective factor
            float zoffs = -1f;
            float xoffs = 0.7f;
            float yoffs = 0.4f;
            void Render(int[] surface, int width, int height)
            {
                for (int i = 0; i < surface.Length; i++) //clear black
                {
                    //surface[i] = 0;
                }
                for (int i = 0; i < 4; i++)
                {
                    float x = verts[i, 0]+xoffs;
                    float y = verts[i, 1]-yoffs;
                    float z = verts[i, 2] + zoffs;

                    // Simple perspective projection
                    points[i] = new PointF(
                        400 + x * fov / z,
                        800 - y * fov / z
                    );
                }

                var canvasSprite = new Sprite(surface, width, height);
                var texSprite = new Sprite(ints, letterWidth, letterHeight);
                // Draw the textured square using triangles
                DrawTexturedTriangle(canvasSprite, texSprite, points[0], points[2], points[3], bl, tl, tr); //top left half
                DrawTexturedTriangle(canvasSprite, texSprite, points[0], points[1], points[2], bl, tr, br); //bottom left half
            
            }

            void Memory2DExample(int[] surface, int width, int height)
            {
                int c = NextColor(); //
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
                Render(surface, width, height);
            }

            Program.Render = DoRender;
        }

        static void DrawTexturedTriangle(Sprite canvas, Sprite tex, PointF p1, PointF p2, PointF p3,
            (float, float) uv1, (float, float) uv2, (float, float) uv3)
        {
            var width = canvas.Width;
            var height = canvas.Height;
            // Find bounding box
            int minX = (int)Math.Min(p1.X, Math.Min(p2.X, p3.X));
            int maxX = (int)Math.Max(p1.X, Math.Max(p2.X, p3.X));
            int minY = (int)Math.Min(p1.Y, Math.Min(p2.Y, p3.Y));
            int maxY = (int)Math.Max(p1.Y, Math.Max(p2.Y, p3.Y));
            if (minX < 0) minX = 0;
            if (maxX > width - 1) maxX = width - 1;
            if (minY < 0) minY = 0;
            if (maxY > height - 1) maxY = height - 1;
            var texWidth = tex.Width;
            var texHeight = tex.Height;
            var dp3p1X = p3.X - p1.X;
            var dp2p1X = p2.X - p1.X;
            var dp2p1Y = p2.Y - p1.Y;
            var dp3p1Y = p3.Y - p1.Y;
            // Simple software rasterization

            //var BD = ctl.RazorBMP.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.WriteOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            var canvasSurface = canvas.Surface;
            var canvasStride = width;

            //var BD2 = tex.LockBits(new Rectangle(0, 0, tex.Width, tex.Height), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            var texSurface = tex.Surface;
            var texStride = tex.Width;
            int offs;
            int offs2;
            for (int y = minY; y <= maxY; y++)
            for (int x = minX; x <= maxX; x++)
            {
                // Barycentric coordinates
                var dyp1Y = y - p1.Y;
                var dxp1X = x - p1.X;
                float w0 = (dp2p1X * dyp1Y - dp2p1Y * dxp1X) / (dp2p1X * dp3p1Y - dp2p1Y * dp3p1X);
                float w1 = (dp3p1X * dyp1Y - dp3p1Y * dxp1X) / (dp3p1X * dp2p1Y - dp3p1Y * dp2p1X);
                float w2 = 1 - w0 - w1;

                // Check if point is inside triangle

                if (w0 >= 0 && w1 >= 0 && w2 >= 0)
                {
                    // Interpolate texture coordinates
                    float u = uv1.Item1 * w2 + uv2.Item1 * w0 + uv3.Item1 * w1;
                    float v = uv1.Item2 * w2 + uv2.Item2 * w0 + uv3.Item2 * w1;
                    // Sample texture
                    int tx = (int)(u * (texWidth - 1));
                    int ty = (int)(v * (texHeight - 1));
                    offs2 = ty * texStride + tx;
                    //Color c = tex[tx, ty];
                    offs = y * canvasStride + x;
                    canvasSurface[offs] = texSurface[offs2];
                }
            }
        }
    }

    struct Sprite
    {
        public int[] Surface;
        public int Width;
        public int Height;
        public int Stride;
        public static int BitsPerPixel = Marshal.SizeOf<int>();

        public Sprite(int[] surface, int width, int height)
        {
            Surface = surface;
            Width = width;
            Height = height;
            Stride = (width * BitsPerPixel + 7) / 8;
        }
    }
}