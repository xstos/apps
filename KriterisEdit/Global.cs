using System;
using System.Collections.Generic;
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
         
        public static T Bind<T>(this T ctrl, string readCellName, string? writeCellName=null) where T : FrameworkElement, new()
        {
            var weak = ctrl.ToWeak().SetDefaultValue(new T());
            writeCellName ??= readCellName;
            var uiId = ctrl.Name;
            if (uiId.IsNullOrEmpty() || UiBindings.ContainsKey(uiId)) //todo change exception to logging
                throw new ArgumentException("Binding already exists, or non-unique control name");
            var cell = Instance.Cells[readCellName];
            cell.Name = readCellName;
            cell.Children.Add(uiId);
            Func<dynamic> Get = Instance.Cells[readCellName].Get;
            Action<dynamic> Set = Instance.Cells[writeCellName].Set;
            switch (weak)
            {
                case Weak<TextBox> tb:
                    UiBinding.New(value =>
                    {
                        tb.Get().SetText((string) value);
                    }).Add(uiId);

                    tb.Get()._OnTextChanged((sender, args) =>
                    {
                        Set(tb.Get().Text);
                    });
                    break;

                case Weak<ListView> lv:
                    UiBinding.New(value =>
                    {
                        lv.Get().SetDataContext((object)value);
                    }).Add(uiId);
                    if (lv.Get().AllowDrop)
                    {
                        lv.Get()._OnDrop((sender, args) => 
                            Set(args._GetDroppedFiles())
                        );
                    }
                    break;
            }

            var v = Get();
            Set(v);
            return ctrl;
        }
    }

    public class _Cell
    {
        dynamic? _value;
        public string Name { get; set; } = "";

        public dynamic Value
        {
            get => _value ?? DefaultValue;
            set => _value = value;
        }

        public dynamic DefaultValue { get; set; } = "";
        public HashSet<string> Children { get; } = new HashSet<string>();

        public static _Cell New(string name, dynamic value)
        {
            return new _Cell()
            {
                Name = name,
                Value = value,
            };
        }

        public dynamic Get() => Value;
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
        Dictionary<string,_Cell> _cells = new Dictionary<string, _Cell>();

        public delegate NameValueDelegate NameValueDelegate(string name, dynamic value);
        public NameValueDelegate Add(string name, dynamic value)
        {
            var cell = _Cell.New(name, value);
            _cells[name] = cell;
            return Add;
        }
        
        public _Cell this[string name]
        {
            get
            {
                if (_cells.TryGetValue(name, out var cell)) return cell;
                throw new ArgumentException($"Cell {name} not found"); //todo change exception to loggin
            }
        }
    }
}