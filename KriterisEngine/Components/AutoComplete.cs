using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace KriterisEngine
{
    public class AutoCompleteItem
    {
        public object Data { get; private set; }
        public Func<object> GetItem { get; private set; } = () => new TextBlock() {Text = Guid.NewGuid().ToString("N")};
        
        public static AutoCompleteItem New(string text, object data = null, Func<object> getItem=null)
        {
            object GetItemDefault() => new TextBlock() {Text = text};

            return new()
            {
                GetItem = getItem ?? GetItemDefault,
                Data = data ?? text ?? "",
            };
        }

        public static implicit operator AutoCompleteItem(string text) => New(text);
    }

    public class AutoComplete
    {
        public delegate bool _IsVisible(
            ListBoxItem listBoxItem, 
            AutoCompleteItem autoCompleteItem, 
            string searchText
        );
        public StackPanel Control { get; set; }
        public ListBox SearchResults { get; set; }
        public TextBox SearchBox { get; set; }
        public Func<AutoCompleteItem> GetSelectedItem { get; }
        /// <summary>
        /// Callback determining if a search result row is visible
        /// </summary>
        public _IsVisible IsVisible { get; set; } = (listBoxItem, autoCompleteItem, searchText) =>
            autoCompleteItem.Data.ToString().Contains(searchText);

        public AutoComplete()
        {
            GetSelectedItem = () =>
            (
                (SearchResults.SelectedItem as ListBoxItem)
                ?? SearchResults.GetListBoxItems().FirstOrDefault()
            )?.Tag as AutoCompleteItem;
        }
        
        static void Filter(ListBoxItem listBoxItem, string searchText, _IsVisible isVisible)
        {
            if (string.IsNullOrEmpty(searchText))
            {
                listBoxItem.Visibility = Visibility.Visible;
                return;
            }

            listBoxItem.Visibility = isVisible(listBoxItem, listBoxItem.Tag as AutoCompleteItem, searchText)
                ? Visibility.Visible
                : Visibility.Collapsed;
        }
        
        public static UIElement New(IEnumerable<AutoCompleteItem> items, Action<AutoComplete> loaded)
        {
            new AutoComplete().Out(out var context);
            
            var parentPanel = new StackPanel();
            var searchResults = new ListBox();
            var searchBox = new TextBox();

            parentPanel.Width = 200; 
            parentPanel.Height = 500;
            searchBox.Dock(Dock.Top);
            
            searchBox.TextChanged += (sender, args) =>
            {
                var searchText = searchBox.Text;
                searchResults
                    .GetListBoxItems()
                    .ForEach(o => Filter(o, searchText, context.IsVisible));
            };
            
            searchResults.AddItems(items, item => new ListBoxItem {Tag = item, Content = item.GetItem()});

            parentPanel.Children.Add(searchBox);
            parentPanel.Children.Add(searchResults);
            
            context.Control = parentPanel;
            context.SearchBox = searchBox;
            context.SearchResults = searchResults;
            loaded(context);
            
            return parentPanel;
        }
        
        public static UIElement ExampleUsage()
        {
            new AutoCompleteItem[]
            {
                "banana",
                "apple",
                "mango",
            }.New(context =>
            {
                context.SearchBox.KeyUp += (sender, args) =>
                {
                    var selectedItem = context.GetSelectedItem();
                    if (selectedItem == null) return;
                    var data = selectedItem.Data;
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
}