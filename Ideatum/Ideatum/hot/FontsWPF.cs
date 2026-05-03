using System;
using System.Windows;
using System.Windows.Media;

namespace RENAME_ME;

public class FontsWPF
{
    public static Geometry GetCharacterGeometry(char character, double fontSize)
    {
        // Load the font file
        var typeface = new Typeface(new FontFamily("Consolas"),
            FontStyles.Normal,
            FontWeights.Normal,
            FontStretches.Normal);

        // Create formatted text for the specific character
        var formattedText = new FormattedText(
            character.ToString(),
            System.Globalization.CultureInfo.CurrentCulture,
            FlowDirection.LeftToRight,
            typeface,
            fontSize,
            Brushes.White, // Brush doesn't ma tter for geometry extraction
            1.0);

        // Build the geometry object
        Geometry textGeometry = formattedText.BuildGeometry(new Point(0, 0));
        return textGeometry;
    }

    public static void Usage()
    {
        Geometry geometry = GetCharacterGeometry('A', 100);

        // Now you can inspect the geometry
        // For a simple path, you can use:
        if (geometry is PathGeometry pathGeometry)
        {
            foreach (var figure in pathGeometry.Figures)
            {
                foreach (var segment in figure.Segments)
                {
                    switch (segment)
                    {
                        case LineSegment line:
                            // Extract line information
                            Console.WriteLine($"Line to: {line.Point}");
                            break;
                        case BezierSegment bezier:
                            // Extract curve information (Cubic Bezier curve: control points and end point)
                            Console.WriteLine($"Curve to: {bezier.Point3} via {bezier.Point1} and {bezier.Point2}");
                            break;
                        // Other segment types are possible
                    }
                }
            }
        }
    }
}