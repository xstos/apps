using System.Linq;

namespace KriterisEngine.ReactRedux
{
    public class Route
    {
        public Id Id { get; set; }
        public string Path { get; set; }
        public What Action { get; set; } 
        public static implicit operator string(Route route)
        {
            return route.Path;
        }
        public static implicit operator Route(string path)
        {
            new Route().Out(out var ret);
            
            path.Split('/').Out(out var parts);
            parts.Select(part =>
                {
                    switch (part)
                    {
                        case "@id":
                            ret.Id = Id.New();
                            return ret.Id.ToString();
                        case "@create":
                            ret.Action = What.Create;
                            return part;
                            break;
                        default:
                            return part;
                    }
                }).Where(s=>s!=null)
                ._Join("/")
                .Out(out var pathstr);
            ret.Path = pathstr;
            return ret;
        }
    }
}