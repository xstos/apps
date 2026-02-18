using System;
using System.Collections.Generic;

namespace derpide;
public class Context
{
    public Node Cursor { get; set; }
    public Func<Node> New { get; set; }
}


public class Node
{
    public Context Context;

    public Node Cursor
    {
        get => Context.Cursor;
        set => Context.Cursor = value;
    }

    public Node? Parent;
    public Node? FirstChild;
    public Node? LastChild;
    public Node? PrevSibling;
    public Node? NextSibling;

    public string Type;
    public object Value;
    public int Width;
    public int Height;
    public int Top;
    public int Left;
    Node _cursor;


    public static Node MakeRoot(Context ctx)
    {
        var root = new Node();
        var cursor = new Node();
        root.Context = ctx;
        cursor.Context = ctx;
        root.Value = root.Type = "root";
        root.FirstChild = cursor;
        root.LastChild = cursor;
        cursor.Type = "cursor";
        cursor.Value = "█";
        cursor.Parent = root;
        
        return root;
    }

    public Node Insert(string text)
    {
        for (int i = 0; i < text.Length; i++)
        {
            Insert(text[i]);
        }
        return this;
    }

    public Node Insert(char c)
    {
        var n = new Node();
        n.Type = "char";
        n.Value = c;
        n.Context = Context;
        n.Parent = Parent;
        E(PrevSibling, n, this);
        return this;
    }

    public Node MoveLeft()
    {
        if (PrevSibling == null) return this;
        Cursor = PrevSibling;
        var copy = PrevSibling.Clone();
        PrevSibling.SetData(this);
        SetData(copy);
        return PrevSibling;
    }

    public Node MoveRight()
    {
        if (NextSibling == null) return this;
        Cursor = NextSibling;
        var copy = NextSibling.Clone();
        NextSibling.SetData(this);
        SetData(copy);
        return NextSibling;
    }

    public Node Backspace()
    {
        if (PrevSibling == null) return this;
        var pp = PrevSibling.PrevSibling;
        E(pp, this);
        return this;
    }

    public Node Cell()
    {
        //turn ourselves into a cell and make a new cursor inside it
        var newCursor = new Node();
        Cursor = newCursor;
        newCursor.SetData(this);
        newCursor.Context = Context;
        newCursor.Parent = this;
        Value = Type = "cell";
        FirstChild = newCursor;
        LastChild = newCursor;
        Width = 1;
        Height = 1;
        
        return newCursor;
    }
    public static void Edge(Node? a, Node? b)
    {
        if (a!=null) a.NextSibling = b;
        if (b!=null) b.PrevSibling = a;
    }

    public static IEnumerable<Node> E(params Node?[] nodes)
    {
        for (int i = 1; i < nodes.Length; i++)
        {
            Edge(nodes[i - 1], nodes[i]);
        }

        return nodes;
    }

    public Node SetData(Node from)
    {
        Type = from.Type;
        Value = from.Value;
        Width = from.Width;
        Height = from.Height;
        Top = from.Top;
        Left = from.Left;
        return this;
    }
    public Node Clone()
    {
        return new Node
        {
            Context = Context,
            Parent = Parent,
            FirstChild = FirstChild,
            LastChild = LastChild,
            PrevSibling = PrevSibling,
            NextSibling = NextSibling,
            Type = Type,
            Value = Value,
            Width = Width,
            Height = Height,
            Top = Top,
            Left = Left
        };
    }
}

public static class Ext2
{
    public static Node Init(this Node n)
    {
        n.FirstChild = new Node();
        n.LastChild = new Node();
        n.PrevSibling = new Node();
        n.NextSibling = new Node();
        n.Parent = new Node();
        return n;
    }
}