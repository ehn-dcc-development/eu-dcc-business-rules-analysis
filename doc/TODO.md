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

* [&#10003;] Show EU status (EU MS, EEA member, candidate-EU MS, other) next to country code and flag. -- done in dashboard
* [ ] Also derive RAT, NAAT, and recovery validities.
* [ ] Use compiler and/or Cluster (https://nodejs.org/api/cluster.html) to speed up computation?
* [&#10003;] Re-organise generated/derived file, e.g.:
  * [&#10003;] `analysis/` for `vaccine-inventory.html`
  * [&#10003;] persist `valueSets.json`
  * [&#10003;] persist validation issues
  * [&#10003;] remove “exploded IDs” step

* [&#10003;] Dashboard:
  * [&#10003;] Number of types of rules.
  * [&#10003;] Number of EU MS, EEA/EFTA MS, EU candidate-MS, 3rd country.

* [&#10003;] [Issue #1](https://github.com/ehn-dcc-development/dcc-business-rules-analysis/issues/1): Automate high-over analysis (“dashboard”)
* [&#10005;] [Issue #2](https://github.com/ehn-dcc-development/dcc-business-rules-analysis/issues/2): Remove reliance on `jq` --
    Not doing this entirely, but more intricate usages have been moved to JavaScript.

* [&#10003;] Update `README.md`.

* [&#10005;] Improve styling of header row: border should persist?
  &larr; not worth the effort right now...

* [ ] Make a GitHub Action that runs the main build script.

* [&#10003;] Show some totals in rules' statistics.

* [&#10003;] Show latest `ValidFrom` in rules' version metadata.
  * [&#10003;] Rename to “metadata” rather than “meta data”.

* [&#10003;] Persist all validation issues.
  * [&#10003;] Generate a dashboard page for these issues.

* [ ] `vaccine-specs-*` &rarr; `vaccine-acceptance-*` ?

