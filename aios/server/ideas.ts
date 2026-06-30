/**
 * Ideas parser + checkbox toggle — the pure core of the console "Ideas" surface.
 *
 * Mirrors the review-item parser in server/fileApi.ts (parseReviewItems /
 * toggleReviewCheckbox / ITEM_RE) but for the `outputs/ideas-*.md` contract:
 * an anchor checkbox line carrying inline `· key: value` segments, followed by
 * an indented block of `why:/score:/from:/next:` fields. Items beneath an
 * "Archived" heading are flagged. Kept in its own module so neither file grows
 * unwieldy. Pure: no filesystem, no side effects.
 *
 * Anchor line shape:
 *   - [ ] `idea-YYYYMMDD-NNN` — <text>  ·  dim: <d>  ·  weight: <n>  ·  lane: <l>
 *         why:   <...>
 *         score: <...>
 *         from:  <pathA> · <pathB>
 *         next:  <...>
 */

export interface IdeaItem {
  id: string;
  checked: boolean;
  text: string;
  dim?: string;
  weight?: number;
  lane?: string;
  why?: string;
  score?: string;
  from?: string[];
  next?: string;
  archived: boolean;
  raw: string;
}

const ANCHOR_RE = /^\s*-\s*\[([ xX])\]\s*`(idea-[^`]+)`\s*(.*)$/;
const BLOCK_RE = /^\s+(why|score|from|next):\s*(.*)$/i;
const ARCHIVED_RE = /^#{1,6}\s+.*archived/i;

export function parseIdeaItems(markdown: string): IdeaItem[] {
  const items: IdeaItem[] = [];
  let archived = false;
  let current: IdeaItem | null = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (ARCHIVED_RE.test(line)) { archived = true; current = null; continue; }
    const a = ANCHOR_RE.exec(line);
    if (a) {
      const rest = a[3].trim().replace(/^[—–-]\s*/, "");
      const segs = rest.split("·").map((s) => s.trim()).filter(Boolean);
      const item: IdeaItem = {
        id: a[2], checked: a[1].toLowerCase() === "x", text: "", archived, raw: line,
      };
      segs.forEach((seg, i) => {
        const low = seg.toLowerCase();
        if (low.startsWith("dim:")) item.dim = seg.slice(seg.indexOf(":") + 1).trim();
        else if (low.startsWith("weight:")) item.weight = Number(seg.slice(seg.indexOf(":") + 1).trim());
        else if (low.startsWith("lane:")) item.lane = seg.slice(seg.indexOf(":") + 1).trim();
        else if (i === 0 || !item.text) item.text = seg;
      });
      items.push(item);
      current = item;
      continue;
    }
    const b = current ? BLOCK_RE.exec(line) : null;
    if (b && current) {
      const key = b[1].toLowerCase();
      const val = b[2].trim();
      if (key === "from") current.from = val.split("·").map((s) => s.trim()).filter(Boolean);
      else (current as unknown as Record<string, unknown>)[key] = val;
    } else if (line.trim() !== "" && !BLOCK_RE.test(line)) {
      current = null; // a non-blank, non-block line ends the current item's block
    }
  }
  return items;
}

export function toggleIdeaCheckbox(markdown: string, id: string, checked: boolean): string {
  const eol = markdown.includes("\r\n") ? "\r\n" : "\n";
  let changed = false;
  const next = markdown.split(/\r?\n/).map((line) => {
    const m = ANCHOR_RE.exec(line);
    if (m && m[2] === id) {
      const replaced = line.replace(/\[[ xX]\]/, `[${checked ? "x" : " "}]`);
      if (replaced !== line) changed = true;
      return replaced;
    }
    return line;
  });
  return changed ? next.join(eol) : markdown;
}
