# Do

* [&#10003;] Switch vaccine-specs analysis over to analyser.


# To check out & fix

* [&#10003;] CZ 2/2 only retains a validity for Janssen.
    Fixed by fixing areEqual, and improving reductions of "in" operations and date comparisons.
* [&#10003;] CZ uses the "month" time unit
    “Fixed” by adding custom replacements which replace #months with 30*#months as days.
* [&#10003;] Where's TG?!
* [&#10003;] What's going on with DE?! &larr; `and() === true`
* [&#10003;] LT 2/1, MT 2/1 have 0 vaccines accepted


# To improve

* [&hellip;] Documentation (and unit tests) of abstract interpreter/partial evaluator
* [&#10003;] Validation errors
  * [&#10003;] Group validation errors by country
  * [&#10003;] Also persist country-wide constraint violations
  * [&#10003;] Make a dashboard page
* [&#10003;] Improve performance by gradually reducing rules: `co` &rarr; `mp` &rarr; `dn`/`sd`
* [ ] Furbish CLUnknown with an optional predicate, to do away with the need for replacements
    (The predicate could also be a sufficiently representative value.)
    Goals:
    1. [ ] Be able to express `dn > sd` or `dn > 2` (possibly in combination), so we can summarise a large part of the “lower triangle” appropriately.
    2. [ ] Reduce the need for “manual” replacements.
    Could also use additional, other metadata, such as the boolsiness of a value.
    That would already help with e.g. being able to properly reduce `!!value` to `true` for a truthy `value`.
* [ ] Maybe come up with a general analysis framework to transform CertLogic expressions to other types, based on the “shape” of the expression?
* [ ] Use object algebras in CertLogic itself to provide sufficient extensibility, and to make it easier to write mappers and such?

