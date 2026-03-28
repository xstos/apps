using System;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using CommunityToolkit.HighPerformance;

namespace Ideatum;

public static class Ext
{
    public static void Deconstruct<T>(this T[] array, out T t1)
    {
        t1 = array[0];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2)
    {
        t1 = array[0];
        t2 = array[1];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3, out T t4)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
        t4 = array[3];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3, out T t4, out T t5)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
        t4 = array[3];
        t5 = array[4];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3, out T t4, out T t5, out T t6)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
        t4 = array[3];
        t5 = array[4];
        t6 = array[5];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3, out T t4, out T t5, out T t6, out T t7)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
        t4 = array[3];
        t5 = array[4];
        t6 = array[5];
        t7 = array[6];
    }
    public static void Deconstruct<T>(this T[] array, out T t1, out T t2, out T t3, out T t4, out T t5, out T t6, out T t7, out T t8)
    {
        t1 = array[0];
        t2 = array[1];
        t3 = array[2];
        t4 = array[3];
        t5 = array[4];
        t6 = array[5];
        t7 = array[6];
        t8 = array[7];
    }

    public static Span2D<T> Slice2D<T>(this T[] array, int height, int width)
    {
        var mem = new Memory2D<T>(array, height, width);
        var dest = mem.Slice(0, 0, height, width);
        return dest.Span;
    }
    public static Span<T> AsSpan<T>(this Array array)
    {
        return MemoryMarshal.CreateSpan(ref Unsafe.As<byte, T>(ref MemoryMarshal.GetArrayDataReference(array)), array.Length);
    }
}