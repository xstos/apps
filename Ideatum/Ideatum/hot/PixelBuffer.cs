using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace RENAME_ME;

public class PixelBuffer : Grid
{
    public Action Paint = () => { };
    public int[] Pixels = [];
    public Action Render = () => { };
    public PixelBuffer()
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
            Render();
            Paint();
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
            Array.Resize(ref Pixels,width*height);
            GCHandle.Alloc(Pixels, GCHandleType.Pinned);
            rect = new Int32Rect(0, 0, width, height);
            int stride = bmp.BackBufferStride; // (width * 32 + 7) / 8;
            img.Source = bmp;
            Action<Int32Rect, Array, int, int> writePixels = bmp.WritePixels;
            var buffer = Pixels;
            Paint = () =>
            {
                writePixels(rect, buffer, stride, 0);
            };
        }
    }
}