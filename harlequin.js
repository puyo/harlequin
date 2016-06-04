const stringify = require('js-stringify')
const chalk = require('chalk')
const debug = require('debug')('harlequin')

class H {
    constructor() {
        this._context = [{ _cache: {} }]
        this._indent = 0
    }

    code(fn) {
        this._code = fn
        console.log(this._indentPad() + fn)
        this._incrementIndent()
        return this
    }

    context(ctx) {
        for (let k in ctx) {
            var val = ctx[k]
            if (typeof val === 'function') {
                //debug('Adding property ' + k + ' to context object with value ' + val)
                Object.defineProperty(this._currentContext(), k, {
                    get: function () {
                        return this._cache[k] = this._cache[k] || val()
                    }
                })
            } else {
                this._currentContext()[k] = val
                // Object.defineProperty(this._currentContext(), k, {
                //     value: val
                // })
            }
        }
        console.log(this._indentPad(), ctx)
        this._incrementIndent()
        return this
    }

    test(desc) {
        this._push()
        this._desc = desc
        return this
    }

    note(str) {
        this._note = str
        return this
    }

    returns(value) {
        this._note = this._note || [
            this._indentPad(),
            "returns",
            value
        ].join(' ')
        let result = this._execute()
        this._printNote(result === value)
        this._pop()
        return this
    }

    changes(codeTest) {
        this._changesCodeTest = codeTest
        return this
    }

    by(val) {
        this._note = this._note || [
            this._indentPad(),
            "changes",
            this._changesCodeTest,
            "by",
            val
        ].join(' ')
        let code = [
            "var before = " + this._changesCodeTest,
            this._code,
            "var after = " + this._changesCodeTest,
            "var beforeAfter = [before, after]",
            "beforeAfter"
        ].join("\n")
        let beforeAfter = this._execute(code)
        let before = beforeAfter[0]
        let after = beforeAfter[1]
        this._printNote(after === before + val)
        this._pop()
        return this
    }

    to(val) {
        this._note = this._note || [
            this._indentPad(),
            "changes",
            this._changesCodeTest,
            "to",
            val
        ].join(' ')
        let code = [
            this._code,
            "var after = " + this._changesCodeTest,
            "after"
        ].join("\n")
        let after = this._execute(code)
        this._printNote(after === val)
        this._pop()
        return this
    }

    _currentContext() {
        return this._context[this._context.length - 1]
    }

    _push() {
        var newContext = Object.assign({}, this._currentContext(), {_cache: {}})
        newContext = this._currentContext()
        this._context.push(newContext)
    }

    _pop() {
        this._context.pop()
        this._indent -= 1
    }

    _incrementIndent() {
        this._indent += 1
    }

    _indentPad() {
        let result = []
        for (let i = 0; i < this._indent; i++) {
            result.push('    ')
        }
        return result.join('')
    }

    _printNote(pass) {
        let color
        if (pass) {
            color = 'green'
        } else {
            color = 'red'
        }
        console.log(chalk[color](this._note))
        this._note = undefined
    }

    _execute(code = this._code) {

        // This is a nasty hack to enable re-binding => functions
        // TODO: field test this better, maybe a different solution

        let ctx = this._currentContext()
        debug('Executing code. context:', ctx, 'code:', code, ctx.sum)

        let wrapper = function() {
            let localCode = eval(String(code))
            return localCode()
        }
        return wrapper.bind(ctx)()
    }
}

const harlequin = module.exports = new H()
