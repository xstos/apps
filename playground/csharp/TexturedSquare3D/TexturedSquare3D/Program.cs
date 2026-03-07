using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Reflection;
using System.Windows.Forms;

class Program
{
    [STAThread]
    static void Main()
    {
        // Create a bitmap to draw on
        bmp = new Bitmap(800, 600);
        
        var g = Graphics.FromImage(bmp);
        
        // Create a simple checkerboard texture (8x8 pixels)
        var filename = Path.Combine(Directory.GetCurrentDirectory(), "tex.png");
        var tex = new Bitmap(filename);

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
        var form = new Form { ClientSize = new Size(800, 600) };
        typeof(Form).InvokeMember("DoubleBuffered", BindingFlags.SetProperty | BindingFlags.Instance | BindingFlags.NonPublic, null,
            form, [true]); 
        form.Paint += (s, e) =>
        {
            e.Graphics.DrawImage(bmp, 0, 0);
        };
        var (px, py) = (0, 0);
        void repaint()
        {
            g.Clear(Color.Black);
            
            for (int i = 0; i < 4; i++)
            {
                float x = verts[i, 0];
                float y = verts[i, 1];
                float z = verts[i, 2]+zoffs;

                // Simple perspective projection
                points[i] = new PointF(
                    400 + x * fov / z,
                    300 - y * fov / z
                );
            }
            // Draw the textured square using triangles
            DrawTexturedTriangle(g, tex, points[0], points[2], points[3], bl,tl,tr); //top left half
            DrawTexturedTriangle(g, tex, points[0], points[1], points[2], bl,tr, br); //bottom left half
            form.Invalidate();
            
        }
        form.MouseMove += (sender, args) =>
        {
            var (x, y) = (args.X, args.Y);
            var (dx, dy) = (x - px, y - py);
            //if (args.Button == MouseButtons.Left)
            {
                if (dy==0) return;
                var sign = Math.Sign(dy);
                zoffs += sign * 0.05f;
                repaint();
            }

            px = args.X;
            py = args.Y;
        };
        repaint();
        Application.Run(form);
    }

    static void DrawTexturedTriangle(Graphics g, Bitmap tex, PointF p1, PointF p2, PointF p3,
        (float, float) uv1, (float, float) uv2, (float, float) uv3)
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

                    // Draw pixel
                    bmp.SetPixel(x, y, c);
                }
            }
        }
    }

    static Bitmap bmp; // Make bitmap accessible to DrawTexturedTriangle
}