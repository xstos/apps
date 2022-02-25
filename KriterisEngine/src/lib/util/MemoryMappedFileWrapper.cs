using System;
using System.IO;
using System.IO.MemoryMappedFiles;

namespace KriterisEngine
{
    public class MemoryMappedFileWrapper : IDisposable
    {
        public int Id { get; set; }
        public int Length { get; private set; }

        MemoryMappedFile File { get; set; }
        MemoryMappedViewAccessor View { get; set; }

        public MemoryMappedFileWrapper(int length, string filePath)
        {
            Length = length;

            File = System.IO.MemoryMappedFiles.MemoryMappedFile.CreateFromFile(filePath,FileMode.OpenOrCreate,Guid.NewGuid().ToString("N"),length);
            View = File.CreateViewAccessor(0, length);
        }
        
        public int Read(long position,byte[] array,int offset,int count)
        {
            return View.ReadArray(position, array, offset, count);
        }
        public void Write(long position,byte[] bytes,int byteOffset, int count)
        {
            View.WriteArray(position, bytes, byteOffset, count);
            //var newSize = position + bytes.Length;
            //if (newSize > UsedSize) newSize = UsedSize;
        }

        public void Dispose()
        {
            View.Dispose();
            File.Dispose();
        }

        ~MemoryMappedFileWrapper()
        {
            Dispose();
        }
    }
}