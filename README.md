# Bloom in Time

**Guide the light. Find the rhythm. Wake the garden.**

A seated VR puzzle game in which you rearrange miniature pathways of light so musical flowers bloom together. Built solo for the Meta VR Start Developer Competition 2026 with the Immersive Web SDK.

The first playable prototype contains one two-flower puzzle, a procedural garden, visible light pulses, synthesized flower notes, desktop controls, and spatial hand controls. Five further puzzles and the public competition deployment remain planned. Development uses XR emulation; no physical Quest testing has been performed.

## Run locally

Use Node **22.22.0** (`.nvmrc`) and **npm 11 or newer**.

```bash
npm ci
npm run dev
```

The IWSDK development environment serves the application at **https://localhost:8081/** and provides its scene editor and Quest emulator. The first managed-browser launch may download Chromium. Use `npm run dev:down` to stop the managed session. `npm run dev:runtime` runs just Vite when the managed tools are unnecessary.

If this machine still uses npm 9, invoke npm 11 **from the parent directory** to avoid npm 9 parsing the project's Three.js alias override before starting the newer npm:

```bash
cd ..
npx --yes npm@11 --prefix ./bloom-in-time ci
cd bloom-in-time
```

## Play the prototype

1. Wake the garden. Flower A receives light after 3 beats; Flower B after 4.
2. Select the bend and return it to the tray.
3. Select the golden delay pod and place it in the empty socket.
4. Let one complete eight-beat cycle play. Both flowers now receive light on beat 4.

In VR, pinch a piece to grab it and release near the socket to snap it into place. The spatial panel also provides select/place/return/turn controls, undo, hint, confirmed reset, pause, comfort settings, and exit. Desktop controls use the same validated commands. Progress and preferences stay in the current browser and origin.

## Check the build

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

The production output is `dist/`; it requires a static HTTPS host for WebXR. No backend, account, API key, or physics engine is required. The lockfile pins the verified dependency graph to IWSDK **1.1.0-rc.2**.

## Project guide

- [Documentation map](docs/README.md)
- [Actual status and next work](docs/planning/status.md)
- [Game design and six-puzzle plan](docs/product/game-design.md)
- [Architecture and diagrams](docs/architecture/overview.md)
- [Development and SDK workflow](docs/engineering/development-workflow.md)
- [Prototype verification report](docs/engineering/prototype-verification.md)
- [Competition requirements](docs/competition/requirements.md)

The submission deadline is **November 18, 2026, 23:00 Africa/Nairobi / 20:00 UTC**. Quest performance, physical comfort, and real tracking reliability remain unverified. The full campaign, video, and release checklist are unfinished.

No source license has been selected for original project material. See [third-party notices](THIRD_PARTY_NOTICES.md) and the [asset register](docs/assets/asset-register.csv).
