using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace KriterisEngine
{
    public struct Key
    {
        
    }
    
    public class ExpandableMemoryMappedFile : IDisposable
    {
        const int defaultChunkSize = 16777216;

        public int ChunkSize { get; set; }

        public string FilePath { get; set; }
        public List<MemoryMappedFileWrapper> Chunks { get; set; } = new List<MemoryMappedFileWrapper>();
        
        public ExpandableMemoryMappedFile(string filePath=null, int chunkSize=0)
        {
            ChunkSize = chunkSize==0 ? defaultChunkSize : chunkSize;
            FilePath = filePath ?? "./data";
        }

        public static void Test()
        {
            using (var mmf = new ExpandableMemoryMappedFile("./data", 5))
            {
                var bytesOrig = new byte[] {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
                mmf.Write(1, bytesOrig);
                var bytes =  mmf.Read(1, 12);
                Debug.Assert(bytesOrig.SequenceEqual(bytes));
            }
        }
        
        MemoryMappedFileWrapper getCreateChunkAtOffset(long offset)
        {
            var chunkIndex = (int)(offset/ChunkSize);
            if (chunkIndex < Chunks.Count)
            {
                return Chunks[chunkIndex];
            }
            var newed = new MemoryMappedFileWrapper(ChunkSize, FilePath+chunkIndex) {Id = chunkIndex};
            Chunks.Add(newed);
            return newed;
        }

        public Func<string,object, Key> KeyFactory = (s,o) =>
        {
            return new Key();
        };
        public void Write(int value, params Key[] keys)
        {
            // day, month, year, symbol, close
        }
        public void Write(long offset,byte[] bytes)
        {
            var chunkSize = ChunkSize;
            var pending = bytes.Length;
            var byteOffset = 0;
            while (pending > 0)
            {
                var chunkOffset = (int)(offset % chunkSize);
                var currentChunk = getCreateChunkAtOffset(offset);
                var bytesRemainingInChunk = chunkSize - chunkOffset;
                var count = Math.Min(bytesRemainingInChunk,pending);
                
                currentChunk.Write(chunkOffset,bytes,byteOffset,count);

                byteOffset += count;
                pending -= count;
                offset += count;
            }
        }
        public byte[] Read(long offset, int numBytes)
        {
            byte[] bytes = new byte[numBytes];

            var chunkSize = ChunkSize;
            var pending = bytes.Length;
            var byteOffset = 0;
            while (pending > 0)
            {
                var chunkOffset = (int)(offset % chunkSize);
                var currentChunk = getCreateChunkAtOffset(offset);
                var bytesRemainingInChunk = chunkSize - chunkOffset;
                var count = Math.Min(bytesRemainingInChunk, pending);

                currentChunk.Read(chunkOffset, bytes, byteOffset, count);

                byteOffset += count;
                pending -= count;
                offset += count;
            }
            return bytes;
        }

        public void Dispose()
        {
            foreach (var chunk in Chunks)
            {
                chunk.Dispose();
            }
        }
    }
}