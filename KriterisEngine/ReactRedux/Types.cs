using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace KriterisEngine.ReactRedux
{

    public class Callback<T>
    {
        Action<T> action;

        public Callback()
        {
            
        }
    }
    public class Example
    {
        public static void MakeApp()
        {
            static Action<State> F(Action<State> action) => action;
            static Store LoadStore()
            {
                var callbacks = new Dictionary<string, Action<State>>();

                Action<Action<State>> StateChanged(StateSlice slice)
                {
                    void Subscribe(Action<State> callback)
                    {
                        callbacks[slice] = callback;
                    }

                    return Subscribe;
                }
                return new Store()
                {
                    Reducer = MainReducer,
                    StateChanged = StateChanged
                };
            }

            var store = LoadStore();
            var getState = store.GetState;
            var subscribe = store.Subscribe;
            var dispatch = store.Dispatch;
            var stateChanged = store.StateChanged;
            UIElement App()
            {
                UIElement WindowPanelComponent()
                {
                    new WrapPanel().Out(out var root);
                    root.MouseUp += (sender, args) =>
                    {
                        Guid.NewGuid().Out(out var id);
                        dispatch(("makeButton", id));
                        stateChanged($"Controls/{id}")(state =>
                        {
                            MakeButton(id);
                        });
                    };
                    
                    return root;
                }
                UIElement MakeButton(Guid id)
                {
                    new Button().Out(out var button);

                    button.Content = getState().GetValue("Number", 0);
                    button.Click += (sender, args) =>
                    {
                        dispatch(("increment", id));
                    };
                    button.MouseLeftButtonUp += (sender, args) =>
                    {
                        
                    };
                    var numberChanged = stateChanged("Number");
                    numberChanged(state =>
                    {
                        button.Content = state.GetValue("Number", 0);
                    });
                    return button;
                }

                return WindowPanelComponent();
            }

            static State MainReducer(State state, Message message)
            {
                switch (message.Type)
                {
                    case "increment":
                        var oldNumber = message.Payload.To<int>();
                        state.SetValue("Number", oldNumber + 1);
                        break;
                    case "makeButton":
                        message.Payload.To<Guid>().Out(out var id);
                        state.AddValue($"Controls/{id}[]/Count", 0);
                        
                        break;
                }
                return state;
            }
            
            
        }
    }

    public class Message
    {
        public string Type { get; private set; }
        public object Payload { get; private set; }
        public Message(string type, object payload)
        {
            this.Type = type;
            this.Payload = payload;
        }

        public static implicit operator Message((string type, object payload) msg)
        {
            return new Message(msg.type, msg.payload);
        }
    }

    public class State
    {
        Dictionary<string, object> Values = new Dictionary<string, object>();
        public T GetValue<T>(string path, T defaultValue)
        {
            if (Values.TryGetValue(path, out var ret)) return (T)ret;
            return defaultValue;
        }

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
    public class Store
    {
        public Action<Message> Dispatch { get; set; }
        public Func<State> GetState { get; set; }
        public Func<Action<Message>, Action> Subscribe { get; set; }
        public Func<State, Message, State> Reducer { get; set; } = (state, message) => state;
        public Func<StateSlice, Action<Action<State>>> StateChanged { get; set; }
    }

    public class StateSlice
    {
        public static implicit operator string(StateSlice slice)
        {
            return "";
        }
        public static implicit operator StateSlice(string path)
        {
            return new StateSlice();
        }
    }
    public class App
    {
        public Func<State, UIElement> Render { get; set; }
    }
    public class ReactDOM
    {
        public static void Render(App app, UIElement target)
        {
            
        }
    }
}