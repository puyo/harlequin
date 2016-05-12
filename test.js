// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

const harlequin = require('./harlequin')

harlequin.check(c => {
    c.context({ sum: new Sum() })
        .code(() => sum.calc(a, b, c))
        .context({ a: 1, b: 2, c: 3 })
            .returns(6)
        .context({ a: 2, b: 4, c: 6 })
            .returns(12)
            .note("increments counter").changes(() => sum.timesSummed).by(1)
        .context({ a: undefined })
            .throws(Error, "a was undefined")
        .code(() => sum.setCounter(10))
            .returns(undefined)
            .note("sets counter").changes(() => sum.timesSummed).to(10)
})

// ----------------------------------------------------------------------

harlequin.check({
    note: "sum.calc()",
    context: { sum: new Sum() },
    code: () => sum.calc(a, b, c),
    children: [
        {
            context: { a: 1, b: 2, c: 3 },
            assertions: {
                returns: 6
            }
        },
        {
            context: { a: 2, b: 4, c: 6 },
            assertions: {
                returns: 12,
                changes: { value: () => sum.getTimesSummed(), by: 1},
                throws: { type: Error, message: "a was undefined" }
            }
        },
        {
            code: () => sum.setCounter(10),
            children: [
                {
                    assertions: {
                        returns: undefined,
                        changes: { value: () => sum.getTimesSummed(), to: 10 }
                    }
                }
            ]
        }
    ]
})

// ----------------------------------------------------------------------
// using ava

const test = require('ava')

test.beforeEach(t => {
    t.context.sum = new Sum()
    t.context.a = 1
    t.context.b = 2
    t.context.c = 3
})

test(t => {
    t.is(t.context.sum.calc(t.context.a, t.context.b, t.context.c), 6)
})

test(t => {
    t.is(t.context.sum.calc(2, 4, 6), 12)
})

test(t => {
    const prev = t.context.sum.getTimesSummed()
    t.context.sum.calc(t.context.a, t.context.b, t.context.c)
    t.is(t.context.sum.getTimesSummed(), prev + 1, "counter not incremented")
})

test(t => {
    t.context.sum.setCounter(10)
    t.is(t.context.sum.getTimesSummed(), 10, "counter not set")
})

test(t => {
    t.throws(() => t.context.sum.calc(undefined, t.context.b, t.context.c), "a was undefined")
})
