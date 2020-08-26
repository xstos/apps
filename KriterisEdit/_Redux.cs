using System;
using System.Collections.Generic;

namespace KriterisEdit
{
    public class State
    {
        public string[] Files { get; set; } = new string[0];
    }

    public enum Message
    {
        FilesDropped,
        Log,
    }
    public class _Redux
    {
        readonly List<(Message, dynamic)> messages = new List<(Message, dynamic)>();
        public State State { get; set; } = new State();

        public _Redux Dispatch(Message type, dynamic args)
        {
            var action = (type, args);
            messages.Add(action);
            State = Reducer(State, action);
            return this;
        }

        public Func<State, (Message, dynamic), State> Reducer = (state, tuple) => state;
    }
}