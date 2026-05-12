// TinyGL Antialiased Polygon Rasterizer — C# port
// Original algorithm by Ayke van Laethem: https://aykevl.nl/2024/02/tinygl-polygon/
// Source: https://github.com/aykevl/tinygl/blob/main/gfx/polygon.go
//
// Uses A-buffer-style antialiasing with an 8×4 subpixel mask per pixel (32 bits).
// Polygons are decomposed into trapezoids that are XOR-combined during scanline rendering.
//
// Fixed-point notation: comments like "// .16" mean 16 fractional bits.

//todo: test/debug this (deepseek conversion)
using System;
using System.Numerics;   // BitOperations.PopCount

namespace tinygl;
// -------------------------------------------------------------------------
// Color / image types
// -------------------------------------------------------------------------

/// <summary>32-bit ARGB color.</summary>
public readonly struct Color
{
    public readonly byte R, G, B, A;
    public Color(byte r, byte g, byte b, byte a = 255) { R = r; G = g; B = b; A = a; }
    public static Color FromArgb(byte a, byte r, byte g, byte b) => new Color(r, g, b, a);

    /// <summary>Blend <paramref name="src"/> over <paramref name="dst"/> using alpha 0–255.</summary>
    public static Color Blend(Color dst, Color src, byte alpha)
    {
        if (alpha == 0)   return dst;
        if (alpha == 255) return src;
        int ia = 255 - alpha;
        return new Color(
            (byte)((src.R * alpha + dst.R * ia) / 255),
            (byte)((src.G * alpha + dst.G * ia) / 255),
            (byte)((src.B * alpha + dst.B * ia) / 255),
            255);
    }
}

/// <summary>Simple 32-bit ARGB image that owns its pixel buffer.</summary>
public sealed class Image
{
    public readonly int Width;
    public readonly int Height;
    public readonly Color[] Pixels;

    public Image(int width, int height, Color background = default)
    {
        Width  = width;
        Height = height;
        Pixels = new Color[width * height];
        if (background.A != 0 || background.R != 0 || background.G != 0 || background.B != 0)
            Array.Fill(Pixels, background);
    }

    public ref Color this[int x, int y] => ref Pixels[y * Width + x];

    /// <summary>Write pixels as a P6 (binary) PPM file.</summary>
    public void SavePpm(string path)
    {
        using var fs = System.IO.File.OpenWrite(path);
        using var bw = new System.IO.BinaryWriter(fs);
        var header = System.Text.Encoding.ASCII.GetBytes($"P6\n{Width} {Height}\n255\n");
        bw.Write(header);
        foreach (var c in Pixels) { bw.Write(c.R); bw.Write(c.G); bw.Write(c.B); }
    }
}

// -------------------------------------------------------------------------
// Polygon edge  (= trapezoid extending infinitely to the right)
// -------------------------------------------------------------------------

/// <summary>
/// One directed edge of a polygon, represented as a scanline trapezoid.
/// All Y coordinates carry 2 fractional bits (4 sub-scanlines per pixel).
/// All X coordinates carry 16 fractional bits.
/// </summary>
internal struct PolygonEdge
{
    /// <summary>Top sub-scanline of the trapezoid (inclusive). .2</summary>
    internal int ytop;
    /// <summary>Bottom sub-scanline of the trapezoid (exclusive). .2</summary>
    internal int ybottom;
    /// <summary>X position at ytop. .16</summary>
    internal int xstart;
    /// <summary>X increment per whole pixel row. .16</summary>
    internal int xinc;

    // ---- helper queries -------------------------------------------------

    /// <summary>Leftmost whole pixel the edge crosses on scanline <paramref name="y"/>.</summary>
    internal int XLeft(int y)
    {
        int edgeY = y * 4 - ytop;
        if (xinc > 0)
            return (xstart + (int)((long)edgeY * xinc / 4)) >> 16;
        else
            return (xstart + (int)((long)(edgeY + 3) * xinc / 4)) >> 16;
    }

    /// <summary>Rightmost whole pixel the edge crosses on scanline <paramref name="y"/>.</summary>
    internal int XRight(int y)
    {
        int edgeY = y * 4 - ytop;
        if (xinc > 0)
            return (xstart + (int)((long)(edgeY + 3) * xinc / 4)) >> 16;
        else
            return (xstart + (int)((long)edgeY * xinc / 4)) >> 16;
    }

    /// <summary>Does this edge intersect (even partially) the pixel row <paramref name="y"/>?</summary>
    internal bool InRange(int y) =>
        y >= ytop / 4 && y < (ybottom + 3) / 4;
}

// -------------------------------------------------------------------------
// Polygon
// -------------------------------------------------------------------------

/// <summary>
/// A polygon described as a list of directed edges.
/// Build it with <see cref="PolygonBuilder"/>, then draw with <see cref="Rasterizer"/>.
/// </summary>
public sealed class Polygon
{
    internal PolygonEdge[] Edges = Array.Empty<PolygonEdge>();
    internal short BoundX1, BoundY1, BoundX2, BoundY2;

    /// <summary>Rebuild the axis-aligned bounding box after modifying edges.</summary>
    internal void UpdateBounds()
    {
        int polygonX1 =  int.MaxValue;
        int polygonY1 =  int.MaxValue;
        int polygonX2 =  int.MinValue;
        int polygonY2 =  int.MinValue;

        foreach (ref readonly var e in Edges.AsSpan())
        {
            int ytop    = e.ytop  / 4;
            int ybottom = (e.ybottom + 3) / 4;

            if (ytop    < polygonY1) polygonY1 = ytop;
            if (ybottom > polygonY2) polygonY2 = ybottom;

            int ex1 = e.xstart;
            int ex2 = e.xstart + (ybottom - ytop) * e.xinc / 4;
            if (ex1 > ex2) (ex1, ex2) = (ex2, ex1);

            if (ex1 < polygonX1) polygonX1 = ex1;
            if (ex2 > polygonX2) polygonX2 = ex2;
        }

        BoundX1 = (short)(polygonX1 >> 16);
        BoundY1 = (short)polygonY1;
        BoundX2 = (short)((polygonX2 + 0xffff) >> 16);
        BoundY2 = (short)polygonY2;
    }
}

// -------------------------------------------------------------------------
// Polygon builder helpers
// -------------------------------------------------------------------------

/// <summary>Builds a <see cref="Polygon"/> from a list of (x,y) vertices.</summary>
public static class PolygonBuilder
{
    /// <summary>
    /// Create a polygon from an array of vertices.
    /// Coordinates are floating-point pixel positions (screen coords, top-left origin).
    /// </summary>
    public static Polygon FromVertices(ReadOnlySpan<(float x, float y)> verts)
    {
        if (verts.Length < 2) throw new ArgumentException("Need at least 2 vertices.");

        var edgeList = new System.Collections.Generic.List<PolygonEdge>(verts.Length);

        for (int i = 0; i < verts.Length; i++)
        {
            var (x0, y0) = verts[i];
            var (x1, y1) = verts[(i + 1) % verts.Length];
            AddEdge(edgeList, x0, y0, x1, y1);
        }

        // Sort edges by ytop so the scanline loop can advance a pointer cheaply.
        edgeList.Sort((a, b) => a.ytop.CompareTo(b.ytop));

        var poly = new Polygon { Edges = edgeList.ToArray() };
        poly.UpdateBounds();
        return poly;
    }

    /// <summary>
    /// Build the polygon for a thick line from (x0,y0) to (x1,y1) with the
    /// given half-thickness.
    /// </summary>
    public static Polygon FromLine(float x0, float y0, float x1, float y1, float halfThickness)
    {
        float dx = x1 - x0;
        float dy = y1 - y0;
        float len = MathF.Sqrt(dx * dx + dy * dy);
        if (len < 1e-6f) return new Polygon();   // degenerate

        float nx = -dy / len * halfThickness;
        float ny =  dx / len * halfThickness;

        (float x, float y)[] verts =
        {
            (x0 + nx, y0 + ny),
            (x1 + nx, y1 + ny),
            (x1 - nx, y1 - ny),
            (x0 - nx, y0 - ny),
        };
        return FromVertices(verts);
    }

    // Convert a directed segment to a PolygonEdge and append it.
    // Horizontal edges are skipped (no trapezoid area).
    private static void AddEdge(
        System.Collections.Generic.List<PolygonEdge> list,
        float x0, float y0, float x1, float y1)
    {
        if (Math.Abs(y1 - y0) < 1e-9f) return;   // horizontal – skip

        // Ensure the edge goes top-to-bottom.
        if (y0 > y1)
        {
            (x0, y0, x1, y1) = (x1, y1, x0, y0);
        }

        // Sub-scanline Y coordinates (.2 fixed-point, 4 sub-scanlines per pixel).
        int ytop    = (int)Math.Round(y0 * 4);
        int ybottom = (int)Math.Round(y1 * 4);
        if (ytop >= ybottom) return;

        // X start at ytop (.16 fixed-point).
        int xstart = (int)(x0 * 65536);

        // X increment per whole pixel (.16 fixed-point).
        float pixelHeight = (y1 - y0);
        float xincF = (pixelHeight == 0f) ? 0f : (x1 - x0) / pixelHeight;
        int xinc = (int)(xincF * 65536);

        list.Add(new PolygonEdge
        {
            ytop    = ytop,
            ybottom = ybottom,
            xstart  = xstart,
            xinc    = xinc,
        });
    }
}

// -------------------------------------------------------------------------
// Rasterizer
// -------------------------------------------------------------------------

/// <summary>
/// Scanline rasterizer that renders antialiased polygons into an <see cref="Image"/>
/// using the A-buffer 8×4 subpixel mask approach.
/// </summary>
public static class Rasterizer
{
    /// <summary>
    /// Draw <paramref name="poly"/> into <paramref name="img"/> at offset
    /// (<paramref name="imgX"/>, <paramref name="imgY"/>) with the given <paramref name="color"/>.
    /// </summary>
    public static void DrawPolygon(Polygon poly, Image img, Color color,
        int imgX = 0, int imgY = 0)
    {
        // Clip polygon bounding box to the image rectangle.
        int ystart = Math.Max(imgY,  poly.BoundY1);
        int yend   = Math.Min(imgY + img.Height, poly.BoundY2);
        int xstart = Math.Max(imgX,  poly.BoundX1);
        int xend   = Math.Min(imgX + img.Width,  poly.BoundX2);

        var edges = poly.Edges;

        // ---- scanline loop -----------------------------------------------
        for (int y = ystart; y < yend; y++)
        {
            // Advance edgeStart to the first edge that intersects this row.
            int edgeStart = 0;
            while (edgeStart < edges.Length && !edges[edgeStart].InRange(y))
                edgeStart++;

            if (edgeStart >= edges.Length) continue;

            // Cache the rightmost x of the start edge so we can advance cheaply.
            int edgeStartRight = edges[edgeStart].XRight(y);

            // edgeEnd tracks the last edge index that still crosses the current x.
            int edgeEnd     = edgeStart;
            int edgeEndLeft = edges[edgeEnd].XLeft(y);

            // Running 8×4 subpixel mask.
            uint mask = 0;

            for (int x = edges[edgeStart].XLeft(y); x < xend; )
            {
                // Advance edgeStart past edges we've left behind.
                while (edgeStartRight < x)
                {
                    edgeStart++;
                    while (edgeStart < edges.Length && !edges[edgeStart].InRange(y))
                        edgeStart++;

                    edgeStartRight = edgeStart < edges.Length
                        ? edges[edgeStart].XRight(y)
                        : int.MaxValue;
                }
                if (edgeStart >= edges.Length) break;

                // Advance edgeEnd to include all edges that reach x.
                while (edgeEndLeft <= x)
                {
                    edgeEnd++;
                    while (edgeEnd < edges.Length && !edges[edgeEnd].InRange(y))
                        edgeEnd++;

                    edgeEndLeft = edgeEnd < edges.Length
                        ? edges[edgeEnd].XLeft(y)
                        : int.MaxValue;
                }

                // XOR each intersecting edge's contribution into the mask.
                for (int i = edgeStart; i < edgeEnd; i++)
                {
                    ref readonly var edge = ref edges[i];
                    if (!edge.InRange(y)) continue;

                    for (int subline = 0; subline < 4; subline++)
                    {
                        int sublineY = y * 4 + subline - edge.ytop;   // .2
                        if ((uint)sublineY >= (uint)(edge.ybottom - edge.ytop))
                            continue;   // subline outside edge span

                        // X intersection with this sub-scanline. .16
                        int xoffset = edge.xstart + (int)((long)sublineY * edge.xinc / 4);

                        // Distance from left edge of current pixel, scaled to 8 columns. .3
                        int bitOffsetX = (xoffset - (x << 16)) >> 13;

                        if ((uint)bitOffsetX >= 8) continue;   // outside pixel

                        // Set all bits from bitOffsetX to 7 (right side of pixel).
                        uint bits = (1u << (8 - bitOffsetX)) - 1;
                        mask ^= bits << (subline * 8);
                    }
                }

                if (mask != 0)
                {
                    if (mask == 0xffff_ffff)
                    {
                        // Fast path: completely filled pixels until the next edge.
                        int pxStart = Math.Max(x, xstart);
                        int pxEnd   = Math.Min(edgeEndLeft, xend);
                        DrawLine(img, pxStart - imgX, pxEnd - imgX, y - imgY, color);
                        x = edgeEndLeft;
                        continue;
                    }

                    // Partial pixel: alpha = popcount(mask) * 8  → 0..248 ≈ 0..255
                    int alpha = BitOperations.PopCount(mask) << 3;
                    BlendPixel(img, x - imgX, y - imgY, color, (byte)alpha);

                    // Extend each sub-scanline's rightmost set bit across the pixel.
                    // (mask & 0x01010101) isolates the LSB of each byte;
                    // multiplying by 255 floods all 8 bits of that byte.
                    mask = (mask & 0x0101_0101u) * 255u;
                }

                x++;
            }
        }
    }

    // ---- pixel helpers ---------------------------------------------------

    private static void BlendPixel(Image img, int x, int y, Color src, byte alpha)
    {
        if ((uint)x >= (uint)img.Width || (uint)y >= (uint)img.Height) return;
        img[x, y] = Color.Blend(img[x, y], src, alpha);
    }

    private static void DrawLine(Image img, int xStart, int xEnd, int y, Color color)
    {
        if ((uint)y >= (uint)img.Height) return;
        xStart = Math.Max(xStart, 0);
        xEnd   = Math.Min(xEnd, img.Width);
        int row = y * img.Width;
        for (int x = xStart; x < xEnd; x++)
            img.Pixels[row + x] = color;
    }
}

// -------------------------------------------------------------------------
// Demo program
// -------------------------------------------------------------------------

internal static class Program
{
    internal static void Run()
    {
        const int W = 320, H = 240;
        var bg  = new Color(30, 30, 50);
        var img = new Image(W, H, bg);

        // ---- thick diagonal line ----------------------------------------
        var line = PolygonBuilder.FromLine(20, 20, 200, 120, 4f);
        Rasterizer.DrawPolygon(line, img, new Color(255, 200, 50));

        // ---- filled triangle --------------------------------------------
        (float x, float y)[] tri =
        {
            (160f,  30f),
            (290f, 180f),
            ( 90f, 200f),
        };
        var triangle = PolygonBuilder.FromVertices(tri);
        Rasterizer.DrawPolygon(triangle, img, new Color(80, 180, 255));

        // ---- convex pentagon --------------------------------------------
        int cx = 80, cy = 140, r = 45;
        (float, float)[] penta = new (float, float)[5];
        for (int i = 0; i < 5; i++)
        {
            float angle = MathF.PI * 2f * i / 5f - MathF.PI / 2f;
            penta[i] = (cx + r * MathF.Cos(angle), cy + r * MathF.Sin(angle));
        }
        var pentagon = PolygonBuilder.FromVertices(penta);
        Rasterizer.DrawPolygon(pentagon, img, new Color(255, 100, 130));

        // ---- thin angled lines (stress-test antialiasing) ---------------
        for (int i = 0; i < 8; i++)
        {
            float angle = MathF.PI * i / 8f;
            float len   = 60f;
            float sx = 240f, sy = 60f;
            var l = PolygonBuilder.FromLine(
                sx, sy,
                sx + len * MathF.Cos(angle),
                sy + len * MathF.Sin(angle),
                0.75f);
            Rasterizer.DrawPolygon(l, img, new Color(180, 255, 180));
        }

        img.SavePpm("output.ppm");
        Console.WriteLine("Wrote output.ppm");
    }
}