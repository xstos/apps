using System.Collections.Generic;
using System.Linq;
using static Ideatum.Dir;
using static Ideatum.NodeType;
using OneOf;

namespace Ideatum;

using TNode = OneOf<char, string, Node>;

public class Nodes
{
    public Node First;
    public Node Last;
    public static implicit operator Nodes(Node n)
    {
        return new Nodes() { First = n, Last = n};
    }

    //public static Nodes operator +(Nodes left, Nodes right) { }

    public Nodes Join(Nodes other)
    {
        Last.Next = other.First;
        other.First.Prev = Last;
        return new Nodes() { First = First, Last = other.Last };

    }
}

public enum Dir
{
    Left,
    Right
}

public enum NodeType
{
    Null,
    Open,
    Close,
    Char,
}
public class Node
{
    public const char CURSOR = '█';
    public static Node Empty = new Node();
    public NodeType Type = Null;
    public char Data;
    public Node Prev { get; set; } = Empty;
    public Node Next { get; set; } = Empty;
    public Node Parent { get; set; } = Empty;
    public Node Partner { get; set; } = Empty;
    //public Node? Cursor { get; set; }
    public static Node[] N(params Node[] n) => n;
    public static Node N1(Node n) => n;
    public bool IsEmpty() => Type == Null;
    public static Node[] E(params Node[] n)
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
        var (o, c) = ret;
        o.Partner = c;
        c.Partner = o;
        return ret;
    }
    public static Node[] Root()
    {
        var (ro, rc) = Box();
        var cursor = N1(CURSOR);
        var ret = E(ro, cursor, rc);
        cursor.Parent = ro;
        return ret;
    }
    public static void Example()
    {
        LinkedList<int> foo = new LinkedList<int>();
        var (ro, cursor, rc) = Root();

        cursor.InsertBefore("hello");
        //cursor = cursor.Move(Left);
    }

    Node AddChild(Node n)
    {
        return null;
    }
    Node InsertBefore(O nodes)
    {
        nodes.Nodes.Parent(Parent);
        var (a, b) = nodes.FirstLast;
        N(Prev, a).Siblings();
        N(b, this).Siblings();
        return this;
    }
    Node Move(Dir d)
    {
        if (d == Left && Prev!=null)
        {
            (Prev.Data, Data) = (Data, Prev.Data);
            return Prev;
        }

        if (d == Right && Next!=null)
        {
            (Next.Data, Data) = (Data, Next.Data);
            return Next;
        }

        return this;
    }

    public static implicit operator Node(NodeType t) => new() { Type = t};
    public static implicit operator Node(char c) => new() { Type = Char,Data = c };
    
}

public struct O
{
    public IEnumerable<Node> Nodes { get; set; }
    public (Node, Node) FirstLast => (Nodes.First(), Nodes.Last());
    public static implicit operator O(char x) => New(x);
    public static implicit operator O(string x) => New(x);
    public static implicit operator O(Node x) => New(x);
    
    public static O New(TNode x)
    {
        return new O { Nodes = x.Match(c => [c], s => s.ToCharArray().Select(c => (Node)c).Siblings(), n => [n]) };
    }
}
public static class NodeExt
{
    extension(IEnumerable<Node> nodes)
    {
        public IEnumerable<Node> Siblings()
        {
            foreach (var (a,b) in nodes.Pairwise())
            {
                a.Next = b;
                b.Prev = a;
            }

            return nodes;
        }

        public IEnumerable<Node> Parent(Node parent)
        {
            foreach (var node in nodes)
            {
                node.Parent = parent;
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
        // public IEnumerable<Node> N()
        // {
        //     return s.ToCharArray().Select(c => (Node)c).Siblings();
        // }
    }
    
}

