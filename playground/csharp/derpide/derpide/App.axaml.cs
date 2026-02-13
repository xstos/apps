using System;
using System.IO;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Data.Core;
using Avalonia.Data.Core.Plugins;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform;
using Avalonia.Threading;
using derpide.ViewModels;
using derpide.Views;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace derpide;

public partial class App : Application
{
    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }


    public override void OnFrameworkInitializationCompleted()
    {
        var code = @"
            using System;
            using System.IO;
            using Avalonia;
            using Avalonia.Controls.ApplicationLifetimes;
            using Avalonia.Data.Core;
            using Avalonia.Data.Core.Plugins;
            using System.Linq;
            using System.Reflection;
            using Avalonia.Markup.Xaml;
            using derpide.ViewModels;
            using derpide.Views;
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Avoid duplicate validations from both Avalonia and the CommunityToolkit. 
                // More info: https://docs.avaloniaui.net/docs/guides/development-guides/data-validation#manage-validationplugins
                DisableAvaloniaDataAnnotationValidation();

                desktop.MainWindow = new MainWindow
                {
                    DataContext = new MainViewModel()
                };
            }
            else if (ApplicationLifetime is ISingleViewApplicationLifetime singleViewPlatform)
            {
                singleViewPlatform.MainView = new MainView
                {
                    DataContext = new MainViewModel()
                };
            }
";
        var compiletest = false;
        if (compiletest)
        {
            var refs = ScriptOptions.Default.WithReferences(Assembly.GetExecutingAssembly());
            var x = CSharpScript.EvaluateAsync(code, refs, this);
        }

        var buttons = new[] { new Button() { Content = "yo" } };
        var dock = new DockPanel();
        var canv = new WrapPanel();
        var side = new WrapPanel();
        var top = new WrapPanel();
        WriteableBitmap _bitmap;

        side.Children.Add(new Button() { Content = "Side" });
        top.Children.Add(new Button() { Content = "top" });

        dock.LastChildFill = true;
        top._Dock(Dock.Top);
        top.Background = new SolidColorBrush(Colors.Green);
        side._Dock(Dock.Left);
        side.Background = new SolidColorBrush(Colors.Red);
        dock.Children.AddRange([top, side, canv]);
        canv.Background = new SolidColorBrush(Colors.Yellow);
        int width = 100, height = 100;
        canv.SizeChanged += (sender, args) =>
        {
            width = (int)args.NewSize.Width;
            height = (int)args.NewSize.Height;
            Resize(width, height);
        };
        // Create WriteableBitmap
        Resize(width, height);

        void Resize(int w, int h)
        {
            _bitmap = new WriteableBitmap(
                new PixelSize(w, h),
                new Vector(96, 96),
                PixelFormat.Bgra8888,
                AlphaFormat.Opaque);
            canv.Background = new ImageBrush(_bitmap);
        }

        int _frame = 0;

        async Task StartAnimation()
        {
            while (true)
            {
                await Task.Delay(33); // ~30 FPS

                await Dispatcher.UIThread.InvokeAsync(() => { UpdateBitmap(); });
            }
        }
        Random random = new Random();
        unsafe void UpdateBitmap()
        {
            using var lockedBitmap = _bitmap.Lock();
            var backBuffer = (uint*)lockedBitmap.Address;

            var stride = lockedBitmap.RowBytes / 4; // Bytes to pixels
            int randomNumber = random.Next(0, 256); // Upper bound is exclusive, so 256 gives 0-255
            
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    // Direct pixel manipulation (BGRA format)
                    // Example: moving gradient
                    byte blue = (byte)(0);
                    byte green = (byte)(randomNumber);
                    byte red = (byte)(0);
                    _frame++;

                    backBuffer[y * stride + x] = (uint)((blue << 16) | (green << 8) | red);
                }
            }
            canv.InvalidateVisual();
        }
        
        
        //var state = 
        if (!compiletest)
        {
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Avoid duplicate validations from both Avalonia and the CommunityToolkit. 
                // More info: https://docs.avaloniaui.net/docs/guides/development-guides/data-validation#manage-validationplugins
                DisableAvaloniaDataAnnotationValidation();

                var win = new MainWindow
                {
                    //DataContext = new MainViewModel()
                    Content = dock
                };
                desktop.MainWindow = win;
                win.Loaded += async (sender, args) =>
                {
                    await StartAnimation();
                };
            }
            else if (ApplicationLifetime is ISingleViewApplicationLifetime singleViewPlatform)
            {
                singleViewPlatform.MainView = new MainView
                {
                    DataContext = new MainViewModel()
                };
            }
        }

        base.OnFrameworkInitializationCompleted();
    }

    class Rect
    {
        public string Type { get; set; }
        public int Id { get; set; }
        public int PrevId { get; set; }
        public int NextId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }

    public void DisableAvaloniaDataAnnotationValidation()
    {
        // Get an array of plugins to remove
        var dataValidationPluginsToRemove =
            BindingPlugins.DataValidators.OfType<DataAnnotationsValidationPlugin>().ToArray();

        // remove each entry found
        foreach (var plugin in dataValidationPluginsToRemove)
        {
            BindingPlugins.DataValidators.Remove(plugin);
        }
    }
}

public static class Ext
{
    public static T _Dock<T>(this T _, Dock dock) where T : Control
    {
        DockPanel.SetDock(_, dock);
        return _;
    }
}