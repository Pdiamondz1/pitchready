# NEEDS SIGN-OFF — build-mobile web preview (kill the version-drift that breaks the bundle)

Proposed by a second, deeper `build-mobile` stress-drive (a clone→build dogfood of *Reps*, a
tab-based strength-workout logger — the most complex mobile idea tested: Expo Router **tabs** +
a session-logger stack screen + a reactive in-memory store). This run **applied the rv-008 fix**
(expo-router peers + typecheck + the web-preview honesty note are all present) and the scaffold
installed + typechecked clean. But it then chased the "not guaranteed to bundle" web-preview caveat
rv-008 left open **to its root cause** and got the Expo **web export to build and run for the first
time across every mobile stress-drive** — the app passed a full proactive test-user walkthrough in the
browser (start a workout → log sets → PR flags → finish → live streak/volume/PR/history propagation).

The root cause is **transitive dependency drift** from the hand-written `package.json` + a fresh
`npm install` (no committed lockfile) — the exact "fragile part" the skill already flags. It is **not**
a missing direct dep (rv-008 fixed those); it is npm resolving *transitive* versions that break the
Metro bundler. This is the concrete evidence that promotes rv-008's soft note (d) — "consider
`create-expo-app`" — into a real, reproducible failure with a verified fix.

**How to apply:** check a box to approve; `improve-system` applies approved items on its next run and
logs each to `outputs/change-log.md`. Leave a box unchecked to defer/decline. Do not renumber or
rewrite existing ids.

---

- [x] `rv-20260702-009` — build-mobile should make the scaffold's dependency versions reproducible so the Metro bundle (and the web preview) actually builds — elevate `create-expo-app` to the recommended default, and require version-pinning for the hand-written path  ·  target: `.claude/skills/build-mobile/SKILL.md` (Phase 3 "Pin the stack" + the package.json spec + Phase 5 web-preview note)  ·  detail: **The concrete, reproduced failure (SDK-52 dogfood, but the *class* is SDK-agnostic):** even with rv-008's web deps present, `npx expo export --platform web` failed in two successive ways, both from transitive drift, not direct deps — **(1) NativeWind caret float:** `"nativewind": "^4.1.23"` resolved up to **4.2.6**, whose `react-native-css-interop@0.2.6` babel preset *unconditionally* lists `"react-native-worklets/plugin"` (a reanimated-4 / newer-SDK package not installed) → Babel "Cannot find module 'react-native-worklets/plugin'" → bundle fails. **(2) second-react-native metro hoist:** pinning NativeWind to the SDK-matched `~4.1.23` line fixed (1), but `react-native-css-interop@0.1.22` then pulled a **second `react-native` (0.86.0)** as an auto-installed peer, which hoisted **metro 0.84.4** over the SDK's metro (0.81.5); `@expo/cli` imports `metro/src/lib/TerminalReporter`, a subpath metro 0.84 dropped from its `exports` → `ERR_PACKAGE_PATH_NOT_EXPORTED` → bundle fails. **The fix that worked (verified — export then succeeded, app ran, walkthrough passed):** (i) pin NativeWind to the line matching the pinned Expo SDK with a **tilde, never a caret** (`~4.1.x` for SDK 52; use the SDK-matched NativeWind line at build time — don't let `^` float into a newer major/minor); (ii) **drop `react-native-reanimated` from the default dep list** unless a screen actually animates — it's unused by tabs/stack, and `babel-preset-expo` auto-injects its plugin only when present, so listing it just adds surface; (iii) add an npm **`overrides`** block to `package.json` pinning `react-native` **and** the metro family (`metro`, `metro-config`, `metro-resolver`, `metro-runtime`) to the pinned SDK's versions, so transitive resolution can't install a second react-native or hoist an incompatible metro. **The stronger, SDK-agnostic fix (recommended):** promote `npx create-expo-app` from the skill's parenthetical "robust alternative" (Phase 3, lines 146-148) to the **recommended default scaffold path** — it ships a complete, version-consistent project *with a lockfile*, which sidesteps this entire drift class at any SDK — and demote hand-authoring package.json + configs to a documented fallback that MUST carry the `~`-pin + `overrides` above. Phase 5 can then state the web preview **does** build (not "isn't guaranteed"). Why: a `build-mobile` user on the hand-written path gets a scaffold that installs and typechecks but **won't bundle** (web preview, and the same Metro drift can bite the native bundle) through no fault of their own — a fresh `npm install` silently resolves incompatible transitive metro/react-native. Reproducibility (a lockfile via create-expo-app, or `~`-pins + `overrides`) is the fix; the current caret + hand-written manifest is the seam. Companion to `rv-20260702-008` (d), which first flagged the create-expo-app path.

---

*Source: `build-mobile` deep stress-drive (Reps, tab-based). Scaffold installs + typechecks clean;
the web export was driven to a clean build + a passing browser walkthrough by pinning NativeWind to
the SDK line, dropping unused reanimated, and adding an `overrides` block for react-native + the metro
family. Extends rv-20260702-008 (which fixed the direct-dep manifest); this fixes the transitive
version drift underneath the "not guaranteed to bundle" caveat rv-008 left open.*
