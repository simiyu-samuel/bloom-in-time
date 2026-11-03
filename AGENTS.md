# Bloom in Time repository instructions

Scope: this repository and all descendants.

- Read README.md, docs/planning/status.md, and the documentation relevant to the requested change before editing.
- The first playable prototype exists. Preserve its verified two-flower loop while extending the campaign.
- Preserve the agreed title, solo scope, IWSDK path, and no-headset constraint.
- Keep the puzzle engine independent of IWSDK, rendering, audio, and browser storage.
- Use integer beat timing and the rules in docs/architecture/puzzle-engine.md.
- Route desktop and XR actions through the same validated game commands.
- Every application action must have a hand-accessible path; keyboard shortcuts are additional conveniences.
- Prefer discrete orientation and automatic placement over precision gestures or physical simulation.
- Do not add a backend, account system, AI dependency, room scanning, or multiplayer to the baseline.
- Check current official IWSDK documentation and generator output before committing to SDK APIs.
- Pin installed package versions with a lockfile; do not invent dependency versions in advance.
- Keep simulation state authoritative. Animation and audio must not decide puzzle success.
- Record meaningful architectural changes in docs/architecture/decisions.md.
- Run checks appropriate to the change and document actual evidence.
- Never describe emulator results as physical Quest validation.
- Treat dates, budgets, and layouts in docs as targets until measured.
- Update docs/planning/status.md when work completes; unchecked release items stay unchecked until verified.
- Commit coherent completed changes. Do not commit secrets, generated builds, or local recordings.
- Preserve the submitted build after the deadline as documented in docs/engineering/deployment.md.
