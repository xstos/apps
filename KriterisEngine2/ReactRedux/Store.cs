using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Newtonsoft.Json;

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
            var list = new List<Message>();
            Db.New(@"c:\temp\mydb.bin").Out(out var db);
            db.Close = () =>
            {
                db.Write(list.ToArray());
            };
            Action<Message> subscriptions = message => { };

            void Dispatch(Message message)
            {
                list.Add(message);
                DispatchCore(message);
            }

            void DispatchCore(Message message1)
            {
                Debug.WriteLine(JsonConvert.SerializeObject(message1));
                subscriptions.Invoke(message1);
            }

            void Subscribe(Action<Message> action)
            {
                subscriptions += action;
            }

            void Replay()
            {
                db.Read().As<Message[]>().Out(out var messages);
                messages ??= new Message[0];
                Debug.WriteLine("Loading DB");
                Debug.WriteLine(JsonConvert.SerializeObject(messages));
                Debug.WriteLine("");
                messages.ForEach(Dispatch);
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