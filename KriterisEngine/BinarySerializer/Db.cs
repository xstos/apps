using System;
using System.Collections.Generic;
using System.IO;

namespace KriterisEngine
{
    public class Db
    {
        public Func<object, Db> Write;
        public Func<IEnumerable<object>> GetItems;
        public Action Close { get; set; } 
        public static Db New(string path)
        {
            var fs = File.Open(path, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
            var bs = new BinarySerializer(fs);
            var db = new Db();
            db.Write = o =>
            {
                bs.Serialize(o);
                fs.Flush();
                return db;
            };
            db.GetItems = () =>
            {
                return bs.DeserializeAll();
            };
            db.Close = () =>
            {
                fs.Close();
            };
            return db;
        }
    }
}