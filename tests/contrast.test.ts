// Checks the palette in src/styles/tokens.css against WCAG 2.x AA.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('}'));
const tokens = Object.fromEntries([...rootBlock.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1]!, m[2]!]));

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const ratio = (a: string, b: string): number => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
};

/** [foreground token, background token, minimum ratio] */
const PAIRS: [string, string, number][] = [
  ...['surface', 'face', 'field', 'alv-zebra', 'alv-key', 'alv-total', 'alv-head', 'alv-hover', 'banner-warn', 'banner-info'].map(
    (bg): [string, string, number] => ['ink', bg, 4.5],
  ),
  ...['surface', 'face', 'field', 'alv-zebra'].map((bg): [string, string, number] => ['ink-muted', bg, 4.5]),
  ...['surface', 'face', 'field', 'alv-key', 'alv-zebra', 'alv-total'].map((bg): [string, string, number] => ['link', bg, 4.5]),
  ['title-ink', 'title-a', 4.5],
  ['title-ink', 'title-b', 4.5],
  ['sel-ink', 'sel', 4.5],
  ['title-a', 'surface', 4.5],
  ...['R', 'W', 'A', 'O', 'L'].map((t): [string, string, number] => ['badge-ink', `type-${t}`, 4.5]),
  ...['S', 'W', 'E', 'I'].flatMap((t): [string, string, number][] => [
    [`msg-${t}`, 'face', 4.5],
    [`msg-${t}`, 'surface', 4.5],
  ]),
  ['msg-W', 'banner-warn', 4.5],
  ['msg-I', 'banner-info', 4.5],
  // Non-text UI parts (WCAG 1.4.11): field borders against surfaces.
  ['shade-deep', 'surface', 3],
  ['shade-deep', 'field', 3],
];

describe('palette meets WCAG AA', () => {
  it('parses the tokens', () => {
    expect(Object.keys(tokens).length).toBeGreaterThan(30);
  });
  it.each(PAIRS)('%s on %s ≥ %d:1', (fg, bg, min) => {
    expect(tokens[fg], fg).toBeDefined();
    expect(tokens[bg], bg).toBeDefined();
    expect(ratio(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(min);
  });
});
