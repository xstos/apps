using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
namespace KriterisEdit
{
    public class Global
    {
        public readonly _Redux Redux = new _Redux();    
        public readonly _Cells Cells = new _Cells();
        public Action<string> Log = s => {};
        public ConditionalWeakTable<_Cell,Extra> Props = new ConditionalWeakTable<_Cell, Extra>();
    }

    public class Extra
    {
        
    }
    public class Message
    {
        public string Value { get; set; }
        public static implicit operator Message(string s)
        {
            return new Message() {Value = s};
        }

        public static implicit operator string(Message m)
        {
            return m.Value;
        }
    }

    public static class GlobalStatics
    {
        public static readonly Global Instance = new Global();
        public static Action<string> Log => Instance.Log;
        public static _Redux Redux => Instance.Redux;
        public static _Redux Dispatch(Message type, dynamic args) => Redux.Dispatch(type, args);

        public static _CellHandle Cell(string name)
        {
            return Instance.Cells.Add(name);
        }
         
    }

    public class _Connection
    {
        public _CellHandle Source;
        public _CellHandle Destination;
         
    }
    public class _CellHandle
    {
        public string Name;
        public int Id;

        public static implicit operator _CellHandle((string,int) id)
        {
            return new _CellHandle() {Name = id.Item1, Id = id.Item2};
        }

        public _Cell Cell()
        {
            return GlobalStatics.Instance.Cells.Get(this);
        }
    }
    public class _Cell
    {
        public int Id { get; set; }
        public object? Value { get; set; }
        public string Name { get; set; } = "";
    }
    
    public class _Cells
    {
        Dictionary<string, int> byName = new Dictionary<string, int>();
        List<_Cell> cells = new List<_Cell>();
        
        public _Cell Get(_CellHandle handle)
        {
            return cells[handle.Id];
        }
        public _CellHandle Add(string name)
        {
            if (byName.TryGetValue(name, out var id)) return (name,id);
            id = cells.Count;
            byName[name] = id;
            var ret = new _Cell()
            {
                Name = name,
                Id = id,
            };
            cells.Add(ret);
            return (name,id);
        }
    }
}