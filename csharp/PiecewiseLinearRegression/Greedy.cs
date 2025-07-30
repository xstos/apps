using System;

namespace PLR
{
    public enum GreedyState
    {
        Need2,
        Need1,
        Ready
    }

    public struct Point
    {
        public double x { get; }
        public double y { get; }

        public Point(double x, double y)
        {
            this.x = x;
            this.y = y;
        }

        public (double, double) AsTuple() => (x, y);

        public Point UpperBound(double gamma) => new Point(x, y + gamma);
        public Point LowerBound(double gamma) => new Point(x, y - gamma);

        public bool Above(Line line) => y > line.slope * x + line.intercept;
        public bool Below(Line line) => y < line.slope * x + line.intercept;
    }

    public struct Line
    {
        public double slope { get; }
        public double intercept { get; }

        public Line(double slope, double intercept)
        {
            this.slope = slope;
            this.intercept = intercept;
        }

        public static Line LineTo(Point from, Point to)
        {
            double slope = (to.y - from.y) / (to.x - from.x);
            double intercept = from.y - slope * from.x;
            return new Line(slope, intercept);
        }

        public static Point Intersection(Line line1, Line line2)
        {
            if (Math.Abs(line1.slope - line2.slope) < double.Epsilon)
            {
                // Parallel lines - return midpoint or handle differently
                throw new InvalidOperationException("Lines are parallel");
            }

            double x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
            double y = line1.slope * x + line1.intercept;
            return new Point(x, y);
        }

        public static double AverageSlope(Line line1, Line line2)
        {
            return (line1.slope + line2.slope) / 2.0;
        }
    }

    public struct Segment
    {
        public double start { get; }
        public double stop { get; }
        public double slope { get; }
        public double intercept { get; }

        public Segment(double start, double stop, double slope, double intercept)
        {
            this.start = start;
            this.stop = stop;
            this.slope = slope;
            this.intercept = intercept;
        }
    }

    public class GreedyPLR
    {
        GreedyState state;
        readonly double gamma;
        Point? s0;
        Point? s1;
        Point? sint;
        Point? sLast;
        Line? rhoLower;
        Line? rhoUpper;

        public GreedyPLR(double gamma)
        {
            state = GreedyState.Need2;
            this.gamma = gamma;
            s0 = null;
            s1 = null;
            sint = null;
            sLast = null;
            rhoLower = null;
            rhoUpper = null;
        }

        void Setup()
        {
            // we have two points, initialize rho lower and rho upper.
            double gamma = this.gamma;
            Point s0 = this.s0.Value;
            Point s1 = this.s1.Value;

            rhoLower = Line.LineTo(s0.UpperBound(gamma), s1.LowerBound(gamma));
            rhoUpper = Line.LineTo(s0.LowerBound(gamma), s1.UpperBound(gamma));

            sint = Line.Intersection(rhoLower.Value, rhoUpper.Value);
        }

        Segment CurrentSegment(double end)
        {
            if (state != GreedyState.Ready)
                throw new InvalidOperationException("State must be Ready");

            double segmentStart = s0.Value.x;
            double segmentStop = end;

            double avgSlope = Line.AverageSlope(rhoLower.Value, rhoUpper.Value);

            Point sintValue = sint.Value;
            double intercept = -avgSlope * sintValue.x + sintValue.y;
            return new Segment(segmentStart, segmentStop, avgSlope, intercept);
        }

        Segment? ProcessPoint(Point pt)
        {
            if (state != GreedyState.Ready)
                throw new InvalidOperationException("State must be Ready");

            if (!(pt.Above(rhoLower.Value) && pt.Below(rhoUpper.Value)))
            {
                // we cannot adjust either extreme slope to fit this point, we have to
                // start a new segment.
                Segment currentSegment = CurrentSegment(pt.x);

                s0 = pt;
                state = GreedyState.Need1;
                return currentSegment;
            }

            // otherwise, we can adjust the extreme slopes to fit the point.
            Point sUpper = pt.UpperBound(gamma);
            Point sLower = pt.LowerBound(gamma);
            if (sUpper.Below(rhoUpper.Value))
            {
                rhoUpper = Line.LineTo(sint.Value, sUpper);
            }

            if (sLower.Above(rhoLower.Value))
            {
                rhoLower = Line.LineTo(sint.Value, sLower);
            }

            return null;
        }

        public Segment? Process(double x, double y)
        {
            Point pt = new Point(x, y);
            sLast = pt;

            Segment? returnedSegment = null;

            GreedyState Need2()
            {
                s0 = pt;
                return GreedyState.Need1;
            }

            GreedyState Need1()
            {
                s1 = pt;
                Setup();
                return GreedyState.Ready;
            }

            GreedyState Ready()
            {
                returnedSegment = ProcessPoint(pt);
                return returnedSegment.HasValue ? GreedyState.Need1 : GreedyState.Ready;
            }
            GreedyState newState = state switch
            {
                GreedyState.Need2 =>Need2(),
                GreedyState.Need1 => Need1(),
                GreedyState.Ready =>Ready(),
                _ => throw new InvalidOperationException("Invalid state")
            };

            state = newState;
            return returnedSegment;
        }

        public Segment? Finish()
        {
            Segment Need1()
            {
                var s0Value = s0.Value;
                return new Segment(
                    start: s0Value.x,
                    stop: double.MaxValue,
                    slope: 0.0,
                    intercept: s0Value.y
                );
            }
            return state switch
            {
                GreedyState.Need2 => null,
                GreedyState.Need1 => Need1(),
                GreedyState.Ready => CurrentSegment(double.MaxValue),
                _ => throw new InvalidOperationException("Invalid state")
            };
        }
    }
}