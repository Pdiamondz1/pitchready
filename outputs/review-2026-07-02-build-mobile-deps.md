# NEEDS SIGN-OFF — build-mobile dependency manifest (make the scaffold actually runnable)

Proposed by a `build-mobile` stress-drive (a clone→build dogfood of *Streak*, a daily habit
tracker). The scaffold's structure + theming + streak logic are sound (`npm install` and `npm run
typecheck` both clean). But the skill's **hand-written `package.json` dep list is incomplete**: the
app is missing dependencies it genuinely needs to run, and the previews Phase 5 offers aren't
provisioned by Phase 3. This is a **build-*-family completeness** fix in the spirit of the prior
"missing-deps" catches (build-mobile P12 cva/clsx, build-plugin P13 typography).

**How to apply:** check a box to approve; `improve-system` applies approved items on its next run and
logs each to `outputs/change-log.md`. Leave a box unchecked to defer/decline. Do not renumber or
rewrite existing ids.

---

- [x] `rv-20260702-008` — build-mobile's Phase-3 package.json must list expo-router's peer deps + a typecheck script, and Phase 5 must be honest about the web-preview path  ·  target: `.claude/skills/build-mobile/SKILL.md` (Phase 3 package.json spec + Phase 5)  ·  detail: **(a) expo-router peers (required — app won't run without them):** add `react-native-screens`, `expo-constants`, `expo-linking`, and `expo-status-bar` to the Phase-3 `dependencies` list (currently it names expo, expo-router, react, react-native, nativewind, safe-area-context, reanimated, cva/clsx/tailwind-merge but omits these expo-router peer deps — `npx expo install` does NOT auto-add peers, so a hand-written package.json must include them). **(b) typecheck script (Phase-5 offers it):** add `"typecheck": "tsc --noEmit"` to the Phase-3 `scripts` list (Phase 5 says *"offer `npm --prefix mobile run typecheck`"* but the Phase-3 script list — start/android/ios/web — never creates it). **(c) web-preview honesty:** the scaffold declares a `web` platform in `app.json` and Phase 5 offers `npm run web`, but the dep list omits `react-native-web` + `react-dom` (+ `expo-asset`), so web preview fails out of the box — and even after adding them a Metro/NativeWind transform error can remain. So EITHER fully provision + verify web (add those deps and confirm `expo export --platform web` succeeds) OR soften Phase 5 to state plainly that **Expo Go on a phone is the preview**, and that `npm run web` needs `npx expo install react-native-web react-dom expo-asset` first and isn't guaranteed — don't imply `npm run web` works as-is. **(d) note (recommendation, not required):** hand-writing a minimal Expo package.json is the root fragility; consider bootstrapping with `npx create-expo-app` (which ships a complete, consistent, runnable project) then applying the theme + screens, rather than hand-authoring package.json + configs from a minimal list. Why: a `build-mobile` user who follows the current skill gets an app that (1) won't run (missing expo-router peers), (2) offers a typecheck script that doesn't exist, and (3) offers a web preview that fails — all avoidable by completing the manifest and being honest about the preview paths.

---

*Source: `build-mobile` target stress-drive (Streak). Scaffold typechecks + installs clean; the gaps
are the incomplete dep manifest + the Phase-5/Phase-3 mismatch. Companion to rv-20260702-007
(web-only ladder honesty), both from the same plugin+mobile dogfood.*
