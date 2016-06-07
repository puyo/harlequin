const Sum = require('./sum')
const test = require('ava')

test.beforeEach(t => {
	t.context.sum = new Sum()
})

test('Adds to six', t => {
    t.is(t.context.sum.calc(1, 2, 3), 6)
})

test('Adds to seven (failing)', t => {
    t.is(t.context.sum.calc(2, 2, 3), 8)
})

test('Changes times summed', t => {
    let sum = new Sum()
    let before = sum.timesSummed
    let result = sum.calc(1, 2, 3)
    let after = sum.timesSummed
    t.is(after, before + 1)
})

test.beforeEach(t => {
	t.context.sum = new Sum(10)
})

test('Changes times summed', t => {
    t.is(t.context.sum.timesSummed, 10)
})

test('Adds to initialised sum', t => {
    let result = t.context.sum.calc(1, 2, 3)
    t.is(t.context.sum.timesSummed, 11)
})

test('Throws Error if a is undefined', t => {
    t.throws(() => { t.context.sum.calc() }, Error)
})

test('Can set counter', t => {
	t.context.sum.setCounter(20)
    t.is(t.context.sum.timesSummed, 20)
})
