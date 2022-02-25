using System;
using System.Collections.Generic;
using System.Linq;

namespace KriterisEngine
{
    public class EqualityComparer<T> : IEqualityComparer<T>
    {
        public static readonly EqualityComparer<T[]> ArrayComparer = new EqualityComparer<T[]>((a1, a2) => (a1).SequenceEqual(a2), a => a._GetHashCode());
        readonly Func<T, T, bool> _equalsFn;
        readonly Func<T, int> _getHashCodefn;

        public EqualityComparer(Func<T, T, bool> equalsFn, Func<T, int> getHashCodefn)
        {
            _equalsFn = equalsFn;
            _getHashCodefn = getHashCodefn;
        }

        public bool Equals(T x, T y)
        {
            return _equalsFn(x, y);
        }

        public int GetHashCode(T obj)
        {
            return _getHashCodefn(obj);
        }
    }
}