using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Threading;

namespace KriterisEngine
{
    public class Meta
    {
        public Id Id { get; set; }
    }

    public enum EventTypes
    {
        New,
        Add,
    }
    public class Global
    {
        public static ConditionalWeakTable<object,Meta> Props = new();
        static Random random = new Random(0);
        public static Global G = new Global();
       
        public static AppState State => G.AppState;
        public Func<Dispatcher> Dispatcher { get; set; }
        public Action<Action> OnShown { get; set; }
        public Action<EventTypes, object> Event { get; set; } = (e, o) => { };
        public AppState AppState { get; set; } = new AppState();
        
        public Func<int, int, int> RandBetween = random.Next;
    }

    public static class InjectedExtensions
    {
        public static Meta Meta(this object o)
        {
            if (Global.Props.TryGetValue(o, out Meta value)) return value;
            value = new Meta();
            Global.Props.Add(o, value);
            return value;
        }

        public static Obj MetaObj(this object o)
        {
            return Global.State.GetInstance(o.Meta().Id);
        }
    }

    public struct Id
    {
        public int Value { get; set; }
        public static implicit operator Id(int id) => new Id() {Value = id};
    }
    public class Obj
    {
        public Id Id { get; set; }
        public string AssemblyQualifiedName { get; set; }
        public WeakReference<object> Value { get; set; }
        List<Id> Children { get; set; } = new List<Id>();

        public void AddChild(params Obj[] children)
        {
            Children.AddRange(children.Select(c=>c.Id));
        }
    }
    public class AppState
    {
        public List<Obj> Instances { get; set; } = new List<Obj>();

        public Obj New(object o)
        {
            o.Meta().Id = NewId().Out(out var id);
            var obj = new Obj
            {
                Id = id,
                AssemblyQualifiedName = o.GetType().AssemblyQualifiedName,
                Value = new WeakReference<object>(o)
            };
            return obj;
        }

        public Obj GetInstance(Id id)
        {
            return Instances[id.Value];
        }
        public Id NewId()
        {
            return Instances.Count;
        }
    }
}