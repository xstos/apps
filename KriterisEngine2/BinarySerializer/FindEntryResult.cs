namespace KriterisEngine
{
    public struct FindEntryResult<TValue>
    {
        public bool Found;
        public TValue Entry;
        public static implicit operator bool(FindEntryResult<TValue> result)
        {
            return result.Found;
        }
    }
}