* [&#10003;] Make an inventory about vaccine-related rules (esp.: boosters)
* [&#10003;] Check whether each country has rules for all certificate types.
    * [ ] Also warn for it in CI (&larr; use data accesses for that?).
* [&#10003;] Check whether the derivation is independent of a fixed start time, by running the derivation twice with differing start times, and comparing.
* [&#10003;] Forcefully normalise the order of fields so comparison can be done stably.
* [?] Make a separate repo for analysis?

* [ ] Make a list of all business rules developers.
  * [&#10003;] Slack (Monday)
  * [ ] list obtained by Marion (not found so far...)
* [ ] Make point about quality
* [&hellip;] Model a configuration that fits all countries (possibly with some tweaking)
* Use `degit` instead of `git clone`.
* [&hellip;] Separate knowledge of rules from CI tooling (to re-use in analysis).

* Thoughts about rule format:
    1. `AffectedFields` should be either derived, or actively validated by the Gateway.
    2. `CertificateType` should either be derived, and doesn't make much sense: `EventType` would be a better name, with a `null` value corresponding to “General”.

