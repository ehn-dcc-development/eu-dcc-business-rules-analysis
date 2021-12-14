# Analysis


## Download all uploaded rules

Run `src/download-from-NL-backend.sh` to produce a file `tmp/all-rules.json`.
Subsequent analysis is done through the use of the [`jq` tool](https://stedolan.github.io/jq/), or [Node.js](https://nodejs.org/en/).


## Extracting all rules (including dissected identifiers)

    $ cat tmp/all-rules.json | jq 'map((.Identifier|capture("(?<t>[A-Z]+)-(?<c>[A-Z]+)-(?<n>[0-9]+)")) + .)' > tmp/all-rules-exploded-IDs.json

This results in a file `all-rules-exploded-IDs.json` looking as follows:

```json
[
  {
    "t": "TR",
    "c": "DE",
    "n": "0003",
    "Identifier": "TR-DE-0003",
    "Type": "Acceptance",
    "Country": "DE",
    "Version": "1.0.0",
    "SchemaVersion": "1.0.0",
    "Engine": "CERTLOGIC",
    "EngineVersion": "0.7.5",
    "CertificateType": "Test",
    "Description": [
      {
        "lang": "en",
        "desc": "The sample for an NAA test (e.g., PCR) must have been taken no longer than 72 hours ago."
      },
      ...
    ],
    "ValidFrom": "2021-07-03T00:00:00Z",
    "ValidTo": "2030-06-01T00:00:00Z",
    "AffectedFields": [
      "t.0",
      "t.0.sc",
      "t.0.tt"
    ],
    "Logic": {
      "if": [
        {
          "var": "payload.t.0"
        },
      ...
    }
  },
  ...
]
```

The `t`, `c`, and `n` forms the dissection of the rule's original identifier.

The command above can also be run as:

    $ ./src/process-downloaded-rules.sh


## Which countries have uploaded rules?

    $ cat tmp/all-rules-exploded-IDs.json | jq 'map(.c) | unique'

results in:

```json
[
  "AL",
  "CH",
  "CZ",
  "DE",
  "EE",
  "ES",
  "FR",
  "IE",
  "LT",
  "LU",
  "NL",
  "PL",
  "RO",
  "RS",
  "SI",
  "TG",
  "UA"
]
```

meaning:

* Albania (EU candidate MS),
* Austria,
* Switzerland (not EU MS, but member of EEA & Schengen),
* Czech Republic,
* Germany,
* Estonia,
* Spain,
* France,
* Ireland,
* Lithuania,
* Luxembourg,
* the Netherlands,
* Poland,
* Romania,
* (Repulic of) Serbia (EU candidate MS),
* Slovenia,
* Togo (not an EU MS),
* Ukraine (not an EU MS).

18 in total, 13 of which are EU MS, 1 is in the EEA, 2 of which are candidate MSs, and 2 others.


## Grouping rules per country

    $ cat tmp/all-rules-exploded-IDs.json | jq 'group_by(.c)`

results in an array of arrays.


## Rules per country

    $ cat tmp/all-rules-exploded-IDs.json | jq 'group_by(.c) | map({ co: .[0].c, rules: (map(.Identifier) | sort) })'

Executing the following

    $ node src/split-rules.json

yields per country a directory within `per-country/` with all their rules in separate files, with file names of the following form

    `<rule type: GR|RR|TR|VR>-<rule sequence number (4 digits).json`

That structure allows for easy comparison between rule sets.


## Number of rules per country

    $ cat tmp/all-rules-exploded-IDs.json | jq 'group_by(.c) | map({ co: .[0].c, nRules: .|length })'

results in:

| Country              | #Rules | Comments |
|----------------------|-------:|---|
| Albania              |      9 |
| Austria              |     14 |
| Czech Republic       |     23 |
| Switzerland          |     18 |
| Germany              |     11 |
| Estonia              |     11 |
| Spain                |     10 |
| France               |     20 |
| Ireland              |     19 |
| Lithuania            |     14 |
| Luxembourg           |     10 |
| the Netherlands      |     16 |
| Poland               |     13 |
| Romania              |      6 |
| (Republic of) Serbia |     10 |
| Slovakia             |     11 |
| Togo                 |      1 |
| Ukraine              |     16 |


## EU template/recommended rules

Executing

    $ node src/copy-EU-rules.js

yields a directory `EU/` with the same structure as for the other countries after running `split-rules.json`.


## Validity ranges

    $ cat tmp/all-rules-exploded-IDs.json | jq 'map(.ValidTo) | sort | unique'

yields:

```json
[
  "2021-12-14T12:00:00Z",
  "2022-07-09T00:00:00Z",
  "2022-09-01T00:00:00Z",
  "2022-10-24T00:00:00Z",
  "2022-11-20T00:00:00Z",
  "2022-12-10T00:00:00Z",
  "2023-07-04T00:00:00Z",
  "2023-11-29T00:00:00Z",
  "2025-11-26T22:20:15Z",
  "2030-06-01T00:00:00Z",
  "2030-08-08T00:00:00Z",
  "2030-09-06T00:00:00Z",
  "2030-10-11T00:00:00Z",
  "2030-10-31T00:00:00Z",
  "2030-12-11T00:00:00Z",
  "2031-01-01T00:00:00Z",
  "2031-11-21T23:00:00Z"
]
```

    $ cat tmp/all-rules-exploded-IDs.json | jq 'map(.ValidFrom) | sort | unique'

yields 44 entries.

(Note: the downloaded rules are pre-filtered for validity - as one'd expect.)


## Rules dealing with vaccinations

**not updated**

* AL/VR-*: dn >= sd and dt + 14 days <= now <= dt + 365 days
* CH/VR-0002: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* CH/VR-0004: now >= dt when vaccine = AstraZeneca, Pfizer, or Moderna
* CH/VR-0005: now >= dt + 21 days when vaccine = Janssen, and dn = 1
* CH/VR-0006: now <= dt + **364** days - _deviation_
* CH/VR-0007: now >= dt when vaccine = Janssen, but dn > 1
* DE/VR-0001: dn >= sd
* DE/VR-0002: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* DE/VR-0003: now >= dt + 15 days, or dn > 2, or (dn > 1 and vaccine = Janssen), or ((sd = dn = 1) and vaccine = AstraZeneca, Moderna, or Pfizer) - **booster**
* DE/VR-0004: now <= dt + 365 days
* EE/VR-0002: dn >= sd
* EE/VR-0003: now <= dt + 365 days
* EE/VR-0004: now >= dt + 7 days when vaccine = Pfizer - **booster**
* EE/VR-0005: now >= dt + 14 days when (vaccine != Comirnaty and dn <= sd) - **booster**
* ES/VR-0001: dn >= sd
* ES/VR-0002: approved vaccines are AstraZeneca, BioNTech, Janssen, Moderna, CoronaVac, Inactivated-SARS-CoV-2-Vero-Cell, Covishield
* ES/VR-0003: dt + 14 days <= now <= dt + 365 days
* EU/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* EU/VR-0002: dn >= sd
* FR/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* FR/VR-0002: dn >= sd
* FR/VR-0003: now >= dt
* FR/VR-0004: now >= dt + 28 days when vaccine = Janssen
* FR/VR-0005: now >= dt + 7 days when vaccine = Moderna
* FR/VR-0006: now >= dt + 7 days when vaccine = Pfizer
* FR/VR-0007: now >= dt + 7 days when vaccine = AstraZeneca
* IE/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* IE/VR-0002: dn >= sd
* IE/VR-0003: dt + 7 days <= now <= dt + 365 days when vaccine = Pfizer
* IE/VR-0004: dt + 14 days <= now <= dt + 365 days when vaccine = Moderna
* IE/VR-0005: dt + 15 days <= now <= dt + 365 days when vaccine = AstraZeneca
* IE/VR-0006: dt + 14 days <= now <= dt + 365 days when vaccine = Janssen
* LT/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* LT/VR-0002: dn >= sd
* LT/VR-0003: (dn >= sd and dn < 3 and now >= dt + 14 days), or (dn >= sd and dn >= 3 and now >= dt) - **booster**
* LU/VR-0001: dn >= sd, and (sd >= 2 or now >= dt + 14 days) - **booster**
* LU/VR-0002: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* LU/VR-0003: now <= dt + 365 days
* NL/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen, Covishield, CoronaVac, BBIBP-CorV
* NL/VR-0002: dn >= sd
* NL/VR-0005: now >= dt + 14 days
* NL/VR-0006: now >= dt + 28 days (14 days when dt < "2021-08-14") when vaccine = Janssen
* PL/VR-0000: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen
* PL/VR-0001: dn >= sd
* PL/VR-0002: now >= dt + 14 days, or dn > 2, or (dn > 1 and vaccine = Janssen) - **booster**
* PL/VR-0003: now <= dt + 365 days
* RO/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen, Covishield
* RO/VR-0002: dn >= sd
* RO/VR-0003: now >= dt + 11 days, or dn > 2, or (dn > 1 and vaccine = Janssen), (dn > sd and vaccine = AstraZeneca, Moderna, Pfizer, or Covishield) - **booster**
* SI/VR-0002: dn >= sd
* UA/VR-0001: approved vaccines are AstraZeneca, Pfizer, Moderna, Janssen, CoronaVac, Convidecia, EpiVacCorona, BBIBP-CorV, Inactivated-SARS-CoV-2-Vero-Cell, Covaxin, Covishield
* UA/VR-0003: if (dn < sd) then now <= dt + 120 days else now <= dt + 365 days - ??? _rule is dubious_
* UA/VR-0006: dt + 15 days <= now dt + 180 days when vaccine = Janssen


## Thoughts

* Make “small” rules to give meaningful feedback to the holder, and verifier.
    That also makes it easier to provide standard translations.
* Case dn < sd we can handle through a separate rule: “vaccination course is not finished” - a “small” rule.
* Maybe even make rules “as cross-products”?: vaccine x dn/sd -> [ ] waiting time
    1. Specify which vaccines are allowed (modulo additional conditions)
    2. Specify for 1/1, 2/2, 3/3, dn/sd (with dn > sd > 3) the waiting time wt in days (such that now >= dt + wt days)
    3. Specify deviation from now <= dt + 365 days

