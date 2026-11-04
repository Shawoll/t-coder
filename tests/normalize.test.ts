import { describe, expect, it } from 'vitest';
import { analyze, fold, tokenize } from '../src/engine/normalize.ts';
import { damerauLevenshtein, matchWord } from '../src/engine/fuzzy.ts';

describe('fold', () => {
  it('lower-cases and strips Slovak diacritics', () => {
    expect(fold('Faktúra')).toBe('faktura');
    expect(fold('Používateľ nemá oprávnenie')).toBe('pouzivatel nema opravnenie');
    expect(fold('ŽĽČŤÔÄ')).toBe('zlctoa');
  });
});

describe('tokenize', () => {
  it('keeps T-code punctuation inside tokens', () => {
    expect(tokenize('/SCWM/MON F-28 F.01 STMS_IMPORT')).toEqual(['/scwm/mon', 'f-28', 'f.01', 'stms_import']);
  });
  it('drops trailing punctuation', () => {
    expect(tokenize('Use MIGO. Then MB51, please!')).toEqual(['use', 'migo', 'then', 'mb51', 'please']);
  });
});

describe('analyze', () => {
  it('removes SK and EN stopwords', () => {
    expect(analyze('faktúra je blokovaná').tokens).toEqual(['faktura', 'blokovana']);
    expect(analyze('the job is slow').tokens).toEqual(['job', 'slow']);
  });
  it('builds bigrams only from words adjacent in the text', () => {
    const a = analyze('posting period not open');
    expect(a.bigrams).toEqual(['posting period']);
    expect(analyze('locked by user').bigrams).toEqual([]);
  });
  it('splits slash pairs but keeps namespaced codes and S/4 whole', () => {
    expect(analyze('SMQ1/SMQ2').tokens).toEqual(['smq1', 'smq2']);
    expect(analyze('/SCWM/MON').tokens).toEqual(['/scwm/mon']);
    expect(analyze('XD01 in S/4').tokens).toEqual(['xd01', 's4']);
    expect(analyze('S/4HANA').tokens).toEqual(['s4']);
  });
});

describe('fuzzy matching', () => {
  it('computes Damerau–Levenshtein distance with transpositions', () => {
    expect(damerauLevenshtein('kitten', 'sitting')).toBe(3);
    expect(damerauLevenshtein('ST22', 'ST22')).toBe(0);
    expect(damerauLevenshtein('SE61N', 'SE16N')).toBe(1);
  });
  it('matches Slovak inflections as prefix/stem', () => {
    expect(matchWord('faktury', 'faktura')).toBe('prefix');
    expect(matchWord('fakturu', 'faktur')).toBe('prefix');
    expect(matchWord('migracii', 'migracia')).toBe('prefix');
  });
  it('tolerates one typo only for words of 5+ letters', () => {
    expect(matchWord('transprot', 'transport')).toBe('fuzzy');
    expect(matchWord('jbo', 'job')).toBeUndefined();
  });
  it('never fuzzy-matches words with digits', () => {
    expect(matchWord('me21n', 'me22n')).toBeUndefined();
    expect(matchWord('st22', 'st22')).toBe('exact');
  });
});
