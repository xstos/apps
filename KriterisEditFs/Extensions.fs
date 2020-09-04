namespace KriterisEditFs 
    module Extensions =
        type System.String with
            member x.Right(index) = x.Substring(x.Length - index)