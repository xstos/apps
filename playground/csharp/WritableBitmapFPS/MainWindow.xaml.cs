using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace WritableBitmapFPS;

public class Pixels : Grid
{
    public Action Update = () => { };
    public int[] Buffer = [];
    public Pixels()
    {
        WriteableBitmap bmp;
        Int32Rect rect;
        GCHandle gcHandle = new GCHandle();
        Image img = new Image();
        Children.Add(img);
        SizeChanged += (sender, args) =>
        {
            var newSizeWidth = args.NewSize.Width;
            var newSizeHeight = args.NewSize.Height;
            Init(newSizeWidth, newSizeHeight);
        };
        
        Unloaded += (sender, args) =>
        {
            if (gcHandle.IsAllocated) gcHandle.Free();
        };

        void Init(double newSizeWidth, double newSizeHeight)
        {
            if (gcHandle.IsAllocated) gcHandle.Free();
            var width = (int)Math.Floor(newSizeWidth);
            var height = (int)Math.Floor(newSizeHeight);
            var dpiScale = VisualTreeHelper.GetDpi(Application.Current.MainWindow);
            bmp = new WriteableBitmap(width, height, dpiScale.DpiScaleX, dpiScale.DpiScaleY, PixelFormats.Bgra32, null);
            Array.Resize(ref Buffer,width*height);
            GCHandle.Alloc(Buffer, GCHandleType.Pinned);
            rect = new Int32Rect(0, 0, width, height);
            int stride = bmp.BackBufferStride; // (width * 32 + 7) / 8;
            img.Source = null;
            img.Source = bmp;
            Action<Int32Rect, Array, int, int> writePixels = bmp.WritePixels;
            var buffer = Buffer;
            Update = () =>
            {
                writePixels(rect, buffer, stride, 0);
            };
        }
    }
}
/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        var img = new Pixels();
        Grid.Children.Add(img);
        Loaded += (sender, args) =>
        {
            int frames = 0;
            byte r = 0;

            var renderTimer = new DispatcherTimer(DispatcherPriority.Render);
            renderTimer.Interval = TimeSpan.FromMilliseconds(1);
            renderTimer.Tick += (s, e) =>
            {
                img.Update();
                frames++;
            };
            renderTimer.Start();
        
            var fpsTimer = new DispatcherTimer();
            fpsTimer.Interval = TimeSpan.FromSeconds(1);
            fpsTimer.Tick += (s, e) =>
            {
                Title = frames+"";
                frames = 0;
            };
            fpsTimer.Start();
            int c = 0;
        
            Thread t2 = new Thread(o =>
            {
                while (true)
                {
                    Array.Fill(img.Buffer,BitConverter.ToInt32([r,0,0,255]));
                    r += 1;
                    Thread.Sleep(10);
                }
            });
            t2.IsBackground = true;
            t2.Start();
        };
        
        
        
    }
}