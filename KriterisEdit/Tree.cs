using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Windows;
using System.Windows.Controls;
using Newtonsoft.Json;
using static KriterisEdit.GlobalStatics;
using static KriterisEdit.Extensions;
namespace KriterisEdit
{
    public class TreeValue
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public object Value { get; set; }
        public Func<object,TreeValue> SetData { get; set; }
        public TreeValue SetType<T>()
        {
            this.Type = typeof(T).AssemblyQualifiedName;
            return this;
        }
    }

    public class TreeNode
    {
        public string ValueId { get; set; } = EmptyId;
        public List<TreeNode> Children { get; set; }=new List<TreeNode>();
        public Func<TreeValue,TreeNode> AddChild { get; set; }
    }

    public class Tree
    {
        public List<TreeValue> Values { get; set; }
        public TreeNode Root { get; set; }
        public Func<TreeValue> NewValue { get; set; }
        public Action<Panel> Render { get; set; }
        
        public static Tree New(string serialized = "")
        {
            if (!serialized.IsNullOrEmpty())
            {
                var ret2 = JsonConvert.DeserializeObject<Tree>(serialized);
                return ret2;
            }
            var tree = new Tree();
            var elements = new List<TreeValue>();
            tree.Values = elements;
            tree.Root = NewNode();
                
            TreeNode AddChild(TreeNode parentNode, TreeValue treeValue)
            {
                var childNode = new TreeNode();
                childNode.ValueId = treeValue.Id;
                childNode.AddChild = value => AddChild(childNode, value);
                parentNode.Children.Add(childNode);
                return childNode;
            }
                
            TreeNode NewNode()
            {
                var node = new TreeNode();
                node.AddChild = value => AddChild(node, value);
                return node;
            }
            TreeValue NewValue()
            {
                var ret = new TreeValue();
                ret.Id = NewId();
                TreeValue SetData(object o)
                {
                    ret.Value = o;
                    return ret;
                }

                ret.SetData = SetData; 
                return ret;
            }

            tree.NewValue = NewValue;
            return tree;
        }

    }
}