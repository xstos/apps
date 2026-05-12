using System;
using System.Runtime.InteropServices;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace Snippets.scanline;


public static class ScanlinePolygonFiller
{
    /// <summary>
    /// Draws a filled polygon using the scanline algorithm.
    /// </summary>
    /// <param name="buffer">Target pixel buffer (ARGB, 32-bit).</param>
    /// <param name="width">Width of the buffer in pixels.</param>
    /// <param name="height">Height of the buffer in pixels.</param>
    /// <param name="vertices">Array of polygon vertices (x, y pairs).</param>
    /// <param name="color">Color to fill with (0xAARRGGBB).</param>
    public static void FillPolygon(int[] buffer, int width, int height, int[] vertices, int color)
    {
        if (vertices.Length < 6) return; // Need at least a triangle (3 points = 6 ints)

        int minY = int.MaxValue;
        int maxY = int.MinValue;

        // Find min and max Y
        for (int i = 1; i < vertices.Length; i += 2)
        {
            int y = vertices[i];
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        if (minY >= height || maxY < 0) return; // Completely outside

        // Clamp to buffer bounds
        minY = Math.Max(0, minY);
        maxY = Math.Min(height - 1, maxY);

        // Edge table: for each Y we store min X and max X
        int[] minX = new int[height];
        int[] maxX = new int[height];

        // Initialize with extreme values
        for (int i = 0; i < height; i++)
        {
            minX[i] = int.MaxValue;
            maxX[i] = int.MinValue;
        }

        // Process each edge
        for (int i = 0; i < vertices.Length; i += 2)
        {
            int x1 = vertices[i];
            int y1 = vertices[i + 1];
            int x2 = vertices[(i + 2) % vertices.Length];
            int y2 = vertices[(i + 3) % vertices.Length];

            // Skip degenerate edges (zero height)
            if (y1 == y2) continue;

            // Ensure y1 < y2 for consistent scanning
            if (y1 > y2)
            {
                Swap(ref x1, ref x2);
                Swap(ref y1, ref y2);
            }

            // Clip Y range to buffer
            int startY = Math.Max(y1, minY);
            int endY = Math.Min(y2, maxY);

            if (startY > endY) continue;

            // Bresenham-like X step
            double slope = (double)(x2 - x1) / (y2 - y1);
            double currentX = x1 + slope * (startY - y1);

            for (int y = startY; y <= endY; y++)
            {
                int ix = (int)Math.Round(currentX);
                if (ix < minX[y]) minX[y] = ix;
                if (ix > maxX[y]) maxX[y] = ix;
                currentX += slope;
            }
        }

        // Draw horizontal spans
        for (int y = minY; y <= maxY; y++)
        {
            if (minX[y] > maxX[y]) continue;
            int startX = Math.Max(0, minX[y]);
            int endX = Math.Min(width - 1, maxX[y]);
            for (int x = startX; x <= endX; x++)
            {
                buffer[y * width + x] = color;
            }
        }
    }

    internal static WriteableBitmap Example()
    {
        // Create a 640x480 buffer (int is 32-bit ARGB)
        int width = 640;
        int height = 480;
        int[] buffer = new int[width * height];

        // Clear to white (0xFFFFFFFF)
        Array.Fill(buffer, unchecked((int)0xFFFFFFFF));

        // Define a triangle vertices (x, y, x, y, ...)
        int[] triangle =
        {
            320, 50, // top
            100, 400, // bottom left
            540, 400 // bottom right
        };

        // Draw filled triangle in red (0xFFFF0000)
        int red = unchecked((int)0xFFFF0000);
        ScanlinePolygonFiller.FillPolygon(buffer, width, height, triangle, red);
        BitmapSource bitmap = BitmapSource.Create(
            width, height,                    // Dimensions
            96, 96,                           // DPI (96 is standard)
            PixelFormats.Bgra32,              // Pixel format
            null,                             // Palette (not needed for 32-bit)
            MemoryMarshal.AsBytes(buffer).ToArray(),                        // Pixel data
            width * 4                         // Stride (bytes per row)
        );
        WriteableBitmap wb = new WriteableBitmap(bitmap);
        return wb;
    }

    private static void Swap(ref int a, ref int b)
    {
        int temp = a;
        a = b;
        b = temp;
    }
}