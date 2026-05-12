using System;
using System.Collections.Generic;
using System.Numerics;
using System.Runtime.InteropServices;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace tinygl;
public static class PolygonRasterizer
{
    private struct PolygonEdge
    {
        public int YTop;      // .2 fixed point (4 subpixels per pixel)
        public int YBottom;   // .2 fixed point
        public int XStart;    // .16 fixed point
        public int XInc;      // .16 fixed point

        public bool InRange(int y)
        {
            return y >= YTop / 4 && y < (YBottom + 3) / 4;
        }

        public int XLeft(int y)
        {
            int edgeY = y * 4 - YTop;
            if (XInc > 0)
                return (XStart + edgeY * XInc / 4) >> 16;
            else
                return (XStart + (edgeY + 3) * XInc / 4) >> 16;
        }

        public int XRight(int y)
        {
            int edgeY = y * 4 - YTop;
            if (XInc > 0)
                return (XStart + (edgeY + 3) * XInc / 4) >> 16;
            else
                return (XStart + edgeY * XInc / 4) >> 16;
        }
    }

    /// <summary>
    /// Represents a horizontal line segment to be drawn
    /// </summary>
    public struct HorizontalSegment
    {
        public int Y;
        public int X1;
        public int X2;
        public byte Alpha; // 0-255 alpha value

        public HorizontalSegment(int y, int x1, int x2, byte alpha)
        {
            Y = y;
            X1 = x1;
            X2 = x2;
            Alpha = alpha;
        }
    }

    /// <summary>
    /// Converts a closed polygon to a list of horizontal line segments for scanline rendering
    /// </summary>
    /// <param name="vertices">List of vertices in order (closed polygon)</param>
    /// <returns>List of horizontal segments with alpha values for anti-aliased edges</returns>
    public static List<HorizontalSegment> GetScanlineSegments(List<Vector2> vertices)
    {
        if (vertices == null || vertices.Count < 3)
            return new List<HorizontalSegment>();

        var edges = BuildEdges(vertices);
        if (edges.Count == 0)
            return new List<HorizontalSegment>();

        // Calculate bounds
        var bounds = CalculateBounds(edges);
        
        var segments = new List<HorizontalSegment>();

        // Scanline algorithm
        for (int y = bounds.MinY; y <= bounds.MaxY; y++)
        {
            // Find edges that intersect this scanline
            var activeEdges = new List<int>();
            for (int i = 0; i < edges.Count; i++)
            {
                if (edges[i].InRange(y))
                    activeEdges.Add(i);
            }

            if (activeEdges.Count == 0)
                continue;

            // Sort edges by X position at this scanline
            activeEdges.Sort((a, b) => edges[a].XLeft(y).CompareTo(edges[b].XLeft(y)));

            int xMin = bounds.MinX;
            int xMax = bounds.MaxX;
            
            uint mask = 0;
            int edgeIdx = 0;
            int x = edges[activeEdges[0]].XLeft(y);
            
            while (x <= xMax && edgeIdx < activeEdges.Count)
            {
                int currentEdgeXLeft = edges[activeEdges[edgeIdx]].XLeft(y);
                int currentEdgeXRight = edges[activeEdges[edgeIdx]].XRight(y);
                
                // Update mask for all edges that affect this pixel
                for (int i = edgeIdx; i < activeEdges.Count; i++)
                {
                    var edge = edges[activeEdges[i]];
                    if (!edge.InRange(y))
                        continue;

                    // Calculate mask for 4 sub-scanlines
                    for (int subline = 0; subline < 4; subline++)
                    {
                        int sublineY = y * 4 + subline - edge.YTop;
                        if (sublineY < 0 || sublineY >= (edge.YBottom - edge.YTop))
                            continue;

                        int xoffset = edge.XStart + sublineY * edge.XInc / 4;
                        int bitOffsetX = (xoffset - (x << 16)) >> 13; // .3 fixed point
                        
                        if (bitOffsetX < 0 || bitOffsetX >= 8)
                            continue;

                        uint bits = (uint)((1 << (8 - bitOffsetX)) - 1);
                        mask ^= bits << (subline * 8);
                    }
                }

                if (mask != 0)
                {
                    if (mask == 0xFFFFFFFF)
                    {
                        // Fully filled segment (no anti-aliasing needed)
                        int nextX = x + 1;
                        while (nextX <= xMax && nextX < currentEdgeXRight)
                        {
                            nextX++;
                        }
                        
                        if (x <= nextX)
                        {
                            segments.Add(new HorizontalSegment(y, x, nextX, 255));
                        }
                        x = nextX;
                    }
                    else
                    {
                        // Calculate alpha from mask
                        int alpha = PopCount(mask) * 8;
                        if (alpha > 255) alpha = 255;
                        
                        segments.Add(new HorizontalSegment(y, x, x, (byte)alpha));
                        x++;
                        
                        // Extend mask for next pixel
                        mask = (mask & 0x01010101) * 255;
                    }
                }
                else
                {
                    x++;
                }

                // Move to next edge if we've passed it
                while (edgeIdx < activeEdges.Count && x > edges[activeEdges[edgeIdx]].XRight(y))
                {
                    edgeIdx++;
                }
            }
        }

        return segments;
    }

    private static List<PolygonEdge> BuildEdges(List<Vector2> vertices)
    {
        var edges = new List<PolygonEdge>();
        
        for (int i = 0; i < vertices.Count; i++)
        {
            int next = (i + 1) % vertices.Count;
            Vector2 p1 = vertices[i];
            Vector2 p2 = vertices[next];
            
            // Skip horizontal edges
            if (Math.Abs(p1.Y - p2.Y) < 1e-6)
                continue;
            
            // Ensure consistent orientation (top to bottom)
            if (p1.Y > p2.Y)
            {
                var temp = p1;
                p1 = p2;
                p2 = temp;
            }
            
            // Convert to fixed point
            int yTop = (int)(p1.Y * 4);     // .2 fixed point
            int yBottom = (int)(p2.Y * 4);   // .2 fixed point
            int xStart = (int)(p1.X * 65536); // .16 fixed point
            int xEnd = (int)(p2.X * 65536);   // .16 fixed point
            
            int xInc = (xEnd - xStart) / (yBottom - yTop);
            
            edges.Add(new PolygonEdge
            {
                YTop = yTop,
                YBottom = yBottom,
                XStart = xStart,
                XInc = xInc
            });
        }
        
        // Sort edges by YTop and XStart
        edges.Sort((a, b) =>
        {
            int cmp = a.YTop.CompareTo(b.YTop);
            if (cmp != 0) return cmp;
            return a.XStart.CompareTo(b.XStart);
        });
        
        return edges;
    }

    private static (int MinX, int MaxX, int MinY, int MaxY) CalculateBounds(List<PolygonEdge> edges)
    {
        int minX = int.MaxValue;
        int maxX = int.MinValue;
        int minY = int.MaxValue;
        int maxY = int.MinValue;
        
        foreach (var edge in edges)
        {
            int yTop = edge.YTop / 4;
            int yBottom = (edge.YBottom + 3) / 4;
            
            minY = Math.Min(minY, yTop);
            maxY = Math.Max(maxY, yBottom);
            
            int x1 = edge.XStart >> 16;
            int x2 = (edge.XStart + (yBottom - yTop) * edge.XInc / 4) >> 16;
            
            minX = Math.Min(minX, Math.Min(x1, x2));
            maxX = Math.Max(maxX, Math.Max(x1, x2));
        }
        
        return (minX, maxX, minY, maxY);
    }

    private static int PopCount(uint x)
    {
        // Hamming weight algorithm
        x = x - ((x >> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
        x = (x + (x >> 4)) & 0x0F0F0F0F;
        x = x + (x >> 8);
        x = x + (x >> 16);
        return (int)(x & 0x0000003F);
    }

    internal static WriteableBitmap Example()
    {
        // Example usage:
        var vertices = new List<float>
        {
            320, 50, // top
            100, 400, // bottom left
            540, 400, // bottom right
        }.Chunk(2).Select(p=>new Vector2(p[0],p[1])).ToList();

        var segments = GetScanlineSegments(vertices);

// Create pixel buffer (BGRA format)
        int width = 800;
        int height = 600;
        int[] buffer = new int[width * height];

// Fill in parallel
        Parallel.ForEach(segments, segment =>
        {
            int color = (255 << 24) | (0 << 16) | (255 << 8) | 0; // ARGB: Solid red with alpha
            int idx = segment.Y * width + segment.X1;
    
            if (segment.X1 == segment.X2 && segment.Alpha < 255)
            {
                // Anti-aliased pixel - blend with background
                int bgColor = buffer[idx];
                int alpha = segment.Alpha;
                int r = ((bgColor >> 16) & 0xFF) * (255 - alpha) / 255 + (color >> 16) & 0xFF;
                int g = ((bgColor >> 8) & 0xFF) * (255 - alpha) / 255 + (color >> 8) & 0xFF;
                int b = (bgColor & 0xFF) * (255 - alpha) / 255 + (color & 0xFF);
                buffer[idx] = (alpha << 24) | (r << 16) | (g << 8) | b;
            }
            else
            {
                // Solid fill
                Array.Fill(buffer, color, idx, segment.X2 - segment.X1 + 1);
            }
        });
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
}