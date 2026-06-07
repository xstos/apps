using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace RENAME_ME;

public class SplitPanel : Canvas
{
    public readonly DockPanel First;
    public readonly DockPanel Second;

    public SplitPanel(UIElement f)
    {
        FrameworkElement Parent() => VisualTreeHelper.GetParent(this) as FrameworkElement;
        First = new DockPanel();
        First.LastChildFill = true;
        First.Background = Brushes.Black;
        First.Children.Add(f);//
        First.SizeChanged += (sender, args) =>
        {
            Console.WriteLine("First sizechg " + First.ActualWidth+" "+First.ActualHeight);

        };
        Second = new DockPanel();
        Second.LastChildFill = true;
        Second.Background = Brushes.Black;
        Children.Add(First);
        Children.Add(Second);
        SizeChanged += (sender, args) =>
        {
            var sz = args.NewSize;
            Resize(sz);
        };

        void Resize(Size sz)
        {
            var h = sz.Height;
            var h2 = h / 2;
            var (a, b) = (TopElement: First, BottomElement: Second);
            var w = sz.Width;
            (a.Width,a.Height) = (w, h2-0.2);
            (b.Width,b.Height) = (w, h2);
            SetTop(a,0);
            SetLeft(a,0);
            SetRight(a,w);
            SetBottom(a,h2);
            SetTop(b,h2);
            SetLeft(b,0);
            SetRight(b,w);
            SetBottom(b,h);
            
        }
        
        Loaded += (sender, args) =>
        {
            var p = Parent();
            var rs = new Size(p.ActualWidth, p.ActualHeight); 
            Resize(rs);
            Console.WriteLine(p.ActualWidth+" "+p.ActualHeight);
        };
    }
}