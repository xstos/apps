using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
namespace KriterisEdit
{
    public class Global
    {
        public readonly _Redux Redux = new _Redux();    
        public readonly _Cells Cells = new _Cells();
        public Action<string> Log = s => {};
    }
    public static class GlobalStatics
    {
        public static readonly Global Instance = new Global();
        public static Action<string> Log => Instance.Log;
        public static _Redux Redux => Instance.Redux;
        public static _Redux Dispatch(Message type, dynamic args) => Redux.Dispatch(type, args);
        public static Dictionary<string,UiBinding> UiBindings = new Dictionary<string, UiBinding>();
        
        public static T Bind<T>(this T control, string cellName, dynamic? defaultValue=null) where T : FrameworkElement
        {
            var uiId = control.Name;
            if (UiBindings.ContainsKey(uiId)) throw new ArgumentException("Binding already exists, or non-unique control name");
            var cell = Instance.Cells[cellName];
            cell.Name = cellName;
            cell.Children.Add(uiId);
            if (defaultValue != null)
            {
                cell.Value = defaultValue;
                cell.DefaultValue = defaultValue;
            }

            switch (control)
            {
                case TextBox tb:
                    var wr = new WeakReference<TextBox>(tb);
                    void Set(dynamic d)
                    {
                        if (!wr.TryGetTarget(out var tb2))
                        {
                            UiBindings.Remove(uiId);
                            return;
                        }

                        if (tb2.Text == d) return;
                        tb2.Text = d;
                    }

                    var cellValue = cell.Value;
                    if (cellValue != null) Set(cellValue);

                    UiBindings[uiId] = new UiBinding()
                    {
                        Set = Set
                    };

                    tb._OnTextChanged(
                        (sender, args) => Instance.Cells[cellName].Set(tb.Text)
                    );
                    break;
            }
            return control;
        }
    }

    public class UiBinding
    {
        public Action<dynamic> Set { get; set; }
    }
    public class _Cell
    {
        public string Name { get; set; }
        public object? Value { get; set; }
        public object? DefaultValue { get; set; }
        public HashSet<string> Children { get; } = new HashSet<string>();

        public void Set(dynamic value)
        {
            Value = value;
            foreach (var child in Children)
            {
                GlobalStatics.UiBindings[child].Set(value);
            }
        }
    }

    public class _Cells
    {
        Dictionary<string,_Cell> values = new Dictionary<string, _Cell>();

        public _Cell this[string name]
        {
            get
            {
                if (values.TryGetValue(name, out var cell)) return cell;
                cell = new _Cell();
                values[name] = cell;
                return cell;
            }
            set
            {
                /* set the specified index to value here */
            }
        }
    }
}