# Risks and open questions

| Risk | Impact | Mitigation / decision point |
| --- | --- | --- |
| No physical Quest access | Tracking, comfort, and native performance cannot be verified | Use SDK input paths and conservative scenes; document emulator evidence honestly; keep all app actions hand-accessible |
| Mechanic is visually pleasant but not engaging | Weak game despite polished art | Build two flowers first and test understanding before full garden work |
| SDK API drift | Setup or adapters may differ from this plan | Inspect current generator and official docs; pin actual dependencies after bootstrap |
| Small sockets or precise turning | Hand interaction frustration | Automatic alignment, large visible targets, explicit turn buttons, one-hand operation |
| Audio restrictions or drift | Silence or inconsistent feedback | User-activated audio, bounded scheduling, visual timing, domain independent of sound |
| Stale cycle after an edit/pause | Incorrect completion | Revision-tagged events and clean-cycle restart |
| Content production exceeds schedule | Unfinished campaign | Author small levels with solution witnesses; cut decoration before core reliability |
| Puzzle can be solved accidentally or has no solution | Poor progression | Machine-check witnesses and inspect alternatives for each level |
| Origin-local saves lost across deployments | Progress disappears | Choose a stable origin early and explain local storage limits |
| Reused or unclear asset rights | Submission/content issue | Original assets and provenance register; inspect rules before release |
| Accidental deployment after deadline | Competition risk | Pin final commit, preserve artifact, disable judged-URL automation |
| Title availability | Naming uncertainty | Bloom in Time is selected as a working title; broader commercial clearance has not been established |

## Open questions to resolve through the prototype

1. Does the shared-arrival rule make sense after one example?
2. Is the eight-beat cycle readable and quick enough?
3. Which socket orientations communicate clearly without text?
4. Does depth create an interesting puzzle without occlusion?
5. Is the first reward noticeable with sound off?
6. Can every screen recover from session and input loss?

## Decisions still open

Hosting account and exact URL; remote repository visibility; source license; final art/audio asset selection; actual puzzle durations and hardware-specific quality settings. Keep implementation moving on reversible local decisions and record any changed architecture.
