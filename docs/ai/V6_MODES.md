# V6 mode router
V5 modes remain available: AUTO, AUDIT, FEATURE, COMMERCIAL, REDESIGN, BUGFIX, OPTIMIZE, RESUME, RELEASE. Existing V5 rules for scope remain; V6 adds mandatory engineering gates on all modifications. Read V6_RULES.md first. Use one primary skill plus only relevant supporting skills.

| Mode | Scope | Skill |
|---|---|---|
| SECURITY_AUDIT | Read-only trust boundary and access/data audit; findings with file evidence | secure-engineering |
| HARDEN | Fix one scoped security/data integrity batch and negative tests | secure-engineering, data-integrity if needed |
| ARCHITECTURE | Assess boundaries, patterns and scale; ADR; implement only if explicitly requested | enterprise-architecture |
| CODE_REVIEW | Read-only diff/quality review unless fixes requested | engineering-quality |
| DATA_INTEGRITY | Analyze and fix one authorized data flow, migrations only in safe test environment | data-integrity |
| MARKETPLACE | Category-specific compliance assessment and local packaging preparation if requested | marketplace-compliance |
| RELIABILITY | Measured resilience, logging, queue and operational improvement | reliability |

FEATURE/BUGFIX/HARDEN/REDESIGN and any source edits must pass relevant V6 gates. RELEASE and MARKETPLACE read marketplace-compliance, verify clean installation and evidence. AUDIT/SECURITY_AUDIT/CODE_REVIEW/ARCHITECTURE default read-only. AUTO selects one bounded improvement; do not silently choose a redesign or migration. RESUME preserves earlier task ID; new explicit requests take priority. Do not load every skill or profile. Report actual verification and next action.
