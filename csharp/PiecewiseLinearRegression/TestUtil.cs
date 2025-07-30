using System;
using System.Collections.Generic;
using System.Linq;

public static class DataGenerator
{
    public static List<(double, double)> SinData()
    {
        var data = new List<(double, double)>();

        for (int i = 0; i < 1000; i++)
        {
            double x = (double)i / 1000.0 * 7.0;
            double y = Math.Sin(x);
            data.Add((x, y));
        }

        return data;
    }

    public static List<(double, double)> LinearData(double slope, double intercept)
    {
        var data = new List<(double, double)>();

        for (int i = 0; i < 10; i++)
        {
            double x = (double)i / 1000.0;
            double y = x * slope + intercept;
            data.Add((x, y));
        }

        return data;
    }

    public static List<(double, double)> PrecisionData()
    {
        var data = new List<(double, double)>();

        for (int i = 0; i < 1000; i++)
        {
            double x = ((double)i / 1000.0) * Math.Pow(2.0, 60);
            double y = (double)i;
            data.Add((x, y));
        }

        return data;
    }

    public static List<(double, double)> OsmData()
    {
        // Assuming OSM_DATA is defined elsewhere as an array of (int, int) or similar
        return OSM_DATA.Data.Select(p => ((double)p.Item1, (double)p.Item2)).ToList();
    }

    public static List<(double, double)> FbData()
    {
        // Assuming FB_DATA is defined elsewhere as an array of (int, int) or similar
        return FB_DATA.Data.Select(p => ((double)p.Item1, (double)p.Item2)).ToList();
    }
}

public static class Verification
{
    public static void VerifyGamma(double gamma, (double, double)[] data, Segment[] segments)
    {
        var segQ = new Queue<Segment>(segments);

        foreach (var (x, y) in data)
        {
            while (segQ.Peek().stop <= x)
            {
                segQ.Dequeue();
            }

            var seg = segQ.Peek();

            if (seg.start > x || seg.stop < x)
                throw new Exception("Point outside segment range");

            var line = new Line(seg.slope, seg.intercept);
            double pred = line.At(x).y;

            if (Math.Abs(pred - y) > gamma)
            {
                throw new Exception($"Prediction of {pred} was not within gamma ({gamma}) of true value {y}");
            }
        }
    }

    private static (double, double) SplineInterpolate(double pt, (double, double)[] knots)
    {
        int upperIdx = Math.Min(
            knots.Length - 1,
            Array.BinarySearch(knots, (pt, 0), Comparer<(double, double)>.Create((a, b) => a.Item1.CompareTo(b.Item1)))
        );

        if (upperIdx < 0)
        {
            upperIdx = ~upperIdx;
        }

        if (upperIdx == 0)
            upperIdx = 1;

        int lowerIdx = upperIdx - 1;

        var line = Point.FromTuple(knots[lowerIdx]).LineTo(Point.FromTuple(knots[upperIdx]));
        return line.At(pt).AsTuple();
    }

    public static void VerifyGammaSplines(double gamma, (double, double)[] data, (double, double)[] pts)
    {
        Console.WriteLine(string.Join(", ", pts));
        foreach (var (x, y) in data)
        {
            var pred = SplineInterpolate(x, pts);
            if (Math.Abs(pred.Item2 - y) > gamma)
            {
                throw new Exception($"Prediction of {pred.Item2} was not within gamma ({gamma}) of true value {y}");
            }
        }
    }

    public static void VerifyGammaSplinesCast(double gamma, (double, double)[] data, (double, double)[] pts)
    {
        Console.WriteLine(string.Join(", ", pts));
        foreach (var (x, y) in data)
        {
            double xCast = (ulong)x;
            var pred = SplineInterpolate(xCast, pts);
            double predCast = (ulong)pred.Item2;
            if (Math.Abs(predCast - y) > gamma)
            {
                throw new Exception($"Prediction of {predCast} was not within gamma ({gamma}) of true value {y}");
            }
        }
    }
}