// Local persistence for the adaptive loop. Demo mode: no Supabase required.
// Swap the two read/write helpers for Supabase calls and nothing else changes.

import { Attempt, DecisionRecord, Proposal } from "./engine";

export interface AdaptState {
  learnerId: string;
  theta: number;
  attempts: Attempt[];
  asked: string[];
  proposals: Proposal[];
  decisions: DecisionRecord[];
  settings: {
    setLength: number;
    minReadMs: number;
    hintsBeforeAnswer: number;
    breakSeconds: number;
  };
  updatedAt: number;
}

const KEY = "genlink.adapt.v1";

export function emptyState(learnerId: string): AdaptState {
  return {
    learnerId: learnerId,
    theta: 2.4,
    attempts: [],
    asked: [],
    proposals: [],
    decisions: [],
    settings: { setLength: 8, minReadMs: 0, hintsBeforeAnswer: 0, breakSeconds: 0 },
    updatedAt: Date.now()
  };
}

export function loadState(): AdaptState {
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return emptyState("local-learner");
    var parsed = JSON.parse(raw) as AdaptState;
    if (!parsed || !parsed.learnerId) return emptyState("local-learner");
    return parsed;
  } catch (e) {
    return emptyState("local-learner");
  }
}

export function saveState(state: AdaptState): void {
  try {
    state.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // storage full or blocked: the session still works in memory
  }
}

export function resetState(): AdaptState {
  var fresh = emptyState("local-learner");
  saveState(fresh);
  return fresh;
}