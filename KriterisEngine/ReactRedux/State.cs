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

    public delegate object _Do(What type, Route route, object value, Func<object, object> transaction = null);
    public class State
    {
        public _Do Do { get; set; }
    }
    public class Id
    {
        public static Id New()
        {
            return new Id() {Value = Guid.NewGuid()};
        }
        Guid Value { get; set; }
        public static implicit operator string(Id id) => id.Value.ToString("N");

        public override string ToString() => this;

        //public static implicit operator StateId(string id) => new StateId() {Value = Guid.Parse(id)};
    }
    public class StateChangedArgs
    {
        public Id Id { get; set; }
    }
}