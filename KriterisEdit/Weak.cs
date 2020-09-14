using System;

namespace KriterisEdit
{
    public class Weak<T> where T : class, new()
    {
        Action _cleanup = () => { };
        T defaultValue = new T();
        WeakReference<T> Value = new WeakReference<T>(new T());

        public T Get()
        {
            if (Value.TryGetTarget(out var instance))
            {
                return instance;
            }

            _cleanup();
            return defaultValue;
        }

        public static Weak<T> New(T obj, Action? cleanup = null)
        {
            return new Weak<T>
            {
                Value = new WeakReference<T>(obj),
                _cleanup = cleanup ?? (() => { })
            };
        }

        public Weak<T> SetDefaultValue(T value)
        {
            defaultValue = value;
            return this;
        }
    }
}