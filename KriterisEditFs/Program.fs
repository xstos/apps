namespace KriterisEditFs
open System
open System.Windows
open System.Windows.Controls

module Main =
    let buildWindow (win: Window) =
        _win win
            [
                dockpanel 
                    [
                        //DockProp(Dock.Top)
                        TextBlock(Text = "d1")
                    ]
                dockpanel 
                    [
                        DockProp(Dock.Bottom)      
                    ]
                TextBlock(Text = "d1")
                TextBlock(Text = "d2")
            ]


    let Init =
        let app = Application()
        let win = Window()
        let mainPanel = DockPanel()
        app.MainWindow <- win
        win.Loaded.Add(fun args ->
            win.Width <- 1920.0
            win.Height <- 1080.0
            //win.Background <- System.Windows.Media.Brushes.Black

            win.Title <- "sup".Right(2)
            buildWindow (win))
        do (app.Run(win)) |> ignore


    [<EntryPoint>]
    [<STAThread>]
    let main argv =
        Init
        0 // return an integer exit code
