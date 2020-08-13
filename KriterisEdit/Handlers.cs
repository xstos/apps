using System;
using System.Collections.Generic;
using System.Windows;
using static KriterisEdit.GlobalStatics;
namespace KriterisEdit
{
    public class Handler
    {
        public static readonly Handler Empty = new Handler();
        
        public Func<Handler> Unsubscribe { get; private set; } = () => Empty;
        public UIElement Target { get; private set; } = new UIElement();
        public string Name { get; private set; } = "";
        
        public static implicit operator Handler((string name, UIElement e, Action unsubscribe) _)
        {
            var (name, target, unsubscribe) = _;
            var ret = new Handler {Name = name, Target = target};
            ret.Unsubscribe = () =>
            {
                unsubscribe();
                return ret;
            };
            return ret;
        }
        
        public Handler WithAction(Action action)
        {
            var old = Unsubscribe;
            Unsubscribe = () =>
            {
                old();
                action();
                return this;
            };
            return this;
        }
    }

    public class Handlers
    {
        readonly Dictionary<string, Handler> handlers = new Dictionary<string, Handler>();

        public Handler this[string name]
        {
            get
            {
                if (handlers.TryGetValue(name, out var ret))
                {
                    return ret;
                }

                Log($@"{nameof(Handlers)} key {name} not found");
                return Handler.Empty;
            }
            set { handlers[name] = value.WithAction(() => handlers.Remove(name)); }
        }
    }
}