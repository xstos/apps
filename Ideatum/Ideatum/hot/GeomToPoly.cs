using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using System.Windows.Shapes;
using TSeg = (double, double, double, double);
namespace RENAME_ME;

/// <summary>
/// Adapted from https://github.com/reneschulte/WriteableBitmapEx
/// </summary>
public static class GeomToPoly
{
    public static IEnumerable<TSeg> ToLineSegments(this IEnumerable<IEnumerable<double>> polygons)
    {
        return polygons.SelectMany(ToLineSegments);
    }
    public static IEnumerable<TSeg> ToLineSegments(this IEnumerable<double> poly)
    {
        return poly.Chunk(2)
            .Pairwise()
            .Select(pt => (pt.Item1[0], pt.Item1[1], pt.Item2[0], pt.Item2[1]));
    }

    public static IEnumerable<(T, T)> Pairwise<T>(this IEnumerable<T> source)
    {
        var previous = default(T);
        using var it = source.GetEnumerator();
        if (it.MoveNext())
            previous = it.Current;

        while (it.MoveNext())
            yield return (previous, previous = it.Current);
    }
    public static IEnumerable<PathFigure> GetFigures(this Geometry geometry)
    {
        if (geometry is GeometryGroup gp)
        {
            foreach (var f in gp.Children.SelectMany(GetFigures))
            {
                yield return f;
            }
        }
        else if (geometry is PathGeometry pg)
        {
            foreach (var fig in pg.Figures)
            {
                yield return fig;
            }
        }
    }

    public static IEnumerable<IEnumerable<double>> ToPolygons(this Geometry geometry)
    {
        return geometry.GetFigures().Select(ToPolygon);
    }

    public static IEnumerable<double> ToPolygon(this PathFigure fig)
    {
        var lastPoint = fig.StartPoint;

        yield return lastPoint.X;
        yield return lastPoint.Y;

        foreach (var seg in fig.Segments)
        {
            var flag = false;

            if (seg is PolyBezierSegment pbs)
            {
                flag = true;

                var points = pbs.Points;
                for (int i = 0; i < points.Count; i += 3)
                {
                    var c1 = points[i];
                    var c2 = points[i + 1];
                    var en = points[i + 2];

                    var pts = ComputeBezierPoints(lastPoint.X, lastPoint.Y, c1.X, c1.Y, c2.X, c2.Y, en.X, en.Y);
                    foreach (var pt in pts)
                    {
                        yield return pt;
                    }

                    lastPoint = en;
                }
            }

            if (seg is PolyLineSegment pls)
            {
                flag = true;
                var points = pls.Points;

                for (int i = 0; i < points.Count; i++)
                {
                    var en = points[i];
                    yield return en.X;
                    yield return en.Y;

                    lastPoint = en;
                }
            }

            if (seg is LineSegment ls)
            {
                flag = true;

                var en = ls.Point;

                yield return en.X;
                yield return en.Y;

                lastPoint = en;
            }

            if (seg is BezierSegment bs)
            {
                flag = true;

                var c1 = bs.Point1;
                var c2 = bs.Point2;
                var en = bs.Point3;

                var pts = ComputeBezierPoints(lastPoint.X, lastPoint.Y, c1.X, c1.Y, c2.X, c2.Y, en.X, en.Y);

                foreach (var pt in pts)
                {
                    yield return pt;
                }

                lastPoint = en;
            }

            if (!flag)
            {
                throw new Exception("Error in rendering text, PathSegment type not supported");
            }
        }
    }

    /// <param name="x1">The x-coordinate of the start point.</param>
    /// <param name="y1">The y-coordinate of the start point.</param>
    /// <param name="cx1">The x-coordinate of the 1st control point.</param>
    /// <param name="cy1">The y-coordinate of the 1st control point.</param>
    /// <param name="cx2">The x-coordinate of the 2nd control point.</param>
    /// <param name="cy2">The y-coordinate of the 2nd control point.</param>
    /// <param name="x2">The x-coordinate of the end point.</param>
    /// <param name="y2">The y-coordinate of the end point.</param>
    static IEnumerable<double> ComputeBezierPoints(double x1, double y1, double cx1, double cy1, double cx2,
        double cy2, double x2, double y2, double stepFactor = 2)
    {
        // Determine distances between controls points (bounding rect) to find the optimal stepsize
        var minX = Math.Min(x1, Math.Min(cx1, Math.Min(cx2, x2)));
        var minY = Math.Min(y1, Math.Min(cy1, Math.Min(cy2, y2)));
        var maxX = Math.Max(x1, Math.Max(cx1, Math.Max(cx2, x2)));
        var maxY = Math.Max(y1, Math.Max(cy1, Math.Max(cy2, y2)));

        // Get slope
        var lenx = maxX - minX;
        var len = maxY - minY;
        if (lenx > len)
        {
            len = lenx;
        }

        // Prevent division by zero
        if (len == 0) yield break;
        // Init vars
        var step = stepFactor / len;
        double tx = x1;
        double ty = y1;

        // Interpolate
        for (var t = 0d; t <= 1; t += step)
        {
            var tSq = t * t;
            var t1 = 1 - t;
            var t1Sq = t1 * t1;

            tx = (double)(t1 * t1Sq * x1 + 3 * t * t1Sq * cx1 + 3 * t1 * tSq * cx2 + t * tSq * x2);
            ty = (double)(t1 * t1Sq * y1 + 3 * t * t1Sq * cy1 + 3 * t1 * tSq * cy2 + t * tSq * y2);
            yield return tx;
            yield return ty;
        }

        // Prevent rounding gap
        yield return x2;
        yield return y2;
    }
}