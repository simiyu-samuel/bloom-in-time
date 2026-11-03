# Deployment and release

Status: proposed; no remote repository, host, or public URL exists.

## Hosting choice

Start with a static HTTPS host. GitHub Pages is the initial proposal because IWSDK documents it; another static host is acceptable if access is simpler. Hosting is an implementation decision, not a paid-service commitment.

Build output is expected in dist according to the current guide. Confirm generated scripts and the actual production output before deployment. GitHub project sites require the correct Vite base path, typically /bloom-in-time/ for a repository of that name; custom root domains use /.

Do not add hosting credentials to Git. A public source repository is not required by this local setup task and has not been created.

## First deployment gate

Build from a clean dependency installation and pinned lockfile. Check asset paths using the production URL, not just the development server. Confirm valid HTTPS, successful asset loads, usable entry, and an XR entry path. Inspect host configuration for WebXR-compatible permissions and ensure the app is not embedded in a restrictive frame.

Serve stable same-origin assets. Avoid runtime downloads from mutable third-party URLs. Verify public access without authentication or payment.

## Competition release sequence

1. Complete the [release checklist](../competition/release-checklist.md).
2. Create a release commit with the final code, content, and asset provenance.
3. Record its SHA, dependency versions, build command, URL, and verification evidence.
4. Deploy that commit and inspect the deployed application.
5. Record the public demonstration and submit the same experience.
6. Create an annotated competition-final tag only after confirming the actual deployed commit.
7. Disable deployment automation targeting the submitted URL at the deadline.

The tag name alone does not freeze a deployment. Preserve the built artifact and prevent branch changes from overwriting it.

## Freeze and availability

Deadline: November 18, 2026 at 23:00 Africa/Nairobi (20:00 UTC; 12:00 PST). The submitted application and submission materials must remain unchanged after the deadline. Keep them accessible free of charge through the winner announcement, expected around December 11.

Future work belongs on a separate development branch and preview URL. Do not replace the judged URL with that preview. Preserve host access and domain ownership through the availability period.

Before the deadline, a failed release can be corrected and reverified. After the deadline, do not silently update the submitted build; consult the organizers if an availability incident requires action.

## Operational checks

Record the final URL in the release evidence file when it exists. Check the application using a fresh browser session and no developer login. Avoid caching policies that mix a new entry page with old assets. Defer a service worker in the baseline to reduce stale-build complexity.
