import * as fs from 'fs';
import ts from '@typescript-eslint/parser';
import flat from 'flat'

const inputFile = `./node_modules/typescript/lib/lib.es5.d.ts`
const code = fs.readFileSync(inputFile, 'utf-8');
const parsed = ts.parse(code)
console.log(JSON.stringify(parsed,null,2))

function groupBy(items, keySel, valueSel) {
    return items.reduce((acc, item) => {
        const key = keySel(item)
        acc[key] = [ ...acc[key] || [], valueSel(item) ]
        return acc
    }, {})
}
