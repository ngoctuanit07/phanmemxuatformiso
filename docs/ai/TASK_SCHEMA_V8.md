# State schema guidance V8 (non-destructive migration)

Existing `TASK_STATE.json` from older versions MUST be preserved. Optional V8 fields can be added when user/project authorizes writing state. Do not reset tasks.

```json
{
  "schema_version": "2.0",
  "project": "VERIFY_FROM_REPO",
  "active_task_id": "FEAT-001",
  "tasks": [{
    "id": "FEAT-001",
    "title": "Example",
    "status": "in_progress",
    "priority": "P1",
    "steps": [
      {"id":"STEP-01","title":"Inspect related files","status":"done","evidence":["file/path", "git commit"]},
      {"id":"STEP-02","title":"Implement and test","status":"pending","evidence":[]}
    ],
    "next_step_id": "STEP-02",
    "blockers": [],
    "last_verified_commit": null,
    "tests": [{"command":"php artisan test --filter=...","result":"PASS","recorded_utc":"2026-11-24T00:00:00Z"}]
  }],
  "last_updated_utc": null
}
```

Rules: actual results only, avoid invented timestamps; do not delete unknown fields; preserve old schema when no migration required. Use a stable task ID, step ID and verification evidence to avoid repeating work.
