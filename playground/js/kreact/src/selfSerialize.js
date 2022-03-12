function fun() {
    let f = {}

    f.setName = setName
    f.param = param
    f.def = def
    function setName(n) {
        f.name = n
        return f;
    }
    function def() {
        let d = {}
        d.setName = setName
        function setName(n) {
            d.name = n
            return d
        }
        function pop() {
            return f
        }
        return d
    }
    function param() {
        let prop = {}
        prop.setName = setName
        prop.pop = pop

        function setName(n) {
            prop.name = n
            return prop
        }

        function pop() {
            return f;
        }

        return prop
    }

    return f
}
function p() {
    var prop
    let ret

    ret = new Proxy(()=>{}, {
        get (oTarget, sKey, thisProxy) {
            prop = sKey
            return ret
        },

        apply: function(target, thisProxy, args) {

        }
    });
    return ret
}

const greaterThan = [ "op", ">"]

const f = fun()
    .setName("quicksort")
    .param().setName("items").pop()
    .param().setName("left").pop()
    .param().setName("right").pop()
    .def().setName("index").pop()
    .If(p().items.length, greaterThan, 1)


