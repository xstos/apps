using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using NReact;
using static KriterisEngine.NExt;
using static KriterisEngine.Common;
namespace KriterisEngine.ReactRedux
{
    public class ExampleApp
    {
        public static App New(Application app, Window window)
        {
            Store.New().Out(out var store);
            store.Dispatch.Out(out var dispatch);
            store.Subscribe.Out(out var subscribe);

            var items = new ObservableCollection<string>();
            int i = 0;
            UIElement App()
            {
                MakeRootPanel().Out(out var mainPanel);
                mainPanel.Add(AutoComplete.ExampleUsage());

                var mirror = new List<Action<string>>();
                void InitCell(El instance)
                {
                    var (_, setText) = instance.Prop(Props.Text, "Sup");
                    mirror.Add(setText);
                };
                Enumerable
                    .Range(0, 10)
                    .Select(i => El.New(RenderCell, InitCell))
                    .ToArray()
                    .Out(out var cells);
                El.New(RenderPanel)
                    .Out(out var nPanel);

                NElement RenderCell(El instance)
                {
                    var (getText, _) = instance.Prop(Props.Text, "Sup");
                    
                    return N<TextBox>()
                        .Text(getText())
                        .Margin(3)
                        .TextChanged(sender =>
                        {
                            var text = sender.As<TextBox>().Text;
                            mirror.ForEach(setter => setter(text));
                        });
                }
                NElement RenderPanel(El instance)
                {
                    return N<StackPanel>()
                        .Children(cells)
                        .Background(Brushes.DarkSalmon);
                }
                
                New<ContentControl>().Out(out var content);
                mainPanel.Add(content);
                content.Render(nPanel);

                WrapPanel MakeRootPanel()
                {
                    New<WrapPanel>().Out(out var panel).MakePanelFocusable();
                    New<Button>().Out(out var addCounterButton);
                    addCounterButton.Content = "Add Counter";
                    panel.Children.Add(addCounterButton);
                    
                    addCounterButton.Click += (sender, args) =>
                    {
                        dispatch(("new.button", Id.New()));
                        panel.Children.Add(MakeTextBox(Id.New()));
                        items.Add(i++.ToString());
                    };
                    
                    return panel;
                }

                
                UIElement MakeTextBox(Id id)
                {
                    
                    New<DockPanel>().Out(out var container);
                    New<TextBox>().Out(out var name);
                    New<ListBox>().Out(out var lb);
                    name.DataContext = items;

                    return name;
                }
                Button MakeCounterButton(Id id)
                {
                    New<Button>().Out(out var button);
                    button.Content = 0;
                    button.PreviewMouseDown += (sender, args) =>
                    {
                        if (args.LeftButton == MouseButtonState.Pressed)
                        {
                            dispatch(("increment.button", id));
                        }
                        else if (args.RightButton == MouseButtonState.Pressed)
                        {
                            dispatch(("delete.button", id));
                        }
                    };

                    return button;
                }

                //message handlers
                new Dictionary<object, (UIElement Parent, UIElement Child)>().Out(out var controls);
                subscribe(message =>
                {
                    var id = message.Payload.As<Id>();
                    switch (message.Type)
                    {
                        case "new.button":
                            MakeCounterButton(id).Out(out var button);
                            mainPanel.Children.Add(button);
                            controls[id] = (mainPanel, button);
                            break;
                        case "increment.button":
                            controls[id].Child.As<Button>().Do(button =>
                            {
                                //todo better state management like redux
                                button.Content = button.Content.As<int>() + 1;
                            });
                            break;
                        case "delete.button":
                            mainPanel.Children.Remove(controls[id].Child);
                            controls.Remove(id);
                            break;
                    }
                });
                
                return mainPanel;
            }
            
            window.Closed += (sender, args) =>
            {
                store.CloseDb();
            };
            return new App()
            {
                Render = App,
                GetStore = ()=>store
            };
        }
    }

    public class App
    {
        public Func<Store> GetStore { get; set; }
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