using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using CommunityToolkit.HighPerformance;
using RestoreWindowPlace;
using Application = System.Windows.Forms.Application;
using KeyEventArgs = System.Windows.Input.KeyEventArgs;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace Ideatum;

static class TypeLoader
{
    public static Memory2D<int> a; //DONT REMOVE (ROSLYN TYPELOADER)
    public static OneOf.OneOf<string, char> oneOf;
    public static VectSharp.FontFamily f;

    internal static void Run()
    {
        f = VectSharp.FontFamily.ResolveFontFamily(VectSharp.FontFamily.StandardFontFamilies.Courier);
    }
}

public static partial class I
{
    [STAThread]
    static void Main(string[] args)
    {
        TypeLoader.Run();
        RunApp();
    }
    static bool NoOpBool() => false;
    static void NoOp() { }

    public static int HotNum = 0;
    public static Window Window;
    public static Action Render = () => { };
    public static Action<string> PreviewKeyDown = s => { };
    public static Func<bool> Resize=NoOpBool;
    public static Action Blit = () => { };
    public static int Width;
    public static int Height;
    public static Sprite Surface;
    static void RunApp()
    {
        void WinformsTest()
        {
            var frm = new System.Windows.Forms.Form();
            frm.Controls.Add(new System.Windows.Forms.Label().Var(out var tb2));
            
            Application.Run(frm);
            return;
        }
        
        var win = new Window();
        
        Action resize = NoOp;
        GCHandle gcHandle;
        BITMAPINFO bitmapInfo;
        Width = 100;
        Height = 100;
        var frameCount = 0.Ref();
        var renderCount = 0.Ref();
        bool rendering = true;

        var hSrc = new HwndSource2();
       
        var hDCGraphics = hSrc.CreateGraphics();
        var hRef = new HandleRef(hDCGraphics, hDCGraphics.GetHdc());

        void Alloc()
        {
            Surface = new Sprite(new int[Width * Height], Width, Height);
            gcHandle = GCHandle.Alloc(Surface.Data, GCHandleType.Pinned);
            bitmapInfo = GetBitmapInfo(Width, Height);
            Blit = () =>
            {
                SetDIBitsToDevice(hRef, 0, 0, Width, Height, 0, 0, 0, Height, ref Surface.Data[0], ref bitmapInfo, 0);
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
        host.Background=null;
        
        var root = new Grid();
        root.Background = null;
        root.MinHeight = 1;
        root.MinWidth = 1;
        
        root.Children.Add(host);
        
        win.Focusable = true;
        win.Content = root;
        win.Background=Brushes.Transparent;
        
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
                Resize = NoOpBool;
                return true;
            };
        };
        var disp = Dispatcher.CurrentDispatcher;
        static string GetSrcPath()
        {
            var location = Directory.GetCurrentDirectory();
            var dir = location + "../../../../hot";
            return Path.GetFullPath(dir);
        }
        win.ContentRendered += (sender, args) =>
        {
            InitFrameRate(frameCount, win, renderCount, host);
            //Task.Run(RenderLoop);
            //Task.Run(BlitTask);
            Watch(run =>
            {
                disp.Invoke(run);
                HotNum++;
            }, GetSrcPath());
        };
        win.Closing += (sender, args) => { rendering = false; };
        var mods = new[] { ModifierKeys.Control,ModifierKeys.Alt, ModifierKeys.Shift };
        
        void PTI(object sender, KeyEventArgs args)
        {
            var str = mods.Select(E.PressedStr)._NonNullOrEmpty().Concat([args.Key.ToString()])._Join("+");
            Console.Write(str + " ");
            //PreviewKeyDown(str);
        }

        win.PreviewKeyDown += PTI;
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

public class HwndSource2 : System.Windows.Forms.UserControl
{
    public HwndSource2()
    {
        AutoScaleMode = System.Windows.Forms.AutoScaleMode.None;
        SetStyle(System.Windows.Forms.ControlStyles.DoubleBuffer, false);
        SetStyle(System.Windows.Forms.ControlStyles.UserPaint, true);
        SetStyle(System.Windows.Forms.ControlStyles.AllPaintingInWmPaint, true);
        //SetStyle(System.Windows.Forms.ControlStyles.Opaque, true);
        MinimumSize = new System.Drawing.Size(1, 1);
    }
}

public static class E
{
    public static string PressedStr(this ModifierKeys mod) => (Keyboard.Modifiers & mod) == mod ? Enum.GetName(mod) : "";

    public static IEnumerable<string> _NonNullOrEmpty(this IEnumerable<string> s) =>
        s.Where(s => !string.IsNullOrEmpty(s));
    public static string _Join(this IEnumerable<string> s, string sep) => string.Join(sep, s);
}