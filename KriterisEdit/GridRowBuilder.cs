using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace KriterisEdit
{
    public class GridRowBuilder
    {
        List<UIElement[]> rows = new List<UIElement[]>();
        public int NumColumns { get; private set; } = 0;
        public int NumRows => rows.Count;
        public Func<Grid> Build { get; set; }
        public GridRowBuilder this[params UIElement[] controls]
        {
            get
            {
                NumColumns = Math.Max(NumColumns, controls.Length);
                rows.Add(controls);
                return this;
            }
            set { }
        }
        GridRowBuilder() { }
        public static implicit operator GridRowBuilder(Grid grid)
        {
            new GridRowBuilder().Var(out var ret);

            ret.Build = () =>
            {
                grid.EnsureCapacity(ret.NumRows, ret.NumColumns);
                ret.rows.Select((UIElement[] row, int rowIndex) =>
                {
                    return row.Select((UIElement el, int colIndex) =>
                    {
                        grid.AddCell(el, rowIndex, colIndex);
                        if (rowIndex + 1 != ret.NumRows)
                        {
                            grid.AddCell(Extensions._SplitterRow(), rowIndex, colIndex);
                        }
                        if (colIndex + 1 != ret.NumColumns)
                        {
                            grid.AddCell(Extensions._SplitterCol(), rowIndex, colIndex);
                        }
                        return el;
                    }).ForEach();
                }).ForEach();
                return grid;
            };
            return ret;
        }
    }
}