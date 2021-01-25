using System;
using System.Drawing;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Image = System.Windows.Controls.Image;

namespace KriterisEngine
{
    public static partial class Common
    {
        
        public static T[] Concat<T>(this T[] first, params T[] second)
        {
            var ret = new T[first.Length + second.Length];
            first.CopyTo(ret, 0);
            second.CopyTo(ret, first.Length);
            return ret;
        }
        public static T Out<T>(this T item, out T outVar)
        {
            outVar = item;
            return item;
        }
        public static string[] GetDroppedFiles(this DragEventArgs e)
        {
            if (!e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                return new string[0];
            }

            return (string[]) e.Data.GetData(DataFormats.FileDrop);
        }
        
        public static Image ToImage(this Bitmap bmp)
        {
            var img = new Image();
            img.Width = bmp.Width;
            img.Height = bmp.Height;
            RenderOptions.SetBitmapScalingMode(img, BitmapScalingMode.NearestNeighbor);
            img.Source = Imaging.CreateBitmapSourceFromHBitmap(
                bmp.GetHbitmap(), 
                IntPtr.Zero, 
                Int32Rect.Empty, 
                BitmapSizeOptions.FromWidthAndHeight(bmp.Width, bmp.Height));
            return img;
        }

        public static T Dock<T>(this T item, Dock dock) where T : UIElement
        {
            DockPanel.SetDock(item,dock);
            return item;
        }
        public static Border BorderAround<T>(this T item, System.Windows.Media.Color c) where T: UIElement
        {
            var b = new Border();
            b.BorderBrush = new SolidColorBrush(c);
            b.BorderThickness = new Thickness(1);
            b.Child = item;
            return b;
        }

        public static Prop Get(this Prop[] xs, string prop)
        {
            return xs.First(p => p.Item1 == prop);
        }

        public static T Add<T>(this T parent, params UIElement[] children) where T : UIElement, IAddChild 
        {
            foreach (var uiElement in children)
            {
                parent.AddChild(uiElement);
            }

            return parent;
        }
    }
    
}