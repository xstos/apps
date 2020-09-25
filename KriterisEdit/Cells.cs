using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Newtonsoft.Json;
using static KriterisEdit.GlobalStatics;
using static KriterisEdit.Extensions;
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
            var cell = new _Cell();
            
            cell.SetValue = (_value) =>
            {
                cell.GetValue = () => _value;
                foreach (var (f,dirty) in cell.OnSet)
                {
                    dirty();
                }
            };
            cell.GetValue = value.ToCellValue;
            cell.Address = Address.New(name);
            cell.DefaultValue = value.ToCellValue;
            cell.Refresh = ()=>
            {
                foreach (var (f,dirty) in cell.OnSet)
                {
                    dirty();
                }
            };
            cell.Refresh();
            return cell;
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

    public class El
    {
        public Action<UIElement> AddLeft;
        public Action RemoveLeft;
        public Func<UIElement> GetValue;
    }

    
    public class Editor
    {
        public static Editor New(Window window)
        {
            var ret = new Editor();
            _StackPanel().Var(out var container);
            window.Content = container;
            
            var tree = Tree.New();
            tree.Render = panel =>
            {
                
            };

            tree.NewValue().Var(out var hello).SetData("hello");
            tree.Root
                .AddChild(hello)
                .AddChild(hello);
            tree.Render(container);

            static El Cursor()
            {
                var textBlock = new TextBlock();
                textBlock.Text = "█";

                // void Callback(object? sender, EventArgs args) => 
                //     c.Text = c.Text == " " ? "█" : " ";
                //
                // var dispatcherTimer = new DispatcherTimer(
                //     TimeSpan.FromMilliseconds(200),DispatcherPriority.Normal,
                //     Callback, Dispatcher.CurrentDispatcher);
                // dispatcherTimer.Start();
                
                return new El()
                {
                    GetValue = ()=>textBlock,
                    AddLeft = (el) =>
                    {
                        if (textBlock.Parent is Panel p)
                        {
                            p.Children.IndexOf(textBlock).Var(out var ix);
                            p.Children.Insert(ix,el);
                        }
                    },
                    RemoveLeft = () =>
                    {
                        if (textBlock.Parent is Panel p)
                        {
                            p.Children.IndexOf(textBlock).Var(out var ix);
                            if (ix > 0)
                            {
                                p.Children.RemoveAt(ix-1);
                            }
                        }
                    }
                };
            }

            Cursor().Var(out var cursor);
            container.Children.Add(cursor.GetValue());
            window._Add(container);
            window.PreviewKeyDown += (sender, args) =>
            {
                void Add(string text)
                {
                    cursor.AddLeft(new TextBlock(){Text = text});
                }
                switch (args.Key)
                {
                    case Key.Back: cursor.RemoveLeft();
                        return;
                    case Key.Space: Add(" ");
                        return; 
                }
                Add(args.Key.ToString());
                
            };
            return ret;
        }
    }
}