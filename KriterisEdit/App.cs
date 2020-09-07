using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using static KriterisEdit.Extensions;
using static KriterisEdit.GlobalStatics;
using static System.IO.File;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace KriterisEdit
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            var app = new App();
            app.Run(app.MainWindow);
        }
    }

    public static class AppExtensions
    {
        public static Window BuildApp(this Window window)
        {
            var (xmlNodes, fileList) = (_ListView("Xml"), _ListView("Todo"));
            Instance.Log = s => Dispatch(Message.Log, s);
            var defaultFiles = _Arr(@"C:\repos\cog\dev\src", "drag", "files", "here");
            Instance.Cells.Add
                ("FileMask", "*.csproj")
                ("DroppedFilesRaw", defaultFiles)
                ("DroppedFiles", defaultFiles)
            ;
            window
                ._Min(width: 1600)
                ._Content(
                    _DockPanel()._Content(
                        _DockPanel()._Dock(Dock.Top)
                            ._Content(
                                _Label()._Dock(Dock.Left)._Content("mask:"),
                                _TextBox("MaskBox1")
                                    .Bind(readCellName: "FileMask"),
                                _TextBox("MaskBox1Mirror")
                                    .Bind(readCellName: "FileMask")
                            ),
                        _DockPanel()
                            ._Dock(Dock.Top)
                            ._Content(
                                    _Label()._Content("files:"),
                                    _ListView("Files")
                                    ._Dock(Dock.Top)
                                    ._Max(height: 100)
                                    ._Min(height: 100)
                                    ._AllowDrop()
                                    .Bind("DroppedFiles", "DroppedFilesRaw")
                                ),
                        xmlNodes
                    )
                );

            Redux.State = new State();
            Redux.Reducer = (state, action) =>
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
            return window;
        }

    }
    public class App : Application
    {
        public Window MainWindow = new Window();
       
        protected override void OnStartup(StartupEventArgs e)
        {
            void onActivated(object? sender, EventArgs args)
            {
                MainWindow.BuildApp();
                Activated -= onActivated;
            }

            Activated += onActivated;
        }
    }
}