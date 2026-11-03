# Development workflow

The first playable slice was generated and implemented on November 3, 2026. Read [status](../planning/status.md) and the [verification report](prototype-verification.md) before extending it.

## Environment and installation

Use Node 22.22.0 from `.nvmrc` and npm 11+. Run `npm ci` from the repository, then `npm run dev`. The initial host had npm 9.2.0, whose override parser rejected the generator's Three.js alias. When upgrading globally is undesirable, launch npm 11 from the parent as documented in the root README.

IWSDK Core, CLI, and Vite plugin are pinned to 1.1.0-rc.2. Preserve `three` as the `super-three` alias and the generated Vite deduplication settings. The override uses `$three` so all consumers resolve to that same dependency. Commit changes to both package.json and package-lock.json.

The official generator was run in an empty temporary directory with TypeScript, VR, grabbing, no locomotion, no physics, no Git, and no automatic install. Selected runtime/configuration files were copied into the existing documentation repository. The starter robot, decorations, and audio were removed. Optional MetaVR and semantic-reference packages are omitted; the SDK-managed Chromium emulator and public documentation provide the current local workflow.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start/restart the managed SDK development environment in the foreground |
| `npm run dev:runtime` | Run Vite without managed editor/browser orchestration |
| `npm run dev:status` / `npm run dev:down` | Inspect / stop this repository's managed session |
| `npm test` | Run the Node test suite with tsx for TypeScript loading |
| `npm run typecheck` | Check application TypeScript |
| `npm run build` | Produce static assets in dist |
| `npm run preview` | Inspect the production output locally |

Use the installed `node_modules/.bin/iwsdk` for targeted SDK commands. An example verification session:

```bash
node_modules/.bin/iwsdk dev up --headless --open
node_modules/.bin/iwsdk runtime wait --timeout 45000
node_modules/.bin/iwsdk xr enter --input-json '{}'
node_modules/.bin/iwsdk xr set-input-mode --input-json '{"mode":"hand"}'
node_modules/.bin/iwsdk xr list-targets
node_modules/.bin/iwsdk xr run-sequence --input-json '{"device":"hand-right","steps":[{"target":"Btn_Play","press":{}}]}'
```

Confirm `xr status` reports an active emulated session before claiming hand verification. Query the `GardenState` component through `ecs find` and `ecs query` to distinguish a completed gesture from an actual game-state change. Entity indexes are runtime-generated; find them each session.

Local certificates, screenshots, browser sessions, dependencies, and builds are ignored. Do not commit them or the SDK's downloaded browser. Stop the owned managed session after verification.

## Implementation order and boundaries

`src/domain/` owns the deterministic evaluator. `src/application/` owns validated commands, transport, undo, and save boundaries. `src/content/` owns authored levels. The manifest and native scene own composition; `GardenSystem` adapts desktop and hand interactions to the same session. Rendering and audio consume derived timing and never decide success.

Complete the two-flower integration gate before expanding the campaign. Validate every new level and its solution witness. Prefer native scene/UI authoring and small original assets. Record meaningful architectural changes in [decisions](../architecture/decisions.md).

## Commits and evidence

Commit coherent completed changes, run appropriate checks, and update status. Engine changes need timing/topology tests; input and lifecycle changes need real runtime evidence; visual changes need rendered inspection. Keep physical Quest results distinct from emulation. Never record a check as passed merely because a script or plan exists.
