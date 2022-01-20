* [&#10003;] Make an inventory about vaccine-related rules (esp.: boosters)
* [&#10003;] Check whether each country has rules for all certificate types.
    * [&#10003;] Also warn for it in CI (&larr; use data accesses for that).
* [&#10003;] Check whether the derivation is independent of a fixed start time, by running the derivation twice with differing start times, and comparing.
* [&#10003;] Forcefully normalise the order of fields so comparison can be done stably.
* [&#10003;] Make a separate repo for analysis?

* [ ] Make a list of all business rules developers.
  * [&#10003;] Slack
  * [ ] list obtained by Marion (not found so far...)
* [ ] Make point about quality.
* [&hellip;] Model a configuration that fits all countries (possibly with some tweaking).
* [&#10005;] Use `degit` instead of `git clone` &larr; not necessary anymore, due to relying on retrieving from Gateway (via proxy).
* [&hellip;] Separate knowledge of rules from CI tooling (to re-use in analysis).

* [ ] Show EU status (EU MS, EEA member, candidate-EU MS, other) next to country code and flag.
* [ ] Also derive RAT, NAAT, and recovery validities.
* [ ] Use compiler and/or Cluster (https://nodejs.org/api/cluster.html) to speed up computation?
* [ ] Re-organise generated/derived file, e.g.:
  * [&#10003;] `analysis/` for `vaccine-inventory.html`
  * [&#10003;] persist `valueSets.json`
  * [&#10003;] persist validation issues
  * (remove “exploded IDs” step)

* [ ] [Issue #1](https://github.com/ehn-dcc-development/dcc-business-rules-analysis/issues/1): Automate high-over analysis (“dashboard”)
* [ ] [Issue #2](https://github.com/ehn-dcc-development/dcc-business-rules-analysis/issues/2): Remove reliance on `jq`

* Thoughts about rule format:
    1. `AffectedFields` should be either derived, or actively validated by the Gateway.
    2. `CertificateType` should either be derived, and doesn't make much sense: `EventType` would be a better name, with a `null` value corresponding to “General”.

