import { describe, expect, it } from 'vitest';
import { pickOfTheDay, dayKey } from '../src/engine/daily.ts';
import { explain } from '../src/engine/explain.ts';
import { coOccurring, sameArea, siblings, usedIn } from '../src/engine/related.ts';

describe('siblings', () => {
  it('finds create/change/display siblings', () => {
    expect(siblings('VA01')).toEqual(['VA02', 'VA03']);
    expect(siblings('VA03')).toEqual(['VA01', 'VA02']);
    expect(siblings('ME22N')).toEqual(['ME21N', 'ME23N']);
    expect(siblings('MSC2N')).toEqual(['MSC1N', 'MSC3N']);
  });
  it('rejects codes that differ in object or are not create/change/display', () => {
    expect(siblings('SM12')).toEqual([]);
    expect(siblings('VA01')).not.toContain('VA11'); // a sales inquiry, not a sales order
    expect(siblings('ST22')).toEqual([]);
    expect(siblings('NOPE')).toEqual([]);
  });
});

describe('reverse index', () => {
  it('knows which playbooks and processes use a code', () => {
    const u = usedIn('WE02');
    expect(u.playbooks.map((a) => a.id)).toContain('idoc-failed');
    expect(usedIn('MIGO').processes.map((p) => p.id)).toEqual(expect.arrayContaining(['p2p', 'o2c', 'plan2produce']));
  });
  it('ranks co-occurring codes', () => {
    const co = coOccurring('SMQ1');
    expect(co).toContain('SMQ2');
    expect(co).not.toContain('SMQ1');
  });
  it('lists same-area codes without the code itself', () => {
    const area = sameArea('SE16N');
    expect(area).toContain('SE16H');
    expect(area).not.toContain('SE16N');
  });
});

describe('explain', () => {
  it('builds context from almanac facts', () => {
    const x = explain('SE16N')!;
    expect(x.forms).toEqual(['/nSE16N', '/oSE16N']);
    expect(x.fastStart).toBe(true);
    expect(x.summary.en).toContain('chapter 01');
    expect(x.summary.sk).toContain('kapitoly 01');
    expect(x.verify).toHaveLength(4);
  });
  it('mentions the S/4HANA replacement of legacy codes', () => {
    const x = explain('XD01')!;
    expect(x.replacement).toBeDefined();
    expect(x.summary.en).toContain('BP');
    expect(explain('LTMC')!.summary.en).toContain('F3473');
  });
  it('explains namespaced codes', () => {
    expect(explain('/SCWM/MON')!.namespace?.en).toContain('/n/SCWM/MON');
    expect(explain('MIGO')!.namespace).toBeUndefined();
  });
  it('returns undefined for unknown codes', () => {
    expect(explain('ZZZ')).toBeUndefined();
  });
});

describe('pick of the day', () => {
  it('is stable within a day and uses the local date', () => {
    const pool = ['A', 'B', 'C', 'D', 'E'];
    const morning = new Date(2026, 10, 4, 8, 0);
    const evening = new Date(2026, 10, 4, 22, 0);
    expect(dayKey(morning)).toBe('2026-11-04');
    expect(pickOfTheDay(pool, morning)).toBe(pickOfTheDay(pool, evening));
    expect(pickOfTheDay([], morning)).toBeUndefined();
  });
});
