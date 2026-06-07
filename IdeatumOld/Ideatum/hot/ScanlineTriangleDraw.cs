using System.Collections.Generic;
using System.Linq;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace RENAME_ME;

public class ScanlineTriangleDraw
{
    public static void Example(Canvas canvas)
    {
        var lines = ScanlineTriangleDraw.DrawTriangle(0,0,100,0,0,100);
        foreach (var valueTuple in lines)
        {
            var line = new Line();
            line.X1 = valueTuple.x1;
            line.X2 = valueTuple.x2;
            line.Y1 = valueTuple.y;
            line.Y2 = valueTuple.y;
            line.Stroke = Brushes.LimeGreen;
            canvas.Children.Add(line);
        }
    }
    public static IEnumerable<(int y,int x1, int x2)> DrawTriangle(int x1, int y1, int x2, int y2, int x3, int y3)
    {
        // Sort vertices top to bottom
        if (y3 < y1)
        {
            int tmp = x3;
            x3 = x1;
            x1 = tmp;

            tmp = y3;
            y3 = y1;
            y1 = tmp;
        }

        if (y2 < y1)
        {
            int tmp = x2;
            x2 = x1;
            x1 = tmp;

            tmp = y2;
            y2 = y1;
            y1 = tmp;
        }

        if (y3 < y2)
        {
            int tmp = x3;
            x3 = x2;
            x2 = tmp;

            tmp = y3;
            y3 = y2;
            y2 = tmp;
        }

        if (y1 == y2) // Flat top
        {
            if (x1 < x2)
            {
                return DrawFlatTriangle(x3, y3, x2, y2, x1, y1);
            }
            else
            {
                return DrawFlatTriangle(x3, y3, x1, y1, x2, y2);
            }
        }
        else
        {
            if (y2 == y3) // Flat bottom
            {
                if (x2 < x3)
                {
                    return DrawFlatTriangle(x1, y1, x2, y2, x3, y3);
                }
                else
                {
                    return DrawFlatTriangle(x1, y1, x3, y3, x2, y2);
                }
            }
            // Split triangle if it has no horizontal edges
            else
            {
                double ratio = (double)(y2 - y1) / (y3 - y1);
                int newX = (int)((x3 - x1) * ratio + x1);

                // Draw the split sub-triangles
                if (newX < x2)
                {
                    var ft1 = DrawFlatTriangle(x1, y1, newX, y2, x2, y2);
                    var ft2 = DrawFlatTriangle(x3, y3, x2, y2, newX, y2);
                    return ft1.Concat(ft2);
                }
                else
                {
                    var ft1 = DrawFlatTriangle(x1, y1, x2, y2, newX, y2);
                    var ft2 = DrawFlatTriangle(x3, y3, x2, y2, newX, y2);
                    return ft1.Concat(ft2);
                }
            }
        }
    }

    public static IEnumerable<(int y,int x1, int x2)> DrawFlatTriangle(int x1, int y1, int x2, int y2, int x3, int y3)
    {
        int height = y2 - y1;

        if (height == 0)
        {
            yield return (0,0,0);
            yield break;
        }

        double dx_left = (double)(x2 - x1) / height;
        double dx_right = (double)(x3 - x1) / height;

        double cx_left = x1;
        double cx_right = x1;

        if (y1 < y2)
        {
            for (int y = y1; y <= y2; ++y)
            {
                yield return HLine(y, (int)cx_left, (int)cx_right);

                cx_left += dx_left;
                cx_right += dx_right;
            }
        }
        else
        {
            for (int y = y1; y >= y2; --y)
            {
                yield return HLine(y, (int)cx_left, (int)cx_right);
                cx_left -= dx_left;
                cx_right -= dx_right;
            }
        }
    }

    public static (int y,int x1, int x2) HLine(int y, int x1, int x2)
    {
        // insert pixel op here
        return (y, x1, x2);
    }
}