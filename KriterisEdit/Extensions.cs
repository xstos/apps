﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Xml.Linq;

namespace KriterisEdit
{
    public static partial class Extensions
    {
        public static string _ReadAllText(this string path)
        {
            return File.ReadAllText(path);
        }

        public static XElement _ParseXml(this string text)
        {
            return XElement.Parse(text);
        }

        public static T[] _Arr<T>(params T[] items) => items;

        public static T _Content<T>(this T _, object content) where T : ContentControl
        {
            _.Content = content;
            return _;
        }

        public static TextBox _Content(this TextBox _, string text)
        {
            _.Text = text;
            return _;
        }
        public static Button _Button() => new Button();
        public static ListView _ListView() => new ListView();
        public static DockPanel _DockPanel() => new DockPanel();
        public static StackPanel _StackPanel() => new StackPanel();
        public static TextBox _TextBox(string? content = null)
        {
            var ret = new TextBox();
            ret.VerticalAlignment = VerticalAlignment.Center;
            ret.Text = content;
            return ret;
        }

        public static Label _Label(object? content = null)
        {
            var ret = new Label();
            ret.VerticalAlignment = VerticalAlignment.Center;
            ret.Content = content;
            return ret;
        }

        public static StackPanel _Orientation(this StackPanel _, Orientation o)
        {
            _.Orientation = o;
            return _;
        }
        public static string[] _GetDroppedFiles(this DragEventArgs e)
        {
            if (!e.Data.GetDataPresent(DataFormats.FileDrop)) return new string[0];
            return (string[]) e.Data.GetData(DataFormats.FileDrop);
        }
        public static Action<Handler> SetHandler = (Handler _) => 
            Global.Instance.Handlers[_.Name] = _;
        
        public static T _OnDrop<T>(this T _, string name, Action<T, DragEventArgs> handler) where T : UIElement
        {
            void OnDrop(object sender, DragEventArgs args) => handler(_, args);
            _.AllowDrop = true;
            _.Drop += OnDrop;

            void Unsub() => _.Drop -= OnDrop;

            SetHandler((name, _, Unsub));
            return _;
        }

        public static T _Min<T>(this T _, double? width = null, double? height = null) where T : FrameworkElement
        {
            if (width != null) _.MinWidth = (double) width;
            if (height != null) _.MinHeight = (double) height;
            return _;
        }

        public static T _Max<T>(this T _, double? width = null, double? height = null) where T : FrameworkElement
        {
            if (width != null) _.MaxWidth = (double) width;
            if (height != null) _.MaxHeight = (double) height;
            return _;
        }

        public static T _Content<T>(this T _, params UIElement[] children) where T : Panel
        {
            foreach (var child in children)
            {
                _.Children.Add(child);
            }

            return _;
        }

        public static ListView _Content(this ListView _, params object[] items)
        {
            _.Items.Clear();
            var coll = _.Items;
            foreach (var item in items)
            {
                coll.Add(item);
            }

            return _;
        }

        public static T _Dock<T>(this T _, Dock dock) where T : UIElement
        {
            System.Windows.Controls.DockPanel.SetDock(_, dock);
            return _;
        }

        public static Dictionary<TKey, IGrouping<TKey,TValue>> _ToDictionary<TKey, TValue>(this ILookup<TKey, TValue> lookup) where TKey: notnull
        {
           return lookup.ToDictionary(grp => grp.Key, grp => grp);
        }
        
        public static ILookup<string, T> _Bucket<T>(this IEnumerable<T> items,params (string, Func<T, bool >)[] predicates)
        {
            bool True(T _) => true;

            var defaultCase = ("", (Func<T, bool>) True);
            var predicatesWithDefault = predicates.Concat(new[] {defaultCase}).ToArray();
            return items.ToLookup(_ => predicatesWithDefault.First(p => p.Item2(_)).Item1);
        }
        public static void _BucketExample()
        {
            _Arr(1, 2, 3)
                ._Bucket(("odd", _IsOdd), ("even", _IsEven))
                ._ToDictionary();
            /* returns
                {
                    "odd": [1,3],
                    "even": [2]
                }
            */
        }
        
        public static bool _IsOdd(this int value) => value % 2 != 0;

        public static bool _IsEven(this int value) => value % 2 == 0;

        public static T Do<T>(this T _, Action<T> callback)
        {
            callback(_);
            return _;
        }
        
        
    }
}