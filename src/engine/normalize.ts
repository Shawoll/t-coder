// Text normalisation shared by search and whisper.
// Slovak and English are handled the same way: lower-case, strip diacritics,
// keep T-code punctuation (/ _ - .) inside tokens, drop stopwords.

const COMBINING_MARKS = /\p{M}+/gu;

/** Lower-case and strip diacritics: "Faktúra" → "faktura". */
export const fold = (s: string): string => s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();

/**
 * A token is a run of letters/digits that may contain / _ - . between
 * alphanumerics and may start with "/" (namespaced codes such as /SCWM/MON).
 * Trailing punctuation is never part of a token, so "MIGO." → "migo".
 */
const TOKEN_RE = /\/?[\p{L}\p{N}]+(?:[/_.-][\p{L}\p{N}]+)*/gu;

/** Split folded text into raw tokens, keeping code punctuation. */
export const tokenize = (s: string): string[] => fold(s).match(TOKEN_RE) ?? [];

/** Spelling variants that should count as the same word. */
const ALIASES: Readonly<Record<string, string>> = {
  's/4': 's4',
  's/4hana': 's4',
  's4hana': 's4',
  'g/l': 'gl',
  'e-mail': 'email',
  'q-rfc': 'qrfc',
  't-rfc': 'trfc',
};

// prettier-ignore
export const STOPWORDS: ReadonlySet<string> = new Set([
  // English
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'in', 'on', 'at', 'of', 'for',
  'to', 'from', 'by', 'with', 'and', 'or', 'but', 'not', 'no', 'it', 'its', 'this', 'that', 'these', 'those',
  'my', 'our', 'your', 'i', 'we', 'you', 'he', 'she', 'they', 'me', 'us', 'them', 'do', 'does', 'did', 'doesn',
  'don', 'didn', 'isn', 'wasn', 'aren', 'can', 'cannot', 'cant', 'could', 'should', 'would', 'will', 'won',
  'how', 'what', 'why', 'when', 'where', 'who', 'there', 'here', 'so', 'as', 'if', 'then', 'than', 'too',
  'very', 'have', 'has', 'had', 'get', 'got', 'gets', 'still', 'any', 'some', 'all', 'into', 'just', 'please',
  'help', 'problem', 'issue', 'issues', 'something', 'anything', 'again', 'now', 'today', 'also', 'one',
  // Slovak (already folded: no diacritics)
  'a', 'aj', 'ale', 'alebo', 'ani', 'ako', 'by', 'bol', 'bola', 'bolo', 'boli', 'byt', 'je', 'su', 'som',
  'si', 'sa', 'sme', 'ste', 'v', 'vo', 'na', 'do', 'z', 'zo', 's', 'so', 'k', 'ku', 'o', 'od', 'po', 'pre',
  'pri', 'za', 'pod', 'nad', 'cez', 'medzi', 'ten', 'ta', 'to', 'tie', 'ti', 'tento', 'tato', 'toto',
  'ktory', 'ktora', 'ktore', 'co', 'kde', 'kedy', 'preco', 'uz', 'este', 'len', 'iba', 'aby', 'ze', 'nie',
  'mi', 'mu', 'ma', 'mam', 'mame', 'moj', 'moja', 'moje', 'nas', 'vas', 'jeho', 'jej', 'ich', 'tam', 'tu',
  'potom', 'mozem', 'moze', 'treba', 'prosim', 'pomoc', 'nema', 'nemam', 'nemaju', 'neda', 'nedaju',
  'nejde', 'nefunguje', 'stale', 'teraz', 'dnes', 'vsetko', 'nieco', 'nic', 'niekto', 'tak', 'takze',
]);

export interface Analyzed {
  /** Folded query text, used by the error-signature patterns. */
  folded: string;
  /** Content tokens, in order, without stopwords. */
  tokens: string[];
  /** Pairs of tokens that were adjacent in the text (no stopword between them). */
  bigrams: string[];
  /** adjacent[i] is true when tokens[i] directly followed tokens[i - 1] in the text. */
  adjacent: boolean[];
  /** Every raw token and slash-part, for detecting literal T-codes. */
  codeCandidates: string[];
}

/**
 * Tokens like "migo/mb51" or "erp/ewm" are split into their parts; namespaced
 * codes ("/scwm/mon") and short pairs ("s/4", "g/l") stay whole.
 */
const splitSlashes = (token: string): string[] => {
  if (token.startsWith('/') || !token.includes('/')) return [token];
  const parts = token.split('/');
  return parts.every((p) => p.length >= 2) ? parts : [token];
};

const isNoise = (t: string): boolean => STOPWORDS.has(t) || (t.length === 1 && !/\d/.test(t));

export const analyze = (text: string): Analyzed => {
  const folded = fold(text);
  const raw = folded.match(TOKEN_RE) ?? [];
  const tokens: string[] = [];
  const bigrams: string[] = [];
  const adjacent: boolean[] = [];
  const codeCandidates: string[] = [];
  let previous: string | undefined; // last content token, if it was adjacent

  for (const rawToken of raw) {
    codeCandidates.push(rawToken);
    const aliased = ALIASES[rawToken] ?? rawToken;
    const parts = splitSlashes(aliased);
    if (parts.length > 1) codeCandidates.push(...parts);
    for (const part of parts) {
      const t = ALIASES[part] ?? part;
      if (isNoise(t)) {
        previous = undefined;
        continue;
      }
      if (previous !== undefined) bigrams.push(`${previous} ${t}`);
      adjacent.push(previous !== undefined);
      tokens.push(t);
      previous = t;
    }
  }
  return { folded, tokens, bigrams, adjacent, codeCandidates };
};

/** Normalise an authored term (may contain diacritics or a phrase). */
export const normalizeTerm = (term: string): string =>
  tokenize(term)
    .map((t) => ALIASES[t] ?? t)
    .join(' ');
