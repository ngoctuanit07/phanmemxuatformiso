# JACKLABS V8.0 — Unified mode router

All V6/V7 modes remain available; V8 routes rather than replaces them.

| MODE | Goal | Changes to source | Unit of work |
|---|---|---|---|
| INIT | Verify repository, create missing metadata, build graph if appropriate | Metadata only | Once per repository |
| AUDIT | Evidence-based current-state audit | None | Scoped audit |
| REJECTION_TRIAGE | Diagnose marketplace rejection with evidence | None | One submission case |
| MARKETPLACE_AUDIT | Evaluate technical and commercial readiness | None | Scoped audit |
| MARKETPLACE_REPAIR | Fix verified marketplace issue | Yes | One issue |
| HARDEN | Fix security/data risks | Yes | One verified issue |
| FEATURE | Implement requested feature | Yes | One feature |
| REDESIGN | Improve targeted UI using design system and visual QA | Yes | One group of screens |
| BUGFIX | Reproduce, fix, regression-test | Yes | One issue |
| ARCHITECTURE | Propose architecture changes (implement only when explicitly scoped) | Usually no | One boundary |
| DATA_INTEGRITY | Validate DB constraints and transaction invariants | Scoped | One flow |
| NEXT_STEP | Continue only next pending step within active task | Yes when appropriate | Exactly one step |
| RESUME | Restore and continue the named task from checkpoint | Yes within task | Named task only |
| CHECKPOINT | Save verified status and next action | Metadata only | One checkpoint |
| CODE_REVIEW | Verify diff, scope, security and tests | None | Current diff |
| CLEAN_INSTALL_QA | Test clean installation in sandbox | Sandbox only | One install scenario |
| PACKAGE_AUDIT | Inspect release ZIP | None | One ZIP |
| PRE_SUBMISSION | GO/NO-GO per marketplace | None | One marketplace |
| RELEASE | Prepare release evidence, no upload by default | Artifacts only | One release |

### Auto-selection
- If an explicit MODE appears, use it (subject to safety).
- If asked 'tiếp tục step tiếp theo', pick NEXT_STEP; 'tiếp tục task' means RESUME.
- If asked 'xem lỗi/hạn chế' without mutation, pick AUDIT.
- If asked 'sửa lỗ hổng', pick HARDEN; 'sửa vấn đề marketplace' means MARKETPLACE_REPAIR.
- If request is ambiguous, select the smallest non-destructive mode and record assumption.

### NEXT_STEP details
1. Active project and task MUST match current user request and checkpoint.
2. Verify git status and step completion evidence; do not trust unchecked checkboxes.
3. Skip verified completed work; select earliest unblocked unfinished step.
4. Execute that step ONLY. Do not advance to the next step without new instruction.
5. Run relevant verification and record checkpoint; report next step.

### RESUME details
Recover exact task and status. Execute remaining necessary steps only if safely bounded by user's request and higher-priority restrictions, maintaining checkpoints. If no reliable task state exists, recover minimally from Git and relevant code; don't guess completed steps.
