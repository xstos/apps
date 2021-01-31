using System;
using System.Collections.Generic;

namespace KriterisEngine.ReactRedux
{
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
}