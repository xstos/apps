using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;

namespace KriterisEngine
{
    public static class BinarySerializerHelper
    {
        public static Dictionary<Type, Tok> PrimitiveTypeCodes = new Dictionary<Type, Tok>()
        {
            {typeof(string),Tok.String},
            {typeof(int),Tok.Int},
            {typeof(bool),Tok.Bool},
            {typeof(byte),Tok.Byte},
            {typeof(char),Tok.Char},
            {typeof(double),Tok.Double},
            {typeof(short),Tok.Short},
            {typeof(float),Tok.Float},
            {typeof(decimal),Tok.Decimal},
            {typeof(long),Tok.Long},
            {typeof(sbyte),Tok.Sbyte},
            {typeof(uint),Tok.Uint},
            {typeof(ulong),Tok.Ulong},
            {typeof(ushort),Tok.Ushort},
            {typeof(IntPtr),Tok.IntPtr}
        };
        public static void Write(ref BinaryWriter writer,ref object value)
        {
            switch (value)
            {
                case null:
                    writer._WriteTok(Tok.Null);
                    break;
                case string s:
                    writer._WriteTok(Tok.String);
                    writer.Write(s);
                    break;
                case int i:
                    writer._WriteTok(Tok.Int);
                    writer.Write(i);
                    break;
                case bool b:
                    writer._WriteTok(b ? Tok.BoolTrue : Tok.BoolFalse);
                    break;
                case byte b:
                    writer._WriteTok(Tok.Byte);
                    writer.Write(b);
                    break;
                case char c:
                    writer._WriteTok(Tok.Char);
                    writer.Write(c);
                    break;
                case double d:
                    writer._WriteTok(Tok.Double);
                    writer.Write(d);
                    break;
                case short s:
                    writer._WriteTok(Tok.Short);
                    writer.Write(s);
                    break;
                case float f:
                    writer._WriteTok(Tok.Float);
                    writer.Write(f);
                    break;
                case decimal d:
                    writer._WriteTok(Tok.Decimal);
                    writer.Write(d);
                    break;
                case long l:
                    writer._WriteTok(Tok.Long);
                    writer.Write(l);
                    break;
                case sbyte sb:
                    writer._WriteTok(Tok.Sbyte);
                    writer.Write(sb);
                    break;
                case uint u:
                    writer._WriteTok(Tok.Uint);
                    writer.Write(u);
                    break;
                case ulong ul:
                    writer._WriteTok(Tok.Ulong);
                    writer.Write(ul);
                    break;
                case ushort us:
                    writer._WriteTok(Tok.Ushort);
                    writer.Write(us);
                    break;
                case Type type:
                    writer._WriteTok(Tok.Type);
                    writer.Write(type.FullName);
                    break;
            }
        }

        public static object Read(ref BinaryReader reader)
        {
            var tok = reader._ReadTok();
            return tok switch
            {
                Tok.Null => null,
                Tok.String => reader.ReadString(),
                Tok.Int => reader.ReadInt32(),
                Tok.BoolTrue => true,
                Tok.BoolFalse => false,
                Tok.Byte => reader.ReadByte(),
                Tok.Char => reader.ReadChar(),
                Tok.Double => reader.ReadDouble(),
                Tok.Short => reader.ReadInt16(),
                Tok.Float => reader.ReadSingle(),
                Tok.Decimal => reader.ReadDecimal(),
                Tok.Long => reader.ReadInt64(),
                Tok.Sbyte => reader.ReadSByte(),
                Tok.Uint => reader.ReadUInt32(),
                Tok.Ulong => reader.ReadUInt64(),
                Tok.Ushort => reader.ReadUInt16(),
                Tok.Type => Type.GetType(reader.ReadString()),
                _ => null
            };
        }

        public static object CreateUninitializedObject(ref Type type)
        {
            return FormatterServices.GetUninitializedObject(type);
        }
    }
}