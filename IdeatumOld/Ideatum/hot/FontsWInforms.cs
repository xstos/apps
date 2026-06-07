using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Brushes = System.Drawing.Brushes;
using Color = System.Drawing.Color;
using Font = System.Drawing.Font;
using Graphics = System.Drawing.Graphics;
using GraphicsPath = System.Drawing.Drawing2D.GraphicsPath;
using Matrix = System.Drawing.Drawing2D.Matrix;
using PixelFormat = System.Drawing.Imaging.PixelFormat;
using Point = System.Drawing.Point;
using Rectangle = System.Drawing.Rectangle;

namespace RENAME_ME;

public static class FontsWInforms
{
    public static Sprite Test(string s)
    {
        // Source - https://stackoverflow.com/a/43268265
        var f2 = new Font("Courier New",1f);
        var wid = 600;
        var hei = 500;
        Bitmap bmp = new Bitmap(wid, hei, PixelFormat.Format32bppArgb);
        GraphicsPath gp = new GraphicsPath();
        //var wb = new WriteableBitmap(100, 100, 96.0d, 96.0d, PixelFormats.Bgra32, null);
        using (Graphics g = Graphics.FromImage(bmp))
        using (Font f = new Font("Jetbrains Mono", 40f))
        {
            g.ScaleTransform(8,8);
            gp.AddString(s, f.FontFamily, 0, 70, new Point(-10, -15), StringFormat.GenericDefault);
            g.DrawPath(Pens.Gray, gp);
            gp.Flatten(new Matrix(), 5f);  // <<== *
            g.DrawPath(Pens.DarkSlateBlue, gp);
            for (int i = 0; i < gp.PathPoints.Length; i++)
            {
                PointF p = gp.PathPoints[i];
                g.FillEllipse(Brushes.DarkOrange, p.X-1, p.Y-1 , 1, 1);
                g.DrawString(Math.Round(p.X,0)+","+ Math.Round(p.Y,0),f2,new SolidBrush(Color.White),p.X,p.Y);
            }
            
        }

        return new Sprite(bmp.ToInts(), wid, hei);
    }
    public static int[] ToInts(this Bitmap bitmap)
    {
        // Lock the bitmap's bits into system memory
        Rectangle rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
        BitmapData bitmapData = bitmap.LockBits(rect, ImageLockMode.ReadOnly, bitmap.PixelFormat);

        try
        {
            // Get the address of the first line of pixels
            IntPtr ptr = bitmapData.Scan0;

            // Calculate the total number of bytes.
            // Stride is the number of bytes for one scan line, which may include padding.
            int totalBytes = Math.Abs(bitmapData.Stride) * bitmap.Height;
        
            // Create a byte array to hold the pixel data
            byte[] pixelBytes = new byte[totalBytes];
            // Copy the data from the pointer into the byte array
            Marshal.Copy(ptr, pixelBytes, 0, totalBytes);
            int[] ret = new int[pixelBytes.Length / 4];
            Buffer.BlockCopy(pixelBytes, 0, ret, 0, pixelBytes.Length);
            return ret;
        }
        finally
        {
            // Always unlock the bits to avoid resource leaks
            bitmap.UnlockBits(bitmapData);
        }
    }
}