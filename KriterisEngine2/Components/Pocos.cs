using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Controls;

namespace KriterisEngine
{
    public class AutoComplete<T>
    {
        public StackPanel Container { get; set; }
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
    public class FilterSortListBox<T>
    {
        public ListBox ListBox { get; set; }
        public Action RefreshItems { get; set; }
    }
    public class WrappedValue<T>
    {
        public T Value { get; set; }
        public override string ToString()
        {
            return Value.ToString();
        }
    }
}
