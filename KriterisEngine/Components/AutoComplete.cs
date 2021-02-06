using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.VisualBasic.CompilerServices;

namespace KriterisEngine
{
    public class AutoComplete
    {
        public static UIElement ExampleUsage()
        {
            static IEnumerable<string> Sort(string searchText, IEnumerable<string> items)
            {
                items
                    .Select(item => (searchText.LevenshteinDistance(item), item))
                    .OrderBy(tuple => tuple.Item1)
                    .Select(tuple => tuple.item).ToList().Out(out var ret);
                return ret;
            }

            new[]
            {
                "aaa",
                "aa",
                "a",
                "apple",
                "mango",
            }.NewAutoComplete((searchText, item) => item.Contains(searchText), Sort, context =>
            {
                context.SearchBox.KeyUp += (sender, args) =>
                {
                    var selectedItem = context.GetSelectedItem();
                    if (selectedItem == null) return;
                    switch (args.Key)
                    {
                        case Key.Oem3: // `
                            // do something with item
                            break;
                    }
                };
                context.SearchBox.SetFocus();
            }).Out(out var el);
            return el;
        }
    }
    public class AutoComplete<T>
    {
        public StackPanel Control { get; set; }
        public ListBox SearchResults { get; set; }
        public TextBox SearchBox { get; set; }
        public Func<T> GetSelectedItem { get; }

        public AutoComplete()
        {
            GetSelectedItem = () =>
            {
                var se = SearchResults.SelectedItems;
                return default;
            };
        }
    }
    public class FilteringSortingListBox<T>
    {
        public ListBox ListBox { get; set; }
        public Action RefreshItems { get; set; }
    }
    public class ListBoxItemData<T>
    {
        public T Item { get; set; }
        public override string ToString()
        {
            return Item.ToString();
        }
    }
    public static class Ext
    {
        public static FilteringSortingListBox<T> NewListBox<T>(this IEnumerable<T> items, Func<T, bool> filter, Func<IEnumerable<T>, IEnumerable<T>> sort)
        {
            new ListBox().Out(out var lb);
            var itemData = items.Select(item => new ListBoxItemData<T>() { Item = item }).ToList();
            lb.ItemsSource = itemData;
            
            void RefreshItems()
            {
                var sorted = sort(items);
                itemData.Zip(sorted, (a, b) => (a, b)).Out(out var zipped);
                zipped.ForEach(pair => pair.a.Item = pair.b);
                lb.Items.Filter = o => filter(o.As<ListBoxItemData<T>>().Item);
                lb.Items.Refresh();
            }

            return new FilteringSortingListBox<T>()
            {
                ListBox = lb,
                RefreshItems = RefreshItems
            };
        }
        public static UIElement NewAutoComplete<T>(this IEnumerable<T> items, Func<string, T, bool> filter, Func<string, IEnumerable<T>, IEnumerable<T>> sort, Action<AutoComplete<T>> loaded)
        {
            new AutoComplete<T>().Out(out var context);

            var parentPanel = new StackPanel();
            var searchBox = new TextBox();

            bool Filter(T item) => filter(searchBox.Text, item);
            IEnumerable<T> Sort(IEnumerable<T> foo) => sort(searchBox.Text, foo);

            var filteringListBox = items.NewListBox(Filter, Sort);
            var searchResults = filteringListBox.ListBox;
            parentPanel.Width = 200;
            parentPanel.Height = 500;
            searchBox.Dock(Dock.Top);

            searchBox.TextChanged += (sender, args) =>
            {
                filteringListBox.RefreshItems();
            };

            
            
            parentPanel.PreviewKeyDown += (sender, args) =>
            {
                switch (args.Key)
                {
                    case Key.Down:
                        searchResults.MoveSelection(1);
                        args.Handled = true;
                        break;
                    case Key.Up:
                        searchResults.MoveSelection(-1);
                        args.Handled = true;
                        break;
                }
            };
            parentPanel.Children.Add(searchBox);
            parentPanel.Children.Add(searchResults);

            context.Control = parentPanel;
            context.SearchBox = searchBox;
            context.SearchResults = searchResults;
            loaded(context);

            return parentPanel;
        }
    }
}