class Sum {
    constructor(timesSummed = 0) {
        //console.log('XYZ new Sum')
        this.timesSummed = timesSummed
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

module.exports = Sum
