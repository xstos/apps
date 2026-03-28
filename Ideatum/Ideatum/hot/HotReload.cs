using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
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
    using static NodeType;

    public enum NodeType
    {
        CursorNode
    }

    public class Node
    {
        public Node(NodeType t)
        {
        }
    }

    
    public static class Hot
    {
        static char TheWay = '道';
        static char YY = '☯';
        static char CURSOR = '█';
        
        public static void Run()
        {
            Console.WriteLine("Hot Run "+Program.HotNum);
            
            Node cursor = new Node(CursorNode);

            string txt = "a";

            var NextColor = Program.MakeGetNextHue(1000);
            var getLetter = GetTilePixels();

            Func<string, Sprite> GetTilePixels()
            {
                var update = Ext.SpriteGenerator();

                var cache = new Dictionary<string, Sprite>();

                Sprite Get(string text)
                {
                    if (cache.TryGetValue(text, out var value))
                    {
                        return value;
                    }

                    var sprite = update(text);
                    cache.Add(text, sprite);
                    return sprite;
                }

                return Get;
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
            float zoffs = 10f;
            float xoffs = -11f;
            float yoffs = 11f;
            Action<int[], int, int> renderAction = Clear;

            void Clear(int[] surface, int width, int height)
            {
                for (int i = 0; i < surface.Length; i++) //clear black
                {
                    surface[i] = 0;
                }
            }

            void Render(int[] surface, int width, int height)
            {
                for (int i = 0; i < 4; i++)
                {
                    float x = verts[i, 0] + xoffs;
                    float y = verts[i, 1] + yoffs;
                    float z = verts[i, 2] + zoffs;

                    var projx = x / z; //3d to 2d projection
                    var projy = y / z;
                    //normalize to screen coords -1 .. 1 => 0 .. 2 => 0 .. width
                    var screenx = (projx + 1) * 0.5f * width;
                    //normalize and mirror y 
                    var screeny = (1 - (projy + 1) * 0.5f) * height;
                    points[i] = new PointF(screenx, screeny);
                }

                var canvasSprite = new Sprite(surface, width, height);
                var texSprite = getLetter(txt);
                // Draw the textured square using triangles
                DrawTexturedTriangle(canvasSprite, texSprite, points[0], points[2], points[3], bl, tl,
                    tr); //top left half
                DrawTexturedTriangle(canvasSprite, texSprite, points[0], points[1], points[2], bl, tr,
                    br); //bottom left half
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
                var l = getLetter("a");
                for (int i = 0; i < 100; i++)
                {
                    for (int j = 0; j < 100; j++)
                    {
                        write[i, j] = l.Surface[inti++];
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
                renderAction(surface, width, height);
            }

            Program.PreviewKeyDown = (sender, args) =>
            {
                Console.WriteLine(args.Key + " " + sender.GetType());
                txt = args.Key.ToString();

                DoRender();
            };
            Program.Resize();
            Clear(Program.Surface,Program.Width,Program.Height);
            Program.Blit();
            //Program.Render = DoRender;
        }

        // Simple software rasterization
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

            var canvasSurface = canvas.Surface;
            var canvasStride = width;

            var texSurface = tex.Surface;
            var texStride = tex.Width;
            var w0denom = 1.0f / (dp2p1X * dp3p1Y - dp2p1Y * dp3p1X);
            var w1denom = 1.0f / (dp3p1X * dp2p1Y - dp3p1Y * dp2p1X);
            var (uv1X, uv1Y) = uv1;
            var (uv2X, uv2Y) = uv2;
            var (uv3X, uv3Y) = uv3;
            var texWidthSub1 = texWidth - 1;
            var texHeightSub1 = texHeight - 1;
            for (int y = minY; y <= maxY; y++)
            for (int x = minX; x <= maxX; x++)
            {
                // Barycentric coordinates
                var dyp1Y = y - p1.Y;
                var dxp1X = x - p1.X;
                var w0 = (dp2p1X * dyp1Y - dp2p1Y * dxp1X) * w0denom;
                var w1 = (dp3p1X * dyp1Y - dp3p1Y * dxp1X) * w1denom;
                var w2 = 1 - w0 - w1;
                // Check if point is inside triangle
                if (!(w0 >= 0) || !(w1 >= 0) || !(w2 >= 0)) continue;
                // Interpolate texture coordinates
                var u = uv1X * w2 + uv2X * w0 + uv3X * w1;
                var v = uv1Y * w2 + uv2Y * w0 + uv3Y * w1;
                // Sample texture
                var tx = (int)(u * texWidthSub1);
                var ty = (int)(v * texHeightSub1);
                var offs2 = ty * texStride + tx;
                var offs = y * canvasStride + x;
                canvasSurface[offs] = texSurface[offs2];
            }
        }
    }

    internal struct Sprite
    {
        public int Width;
        public int Height;
        public int[] Surface;

        internal Sprite(int[] surface, int width, int height)
        {
            Surface = surface;
            Width = width;
            Height = height;
        }
    }

    public static class Ext
    {
        internal static void Save(this BitmapSource bmp, string path)
        {
            var encoder = new PngBitmapEncoder();
            var bitmapFrame = BitmapFrame.Create(bmp);
            encoder.Frames.Add(bitmapFrame);
            using var fileStream = new FileStream(path, FileMode.Create);
            encoder.Save(fileStream);
        }

        internal static Sprite ToSprite(this BitmapSource bmp)
        {
            //bmp.Save(@"C:\Users\user\Documents\foo.png");

            var bmpWidth = bmp.PixelWidth;
            int stride = (bmpWidth * bmp.Format.BitsPerPixel + 7) / 8;

            var bmpHeight = bmp.PixelHeight;
            byte[] pixelBytes = new byte[bmpHeight * stride];
            bmp.CopyPixels(pixelBytes, stride, 0);
            int[] ret = new int[pixelBytes.Length / 4];
            Buffer.BlockCopy(pixelBytes, 0, ret, 0, pixelBytes.Length);

            var sprite1 = new Sprite(ret, bmpWidth, bmpHeight);
            return sprite1;
        }

        internal static BitmapSource Crop(this BitmapSource bmp, Int32Rect rect)
        {
            return new CroppedBitmap(bmp, rect);
        }

        internal static Func<string, Sprite> SpriteGenerator()
        {
            int letterWidth = 512;
            int letterHeight = 512;
            var parent = new Canvas
            {
                Width = letterWidth, Height = letterHeight,
                Background = new SolidColorBrush(Colors.Gray)
            };

            var letter = new Label()
            {
                Content = "█",
                FontSize = 200,
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White,
                FontFamily = new FontFamily("Consolas"),
                //HorizontalAlignment = HorizontalAlignment.Center,
                //VerticalAlignment = VerticalAlignment.Center,
                //TextAlignment = TextAlignment.Left
            };

            var border = new Border()
            {
                Child = letter,
                BorderBrush = new SolidColorBrush(Colors.Cyan),
                BorderThickness = new Thickness(0, 0, 0, 0)
            };
            parent.Children.Add(border);
            var dpiScale = VisualTreeHelper.GetDpi(Application.Current.MainWindow);
            var bmp = new RenderTargetBitmap(letterWidth, letterHeight, dpiScale.PixelsPerInchX,
                dpiScale.PixelsPerInchY, PixelFormats.Pbgra32);
            RenderOptions.SetBitmapScalingMode(bmp, BitmapScalingMode.NearestNeighbor);

            Sprite Update(string text)
            {
                letter.Content = text;
                parent.Measure(new Size(letterWidth, letterHeight));
                parent.Arrange(new Rect(0, 0, letterWidth, letterHeight));
                bmp.Render(parent);
                var wi = (int)Math.Round(border.ActualWidth, MidpointRounding.AwayFromZero);
                var hi = (int)Math.Round(border.ActualHeight, MidpointRounding.AwayFromZero);
                var sprite = bmp.Crop(new Int32Rect(0, 0, wi, hi)).ToSprite();
                return sprite;
            }

            return Update;
        }
    }
}