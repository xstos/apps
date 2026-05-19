using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace WritableBitmapFPS;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        var bmp = new WriteableBitmap(1920, 1200, 96, 96, PixelFormats.Bgra32, null);
        var pixels = new int[1920 * 1200];
        var gcHandle = GCHandle.Alloc(pixels, GCHandleType.Pinned);
        int stride = (1920 * 32 + 7) / 8;
        
        var img = new Image();
        img.Source = bmp;
        Grid.Children.Add(img);
        int frames = 0;
        byte r = 0;

        void Write()
        {
            bmp.WritePixels(new Int32Rect(0,0,1920,1200),pixels,stride,0);
        }
        

        var renderTimer = new System.Windows.Threading.DispatcherTimer(DispatcherPriority.Background);
        renderTimer.Interval = TimeSpan.FromMilliseconds(0.01);
        renderTimer.Tick += (s, e) =>
        {
            Write();
            frames++;
        };
        renderTimer.Start();
        
        var fpsTimer = new System.Windows.Threading.DispatcherTimer();
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
                Array.Fill(pixels,BitConverter.ToInt32([r,0,0,255]));
                r += 1;
                Thread.Sleep(1);
            }
        });
        t2.IsBackground = true;
        t2.Start();
    }
}