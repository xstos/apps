using System;
using System.Collections.Generic;

namespace derpide;

public class Cell<T>
{
    public T Value { get; set; }
    readonly List<WeakReference<Action<T>>> _listeners = new();

    public Cell(T initialValue) => Value = initialValue;

    public Cell<T> OnChange(Action<T> listener)
    {
        _listeners.Add(new WeakReference<Action<T>>(listener));
        return this;
    }

    public void NotifyListeners()
    {
        // Notify listeners and clean up dead ones
        for (int i = _listeners.Count - 1; i >= 0; i--)
        {
            if (_listeners[i].TryGetTarget(out var listener))
            {
                listener(Value);
            }
            else
            {
                _listeners.RemoveAt(i); // Clean up dead reference
            }
        }
    }
    public void Set(T newValue)
    {
        Value = newValue;
    }

    public static implicit operator T(Cell<T> c)
    {
        return c.Value;
    }

    public static implicit operator Cell<T>(T value)
    {
        return new Cell<T>(value);
    }
}