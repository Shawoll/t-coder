import type { Touchpoint } from '../../data/processes.ts';
import { tr } from '../../i18n/index.ts';
import { h } from '../dom.ts';
import { codeLink, stepCodes } from './basics.ts';

/**
 * A process as a chevron flow (desktop) or a vertical stepper (mobile).
 * The stages are a real sequence, so the list is ordered and numbered.
 */
export const processFlow = (touchpoints: readonly Touchpoint[], label: string): HTMLElement =>
  h(
    'ol',
    { class: 'flow', 'aria-label': label },
    touchpoints.map((tp, i) =>
      h(
        'li',
        { class: 'flow__step' },
        h('span', { class: 'flow__num', 'aria-hidden': 'true' }, String(i + 1)),
        h('span', { class: 'flow__label' }, tr(tp.label)),
        h(
          'span',
          { class: 'flow__codes' },
          tp.fiori
            ? stepCodes({ fiori: tp.fiori, label: tp.label, why: tp.label })
            : tp.codes.map((c, j) => [j ? h('span', { class: 'slash', 'aria-hidden': 'true' }, ' / ') : null, codeLink(c)]),
        ),
        tp.hint ? h('span', { class: 'flow__hint' }, tr(tp.hint)) : null,
      ),
    ),
  );
