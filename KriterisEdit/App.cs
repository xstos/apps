using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using static KriterisEdit.Extensions;
using static KriterisEdit.GlobalStatics;
using static System.IO.File;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]

namespace KriterisEdit
{
    public static class App
    {
        [STAThread]
        static void Main(string[] args)
        {
            var app = BuildApp();
            app.Run(app.MainWindow);
        }

        static Application BuildApp()
        {
            var app = new Application();
            app.MainWindow = new Window();
            void Activated(object? sender, EventArgs args)
            {
                app.Activated -= Activated;
                BuildWindow(app.MainWindow);
            }

            app.Activated += Activated;
            return app;
        }
        
        static Window BuildWindow(Window window)
        {
            var (xmlNodes, fileList) = (_ListView("Xml"), _ListView("Todo"));
            Instance.Log = s => Dispatch(Message.Log, s);
            var defaultFiles = _Arr(@"C:\repos\cog\dev\src", "drag", "files", "here");
            
            var FileMask = ("FileMask", "*.csproj").Cell();
            var DroppedFiles = ("DroppedFiles", defaultFiles).Cell();
            var DroppedFilesExpanded = ("DroppedFilesExpanded", _Arr<string>()).Cell();
            
            Formula((DroppedFiles,FileMask),DroppedFilesExpanded, (string[] dropped, string mask) =>
            {
                return dropped;
            });

            _Grid()
                .Var(out var grid)
                .SetShowGridLines(true)
                .Rows()
                    [_Button("r1c1"), _Button("r1c2"), _Button("r1c3")]
                    [_Button("r2c1"), _Button("r2c2")]
                .Build()
                ;
            UIElement XamlBuilderControl()
            {
                _DockPanel().Var(out var outerPanel);
                return outerPanel;
            }

            _DockPanel()._Content(
                _DockPanel()._Dock(Dock.Top)
                    ._Content(
                        _Label()._Dock(Dock.Left)._Content("mask:"),
                        _TextBox().Bind(FileMask),
                        _TextBox().Bind(FileMask)
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
                            .Bind(DroppedFiles, DroppedFilesExpanded)
                    ),
                xmlNodes
            ).Var(out var bulkXml);
            window
                ._Min(1600)
                ._Content(
                    grid
                );

            Redux.State = new State();
            Redux.Reducer = (state, action) =>
            {
                var (msg, args) = action;
                switch (msg)
                {
                    case Message.FilesDropped:
                        var dropped = (string[]) args;
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
}