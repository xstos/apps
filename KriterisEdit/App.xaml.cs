using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Xml.Linq;
using static KriterisEdit.Extensions;
using static KriterisEdit.GlobalStatics;

namespace KriterisEdit
{
    public partial class App : Application
    {
        static void BuildApp(Window window)
        {
            var (xmlNodes, fileList) = (_ListView(), _ListView());
            Global.Instance.Log = s => Dispatch(MsgTypes.Log, s);
             
            window
                ._Min(width: 1600)
                ._Content(
                    _DockPanel()._Content(
                        _DockPanel()._Dock(Dock.Top)
                            ._Content(
                                _Label()._Dock(Dock.Left)._Content("mask:"),
                                _TextBox()._Content("*.csproj")
                            ),
                        _DockPanel()
                            ._Dock(Dock.Top)
                            ._Content(
                                _Label()._Content("files:"),
                                    fileList
                                    ._Dock(Dock.Top)
                                    ._Max(height: 100)
                                    ._Min(height: 100)
                                    ._OnDrop("FilesDropped", (o, eventArgs) =>
                                    {
                                        var dropped = eventArgs._GetDroppedFiles();
                                        if (dropped.Length < 1) return;
                                        Dispatch(MsgTypes.FilesDropped, dropped);
                                    })
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
                    case MsgTypes.FilesDropped:
                        var dropped = (string[])args;
                        var filesAndFolders = dropped._Bucket(("files", File.Exists), ("folders", Directory.Exists));
                        //filesAndFolders["folders"].SelectMany(folder=>)
                        state.Files = dropped;
                        fileList._Content(dropped);
                        var nodes = dropped
                            .Where(File.Exists)
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
            Dispatch(MsgTypes.FilesDropped, _Arr(
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