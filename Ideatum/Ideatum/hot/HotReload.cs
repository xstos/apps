using System;
using Ideatum;

namespace RENAME_ME
{
    public static class Hot
    {
        static char TheWay = '道';
        public static void Run()
        {
            Program.Render = Render;
        }

        static void Render(int[] pixels, int width, int height)
        {
            var len = pixels.Length;
            var c = BitConverter.ToInt32([0, 0, 128, 0]);
            for (int i = 0; i < len; i++)
            {
                pixels[i] = c;
            }
        }
    }
}
