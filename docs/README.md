# Documentation map

The first playable two-flower slice exists. The six-puzzle campaign and release specifications remain targets until verified. The accepted product constraints are the title, game direction, solo development, IWSDK, and no physical headset access.

## Product and experience

- [Vision and scope](product/vision-and-scope.md): audience, boundaries, and success criteria.
- [Game design](product/game-design.md): pieces, objectives, and six-puzzle progression.
- [Player journey](product/player-journey.md): first session, progress, and recovery.
- [Interaction and accessibility](design/interaction-and-accessibility.md): hand actions, comfort, and alternatives.
- [Interface layouts](design/interface-layouts.md): desktop and spatial wireframes.
- [Art and audio](design/art-and-audio.md): visual language and musical feedback.

## Architecture and engineering

- [Overview](architecture/overview.md): boundaries, diagrams, and proposed folders.
- [Puzzle engine](architecture/puzzle-engine.md): authoritative timing and topology rules.
- [Data contracts](architecture/data-contracts.md): level, placement, event, and save shapes.
- [Runtime and input](architecture/runtime-and-input.md): IWSDK adapter, lifecycle, and scheduling.
- [Decisions](architecture/decisions.md): rationale and consequences.
- [Development workflow](engineering/development-workflow.md): current setup, SDK commands, and Git conventions.
- [Testing and performance](engineering/testing-and-performance.md): evidence and budgets.
- [Prototype verification](engineering/prototype-verification.md): actual first-slice results and limitations.
- [Presentation verification](engineering/presentation-verification.md): grove rebuild, interaction regressions, and current render/build evidence.
- [Deployment](engineering/deployment.md): static hosting, release, and freeze.
- [Asset and privacy policy](engineering/asset-and-privacy-policy.md): provenance, storage, and permissions.
- [Asset register](assets/asset-register.csv): original assets and dependency provenance.

## Delivery and competition

- [Status](planning/status.md): actual completed work and next action.
- [Roadmap](planning/roadmap.md): dates and milestone gates.
- [Backlog](planning/backlog.md): ordered implementation tasks and acceptance criteria.
- [Risks and open questions](planning/risks-and-open-questions.md): uncertainty and mitigation.
- [Requirements](competition/requirements.md): official obligations versus project targets.
- [Submission draft](competition/submission-draft.md): editable copy, clearly marked unbuilt.
- [Demo script](competition/demo-script.md): planned recording under three minutes.
- [Release checklist](competition/release-checklist.md): evidence required before submission.
- [References](references.md): official sources and their verification date.

When documents disagree, use the puzzle-engine contract for timing, the requirements document for competition obligations, and status for what actually exists. Resolve design changes explicitly rather than maintaining contradictory descriptions.
