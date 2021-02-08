using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using static KriterisEngine.Common;
namespace KriterisEngine
{
    public class AutoComplete
    {
        public static UIElement ExampleUsage()
        {
            static bool Filter(string searchText, string item) => item.Contains(searchText);
            static IEnumerable<string> Sort(IEnumerable<string> items, string searchText) => items.SortLevenstein(searchText);

            new[]
            {
                "aaa",
                "aa",
                "a",
                "apple",
                "mango",
            }.NewAutoComplete(Filter, Sort, context =>
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
    
    public static partial class Component
    {
        public static FilterSortListBox<T> NewFilterSortListBox<T>(this IEnumerable<T> items, Func<T, bool> filter, Func<IEnumerable<T>, IEnumerable<T>> sort)
        {
            New<ListBox>().Out(out var lb);
            var itemData = items.Wrap().ToList();
            lb.ItemsSource = itemData;
            
            void RefreshItems()
            {
                var sorted = sort(items);
                itemData.Zip(sorted, (itemDatum, newValue) => (itemDatum, newValue)).Out(out var zipped);
                zipped.ForEach(pair => pair.itemDatum.Value = pair.newValue);
                lb.Items.Filter = (o) => filter(o.As<WrappedValue<T>>().Value);
                lb.Items.Refresh();
            }

            return new FilterSortListBox<T>()
            {
                ListBox = lb,
                RefreshItems = RefreshItems
            };
        }
        public static UIElement NewAutoComplete<T>(this IEnumerable<T> items, Func<string, T, bool> filter, Func<IEnumerable<T>,string, IEnumerable<T>> sort, Action<AutoComplete<T>> loaded)
        {
            new AutoComplete<T>().Out(out var context);

            var container = New<StackPanel>();
            var searchBox = New<TextBox>();

            bool Filter(T item) => filter(searchBox.Text, item);
            IEnumerable<T> Sort(IEnumerable<T> itemsToSort) => sort(itemsToSort, searchBox.Text);

            var filteringListBox = items.NewFilterSortListBox(Filter, Sort);
            var searchResults = filteringListBox.ListBox;
            container.Width = 200;
            container.Height = 500;
            searchBox.Dock(Dock.Top);

            searchBox.TextChanged += (sender, args) =>
            {
                filteringListBox.RefreshItems();
            };
            
            container.PreviewKeyDown += (sender, args) =>
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
            container.Children.Add(searchBox);
            container.Children.Add(searchResults);

            context.Container = container;
            context.SearchBox = searchBox;
            context.SearchResults = searchResults;
            filteringListBox.RefreshItems();
            loaded(context);
            return container;
        }
    }
}