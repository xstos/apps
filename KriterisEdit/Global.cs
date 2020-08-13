using System;

namespace KriterisEdit
{
    public partial class Global
    {
        public static readonly Global Instance = new Global();
        
        public readonly Redux Redux = new Redux();    
        public readonly Handlers Handlers = new Handlers();
        public Action<string> Log = s => {};
    }
    public static class GlobalStatics
    {
        public static Action<string> Log => Global.Instance.Log;
        public static Redux Redux => Global.Instance.Redux;
        public static Redux Dispatch(MsgTypes type, dynamic args) => Redux.Dispatch(type, args);
    }
}