import { describe, expect, it } from 'vitest';
import { parseCommand, typeahead } from '../src/engine/command.ts';
import { searchCodes, suggestCodes } from '../src/engine/search.ts';

const codes = (q: string, n = 10) => searchCodes(q).slice(0, n).map((h) => h.code.code);

describe('searchCodes', () => {
  it('ranks exact code, then prefixes', () => {
    expect(codes('se16', 3)).toEqual(['SE16', 'SE16N', 'SE16H']);
  });
  it('finds namespaced codes by segment', () => {
    expect(codes('mon')).toContain('/SCWM/MON');
  });
  it('ignores diacritics and searches both languages', () => {
    // Billing codes (VF*, V.23) come first; the MM invoice codes follow.
    expect(codes('faktura', 15)).toEqual(expect.arrayContaining(['MIRO', 'MRBR', 'VF03']));
    expect(codes('faktúra')).toEqual(codes('faktura'));
    expect(codes('billing document')).toContain('VF03');
  });
  it('tolerates a typo in a code', () => {
    expect(codes('SE16X', 3)).toContain('SE16');
  });
  it('filters by type and area', () => {
    const hits = searchCodes('invoice', { types: ['R'] });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.code.type === 'R')).toBe(true);
    expect(searchCodes('se', { areas: ['03'] }).every((h) => h.code.area === '03')).toBe(true);
  });
  it('returns nothing for an empty query', () => {
    expect(searchCodes('   ')).toEqual([]);
  });
});

describe('parseCommand', () => {
  it('opens a code in any SAP form', () => {
    for (const input of ['SE16N', 'se16n', '/nSE16N', '/NSE16N', '  /nse16n ']) {
      expect(parseCommand(input)).toEqual({ kind: 'open', code: 'SE16N', newSession: false });
    }
  });
  it('/n goes home, /o opens a new session', () => {
    expect(parseCommand('/n')).toEqual({ kind: 'home' });
    expect(parseCommand('/o')).toEqual({ kind: 'newSession' });
    expect(parseCommand('/oVA03')).toEqual({ kind: 'open', code: 'VA03', newSession: true });
  });
  it('opens curated codes like almanac ones, dotted codes included', () => {
    expect(parseCommand('/nSWI1')).toEqual({ kind: 'open', code: 'SWI1', newSession: false });
    expect(parseCommand('v.23')).toEqual({ kind: 'open', code: 'V.23', newSession: false });
    expect(parseCommand('/n/iwfnd/gw_client')).toEqual({ kind: 'open', code: '/IWFND/GW_CLIENT', newSession: false });
  });
  it('handles namespaced codes after /n', () => {
    expect(parseCommand('/n/SCWM/MON')).toEqual({ kind: 'open', code: '/SCWM/MON', newSession: false });
    expect(parseCommand('/scwm/mon')).toEqual({ kind: 'open', code: '/SCWM/MON', newSession: false });
  });
  it('reports unknown codes with suggestions', () => {
    const cmd = parseCommand('/nSE16X');
    expect(cmd.kind).toBe('unknown');
    if (cmd.kind === 'unknown') {
      expect(cmd.code).toBe('SE16X');
      expect(cmd.suggestions).toContain('SE16');
    }
    expect(parseCommand('XYZ').kind).toBe('unknown');
    expect(parseCommand('ZZ99').kind).toBe('unknown');
  });
  it('sends free text to search', () => {
    expect(parseCommand('idoc status 51')).toEqual({ kind: 'search', query: 'idoc status 51' });
    expect(parseCommand('banana')).toEqual({ kind: 'search', query: 'banana' });
  });
  it('knows the classic extras', () => {
    expect(parseCommand('')).toEqual({ kind: 'empty' });
    expect(parseCommand('/nex')).toEqual({ kind: 'logoff' });
    expect(parseCommand('/h')).toEqual({ kind: 'debug' });
  });
});

describe('suggestCodes', () => {
  it('suggests near misses first', () => {
    expect(suggestCodes('ST2')[0]).toBe('ST22');
    expect(suggestCodes('MIG0')).toContain('MIGO');
  });
});

describe('typeahead', () => {
  it('lists codes that start with what was typed, in any case', () => {
    // Almanac codes lead ties; curated ME28 and ME29N follow them.
    expect(typeahead('ME2')).toEqual(['ME2N', 'ME2L', 'ME2M', 'ME28', 'ME21N', 'ME22N', 'ME23N', 'ME29N']);
    expect(typeahead('me2')).toEqual(typeahead('ME2'));
  });
  it('accepts the /n and /o prefixes', () => {
    expect(typeahead('/nse16')).toEqual(['SE16', 'SE16N', 'SE16H']);
    expect(typeahead('/oVA0')).toEqual(['VA01', 'VA02', 'VA03', 'VA05']);
  });
  it('finds namespaced codes by segment', () => {
    expect(typeahead('mon')[0]).toBe('/SCWM/MON');
  });
  it('completes curated codes', () => {
    expect(typeahead('cog')[0]).toBe('COGI');
    expect(typeahead('swi')).toEqual(expect.arrayContaining(['SWI1', 'SWIA']));
  });
  it('falls back to near misses only when nothing matches as typed', () => {
    expect(typeahead('SE16X')).toContain('SE16');
    expect(typeahead('migo')).toEqual(['MIGO']);
  });
  it('stays quiet for free text, single characters and bare prefixes', () => {
    for (const input of ['faktura blokovana', 'faktura', 'banana', 'S', '/n', '/o', '']) {
      expect(typeahead(input)).toEqual([]);
    }
  });
  it('respects the limit', () => {
    expect(typeahead('/scwm/', 3)).toHaveLength(3);
  });
});
