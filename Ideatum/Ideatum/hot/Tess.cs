using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Typography.OpenFont;
using LibTessDotNet;
using PixelFarm.VectorMath;
using Typography.OpenFont.Contours;

namespace RENAME_ME;
public static class FontTriangulator
{
    public static Typeface LoadFont(string fontPath)
    {
        using var fs = File.OpenRead(fontPath);
        var reader = new OpenFontReader();
        return reader.Read(fs);
    }

    public static IEnumerable<Vector2> Triangulate(this Typeface typeface, char character, float scale=1.0f)
    {
        var segs = FontToVerts.Font2Lines(character + "");
        // 2. Get the glyph
        ushort glyphIndex = typeface.GetGlyphIndex(character);

        // 3. Build contours from the glyph outline
        var builder = new GlyphOutlineBuilder(typeface);
        var collector = new ContourCollector(scale);
        builder.BuildFromGlyphIndex(glyphIndex, 800); // 20 = point size (arbitrary for geometry)
        builder.ReadShapes(collector);

        // 4. Tessellate with LibTessDotNet (handles winding/holes!)
        var tess = new Tess();
        foreach (var pts in segs)
        {
            var verts = pts.Select(p => new ContourVertex
            {
                Position = new Vec3 { X = (float)p.X, Y = (float)p.Y, Z = 0 }
            }).ToArray();
            tess.AddContour(verts, ContourOrientation.Original);
        }

        // WINDING_ODD or WINDING_NONZERO — both handle holes in fonts
        tess.Tessellate(WindingRule.EvenOdd, ElementType.Polygons, 3);

        // 5. Extract triangles
        var minY = float.MaxValue;
        var maxY = float.MinValue;
        var minX = float.MaxValue;
        var maxX = float.MinValue;
        for (int i = 0; i < tess.ElementCount; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                int idx = tess.Elements[i * 3 + j];
                var v = tess.Vertices[idx].Position;
                if (v.Y < minY) minY = v.Y;
                if (v.Y > maxY) maxY = v.Y;
                if (v.X < minY) minX = v.X;
                if (v.X > maxY) maxX = v.X;
            }
        }

        var flipY = maxY - minY;
        float xshift = minX < 0 ? -minX : 0;
        float yshift = minY < 0 ? -minY : 0;
        for (int i = 0; i < tess.ElementCount; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                int idx = tess.Elements[i * 3 + j];
                var v = tess.Vertices[idx].Position;
                //Console.Write(Math.Round(v.Y,1)+" ");
                yield return (new Vector2(v.X+xshift, v.Y+minY /*, v.Z*/));
                //yield return (new Vector2(v.X+xshift, flipY-v.Y+minY /*, v.Z*/));
            }
        }
    }
    public static IEnumerable<Vector3> Triangulate2(this Typeface typeface, char character, float scale=1.0f)
    {
        // 2. Get the glyph
        ushort glyphIndex = typeface.GetGlyphIndex(character);

        // 3. Build contours from the glyph outline
        var builder = new GlyphOutlineBuilder(typeface);
        var collector = new ContourCollector(scale);
        builder.BuildFromGlyphIndex(glyphIndex, 400); // 20 = point size (arbitrary for geometry)
        builder.ReadShapes(collector);

        // 4. Tessellate with LibTessDotNet (handles winding/holes!)
        var tess = new Tess();
        foreach (var contour in collector.Contours)
        {
            var verts = contour.Select(p => new ContourVertex
            {
                Position = new Vec3 { X = (float)p.X, Y = (float)p.Y, Z = 0 }
            }).ToArray();
            tess.AddContour(verts, ContourOrientation.Original);
        }

        // WINDING_ODD or WINDING_NONZERO — both handle holes in fonts
        tess.Tessellate(WindingRule.EvenOdd, ElementType.Polygons, 3);

        // 5. Extract triangles
        var minY = float.MaxValue;
        var maxY = float.MinValue;
        var minX = float.MaxValue;
        var maxX = float.MinValue;
        for (int i = 0; i < tess.ElementCount; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                int idx = tess.Elements[i * 3 + j];
                var v = tess.Vertices[idx].Position;
                if (v.Y < minY) minY = v.Y;
                if (v.Y > maxY) maxY = v.Y;
                if (v.X < minY) minX = v.X;
                if (v.X > maxY) maxX = v.X;
            }
        }

        var flipY = maxY - minY;
        float xshift = minX < 0 ? -minX : 0;
        float yshift = minY < 0 ? -minY : 0;
        for (int i = 0; i < tess.ElementCount; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                int idx = tess.Elements[i * 3 + j];
                var v = tess.Vertices[idx].Position;
                //Console.Write(Math.Round(v.Y,1)+" ");
                yield return (new Vector3(v.X+xshift, flipY-v.Y+minY, v.Z));
            }
        }
    }
}
public class ContourCollector : IGlyphTranslator
{
    public List<List<Vector2>> Contours { get; } = new();
    private List<Vector2> _current = new();
    private readonly float _scale;
    private Vector2 _lastPoint;

    public ContourCollector(float scale) => _scale = scale;

    public void BeginRead(int contourCount) { }
    public void EndRead() { }

    public void MoveTo(float x, float y)
    {
        if (_current.Count > 0) Contours.Add(_current);
        _current = new List<Vector2>();
        _lastPoint = new Vector2(x * _scale, y * _scale);
        _current.Add(_lastPoint);
    }

    public void LineTo(float x, float y)
    {
        _lastPoint = new Vector2(x * _scale, y * _scale);
        _current.Add(_lastPoint);
    }

    public void Curve3(float x1, float y1, float x2, float y2)
    {
        // Quadratic bezier — subdivide it
        var p0 = _lastPoint;
        var p1 = new Vector2(x1 * _scale, y1 * _scale);
        var p2 = new Vector2(x2 * _scale, y2 * _scale);
        SubdivideQuadratic(p0, p1, p2, 2);
        _lastPoint = p2;
    }

    public void Curve4(float x1, float y1, float x2, float y2, float x3, float y3)
    {
        // Cubic bezier — subdivide it
        var p0 = _lastPoint;
        var p1 = new Vector2(x1 * _scale, y1 * _scale);
        var p2 = new Vector2(x2 * _scale, y2 * _scale);
        var p3 = new Vector2(x3 * _scale, y3 * _scale);
        SubdivideCubic(p0, p1, p2, p3, 2);
        _lastPoint = p3;
    }

    public void CloseContour()
    {
        if (_current.Count > 0)
        {
            if (_current[0] != _current[^1])
                _current.Add(_current[0]); // close the loop
            Contours.Add(_current);
            _current = new List<Vector2>();
        }
    }

    private void SubdivideQuadratic(Vector2 p0, Vector2 p1, Vector2 p2, int steps)
    {
        for (int i = 1; i <= steps; i++)
        {
            float t = i / (float)steps;
            float u = 1 - t;
            var pt = u * u * p0 + 2 * u * t * p1 + t * t * p2;
            _current.Add(pt);
        }
    }

    private void SubdivideCubic(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, int steps)
    {
        for (int i = 1; i <= steps; i++)
        {
            float t = i / (float)steps;
            float u = 1 - t;
            var pt = u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
            _current.Add(pt);
        }
    }
}