using Avalonia.Controls;

namespace derpide;

public static class Ext
{
    public static T _Dock<T>(this T _, Dock dock) where T : Control
    {
        DockPanel.SetDock(_, dock);
        return _;
    }
}