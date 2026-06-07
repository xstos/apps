using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using CommunityToolkit.HighPerformance;
using RENAME_ME;
using RestoreWindowPlace;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace Ideatum;

public static partial class Program
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

    
    [STAThread]
    static void Main(string[] args)
    {
        var app = new System.Windows.Application();
        var win = new Window();
        var tmr = new DispatcherTimer(DispatcherPriority.Render);
        tmr.Interval = TimeSpan.FromMilliseconds(100);
        tmr.Tick+=TmrOnTick;
        win.Loaded += (sender, eventArgs) =>
        {
            var w2 = SystemParameters.PrimaryScreenWidth / 2;
            var h2 = SystemParameters.PrimaryScreenHeight / 2;
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