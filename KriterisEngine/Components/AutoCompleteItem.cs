using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace KriterisEngine
{
    public delegate void AutoCompleteFilterDelegate(ListBoxItem lbi, AutoCompleteItem aci, string text);
    public delegate void AutoCompleteRegisterDelegate(ListBox lb, TextBox tb);
    public class AutoCompleteItem
    {
        public object Data { get; private set; }
        public Func<object> GetItem { get; private set; } = () => new TextBlock() {Text = Guid.NewGuid().ToString("N")};
        public Func<string, bool> Search { get; private set; }
        
        AutoCompleteItem()
        {   
            Search = s => Data.ToString().Contains(s);
        }
        
        public static AutoCompleteItem New(string text, object data = null)
        {
            return new AutoCompleteItem()
            {
                GetItem = () => new TextBlock() {Text = text},
                Data = data ?? text ?? "",
            };
        }

        public static implicit operator AutoCompleteItem(string text) => New(text);
    }

    public static class AutoComplete
    {
        public static void Filter(ListBoxItem lbi, AutoCompleteItem aci, string searchText)
        {
            if (string.IsNullOrEmpty(searchText))
            {
                lbi.Visibility = Visibility.Visible;
                return;
            }

            lbi.Visibility = aci.Search(searchText)
                ? Visibility.Visible
                : Visibility.Collapsed;
        }
        
        public static UIElement New(this IEnumerable<AutoCompleteItem> items,
            AutoCompleteRegisterDelegate register = null, AutoCompleteFilterDelegate filter = null)
        {
            var sp = new StackPanel();
            var lb = new ListBox();
            sp.Width = 200; 
            sp.Height = 500;
            var tb = new TextBox();
            tb.Dock(Dock.Top);
            tb.TextChanged += (sender, args) =>
            {
                var txt = tb.Text;
                foreach (var o in lb.Items.Cast<ListBoxItem>())
                {
                    var tc = filter ?? Filter;
                    tc(o, o.Tag as AutoCompleteItem, txt);
                }
            };
            
            foreach (var item in items)
            {
                var lbi = new ListBoxItem {Tag = item, Content = item.GetItem()};
                lb.Items.Add(lbi);
                
            }
            sp.Children.Add(tb);
            sp.Children.Add(lb);
            register?.Invoke(lb, tb);
            return sp;
        }
        
        public static UIElement Example(AutoCompleteRegisterDelegate register)
        {
            var autoComplete = new AutoCompleteItem[]
            {
                AutoCompleteItem.New("banana"),
                AutoCompleteItem.New("apple"),
                AutoCompleteItem.New("mango"),
            };
            return autoComplete.New(register);
        }
    }
}