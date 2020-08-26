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

        public static T Bind<T>(this T control, dynamic props) where T : UIElement
        {
            var cell = Instance.Cells.Add(props);
            switch (control)
            {
                case TextBox tb:
                    string value = props.Value;
                    tb._Content(value);
                    break;
            }

            return control;
        }
    }

    public class _Cell
    {
        public int Id { get; set; }
        public object? Value { get; set; }
        public string Name { get; set; }
        public static _Cell New(dynamic props)
        {
            return new _Cell {Id = props.Id, Name = props.Name};
        }
    }

    public class _ControlAccessor
    {
        public Action<dynamic> Set { get; set; }
        
    }
    public class _Cells
    {
        Dictionary<string, int> byName = new Dictionary<string, int>();
        List<_Cell> cells = new List<_Cell>();
        Dictionary<string,_ControlAccessor> accessors = new Dictionary<string, _ControlAccessor>();
        public _ControlAccessor Add(string name, Action<dynamic> set)
        {
            if (accessors.TryGetValue(name, out var acc)) return acc;
            var ret = new _ControlAccessor() { Set = set};
            accessors.Add(name, ret);
            return ret;
        }
        public _Cell Add(dynamic props)
        {
            var name = (string)props.Name;
            if (byName.TryGetValue(name, out var id)) return cells[id];
            id = cells.Count;
            props.Id = id;
            
            byName[name] = id;
            var ret = _Cell.New(props);
            cells.Add(ret);
            return ret;
        }
    }
}