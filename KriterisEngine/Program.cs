using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Bitmap = System.Drawing.Bitmap;
using Color = System.Drawing.Color;
using Font = System.Drawing.Font;
using FontFamily = System.Drawing.FontFamily;
using Graphics = System.Drawing.Graphics;
using Image = System.Windows.Controls.Image;
using PixelFormat = System.Drawing.Imaging.PixelFormat;
using Point = System.Drawing.Point;
using SolidBrush = System.Drawing.SolidBrush;
using static KriterisEngine.Prop;
[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

// https://github.com/waf/replay-csharp/tree/e433ad0da9c637d44ebe79ef13b25a3a89b27c35
// https://carlos.mendible.com/2017/03/02/create-a-class-with-net-core-and-roslyn/
namespace KriterisEngine
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            
            WpfGui.Run();
        }

        static unsafe void ImmediateModeGui()
        {
            int width = 300, height = 100, dpi = 96;
            var bmp = new WriteableBitmap(width, height, dpi, dpi, PixelFormats.Bgra32, null);
            var surface = Sprite.New(width, height);
            surface.Fill(Color.Transparent);

            surface.Fill((x, y, color) =>
            {
                var xOdd = x % 2 != 0;
                var yOdd = y % 2 != 0;
                if (xOdd)
                {
                    return yOdd ? Color.LightGray : color;
                }

                return !yOdd ? Color.LightGray : color;
            });

            var image = new Image();
            image.Source = bmp;
            image.Width = width;
            image.Height = height;
            RenderOptions.SetBitmapScalingMode(image, BitmapScalingMode.NearestNeighbor);

            void SurfaceToScreen()
            {
                bmp.Lock();
                unsafe
                {
                    Buffer.MemoryCopy((void*) surface.Ptr, (void*) bmp.BackBuffer, surface.NumBytesInt, surface.NumBytesInt);
                }

                bmp.AddDirtyRect(surface.Rect);
                bmp.Unlock();
            }

            var win = new Window
            {
                WindowStartupLocation = WindowStartupLocation.CenterScreen,
                Width = 1920,
                Height = 1080,
            };

            var b = new Bitmap(1, 1);
            var g = Graphics.FromImage(b);

            var fontFamily = new FontFamily("Consolas");

            var font = new Font(fontFamily, 24);
            var text = "aWH█\nfoo";
            var fontSize = g.MeasureString(text, font);

            var rootDock = new DockPanel();
            rootDock.LayoutTransform = new ScaleTransform(4.0, 4.0);
            rootDock.AllowDrop = true;
            var main = new WrapPanel();
            var debugPanel = new WrapPanel().Dock(Dock.Bottom);

            main.Background = new SolidColorBrush(Colors.Chartreuse);
            debugPanel.Background = new SolidColorBrush(Colors.Yellow);

            main.Children.Add(image);

            //https://www.wpf-tutorial.com/panels/dockpanel/
            rootDock.Children.Add(debugPanel);
            rootDock.Children.Add(main);

            Sprite RenderText()
            {
                //https://docs.microsoft.com/en-us/dotnet/desktop/winforms/advanced/how-to-obtain-font-metrics?view=netframeworkdesktop-4.8
                var txtBmp = new Bitmap((int) fontSize.Width, (int) fontSize.Height);
                txtBmp.SetResolution(dpi, dpi);
                var brush = new SolidBrush(Color.Black);
                var g2 = Graphics.FromImage(txtBmp);
                g2.InterpolationMode = InterpolationMode.NearestNeighbor;
                g2.SmoothingMode = SmoothingMode.None;
                g2.CompositingQuality = CompositingQuality.HighQuality;
                //g.Clear(Color.Transparent);
                g2.DrawString(text, font, brush, 0, 0);
                var p = new System.Drawing.Pen(Color.Black);
                g2.FillRectangle(brush, 0, 0, 1, 1);
                g2.FillRectangle(brush, 0, txtBmp.Height - 2, 1, 1);
                g2.FillRectangle(brush, txtBmp.Width - 2, txtBmp.Height - 2, 1, 1);
                g2.FillRectangle(brush, txtBmp.Width - 2, 0, 1, 1);

                debugPanel.Children.Add(txtBmp.ToImage());
                var data = txtBmp.LockBits(new Rectangle(new Point(0, 0), fontSize.ToSize()), ImageLockMode.ReadOnly,
                    PixelFormat.Format32bppArgb);
                var sprite = Sprite.New((int) fontSize.Width, (int) fontSize.Height);
                unsafe
                {
                    Buffer.MemoryCopy((void*) data.Scan0, (void*) sprite.Ptr, sprite.NumBytesInt, sprite.NumBytesInt);
                }

                return sprite;
            }

            surface.Draw(RenderText(), 0, 0);

            win.Loaded += (windowSender, windowLoadedEventArgs) =>
            {
                var defaultSize = rootDock.DesiredSize;
                Emit("window.size.changed",
                        ("default", defaultSize))
                    .Out(out var emitSizeChanged);

                Emit("window.drop",
                        ("default", new string[] { }))
                    .Out(out var emitFilesDropped);

                Prop[] MakeKeyDown(Func<Key, (Key, bool)> isControlKeyDown, Key key1)
                {
                    var ctrl = ControlKeys.Select(isControlKeyDown).ToArray();
                    return new Prop[] {("value", key1), ("control", ctrl)};
                }

                Emit("window.keydown",
                        ("default", MakeKeyDown(key => (key, false), Key.None)))
                    .Out(out var emitKeyDown);

                rootDock.SizeChanged += (sender, eventArgs) => { emitSizeChanged(("value", eventArgs.NewSize)); };
                rootDock.Drop += (o, eventArgs) =>
                {
                    var droppedFiles = eventArgs.GetDroppedFiles();
                    emitFilesDropped(("value", droppedFiles));
                };
                win.KeyDown += (o, keyArgs) =>
                {
                    var keyDown = MakeKeyDown(IsKeyDown, keyArgs.Key);
                    emitKeyDown(keyDown);
                };
                SurfaceToScreen();
            };

            win.Content = rootDock;
            var app = new Application();

            app.Run(win);
        }
    }
    /*
      
     */
    public class Db
    {
        public Func<object, Db> Write;
        public Func<IEnumerable<object>> GetItems;
        public static Db New(string path)
        {
            var fs = File.Open(path, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
            var bs = new BinarySerializer(fs);
            var db = new Db();
            db.Write = o =>
            {
                bs.Serialize(o);
                return db;
            };
            db.GetItems = () =>
            {
                return bs.DeserializeAll();
            };
            return db;
        }
    }
    
    public delegate Prop[] EmitDelegate(params Prop[] args);
    public class Prop
    {
        static Db Db = Db.New(@"c:\temp\kengine.bin");
        public static Key[] ControlKeys = { Key.LeftCtrl, Key.RightCtrl, Key.LeftShift, Key.RightShift, Key.LeftAlt, Key.RightAlt };
        public static (Key, bool) IsKeyDown(Key key) => (key, Keyboard.IsKeyDown(key));
        public static EmitDelegate Emit(string eventText, params Prop[] args)
        {
            var def = args.Get("default");
            var what = ("what", eventText);  
            Prop[] EmitFunc(params Prop[] emitArgs)
            {
                var obj = emitArgs.Concat(("when", DateTime.UtcNow), what);
                Db.Write(obj);
                return obj;
            }
            EmitFunc(("value", def.Item2));
            
            return EmitFunc;
        }
         
        public static void BuildState()
        {
            foreach (var item in Db.GetItems().Cast<Prop[]>())
            {
                
            }
        }
        public static Prop New()
        {
            return new Prop();
        }

        public string Item1 { get; set; }
        public object Item2 { get; set; }
        public static implicit operator Prop((string, object) t)
        {
            return new Prop() {Item1 = t.Item1, Item2 = t.Item2};
        }
    }
}

