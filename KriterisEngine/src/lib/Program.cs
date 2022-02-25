using System;
using System.Collections.Generic;
using System.IO;
using System.IO.MemoryMappedFiles;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
namespace KriterisEngine
{
    class Program
    {
        static void ShowWindow()
        {
            var win = new Window
            {
                Left = 0,
                Top = 0,
                Width = 1200,
                Height = 1200,
            };
            win.Content = new Button() {Content = "hi!"};
            var app = new Application();
            app.Run(win);
        }
        [STAThread]
        public static void Main(string[] args)
        {
            var mmf = new ExpandableMemoryMappedFile(null,2);
            mmf.Write(0,new byte[] { 1,2 });
            mmf.Write(2,new byte[] { 3,4 });
            //var ret = mmf.Read(0, 4);
            var keyFactory = mmf.KeyFactory;

            var j = File.ReadAllText(@"C:\Users\user\Downloads\eoddata\data_out_json\BAM_A.TO.json", Encoding.UTF8);
            var obj = JsonSerializer.Deserialize<StockData>(j);
            var symKey = keyFactory("symbol", obj.symbol);
            obj.rows.ForEach(r =>
            {
                var els = r.Cast<JsonElement>().ToArray();
                var date = els[0].GetInt64();
                var offs=DateTimeOffset.FromUnixTimeMilliseconds(date);
                var day = offs.Day;
                var month = offs.Month;
                var year = offs.Year;
                var dayKey = keyFactory("day", day);
                var monthKey = keyFactory("month", month);
                var yearKey = keyFactory("year", year);
                mmf.Write();
            });
        }

        public class StockData
        {
            public string symbol { get; set; }
            public List<object[]> rows { get; set; }
        }
    }
    
}
