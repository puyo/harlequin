const Sum = require('./sum')
const harlequin = require('./harlequin')

harlequin
    .code(() => this.sum.calc(this.a, this.b, this.c))
    .context({ sum: () => new Sum() })                 // NB: needs scope from this file, eval solution doesn't work
    .test("Adds to six")                               // push
        .context({ a: 1, b: 2, c: 3 })                 //
        .returns(6)                                    // pop
        // .context({a: 2, b: 2, c: 3})                // error: redefining a
        // .returns(7)                                 // pop (error, double pop?)
    .test("Adds to seven")                             // push
        .context({ a: 2, b: 2, c: 3 })                 // push
        .returns(7)                                    // pop

    // .test("Initialises times summed")
    //     .context({sum: () => new Sum(10)})
    //     .code(() => this.sum.timesSummed)
    //     .returns(10)
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
