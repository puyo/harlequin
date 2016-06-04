const stringify = require('js-stringify')

var code = () => {
    console.log('INSIDE CODE', this)
    return 5
}

// ---

var context = {
    binding: 'foo',
    context: 'bar',
    a: 2
}

var wrapper = function() {
    console.log('INSIDE WRAPPER', this)
    var x = eval(String(code))
    return x()
}

console.log('OUTSIDE WRAPPER', context)
wrapper.bind(context)()

// ---

Object.defineProperty(context, 'k', {get: function(){ return 1 }})
console.log(context.k)
console.log(Object.__lookupGetter__(context, 'k'))
