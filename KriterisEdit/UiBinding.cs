using System;

namespace KriterisEdit
{
    public class UiBinding
    {
        public Action<dynamic> Set { get; set; } = o => { };
        public static UiBinding New(Action<dynamic> set)
        {
            var ret = new UiBinding()
            {
                Set = set,
            };
            
            return ret;
        }

        public UiBinding Add(string id)
        {
            GlobalStatics.UiBindings[id] = this;
            return this;
        }
    }
}