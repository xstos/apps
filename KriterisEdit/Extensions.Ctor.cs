using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;
using System.Windows.Media;
using System.Xml.Linq;

namespace KriterisEdit
{
    public static partial class Extensions
    {
        public static Button _Button(string text) => new Button() { Content = text};

        public static ListView _ListView(string name)
        {
            var ret = new ListView();
            ret.Name = name;
            //https://stackoverflow.com/a/53689641/1618433
            VirtualizingPanel.SetIsVirtualizing(ret, true);
            VirtualizingPanel.SetIsVirtualizingWhenGrouping(ret, true);
            VirtualizingPanel.SetVirtualizationMode(ret, VirtualizationMode.Recycling);
            //ScrollViewer.SetIsDeferredScrollingEnabled(ret,true);
            return ret;
        }

        public static TextBox _TextBox(string? name = null)
        {
            var ret = new TextBox();
            ret.Name = name ?? "TextBox_" + Guid.NewGuid().ToString("N");
            ret.VerticalAlignment = VerticalAlignment.Center;
            return ret;
        }

        public static Label _Label(object? content = null)
        {
            var ret = new Label();
            ret.VerticalAlignment = VerticalAlignment.Center;
            ret.Content = content;
            return ret;
        }

        public static Grid _Grid()
        {
            return new Grid();
        }
        public static DockPanel _DockPanel()
        {
            return new DockPanel();
        }
    }
}