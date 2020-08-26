using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using static KriterisEdit.Extensions;
using static KriterisEdit.GlobalStatics;
using static System.IO.File;
namespace KriterisEdit
{
    public partial class App : Application
    {
        static void BuildApp(Window window)
        {
            var (xmlNodes, fileList) = (_ListView(), _ListView()); //destructuring
            Global.Instance.Log = s => Dispatch(Message.Log, s);
            
            window
                ._Min(width: 1600)
                ._Content(
                    _DockPanel()._Content(
                        _DockPanel()._Dock(Dock.Top)
                            ._Content(
                                _Label()._Dock(Dock.Left)._Content("mask:"),
                                _TextBox()._Content("*.csproj")
                                    .Bind("")
                            ),
                        _DockPanel()
                            ._Dock(Dock.Top)
                            ._Content(
                                _Label()._Content("files:"),
                                    _ListView()
                                    ._Dock(Dock.Top)
                                    ._Max(height: 100)
                                    ._Min(height: 100)
                                    ._OnDrop(Message.FilesDropped)
                                ),                
                        xmlNodes
                    )
                );
            
            GlobalStatics.Redux.State = new State();
            GlobalStatics.Redux.Reducer = (state, action) =>
            {
                var (msg, args) = action;
                switch (msg)
                {
                    case Message.FilesDropped:
                        var dropped = (string[])args;
                        var filesAndFolders = dropped._Bucket(("files", Exists), ("folders", Directory.Exists));
                        //filesAndFolders["folders"].SelectMany(folder=>)
                        state.Files = dropped;
                        fileList._Content(dropped);
                        var nodes = dropped
                            .Where(Exists)
                            .SelectMany(file =>
                        {
                            var projName = new FileInfo(file).Name;

                            return file
                                ._ReadAllText()
                                ._ParseXml()
                                .Descendants()
                                .Select(n => n.ToString());
                        }).ToArray();
                        xmlNodes.ItemsSource = nodes;
                        break;
                }

                return state;
            };
            Dispatch(Message.FilesDropped, _Arr(
                @"C:\repos\cog\dev\src","drag","files","here"));
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            void onActivated(object? sender, EventArgs args)
            {
                BuildApp(MainWindow);
                Activated -= onActivated;
            }

            Activated += onActivated;
        }
    }
}