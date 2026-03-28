using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
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

    public static int HotNum = 0;
    public static Window Window;
    public static Action Render = () => { };
    public static KeyEventHandler PreviewKeyDown = (sender, args) => { };
    public static Action Resize=()=>{};
    public static Action Blit = () => { };
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
            Blit = () =>
            {
                SetDIBitsToDevice(hRef, 0, 0, Width, Height, 0, 0, 0, Height, ref Surface[0], ref bitmapInfo, 0);
            };
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
                Dispatcher.CurrentDispatcher.Invoke(Render, DispatcherPriority.Render);
                //Render();
                renderCount.Value += 1;
                await Task.Delay(1);
            }
        }
        
        Alloc();

        var host = new System.Windows.Forms.Integration.WindowsFormsHost();
        host.Child = hSrc;
        var root = new Grid();
        root.MinHeight = 1;
        root.MinWidth = 1;
        root.Children.Add(host);
        var win = new Window();
        win.Content = root;
        Window = win;
        root.SizeChanged += (sender, args) =>
        {
            var nw = (int)args.NewSize.Width;
            var nh = (int)args.NewSize.Height;
            //Console.WriteLine($"resize {nw} {nh}");
            Resize = () =>
            {
                Free();
                Width = nw;
                Height = nh;
                Alloc();
                Resize = noop;
            };
        };
        var disp = Dispatcher.CurrentDispatcher;
        win.ContentRendered += (sender, args) =>
        {
            InitFrameRate(frameCount, win, renderCount, root);
            //Task.Run(RenderLoop);
            //Task.Run(BlitTask);
            Watch(run =>
            {
                disp.Invoke(run);
                HotNum++;
            });
        };
        win.Closing += (sender, args) => { rendering = false; };
        win.KeyDown += (sender, args) =>
        {
            PreviewKeyDown(sender, args);
        };
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



public class HwndSource : System.Windows.Forms.UserControl
{
    public HwndSource()
    {
        AutoScaleMode = System.Windows.Forms.AutoScaleMode.None;
        SetStyle(System.Windows.Forms.ControlStyles.DoubleBuffer, false);
        SetStyle(System.Windows.Forms.ControlStyles.UserPaint, true);
        SetStyle(System.Windows.Forms.ControlStyles.AllPaintingInWmPaint, true);
        SetStyle(System.Windows.Forms.ControlStyles.Opaque, true);
        MinimumSize = new System.Drawing.Size(1, 1);
    }
}