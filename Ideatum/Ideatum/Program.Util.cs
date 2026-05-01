using System;
using System.Collections.Generic;
using System.Linq;
using ColorMine.ColorSpaces;

namespace Ideatum;
public class Ref<T>
{
    public T Value;
    public override string ToString() => Value.ToString();
}

public static partial class I
{
    public static Ref<T> Ref<T>(this T item) => new() { Value = item };

    public static IEnumerable<int> ColorWheel(int numHues)
    {
        var colors = GetHues(numHues).Take(numHues).ToArray();
        while (true)
        {
            for (int i = 0; i < numHues; i++)
            {
                yield return colors[i];
            }
        }
    }

    static IEnumerable<int> GetHues(int numColors)
    {
        var hue = 0.0;
        var inc = 360.0 / numColors;

        while (true)
        {
            var hsl = new Hsl() { H = hue, S = 50, L = 50 };
            var rgb = hsl.ToRgb();
            byte r = (byte)rgb.R;
            byte g = (byte)rgb.G;
            byte b = (byte)rgb.B;
            var ret = BitConverter.ToInt32([0, r, g, b]); //argb
            hue += inc;
            if (hue > 360.0) hue = 0;
            yield return ret;
        }
    }
}