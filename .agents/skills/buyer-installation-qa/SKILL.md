---
name: buyer-installation-qa
description: Verify that a purchased source package installs and upgrades cleanly on a fresh isolated environment with beginner-friendly documentation and reproducible evidence.
---
# Buyer Installation and Update QA
- Never test against a production database or live store.
- Test extracting *the deliverable ZIP*, not just running the developer checkout.
- Record OS, PHP/Node/Python, database version, required extensions, framework and install commands.
- Verify config template, migrations, demo seed, first login, roles, installer lockout, clean errors, and uninstall/reset behavior where applicable.
- Repeat with a novice following the English documentation and record confusing steps.
- Run upgrade from previous supported version, schema changes, queue/restart steps and rollback/backups when appropriate.
- Save screenshots/logs with secrets redacted and command exit codes.
- Mark UNVERIFIED when the machine cannot run a required check; never synthesize a pass.
