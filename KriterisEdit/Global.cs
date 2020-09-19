using System;
using System.Windows;
using System.Windows.Controls;

namespace KriterisEdit
{
    public class Global
    {
        public readonly _Cells Cells = new _Cells();
        public readonly _Redux Redux = new _Redux();
        public Action<string> Log = s => { };
    }
    public static partial class GlobalStatics
    {
        public static readonly Global Instance = new Global();
        public static Action<string> Log => Instance.Log;
        public static _Redux Redux => Instance.Redux;

        public static _Redux Dispatch(Message type, dynamic args) => Redux.Dispatch(type, args);
        public static CellValue ToCellValue(this object o) => CellValue.New(o);
        public static T Bind<T>(this T ctrl, Address read, Address? write = null)
            where T : FrameworkElement, new()
        {
            var weak = ctrl.ToWeak();
            var write2 = write ?? read;
            var bindingId = ctrl.Name;
            switch (weak)
            {
                case Weak<TextBox> wtb:
                    wtb.Get()._OnTextChanged((sender, args) =>
                    {
                        if (!wtb.Get().IsFocused) return;
                        var value = wtb.Get().Text ?? "";
                        write2.Cell.SetValue(value.ToCellValue());
                    });
                    var uiCell = (bindingId, "").Cell();
                    Formula((read,read),uiCell, (string r1,string r2) =>
                    {
                        var box = wtb.Get();
                        var tbv = box.Text;
                        string cv = read.Cell.GetValue().Value;
                        
                        if (cv.Equals(tbv))
                        {
                            return cv;
                        }

                        box.SetText(cv);
                        return cv;
                    });
                    
                    break;
                case Weak<ListView> lv:
                    // UiBinding.New(value =>
                    // {
                    //     lv.Get().SetDataContext(value.Value);
                    // }).Add(bindingId);
                    // if (lv.Get().AllowDrop)
                    // {
                    //     lv.Get()._OnDrop((sender, args) =>
                    //         SetCell(args._GetDroppedFiles())
                    //     );
                    // }

                    break;
            }

            read.Cell.Refresh();
            return ctrl;
        }
        public static Address Cell(this (string name, object value) _)
        {
            return Instance.Cells.Add(_.name, _.value);
        }
        
        public static void Formula<A,B,C>((Address, Address) _, Address ret, Func<A, B, C> calc)
        {
            var (a, b) = _;
            var f = _Formula.New();
            f.ToStr = ()=> $"{a.Name},{b.Name}=>{ret.Name}";
            f.Dirty = Dirty;
            void Dirty()
            {
                var recalced = Run();
                ret.Cell.GetValue = () => recalced;
                ret.Cell.SetValue(recalced);
            }
            a.Cell.OnSet.Add((f,Dirty));
            b.Cell.OnSet.Add((f,Dirty));

            CellValue Run()
            {
                var av = a.Cell.GetValue().Value;
                var bv = b.Cell.GetValue().Value;
                object foo = calc(av, bv);
                return foo.ToCellValue();
            }

            var val = Run();
            ret.Cell.GetValue = ()=>val;
        }
    }
}