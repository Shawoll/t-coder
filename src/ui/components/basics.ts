// Small building blocks shared by all screens.

import { getCode } from '../../data/catalog.ts';
import { TYPE_LEGEND } from '../../data/reference.ts';
import { tr } from '../../i18n/index.ts';
import { codeHref } from '../../router.ts';
import { isFioriStep, type Step, type TType } from '../../types.ts';
import { h, nextId } from '../dom.ts';
import { icon, type IconName } from '../icons.ts';

/** Type badge: R blue, W green, A orange, O grey, L red. */
export const typeBadge = (type: TType): HTMLElement => {
  const label = tr(TYPE_LEGEND[type].label);
  return h('abbr', { class: `badge badge--${type}`, title: label, 'aria-label': `${type}: ${label}` }, type);
};

/** A clickable T-code in the list font. Unknown codes render as plain text. */
export const codeLink = (code: string, { withPurpose = false } = {}): HTMLElement => {
  const entry = getCode(code);
  if (!entry) return h('span', { class: 'code' }, code);
  return h(
    'a',
    { class: 'code-link', href: codeHref(code), title: tr(entry.purpose) },
    h('span', { class: 'code' }, code),
    withPurpose ? h('span', { class: 'code-link__text' }, tr(entry.purpose)) : null,
  );
};

/** The codes (or Fiori app) of a trail step, joined as the almanac writes them: SMQ1 / SMQ2. */
export const stepCodes = (step: Step): HTMLElement => {
  if (isFioriStep(step)) {
    return h('span', { class: 'fiori', title: tr(step.label) }, h('span', { class: 'code' }, step.fiori), ' ', h('span', { class: 'fiori__label' }, 'Fiori'));
  }
  const parts: (HTMLElement | string)[] = [];
  step.codes.forEach((c, i) => {
    if (i) parts.push(h('span', { class: 'slash', 'aria-hidden': 'true' }, ' / '));
    parts.push(codeLink(c));
  });
  return h('span', { class: 'step-codes' }, parts);
};

/**
 * A group box: a frame with its title set into the top border, as in
 * classic SAP GUI screens. Rendered as a labelled section.
 */
export const groupBox = (
  title: string | Node,
  body: (Node | string | null | false)[] | Node,
  { className = '', headingLevel = 2 }: { className?: string; headingLevel?: 2 | 3 } = {},
): HTMLElement => {
  const id = nextId('grp');
  return h(
    'section',
    { class: `group ${className}`.trim(), 'aria-labelledby': id },
    h(headingLevel === 2 ? 'h2' : 'h3', { class: 'group__title', id }, title),
    h('div', { class: 'group__body' }, Array.isArray(body) ? body : [body]),
  );
};

/** A beveled push button. */
export const button = (
  label: string,
  onClick: (e: MouseEvent) => void,
  { iconName, className = '', title, pressed }: { iconName?: IconName; className?: string; title?: string; pressed?: boolean } = {},
): HTMLButtonElement =>
  h(
    'button',
    {
      type: 'button',
      class: `btn ${className}`.trim(),
      title: title ?? null,
      'aria-pressed': pressed === undefined ? null : String(pressed),
      onclick: onClick as EventListener,
    },
    iconName ? icon(iconName) : null,
    h('span', { class: 'btn__label' }, label),
  );

/** A link styled as a beveled button. */
export const linkButton = (label: string, href: string, iconName?: IconName): HTMLAnchorElement =>
  h('a', { class: 'btn', href }, iconName ? icon(iconName) : null, h('span', { class: 'btn__label' }, label));

/** Screen-level heading paragraph under the title. */
export const lead = (text: string): HTMLElement => h('p', { class: 'lead' }, text);
