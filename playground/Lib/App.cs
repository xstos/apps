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
                .call(Fun.Split, cell(Sym.splitChar), cell(Sym.splitOpts));
            cell(Sym.splitText)
                .setValue(call);
        }

        public static O call(this O target, string name, params O[] args)
        {
            return state.calls.add(target, name, args);
        }
        
        public static O cell(string key)
        {
            return state.cells.GetOrCreate(key);
        }

        public class Calls
        {
            List<O> calls = new List<O>();
            public O add(O target, string name, params O[] args)
            {
                var ret = new O();
                ret.id = calls.Count;
                ret.type = "call";
                ret.name = name;
                calls.Add(ret);
                target.connectTo(ret);
                foreach (var arg in args)
                {
                    arg.connectTo(ret);
                }

                return ret;
            }
        }

        public class Flows
        {
            List<List<int>> precedents = new List<List<int>>();
            List<List<int>> dependents = new List<List<int>>();
            List<int> dirties = new List<int>();
            public void dirty(O o)
            {
                dirties.Add(o.id);
            }

            public Flows add(string type, O @from, O to)
            {
                var fromId = @from.id;
                var toId = to.id;
                add(precedents, toId, fromId);
                add(dependents, fromId, toId);
                return this;
            }

            static void add(List<List<int>> list, int index, int childId)
            {
                var pre = list.SafeGet(index);
                if (pre == null)
                {
                    pre = new List<int>();
                    list.SafeSet(index, pre);
                }

                pre.Add(childId);
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
                state.flows.dirty(this);
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
        }
        public class Cells
        {
            Dictionary<string,O> cells = new Dictionary<string, O>();
            public O GetOrCreate(string name)
            {
                if (cells.TryGetValue(name, out var obj)) return obj;
                var ret = new O();
                ret.id = cells.Count;
                ret.type = "cell";
                ret.name = name;
                ret.data = null;
                cells.Add(name, ret);
                return ret;
            }
        }
        public class State
        {
            public Calls calls = new Calls();
            public Cells cells = new Cells();
            public Flows flows = new Flows();
        }
    }
}
