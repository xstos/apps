using System;
using System.Collections.Generic;

namespace KriterisEdit
{
    public class State
    {
        public string[] Files { get; set; } = new string[0];
    }

    public enum MsgTypes
    {
        FilesDropped,
        Log,
    }
    public class Redux
    {
        readonly List<(MsgTypes, dynamic)> messages = new List<(MsgTypes, dynamic)>();
        public State State { get; set; } = new State();

        public Redux Dispatch(MsgTypes type, dynamic args)
        {
            var action = (type, args);
            messages.Add(action);
            State = Reducer(State, action);
            return this;
        }

        public Func<State, (MsgTypes, dynamic), State> Reducer = (state, tuple) => state;
    }
}