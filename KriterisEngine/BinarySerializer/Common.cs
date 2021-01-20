using System;
using System.CodeDom;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using CSScriptLib;
using Microsoft.CSharp;

namespace KriterisEngine
{
    public static partial class Common
    {
        public static FindEntryResult<T> _GetCreate2<K, T>(this IDictionary<K, T> dictionary, K key, Func<T> ctor)
        {
            var contains = dictionary._FindEntry(key);
            if (contains)
            {
                return contains;
            }

            contains.Entry = ctor();
            dictionary.Add(key, contains.Entry);
            return contains;
        }
        public static FindEntryResult<TValue> _FindEntry<TKey, TValue>(this IDictionary<TKey, TValue> dictionary,TKey key)
        {
            var result = new FindEntryResult<TValue>();
            if (dictionary == null) return result;
            result.Found = dictionary.TryGetValue(key, out result.Entry);
            return result;
        } 
        public static int _GetHashCode<T>(this T[] items, int hash = 17)
        {
            unchecked // Overflow is fine, just wrap 
            {
                int hc;
                for (var i = 0; i < items.Length; i++)
                {
                    hc = items[i] == null ? 0 : items[i].GetHashCode();
                    hc._Hash(ref hash, 29);
                }
                return hash;
            }
        }
        public static void _Hash(this int number, ref int hash, int multiplier)
        {
            unchecked // Overflow is fine, just wrap 
            {
                hash = hash * multiplier + number;
            }
        }
        static ConcurrentDictionary<Type,string> cachedFriendlyTypeNames = new ConcurrentDictionary<Type, string>();
        static ConcurrentDictionary<string, Type> cachedFriendlyTypes = new ConcurrentDictionary<string, Type>(); 
        public static Type _GetTypeFromFriendlyTypeName(this string friendlyName)
        {
            var found = cachedFriendlyTypes._FindEntry(friendlyName);
            if (found) return found.Entry;
            var code = 
@"public class TypeFullNameGetter
{
    public override string ToString()
    {
        return typeof(" + friendlyName + @").AssemblyQualifiedName;
    }
}
";
            var script = CSScript.Evaluator.LoadCode(code);
            var str = script.ToString();
            var ret = Type.GetType(str);
            cachedFriendlyTypes[friendlyName] = ret;
            return ret;
        }
        public static string _GetFriendlyTypeName(this Type type)
        {
            var found = cachedFriendlyTypeNames._FindEntry(type);
            if (found) return found.Entry;
            using (var p = new CSharpCodeProvider())
            {
                var r = new CodeTypeReference(type);
                var fn = p.GetTypeOutput(r);
                cachedFriendlyTypeNames[type] = fn;
                return fn;
            }
        }
        public static FieldInfo[] _GetFields(this Type type)
        {
            return type.GetFields(BindingFlags.FlattenHierarchy | BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);
        }
        public static FieldInfo[] _GetFields(this object item)
        {
            if (item == null) return new FieldInfo[0];
            return item.GetType()._GetFields();
        }
        public static string _ToHex(this byte[] bytes)
        {
            var sb = new StringBuilder();
            for (var i = 0; i < bytes.Length; i++)
            {
                sb.Append(bytes[i].ToString("x2"));
            }
            return sb.ToString();
        }
        public static byte[] _ToBytes(this string text)
        {
            var encoding = new UTF8Encoding();
            return encoding.GetBytes(text);
        }
        public static string _Join(this IEnumerable<string> strings, string separator)
        {
            return String.Join(separator, strings.ToArray());
        }
        public static Stream _SeekTo(this Stream stream, SeekOrigin seekOrigin = SeekOrigin.Begin)
        {
            stream.Seek(0, seekOrigin);
            return stream;
        }

        public static bool _AtEnd(this Stream stream)
        {
            return (stream.Position == stream.Length);
        }
        public static IEnumerable<int[]> _ArrayLooper(this Array array)
        {
            if (array.Length <= 0)
            {
                yield break;
            }

            var rank = array.Rank;
            var lowerBounds = new int[rank];
            var upperBounds = new int[rank];
            for (var i = 0; i < rank; i++)
            {
                lowerBounds[i] = array.GetLowerBound(i);
                upperBounds[i] = array.GetUpperBound(i);
            }
            var indexes = (int[]) lowerBounds.Clone();
            yield return lowerBounds;
            for (var j = 0; j < array.Length - 1; j++)
            {
                var carry = true;
                for (var i = rank - 1; i >= 0; i--)
                {
                    if (carry)
                    {
                        indexes[i]++;
                        carry = false;
                    }

                    if (indexes[i] <= upperBounds[i])
                    {
                        continue;
                    }

                    indexes[i] = lowerBounds[i];
                    carry = true;
                }
                yield return indexes;
            }
        }
    }
}