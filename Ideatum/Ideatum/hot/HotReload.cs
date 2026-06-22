using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using ColorMine.ColorSpaces;
using CommunityToolkit.HighPerformance;
using Ideatum;
using FontFamily = System.Windows.Media.FontFamily;

namespace RENAME_ME;

public static class Hot
{
    static char TheWay = '道';
    static char YY = '☯';
    static string CURSOR = "█";
    static Stopwatch sw = new Stopwatch();
    static Disposable timer(string name="") => new Disposable(() =>
    {
        sw.Reset();
        //Console.WriteLine("start "+ name);
        sw.Start();
    }, () =>
    {
        sw.Stop();
        Console.WriteLine(name+" took "+sw.Elapsed.TotalMilliseconds);
    } );

    static Func<int> MakeGetNextColor()
    {
        //var enu = ColorWheel().GetEnumerator();
        var enu = GetHues(2000).GetEnumerator();
        int Next()
        {
            enu.MoveNext();
            return enu.Current;
        }

        return Next;
    }
    static void GridExample()
    {
        var pnl = new Grid();
        var bottom = new Canvas();
        var top = new Button() { Content = "hi" };
        pnl.RowDefinitions.Add(new RowDefinition() { Height = new GridLength(1, GridUnitType.Star) });
        pnl.RowDefinitions.Add(new RowDefinition() { Height = new GridLength(1, GridUnitType.Star) });
        Grid.SetRow(top, 0);
        Grid.SetRow(bottom, 1);
        pnl.Children.Add(top);
        pnl.Children.Add(bottom);
    }
    public static void RunApp(Window window)
    {
        const char TheWay = '道';
        const char YY = '☯';
        var FontSize = 40.0;
        var fontName = "Jetbrains Mono";
        var typeface = new Typeface(new FontFamily(fontName), FontStyles.Normal, FontWeights.Bold, FontStretches.Normal);
        var nextColor = MakeGetNextColor();
        int glyphWidth, glyphHeight;
        
        Glyph MakeGlyph(char c)
        {
            var ft = new FormattedText(c+"", CultureInfo.GetCultureInfo("en-us"), FlowDirection.LeftToRight, typeface, FontSize, Brushes.White, 1.0);
            var geom = ft.BuildGeometry(new Point(0, 0)).GetFlattenedPathGeometry(0.01, ToleranceType.Relative);
            Glyph g = new Glyph();
            g.Shapes = geom.ToPolygons().Select(Polygon.New).ToArray();
            foreach (var s in g.Shapes)
            {
                g.Bounds.Union(s.Bounds);
            }
            return g;
        }

        var txt = File.ReadAllText(Program.GetAssetPath("twist.txt"));
        //var txt = Res("GeomToPoly.twist.txt");//.Replace("W",""+YY);
        //var txt = new WebClient().DownloadString("https://www.gutenberg.org/cache/epub/730/pg730.txt");
        var chars = txt.Distinct().ToArray();
        var max = chars.Max(c => (int)c)+1;
        Console.WriteLine("last char index "+max);
        var glyphs = new Glyph[max];
        var lines = txt.ReplaceLineEndings("\n").Split('\n');
        var widest = lines.Max(l => l.Length);
        var brushes = new MyBrush[lines.Length][];
        for (int i = 0; i < lines.Length; i++)
        {
            //lines[i] = lines[i].PadRight(widest,' ');
            brushes[i] = Enumerable.Range(0, widest).Select(_ => (MyBrush)(nextColor(),nextColor())).ToArray();
        }

        void MakeGlyphs()
        {
            using var _ = timer("make glyphs");
            glyphWidth = int.MinValue;
            glyphHeight = int.MinValue;
            Parallel.For(0, chars.Length, i =>
            {
                var c = chars[i];
                var g = MakeGlyph(c);
                glyphs[c] = g;
            });
            
            foreach (var c in chars)
            {
                var g = glyphs[c];
                var (w, h) = g.Size();
                if (w > glyphWidth) glyphWidth = Math.Max(w,1);
                if (h > glyphHeight) glyphHeight = Math.Max( h,1);
            }
        }
        MakeGlyphs();

        var popts = new ParallelOptions() { MaxDegreeOfParallelism = 12 };
        HLineInfo singleGlyphLineInfo = new HLineInfo(1200);
        HLineInfo wholeLineInfo = new HLineInfo(1200);

        window.Left = 0;
        window.Top = 0;
        window.Width = 1800;
        window.Height = 1100;
        
        window.Background = Brushes.Black;
        var pixelBuffer = new PixelBuffer();
        window.Content = pixelBuffer;
        int lineOffset = 0;
        window.PreviewMouseWheel += (sender, args) =>
        {
            var offs = -args.Delta/10;
            lineOffset += offs;
            if (lineOffset < 0) lineOffset = 0;
            Refresh();
        };
        
        window.PreviewKeyDown += (sender, args) =>
        {
            if (args.Key == Key.Up)
            {
                lineOffset--;
                if (lineOffset < 0) lineOffset = 0;
            }

            if (args.Key == Key.Down)
            {
                lineOffset++;
            }

            if (Keyboard.Modifiers.HasFlag(ModifierKeys.Control))
            {
                if (args.Key == Key.OemPlus)
                {
                    FontSize *= 1.05;
                    MakeGlyphs();
                }

                if (args.Key == Key.OemMinus)
                {
                    FontSize *=0.95;
                    if (FontSize < 1) FontSize = 1;
                    MakeGlyphs();
                }

                
            }
            Refresh();
        };
        window.TextInput += (sender, args) =>
        {
        };
        
        window.SizeChanged += (sender, args) =>
        {
            var height = (int)Math.Floor(args.NewSize.Height);
            if (singleGlyphLineInfo.Height >= height) return;
            singleGlyphLineInfo = new HLineInfo(height);
            wholeLineInfo = new HLineInfo(height);
        };
        
        pixelBuffer.Render = Render;
        
        void Render()
        {
            singleGlyphLineInfo.UsedRowIndexes.Clear();
            wholeLineInfo.UsedRowIndexes.Clear();
            var wholeRows = wholeLineInfo.Rows;
            var singleGlyphUsedRowIndexes = singleGlyphLineInfo.UsedRowIndexes;
            var pixels = pixelBuffer.Pixels;
            Array.Fill(pixels, 0);
            var pixelBufferWidth = (int)pixelBuffer.ActualWidth;
            var pixelBufferHeight = (int)pixelBuffer.ActualHeight;
            var numCols = pixelBufferWidth / glyphWidth;
            var numRows = pixelBufferHeight / glyphHeight;
            var nodeX = new List<int>(8);
            //var max = int.MinValue;
            for (int i = 0; i < numRows; i++)
            {
                var lineIndex = i+lineOffset;
                var line = lines[lineIndex];
                var lineLength = line.Length;
                var yoffs = i * glyphHeight;
                for (int j = 0; j < Math.Min(numCols,lineLength); j++)
                {
                    var xoffs = j * glyphWidth;
                    char c = line[j];
                    MyBrush brush = brushes[lineIndex][j];
                    
                    var ix = (int)c;
                    var glyph = glyphs[ix];
                    foreach (var shape in glyph.Shapes)
                    {
                        foreach (var tuple in PolygonFiller.FillPolygon(shape, xoffs, yoffs, nodeX))
                        {
                            //max = Math.Max(nodeX.Count, max);
                            singleGlyphLineInfo.Push(tuple.y,tuple.x1,tuple.x2);
                        }
                    }

                    var count = singleGlyphUsedRowIndexes.Count;
                    for (int k = 0; k < count; k++)
                    {
                        var y = singleGlyphUsedRowIndexes[k];
                        var verts = singleGlyphLineInfo.Rows[y];
                        verts.Sort();
                        //wholeRows[y].Add(brush.ForegroundColor);
                        wholeRows[y].AddRange(verts);
                        foreach (var t in verts)
                        {
                            wholeLineInfo.Brushes[y][t] = brush;
                        }
                        verts.Clear();
                    }

                    singleGlyphUsedRowIndexes.Clear();
                }
            }
            //Console.WriteLine("Max = "+max);
            var lastIx = pixels.Length - 1;
            Parallel.For(0, wholeRows.Length,popts, i =>
            {
                var verts = wholeRows[i];
                var brushes = wholeLineInfo.Brushes[i];
                foreach (var c in verts.Chunk(2))
                {
                    var (x1, x2) = (c[0], c[1]);
                    var startIndex = i * pixelBufferWidth + x1;
                    var count = x2 - x1 + 1;
                    if (startIndex>lastIx || startIndex+count>lastIx) continue;
                    Array.Fill(pixels, brushes[x1].ForegroundColor, startIndex, count);
                }

                verts.Clear();
            });
            
        }
        void Refresh()
        {
            using (timer("redraw"))
            {
                Render();
            }

            pixelBuffer.Paint();
        }
        window.MouseMove += (sender, args) =>
        {
            //Console.WriteLine(args.GetPosition(test).Y);
        };
        window.Loaded += (sender, args) =>
        {
            using (timer("paint"))
            {
                Refresh();
            }
        };
        
    }
    public static void Run()
    {
        var NextColor = Program.MakeGetNextHue(15);
        Console.WriteLine("Enter " + Ideatum.Program.HotNum);
        var win = new Window();
        
        RunApp(win);
        ResizeWin(win);
        win.Closed += (sender, args) => { Console.WriteLine("Exit " + Program.HotNum); };
        win.Show();

        void ShutDown()
        {
            win.Close();
            Program.ShutDown = () => { }; //
        }

        Program.ShutDown = ShutDown;

    }

    static void ResizeWin(Window win)
    {
        var w = SystemParameters.PrimaryScreenWidth;
        var h = SystemParameters.PrimaryScreenHeight;
        var w2 = w / 2;
        var h2 = h / 2;
        win.Left = w2;
        win.Top = 0;
        win.Width = w2;
        win.Height = h;
        win.Title = "hi";
    }
    static IEnumerable<int> GetHues(int numColors)
    {
        var hue = 0.0;
        var inc = 360.0 / numColors;

        while (true)
        {
            var hsl = new Hsl() { H = hue, S = 100, L = 50 };
            var rgb = hsl.ToRgb();
            byte r = (byte)rgb.R;
            byte g = (byte)rgb.G;
            byte b = (byte)rgb.B;
            var ret = BitConverter.ToInt32([b,g,r,255]); //argb
            hue += inc;
            if (hue > 360.0) hue = 0;
            yield return ret;
        }
    }
    static string Res(string resourceName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var n = assembly.GetManifestResourceNames();
        using Stream stream = assembly.GetManifestResourceStream(resourceName);
        using StreamReader reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}

public static class Ext2
{
    internal static int ToBgraInt(this System.Windows.Media.Color color)
    {
        return BitConverter.ToInt32([color.B, color.G, color.R, color.A]);
    }

    internal static IEnumerable<UIElement> Enu(this UIElementCollection c)
    {
        return c.Cast<UIElement>();
    }

    internal static void Save(this BitmapSource bmp, string path)
    {
        var encoder = new PngBitmapEncoder();
        var bitmapFrame = BitmapFrame.Create(bmp);
        encoder.Frames.Add(bitmapFrame);
        using var fileStream = new FileStream(path, FileMode.Create);
        encoder.Save(fileStream);
    }

    internal static BitmapSource Crop(this BitmapSource bmp, Int32Rect rect)
    {
        return new CroppedBitmap(bmp, rect);
    }


}