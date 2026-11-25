# Engineering quality gate
For each task record evidence in gate-evidence.json. `pass` means verified, `fail` means observed failure, `unverified` means evidence missing, `na` needs reason. Required applicable failures/unverified block task done/release. This is an internal gate, not formal ASVS or marketplace certification. Never use N/A to hide tool failure.

| ID | Required review | Example evidence |
|---|---|---|
| scope | Acceptance criteria, targeted diff, no unrelated edits | diff + task |
| access | Authentication/authorization/ownership/tenant | negative tests + route matrix |
| validation | Strict allowed fields and constraints | validator + invalid input tests |
| integrity | Transactions, constraints, races and migration safety | rollback/concurrency tests |
| errors | Safe exception mapping, cleanup, rollback, logging | failure path test |
| security | Relevant threat controls and dependency/secret checks | findings + tests |
| architecture | Boundaries, patterns justified, compatibility | source/ADR |
| quality | Configured lint/static/format/build checks | command + exit code |
| tests | Relevant positive/negative/regression checks | test commands + results |
| reliability | Performance/resilience/operational risks | baseline or rationale |
| ui | Design/accessibility/visual regression when applicable | visual evidence |
| marketplace | Current requirements, license, package, clean install on release | checklist + clean install |
| continuity | Updated task state/handoff and graph when changed | file/diff + graph result |

Record evidence as paths, command output summaries and verified references, never secrets. For a non-release task marketplace may be N/A with rationale; security and tests must not be skipped merely because inconvenient. An audit-only task does not certify remediation. Existing unrelated defects remain recorded and are not silently fixed. Use explicit user approval for breaking or production actions, never for falsely marking checks passed.
