open System
open System.Windows
open System.Windows.Controls
open KriterisEditFs.Extensions
let Init =
    let app = Application();
    let win = Window()
    let mainPanel = DockPanel()
    
    win.Loaded.Add(fun args ->
        win.Width <- 1920.0
        win.Height <- 1080.0
        win.Background <- System.Windows.Media.Brushes.Black
        win.Content <- mainPanel
        win.Title <-  "sup".Right(2)
    )
    do (app.Run(win)) |> ignore

[<EntryPoint>]
[<STAThread>]
let main argv =
    Init
    0 // return an integer exit code
