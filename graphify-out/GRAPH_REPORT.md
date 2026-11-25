# Graph Report - phanmemxuatformiso  (2026-11-25)

## Corpus Check
- 81 files · ~85,725 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .7725edbd10a0426693e43de0e20eb7b7 1, .css 1)

## Summary
- 369 nodes · 867 edges · 18 communities (15 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `384a72e3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- db.js
- next
- react
- mysql2
- seed-fqc-forms.js
- getCurrentUser
- dependencies
- scripts
- test-scripts-regression.js
- TemplateList.js
- login/route.js
- layout.js
- docx
- test-order.cjs
- react-dom@^18.3.1
- jsconfig.json
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getCurrentUser()` - 68 edges
2. `query()` - 58 edges
3. `hasPermission()` - 53 edges
4. `queryOne()` - 45 edges
5. `next` - 43 edges
6. `react` - 22 edges
7. `PageHeader()` - 21 edges
8. `LoadingSpinner()` - 14 edges
9. `AlertBanner()` - 13 edges
10. `mysql2` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/api/auth/me/route.js → lib/auth.js
- `POST()` --calls--> `query()`  [EXTRACTED]
  app/api/auth/login/route.js → lib/db.js
- `POST()` --calls--> `queryOne()`  [EXTRACTED]
  app/api/auth/login/route.js → lib/db.js
- `POST()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/api/auth/switch/route.js → lib/auth.js
- `POST()` --calls--> `query()`  [EXTRACTED]
  app/api/auth/switch/route.js → lib/db.js

## Import Cycles
- None detected.

## Communities (18 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.16
Nodes (16): devDependencies, @types/bcryptjs@^2.4.6, @types/jsonwebtoken@^9.0.7, @types/node@^20.17.0, @types/react@^18.3.11, @types/react-dom@^18.3.1, typescript@^5.6.3, name (+8 more)

### Community 1 - "db.js"
Cohesion: 0.09
Nodes (28): dynamic, GET(), dynamic, GET(), dynamic, POST(), validateMagicBytes(), pool (+20 more)

### Community 2 - "next"
Cohesion: 0.09
Nodes (11): dynamic, GET(), LoginFormContent(), LoginPage(), OrdersContent(), OrdersPage(), AppLayout(), Navbar() (+3 more)

### Community 3 - "react"
Cohesion: 0.10
Nodes (35): DEPARTMENT_OPTIONS, FillFormContent(), FillFormPage(), getCleanFieldLabel(), isDepartmentField(), isSoPhieuField(), FillSpecificTemplatePage(), Dashboard() (+27 more)

### Community 4 - "mysql2"
Cohesion: 0.06
Nodes (16): mysql2@^3.11.3, mysql2, { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle }, fs, mysql, path, uploadDir, mysql (+8 more)

### Community 5 - "seed-fqc-forms.js"
Cohesion: 0.23
Nodes (18): buildFqc002Schema(), buildFqc003Schema(), buildFqc004Schema(), buildFqc005Schema(), buildFqc012Schema(), buildFqc013Schema(), buildFqc14StdSchema(), buildFqcAsfvSchema() (+10 more)

### Community 6 - "getCurrentUser"
Cohesion: 0.08
Nodes (63): dynamic, GET(), DELETE(), dynamic, GET(), PUT(), dynamic, GET() (+55 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, cookie@^1.0.1, docxtemplater@^3.50.0, jsonwebtoken@^9.0.2, mammoth@^1.8.0, next@^14.2.15, pizzip@^3.1.7, @popperjs/core@^2.11.8 (+9 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:init, db:migrate:dept-no, db:migrate:user-permissions, db:seed, db:seed:fqc, dev (+4 more)

### Community 9 - "test-scripts-regression.js"
Cohesion: 0.17
Nodes (8): { execSync }, initOrders, migrate, path, ROOT, seedDb, seedFqc, verifyTpl

### Community 10 - "TemplateList.js"
Cohesion: 0.32
Nodes (7): IsoTemplatesPage(), TemplatesPage(), RegularTemplatesPage(), TemplateList(), isIsoTemplate(), ISO_TEMPLATE_CODES, isRegularTemplate()

### Community 11 - "login/route.js"
Cohesion: 0.18
Nodes (10): dynamic, getClientIdentifier(), loginAttempts, POST(), POST(), signToken(), bcryptjs@^2.4.3, bcryptjs (+2 more)

### Community 12 - "layout.js"
Cohesion: 0.24
Nodes (7): metadata, RootLayout(), BootstrapClient(), bootstrap@^5.3.3, bootstrap-icons@^1.11.3, bootstrap, bootstrap-icons

### Community 14 - "test-order.cjs"
Cohesion: 0.27
Nodes (7): get(), http, post(), run(), http, request(), verifySecurity()

### Community 16 - "jsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, exclude, include

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `package.json`, `db.js`, `react`, `getCurrentUser`, `dependencies`, `TemplateList.js`, `login/route.js`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Should `db.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Why does `mysql2` connect `mysql2` to `package.json`, `db.js`, `login/route.js`, `seed-fqc-forms.js`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09259259259259259 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `package.json`, `next`, `dependencies`, `TemplateList.js`, `layout.js`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.10407239819004525 - nodes in this community are weakly interconnected._
- **Should `mysql2` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._