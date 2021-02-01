using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using AnySerializer;
using KriterisEngine.ReactRedux;

namespace KriterisEngine
{
    public class Db
    {
        public Func<object, Db> Write;
        public Func<object> Read;
        public Action Close { get; set; } 
        public static Db New(string path)
        {
            var db = new Db();
            db.Write = o =>
            {
                using var fs = File.Open(path, FileMode.Truncate, FileAccess.Write, FileShare.None);
                Serializer.Serialize(o, true).Out(out var bytes);
                fs.Write(bytes, 0, bytes.Length);
                fs.Flush(true);
                return db;
            };
            db.Read = () =>
            {
                using var fs = File.Open(path, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
                Serializer.Deserialize<Message[]>(fs, SerializerOptions.EmbedTypes).Out(out var ret);
                return ret;
            };
            return db;
        }
    }
}