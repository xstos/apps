import * as parser from "@babel/parser";
import * as traverse from "@babel/traverse";
import * as generate from "@babel/generator";

import fs from "fs"
import path from "path"
const __dirname = path.resolve();
const code = fs.readFileSync(__dirname+'\\sampleCode.js', {encoding:'utf8', flag:'r'})

const ast = parser.parse(code);

traverse.default.default(ast, {
    enter(path) {

    },
    FunctionDeclaration: function(path) {
        path.node.id.name = "x";
    },
});

const output = generate.default.default (
    ast,
    {
        /* options */
    },
    code
);

fs.writeFileSync(__dirname+"\\sampleCode.modded.js", output.code)