* 17 rules have an `AffectedFields` field that doesn't match the contents of the `Logic` field.
* UA vaccination rules have type problems, which would lead to runtime errors when evaluating numeric comparison operations: VR-UA-0003, VR-UA-0030.
  (Doesn't pertain to the use of the equality operation, as that's essentially type-safe.)
* Togo has only 1 rule, having an invalid `EngineVersion` field, so their “set” doesn't cover all event types, but only for "Test" - and it's now "General".

