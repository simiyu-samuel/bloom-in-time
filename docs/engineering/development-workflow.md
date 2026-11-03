# Development workflow

Status: future workflow. No scaffold or dependency installation has been performed.

## Environment

The preparation host reports Node 22.22.0 and npm 9.2.0. The current Meta guide supports Node 20.19+ in the 20 line, 22.12+ in the 22 line, or 24+. The repository records the observed supported Node version in .nvmrc.

Use npm for the initial project unless generator requirements dictate otherwise. Commit a lockfile once dependencies exist. Record the selected IWSDK version in status and release evidence.

## Bootstrap after documentation

1. Review current official setup and input guides in [references](../references.md).
2. Run npm create @iwsdk@latest in an empty temporary scaffold directory.
3. Choose TypeScript and virtual reality. Inspect available feature prompts; enable required hands/grabbing and avoid unnecessary locomotion or room features.
4. Decline Git initialization in the temporary scaffold if offered.
5. Inspect the generated manifest, configuration, source, and scripts.
6. Copy the generated application files deliberately into this repository. Preserve these documents, Git history, and repository instructions.
7. Resolve any configuration overlap and install supported dependencies once.
8. Verify the starter, record versions, then commit the scaffold.

Do not run a generator over a nonempty repository without reviewing its overwrite behavior. Do not copy dependencies, generated builds, or a second .git directory from the temporary scaffold.

## Intended commands

The SDK starter currently documents npm run dev, npm run build, npm run preview, and npm run typecheck. Confirm actual scripts before use. Add a test command when domain tests are introduced. No command in this section works in this documentation-only baseline.

## Development order

Implement the pure timing fixture first, connect a minimal board, add the input adapters, then complete the short playable loop. Add the remaining content and presentation only after that gate passes.

Keep errors explicit at data boundaries and use typed IDs. Avoid large frameworks unrelated to the spatial application. Record new architectural commitments in [decisions](../architecture/decisions.md).

## Commits and evidence

Use small coherent commits after completed changes. Before each commit, review changed files, run appropriate checks, and update [status](../planning/status.md). Preserve the initial documentation history.

A docs-only change needs link/content validation, not game tests. Engine changes need meaningful timing/topology tests. Input and lifecycle changes need integration evidence. Rendering changes need browser inspection and a recorded performance context.

Never label an emulator session as physical device testing. Never record a test as passed merely because a script exists.
