---
name: enterprise-architecture
description: Assess modular boundaries, design patterns, scalability and safe refactoring.
---
# enterprise-architecture
Read AGENTS.md and docs/ai/V6_RULES.md. Use scoped discovery, record task checkpoints and preserve unrelated changes.

Map actual dependency direction and business capabilities using Graphify and targeted reads. Identify coupling, duplicated business rules, fat controllers, transactions crossing modules, circular imports and unstable contracts. Prefer existing framework conventions; propose modular monolith with clear boundaries if useful. Apply SOLID, DRY, KISS and YAGNI pragmatically.
Pattern selection: Strategy for interchangeable policies; Adapter for external providers; Factory for complex construction; Repository for persistence abstraction when useful; Unit of Work/transaction manager for atomic workflows; Domain Service for rules spanning entities; Value Object for validated money/IDs; Observer/domain events for decoupled notifications; Outbox for reliable post-commit publishing; State for meaningful lifecycle transitions. CQRS only for demonstrated read/write divergence; circuit breaker for failing remote dependencies with evidence. No design pattern quota. Record problem, alternatives, choice, risks, compatibility, rollout/rollback and tests in architecture ADR. Use strangler/small slices for legacy improvement. Do not force DDD, microservices or event sourcing. Measure performance and capacity before scaling. Verify dependency direction and regression tests.

Report actual evidence, unresolved blockers and next action.
