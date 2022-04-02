const foo = {
    toJSON: () => '{ derp: "hi"}'

}
const bar = {
    foo
}


console.log(JSON.stringify(bar))

console.log('foo'.split(' '))