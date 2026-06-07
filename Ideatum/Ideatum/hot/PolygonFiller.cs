using System;
using System.Collections.Generic;

namespace RENAME_ME;

internal struct MyBrush
{
    internal int ForegroundColor;
    internal int BackgroundColor;
    public static implicit operator MyBrush((int fore, int back) colors)
    {
        return new MyBrush() { ForegroundColor = colors.fore, BackgroundColor = colors.back};
    }
}
internal struct HLineInfo
{
    internal List<int>[] Rows;
    internal MyBrush[][] Brushes;
    internal List<int> UsedRowIndexes;
    public int Height => Rows.Length;
    public HLineInfo(int height)
    {
        Rows = new List<int>[height];
        Brushes = new MyBrush[height][];
        for (int i = 0; i < height; i++)
        {
            Rows[i] = new List<int>(1200);
            Brushes[i] = new MyBrush[1920];
        }
        UsedRowIndexes = new List<int>(height);
    }

    public void Push(int y, int x1, int x2)
    {
        Rows[y].AddRange([x1,x2]);
        UsedRowIndexes.Add(y);
    }
}
internal static class PolygonFiller
{
    internal static IEnumerable<(int y, int x1, int x2)> FillPolygon(Polygon p, int xoffs, int yoffs)
    {
        var polyX = p.x;
        var polyY = p.y;
        int polyCorners = polyX.Length;
        int polyCornersSub1 = polyCorners - 1;
        if (polyCorners < 3)
        {
            yield break;
        }
        int startY = (int)Math.Ceiling(p.Bounds.Top);
        int endY = (int)Math.Floor(p.Bounds.Bottom);

        var nodeX = new List<int>(20);

        for (int pixelY = startY; pixelY <= endY; pixelY++)
        {
            nodeX.Clear();

            int j = polyCornersSub1;
            for (int i = 0; i < polyCorners; i++)
            {
                // Check if edge crosses the current scanline
                var pyi = polyY[i];
                var pyj = polyY[j];
                if (pyi < pixelY && pyj >= pixelY || pyj < pixelY && pyi >= pixelY)
                {
                    // Calculate intersection X coordinate
                    var pxi = polyX[i];
                    double intersectX = pxi + (pixelY - pyi) / (pyj - pyi) * (polyX[j] - pxi);
                    nodeX.Add((int)intersectX);
                }
                j = i;
            }
            var count = nodeX.Count;
            
            nodeX.Sort();

            // Fill between pairs of nodes
            for (int i = 0; i < count; i += 2)
            {
                if (i + 1 >= count) break;

                int xStart = nodeX[i];
                int xEnd = nodeX[i + 1];

                var y = pixelY+yoffs;
                var startx = xStart+xoffs;
                var endx = xEnd+xoffs;
                yield return (y,startx,endx);
            }
        }
    }
}