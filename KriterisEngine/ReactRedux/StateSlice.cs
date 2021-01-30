using System.Linq;

namespace KriterisEngine.ReactRedux
{
    public class StateSlice
    {
        public StateId Id { get; set; }
        public string Path { get; set; }
        public string Action { get; set; } 
        public static implicit operator string(StateSlice slice)
        {
            return slice.Path;
        }
        public static implicit operator StateSlice(string path)
        {
            new StateSlice().Out(out var ret);
            
            path.Split('/').Out(out var parts);
            parts.Select(part =>
                {
                    switch (part)
                    {
                        case "@id":
                            ret.Id = StateId.New();
                            return ret.Id.ToString();
                        case "@create":
                            ret.Action = "create";
                            return null;
                        default:
                            return part;
                    }
                }).Where(s=>s!=null)
                ._Join("/")
                .Out(out var pathstr);
            ret.Path = pathstr;
            return new StateSlice();
        }
    }
}