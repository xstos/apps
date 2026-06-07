using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using V = System.Numerics.Vector;

namespace RENAME_ME;
internal struct Glyph
{
    internal Rect Bounds;
    internal Polygon[] Shapes;
    
    internal Glyph Rotate(double angle)
    {
        /*
        var angleDegrees = 45;
        double angleRad = angleDegrees * Math.PI / 180.0;
        double cos = Math.Cos(angleRad);
        double sin = Math.Sin(angleRad);
        var centerX = p.Bounds.Left * 0.5 + p.Bounds.Right * 0.5;
        var centerY = p.Bounds.Top * 0.5 + p.Bounds.Bottom * 0.5;
        for (int i = 0; i < p.x.Length; i++)
        {
            // Translate to origin
            double dx = polyX[i] - centerX;
            double dy = polyY[i] - centerY;

            // Rotate
            double newX = dx * cos - dy * sin;
            double newY = dx * sin + dy * cos;

            // Translate back
            polyX[i] = newX + centerX;
            polyY[i] = newY + centerY;
        }
        */
        return this;
    }
}

internal static class GExt
{
    internal static (int glyphWidth, int glyphHeight) Size(this Glyph g)
    {
        return (
            (int)Math.Round(g.Bounds.Width, MidpointRounding.AwayFromZero),
            (int)Math.Round(g.Bounds.Height, MidpointRounding.AwayFromZero)
        );
    }
}
internal struct Polygon
{
    internal double[] x;
    internal double[] y;
    internal Rect Bounds;

    internal void Shift(double xshift, double yshift)
    {
        for (int i = 0; i < x.Length; i++)
        {
            x[i] += xshift;
            y[i] += yshift;
        }
    }

    internal static Polygon New(IEnumerable<double> poly)
    {
        var ret = new Polygon();
        var xs = new List<double>();
        var ys = new List<double>();
        double minx=double.MaxValue, miny=double.MaxValue, maxx=double.MinValue, maxy=double.MinValue, offsetX = 0, offsetY = 0;
        foreach (var d in poly.Chunk(2))
        {
            var x = d[0];
            var y = d[1];
            minx = x < minx ? x : minx;
            miny = y < miny ? y : miny;
            maxx = x > maxx ? x : maxx;
            maxy = y > maxy ? y : maxy;
        }

        offsetX = minx < 0 ? -minx : 0;
        offsetY = miny < 0 ? -miny : 0;
        
        foreach (var d in poly.Chunk(2))
        {
            var x = d[0];
            var y = d[1];
            xs.Add(x+offsetX);
            ys.Add(y+offsetY);
        }
        
        ret.x = xs.ToArray();
        ret.y = ys.ToArray();
        ret.Bounds = new Rect(new Point(minx, miny), new Point(maxx, maxy));
        ret.Bounds.Offset(offsetX,offsetY);
        
        return ret;
    }
}