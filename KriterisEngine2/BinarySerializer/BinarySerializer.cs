using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;

namespace KriterisEngine
{
    public enum BinarySerializerMode
    {
        Read,
        Write,
        ReadWrite
    }
    public enum Tok
    {
        Null=100,
        String,
        Int ,
        Bool,
        BoolTrue,
        BoolFalse,
        Byte,
        Char,
        Double,
        Short,
        Float,
        Decimal,
        Long,
        Sbyte,
        Uint,
        Ulong,
        Ushort,
        IntPtr,

        Type,

        MetaInternType,
        MetaAlreadySerializedObjectId,
        MetaObject,
        MetaPrimitive,
        MetaArray,
        MetaInternPropertyName
    }
    public class BinarySerializer
    {
        Interner<Type> internedTypes = new Interner<Type>();
        Interner<string> internedProperties = new Interner<string>();
        BinaryWriter writer;
        BinaryReader reader;
        int typeSeed = 0;
        Dictionary<object, int> alreadySerialized = new Dictionary<object, int>(TypeAccessor.ReferenceEqualsComparer);
        Dictionary<int, object> alreadyDeserialized = new Dictionary<int, object>();
        internal Stream stream;
        public BinarySerializer(Stream stream,BinarySerializerMode mode = BinarySerializerMode.ReadWrite)
        {
            this.stream = stream;
            if (mode == BinarySerializerMode.Read || mode == BinarySerializerMode.ReadWrite) reader = new BinaryReader(stream);
            if (mode == BinarySerializerMode.Write || mode == BinarySerializerMode.ReadWrite) writer = new BinaryWriter(stream);
        }

        int getNextId() { return typeSeed++; }
        string getInternedString() { return reader.ReadString(); }

        Type getInternedType()
        {
            var typeName = reader.ReadString();
            var type = typeName._GetTypeFromFriendlyTypeName();
            if (type == null)
            {
                throw new SerializationException("Type '" + typeName + "' not found, it was probably renamed.");
            }
            return type;
        }

        FindEntryResult<int> internProperty(FieldAccessor fieldAccessor)
        {
            var found = internedProperties.GetCreate(fieldAccessor.FieldInfo.Name, getNextId);
            writer.Write(found.Entry);
            if (!found)
            {
                writer.Write(fieldAccessor.FieldInfo.Name);
            }
            return found;
        }

        FindEntryResult<int> internType(Type type)
        {
            var found = internedTypes.GetCreate(type, getNextId);
            writer.Write(found.Entry);
            if (!found)
            {
                var fn = type._GetFriendlyTypeName();
                writer.Write(fn);
                //alltypes.Add(fn);
            }
            return found;
        }
        public static List<string> alltypes = new List<string>();
        string uninternProperty(int id) { return internedProperties.GetCreate(id, getInternedString).Entry; }
        Type uninternType(int id) { return (internedTypes.GetCreate(id, getInternedType).Entry); }
        void SerializeClass(object item, Type type)
        {
            var contains = alreadySerialized._FindEntry(item);
            if (contains)
            {
                writer._WriteTok(Tok.MetaAlreadySerializedObjectId);
                writer.Write(contains.Entry);
                return;
            }
            var oid = getNextId();
            
            alreadySerialized[item] = oid;
            var ta = TypeAccessor.GetCreate(type);
            writer._WriteTok(Tok.MetaObject);
            writer.Write(oid);
            writer.Write(ta.Md5Hash);
            writer.Write(ta.Sha1Hash);
            var typeCode = internType(type).Entry;
            
            var primitives = ta.FieldsByCategory[(int)TypeFlags.Primitive];
            var classes = ta.FieldsByCategory[(int)TypeFlags.ClassOrStruct];
            var arrays = ta.FieldsByCategory[(int)TypeFlags.Array];
            writer.Write(primitives.Count);
            writer.Write(classes.Count);
            writer.Write(arrays.Count);
            
            foreach (var fieldAccessor in primitives)
            {
                var fieldValue = fieldAccessor.Getter(item);
                internProperty(fieldAccessor);
                BinarySerializerHelper.Write(ref writer,ref fieldValue);
            }
            
            foreach (var fieldAccessor in classes)
            {
                var fieldValue = fieldAccessor.Getter(item);
                internProperty(fieldAccessor);
                Serialize(fieldValue);
            }
            
            foreach (var fieldAccessor in arrays)
            {
                var fieldValue = fieldAccessor.Getter(item);
                internProperty(fieldAccessor);
                Serialize(fieldValue);
            }
        }

        public IEnumerable<object> DeserializeAll()
        {
            while (!stream._AtEnd())
            {
                yield return Deserialize();
            }
        }
        public object Deserialize()
        {
            var tok = reader._ReadTok();
            switch (tok)
            {
                case Tok.MetaPrimitive:
                    return BinarySerializerHelper.Read(ref reader);
                    break;
                case Tok.MetaArray:
                {
                    var typeCode = reader.ReadInt32();
                    var type = uninternType(typeCode);
                    
                    var rank = reader.ReadInt32();

                    var dims = new object[rank];
                    for (var i = 0; i < rank; i++) dims[i] = reader.ReadInt32();
                    var arr = (Array) Activator.CreateInstance(type, dims);
                    foreach (var index in arr._ArrayLooper()) arr.SetValue(Deserialize(), index);
                    return arr;
                }
                    break;
                case Tok.MetaObject:
                {
                    var oid = reader.ReadInt32();
                    var md5hash = reader.ReadString();
                    var sha1hash = reader.ReadString();
                    var typeCode = reader.ReadInt32();
                    var type = uninternType(typeCode);
                    var ta = TypeAccessor.GetCreate(type);
                    if (ta.Md5Hash != md5hash || ta.Sha1Hash != sha1hash)
                    {
                        throw new SerializationException("Type '"+type.FullName+"' changed since it was serialized.");
                    }
                    var obj = BinarySerializerHelper.CreateUninitializedObject(ref type);
                    alreadyDeserialized[oid] = obj;
                    var primCount = reader.ReadInt32();
                    var classCount = reader.ReadInt32();
                    var arrayCount = reader.ReadInt32();
                    for (var i = 0; i < primCount; i++)
                    {
                        var propertyNameId = reader.ReadInt32();
                        var prop = uninternProperty(propertyNameId);
                        var pval = BinarySerializerHelper.Read(ref reader);
                        ta.FieldMap[prop].Setter(obj, pval);
                    }
                    for (var i = 0; i < classCount; i++)
                    {
                        var propertyNameId = reader.ReadInt32();
                        var prop = uninternProperty(propertyNameId);
                        var item = Deserialize();
                        ta.FieldMap[prop].Setter(obj, item);
                    }
                    for (var i = 0; i < arrayCount; i++)
                    {
                        var propertyNameId = reader.ReadInt32();
                        var prop = uninternProperty(propertyNameId);
                        var item = Deserialize();
                        ta.FieldMap[prop].Setter(obj, item);
                    }
                    return obj;
                }
                    break;
                case Tok.MetaAlreadySerializedObjectId:
                {
                    var oid = reader.ReadInt32();
                    return alreadyDeserialized[oid];
                }
                    break;
            }
            return null;
        }
        public void Serialize(object item)
        {
            if (item == null) goto writePrimitive;
            var type = item.GetType();
            if (type.IsPrimitive)
            {
                goto writePrimitive;
            }
            else if (type.IsArray)
            {
                writer._WriteTok(Tok.MetaArray);
                internType(type);
                var arr = (Array)item;
                writer.Write(arr.Rank);
                for (var i = 0; i < arr.Rank; i++) writer.Write(arr.GetLength(i));
                foreach (var indices in arr._ArrayLooper())
                {
                    var value = arr.GetValue(indices);
                    Serialize(value);
                }
            }
            else if (type.IsClass)
            {
                if (item is string) { goto writePrimitive; }
                SerializeClass(item,type);
                    
            }
            else if (type.IsValueType) //struct
            {
                SerializeClass(item, type);
            }
            return;
            writePrimitive: 
            writer._WriteTok(Tok.MetaPrimitive);
            BinarySerializerHelper.Write(ref writer,ref item);
            return;
        }
    }

    
}