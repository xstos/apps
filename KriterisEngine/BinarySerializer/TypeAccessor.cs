using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;

namespace KriterisEngine
{
    public class TypeAccessor
    {
        public static readonly EqualityComparer<object> ReferenceEqualsComparer = new EqualityComparer<object>(ReferenceEquals,RuntimeHelpers.GetHashCode);
        static ConcurrentDictionary<Type, TypeAccessor> cachedAccessors = new ConcurrentDictionary<Type, TypeAccessor>();
        public Dictionary<string, FieldAccessor> FieldMap { get; set; }
        public List<List<FieldAccessor>> FieldsByCategory { get; set; }
        public Type Type { get; set; }
        public string Md5Hash { get; set; }
        public string Sha1Hash { get; set; }

        void Init(Type type)
        {
            Type = type;
            var fields = type._GetFields();
            foreach (var fieldInfo in fields)
            {
                var fa = new FieldAccessor(fieldInfo);
                var name = fieldInfo.Name;
                FieldMap[name] = fa;
                FieldsByCategory[(int)fa.Flags].Add(fa);
            }
            var str = fields.OrderBy(t => t.Name).Select(t => t.Name + "\t"+ t.FieldType._GetFriendlyTypeName())._Join(Environment.NewLine);
            var bytes = str._ToBytes();
            MD5 md5 = new MD5CryptoServiceProvider();
            Md5Hash = md5.ComputeHash(bytes)._ToHex();
            var sha = new SHA1CryptoServiceProvider();
            Sha1Hash = sha.ComputeHash(bytes)._ToHex();
        }

        TypeAccessor()
        {
            FieldMap = new Dictionary<string, FieldAccessor>();
            FieldsByCategory = new List<List<FieldAccessor>>();
            var values = Enum.GetValues(typeof (TypeFlags));
            foreach (TypeFlags flag in values)   
                FieldsByCategory.Add(new List<FieldAccessor>());
        }
        public static TypeAccessor GetCreate(Type type)
        {
            var contains = cachedAccessors._FindEntry(type);
            if (contains) return contains.Entry;
            var ta = new TypeAccessor();
            ta.Init(type);
            cachedAccessors[type] = ta;
            return ta;
        }

        public Dictionary<string, object> GetValues(object instance)
        {
            return FieldMap.ToDictionary(p => p.Key, p => p.Value.Getter(instance));
        }
        public static T DeepClone<T>(T o)
        {
            var alreadyCloned = new Dictionary<object, object>(ReferenceEqualsComparer);
            return (T)DeepClone(o, ref alreadyCloned);
        }
        static object DeepClone(object o,ref Dictionary<object, object> alreadyCloned)
        {
            if (o == null) return null;
            var contains = alreadyCloned._FindEntry(o);
            if (contains) return contains.Entry;
            var type = o.GetType();
            if (type.IsValueType || o is string)
            {
                return o;
            }
            else if (o is Array array)
            {
                var clone = (Array)array.Clone();
                alreadyCloned[array] = clone;
                foreach (var indices in clone._ArrayLooper())
                {
                    var value = clone.GetValue(indices);
                    clone.SetValue(DeepClone(value, ref alreadyCloned),indices);
                }
                return clone;
            }
            else
            {
                var result = BinarySerializerHelper.CreateUninitializedObject(ref type);
                alreadyCloned[o] = result;
                var ta = GetCreate(type);
                foreach (var fieldAccessor in ta.FieldMap)
                {
                    var value = fieldAccessor.Value.Getter(o);
                    fieldAccessor.Value.Setter(result, DeepClone(value, ref alreadyCloned));
                }
                return result;
            }
        }
    }
}