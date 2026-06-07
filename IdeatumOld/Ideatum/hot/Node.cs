using System;
using System.Collections.Generic;
using System.Linq;
using Ideatum;
using OneOf;

namespace RENAME_ME;

using TNodeable = OneOf<char, string, Node, Node[]>;
using TPos = (Node Target,NodePos Pos);
using static NodeType;
using static NodeAction;

public enum NodeAction
{
    MoveLeft,
    MoveRight
}

public enum NodeType
{
    Null,
    Open,
    Close,
    Char,
}

public enum NodePos
{
    Before,
    After
}
public class Node
{
    public const char CURSOR = '█';
    public static Node Empty = new Node();
    public static Node[] N(params Node[] n) => n;
    public static Node N1(Node n) => n;
    public NodeType Type = Null;
    public char Data;
    public Node Prev { get; set; } = Empty;
    public Node Next { get; set; } = Empty;
    public Node Parent { get; set; } = Empty;
    public Node Partner { get; set; } = Empty;
    public bool IsEmpty() => Type == Null;
    public bool IsRoot() => Parent.IsEmpty();
    public bool IsOpen() => Type is Open;
    public bool IsClose() => Type is Close;

    public IEnumerable<Node> GetNodes()
    {
        var cur = this;
        while (!cur.IsEmpty())
        {
            yield return cur;
            cur = cur.Next;
        }
    }
    public static Node[] Link(params Node[] n)
    {
        foreach (var (a,b) in n.Pairwise())
        {
            a.Next = b;
            b.Prev = a;
        }
        return n;
    }

    public static Node[] Box()
    {
        var ret = N(Open, Close);
        var o = ret[0];
        var c = ret[1];
        o.Partner = c;
        c.Partner = o;
        return ret;
    }
    public static Node[] Root()
    {
        var (ro, rc) = Box();
        var cursor = N1(CURSOR);
        var ret = Link(ro, cursor, rc);
        cursor.Parent = ro;
        return ret;
    }
    public static void Example()
    {
        LinkedList<int> foo = new LinkedList<int>();
        var (ro, cursor, rc) = Root();
        cursor.Before.Insert("hello");
        cursor.After.Insert(Box());
        foreach (var node in ro.GetNodes())
        {
            Console.Write(node.Data);
        }
        
        //cursor = cursor.Move(Left);
    }
    
    Node Do(NodeAction d)
    {
        if (d == MoveLeft)
        {
            if (Prev.IsRoot()) return this;
            if (Prev.IsOpen()) Parent = Prev.Parent; // <ab<█foo>>
            if (Prev.IsClose()) Parent = Prev.Partner; // <ab<>█cd>
            Link(Prev.Prev, this, Prev, Next); // <a█>
        }

        if (d == MoveRight)
        {
            if (Next.IsRoot()) return this;
            if (Next.IsOpen()) Parent = Next; // <ab█<foo>>
            if (Next.IsClose()) Parent = Next.Parent; // <ab<█>cd>
            Link(Prev, Next, this, Next.Next); // <█a>
        }

        return this;
    }

    public static implicit operator Node(NodeType t) => new() { Type = t};
    public static implicit operator Node(char c) => new() { Type = Char,Data = c };
    
}

public static class NodeExt
{
    extension(Node n)
    {
        public TPos Before => (n, NodePos.Before);
        public TPos After => (n, NodePos.After);
        public Node[] AsArray => [n];
    }

    extension(TPos p)
    {
        public Node Insert(TNodeable x)
        {
            var parent = p.Target.Parent;
            Node before;
            Node after;
            if (p.Pos == NodePos.Before)
            {
                before = p.Target.Prev;
                after = p.Target;
            }
            else
            {
                before = p.Target;
                after = p.Target.Next;
            }
            var nodes = x.Match(c =>
            {
                Node ret = c;
                ret.Parent = parent;
                return [ret];
            }, s =>
            {
                return s.ToCharArray().Select((c,i) =>
                {
                    var ret = (Node)c;
                    ret.Parent = parent;
                    return ret;
                }).LinkSiblings();
            }, n =>
            {
                n.Parent = parent;
                return [n];
            }, nodes1 =>
            {
                return nodes1.Select(n =>
                {
                    n.Parent = parent;
                    return n;
                });
            });
            
            before.AsArray.Concat(nodes).Concat(after.AsArray).LinkSiblings();
            return p.Target;
        }
    }
    extension(IEnumerable<Node> nodes)
    {
        public IEnumerable<Node> LinkSiblings()
        {
            foreach (var (a,b) in nodes.Pairwise())
            {
                a.Next = b;
                b.Prev = a;
            }

            return nodes;
        }

        
    }
    extension(char c)
    {
        //public Node N => new Node() { Type = Char,Data = c };
        //public Nodes Ns => new Nodes() { Data= [c.N] };
    }

    extension(char[] txt)
    {
    }

    extension(IEnumerable<char> xs)
    {
        
    }
    
    extension(string s)
    {
    }
    
}

