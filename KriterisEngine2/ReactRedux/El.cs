using System;
using NReact;

namespace KriterisEngine
{
    public class El : NClass
    {
        public Func<El, NElement> RenderFunc { get; set; }
        public override NElement Render()
        {
            return RenderFunc(this);
        }

        public (Func<T>, Action<T>) Prop<T>(NProperty prop, T defaultValue)
        {
            return (() => Get(prop, defaultValue), (v) => Set(prop, v));
        }
        public static El New(Func<El, NElement> render, Action<El> ctor = null)
        {
            new El() { RenderFunc = render }.Out(out var ret);
            if (ctor != null) ctor(ret);
            return ret;
        }
    }

    public static class NExt
    {
        public static readonly NProperties Props = new NProperties();

        public static NXaml<T> N<T>(object key=null) where T : new()
        {
            if (key == null) return new NXaml<T>();
            return new NXaml<T>(key);
        }
    }
}