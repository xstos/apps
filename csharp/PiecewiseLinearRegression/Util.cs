using System.Diagnostics;

public struct Point
{
    public double x;
    public double y;

    public Point(double x, double y)
    {
        this.x = x;
        this.y = y;
    }

    public static Point FromTuple((double, double) pt)
    {
        return new Point(pt.Item1, pt.Item2);
    }

    public (double, double) AsTuple()
    {
        return (x, y);
    }

    public double SlopeTo(Point other)
    {
        // handle floating point precision issues when both x coords are very
        // large (or very small, although this is uncommon) numbers
        if (ApproxRelativeEq(this.x, other.x))
        {
            // In C#, we don't have arbitrary precision floats built-in, but we can use decimal for some cases
            // Note: decimal has higher precision but smaller range than double
            decimal x1 = (decimal)this.x;
            decimal y1 = (decimal)this.y;
            decimal x2 = (decimal)other.x;
            decimal y2 = (decimal)other.y;

            decimal res = (y1 - y2) / (x1 - x2);
            return (double)res;
        }

        return (this.y - other.y) / (this.x - other.x);
    }

    public Line LineTo(Point other)
    {
        double a = this.SlopeTo(other);

        Debug.Assert(!double.IsNaN(a), $"slope from {this} to {other} was NaN");

        double b = -a * this.x + this.y;
        return new Line(a, b);
    }

    public bool Above(Line line)
    {
        return this.y > line.At(this.x).y;
    }

    public bool Below(Line line)
    {
        return this.y < line.At(this.x).y;
    }

    public Point UpperBound(double gamma)
    {
        // check float precision
        Debug.Assert(
            !ApproxRelativeEq(this.y, this.y + gamma),
            $"Gamma value of {gamma} and encountered Y value of {this.y} won't work in 64-bit!"
        );
        return new Point(this.x, this.y + gamma);
    }

    public Point LowerBound(double gamma)
    {
        // check float precision
        Debug.Assert(
            !ApproxRelativeEq(this.y, this.y - gamma),
            $"Gamma value of {gamma} and encountered Y value of {this.y} won't work in 64-bit!"
        );
        return new Point(this.x, this.y - gamma);
    }

    public override string ToString()
    {
        return $"Point({x}, {y})";
    }

    private static bool ApproxRelativeEq(double a, double b, double epsilon = 1e-10)
    {
        if (a == b) return true;
        double diff = Math.Abs(a - b);
        double max = Math.Max(Math.Abs(a), Math.Abs(b));
        return diff <= epsilon * max;
    }
}

public struct Segment
{
    public double start;
    public double stop;
    public double slope;
    public double intercept;

    public Segment(double start, double stop, double slope, double intercept)
    {
        this.start = start;
        this.stop = stop;
        this.slope = slope;
        this.intercept = intercept;
    }
}

public struct Line
{
    private double a;
    private double b;

    public Line(double slope, double intercept)
    {
        this.a = slope;
        this.b = intercept;
    }

    public (double, double) AsTuple()
    {
        return (a, b);
    }

    public static Point Intersection(Line l1, Line l2)
    {
        var (a, c) = l1.AsTuple();
        var (b, d) = l2.AsTuple();

        // handle floating point precision issues when both slopes are very
        // small numbers
        if (ApproxRelativeEq(a, b))
        {
            // Using decimal for higher precision
            decimal a_f = (decimal)a;
            decimal b_f = (decimal)b;
            decimal c_f = (decimal)c;
            decimal d_f = (decimal)d;

            decimal denom_f = a_f - b_f;

            double x_val = (double)((d_f - c_f) / denom_f);
            double y_val = (double)((a_f * d_f - b_f * c_f) / denom_f);

            return new Point(x_val, y_val);
        }
        else
        {

            double denom = a - b;
            double x_val = (d - c) / denom;
            double y_val = (a * d - b * c) / denom;

            return new Point(x_val, y_val);
        }
    }
    public static Line LineTo(Point from, Point to)
    {
        double slope = (to.y - from.y) / (to.x - from.x);
        double intercept = from.y - slope * from.x;
        return new Line(slope, intercept);
    }
    public static double AverageSlope(Line l1, Line l2)
    {
        if (ApproxRelativeEq(l1.a, l2.a))
        {
            // use higher precision
            decimal a1 = (decimal)l1.a;
            decimal a2 = (decimal)l2.a;
            decimal avg = (a1 + a2) / 2m;
            return (double)avg;
        }

        // min + max to avoid precision loss
        return (Math.Min(l1.a, l2.a) + Math.Max(l1.a, l2.a)) / 2.0;
    }

    public double Slope()
    {
        return a;
    }

    public Point At(double x)
    {
        return new Point(x, a * x + b);
    }

    private static bool ApproxRelativeEq(double a, double b, double epsilon = 1e-10)
    {
        if (a == b) return true;
        double diff = Math.Abs(a - b);
        double max = Math.Max(Math.Abs(a), Math.Abs(b));
        return diff <= epsilon * max;
    }
}

// Test class (equivalent to the Rust test module)
public static class LineTests
{
    public static void TestSlope()
    {
        var p1 = new Point(1.0, 3.0);
        var p2 = new Point(5.0, 6.0);

        Debug.Assert(ApproxRelativeEq(p1.SlopeTo(p2), p2.SlopeTo(p1)));
        Debug.Assert(ApproxRelativeEq(p1.SlopeTo(p2), 0.75));
    }

    public static void TestLine()
    {
        var p1 = new Point(1.0, 3.0);
        var p2 = new Point(2.0, 6.0);

        var line1 = p1.LineTo(p2);
        var line2 = p2.LineTo(p1);

        Debug.Assert(ApproxRelativeEq(line1.Slope(), line2.Slope()));
        Debug.Assert(ApproxRelativeEq(line1.At(0).y, line2.At(0).y));

        Debug.Assert(ApproxRelativeEq(line1.Slope(), 3.0));
        Debug.Assert(ApproxRelativeEq(line1.At(0).y, 0.0));
    }

    public static void TestIntersection()
    {
        var p1 = new Point(1.0, 3.0);
        var p2 = new Point(2.0, 6.0);
        var line1 = p1.LineTo(p2);

        var p3 = new Point(8.0, -100.0);
        var line2 = p1.LineTo(p3);

        var intersection = Line.Intersection(line1, line2);

        Debug.Assert(ApproxRelativeEq(intersection.x, p1.x));
        Debug.Assert(ApproxRelativeEq(intersection.y, p1.y));
    }

    public static void TestAboveBelow()
    {
        var p1 = new Point(1.0, 3.0);
        var p2 = new Point(2.0, 6.0);
        var line1 = p1.LineTo(p2);

        var above = new Point(1.5, 10.0);
        var below = new Point(1.5, -10.0);

        Debug.Assert(above.Above(line1));
        Debug.Assert(below.Below(line1));
    }

    private static bool ApproxRelativeEq(double a, double b, double epsilon = 1e-10)
    {
        if (a == b) return true;
        double diff = Math.Abs(a - b);
        double max = Math.Max(Math.Abs(a), Math.Abs(b));
        return diff <= epsilon * max;
    }

    public static void RunAllTests()
    {
        TestSlope();
        TestLine();
        TestIntersection();
        TestAboveBelow();
        Console.WriteLine("All tests passed!");
    }
}