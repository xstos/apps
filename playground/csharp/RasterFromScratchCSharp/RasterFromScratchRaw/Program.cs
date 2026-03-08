using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Forms;
using System.Windows.Forms.Integration;
using System.Windows.Media;
using System.Windows.Threading;
using ColorMine.ColorSpaces;
using Application = System.Windows.Application;
using UserControl = System.Windows.Forms.UserControl;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace RasterFromScratchRaw
{
    internal partial class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            RawPixelsExample();
        }
        static void noop() {}
        static void RawPixelsExample()
        {
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1920,
                Height = 1080,
            };

            GCHandle _gcHandle;
            int[] pixels;
            var width = 100;
            var height = 100;
            pixels = new int[width * height];
            _gcHandle = GCHandle.Alloc(pixels, GCHandleType.Pinned);
            var bitmapInfo = GetBitmapInfo(width, height);
            var hSrc = new HwndSource();
            var hDCGraphics = hSrc.CreateGraphics();
            var hRef = new HandleRef(hDCGraphics, hDCGraphics.GetHdc());
            
            var NextColor = MakeGetNextHue(1000);
            var frameCount = 0.Ref();
            var renderCount = 0.Ref();
            bool rendering = true;
            
            Action resize = noop;
            async void BlitTask()
            {
                while (rendering)
                {
                    Blit();
                    frameCount.Value += 1;
                    await Task.Delay(10);
                }
            }

            async void ColorFillTask()
            {
                int c;
                int len;
                int i;
                int[] mypixels;
                while (rendering)
                {
                    c = NextColor();
                    mypixels = pixels;
                    len = mypixels.Length;
                    for (i = 0; i < len; i++)
                    {
                        mypixels[i] = c;
                    }
                    renderCount.Value += 1;
                    //await Task.Delay(1);
                }
            }

            void Blit()
            {
                SetDIBitsToDevice(hRef, 0, 0, width, height, 0, 0, 0, height, ref pixels[0], ref bitmapInfo, 0);
                resize();
            }

            var host = new WindowsFormsHost();
            host.Child = hSrc;
            var dp = new Grid();
            dp.Children.Add(host);
            win.Content = dp;
            win.Width = 1280;
            win.Height = 720;
            dp.SizeChanged += (sender, args) =>
            {
                resize = () =>
                {
                    width = (int)args.NewSize.Width;
                    height = (int)args.NewSize.Height;
                    pixels = new int[width * height];
                    bitmapInfo = GetBitmapInfo(width, height);
                    resize = noop;
                };
            };
            win.Loaded += (sender, args) =>
            {
                InitFrameRate(frameCount, win, renderCount, dp);
                Task.Run(ColorFillTask);
                Task.Run(BlitTask);
            };
            win.Closing += (sender, args) =>
            {
                rendering = false;
            };
            //CompositionTarget.Rendering += (o, args) => { render(); };
            var app = new Application();
            app.Run(win);
        }
        
        static Func<int> MakeGetNextHue(int numHues)
        {
            var e = ColorCycler(numHues).GetEnumerator();

            return () =>
            {
                e.MoveNext();
                return e.Current;
            };
        }
        
        static void InitFrameRate(Ref<int> frameCount, Window window, Ref<int> renderCount, FrameworkElement dp)
        {
            var frameRate = new DispatcherTimer(DispatcherPriority.Normal)
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            
            frameRate.Tick += (sender, args) =>
            {
                window.Title = $"{frameCount} fps, {renderCount} rps, size {(int)dp.ActualWidth}x{(int)dp.ActualHeight} ";
                frameCount.Value = 0;
                renderCount.Value = 0;
            };
            frameRate.Start();
        }
        static IEnumerable<int> ColorCycler(int numHues)
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
            var inc = 360.0/numColors;
            
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

    public class Ref<T>
    {
        public T Value;
        public override string ToString()
        {
            return Value.ToString();
        }
    }
    public class HwndSource : UserControl
    {
        public HwndSource()
        {
            AutoScaleMode = AutoScaleMode.None;
            SetStyle(ControlStyles.DoubleBuffer, false);
            SetStyle(ControlStyles.UserPaint, true);
            SetStyle(ControlStyles.AllPaintingInWmPaint, true);
            SetStyle(ControlStyles.Opaque, true);
            MinimumSize = new System.Drawing.Size(1, 1);
        }
    }

    public static class Ext
    {
        public static Ref<T> Ref<T>(this T item)
        {
            return new Ref<T>() { Value = item };
        }
    }
}
