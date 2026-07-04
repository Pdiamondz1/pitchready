// A tiny reactive in-memory store (no backend). Immutable updates + a
// useSyncExternalStore hook so React re-renders on every mutation. Data resets
// on refresh — Tier 0.

import { useSyncExternalStore } from "react";
import type { Deck, Slide, StartupInput } from "./types";
import { SEED_DECKS } from "./decks";
import { generateSlides } from "./deckStructure";
import { uid } from "@/lib/utils";

// localStorage persistence — created/edited decks survive a refresh. Graceful:
// if storage is unavailable (private mode, disabled), the app stays in-memory
// and never crashes. Bump the version suffix to reset stored data after a
// breaking schema change.
const STORAGE_KEY = "pitchready.decks.v1";

function loadInitial(): Deck[] {
  if (typeof window === "undefined") return SEED_DECKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_DECKS; // first visit → seed with the examples
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Deck[]) : SEED_DECKS;
  } catch {
    return SEED_DECKS;
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch {
    // storage full or unavailable — stay in-memory, never crash.
  }
}

let decks: Deck[] = loadInitial();
const listeners = new Set<() => void>();

function notify(): void {
  persist();
  for (const l of listeners) l();
}
function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function getSnapshot(): Deck[] {
  return decks;
}

export function useDecks(): Deck[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useDeck(id: string | undefined): Deck | undefined {
  const all = useDecks();
  return id ? all.find((d) => d.id === id) : undefined;
}

export function getDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id);
}

export function createDeck(input: StartupInput): Deck {
  const now = new Date().toISOString();
  const deck: Deck = {
    id: uid("deck"),
    name: input.name.trim() || "Untitled deck",
    input,
    slides: generateSlides(input),
    createdAt: now,
    updatedAt: now,
  };
  decks = [deck, ...decks];
  notify();
  return deck;
}

export function updateSlide(deckId: string, slideId: string, patch: Partial<Slide>): void {
  decks = decks.map((d) =>
    d.id !== deckId
      ? d
      : {
          ...d,
          slides: d.slides.map((s) => (s.id !== slideId ? s : { ...s, ...patch })),
          updatedAt: new Date().toISOString(),
        }
  );
  notify();
}

export function moveSlide(deckId: string, index: number, dir: -1 | 1): void {
  decks = decks.map((d) => {
    if (d.id !== deckId) return d;
    const to = index + dir;
    if (to < 0 || to >= d.slides.length) return d;
    const slides = [...d.slides];
    const [moved] = slides.splice(index, 1);
    slides.splice(to, 0, moved);
    return { ...d, slides, updatedAt: new Date().toISOString() };
  });
  notify();
}

export function renameDeck(deckId: string, name: string): void {
  decks = decks.map((d) =>
    d.id !== deckId ? d : { ...d, name: name.trim() || d.name, updatedAt: new Date().toISOString() }
  );
  notify();
}

export function deleteDeck(deckId: string): void {
  decks = decks.filter((d) => d.id !== deckId);
  notify();
}
