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
using Avalonia.Interactivity;
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
        var panelRect = new Cell<Rect>(new Rect());
        var ctx = new Context();
        var root = Node.MakeRoot(ctx);
        var cur = root.Cursor;
        cur.Insert("hello");

        Button B(string txt, EventHandler<RoutedEventArgs>? click)
        {
            var b = new Button();
            b.Content = txt;
            b.Click += click;
            return b;
        }


        var buttons = new[] { "+" }.Select(s => B("+", (sender, args) => { }));
        var dock = new DockPanel();
        var canv = new WrapPanel();
        var side = new WrapPanel();
        var top = new WrapPanel();
        WriteableBitmap bmp;

        side.Children.Add(new Button() { Content = "Side" });
        top.Children.AddRange(buttons);

        dock.LastChildFill = true;
        top._Dock(Dock.Top);
        top.Background = new SolidColorBrush(Colors.Green);
        side._Dock(Dock.Left);
        side.Background = new SolidColorBrush(Colors.Red);
        dock.Children.AddRange([top, side, canv]);
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
            bmp = new WriteableBitmap(new PixelSize(w, h), new Vector(96, 96), PixelFormat.Bgra8888, AlphaFormat.Opaque);
            canv.Background = new ImageBrush(bmp);
        }

        int _frame = 0;


        Random random = new Random();
        int direction = 1;

        unsafe void UpdateBitmap()
        {
            using var lockedBitmap = bmp.Lock();
            var backBuffer = (uint*)lockedBitmap.Address;

            var stride = lockedBitmap.RowBytes / 4; // Bytes to pixels
            //int randomNumber = random.Next(0, 256); // Upper bound is exclusive, so 256 gives 0-255

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    // Direct pixel manipulation (BGRA format)
                    byte blue = (byte)(0);
                    byte green = (byte)(_frame % 256);
                    byte red = (byte)(0);

                    backBuffer[y * stride + x] = (uint)((blue << 16) | (green << 8) | red);
                }
            }

            if (_frame % 256 == 0)
                direction = -direction;
            _frame += direction;

        }

        async Task StartAnimation()
        {
            while (true)
            {
                await Task.Delay(5); // ~30 FPS

                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    UpdateBitmap(); 
                    canv.InvalidateVisual();
                    
                });
            }
        }

        void ButtonClickHandler(Button o, RoutedEventArgs args)
        {
        }

        void EventHookup()
        {
            //Button.PointerMovedEvent.AddClassHandler<Button>(ButtonPointerMovedHandler);
            //Button.GotFocusEvent.AddClassHandler<Button>(ButtonFocusHandler);
            Button.ClickEvent.AddClassHandler<Button>(ButtonClickHandler);
        }
        async void Loaded(object? sender, RoutedEventArgs args)
        {
            await StartAnimation();
        }
        var content = dock;
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            // Avoid duplicate validations from both Avalonia and the CommunityToolkit. 
            // More info: https://docs.avaloniaui.net/docs/guides/development-guides/data-validation#manage-validationplugins
            DisableAvaloniaDataAnnotationValidation();

            var win = new MainWindow
            {
                //DataContext = new MainViewModel()
                Content = content
            };
            desktop.MainWindow = win;
            win.Loaded += Loaded;
        }
        else if (ApplicationLifetime is ISingleViewApplicationLifetime page)
        {
            var view = new MainView
            {
                //DataContext = new MainViewModel()
                Content = content
            };
            page.MainView = view;
            view.Loaded += Loaded;
        }

        base.OnFrameworkInitializationCompleted();
    }


    public struct Rect
    {
        public double Left;
        public double Top;
        public double Width;
        public double Height;
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