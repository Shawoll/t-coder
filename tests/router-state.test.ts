import { describe, expect, it } from 'vitest';
import { href, parseHash, type Route } from '../src/router.ts';
import { detectLang, parseState } from '../src/state.ts';

describe('router', () => {
  const routes: Route[] = [
    { name: 'home' },
    { name: 'area', id: '03' },
    { name: 'tcode', code: '/SCWM/MON' },
    { name: 'tcode', code: 'F.01' },
    { name: 'search', q: 'faktúra je blokovaná' },
    { name: 'whisper', q: 'IDoc status 51', area: '06', symptom: 'error' },
    { name: 'archetype', id: 'idoc-failed' },
    { name: 'processes' },
    { name: 'process', id: 'o2c' },
    { name: 'reference', tab: 'keys' },
    { name: 'quiz' },
    { name: 'favorites' },
    { name: 'about' },
  ];
  it.each(routes.map((r) => [href(r), r] as const))('%s round-trips', (hash, route) => {
    expect(parseHash(hash)).toEqual(route);
  });
  it('treats an empty hash as home and unknown paths as not found', () => {
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(parseHash('#/nowhere')).toEqual({ name: 'notFound', path: '/nowhere' });
  });
  it('encodes namespaced codes in one path segment', () => {
    expect(href({ name: 'tcode', code: '/SCWM/MON' })).toBe('#/t/%2FSCWM%2FMON');
  });
});

describe('state', () => {
  it('defaults the language from the browser (sk/cs → Slovak)', () => {
    expect(detectLang(['sk-SK', 'en'])).toBe('sk');
    expect(detectLang(['cs'])).toBe('sk');
    expect(detectLang(['en-GB', 'de'])).toBe('en');
    expect(detectLang([])).toBe('en');
  });
  it('parses stored state defensively', () => {
    const base = { lang: 'en' as const, landscape: 's4' as const, favorites: [], recent: [], history: [] };
    expect(parseState(null, base)).toEqual(base);
    expect(parseState('not json', base)).toEqual(base);
    expect(parseState('{"lang":"xx","favorites":["SE16N",3],"landscape":"btp"}', base)).toEqual({
      ...base,
      landscape: 'btp',
      favorites: ['SE16N'],
    });
  });
});
