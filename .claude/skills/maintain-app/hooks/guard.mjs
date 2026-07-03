#!/usr/bin/env node
/**
 * maintain-app guardrail — a PreToolUse(Bash) hook, registered in .claude/settings.json by
 * `maintain-app` setup (Phase 0). It is a NO-OP unless a maintain-app tick is actually running
 * (sentinel outputs/runs/maintain-app.lock present AND fresh). During a tick it hard-blocks the
 * irreversible actions the loop must never take — merge, push to the default branch, gh pr merge,
 * deploy/publish, secret/key writes — while still allowing the tick's own legitimate work
 * (feature-branch push, `gh pr create`).
 *
 * Contract: exit 0 = allow; exit 2 = block (stderr is surfaced to the agent). The sentinel-scoping
 * is what makes a session-global hook safe: outside a tick it always exits 0, so ordinary developer
 * sessions are never affected, and a crashed tick can never leave a lasting block (stale-lock check).
 */
import { readFileSync } from 'node:fs';

const LOCK = 'outputs/runs/maintain-app.lock';
const MAX_TICK_MS = 2 * 60 * 60 * 1000; // 2h — an older lock is stale => treat as "no tick"

// 1) No fresh tick => allow everything (normal dev unaffected; crashed-tick-safe).
let lock;
try {
  lock = JSON.parse(readFileSync(LOCK, 'utf8'));
} catch {
  process.exit(0); // sentinel absent/unreadable => allow
}
const startedAt = Date.parse(lock && lock.started_at);
if (!startedAt || Date.now() - startedAt > MAX_TICK_MS) process.exit(0); // stale => allow (time-based; lock.pid is informational, no liveness check)

// 2) A tick is running: inspect the Bash command from the hook payload on stdin.
let cmd = '';
try {
  cmd = (JSON.parse(readFileSync(0, 'utf8')).tool_input || {}).command || '';
} catch {
  process.exit(0);
}
if (!cmd) process.exit(0);

function deny(why) {
  process.stderr.write(
    `maintain-app guardrail: blocked "${why}". The maintenance loop reports and opens PRs only — ` +
      `merging, pushing to the default branch, deploying/publishing, and writing keys are the human's job. ` +
      `If no tick is running, delete ${LOCK} and retry.\n`
  );
  process.exit(2);
}

// git push: allow ONLY a push of the tick's own maintain-app/* feature branch. Everything else —
// a bare `git push`, `git push origin`, `git push origin HEAD` (all of which push the current branch,
// which could be the default), any main/master target, and --all/--mirror — is blocked, so no push
// can ever reach the default branch regardless of which branch is checked out.
if (/\bgit\s+push\b/.test(cmd)) {
  const ownBranch = /\bgit\s+push\b[^\n|&;]*\bmaintain-app\/[\w.\-\/]+/.test(cmd);
  const risky = /\b(?:main|master)\b/.test(cmd) || /--(?:all|mirror)\b/.test(cmd);
  if (!ownBranch || risky) deny('git push to anything other than a maintain-app/* feature branch');
}

const BLOCKED = [
  [/\bgit\s+merge(?![-\w])/, 'git merge'],
  [/\bgh\s+pr\s+merge\b/, 'gh pr merge'],
  [/\b(?:vercel|netlify)\b[^\n]*(?:\bdeploy\b|--prod\b)/, 'deploy'],
  [/\b(?:npm|pnpm|yarn)\s+publish\b/, 'publish'],
  [/\bgh\s+release\s+create\b/, 'gh release create'],
  [/\bgh\s+secret\s+set\b/, 'writing a repo secret'],
  [/(?:>|>>|tee)\s*[^\n|&;]*\.env(?:\b|$)/, 'writing a .env / key file'],
];

for (const [re, why] of BLOCKED) {
  if (re.test(cmd)) deny(why);
}
process.exit(0);
