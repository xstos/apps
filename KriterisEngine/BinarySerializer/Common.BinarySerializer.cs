using System.IO;

namespace KriterisEngine
{
    public static partial class Common
    {
        public static void _WriteTok(this BinaryWriter writer,Tok value)
        {
            writer.Write((uint)value);
        }
        public static Tok _ReadTok(this BinaryReader reader)
        {
            return (Tok)reader.ReadUInt32();
        }
        public static void _BinarySerialize(this Stream stream,object o)
        {
            var bs = new BinarySerializer(stream);
            bs.Serialize(o);
        }

        public static object _BinaryDeserialize(this Stream stream)
        {
            var bs = new BinarySerializer(stream);
            return bs.Deserialize();
        }
    }
}