using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace KriterisEngine.ReactRedux
{
    public class ExampleApp
    {
        public static App New(Application app, Window window)
        {
            var store = Store.New();
            store.Dispatch.Out(out var dispatch);
            store.Subscribe.Out(out var subscribe);
            UIElement App()
            {
                MakeRootPanel().Out(out var mainPanel);
                
                WrapPanel MakeRootPanel()
                {
                    new WrapPanel().Out(out var root);
                    root.Background = new SolidColorBrush( Color.FromArgb(1, 0, 0, 0)); //clicks don't work when no bkgrnd
                    root.FocusVisualStyle = Common.MakeFocusStyle(Brushes.Red);
                    root.Focusable = true;
                    new Button()
                    {
                        Content = "Add Counter"
                    }.Out(out var makeCounter);
                    root.Children.Add(makeCounter);
                    FocusManager.SetIsFocusScope(root, true);
                    makeCounter.Click += (sender, args) =>
                    {
                        dispatch(("new.button", Id.New()));
                    };
                    
                    return root;
                }

                new Dictionary<object, (UIElement Parent, UIElement Child)>().Out(out var controls);
                subscribe(message =>
                {
                    var id = message.Payload.To<Id>();
                    switch (message.Type)
                    {
                        case "new.button":
                            MakeButton(id).Out(out var button);
                            mainPanel.Children.Add(button);
                            controls[id] = (mainPanel, button);
                            break;
                        case "increment.button":
                            controls[id].Child.To<Button>().Do(button =>
                            {
                                //todo better state management like redux
                                button.Content = button.Content.To<int>() + 1;
                            });
                            break;
                        case "delete.button":
                            mainPanel.Children.Remove(controls[id].Child);
                            controls.Remove(id);
                            break;
                    }
                });
                
                Button MakeButton(Id id)
                {
                    new Button().Out(out var button);
                    button.Content = 0;
                    button.PreviewMouseDown += (sender, args) =>
                    {
                        if (Mouse.LeftButton == MouseButtonState.Pressed)
                        {
                            dispatch(("increment.button", id));
                        } 
                        else if (Mouse.RightButton == MouseButtonState.Pressed)
                        {
                            dispatch(("delete.button", id));
                        }
                    };
                    
                    return button;
                }

                store.Replay();
                return mainPanel;
            }

            window.Closed += (sender, args) =>
            {
                store.CloseDb();
            };
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