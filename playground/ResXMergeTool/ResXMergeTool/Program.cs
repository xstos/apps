using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.IO;
using System.Linq;
using System.Resources;
using System.Text;

namespace ResXMergeTool
{
    public class EqualityComparer<T> : IEqualityComparer<T>
    {
        Func<T, T, bool> _equalsFn;
        Func<T, int> _getHashCodefn;

        public EqualityComparer(Func<T, T, bool> equalsFn, Func<T, int> getHashCodefn)
        {
            _equalsFn = equalsFn;
            _getHashCodefn = getHashCodefn;
        }

        public bool Equals(T x, T y)
        {
            return _equalsFn(x, y);
        }

        public int GetHashCode(T obj)
        {
            return _getHashCodefn(obj);
        }
    }

    internal static class Program
    {
        static ITypeResolutionService typeres = null;
        
        [STAThread]
        static void Main()
        {
            var searchDirectory = @"C:\repos\cog\dev2\src";
            var destinationMergedResxFile = @"c:\repos\cog\dev\src\Cogniva.Common\Properties\LocalizedStrings.resx";
            var wildcard = "*LocalizedStrings.resx";

            // var searchDirectory = @"C:\repos\cog\dev2\src";
            // var destinationMergedResxFile = @"c:\repos\cog\dev\src\Cogniva.Common\Properties\LocalizedStrings.fr.resx";
            // var wildcard = "*LocalizedStrings.fr.resx";
            
            var files = Directory.GetFileSystemEntries(searchDirectory, wildcard , SearchOption.AllDirectories)
                .Select(s=>new FileInfo(s))
                //.Where(f => f.Name.ToLower().EndsWith("localizedstrings.fr.resx"))
                .Select(f=>f.FullName).ToList();

            var comparer = new EqualityComparer<(ResXDataNode, string, string)>(
                (a1, a2) => string.Equals(a1.Item1.Name, a2.Item1.Name) && a1.Item1.GetValue(typeres).Equals(a2.Item1.GetValue(typeres)),
                    a => (a.Item1.Name, a.Item1.GetValue(typeres)).GetHashCode());

            var allEntries = files
                .Select(File=>
                {
                    var Resx = new ResXResourceReader(File) {UseResXDataNodes = true};
                    return new {File, Resx,};
                })
                .SelectMany(reader => reader.Resx.Cast<DictionaryEntry>().Select(e=>(reader.File,e)))
                .ToLookup(entry => (string)entry.e.Key, entry=>
                {
                    var Node = (ResXDataNode) entry.e.Value;
                    var DisambiguationPostFix = entry.File.Split('\\').Reverse().Skip(2).First().Replace(".", "_");
                    return (Node, DisambiguationPostFix, entry.File );
                },StringComparer.InvariantCultureIgnoreCase)
                .ToDictionary(l=>l.Key, l=>
                {
                    var originalList = l.ToList();
                    var ret = l.Distinct(comparer).ToList();
                    if (ret.Count == 1)
                    {
                        return ret;
                    }
                    else
                    {
//                         foreach (var tuple in originalList)
//                         {
//                             File.AppendAllText(
// @"c:\temp\collisions.txt", $"{l.Key}\t{tuple.File.Replace(@"C:\repos\cog\dev2\","")}\t{tuple.Node.GetValue(typeres)}\n",Encoding.UTF8);
//                         }
                        return originalList;
                    }
                });
            //if (allEntries.Any(entry => entry.Value.Count > 1))
            //{

            //}
            File.Delete(destinationMergedResxFile);
            var writer = new ResXResourceWriter(destinationMergedResxFile);
            foreach (var entry in allEntries.OrderBy(kvp=>kvp.Key))
            {
                if (entry.Value.Count == 1)
                {
                    writer.AddResource(entry.Key,entry.Value[0].Item1.GetValue(typeres));
                }
                else
                {
                    foreach (var (resXDataNode, disamb, file) in entry.Value)
                    {
                        resXDataNode.Name = resXDataNode.Name + "_" + disamb;
                        writer.AddResource(resXDataNode.Name, resXDataNode.GetValue(typeres));
                    }
                }
            }
            
            writer.Generate();
            writer.Dispose();
        }
    }
}
