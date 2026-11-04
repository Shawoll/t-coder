import { store } from '../state.ts';
import type { L10n, Lang } from '../types.ts';
import { en, type MessageKey } from './en.ts';
import { sk } from './sk.ts';

const MESSAGES: Record<Lang, Record<MessageKey, string>> = { en, sk };

export const lang = (): Lang => store.state.lang;

/** Translate a UI key, filling {placeholders} from `vars`. */
export const t = (key: MessageKey, vars: Record<string, string | number> = {}): string =>
  MESSAGES[lang()][key].replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));

/** Pick the current language from a bilingual content string. */
export const tr = (text: L10n): string => text[lang()];

/** The other language, for showing almanac text side by side. */
export const otherLang = (): Lang => (lang() === 'sk' ? 'en' : 'sk');

export type { MessageKey };
