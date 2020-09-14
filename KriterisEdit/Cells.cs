using System;
using System.Collections.Generic;
using static KriterisEdit.GlobalStatics;
namespace KriterisEdit
{

    public class _Cell
    {
        public Action RefreshB = () => {};
        public static _Cell EmptyB = new _Cell();
    }
    public class _Cell<T> : _Cell
    {
        T _value;
        public Address<T> Address { get; set; } = Address<T>.Empty;
        public HashSet<AddressB> Dependents = new HashSet<AddressB>();
        public Func<T> GetValue;
        public T DefaultValue { get; private set; }
        public void Refresh()
        {
            SetValue(GetValue());
        }
        public _Cell()
        {
            RefreshB = Refresh;
            GetValue = GetValueCore;
        }

        public void SetValueObj(object value)
        {
            if (value is T casted)
            {
                SetValue(casted);
            }
        }

        public T GetValueCore()
        {
            return _value ?? DefaultValue;
        }
        public void SetValue(T value)
        {
            Value = value;
            Log(Address + " " + nameof(SetValue) + " " + value);
            foreach (var dep in Dependents)
            {
                dep.BaseGetCell().RefreshB();
            }
        }
        public T Value
        {
            get { return _value; }
            private set { _value = value; }
        }

        public static _Cell<T> New(string name, T value)
        {
            var @ref = Address<T>.New(name);
            return new _Cell<T>
            {
                Address = @ref,
                Value = value,
                DefaultValue = value,
            };
        }

    }

    public class CellValue<T>
    {
        public T Value;
        public static CellValue<T> Empty;

        public override string ToString() => Value.ToString() ?? "";

        static CellValue<T> New(T value)
        {
            return new CellValue<T>() {Value = value};
        }
        public static implicit operator CellValue<T>(T v)
        {
            return New(v);
        }
    }

    public class AddressB
    {
        public Func<_Cell> BaseGetCell = () => _Cell.EmptyB;
        public string Name { get; set; }

        protected bool Equals(AddressB other) => Name == other.Name;

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

            return Equals((AddressB) obj);
        }

        public override int GetHashCode() => Name.GetHashCode();
    }
    public class Address<T> : AddressB
    {
        public static Address<T> Empty = New("");
        
        public _Cell<T> Cell => (_Cell<T>)Instance.Cells[this];

        public Address()
        {
            BaseGetCell = () => Cell;
        }
        public static Address<T> New(string name)
        {
            return new Address<T>() {Name = name};
        }

        public static implicit operator string(Address<T> a) => a.Name;

    }
    public class _Cells
    {
        readonly Dictionary<AddressB, _Cell> _cells = new Dictionary<AddressB, _Cell>();

        public _Cell this[AddressB @ref]
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

        public Address<T> Add<T>(string name, T value)
        {
            
            var cell = _Cell<T>.New(name, value);
            _cells.Add(cell.Address,cell);
            return cell.Address;
        }
    }

    
}