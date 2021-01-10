using System;
using System.Drawing;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows;

namespace KriterisEngine
{
    public sealed class Sprite
    {
        public GCHandle Handle;
        public BGRA[,] Data;
        
        public IntPtr Ptr;
        public Int32Rect Rect;
        public Rectangle Rect2;
        public int NumBytesInt;
        public UIntPtr NumBytesUIntPtr;
        public int Width;
        public int Height;
        public int NumElements;

        public static Sprite New(int width, int height)
        {
            var ret = new Sprite();
            Init(ret,width,height);
            return ret;
        }
        static unsafe void FillUnSafe(Sprite surface, BGRA value)
        {
            var len = surface.NumElements - 1;
            var ptr = (BGRA*)surface.Ptr;
            for (var i = len; i >= 0; i--)
            {
                ptr[i] = value;
            }
        }

        public void Draw(Sprite item, int x, int y)
        {
            Draw(item, this, x, y);
        }
        static void Draw(Sprite source, Sprite destination, int x, int y)
        {
            var offsetWidth = source.Width + x;
            var offsetHeight = source.Height + y;
            var drawWidth = Math.Min(offsetWidth, destination.Width);
            var drawHeight = Math.Min(offsetHeight, destination.Height);
            for (int i = 0; i < drawHeight; i++)
            {
                for (int j = 0; j < drawWidth; j++)
                {
                    var src = source.Data[i, j];
                    if (src.Alpha==0) continue;
                    destination.Data[i + x, j + y] = src;
                }
            }
        }
        public Sprite Fill(Func<int, int, BGRA, BGRA> selector)
        {
            for (int i = 0; i < Height; i++)
            {
                for (int j = 0; j < Width; j++)
                {
                    Data[i,j] = selector(i, j, Data[i,j]);
                }
            }

            return this;
        }
        public Sprite Fill(BGRA value) => Fill(this,value);

        public static Sprite Fill(Sprite surface, BGRA value)
        {
            FillUnSafe(surface,value);
            return surface;
        }
        public static void Init(Sprite surface, int width,int height)
        {
            surface.Width = width;
            surface.Height = height;
            surface.Data = new BGRA[height,width];
            surface.Handle = GCHandle.Alloc(surface.Data, GCHandleType.Pinned);
            surface.Ptr = surface.Handle.AddrOfPinnedObject();
            surface.Rect = new Int32Rect(0, 0, width, height);
            surface.Rect2 = new Rectangle(0, 0, width, height);
            surface.NumBytesInt = width*height*BGRA.SizeInBytes;
            surface.NumBytesUIntPtr = new UIntPtr((uint)surface.NumBytesInt);
            surface.NumElements = width*height;
        }
        static Sprite empty = new Sprite();
        public static Sprite Empty => empty;

        
        public static void Dispose(Sprite surface)
        {
            Free(surface);
        }

        static void Free(Sprite surface)
        {
            surface.Handle.Free();
            surface.Handle = new GCHandle();
            surface.Data = null;
            surface.Ptr = IntPtr.Zero;
        }

        public void Dispose()
        {
            Dispose(this);
        }
    }
}