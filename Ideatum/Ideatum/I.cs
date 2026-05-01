using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using CommunityToolkit.HighPerformance;
using RENAME_ME;
using RestoreWindowPlace;
using Application = System.Windows.Forms.Application;
using KeyEventArgs = System.Windows.Input.KeyEventArgs;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace Ideatum;

static class TypeLoader
{
    public static List<object> Foo = new List<object>();
    internal static void Run()
    {
        Foo.AddRange([
        new CommunityToolkit.HighPerformance.Memory2D<int>(),
        OneOf.OneOf<string, char>.FromT0(""), VectSharp.FontFamily.DefaultFontLibrary,
        new System.Drawing.Color(),
        new System.Windows.Media.Color(),
        new System.Windows.Size(),
        new System.Windows.Media.Imaging.PngBitmapEncoder(),
        new WindowPlace("placement.config"),
        new System.Windows.Forms.Integration.WindowsFormsHost(),
        ]);
        I.LoadFont();
    }
}

public static partial class I
{
    static string appWorkingDir = Directory.GetCurrentDirectory();

    public static string GetAssetPath(string fileName) => Path.Combine(appWorkingDir, "assets", fileName);
    public static int HotNum = 0;
    
    public static Action ShutDown = () => { };
    public static Action Reload = () => { };
    static string GetSrcPath()
    {
        var location = Directory.GetCurrentDirectory();
        var dir = location + "../../../../hot";
        return Path.GetFullPath(dir);
    }

    internal static void LoadFont()
    {
        var pts = FontToVerts.Test("A").ToList();
        var font = FontTriangulator.LoadFont(GetAssetPath("consolas.ttf"));
        var tris = font.Triangulate('A').ToList();
    }
    [STAThread]
    static void Main(string[] args)
    {
        TypeLoader.Run();
        var app = new System.Windows.Application();
        var win = new Window();
        var tmr = new DispatcherTimer(DispatcherPriority.Render);
        tmr.Interval = TimeSpan.FromMilliseconds(100);
        tmr.Tick+=TmrOnTick;
        win.Loaded += (sender, eventArgs) =>
        {
            var w2 = Screen.PrimaryScreen.Bounds.Width / 2;
            var h2 = Screen.PrimaryScreen.Bounds.Height / 2;
            win.Height = 0;
            win.Top = h2;
            win.Left = w2;
            win.Width = w2;
            win.Title = "Hot Reloader";
            Watch(run =>
            {
                Reload = () =>
                {
                    ShutDown();
                    run();
                    HotNum++;
                    Reload = () => { };
                };
                
            }, GetSrcPath());
            tmr.Start();
        };
        void TmrOnTick(object? sender, EventArgs e)
        {
            Reload();
        }

        System.Windows.Application.Current.Run(win);
        return;
        
    }
    static bool NoOpBool() => false;
    static void NoOp() { }

    public static Window Window;
    public static Action Render = () => { };
    public static Action<string> PreviewKeyDown = s => { };
    public static Func<bool> Resize=NoOpBool;
    public static Action Blit = () => { };
    public static int Width;
    public static int Height;
    //public static RENAME_ME.Sprite Surface;
    // static void RunApp()
    // {
    //     
    //     var win = new Window();
    //     
    //     GCHandle gcHandle;
    //     BITMAPINFO bitmapInfo;
    //     Width = 100;
    //     Height = 100;
    //     var frameCount = 0.Ref();
    //     var renderCount = 0.Ref();
    //     bool rendering = true;
    //
    //     var hSrc = new HwndSource2();
    //    
    //     var hDCGraphics = hSrc.CreateGraphics();
    //     var hRef = new HandleRef(hDCGraphics, hDCGraphics.GetHdc());
    //
    //     void Alloc()
    //     {
    //         Surface = new RENAME_ME.Sprite(new int[Width * Height], Width, Height);
    //         gcHandle = GCHandle.Alloc(Surface.Data, GCHandleType.Pinned);
    //         bitmapInfo = GetBitmapInfo(Width, Height);
    //         Blit = () =>
    //         {
    //             SetDIBitsToDevice(hRef, 0, 0, Width, Height, 0, 0, 0, Height, ref Surface.Data[0], ref bitmapInfo, 0);
    //         };
    //     }
    //
    //     void Free() => gcHandle.Free();
    //
    //     async void BlitTask()
    //     {
    //         while (rendering)
    //         {
    //             Blit();
    //             frameCount.Value += 1;
    //             await Task.Delay(10);
    //         }
    //     }
    //     async void RenderLoop()
    //     {
    //         while (rendering)
    //         {
    //             Dispatcher.CurrentDispatcher.Invoke(Render, DispatcherPriority.Render);
    //             //Render();
    //             renderCount.Value += 1;
    //             await Task.Delay(1);
    //         }
    //     }
    //     
    //     Alloc();
    //
    //     var host = new System.Windows.Forms.Integration.WindowsFormsHost();
    //     host.Child = hSrc;
    //     host.Background=null;
    //     
    //     var root = new Grid();
    //     root.Background = null;
    //     root.MinHeight = 1;
    //     root.MinWidth = 1;
    //     
    //     root.Children.Add(host);
    //     
    //     win.Focusable = true;
    //     win.Content = root;
    //     win.Background=Brushes.Transparent;
    //     
    //     Window = win;
    //     
    //     root.SizeChanged += (sender, args) =>
    //     {
    //         var nw = (int)args.NewSize.Width;
    //         var nh = (int)args.NewSize.Height;
    //         //Console.WriteLine($"resize {nw} {nh}");
    //         
    //         Resize = () =>
    //         {
    //             Free();
    //             Width = nw;
    //             Height = nh;
    //             Alloc();
    //             Resize = NoOpBool;
    //             return true;
    //         };
    //     };
    //     var disp = Dispatcher.CurrentDispatcher;
    //     
    //     win.ContentRendered += (sender, args) =>
    //     {
    //         InitFrameRate(frameCount, win, renderCount, host);
    //         //Task.Run(RenderLoop);
    //         //Task.Run(BlitTask);
    //         Watch(run =>
    //         {
    //             disp.Invoke(run);
    //             HotNum++;
    //         }, GetSrcPath());
    //     };
    //     win.Closing += (sender, args) => { rendering = false; };
    //     var mods = new[] { ModifierKeys.Control,ModifierKeys.Alt, ModifierKeys.Shift };
    //     
    //     void PTI(object sender, KeyEventArgs args)
    //     {
    //         var str = mods.Select(E.PressedStr)._NonNullOrEmpty().Concat([args.Key.ToString()])._Join("+");
    //         Console.Write(str + " ");
    //         //PreviewKeyDown(str);
    //     }
    //
    //     win.PreviewKeyDown += PTI;
    //     //CompositionTarget.Rendering += (o, args) => { render(); };
    //     var app = new System.Windows.Application();
    //     WindowPlaceInit(app, win);
    //     app.Run(win);
    // }

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



public static class E
{
    public static string PressedStr(this ModifierKeys mod) => (Keyboard.Modifiers & mod) == mod ? Enum.GetName(mod) : "";

    public static IEnumerable<string> _NonNullOrEmpty(this IEnumerable<string> s) =>
        s.Where(s => !string.IsNullOrEmpty(s));
    public static string _Join(this IEnumerable<string> s, string sep) => string.Join(sep, s);
}