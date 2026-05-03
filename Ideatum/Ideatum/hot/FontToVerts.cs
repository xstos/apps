using System;
using System.Collections.Generic;
using System.Linq;
using Ideatum;
using VectSharp;
// using System.Drawing;
// using System.Drawing.Drawing2D;
// using System.Linq;
// using TriangleNet;
// using TriangleNet.Geometry;
// using TriangleNet.Meshing;
// using TriangleNet.Meshing.Algorithm;
// using Point = System.Drawing.Point;
// using Rectangle = TriangleNet.Geometry.Rectangle;
using TPointF = (double X,double Y);
using TLineF = ((double X,double Y) a, (double X,double Y) b);
namespace RENAME_ME;

internal static class VSExt
{
    public static TPointF ToPt(this Segment s)
    {
        return ((float)s.Point.X, (float)s.Point.Y);
    }
}
internal static class FontToVerts
{
    internal static IEnumerable<TPointF[]> Font2Lines(string c)
    {
        FontFamily family = FontFamily.ResolveFontFamily(FontFamily.StandardFontFamilies.CourierBold);
        Font font = new Font(family, 40);
        // Original GraphicsPath containing some text.
        GraphicsPath path = new GraphicsPath().AddText(0, 0, c, font);
        var p = path.Discretise(50);
        var ret = new List<Segment>();
        foreach (var s in p.Segments)
        {
            if (s.Type == SegmentType.Close)
            {
                ret.Add(ret[0]);
                yield return ret.Select(s2 => (s2.Point.X, s2.Point.Y)).ToArray();
                ret.Clear();
            }
            else
            {
                ret.Add(s);
            }
            
        }
    }
    internal static IEnumerable<TPointF> Test(string txt)
    {
        FontFamily family = FontFamily.ResolveFontFamily(FontFamily.StandardFontFamilies.CourierBold);
        Font font = new Font(family, 400);
        // Original GraphicsPath containing some text.
        GraphicsPath path = new GraphicsPath().AddText(0, 0, txt, font);
        
        List<GraphicsPath> triangles = path.Triangulate(2, false).ToList();
        foreach (var t in triangles)
        {
            
            var g = t.Segments;
            yield return g[0].ToPt();
            yield return g[1].ToPt();
            yield return g[2].ToPt();
            continue;
            for (int i = 0; i < t.Segments.Count-1; i++)
            {
                var  s = t.Segments[i];
                yield return ((float)s.Point.X, (float)s.Point.Y);
                Console.Write("("+s.Point.X+","+s.Point.Y+") ");
                
            }
            //Console.WriteLine("");
        }
        yield break;
//         var gp = new GraphicsPath();
//         var emSize = 1000f;
//         var f = new Font("Consolas", emSize);
//         gp.AddString(txt, f.FontFamily, 0, emSize, new Point(0,0), StringFormat.GenericDefault);
//         gp.Flatten(new Matrix(),0.5f);
//         
//         var triangulator = new Dwyer();
//
//         using var iterator = new GraphicsPathIterator(gp);
//         // Loop through each subpath in the GraphicsPath
//         var tris = new List<IMesh>();
//         var totalBounds = new Rectangle();
//         for (int i = 0; i < iterator.SubpathCount; i++)
//         {
//             // Get the start and end indices of the next subpath
//             bool isClosed;
//             int startIndex, endIndex;
//             iterator.NextSubpath(out startIndex, out endIndex, out isClosed);
//  
//             // Copy the points from this specific subpath
//             var points = new PointF[endIndex - startIndex + 1];
//             var types = new byte[endIndex - startIndex + 1];
//             iterator.CopyData(ref points, ref types, startIndex, endIndex);
// //s
//             var vertices = points.Select(p=>new Vertex(p.X,p.Y)).ToList();
//             var mesh = triangulator.Triangulate(vertices, new Configuration());
//             foreach (var tri in mesh.Triangles) //
//             {
//                 for (int j = 0; j < 3; j++) //
//                 {
//                     var v = tri.GetVertex(j);
//                     yield return ((float)v.X, (float)v.Y);
//                     Console.Write(v.X+","+v.Y+" ");
//                 }
//                 Console.WriteLine("");
//                 
//             }
//             Console.WriteLine("LR: "+mesh.Bounds.Left+" "+mesh.Bounds.Right+ " TB:" +mesh.Bounds.Top+" "+mesh.Bounds.Bottom);
//         }
//         var tx = totalBounds.Left;
//         var ty = totalBounds.Top;
//         Vertex Translate(Vertex v)
//         {
//             return new Vertex(v.X - tx, v.Y - ty);
//         }
        
    }
}

public struct Point2(float x, float y)
{
    public float X = x;
    public float Y = y;
}

public class Colour
{
    public float R { get; set; }
    public float G { get; set; }
    public float B { get; set; }

    public Colour(float r, float g, float b)
    {
        this.R = r;
        this.G = g;
        this.B = b;
    }
}

public class TriangleRenderer
{
    // Returns double the signed area but that's fine
    float EdgeFunction(Point2 a, Point2 b, Point2 c)
    {
        return (b.X - a.X) * (c.Y - a.Y) - (b.Y - a.Y) * (c.X - a.X);
    }

    // Create our colours
    Colour colourA = new Colour(255, 0, 0); // Red
    Colour colourB = new Colour(0, 255, 0); // Green
    Colour colourC = new Colour(0, 0, 255); // Blue

    public void DrawTriangle(Point2 A, Point2 B, Point2 C)
    {
        // Calculate the edge function for the whole triangle (ABC)
        float ABC = EdgeFunction(A, B, C);

        // Our nifty trick: Don't bother drawing the triangle if it's back facing
        if (ABC < 0)
        {
            return;
        }

        // Initialize our point
        Point2 P = new Point2(0, 0);

        // Get the bounding box of the triangle
        float minX = Math.Min(A.X, Math.Min(B.X, C.X));
        float minY = Math.Min(A.Y, Math.Min(B.Y, C.Y));
        float maxX = Math.Max(A.X, Math.Max(B.X, C.X));
        float maxY = Math.Max(A.Y, Math.Max(B.Y, C.Y));

        // Loop through all the pixels of the bounding box
        for (P.Y = minY; P.Y < maxY; P.Y++)
        for (P.X = minX; P.X < maxX; P.X++)
        {
            // Calculate our edge functions
            float ABP = EdgeFunction(A, B, P);
            float BCP = EdgeFunction(B, C, P);
            float CAP = EdgeFunction(C, A, P);

            // Normalise the edge functions by dividing by the total area to get the barycentric coordinates
            float weightA = BCP / ABC;
            float weightB = CAP / ABC;
            float weightC = ABP / ABC;

            // If all the edge functions are positive, the point is inside the triangle
            if (!(ABP >= 0) || !(BCP >= 0) || !(CAP >= 0)) continue;
            // Interpolate the colours at point P
            float r = colourA.R * weightA + colourB.R * weightB + colourC.R * weightC;
            float g = colourA.G * weightA + colourB.G * weightB + colourC.G * weightC;
            float b = colourA.B * weightA + colourB.B * weightB + colourC.B * weightC;
            Colour colourP = new Colour(r, g, b);

            // Draw the pixel
            SetPixel((int)P.X, (int)P.Y, colourP);
        }
    }

    void SetPixel(int x, int y, Colour colour)
    {
    }
}