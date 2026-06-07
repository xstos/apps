using System;

namespace RENAME_ME;

public class Disposable : IDisposable
{
    public Action DisposeAction { get; } = () => { };
    public Disposable(Action na, Action da)
    {
        na();
        DisposeAction = da;
    }
    public void Dispose()
    {
        DisposeAction();
    }
}