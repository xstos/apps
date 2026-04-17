using System.Collections.Generic;
using System.Linq;
using static Ideatum.NodeAction;
using static Ideatum.NodeType;
using OneOf;

namespace Ideatum;

using TFragment = OneOf<char, string, Node>;

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
    public bool IsRoot() => Parent.IsEmpty();
    public bool IsOpen() => Type is Open;
    public bool IsClose() => Type is Close;
    
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
        "hello".Frag.InsertBefore(cursor);
        //cursor = cursor.Move(Left);
    }

    Node AddChild(Node n)
    {
        return null;
    }

    Node Do(NodeAction d)
    {
        if (d == MoveLeft && !Prev.IsRoot())
        {
            var (n1,n2,n3,n4) = (Prev.Prev, this, Prev, Next); // <a█>
            if (Prev.IsOpen()) Parent = Prev.Parent; // <ab<█foo>>
            if (Prev.IsClose()) Parent = Prev.Partner; // <ab<>█cd>
            E(n1, n2, n3, n4);
        }

        if (d == MoveRight && !Next.IsRoot())
        {
            var (n1,n2,n3,n4) = (Prev, Next, this, Next.Next); // <█a>
            if (Next.IsOpen()) Parent = Next; // <ab█<foo>>
            if (Next.IsClose()) Parent = Next.Parent; // <ab<█>cd>
            E(n1, n2, n3, n4);
            
        }

        return this;
    }

    public static implicit operator Node(NodeType t) => new() { Type = t};
    public static implicit operator Node(char c) => new() { Type = Char,Data = c };
    
}

public class NodeFragment
{
    public IEnumerable<Node> Nodes { get; private set; }
    public (Node, Node) FirstLast { get; private set; }
    public static implicit operator NodeFragment(char x) => New(x);
    public static implicit operator NodeFragment(string x) => New(x);
    public static implicit operator NodeFragment(Node x) => New(x);
    public void InsertBetween(Node before, Node after, Node parent)
    {
        Nodes.SetParent(parent);
        var (a, b) = FirstLast;
        Node.N(before, a).LinkSiblings();
        Node.N(b, after).LinkSiblings();
    }

    public void InsertBefore(Node n, Node? parent=null)
    {
        parent ??= n.Parent;
        InsertBetween(n.Prev,n,parent);
    }
    public static NodeFragment New(TFragment x)
    {
        var nodes = x.Match(c => [c], s => s.ToCharArray().Select(c => (Node)c).LinkSiblings(), n => [n]);
        var ret = new NodeFragment
        {
            Nodes = nodes,
            FirstLast = (nodes.First(), nodes.Last())
        };
        return ret;
    }
}
public static class NodeExt
{
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

        public IEnumerable<Node> SetParent(Node parent)
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
        public NodeFragment Frag => s;
    }
    
}

