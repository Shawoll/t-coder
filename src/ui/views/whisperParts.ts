// Rendering pieces shared by the whisper, scenario and search screens.

import type { Archetype } from '../../data/archetypes.ts';
import { AREA_INFO } from '../../data/areas.ts';
import type { MatchChip, RankedCode, TrailStep, WhisperHit } from '../../engine/whisper.ts';
import { t, tr } from '../../i18n/index.ts';
import { codeHref, href } from '../../router.ts';
import { isFioriStep, SYMPTOMS, type Symptom } from '../../types.ts';
import { h, nextId } from '../dom.ts';
import { icon } from '../icons.ts';
import { button, groupBox, stepCodes } from '../components/basics.ts';
import { copyText } from '../status.ts';

/** How a ranked key is typed into SAP: /nWE02 for T-codes, the bare id for the Fiori app. */
const commandForm = (key: string): string => (key === 'F3473' ? key : `/n${key}`);

/** "Whisper: /nST22 → /nSLG1 → /nSM37": the combined ranking as a command chain. */
export const whisperLine = (ranking: readonly RankedCode[], max = 5): HTMLElement | null => {
  const top = ranking.slice(0, max);
  if (!top.length) return null;
  const chain = top.map((r) => commandForm(r.key)).join(' → ');
  return h(
    'div',
    { class: 'whisper-line', role: 'group', 'aria-label': t('whisper.lineLabel') },
    h('span', { class: 'whisper-line__label' }, `${t('whisper.line')}:`),
    h(
      'ol',
      { class: 'whisper-line__codes' },
      top.map((r) =>
        h(
          'li',
          null,
          r.key === 'F3473'
            ? h('span', { class: 'code' }, 'F3473')
            : h('a', { class: 'code', href: codeHref(r.key) }, commandForm(r.key)),
        ),
      ),
    ),
    button(t('whisper.copyChain'), () => void copyText(chain), { iconName: 'copy', className: 'btn--small whisper-line__copy', title: t('tcode.copyLabel', { form: chain }) }),
  );
};

/** A labelled row of whisper queries ("Try an example", "Recently asked"); each chip runs its query. */
export const queryChips = (label: string, queries: readonly string[]): HTMLElement | null => {
  if (!queries.length) return null;
  const id = nextId('qc');
  return h(
    'div',
    { class: 'field field--inline query-chips' },
    h('span', { class: 'field__label', id }, `${label}:`),
    h('ul', { class: 'chips chips--list', 'aria-labelledby': id }, queries.map((q) => h('li', null, h('a', { class: 'chip', href: href({ name: 'whisper', q }) }, q)))),
  );
};

export const sourceLabel = (a: Archetype): string =>
  a.source === 'almanac'
    ? t('whisper.source.almanac', { n: String(a.playbook ?? '').padStart(2, '0') })
    : t('whisper.source.curated');

/** The trail is a real sequence, so it is an ordered list. */
export const trailList = (trail: readonly TrailStep[]): HTMLElement =>
  h(
    'ol',
    { class: 'trail' },
    trail.map((s) =>
      h(
        'li',
        { class: 'trail__step' },
        h('span', { class: 'trail__codes' }, stepCodes(s.step)),
        h('span', { class: 'trail__why' }, tr(s.step.why)),
        s.replaces?.length ? h('span', { class: 'trail__replaces' }, t('whisper.replaces', { codes: s.replaces.join(', ') })) : null,
        isFioriStep(s.step) ? h('span', { class: 'trail__fiori muted' }, tr(s.step.label)) : null,
      ),
    ),
  );

const light = (confidence: WhisperHit['confidence']): HTMLElement =>
  h(
    'span',
    { class: `light light--${confidence}` },
    h('span', { class: 'light__lamp', 'aria-hidden': 'true' }),
    h('span', null, t(`whisper.confidence.${confidence}`)),
  );

/** Guided-chip matches carry raw ids ("06", "stuck"); show them as the user saw them. */
const chipText = (c: MatchChip): string => {
  if (c.kind === 'filter') {
    if ((SYMPTOMS as readonly string[]).includes(c.text)) return `${t('whisper.symptom')}: ${t(`symptom.${c.text as Symptom}`)}`;
    const area = AREA_INFO[c.text];
    if (area) return `${t('whisper.area')}: ${c.text} ${tr(area.short)}`;
  }
  return c.label ? `${tr(c.label)}: ${c.text}` : c.text;
};

export const hitCard = (hit: WhisperHit, { compact = false } = {}): HTMLElement => {
  const a = hit.archetype;
  const chips = hit.chips.map((c) => h('li', { class: `match match--${c.kind}` }, chipText(c)));
  return groupBox(
    h('a', { href: href({ name: 'archetype', id: a.id }) }, tr(a.title)),
    [
      h('p', { class: 'hit__meta' }, light(hit.confidence), h('span', { class: 'muted' }, sourceLabel(a)), h('span', { class: 'muted small' }, t('whisper.score', { s: hit.score.toFixed(2) }))),
      compact ? null : h('p', null, tr(a.summary)),
      chips.length ? h('div', { class: 'hit__chips' }, h('span', { class: 'label' }, `${t('whisper.matched')}:`), h('ul', { class: 'matches' }, chips)) : null,
      h('h3', { class: 'subhead' }, t('whisper.trail')),
      trailList(hit.trail),
      a.caution && !compact
        ? h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, h('strong', null, `${t('whisper.caution')}: `), tr(a.caution)))
        : null,
    ],
    { className: 'hit' },
  );
};
