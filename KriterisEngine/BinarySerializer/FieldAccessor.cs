using System;
using System.Reflection;

namespace KriterisEngine
{
    public class FieldAccessor
    {
        public TypeFlags Flags;
        public Type Type { get; set; }
        public FieldInfo FieldInfo;
        public Action<object, object> Setter;
        public Func<object, object> Getter;

        public FieldAccessor(FieldInfo fieldInfo)
        {
            FieldInfo = fieldInfo;
            Type = fieldInfo.FieldType;
            Getter = fieldInfo._CreateNonStaticGetter();
            Setter = fieldInfo._CreateNonStaticSetter();
            if (Type.IsPrimitive || Type == typeof (string))
            {
                Flags = TypeFlags.Primitive;
            } else if (Type.IsSubclassOf(typeof (Array)))
            {
                Flags = TypeFlags.Array;
            } else if (Type.IsClass || Type.IsValueType)
            {
                Flags = TypeFlags.ClassOrStruct;
                TypeAccessor.GetCreate(Type);
            } else if (Type.IsInterface)
            {
                Flags = TypeFlags.Interface;
            }
        }
            
    }

    public enum TypeFlags
    {
        Primitive //incl strings
        ,Array
        ,ClassOrStruct,
        Interface
    }
}