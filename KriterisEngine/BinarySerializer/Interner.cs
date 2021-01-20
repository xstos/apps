using System;
using System.Collections.Generic;

namespace KriterisEngine
{
    public class Interner<T>
    {
        Dictionary<T,int> map = new Dictionary<T, int>();
        Dictionary<int, T> inverseMap = new Dictionary<int, T>();
        public FindEntryResult<int> GetCreate(T key,Func<int> ctor)
        {
            var result = map._GetCreate2(key, ctor);
            return result;
        }

        public FindEntryResult<T> GetCreate(int key, Func<T> ctor)
        {
            var result = inverseMap._GetCreate2(key, ctor);
            return result;
        } 
    }
}