using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Forms.Integration;
using System.Windows.Media;

namespace RENAME_ME;

public class BlitSurface : WindowsFormsHost
{
    public Sprite Surface;
    static bool NoOpBool() => false;
    public Action Blit = () => { };
    public Func<bool> Resize=NoOpBool;
    public BlitSurface()
    {
        var hSrc = new HwndSource2();
        var hDCGraphics = hSrc.CreateGraphics();
        var hRef = new HandleRef(hDCGraphics, hDCGraphics.GetHdc());
        Child = hSrc;
        GCHandle gcHandle;
        BITMAPINFO bitmapInfo;
        int width=1, height=1;
        void Free() => gcHandle.Free();
        Alloc();
        void Alloc()
        {
            int w = width;
            int h = height;
            Console.WriteLine($"alloc {w} {h}");
            Surface = new Sprite(new int[w * h], w, h);
            gcHandle = GCHandle.Alloc(Surface.Data, GCHandleType.Pinned);
            bitmapInfo = GetBitmapInfo(w, h);
            Blit = () =>
            {
                Console.WriteLine($"alloc {w} {h}");
                SetDIBitsToDevice(hRef, 0, 0, w, h, 0, 0, 0, h, ref Surface.Data[0], ref bitmapInfo, 0);
            };
        }
        Loaded += (sender, args) =>
        {
            var parent = VisualTreeHelper.GetParent(this) as FrameworkElement;
            width = (int)parent.ActualWidth;
            height = (int)parent.ActualHeight;
            Console.WriteLine($"blitsurface load {width} {height}");
            
            Alloc();
        };
        SizeChanged += (sender, args) =>
        {
            var nw = (int)args.NewSize.Width;
            var nh = (int)args.NewSize.Height;
            Console.WriteLine($"blitsurface resize {nw} {nh}");
            
            Resize = () =>
            {
                Free();
                width = nw;
                height = nh;
                Alloc();
                Resize = NoOpBool;
                return true;
            };
        };
    }
    [DllImport("gdi32")]
    internal static extern int SetDIBitsToDevice(HandleRef hDC, int xDest, int yDest, int dwWidth, int dwHeight, int XSrc, int YSrc, int uStartScan, int cScanLines, ref int lpvBits, ref BITMAPINFO lpbmi, uint fuColorUse);

    [StructLayout(LayoutKind.Sequential)]
    internal struct BITMAPINFOHEADER
    {
        public int		bihSize;
        public int		bihWidth;
        public int		bihHeight;
        public short	bihPlanes;
        public short	bihBitCount;
        public int		bihCompression;
        public int		bihSizeImage;
        public double	bihXPelsPerMeter;
        public double	bihClrUsed;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct BITMAPINFO
    {
        public BITMAPINFOHEADER biHeader;
        public int biColors;
    }
        
    internal static BITMAPINFO GetBitmapInfo(int width, int height)
    {
        return new BITMAPINFO
        {
            biHeader =
            {
                bihBitCount = 32,
                bihPlanes = 1,
                bihSize = 40,
                bihWidth = width,
                bihHeight = -height,
                bihSizeImage = (width * height) << 2
            }
        };
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
        SetStyle(System.Windows.Forms.ControlStyles.Opaque, true);
        MinimumSize = new System.Drawing.Size(1, 1);
        
    }
}