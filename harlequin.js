const stringify = require('js-stringify')
const chalk = require('chalk')
const debug = require('debug')('harlequin')

class H {
    constructor() {
        this._context = [{ _cache: {} }]
    }

    code(fn) {
        this._code = fn
        console.log(chalk.grey(' code:'), fn)
        return this
    }

    context(newContext) {
        console.log(chalk.grey(' context:'), newContext)
        var ctx = this._currentContext()
        debug('CONTEXT BEFORE ADD:', ctx)
        for (let k in newContext) {
            ctx = this._context[this._context.length - 1] = this._cloneObject(ctx, k)
            debug('CONTEXT BEFORE CLONE:', ctx)
            var val = newContext[k]
            this._addValueToContext(ctx, k, val)
            debug('CONTEXT AFTER CLONE:', ctx)
        }
        debug('CONTEXT AFTER ADD:', this._currentContext())
        return this
    }

    test(note) {
        this._push()
        console.log(note)
        return this
    }

    note(str) {
        this._note = str
        return this
    }

    returns(value) {
        this._testNote = [ "returns", value ]
        let result = this._execute()
        this._assertEqual(result, value)
        this._pop()
        return this
    }

    changes(codeTest) {
        this._changesCodeTest = codeTest
        return this
    }

    by(val) {
        this._testNote = [ "changes", this._changesCodeTest, "by", val ]
        let before = this._execute(this._changesCodeTest)
        let result = this._execute()
        let after = this._execute(this._changesCodeTest)
        this._assertEqual(after, before + val)
        this._pop()
        return this
    }

    to(val) {
        this._testNote = [ "changes", this._changesCodeTest, "to", val ]
        let result = this._execute()
        let after = this._execute(this._changesCodeTest)
        this._assertEqual(after, val)
        this._pop()
        return this
    }

    _addValueToContext(ctx, k, val) {
        debug('ADDING ' + k + ': ' + val)
        if (typeof val === 'function') {
            debug('ADDING PROPERTY ' + k)
            Object.defineProperty(ctx, k, {
                get: function () { return this._cache[k] = this._cache[k] || val() },
                enumerable: true,
                writeable: true
            })
        } else {
            ctx[k] = val
        }
    }

    _currentContext() {
        return this._context[this._context.length - 1]
    }

    _cloneObject(obj, except = undefined) {
        var msg = except ? 'CLONE except "' + except + '" key' : 'CLONE all keys'
        debug(msg, obj)
        let newObj = {}
        for (let k in obj) {
            if (k === except) { continue }
            let getter = obj.__lookupGetter__(k)
            if (getter) {
                Object.defineProperty(newObj, k, {get: getter, enumerable: true, writeable: true})
            } else {
                newObj[k] = obj[k]
            }
        }
        newObj._cache = {}
        debug('CLONE result is', obj)
        return newObj
    }

    _push() {
        debug("PUSH", this._currentContext())
        let newContext = this._cloneObject(this._currentContext())
        this._context.push(newContext)
    }

    _pop() {
        this._context.pop()
    }

    _assertEqual(actual, expected) {
        let pass = actual === expected
        if (pass) {
            console.log(chalk.green('', this._testNote.join(' ')))
        } else {
            console.log(chalk.red('', this._testNote.join(' '), '(', actual, '!==', expected, ')'))
        }
        this._note = undefined
    }

    _execute(code = this._code) {

        let ctx = this._currentContext()
        debug("EXEC")
        debug("     context: ", ctx)
        debug("     code:", code)

        // This is a nasty hack to enable re-binding arrow functions
        //
        // TODO: field test this better, maybe a different solution

        let wrapper = function() {
            let localCode = eval(String(code))
            return localCode()
        }
        return wrapper.bind(ctx)()
    }
}

const harlequin = module.exports = new H()
