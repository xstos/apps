using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace KriterisEngine.ReactRedux
{
    public delegate void _StateChangedCallback(State state, StateChangedArgs args);
    public delegate void _RegisterStateChangedCallback(_StateChangedCallback callback);
    public delegate _RegisterStateChangedCallback _StaterouteChanged(Route route);

    public class Example
    {
        public static App MakeApp()
        {
            var store = Store.New(Reducer);
            store.GetState.Out(out var getState);
            store.Dispatch.Out(out var dispatch);
            store.StateChanged.Out(out var stateChanged);
            UIElement App()
            {
                WindowPanelComponent().Out(out var mainPanel);
                
                WrapPanel WindowPanelComponent()
                {
                    new WrapPanel().Out(out var root);
                    root.Background = new SolidColorBrush( Color.FromArgb(1, 0, 0, 0)); //clicks don't work when no bkgrnd
                    root.FocusVisualStyle = Common.MakeFocusStyle(Brushes.Red);
                    root.Focusable = true;
                    
                    //root.IsHitTestVisible = true;
                    FocusManager.SetIsFocusScope(root, true);
                    root.MouseUp += (sender, args) =>
                    {
                        dispatch(("new.button", null));
                    };
                    
                    return root;
                }
                stateChanged($"controls/@id/@create")((state, args) =>
                {
                    ButtonComponent(args.Id).Out(out var el);
                    mainPanel.Children.Add(el);
                });
                Button ButtonComponent(Id id)
                {
                    new Button().Out(out var button);
                    button.Content = getState().Do(What.Read, $"controls/{id}/numclicks", 0);
                    button.Click += (sender, args) =>
                    {
                        dispatch(("increment", id));
                    };
                    button.MouseLeftButtonUp += (sender, args) =>
                    {
                        dispatch(("delete", id));
                    };
                    
                    stateChanged($"controls/{id}/numclicks")
                    ((state, args) =>
                    {
                        button.Content = state.Do(What.Read, $"controls/{id}/numclicks", 0);
                    });
                    
                    stateChanged($"controls/{id}/@delete")
                    ((state, args) =>
                    {
                        mainPanel.Children.Remove(button);                        
                    });
                    
                    return button;
                }

                return mainPanel;
            }

            static State Reducer(State state, Message message)
            {
                switch (message.Type)
                {
                    case "new.button":
                        message.Payload.To<Id>().Out(out var id2);
                        state.Do(What.Create, $"controls/{id2}/numclicks", 0);
                        break;
                    case "increment":
                        message.Payload.To<Id>().Out(out var id);
                        static object Transaction(object oldNumber)
                        {
                            return oldNumber.To<int>() + 1;
                        }
                        state.Do(What.Update, $"controls/{id}/numclicks", null, Transaction);
                        break;
                    
                }
                return state;
            }

            return new App()
            {
                Render = App
            };
        }
    }


    public class App
    {
        public Func<UIElement> Render { get; set; }
    }
    public class ReactDOM
    {
        public static void Render(App app, UIElement target)
        {
            if (target is Window window)
            {
                window.Content = app.Render();
            }
        }
    }
}