using System.Runtime.InteropServices;

namespace Ideatum;

public static partial class I
{
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