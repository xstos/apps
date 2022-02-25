using System.Drawing;
using System.Runtime.InteropServices;

namespace KriterisEngine
{
    /// <summary>
    /// Represents a PixelFormats.Bgra32 format pixel
    /// </summary>
    [StructLayout(LayoutKind.Explicit)]
    public struct BGRA
    {
        // 32 bit BGRA 
        [FieldOffset(0)]
        public readonly uint ColourBGRA;

        // 8 bit components
        [FieldOffset(0)]
        public byte Blue;

        [FieldOffset(1)]
        public byte Green;

        [FieldOffset(2)]
        public byte Red;

        [FieldOffset(3)]
        public byte Alpha;

        public static int SizeInBytes;
        public int ToInt()
        {
            return (int)ColourBGRA;
        }

        static BGRA()
        {
            SizeInBytes = Marshal.SizeOf(new BGRA());
        }

        public static implicit operator Color(BGRA bgra)
        {
            return Color.FromArgb(bgra.Alpha, bgra.Red, bgra.Green, bgra.Blue);
        }

        public static implicit operator BGRA(Color color)
        {
            return new BGRA() {Alpha = color.A, Blue = color.B, Red = color.R, Green = color.G};
        }
    }
}