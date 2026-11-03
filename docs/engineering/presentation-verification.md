# Presentation rebuild verification

Date: November 3, 2026. Scope: the moonwater grove rebuild and corrections in the commit containing this report. One two-flower puzzle remains implemented; this is not competition submission readiness.

## Story and boundaries

Desktop buttons or emulated hand input flow through GardenSystem into the same validated GardenSession commands and deterministic evaluator. Derived timing drives light, flowers, growth, audio, and UI; committed layouts reach local storage. There is no API, backend, account, or external data service in this flow.

The rebuild adds a sculpted living island, connected canopy leaves, opening petals, restored ferns, a surrounding grove and water ring, restrained procedural glows, desktop orbit/zoom, and a contextual spatial dock. GardenPresentation consumes session state; DesktopView yields to the tracked camera during XR.

## Environment

Linux; Node 22.22.0; IWSDK Core/CLI/Vite plugin 1.1.0-rc.2; SDK-managed HeadlessChrome 156 with IWER Meta Quest 3 emulation. XR checks used an active immersive-vr session with hand tracking. Native render metadata reports Mesa/ANGLE on Intel HD Graphics 4000. The desktop runtime viewport was 780 × 493.

No physical Quest testing was performed. Emulation does not establish hardware FPS, real tracking reliability, physical reach, or comfort.

## Observed checks

| Boundary / scenario | Evidence |
| --- | --- |
| TypeScript | npm run typecheck passes |
| Domain/application/storage | All 10 existing tests pass; no puzzle-engine rule changes |
| Desktop input → layout | Confirmed reset yields A=3/B=4; return bend and place delay yield A=4/B=4 |
| Desktop camera | Drag orbit and wheel zoom preserve the layout revision; recenter and reset remain usable |
| Layout → completion | A full eligible cycle completes on desktop and through the spatial menu |
| Native UI input → commands | Right-hand contact opens Tools and Settings, confirms reset, selects/returns the bend, selects/places the delay, plays, and closes Tools |
| Direct manipulation | Left-hand proximity pinch produces the SDK-owned Grabbed component; tray release removes the bend and socket release snaps the delay to A=4/B=4 |
| Input-loss recovery | Disconnecting a held left hand removes Grabbed, pauses transport, and preserves the committed revision/layout |
| Hand exit | Contact on Exit VR ends the immersive session and leaves playback paused |
| Runtime errors | No new errors after the final application navigation during successful XR checks |
| Native scene | valid=true, diagnostics=[], with grove, garden, all pieces, socket, controls, and authored lights present in visibleNodeIds |
| Visual review | One contact sheet compares old/new desktop, default XR spawn, a 22-degree downward XR view, the authored hero view, and the isolated native dock |
| Production build | npm run build passes; upstream Zod comment-annotation and large-chunk warnings remain |
| Static delivery | All 18 files in dist return HTTP 200 and match the local build byte for byte |

Gesture-command completion alone was never treated as a passed interaction. The checks above query GardenState and SDK-owned Grabbed state. Emulated sequences sometimes exceeded the UI library's click window; the final native buttons respond to pointer contact and the complete menu flow passed without retries.

## Corrections found during verification

Additive Sprite glows entered the XR pointer raycaster, which has no camera, and raised a matrixWorld error. Decorative sprite raycasts are now disabled on placed clones, including runtime pulse glows; their rendering is preserved. Slow emulated touch contacts could also exceed the pointer library's 800 ms click window. Native buttons now activate once on pointerdown rather than waiting for click. Desktop DOM actions retain their ordinary click behavior.

The confirmed desktop reset hides Settings first, avoiding two visible buttons with the same label. The small spatial panel faces forward, explicit dimensions keep labels within it, and Tools/Settings reveal secondary actions. Reduced motion disables ambient firefly drift and quantizes pulse travel.

## Scene cost and build size

The fresh native hero render records **72 draw calls and 68,952 triangles**, 38 points, no shadow casters, and 11 visible authored nodes. These are authoring-preview statistics, not sustained gameplay or Quest measurements. Preview frame samples include startup/compilation stalls and are unsuitable for an FPS claim.

The build contains **18 files, 3,698,955 bytes uncompressed**, or **1,257,131 bytes** when each file is locally gzip-compressed. The main bundle is about 674 KB gzip. These are build-size estimates; public-host transfer, cold loading, sustained frame rate, a 15-minute run, and memory/CPU profiling remain unverified.

## Production-browser limitation and handoff

Automated access to the in-app browser was rejected by browser security policy. No alternate browser-control surface was used to bypass that rejection. Static HTTP and byte-integrity checks passed, but a fresh interactive playthrough of the production build was not completed. Successful gameplay evidence comes from the SDK development runtime; the earlier prototype's production-browser result is historical evidence only.

The completed SDK QA session was stopped. A simple static server serves dist on http://127.0.0.1:4174/ for the owner's local review. It is intentionally retained for handoff; stop it with Ctrl+C in its terminal. It is not a public deployment. A reproducible command from the repository is:

```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

## Local evidence

Ignored artifacts include immersive-desktop.png, immersive-desktop-fresh.png, immersive-xr.png, immersive-xr-spawn.png, immersive-scene.png/json, immersive-controls.png/json, desktop-rebuild-evidence.json, xr-menu-evidence.json, xr-grab-evidence.json, xr-recovery-evidence.json, rebuild-runtime-console.json, and production-static-evidence.json. The review contact sheet is retained in the chat's persistent visualization directory. Screenshots and generated builds are not committed.

## Remaining work

Five more puzzles, campaign progression/replay, onboarding comprehension, a full comfort/accessibility pass, repeated entry/exit, sustained performance profiling, public HTTPS hosting, demo recording, and submission remain unfinished. Physical headset validation is unavailable under the owner's stated constraint. Licensing of original source and Start acceptance remain owner decisions.
