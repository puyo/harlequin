const Sum = require('./sum')
const harlequin = require('./harlequin')

console.log("\n--", new Date())

harlequin
    .code(() => this.sum.calc(this.a, this.b, this.c))
    .context({ sum: () => new Sum() })                 // NB: needs scope from this file, eval solution doesn't work

    .test("Adds to six")                               // push
        .context({ a: 1, b: 2, c: 3 })                 //
        .returns(6)                                    // pop (returns)

    .test("Adds to seven")                             // push (test)
        .context({ a: 2, b: 2, c: 3 })                 // push
        .returns(8)                                    // pop (returns) - failing test

    .test("Changes times summed")                      // push (test)
        .context({ a: 2, b: 2, c: 3 })
        .changes(() => this.sum.timesSummed).by(1)     // pop (by)

    .test("Initialises times summed")
        .context({ sum: () => new Sum(10) })           // cannot re-define sum ?? :(
        .code(() => this.sum.timesSummed)
        .returns(10)

    .test("Adds to initialised sum")
        .context({ sum: () => new Sum(10) })           // cannot re-define sum ?? :(
        .context({ a: 2, b: 2, c: 3 })
        .code(() => this.sum.calc(this.a, this.b, this.c) && this.sum.timesSummed)
        .returns(11)


    // .test("Changes times summed")
    //     .changes(() => this.sum.timesSummed).by(1)

// new H()
//     .code(()=> sum.calc(a, b, c))
//     .context(()=>{ sum = new Sum() })
//     .context(()=>{ a = 1, b = 2, c = 3 })
//         .returns(6)
//     .context(()=>{ a = 2, b = 2, c = 3 })
//         .returns(7)
//     .changes(()=> sum.timesSummed).by(1)


// harlequin
//     .code(() => this.sum.calc(this.a, this.b, this.c))
//     .context({sum: () => new Sum()})
//     .push()
//         .note("adds numbers")
//         .push()
//             .context({a: 1, b: 2, c: 3})
//             .returns(6)
//         .pop()
//         .push()
//             .context({a: 2, b: 2, c: 3}) // error
//             .returns(7)
//         .pop()
//     .pop()
//     .push()
//         .note("initialises times summed")
//         .context({sum: () => new Sum(10)})
//         .code(() => this.sum.timesSummed)
//         .returns(10)
//         .pop()
