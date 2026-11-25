---
name: performance
description: Measure and improve one performance bottleneck with comparable before/after evidence.
---

# Performance — V5

1. Establish target and baseline using available profiling tools in a representative environment. Do not invent metrics. Separate lab and field data; record device, network, data set and commit.
2. For web UI consider LCP, INP, CLS, bundle size, request counts and slow rendering where measurable; for backend consider endpoint latency, query count and resource use. Use official guidance if verifying thresholds.
3. Identify root cause, choose one scoped optimization, preserve correctness, authorization, caching isolation and invalidation. Avoid speculative rewrite.
4. Rerun same measurement and regression tests; distinguish measured improvement from hypothesis. Record baseline, after, method, limitations in PERFORMANCE.md and task state.
