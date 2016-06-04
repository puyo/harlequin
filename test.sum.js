const Sum = require('./sum')
const harlequin = require('./harlequin')

console.log("\n--", new Date())

harlequin
    .code(() => this.sum.calc(this.a, this.b, this.c))
    .context({ sum: () => new Sum() })                 // NB: needs scope from this file, eval solution doesn't work

    .test("Adds to six")
        .context({ a: 1, b: 2, c: 3 })
        .returns(6)

    .test("Adds to seven")
        .context({ a: 2, b: 2, c: 3 })
        .returns(8) // oops

    .test("Changes times summed")
        .context({ a: 2, b: 2, c: 3 })
        .changes(() => this.sum.timesSummed).by(1)

    .test("Initialises times summed")
        .context({ sum: () => new Sum(10) })
        .code(() => this.sum.timesSummed)
        .returns(10)

    .test("Adds to initialised sum")
        .context({ sum: () => new Sum(10) })
        .context({ a: 2, b: 2, c: 3 })
        .code(() => this.sum.calc(this.a, this.b, this.c) && this.sum.timesSummed)
        .returns(11)
