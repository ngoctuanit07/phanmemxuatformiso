# Distribution package manifest

Marketplace: UNKNOWN
Release/version: UNKNOWN
Built from commit: UNKNOWN
ZIP SHA256: UNKNOWN
Build reproducibility: UNVERIFIED

## Intended buyer ZIP layout
- application source and required runtime/build assets
- configuration example (never real secrets)
- English docs (CodeCanyon requires HTML or PDF)
- license notices and attribution
- installation and troubleshooting instructions
- migrations and upgrade instructions
- changelog and support policy

## Forbidden / suspicious
Never ship real .env, .git, node_modules, vendor/cache when unnecessary, DB snapshots with personal data, auth keys, private keys, npm tokens, logs or internal engineering roadmaps. Note that vendored dependencies may be required by some product formats; inspect their redistribution licenses rather than indiscriminately deleting them.
