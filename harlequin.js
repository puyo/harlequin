const stringify = require('js-stringify')
const chalk = require('chalk')

class Sum {
    constructor() {
        this.timesSummed = 0
    }

    getTimesSummed() {
        return this.timesSummed
    }

    calc(a, b, c) {
        this.timesSummed++                               // a state change
        if (a === undefined) {
            throw new Error("a was undefined")           // a throw
        }
        return a + b + c                                 // result of query
    }

    setCounter(val) {
        this.timesSummed = val
    }
}


class H {
    constructor() {
        this._context = []
        this._indent = 0
    }

    code(fn) {
        this._code = fn
        console.log(this._indentPad() + fn)
        this._indent += 1
        return this
    }

    context(ctx) {
        this._context.push(ctx)
        console.log(this._indentPad() + ctx)
        this._indent += 1
        return this
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
        console.log(chalk[color].call(chalk, this._note))
        this._note = undefined
    }

    _codeStr(code) {
        let toEval = [ "'use strict'" ]
        toEval.push.apply(toEval, this._context)
        toEval.push(code)
        return toEval.join("\n")
    }

    _execute(code = this._code) {
        return eval(this._codeStr(code))
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
        return this
    }
}

const harlequin = module.exports = new H()

harlequin
    .code("sum.calc(a, b, c)")
    .context("var sum = new Sum()")
    .context("var a = 1, b = 2, c = 3")
        .returns(6)
    .context("var a = 2, b = 2, c = 3")
        .returns(7)
    .changes("sum.timesSummed").by(1)

