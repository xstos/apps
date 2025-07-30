using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

public static class DataSources
{

    public static List<(double, double)> SinData()
    {
        var data = new List<(double, double)>();

        for (int i = 0; i < 1000; i++)
        {
            double x = i / 1000.0 * 7.0;
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
            double x = i / 1000.0;
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
            double x = (i / 1000.0) * Math.Pow(2.0, 60);
            double y = i;
            data.Add((x, y));
        }

        return data;
    }

    public static List<(double, double)> OsmData()
    {
        return OSM_DATA.Data.Select(x => ((double)x.Item1, (double)x.Item2)).ToList();
    }

    public static List<(double, double)> FbData()
    {
        return FB_DATA.Data.Select(x => ((double)x.Item1, (double)x.Item2)).ToList();
    }
}

public struct Point
{
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y)
    {
        X = x;
        Y = y;
    }

    public static Point FromTuple((double, double) pt)
    {
        return new Point(pt.Item1, pt.Item2);
    }

    public (double, double) AsTuple()
    {
        return (X, Y);
    }

    public double SlopeTo(Point other)
    {
        return (Y - other.Y) / (X - other.X);
    }

    public Line LineTo(Point other)
    {
        double a = SlopeTo(other);
        double b = -a * X + Y;
        return new Line(a, b);
    }

    public bool Above(Line line)
    {
        return Y > line.At(X).Y;
    }

    public bool Below(Line line)
    {
        return Y < line.At(X).Y;
    }

    public Point UpperBound(double gamma)
    {
        Debug.Assert(!(Math.Abs(Y - (Y + gamma)) < double.Epsilon), 
            $"Gamma value of {gamma} and encountered Y value of {Y} won't work in 64-bit!");
        return new Point(X, Y + gamma);
    }

    public Point LowerBound(double gamma)
    {
        Debug.Assert(!(Math.Abs(Y - (Y - gamma)) < double.Epsilon), 
            $"Gamma value of {gamma} and encountered Y value of {Y} won't work in 64-bit!");
        return new Point(X, Y - gamma);
    }
}

public struct Line
{
    readonly double _a; // slope
    readonly double _b; // intercept

    public Line(double slope, double intercept)
    {
        _a = slope;
        _b = intercept;
    }

    public (double, double) AsTuple()
    {
        return (_a, _b);
    }

    public static Point Intersection(Line l1, Line l2)
    {
        var (a, c) = l1.AsTuple();
        var (b, d) = l2.AsTuple();
        
        double denom = a - b;
        double xVal = (d - c) / denom;
        double yVal = (a * d - b * c) / denom;

        return new Point(xVal, yVal);
    }

    public static double AverageSlope(Line l1, Line l2)
    {
        return (Math.Min(l1._a, l2._a) + Math.Max(l1._a, l2._a)) / 2.0;
    }

    public double Slope()
    {
        return _a;
    }

    public Point At(double x)
    {
        return new Point(x, _a * x + _b);
    }
}

public struct Segment
{
    public double Start { get; }
    public double Stop { get; }
    public double Slope { get; }
    public double Intercept { get; }

    public Segment(double start, double stop, double slope, double intercept)
    {
        Start = start;
        Stop = stop;
        Slope = slope;
        Intercept = intercept;
    }
}

public class GreedyPLR
{
    enum GreedyState
    {
        Need2,
        Need1,
        Ready
    }

    GreedyState _state;
    readonly double _gamma;
    Point? _s0;
    Point? _s1;
    Point? _sint;
    Point? _sLast;
    Line? _rhoLower;
    Line? _rhoUpper;

    public GreedyPLR(double gamma)
    {
        _state = GreedyState.Need2;
        _gamma = gamma;
        _s0 = null;
        _s1 = null;
        _sint = null;
        _sLast = null;
        _rhoLower = null;
        _rhoUpper = null;
    }

    void Setup()
    {
        double gamma = _gamma;
        Point s0 = _s0.Value;
        Point s1 = _s1.Value;

        _rhoLower = s0.UpperBound(gamma).LineTo(s1.LowerBound(gamma));
        _rhoUpper = s0.LowerBound(gamma).LineTo(s1.UpperBound(gamma));

        _sint = Line.Intersection(_rhoLower.Value, _rhoUpper.Value);
    }

    Segment CurrentSegment(double end)
    {
        if (_state != GreedyState.Ready)
            throw new InvalidOperationException("State must be Ready");

        double segmentStart = _s0.Value.X;
        double segmentStop = end;

        double avgSlope = Line.AverageSlope(_rhoLower.Value, _rhoUpper.Value);

        (double sintX, double sintY) = _sint.Value.AsTuple();
        double intercept = -avgSlope * sintX + sintY;
        return new Segment(segmentStart, segmentStop, avgSlope, intercept);
    }

    Segment? ProcessPoint(Point pt)
    {
        if (_state != GreedyState.Ready)
            throw new InvalidOperationException("State must be Ready");

        if (!(pt.Above(_rhoLower.Value) && pt.Below(_rhoUpper.Value)))
        {
            Segment currentSegment = CurrentSegment(pt.X);

            _s0 = pt;
            _state = GreedyState.Need1;
            return currentSegment;
        }

        Point sUpper = pt.UpperBound(_gamma);
        Point sLower = pt.LowerBound(_gamma);
        if (sUpper.Below(_rhoUpper.Value))
        {
            _rhoUpper = _sint.Value.LineTo(sUpper);
        }

        if (sLower.Above(_rhoLower.Value))
        {
            _rhoLower = _sint.Value.LineTo(sLower);
        }

        return null;
    }

    public Segment? Process(double x, double y)
    {
        Point pt = new Point(x, y);
        _sLast = pt;

        Segment? returnedSegment = null;

        GreedyState Need2()
        {
            _s0 = pt;
            return GreedyState.Need1;
        }

        GreedyState Need1()
        {
            _s1 = pt;
            Setup();
            return GreedyState.Ready;
        }

        GreedyState Ready()
        {
            returnedSegment = ProcessPoint(pt);
            return returnedSegment.HasValue ? GreedyState.Need1 : GreedyState.Ready;
        }
        GreedyState newState = _state switch
        {
            GreedyState.Need2 =>Need2(),
            GreedyState.Need1 => Need1(),
            GreedyState.Ready =>Ready(),
            _ => throw new InvalidOperationException("Invalid state")
        };

        _state = newState;
        return returnedSegment;
    }

    public Segment? Finish()
    {
        Segment Need1()
        {
            (double x, double y) = _s0.Value.AsTuple();
            return new Segment(x, double.MaxValue, 0.0, y);
        }
        return _state switch
        {
            GreedyState.Need2 => null,
            GreedyState.Need1 => Need1(),
            GreedyState.Ready => CurrentSegment(double.MaxValue),
            _ => throw new InvalidOperationException("Invalid state")
        };
    }
}
