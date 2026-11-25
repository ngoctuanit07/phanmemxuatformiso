---
name: marketplace-submission-readiness
description: Prepare an evidence-based CodeCanyon or Codester submission by reviewing technical quality, original value, clean installation, rights, documentation, demo and package readiness.
---
# Marketplace Submission Readiness
1. Establish platform and item category; check that author may submit.
2. Read V6 enterprise engineering profile relevant to the stack; run security/quality gates with actual tests.
3. Evaluate *commercial differentiation* from verifiable competitor products (features, utility, quality, buyer workflow). A passing technical audit is insufficient.
4. Test buyer's journey from a fresh ZIP in an isolated environment: install, environment setup, seeds/demo, admin login, core workflows, update and troubleshooting. Log exact environment and commands.
5. Verify license rights for dependencies, images, fonts and demo assets, including redistribution vs mere use; mark unresolved as NO-GO.
6. Review documentation in English and product listing claims for accuracy; verify demo and submission image requirements from official current pages.
7. Inspect deliverable with `python scripts/marketplace_preflight.py --source <project> --platform ...` in this toolkit, treating output as signals and not as proof of acceptance. For actual distribution archive also use `--zip`.
8. Collect gate evidence, classify unknowns, issue GO only when all required evidence is collected; otherwise CONDITIONAL/NO-GO.
9. No upload, release, deployment or source modification in audit-only mode.
