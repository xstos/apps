using System;
using Ideatum;

namespace RENAME_ME
{
    public static class Hot
    {
        public static void Run()
        {
            Program.Render = (pixels, width, height) =>
            {
                var len = pixels.Length;
                var c = BitConverter.ToInt32([0, 128, 0, 0]);
                for (int i = 0; i < len; i++)
                {
                    pixels[i] = c;
                }
            };
        }
        
    }
}
