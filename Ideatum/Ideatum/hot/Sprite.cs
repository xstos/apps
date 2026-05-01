namespace RENAME_ME;

public struct Sprite
{
    public int Width;
    public int Height;
    public int[] Data;

    public Sprite(int[] data, int width, int height)
    {
        Data = data;
        Width = width;
        Height = height;
    }
    public void Clear(int color)
    {
        var surface = Data;
        for (int i = 0; i < surface.Length; i++)
        {
            surface[i] = color;
        }
    }
}