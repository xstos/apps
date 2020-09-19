namespace KriterisEditFs
open System
open System.Windows
open System.Windows.Controls
open System.Collections.Generic
open System.Runtime.CompilerServices
[<AutoOpen>]
module Extensions =
    
    type Derp =
        | UI of UIElement
        | DockProp of Dock
        //https://robkuz.github.io/Explicit-vs-Implicit/
        //http://www.fssnip.net/7SO/title/Implicit-conversion-to-discriminated-union
    with
        static member ($) (Derp, x:UIElement) = UI(x)
        static member ($) (Derp, x:Dock) = DockProp(x)
    let inline (|Derp|) x = Unchecked.defaultof<Derp> $ x
        //static member op_Implicit(x: UIElement) = UI(x)
    //let inline toResult x : Derp = ToResult $ x
    
    type ToResult = ToResult
    with
        static member ($) (_: ToResult, l: UIElement) : Derp = UI l
        //and again a method that just returns the input so we can handle strings and Results
        static member ($) (_: ToResult, l: Derp) : Derp = l
    
    type System.String with
        member x.Right(index) = x.Substring(x.Length - index)
    [<Extension>]
    type Utils() =
        [<Extension>]
        static member inline _Dock<'a when 'a :> UIElement>(x, dock: Dock): 'a =
            DockPanel.SetDock(x,dock)
            x
        [<Extension>]
        static member inline SetContent<'a when 'a :> Panel>(x: 'a,[<ParamArray>] content: UIElement[]) : 'a =
            content |> Seq.iter(fun e -> x.Children.Add(e) |> ignore )
            x
        [<Extension>]
        static member inline SetContent<'a when 'a :> ContentControl>(x: 'a,content) : 'a =
            x.Content<-content 
            x
        [<Extension>]
        static member inline Add<'a when 'a :> Panel>(x: 'a) =
            fun (el: UIElement) ->
                x.Children.Add(el) |> ignore
                fun (el2: UIElement) -> x.Children.Add(el2) |> ignore
        
    
        
    let _win (w: Window) (content: IEnumerable<UIElement>) =
        let dp = DockPanel()
        content |> Seq.iter(fun e -> dp.Children.Add(e) |> ignore )
        w.Content<-dp
    
    let inline dockpanel (content: IEnumerable<Derp>) =
        let dp = DockPanel()
        let myfun e =
            match e with
                    | UI uie -> dp.Children.Add(uie) |> ignore
                    | DockProp d -> dp._Dock(d) |> ignore
        content |> Seq.iter(myfun)
        dp
    
    let ui u = UI(u)