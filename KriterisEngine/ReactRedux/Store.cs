using System;
using System.Collections.Generic;

namespace KriterisEngine.ReactRedux
{
    public class Store
    {
        public Action<Message> Dispatch { get; set; }
        public Func<State> GetState { get; set; }
        public Func<State, Message, State> Reducer { get; set; } = (state, message) => state;
        public _StaterouteChanged StateChanged { get; set; }
        
        public static Store New(Func<State, Message, State> reducer)
            {
                new Dictionary<string, _StateChangedCallback>().Out(out var callbacks);
                new List<Message>().Out(out var messages);
                MakeState().Out(out var state);
                State MakeState()
                {
                    var Values = new Dictionary<string, object>();
                    new State().Out(out var state);
                    object Do(What type, Route route, object value, Func<object, object> transaction= null)
                    {
                        switch (type)
                        {
                            case What.Create:
                                Values[route.Path] = value;
                                return value;
                                break;
                            case What.Read:
                                return Values[route.Path];
                                break;
                            case What.Update:
                                if (transaction != null)
                                {
                                    var newValue = transaction(Values[route.Path]);
                                    Values[route.Path] = newValue;
                                    return newValue;
                                }
                                Values[route.Path] = value;
                                return value;
                                break;
                            case What.Delete:
                                Values.Remove(route.Path);
                                break;
                        }

                        return null;
                    }
                    state.Do = Do;
                    return state;
                }
                State GetState()
                {
                    return state;
                }

                _RegisterStateChangedCallback StateChanged(Route route)
                {
                    void Subscribe(_StateChangedCallback callback)
                    {
                        callbacks[route] = callback;
                    }

                    return Subscribe;
                }
                void Dispatch(Message message)
                {
                    messages.Add(message);
                    reducer(state, message);
                }
                return new Store()
                {
                    Reducer = reducer,
                    StateChanged = StateChanged,
                    GetState = GetState,
                    Dispatch = Dispatch
                };
            }
    }
}