## Observations

* Many of the UA rules miss a wrapping `if` that deals with DCCs having a different `CertificateType`.


## Thoughts

* Make “small” rules to give meaningful feedback to the holder, and verifier.
  That also makes it easier to provide standard translations.
* Case dn < sd we can handle through a separate rule: “vaccination course is not finished” - a “small” rule.
* Maybe even make rules “as cross-products”?: vaccine x dn/sd -> [ ] waiting time
  1. Specify which vaccines are allowed (modulo additional conditions)
  2. Specify for 1/1, 2/2, 3/3, dn/sd (with dn > sd > 3) the waiting time wt in days (such that now >= dt + wt days)
  3. Specify deviation from now <= dt + 365 days
* Thoughts about rule format:
  1. `AffectedFields` should be either derived, or actively validated by the Gateway.
  2. `CertificateType` should either be derived, and doesn't make much sense: `EventType` would be a better name, with a `null` value corresponding to “General”.

