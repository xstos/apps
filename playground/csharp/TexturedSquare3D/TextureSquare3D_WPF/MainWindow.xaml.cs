using System.Drawing.Imaging;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using Color = System.Drawing.Color;
using PixelFormat = System.Windows.Media.PixelFormat;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
namespace TextureSquare3D_WPF;

public static class Ext
{
    public static int[,] WritableBitmapTo2DArray(this WriteableBitmap bitmap)
    {
        int height = bitmap.PixelHeight;
        int width = bitmap.PixelWidth;
        int[,] pixelArray = new int[height, width];

        // Lock the bitmap
        bitmap.Lock();

        try
        {
            unsafe
            {
                // Get pointer to the back buffer
                IntPtr pBackBuffer = bitmap.BackBuffer;
                int stride = bitmap.BackBufferStride;

                // Iterate through rows
                for (int y = 0; y < height; y++)
                {
                    // Pointer to the start of the current row
                    byte* pRow = (byte*)pBackBuffer + (y * stride);

                    // Copy row data to 2D array (assuming 32-bit BGRA)
                    for (int x = 0; x < width; x++)
                    {
                        // Copy 4 bytes (BGRA) into a single 32-bit integer
                        pixelArray[y, x] = *((int*)pRow + x);
                    }
                }
            }
        }
        finally
        {
            // Unlock the bitmap
            bitmap.Unlock();
        }

        return pixelArray;
    }
}

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    private bool drawred;

    private System.Timers.Timer fpstimer;
    private DispatcherTimer rendertimer;
    private Thread renderthread;
    private int fps;


    public MainWindow()
    {
        InitializeComponent();
        Loaded += Window_Loaded_1;
        Closing += Window_Closing_1;
    }

    private delegate void fpsdelegate();

    private void showfps()
    {
        this.Title = "FPS: " + fps;
        fps = 0;
    }

    private void Window_Loaded_1(object sender, RoutedEventArgs e)
    {
        bool dirty = true;
        fpstimer = new System.Timers.Timer(1000);
        fpstimer.Elapsed += (sender1, args) =>
        {
            Dispatcher.BeginInvoke(DispatcherPriority.Render, new fpsdelegate(showfps));
        };
        fpstimer.Start();

        //// !! uncomment for regular FPS renderloop !!
        //rendertimer = new DispatcherTimer();
        //rendertimer.Interval = TimeSpan.FromMilliseconds(15); /* ~60Hz LCD on my PC */
        //rendertimer.Tick += (o, args) => Render();
        //rendertimer.Start();
        
        var g = ctl.RazorGFX;

        var filename = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "tex.png");
        var tex = new Bitmap(filename); // new WriteableBitmap(new BitmapImage(new Uri( filename)));
        //int[,] texArr = tex.WritableBitmapTo2DArray();
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
        float zoffs = 0;
        // Show the result
        var (px, py) = (0, 0);

        void repaint()
        {
            g.Clear(Color.Black);

            for (int i = 0; i < 4; i++)
            {
                float x = verts[i, 0];
                float y = verts[i, 1];
                float z = verts[i, 2] + zoffs;

                // Simple perspective projection
                points[i] = new PointF(
                    400 + x * fov / z,
                    300 - y * fov / z
                );
            }

            // Draw the textured square using triangles
            DrawTexturedTriangle(g, tex, points[0], points[2], points[3], bl, tl, tr); //top left half
            DrawTexturedTriangle(g, tex, points[0], points[1], points[2], bl, tr, br); //bottom left half
            dirty = false;
        }

        PreviewKeyDown += (o, args) =>
        {
            if (args.Key == Key.W)
                zoffs += 0.05f;
            else
                zoffs += -0.05f;
            dirty = true;
        };
        PreviewMouseDown += (sender, a) =>
        {
            var args = a.GetPosition(ctl);
            var (x, y) = (args.X, args.Y);
            var (dx, dy) = (x - px, y - py);
            if (a.LeftButton==MouseButtonState.Pressed)
            {
                zoffs += 0.05f;
            }
            Console.WriteLine(zoffs);
            px = (int)args.X;
            py = (int)args.Y;
            dirty = true;
        };
        
        void Render()
        {
            // do lock to avoid resize/repaint race in control
            // where are BMP and GFX recreates
            // better practice is Monitor.TryEnter() pattern, but here we do it simpler
            lock (ctl.RazorLock)
            {
                if (dirty) repaint();
                //ctl.RazorGFX.DrawString("habrahabr.ru", System.Drawing.SystemFonts.DefaultFont, System.Drawing.Brushes.Azure, 10, 10);
                ctl.RazorPaint();
            }

            fps++;
        }
        CompositionTarget.Rendering+= (o, args) =>
        {
            Render();
        };
    }


    private void Window_Closing_1(object sender, System.ComponentModel.CancelEventArgs e)
    {
        //rendertimer.Stop();
        fpstimer.Stop();
    }

    void DrawTexturedTriangle(Graphics g, Bitmap tex, PointF p1, PointF p2, PointF p3,
        (float, float) uv1, (float, float) uv2, (float, float) uv3)
    {
        unsafe
        {
            // Find bounding box
            int minX = (int)Math.Min(p1.X, Math.Min(p2.X, p3.X));
            int maxX = (int)Math.Max(p1.X, Math.Max(p2.X, p3.X));
            int minY = (int)Math.Min(p1.Y, Math.Min(p2.Y, p3.Y));
            int maxY = (int)Math.Max(p1.Y, Math.Max(p2.Y, p3.Y));
            var texWidth = tex.Width;
            var texHeight = tex.Height;
            var dp3p1X = p3.X - p1.X;
            var dp2p1X = p2.X - p1.X;
            var dp2p1Y = p2.Y - p1.Y;
            var dp3p1Y = p3.Y - p1.Y;
            // Simple software rasterization

            for (int y = minY; y <= maxY; y++)
            {
                for (int x = minX; x <= maxX; x++)
                {
                    // Barycentric coordinates

                    var dyp1Y = y - p1.Y;
                    var dxp1X = x - p1.X;
                    float w0 = (dp2p1X * dyp1Y - dp2p1Y * dxp1X) /
                               (dp2p1X * dp3p1Y - dp2p1Y * dp3p1X);
                    float w1 = (dp3p1X * dyp1Y - dp3p1Y * dxp1X) /
                               (dp3p1X * dp2p1Y - dp3p1Y * dp2p1X);
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
                        Color c = tex.GetPixel(tx, ty);
                        //Color c = tex[tx, ty];
                        // Draw pixel
                    
                        ctl.RazorBMP.SetPixel(x, y, c);
                    }
                }
            }
        }
    }
}

