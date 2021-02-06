namespace KriterisEngine.ReactRedux
{
    public class Message
    {
        public string Type { get; private set; }
        public object Payload { get; private set; }
        public Message(string type, object payload)
        {
            this.Type = type;
            this.Payload = payload;
        }

        public T Get<T>() => Payload.As<T>();

        public static implicit operator Message((string type, object payload) msg)
        {
            return new Message(msg.type, msg.payload);
        }
    }
}