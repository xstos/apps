using System;
using System.Collections.Generic;
using static KriterisEdit.GlobalStatics;
namespace KriterisEdit
{
    public class Calcs
    {
        
    }
    public class _Formula
    {
        public Action Dirty = () => { };
        public Func<string> ToStr = () => "";
        public override string ToString() => ToStr();
        public static _Formula New()
        {
            var ret = new _Formula();
            
            return ret;
        }
    }
    public class _Cell 
    {
        public static _Cell EmptyB = new _Cell();
        public Address Address { get; set; } = Address.Empty;
        public List<(object,Action)> OnSet = new List<(object, Action)>();
        public Func<CellValue> GetValue;
        public Action<CellValue> SetValue;
        public Func<CellValue> DefaultValue;
        public Action Refresh;

        public static _Cell New(string name, object value)
        {
            var c = new _Cell();
            
            c.SetValue = (v) =>
            {
                c.GetValue = () => v;
                foreach (var (f,dirty) in c.OnSet)
                {
                    dirty();
                }
            };
            c.GetValue = value.ToCellValue;
            c.Address = Address.New(name);
            c.DefaultValue = value.ToCellValue;
            c.Refresh = ()=>
            {
                foreach (var (f,dirty) in c.OnSet)
                {
                    dirty();
                }
            };
            c.Refresh();
            return c;
        }

    }

    public class CellValue
    {
        public dynamic Value="";
        public static CellValue Empty;

        public override string ToString() => Value+"";
        public static CellValue New(object value)
        {
            return new CellValue() {Value = value};
        }
    }

    public class Address
    {
        public string Name { get; set; }

        protected bool Equals(Address other) => Name == other.Name;

        public override bool Equals(object? obj)
        {
            if (ReferenceEquals(null, obj))
            {
                return false;
            }

            if (ReferenceEquals(this, obj))
            {
                return true;
            }

            if (obj.GetType() != this.GetType())
            {
                return false;
            }

            return Equals((Address) obj);
        }

        public override int GetHashCode() => Name.GetHashCode();
        public static Address Empty = New("");
        
        public _Cell Cell => Instance.Cells[this];

        public static Address New(string name)
        {
            return new Address() {Name = name};
        }

        public static implicit operator string(Address a) => a.Name;

    }
    public class _Cells
    {
        readonly Dictionary<Address, _Cell> _cells = new Dictionary<Address, _Cell>();
        List<_Formula> _formulas = new List<_Formula>();
        public _Cell this[Address @ref]
        {
            get
            {
                if (_cells.TryGetValue(@ref, out var cell))
                {
                    return cell;
                }

                throw new ArgumentException($"Cell {@ref} not found"); //todo change exception to loggin
            }
        }

        public Address Add(string name, object value)
        {
            var cell = _Cell.New(name, value);
            _cells.Add(cell.Address,cell);
            return cell.Address;
        }
    }

    
}