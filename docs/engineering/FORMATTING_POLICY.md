# Formatting Policy — Project-specific

Status: TEMPLATE / UNVERIFIED. Customize after inspecting exact framework and tool versions.

| File group | Preferred installed tool | Scope | Guard |
|---|---|---|---|
| Laravel Controllers / Models / Routes / PHP | Laravel Pint | Git-changed `.php` excluding Blade | `--test` first, inspect diff |
| Laravel Blade | Installed Pint with `--blade`, or existing Blade formatter | Explicit view scope | Skip if unavailable; check Blade directives and whitespace-sensitive HTML |
| JS / TS / CSS / SCSS / HTML / JSON | local Prettier | Git-changed files | Follow `.prettierignore`, no CDN/generated/minified files |
| Node/Nest style diagnostics | existing ESLint | Project-configured only | `--fix` requires explicit permission |
| WordPress PHP | existing PHPCS/PHPCBF with WPCS | Git-changed PHP | Existing ruleset; test hooks and runtime |
| Python | existing Ruff | Git-changed Python | Existing config only |

**CodeCanyon/Codester:** review buyer documentation, original value, security, installation, licensing, packaging and design in separate gates. Formatter success != review acceptance.

Do not force the latest formatter version. Match installed versions and project lockfiles. Record the date and official references when reevaluating standards.

Official references:
- https://laravel.com/docs/pint
- https://prettier.io/docs/
- https://developer.wordpress.org/coding-standards/
- https://help.author.envato.com/hc/en-us/articles/360000471583-Code-Item-Preparation-Technical-Requirements
- https://www.codester.com/info/upload
