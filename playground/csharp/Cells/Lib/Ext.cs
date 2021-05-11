using System.Collections.Generic;

namespace Cells
{
    public static class Ext
    {
        public static T Assert<T>(this T item, object value)
        {
            System.Diagnostics.Debug.Assert(Equals(item,value));
            return item;
        }
        public static List<T> SafeSet<T>(this List<T> list, int index, T value)
        {
            list.Grow(index);
            list[index] = value;
            return list;
        }
        public static T SafeGet<T>(this List<T> list, int index)
        {
            var lastIndex = list.Count - 1;
            if (index > lastIndex) return default(T);
            return list[index];
        }
        public static List<T> Grow<T>(this List<T> list, int index)
        {
            var count = list.Count; //3
            var lastIndex = count - 1; //2
            var delta = index - lastIndex;
            if (delta < 1)
            {
                return list;
            }

            for (int i = 0; i < delta; i++)
            {
                list.Add(default(T));
            }

            return list;
        }
    }
}