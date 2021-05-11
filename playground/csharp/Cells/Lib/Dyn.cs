using System.Dynamic;

namespace Cells
{
    public delegate bool TryGetMemberDel(GetMemberBinder binder, out object result);
    public delegate bool TrySetMemberDel(SetMemberBinder binder, object value);
    public class Dyn : DynamicObject
    {
        public TryGetMemberDel TryGetMember2;
        public TrySetMemberDel TrySetMember2;
        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            if (TryGetMember2 == null) return base.TryGetMember(binder, out result);
            return TryGetMember2(binder, out result);
        }

        public override bool TrySetMember(SetMemberBinder binder, object value)
        {
            if (TrySetMember2 == null) return base.TrySetMember(binder, value);
            return TrySetMember2(binder, value);
        }
    }
}