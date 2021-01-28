using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Image = System.Windows.Controls.Image;
using static KriterisEngine.Global;

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
            DockPanel.SetDock(item, dock);
            return item;
        }

        public static Border BorderAround<T>(this T item, System.Windows.Media.Color c) where T : UIElement
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

        public static T New<T>(Action<T> init = null) where T : new()
        {
            new T().Out(out var ret);
            init?.Invoke(ret);
            G.Event(EventTypes.New, ret);
            return ret;
        }

        public static T AddChildren<T>(this T parent, params UIElement[] children) where T : UIElement, IAddChild
        {
            foreach (var child in children)
            {
                G.Event(EventTypes.Add, (parent, child));
                parent.AddChild(child);
            }

            return parent;
        }
        public static T Build<T>(this T el) where T : UIElement
        {
            
            if (el is TextBox textBox)
            {
                textBox.Width = 200;
            } else if (el is TextBlock textBlock)
            {
                
            } else if (el is WrapPanel wrapPanel)
            {
                FocusManager.SetIsFocusScope(wrapPanel, true);
                wrapPanel.Children.Add(new TextBlock() {Text = "\x2007"});
            }

            return el;
        }
        
        public static P AddItems<T, P>(this P parent, IEnumerable<T> items, Func<T, ListBoxItem> itemGenerator)
            where P : ItemsControl
        {
            var list = parent.Items;
            foreach (var item in items)
            {
                list.Add(itemGenerator(item));
            }

            return parent;
        }

        public static IEnumerable<ListBoxItem> GetListBoxItems(this ItemsControl parent)
        {
            return parent.Items.Cast<ListBoxItem>();
        }

        public static void ForEach<T>(this IEnumerable<T> items, Action<T> action)
        {
            foreach (var item in items)
            {
                action(item);
            }
        }

        public static UIElement New(this IEnumerable<AutoCompleteItem> items, Action<AutoComplete> loaded)
        {
            return AutoComplete.New(items, loaded);
        }

        public static T SetFocus<T>(this T el) where T : UIElement
        {
            //https://www.codeproject.com/tips/478376/setting-focus-to-a-control-inside-a-usercontrol-in
            //https://stackoverflow.com/questions/9535784/setting-default-keyboard-focus-on-loading-a-usercontrol
            Global.G.Dispatcher().InvokeAsync(() => { el.Focus(); }, DispatcherPriority.ContextIdle);
            return el;
        }
    }
}