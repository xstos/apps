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
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using ColorMine.ColorSpaces;
using CommunityToolkit.HighPerformance;
using RestoreWindowPlace;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace Ideatum;

static class TypeLoader
{
    static Memory2D<int> a; //DONT REMOVE (ROSLYN TYPELOADER)
    internal static void Run() {}
}
public static partial class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        TypeLoader.Run();
        RunApp();
    }

    public static Action Render = () => { };
    public static int Width;
    public static int Height;
    public static int[] Surface;
    static void noop() { }

    static void RunApp()
    {
        Action resize = noop;
        GCHandle gcHandle;
        BITMAPINFO bitmapInfo;
        Width = 100;
        Height = 100;
        var frameCount = 0.Ref();
        var renderCount = 0.Ref();
        bool rendering = true;

        var hSrc = new HwndSource();
        var hDCGraphics = hSrc.CreateGraphics();
        var hRef = new HandleRef(hDCGraphics, hDCGraphics.GetHdc());

        void Alloc()
        {
            Surface = new int[Width*Height];
            gcHandle = GCHandle.Alloc(Surface, GCHandleType.Pinned);
            bitmapInfo = GetBitmapInfo(Width, Height);
        }

        void Free() => gcHandle.Free();

        async void BlitTask()
        {
            while (rendering)
            {
                Blit();
                frameCount.Value += 1;
                await Task.Delay(10);
            }
        }
        

        async void RenderLoop()
        {
            while (rendering)
            {
                Render();
                renderCount.Value += 1;
                await Task.Delay(10);
            }
        }

        void Blit()
        {
            SetDIBitsToDevice(hRef, 0, 0, Width, Height, 0, 0, 0, Height, ref Surface[0], ref bitmapInfo, 0);
            resize();
        }

        Alloc();

        var host = new WindowsFormsHost();
        host.Child = hSrc;
        var root = new Grid();
        root.MinHeight = 1;
        root.MinWidth = 1;
        root.Children.Add(host);
        var win = new Window();
        win.Content = root;

        root.SizeChanged += (sender, args) =>
        {
            resize = () =>
            {
                Free();
                Width = (int)args.NewSize.Width;
                Height = (int)args.NewSize.Height;
                Alloc();
                resize = noop;
            };
        };
        win.Loaded += (sender, args) =>
        {
            InitFrameRate(frameCount, win, renderCount, root);
            Task.Run(RenderLoop);
            Task.Run(BlitTask);
            Action action=null;
            Watch(entryPointMethod =>
            {
                action = (Action) Delegate.CreateDelegate(typeof(Action), entryPointMethod);
            });
            var tmr = new DispatcherTimer(DispatcherPriority.Normal);
            tmr.Interval = TimeSpan.FromMilliseconds(1);
            tmr.Start();
            tmr.Tick += (o, eventArgs) =>
            {
                if (action == null) return;
                action();
                action = null;
            };
        };
        win.Closing += (sender, args) => { rendering = false; };
        //CompositionTarget.Rendering += (o, args) => { render(); };
        var app = new System.Windows.Application();
        WindowPlaceInit(app, win);
        app.Run(win);
    }

    static void WindowPlaceInit(System.Windows.Application app, Window win)
    {
        var place = new WindowPlace("placement.config");
        place.IsSavingSnappedPositionEnabled = true;
        app.Exit += (sender, args) => place.Save();
        place.Register(win);
    }

    public static Func<int> MakeGetNextHue(int numHues)
    {
        var e = ColorWheel(numHues).GetEnumerator();
        return () =>
        {
            e.MoveNext();
            return e.Current;
        };
    }

    static void InitFrameRate(Ref<int> frameCount, Window window, Ref<int> renderCount, FrameworkElement canvas)
    {
        var frameRate = new DispatcherTimer(DispatcherPriority.Normal)
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        frameRate.Tick += (sender, args) =>
        {
            window.Title =
                $"{frameCount} fps, {renderCount} rps, canvas size W{(int)canvas.ActualWidth}xH{(int)canvas.ActualHeight}, win L{window.Left} T{window.Top} W{window.ActualWidth} H{window.ActualHeight}";
            frameCount.Value = 0;
            renderCount.Value = 0;
        };
        frameRate.Start();
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

public class HwndSource : System.Windows.Forms.UserControl
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

public static partial class Program
{
    public static Ref<T> Ref<T>(this T item) => new() { Value = item };

    public static IEnumerable<int> ColorWheel(int numHues)
    {
        var colors = Enumerable.Take<int>(GetHues(numHues), numHues).ToArray();
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