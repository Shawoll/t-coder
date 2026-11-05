import { describe, expect, it } from 'vitest';
import { WHISPER_EXAMPLES } from '../src/data/examples.ts';
import { whisper } from '../src/engine/whisper.ts';
import { isFioriStep } from '../src/types.ts';

const topIds = (q: string, n = 1) => whisper(q).hits.slice(0, n).map((h) => h.archetype.id);

describe('whisper golden queries', () => {
  const golden: [string, string][] = [
    ['IDoc status 51', 'idoc-failed'],
    ['používateľ nemá oprávnenie', 'auth-missing'],
    ['faktúra je blokovaná', 'invoice-blocked'],
    ['objednávka sa nedá expedovať', 'order-shipping-blocked'],
    ['transport import failed return code 8', 'transport-import-failed'],
    ['výroba nemá materiál', 'production-shortage'],
    ['job is slow', 'slow-performance'],
    ['ERP and EWM stock differ', 'erp-ewm-mismatch'],
    ['dáta po migrácii nesedia', 'migration-reconciliation'],
    ['locked by user', 'lock-entries'],
    ['posting period not open', 'posting-period'],
    ['XD01 in S/4', 'legacy-in-s4'],
    // Scenarios built around the curated codes.
    ['workflow visí', 'workflow-stuck'],
    ['work item stuck in the approver inbox', 'workflow-stuck'],
    ['batch input session has errors', 'batch-input-errors'],
    ['email sa neodoslal', 'email-not-sent'],
    ['dlaždica vo Fiori launchpade chýba', 'fiori-tile-missing'],
    ['sales order on credit block', 'credit-block'],
    ['objednávka má úverový blok', 'credit-block'],
    ['LO cockpit setup tables', 'bw-delta-missing'],
  ];
  it.each(golden)('%s → %s', (query, expected) => {
    expect(topIds(query)[0]).toBe(expected);
  });

  // The example chips on the whisper and home screens must hit what they advertise.
  it.each(WHISPER_EXAMPLES.flatMap((e) => (['sk', 'en'] as const).map((l) => [e.q[l], e.id] as const)))(
    'example “%s” → %s',
    (query, expected) => {
      const top = whisper(query).hits[0];
      expect(top?.archetype.id).toBe(expected);
      expect(top?.confidence).not.toBe('low');
    },
  );

  it('dump TIME_OUT → short dump in the top 2', () => {
    expect(topIds('dump TIME_OUT', 2)).toContain('short-dump');
  });

  it('banana → falls back to the first-response toolbox', () => {
    const r = whisper('banana');
    expect(r.hits).toEqual([]);
    expect(r.fallback).toBe(true);
    expect(r.toolbox.flatMap((t) => (isFioriStep(t.step) ? [] : t.step.codes))).toEqual(
      expect.arrayContaining(['ST22', 'SM37', 'SLG1', 'WE02', 'SU53']),
    );
  });
});

describe('whisper behaviour', () => {
  it('points a legacy code to its S/4 replacement first', () => {
    const hit = whisper('XD01 in S/4').hits[0]!;
    const first = hit.trail[0]!;
    expect(isFioriStep(first.step) ? first.step.fiori : first.step.codes).toEqual(['BP']);
    expect(first.replaces).toEqual(['XD01']);
  });

  it('explains its reasoning with chips', () => {
    const hit = whisper('IDoc status 51').hits[0]!;
    expect(hit.chips.map((c) => c.kind)).toEqual(expect.arrayContaining(['term', 'pattern']));
    expect(hit.confidence).toBe('high');
  });

  it('shows literal T-codes found in the query', () => {
    expect(whisper('ST22 shows TIME_OUT').literalCodes).toEqual(['ST22']);
  });

  it('ranks codes across hits with step decay', () => {
    const r = whisper('IDoc status 51');
    expect(r.ranking[0]!.key).toBe('WE02');
    for (let i = 1; i < r.ranking.length; i++) {
      expect(r.ranking[i - 1]!.score).toBeGreaterThanOrEqual(r.ranking[i]!.score);
    }
  });

  it('swaps legacy steps in the S/4 lens and keeps them for ECC', () => {
    const keys = (landscape: 'ecc' | 's4') =>
      whisper('delta missing extraction', { landscape })
        .hits.find((h) => h.archetype.id === 'bw-delta-missing')!
        .trail.flatMap((t) => (isFioriStep(t.step) ? [t.step.fiori] : t.step.codes));
    expect(keys('ecc')).toContain('RSA7');
    expect(keys('s4')).not.toContain('RSA7');
    expect(keys('s4').filter((k) => k === 'ODQMON')).toHaveLength(1);
  });

  it('supports guided chips without text', () => {
    const r = whisper('', { area: '06', symptom: 'stuck' });
    expect(r.hits.length).toBeGreaterThan(0);
    for (const h of r.hits) {
      expect(h.archetype.areas).toContain('06');
      expect(h.archetype.symptoms).toContain('stuck');
    }
  });

  it('is deterministic', () => {
    expect(whisper('faktúra je blokovaná')).toEqual(whisper('faktúra je blokovaná'));
  });
});
