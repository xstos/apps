// sources:
// https://github.com/pulkitnagpal/custom-jsx-plugin
// https://lihautan.com/codemod-with-babel/
// run this in node.js

import * as babel from "@babel/core";
import {derp} from "./jsxTransformer.js"
import fs from "fs"
const code = fs.readFileSync('./../index.js')
const code2 =`
function test() {
    return <div foo="test"><p>Hello World</p></div>
}
`

function CustomJSXPlugin(babel) {
    var t = babel.types;
    return {
        name: "custom-jsx-plugin",
        manipulateOptions(opts, parserOpts) {
            /*
             add to parserOpts.plugins to enable the syntax
             eg:
              jsx, flow, typescript, objectRestSpread, pipelineOperator,
              throwExpressions, optionalChaining, nullishCoalescingOperator,
              exportDefaultFrom, dynamicImport, ...
            */
            parserOpts.plugins.push(
                'jsx',
            );
        },
        visitor: {
            JSXText(path) {
                // if the child of JSX Element is normal string
                var stringChild = t.stringLiteral(path.node.value);
                path.replaceWith(stringChild, path.node)
            },
            JSXElement(path) {
                //get the opening element from jsxElement node
                var openingElement = path.node.openingElement;
                //tagname is name of tag like div, p etc
                var tagName = openingElement.name.name;
                // arguments for React.createElement function
                var args = [];
                //adds "div" or any tag as a string as one of the argument
                args.push(t.stringLiteral(tagName));
                // as we are considering props as null for now
                var attribs = t.nullLiteral();
                //push props or other attributes which is null for now
                args.push(attribs);
                // order in AST Top to bottom -> (CallExpression => MemberExpression => Identifiers)
                // below are the steps to create a callExpression
                var reactIdentifier = t.identifier("JSX"); //object
                var createElementIdentifier = t.identifier("createElement"); //property of object
                var callee = t.memberExpression(reactIdentifier, createElementIdentifier)
                var callExpression = t.callExpression(callee, args);
                //now add children as a third argument
                callExpression.arguments = callExpression.arguments.concat(path.node.children);
                // replace jsxElement node with the call expression node made above
                path.replaceWith(callExpression, path.node);
            },
        },
    };
};

const ret = babel.transformSync(code, {
    plugins: [
        derp
    ]
})

fs.writeFileSync('./../index2.js', ret.code)
console.log(ret.code)