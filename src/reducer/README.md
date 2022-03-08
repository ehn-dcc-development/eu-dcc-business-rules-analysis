# Partial evaluation


## Motivation

CertLogic's `evaluate` function takes a CertLogic expression and input data, evaluates that expression against that data, and either returns the result, or throws an exception in case the CertLogic expression given is not valid, or a runtime type error occurs during its evaluation.
In other words: this function performs a _complete interpretation_ of the CertLogic expression.
This is usually what we need, e.g. to evaluate the logic part of a business rule.
This complete interpretation is possible because the input data is given completely.
In other words: every data access, or (instance of the) `var` operation evaluates to a value, and that value can be used as an operand of an expression that nested that `var` operation.

What could we do if we only knew part of the input data?
I can think of two use cases where that could happen:

1. Some values in the input we know, but other values are not.
    That doesn't mean that these values are `undefined`, because `undefined` indicates a value is *missing* entirely.
2. We want to reason about the result of evaluating an expression against a whole class of input data.
    That's equivalent to evaluating that expression with some values of the input data kept unknown.

    A specific example is finding under which condition a specific vaccine is valid in the sense of business rules accepting a DCC for a vaccination with that vaccine.
    Ideally, such a condition boils down to a specific validity range such as from 14 days until 270 days relative to the date of vaccination.
    By being able to evaluate the logic parts of the business rules involved with this validity, we could reduce that logic to a CertLogic expression that's relatively simple to recognise as a condition for a validity range.

This documentation develops the idea of _partial evaluation_: evaluating a CertLogic expression against data which may be partial.
(This is sometimes also referred to as _abstract interpretation_.)
Take the following example expression:

```json
{
  "if": [
    {
      "var": "dob"
    },
    {
      "not-before": [
        {
          "plusTime": [
            {
              "var": "dob"
            },
            0,
            "day"
          ]
        },
        {
          "plusTime": [
            "2000-01-01",
            0,
            "day"
          ]
        }
      ]
    },
    false
  ]
}
```

The intention of this expression is to try and determine whether a person is from Generation Alpha or not, given some personal data.
It returns `true` when that's the case, and `false` either when not, or when it couldn't be determined.
The outer `if` operation ensures that the `not-before` operation is not evaluated if the date-of-birth is not given.
That evaluation would fail with a runtime type error if the value of the `dob` field in the input were not a string containing a date(-time).

Evaluating this expression against the empty object `{}` always produces `false` as result.
Let's say we have a way of indicating that the value of `dob` is present (so: not equal to `undefined`), but otherwise “unknown”:

```typescript
{
    "dob": Unknown
}
```

(We can't use `unknown` to identify the “unknown” value: that would clash with TypeScript's `unknown` _type_.) 
What can we say about the example CertLogic expression above?
If we assume that `Unknown` represents a truthy value, then every occurrence of `{ "var": "dob" }` would evaluate to something truthy.
As a consequence, we'd know that the example CertLogic expression would evaluate to the same result as the following expression, given the same, complete input data:

```json
{
  "not-before": [
    {
      "plusTime": [
        {
          "var": "dob"
        },
        0,
        "day"
      ]
    },
    {
      "plusTime": [
        "2000-01-01",
        0,
        "day"
      ]
    }
  ]
}
```

This expression can be written more succinctly in compact notation as: `/dob >= 2000-01-01"`.
This may not seem like a big improvement.
However, more complicated expressions -especially when they access the same value in the input data multiple times- can reduce more drastically.
Such a reduction is often relatively easy to rewrite as a simple condition.


## Extending CertLogic expressions

Both the CertLogic expression and input data are plain JSON, although the expression is strictly typed through the following type definition, as well as additional validations:

```typescript
export type CertLogicExpression =
    | CertLogicExpression[]
    | CertLogicOperation
    // literals:
    | boolean
    | number    // ...which should be an integer...
    | string
```

What can we say about the type of the result of the evaluation?
To answer that question, we have to look a bit closer at the various types of CertLogic expressions - and especially the operations.
In answering this question we assume that the evaluation doesn't throw any exception, meaning that the given expression is valid and type-safe over its entire range of input data.

Let's start with the literals: a CertLogic expression that's a boolean, an integer, or a string evaluates to itself.
An expression that's an array of items evaluates to the array of evaluations of those items.

The data access or `var` operation is the only operation that allows us to access values in the input data, and so is the most interesting.
That means that the result of the evaluation of a `var` operation can be almost any JSON value: `null`, a boolean, a number, a string, an array, or an object.
There are two problems with that:

1. The result can be a JSON value that _is_ a valid CertLogic operation.
    That would mean that part of input data effectively gets executed!
    This is similar to remote code execution, and means that the meaning of the expression is subverted by the input data if happens to be evaluated against.
2. The result can be a JSON value that's not a valid CertLogic expression, such as `null` or an object.

We'll solve this problem by suitably _wrapping_ the result of a `var` operation, if it happens to be an object, or another value that is not a valid CertLogic expression.
Effectively, we extend the notion of a CertLogic expression a little bit.
With this extension, we can “lift” the CertLogic `evaluate` function to one that's an [endomorphism](https://en.wikipedia.org/wiki/Endomorphism).
(We also say that the lifted evaluation function is “endomorphic”.)

Let's call this new type `CLExtExpr` where the prefix “CL” is shorthand for “CertLogic”.

The tricky bit is that the `CertLogicExpression` type is _recursive_: nested parts of that type's definition reference the type itself.
We can already see that from the first line in the type definition above: `CertLogicExpression[]`.
(Such a type definition defines a _sum type_: any instance of any of its _summands_ is an instance of the sum type.)
We also see that in the definition of e.g. the `reduce` operation:

```typescript
export type CertLogicOperation =
    // ...
    | { "reduce": [ CertLogicExpression, CertLogicExpression, CertLogicExpression ] }
    // ...
```

The lifted `reduce` operation in `CLExtExpr` should have operands of type `CLExtExpr` as well.

**TODO**  continue, and finish

