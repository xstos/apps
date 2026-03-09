using System;
using Ideatum;

namespace RENAME_ME
{
    public static class Hot
    {
        static char TheWay = '道';
        public static void Run()
        {
            var NextColor = Program.MakeGetNextHue(1000);
            void RenderDemo(int[] mypixels, int w, int h)
            {
                int c = NextColor();
                var len = mypixels.Length;
                for (var i = 0; i < len; i++)
                {
                    mypixels[i] = c;
                }
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
            Program.Render = Render;
            
        }
        
    }
}
