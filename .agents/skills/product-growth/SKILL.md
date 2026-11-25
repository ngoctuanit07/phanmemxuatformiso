---
name: product-growth
description: Audit a software repository, research comparable commercial products, identify verified feature gaps, rank opportunities and implement one safe high-value feature.
---

# Product Growth Engine V4.0

Read repository `AGENTS.md` before all operations.

## Phase A — Product audit (no code changes)
- Inspect `docs/product/` to reuse up-to-date evidence.
- Verify actual audience/business category from code, documentation, and user brief.
- Use Graphify query-first for cross-module discovery; inspect relevant code and tests.
- Build an inventory: Implemented / Partial / Broken / Missing / Unverified with supporting file references.

## Phase B — Competitor study
- When research tools are available, select ~5 relevant direct products (fewer if evidence is insufficient); label adjacent alternatives separately.
- Check official sites, product documentation, pricing/licenses and relevant marketplaces.
- Record source URL, checked date, claims and confidence; distinguish published pricing from assumptions.
- If unavailable, say research not verified and do not invent.

## Phase C — Opportunity ranking
- Compare verified features, positioning and monetization options.
- Weighted 1–5 scoring: customer demand 25%, revenue potential 25%, differentiation 20%, feasibility 15%, maintainability 15%.
- Score is a heuristic, not proof of sales potential. Note confidence and dependencies.
- P0 launch-critical, P1 high-value near-term, P2 premium/advanced, P3 longer horizon.
- Write/update `docs/product/COMPETITOR_ANALYSIS.md`, `FEATURE_MATRIX.md`, `ROADMAP.md` and `DECISIONS.md`; preserve prior findings and evidence.

## Phase D — Execute a single selected feature
- Select only one small high-priority feature; if implementation needs destructive/paid/production-impacting actions, request approval.
- Scoped Graphify dependency analysis and targeted actual source review.
- Define acceptance criteria, plan, implement, validate, run tests and inspect diff.
- Update `TASK_STATE.json` and `SESSION_HANDOFF.md` at milestones; refresh graph only if changed.
- Clearly separate implemented vs proposed, executed vs unexecuted checks.

## Deliverable
Concise verified project audit; competitors with sources/dates; feature matrix; prioritized roadmap; selected feature and reason; modified files; executed tests and outcomes; blockers; next action.
