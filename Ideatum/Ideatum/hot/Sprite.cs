using System;

namespace RENAME_ME;

public struct Sprite
{
    public int Width;
    public int Height;
    public int[] Data;

    public Sprite(int[] data, int width, int height)
    {
        Data = data;
        Width = width;
        Height = height;
    }
    public void Clear(int color)
    {
        var surface = Data;
        for (int i = 0; i < surface.Length; i++)
        {
            surface[i] = color;
        }
    }
    
    internal void Rasterize(double x1, double y1, double x2, double y2, double x3, double y3)
    {
        // Sort vertices by Y
        if (y2 < y1) { Swap(ref x1, ref x2); Swap(ref y1, ref y2); }
        if (y3 < y1) { Swap(ref x1, ref x3); Swap(ref y1, ref y3); }
        if (y3 < y2) { Swap(ref x2, ref x3); Swap(ref y2, ref y3); }

        int yStart = (int)Math.Ceiling(y1);
        int yEnd = (int)Math.Floor(y3);
        if (yStart > yEnd) return;

        // Precompute inverse slopes
        double invSlope13 = (x3 - x1) / (y3 - y1);
        double invSlope12 = (x2 - x1) / (y2 - y1);
        double invSlope23 = (x3 - x2) / (y3 - y2);

        for (int y = yStart; y <= yEnd; y++)
        {
            double xLeft, xRight;
        
            if (y < y2) // Top half
            {
                xLeft = x1 + invSlope12 * (y - y1);
                xRight = x1 + invSlope13 * (y - y1);
            }
            else // Bottom half
            {
                xLeft = x2 + invSlope23 * (y - y2);
                xRight = x1 + invSlope13 * (y - y1);
            }

            if (xLeft > xRight) Swap(ref xLeft, ref xRight);
        
            int xStart = (int)Math.Ceiling(xLeft);
            int xEnd = (int)Math.Floor(xRight);
            
            for (int x = xStart; x <= xEnd; x++)
                if (x >= 0 && x < Width && y >= 0 && y < Height)
                    Data[y * Width + x] = unchecked((int)0xFFFFFFFF); // White
        }
    }

    void Swap(ref double a, ref double b) { double t = a; a = b; b = t; }
}