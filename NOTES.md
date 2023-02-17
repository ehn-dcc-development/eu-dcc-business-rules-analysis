# Notes

This document aims to gather up some ideas for future work, and/or TODOs, together with a “work record” of-sorts.


## TODOs/ideas

* Make the partial evaluator smarter so that we can express unknowns involving comparisons.
  Examples:
  * `dob >= 18 years ago` (and/or similar) means we don't need replacements anymore.
  * `dn >= 2 and sd <= dn` (and/or similar) means we don't need so big a “matrix” anymore.
* Make a GitHub Action that runs the main build script.
  This GitHub Action should run e.g. daily.
  If successful, it should commit the changes to the `main` branch.
  If unsuccessful, an email should be sent to the point-of-contact for reporting issues with business rules (as well as other interested parties), and no changes should be committed.
  This is especially relevant in case the analysis phase fails because some country's rules couldn't be reduced to a validity range, because of a missing replacement.
  (This was: https://github.com/ehn-dcc-development/eu-dcc-business-rules-analysis/issues/3)
* Make a GitHub Action that publishes a dashboard.
* `vaccine-specs-*` &rarr; `vaccine-acceptance-*` ?
* Derive RAT, NAAT, and recovery validities.


## Work record

### NOT-going-to-DOs

These are things that once have been considered to be worth doing, but have been abandoned for various reasons (time pressure, relevance, etc.).
In some cases a reason is stated explicitly.

* Use `degit` instead of `git clone` &larr; not necessary anymore, due to relying on retrieving from Gateway (via proxy).
* Use compiler and/or Cluster (https://nodejs.org/api/cluster.html) to speed up computation?
  Not necessary anymore: partial evaluation has already reduced analyses times to < 2s.
* [Issue #2](https://github.com/ehn-dcc-development/eu-dcc-business-rules-analysis/issues/2): Remove reliance on `jq` --
  Not doing this entirely, but more intricate usages have been moved to JavaScript.
* Improve styling of header row: border should persist?
  &larr; not worth the effort right now...


### DONEs

(More-or-less in chronological order, with wildly varying sizes:)

* Make an inventory about vaccine-related rules (esp.: boosters).
* Check whether each country has rules for all certificate types.
    * Also warn for it in CI (&larr; use data accesses for that).
* Check whether the derivation is independent of a fixed start time, by running the derivation twice with differing start times, and comparing.
* Forcefully normalise the order of fields so comparison can be done stably.
* Make a separate repo for analysis?
* Separate knowledge of rules from CI tooling (to re-use in analysis).
* Show EU status (EU MS, EEA member, candidate-EU MS, other) next to country code and flag. -- done in dashboard
* Re-organise generated/derived file, e.g.:
  * `analysis/` for `vaccine-inventory.html`
  * persist `valueSets.json`
  * persist validation issues
  * remove “exploded IDs” step
* Dashboard:
  * Number of types of rules.
  * Number of EU MS, EEA/EFTA MS, EU candidate-MS, 3rd country.
* [Issue #1](https://github.com/ehn-dcc-development/eu-dcc-business-rules-analysis/issues/1): Automate high-over analysis (“dashboard”)
* Show some totals in rules' statistics.
* Show latest `ValidFrom` in rules' version metadata.
  * Rename to “metadata” rather than “meta data”.
* Persist all validation issues.
  * Generate a dashboard page for these issues.


## Thoughts on validation rules framework

* Make “small” rules to give meaningful feedback to the holder, and verifier.
  That also makes it easier to provide standard translations.
* Case dn < sd we can handle through a separate rule: “vaccination course is not finished” - a “small” rule.
* Maybe even make rules “as cross-products”?: vaccine x dn/sd -> waiting time
    1. Specify which vaccines are allowed (modulo additional conditions)
    2. Specify for 1/1, 2/2, 3/3, dn/sd (with dn > sd > 3) the waiting time wt in days (such that now >= dt + wt days)
    3. Specify deviation from now <= dt + 365 days
* Thoughts about rule format:
    1. `AffectedFields` should be either derived, or actively validated by the Gateway.
    2. `CertificateType` should either be derived, and doesn't make much sense: `EventType` would be a better name, with a `null` value corresponding to “General”.

