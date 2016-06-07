const Sum = require('./sum')
const harlequin = require('./harlequin')

harlequin
    .code(c => c.sum.calc(c.a, c.b, c.c))
    .context({ sum: () => new Sum() })
    .context({ a: 1, b: 2, c: 3 })

    .test("Raises Error if a is undefined")
        .context({ a: undefined })
        .throws(Error)

    .test("Adds to six")
        .context({ a: 1, b: 2, c: 3 })
        .returns(6)

    .test("Adds to seven (failing)")
        .context({ a: 2, b: 2, c: 3 })
        .returns(8) // failing test

    .test("Changes times summed")
        .changes(c => c.sum.timesSummed).by(1)

    .test("Initialises times summed")
        .context({ sum: () => new Sum(10) })
        .code(c => c.sum.timesSummed)
        .returns(10)

    .test("Adds to initialised sum")
        .context({ sum: () => new Sum(10) })
        .code(c => {
            c.sum.calc(c.a, c.b, c.c)
            return c.sum.timesSummed
        })
        .returns(11)

    .test("Can set counter")
        .code(c => {
            c.sum.setCounter(20)
            return c.sum.timesSummed
        })
        .returns(20)
