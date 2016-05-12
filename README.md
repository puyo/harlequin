# Harlequin

An experiment in unit testing.

## Declarative unit testing

The idea is to provide these things to a test framework:

- execution context (a set of variables and their values in scope),
- snippet of code (anonymous function),
- any number of assertions,

and let the test framework sort out the rest.

This is a declarative style of unit testing. Instead of saying: "run this code
first and then make this check and then fail if this expression is false" we
are saying: "here is some code and some assertions, please use them in any way
you see fit to ensure that the assertions are true of the test target".

## Why

By surrendering control flow to the test framework, test code becomes much
simpler and shorter for the same reasons that functional programming is more
succinct than procedural programming.

It's common in OOP languages with imperative test frameworks (I come from a
Rails + RSpec background) to have test:code ratios between 2 and 2.5. I don't
believe that's necessary. I think a typical test:code ratio of 1.1 seems
achievable in Ruby and possibly less in JavaScript.

The upshot of this is hopefully about a 35% decrease in total lines of code on
a typical unit tested project and a consequent decrease in the cost of
maintaining such a project, making lots of assumptions about how much it costs
to maintain each line of code.

I also think declarative style of unit tests would ease the cognitive load on
programmers. Not having to think about control flow when writing tests could be
a big boon.

## Flexibility and extensibility

The trick is to support all the different potential behaviours of code under
test. Because the control flow of tests is entirely within the test framework
or its extensions, it seems very easy to imagine that support for any future
coding style, framework or practice could be written as an extension to the
test framework.

Each type of assertion knows how to make use of context and code snippets
provided. e.g. 'throws' assertions use the code differently to 'returns'
assertions.

Assertion types could be added if necessary to deal with promises, generators,
etc. in a similar manner to the way RSpec is extensible with new Matchers.
Assertions all take the same basic input: a snippet of code bound to an
execution context that has been specified in the tests, plus at least one
argument that represents what is expected of the code (e.g. an expected value,
to be compared with the return value of the code with an equality test).

## Risks

The main risk is that this style of testing would be harder to debug when it
doesn't do what you want it to do. Great care should be taken to combine the
essential concept of declarative testing with plain and easily understandable
testing code.

## Optimisations

We may want to lazily evaluate parts of context and if we do, memoize the
result to avoid re-evaluation. These are performance optimisations when
running tests, especially if they interact with another system like
a database.

I'll try [freshtonic's given library](https://www.npmjs.com/package/given)
and see if that solves this need neatly.

## Promises, generators, async, observables

Giving the control flow job to the test framework should make testing all of
these things simpler than in an imperative test framework.

## Examples

### Code under test (simple example)

```js
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
```

### AVA syntax

```js
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
```

### Declarative unit testing

```js
const harlequin = require('harlequin')

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

```

### Declarative unit testing + method chaining syntax + ES6

```js
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
```

### Declarative style + method chaining + CoffeeScript

```coffee
harlequin.check (c) ->
    c.context sum: new Sum
        .code -> sum.calc a, b, c
        .context a: 1, b: 2, c: 3
            .returns 6
        .context a: 2, b: 4, c: 6
            .returns 12
            .note('increments counter').changes(-> sum.timesSummed).by(1)
        .context a: undefined
            .throws Error, 'a was undefined'
        .code -> sum.setCounter 10
            .returns undefined
            .note('sets counter').changes(-> sum.timesSummed).to 10
```

