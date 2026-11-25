# JACKLABS V9.0 Modes

- `FORMAT_AUDIT`: inspect formatting configs, tool versions, file coverage and risks, without source modifications.
- `FORMAT_CHECK`: read-only checks for selected Git-changed files; do not install tools.
- `FORMAT_APPLY`: explicitly format selected Git-changed files, inspect diff, verify and checkpoint.
- `FORMAT_REPAIR`: scoped formatting + manual correction of formatter-incompatible templates only with behavioral tests and user's explicit scope.
- `MARKETPLACE_STYLE_GATE`: verify style, documentation, package quality and release requirements separately; no approval guarantee.

All inherited V8 modes remain supported. The new modes do not override V6/V7 security and marketplace standards. `NEXT_STEP` should only call formatting if relevant to the current task.
