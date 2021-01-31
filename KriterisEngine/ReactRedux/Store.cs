using System;
using System.Collections.Generic;
using System.Linq;

namespace KriterisEngine.ReactRedux
{
    public class Store
    {
        public Action<Message> Dispatch { get; set; }
        public Action CloseDb { get; set; }
        public Action<Action<Message>> Subscribe { get; set; }
        public Action Replay { get; set; }
        public static Store New()
        {
            Db.New(@"c:\temp\mydb.bin").Out(out var db);
            
            Action<Message> subscriptions = message => { };

            void Dispatch(Message message)
            {
                db.Write(message);
                DispatchCore(message);
            }

            void DispatchCore(Message message1)
            {
                subscriptions.Invoke(message1);
            }

            void Subscribe(Action<Message> action)
            {
                subscriptions += action;
            }

            void Replay()
            {
                db.GetItems().Cast<Message>().ForEach(DispatchCore);
            }

            return new Store()
            {
                Dispatch = Dispatch,
                Subscribe = Subscribe,
                Replay = Replay,
                CloseDb = db.Close
            };
        }
    }
}