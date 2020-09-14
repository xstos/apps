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
    public static class GlobalStatics
    {
        public static readonly Global Instance = new Global();
        
        public static Action<string> Log => Instance.Log;
        public static _Redux Redux => Instance.Redux;

        public static _Redux Dispatch(Message type, dynamic args) => Redux.Dispatch(type, args);

        public static T Bind<T,R>(this T ctrl, Address<R> read, Address<R>? write = null)
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
                        var value = wtb.Get().Text;
                        write2.Cell.SetValueObj(value);
                    });
                    var uiCell = (bindingId, "").Cell();
                    Formula((read,read),uiCell, (r, arg2) =>
                    {
                        var box = wtb.Get();
                        var tbv = box.Text;
                        var cv = read.Cell.GetValue().Cast<string>();
                        
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
        public static Address<T> Cell<T>(this (string name, T value) _)
        {
            return Instance.Cells.Add(_.name, _.value);
        }
        
        public static void Formula<A, B, C>((Address<A>, Address<B>) _, Address<C> ret, Func<A, B, C> formula)
        {
            var (a, b) = _;
            
            a.Cell.Dependents.Add(ret);
            b.Cell.Dependents.Add(ret);
            ret.Cell.GetValue = () =>
            {
                return formula(a.Cell.GetValue(), b.Cell.GetValue());
            };
        }
    }
}