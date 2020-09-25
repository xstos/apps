using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace KriterisEdit
{
    public static partial class Extensions
    {
        public static T AddCell<T>(this T grid, UIElement el, int rowIndex, int columnIndex) where T : Grid
        {
            grid.Children.Add(el);
            Grid.SetColumn(el, columnIndex);
            Grid.SetRow(el, rowIndex);
            return grid;
        }

        public static GridSplitter _SplitterCol()
        {
            new GridSplitter()
            {
                Width = 3, HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Stretch,
                ResizeBehavior = GridResizeBehavior.CurrentAndNext,
                Background = Brushes.Yellow,
            }.Var(out var gs);
            return gs;
        }

        public static GridSplitter _SplitterRow()
        {
            new GridSplitter()
            {
                Height = 3, HorizontalAlignment = HorizontalAlignment.Stretch,
                VerticalAlignment = VerticalAlignment.Bottom,
                ResizeBehavior = GridResizeBehavior.CurrentAndNext,
                Background = Brushes.Yellow,
            }.Var(out var gs);
            return gs;
        }

        public static T SetShowGridLines<T>(this T grid, bool show) where T : Grid
        {
            grid.ShowGridLines = show;
            return grid;
        }

        public static GridRowBuilder Rows<T>(this T grid) where T:Grid
        {
            return grid;
        }

        public static T EnsureCapacity<T>(this T grid, int rows, int cols) where T : Grid
        {
            var len = new GridLength(1, GridUnitType.Star);
            cols.Subtract(grid.ColumnDefinitions.Count)
                .Repeat(()=>new ColumnDefinition() {Width = len})
                .ForEach(grid.ColumnDefinitions.Add);
            
            rows.Subtract(grid.RowDefinitions.Count)
                .Repeat(()=>new RowDefinition() {Height = len})
                .ForEach(grid.RowDefinitions.Add);
            return grid;
        }
        
        public static IEnumerable<UIElement> GetChildren(this Grid grid, int row, int column)
        {
            return grid.Children.Cast<UIElement>().Where(e => Grid.GetRow(e) == row && Grid.GetColumn(e) == column);
        }
    }
}