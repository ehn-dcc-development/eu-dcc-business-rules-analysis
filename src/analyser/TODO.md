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

* [ ] Documentation (and unit tests) of abstract/partial evaluator
* [ ] Validation errors
  * [ ] Group validation errors by country
  * [ ] Also persist country-wide constraint violations
  * [ ] Make a dashboard page
* [ ] Improve performance by gradually reducing rules: `co` &rarr; `mp` &rarr; `dn`/`sd`
* [&#10003;] Improve performance by gradually reducing rules: `co` &rarr; `mp` &rarr; `dn`/`sd`
* [ ] Furbish CLUnknown with an optional predicate, to do away with the need for replacements
    (The predicate could also be a sufficiently representative value.)

