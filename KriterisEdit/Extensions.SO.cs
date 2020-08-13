using System;
using System.Linq;
using System.Xml.Linq;

namespace KriterisEdit
{
    public static partial class Extensions
    {
        /// <summary>
        /// Get the absolute XPath to a given XElement, including the namespace.
        /// (e.g. "/a:people/b:person[6]/c:name[1]/d:last[1]").
        /// </summary>
        /// <see cref="https://stackoverflow.com/a/23541182/1618433"/>
        public static string _GetAbsoluteXPath(this XElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException("element");
            }

            string RelativeXPath(XElement e)
            {
                int index = e.IndexPosition();

                var currentNamespace = e.Name.Namespace;

                string name;
                if (currentNamespace == null)
                {
                    name = e.Name.LocalName;
                }
                else
                {
                    string namespacePrefix = e.GetPrefixOfNamespace(currentNamespace);
                    name = namespacePrefix + ":" + e.Name.LocalName;
                }

                // If the element is the root, no index is required
                return (index == -1) ? "/" + name : $"/{name}[{index.ToString()}]";
            }

            var ancestors = element.Ancestors().Select(RelativeXPath);

            return string.Concat(ancestors.Reverse().Concat(new[] {RelativeXPath(element)}));
        }

        /// <summary>
        /// Get the index of the given XElement relative to its
        /// siblings with identical names. If the given element is
        /// the root, -1 is returned.
        /// </summary>
        /// <param name="element">
        /// The element to get the index of.
        /// </param>
        static int IndexPosition(this XElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException("element");
            }

            if (element.Parent == null)
            {
                return -1;
            }

            int i = 1; // Indexes for nodes start at 1, not 0

            foreach (var sibling in element.Parent.Elements(element.Name))
            {
                if (sibling == element)
                {
                    return i;
                }

                i++;
            }

            throw new InvalidOperationException
                ("element has been removed from its parent.");
        }
    }
}