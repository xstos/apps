using System;
using System.Collections.Generic;
using System.Reflection;
using System.Windows;
using WpfPlus;

namespace Cells
{
    public static class App
    {
        public static Application BuildApp()
        {
            Calcs.Tests();

            var app = new Application();
            var window = new Window();
            app.MainWindow = window;

            Application.Current.Resources.MergedDictionaries.Add(new DarkTheme());
            window.SetResourceReference(FrameworkElement.StyleProperty, "FlatWindowStyle");
            void Activated(object? sender, EventArgs args)
            {
                app.Activated -= Activated;
            }

            app.Activated += Activated;
            return app;
        }
    }
    
    public static class Sym
    {
        public static string text;
        public static string splitChar;
        public static string splitText;
        public static string splitOpts;
        static Sym()
        {
            foreach (var fieldInfo in typeof(Sym).GetFields(BindingFlags.Public | BindingFlags.Static))
            {
                fieldInfo.SetValue(null,fieldInfo.Name);
            }
        }
    }

    public static class Fun
    {
        public static string Split;
    }
    public static class Calcs
    {
        public static State state = new State();
        public static void Tests()
        {
            cell(Sym.text)
                .getValue()
                .Assert(null);

            cell(Sym.text)
                .setValue("1,2,3,4");

            cell(Sym.text)
                .getValue()
                .Assert("1,2,3,4");

            cell(Sym.splitChar)
                .setValue(',');
            cell(Sym.splitOpts)
                .setValue(StringSplitOptions.None);
            var call = cell(Sym.text)
                .callMethod(Fun.Split, cell(Sym.splitChar), cell(Sym.splitOpts));
            cell(Sym.splitText)
                .setValue(call);
        }

        public static O callMethod(this O target, string methodName, params O[] args)
        {
            return state.formulas.callMethod(target, methodName, args);
        }
        
        public static O cell(string key)
        {
            return state.cells.GetOrCreate(key);
        }

        public class Formulas
        {
            List<O> calls = new List<O>();
            public O callMethod(O target, string methodName, params O[] args)
            {
                var ret = new O();
                ret.id = calls.Count;
                ret.type = "call";
                ret.name = methodName;
                calls.Add(ret);
                ret.dependsOn(target, args);
                return ret;
            }
        }

        public class Flows
        {
            List<List<ORef>> precedents = new List<List<ORef>>();
            List<List<ORef>> dependents = new List<List<ORef>>();

            public Flows add(O from, O to)
            {
                add(precedents, toId, fromId);
                add(dependents, fromId, toId);
                return this;
            }

            static void add(List<List<ORef>> list, O from, O to)
            {
                var fromId = from.id;
                var pre = list.SafeGet(fromId);
                if (pre == null)
                {
                    pre = new List<ORef>();
                    list.SafeSet(fromId, pre);
                }

                pre.Add(to);
            }
        }

        public class ORef
        {
            public int id;

            public static implicit operator ORef(O o)
            {
                return new ORef() {id = o.id};
            }

            public static implicit operator O(ORef o)
            {
                return state.cells[o];
            }
        }
        public class O
        {
            public int id;
            public string type;
            public string name;
            public object data;
            
            public object getValue()
            {
                return data;
            }
            public O setValue(object o)
            {
                data = o;
                return this;
            }

            public O setValue(O o)
            {
                data = o;
                o.connectTo(this);
                return this;
            }

            public O connectTo(O o)
            {
                state.flows.add("", this, o);
                return this;
            }

            public O dependsOn(O target, IEnumerable<O> items)
            {
                state.flows.add("", target, this);
                return this;
            }

        }
        public class Cells
        {
            List<O> cells = new List<O>();
            Dictionary<string,int> byName = new Dictionary<string, int>();

            public O this[ORef r] => cells[r.id];

            public O GetOrCreate(string name)
            {
                if (byName.TryGetValue(name, out var obj))
                {
                    return cells[obj];
                }
                var ret = new O();
                ret.id = cells.Count;
                ret.type = "cell";
                ret.name = name;
                ret.data = null;
                cells.Add(ret);
                byName[name] = ret.id;
                return ret;
            }
        }
        public class State
        {
            public Formulas formulas = new Formulas();
            public Cells cells = new Cells();
            public Flows flows = new Flows();
        }
    }
}
