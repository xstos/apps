using System;

namespace KriterisEngine.ReactRedux
{
    public class Store
    {
        public Action<Message> Dispatch { get; set; }
        public Func<State> GetState { get; set; }
        public Func<Action<Message>, Action> Subscribe { get; set; }
        public Func<State, Message, State> Reducer { get; set; } = (state, message) => state;
        public _StateSliceChanged StateChanged { get; set; }
    }
}