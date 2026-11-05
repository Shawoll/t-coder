// App state that survives reloads: language, landscape lens, favorites,
// recent codes, command-field history and recent whisper queries. Stored on the
// device only.

import type { Landscape, Lang } from './types.ts';

export interface AppState {
  lang: Lang;
  landscape: Landscape;
  favorites: string[];
  recent: string[];
  history: string[];
  whispers: string[];
}

const KEY = 'tcoder:v1';
const MAX_RECENT = 12;
const MAX_HISTORY = 15;
const MAX_WHISPERS = 8;

/** sk/cs browsers get Slovak, everyone else English. */
export const detectLang = (languages: readonly string[]): Lang =>
  languages.some((l) => /^(sk|cs)\b/i.test(l)) ? 'sk' : 'en';

const defaults = (): AppState => ({
  lang: typeof navigator === 'undefined' ? 'en' : detectLang(navigator.languages ?? [navigator.language]),
  landscape: 's4',
  favorites: [],
  recent: [],
  history: [],
  whispers: [],
});

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Parse stored state defensively: unknown or broken values fall back to defaults. */
export const parseState = (raw: string | null, base: AppState = defaults()): AppState => {
  if (!raw) return base;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    return {
      lang: v['lang'] === 'sk' || v['lang'] === 'en' ? v['lang'] : base.lang,
      landscape: v['landscape'] === 'ecc' || v['landscape'] === 's4' || v['landscape'] === 'btp' ? v['landscape'] : base.landscape,
      favorites: strings(v['favorites']),
      recent: strings(v['recent']).slice(0, MAX_RECENT),
      history: strings(v['history']).slice(0, MAX_HISTORY),
      whispers: strings(v['whispers']).filter((w) => w.trim()).slice(0, MAX_WHISPERS),
    };
  } catch {
    return base;
  }
};

const storage = (): Storage | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined; // private mode or blocked storage
  }
};

type Listener = (state: AppState, changed: keyof AppState) => void;

class Store {
  #state: AppState = parseState(storage()?.getItem(KEY) ?? null);
  #listeners = new Set<Listener>();

  get state(): Readonly<AppState> {
    return this.#state;
  }

  subscribe(fn: Listener): () => void {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  #set<K extends keyof AppState>(key: K, value: AppState[K]): void {
    this.#state = { ...this.#state, [key]: value };
    try {
      storage()?.setItem(KEY, JSON.stringify(this.#state));
    } catch {
      /* quota exceeded or storage blocked: keep working in memory */
    }
    this.#listeners.forEach((fn) => fn(this.#state, key));
  }

  setLang(lang: Lang): void {
    if (lang !== this.#state.lang) this.#set('lang', lang);
  }

  setLandscape(landscape: Landscape): void {
    if (landscape !== this.#state.landscape) this.#set('landscape', landscape);
  }

  isFavorite(code: string): boolean {
    return this.#state.favorites.includes(code);
  }

  toggleFavorite(code: string): boolean {
    const on = !this.isFavorite(code);
    this.#set('favorites', on ? [...this.#state.favorites, code] : this.#state.favorites.filter((c) => c !== code));
    return on;
  }

  addRecent(code: string): void {
    if (this.#state.recent[0] === code) return;
    this.#set('recent', [code, ...this.#state.recent.filter((c) => c !== code)].slice(0, MAX_RECENT));
  }

  addHistory(entry: string): void {
    const e = entry.trim();
    if (!e || this.#state.history[0] === e) return;
    this.#set('history', [e, ...this.#state.history.filter((h) => h !== e)].slice(0, MAX_HISTORY));
  }

  addWhisper(query: string): void {
    const q = query.trim();
    if (!q || this.#state.whispers[0] === q) return;
    this.#set('whispers', [q, ...this.#state.whispers.filter((w) => w !== q)].slice(0, MAX_WHISPERS));
  }

  clear(key: 'favorites' | 'recent' | 'history' | 'whispers'): void {
    this.#set(key, []);
  }
}

export const store = new Store();
