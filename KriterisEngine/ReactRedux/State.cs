using System;
using System.Collections.Generic;

namespace KriterisEngine.ReactRedux
{
    public enum What
    {
        Create,
        Read,
        Update,
        Delete
    }

    public delegate object _Do(What type, StateSlice slice, object value, Func<object, object> transaction = null);
    public class State
    {
        Dictionary<string, object> Values = new Dictionary<string, object>();
        public T GetValue<T>(string path, T defaultValue)
        {
            if (Values.TryGetValue(path, out var ret)) return (T)ret;
            return defaultValue;
        }

        public Action OnChange { get; set; }

        public _Do Do { get; set; }
        public State AddValue<T>(string path, T value)
        {
            if (Values.TryGetValue(path, out var ret))
            {
                ret.To<List<T>>().Out(out var list);
                list.Add(value);
                return this;
            }

            new List<T>().Out(out var list2);
            Values[path] = list2;
            list2.Add(value);
            return this;
        }
        public State SetValue<T>(string path, T value)
        {
            Values[path] = value;
            return this;
        }
    }
    public class StateId
    {
        public static StateId New()
        {
            return new StateId() {Value = Guid.NewGuid()};
        }
        Guid Value { get; set; }
        public static implicit operator string(StateId id) => id.Value.ToString("N");
        //public static implicit operator StateId(string id) => new StateId() {Value = Guid.Parse(id)};
    }
    public class StateChangedArgs
    {
        public StateId Id { get; set; }
    }
}