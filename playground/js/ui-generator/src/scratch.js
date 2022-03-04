function makeProxy(callback) {
    return new Proxy(()=>{}, {
        get: function(target, prop, thisProxy) {
            return callback(['get',prop]) || thisProxy;
        },
        apply: function(target, thisProxy, argumentsList) {
            return callback(['apply',argumentsList]) || thisProxy
        },
        set: function (target, prop, value, thisProxy) {
            return callback(['set', prop, value]) || thisProxy
        },
    });
}

const myProxy = makeProxy((e)=> {
  console.log(JSON.stringify(e))
})

myProxy.setExample = 4
myProxy.applyExample('some','args')
myProxy.getExample.getExample2.Foo.Bar

