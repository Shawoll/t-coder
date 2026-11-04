import { catalog } from '../../data/catalog.ts';
import {
  COMMAND_TIPS,
  DATA_KEYS,
  DATA_KEYS_NOTE,
  DOCUMENT_FLOW,
  ESSENTIAL_NOTE,
  FIORI_SEARCH_NOTE,
  LANDSCAPES,
  MOVEMENT_TYPES,
  MOVEMENT_TYPES_INTRO,
  MOVEMENT_TYPES_NOTE,
  OPERATING_RULES,
  PRE_PROJECT_CHECKLIST,
  S4_CHANGES,
  SAFETY_RULE,
  SCOPE_NOTE,
  SOURCES,
  TYPE_LEGEND,
  VERIFY_STEPS,
} from '../../data/reference.ts';
import { lang, otherLang, t, tr } from '../../i18n/index.ts';
import { TTYPES } from '../../types.ts';
import { h } from '../dom.ts';
import { icon } from '../icons.ts';
import { codeLink, groupBox, lead, typeBadge } from '../components/basics.ts';
import { tabStrip } from '../components/tabStrip.ts';
import type { Screen } from '../shell.ts';

/** A simple bordered ALV-look table with a key column. */
const table = (head: string[], rows: (Node | string)[][]): HTMLElement =>
  h(
    'div',
    { class: 'alv-scroll' },
    h(
      'table',
      { class: 'alv alv--static' },
      h('thead', null, h('tr', null, head.map((c, i) => h('th', { scope: 'col', class: i === 0 ? 'alv__key-head' : '' }, c)))),
      h('tbody', null, rows.map((r) => h('tr', null, r.map((c, i) => (i === 0 ? h('th', { scope: 'row', class: 'alv__key' }, c) : h('td', null, c)))))),
    ),
  );

const otherLangText = (sk: string, en: string): string => (otherLang() === 'sk' ? sk : en);

const legendTab = (): Node =>
  h(
    'div',
    { class: 'stack' },
    groupBox(t('ref.tags'), [
      h(
        'dl',
        { class: 'legend' },
        TTYPES.map((ty) => [h('dt', null, typeBadge(ty), ' ', tr(TYPE_LEGEND[ty].label)), h('dd', null, tr(TYPE_LEGEND[ty].meaning))]),
      ),
      h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, tr(SAFETY_RULE))),
    ]),
    groupBox(t('ref.essential'), h('p', null, tr(ESSENTIAL_NOTE))),
    groupBox(t('ref.commands'), [
      table(
        [t('ref.key'), t('ref.meaning')],
        COMMAND_TIPS.map((c) => [h('code', null, c.form), tr(c.text)]),
      ),
      h('p', { class: 'muted' }, tr(FIORI_SEARCH_NOTE)),
    ]),
    h(
      'div',
      { class: 'grid-2' },
      groupBox(t('ref.verify'), h('ol', { class: 'steps' }, VERIFY_STEPS.map((v) => h('li', null, tr(v))))),
      groupBox(t('ref.rules'), h('ol', { class: 'steps' }, OPERATING_RULES.map((v) => h('li', null, tr(v))))),
    ),
    groupBox(
      t('ref.landscapes'),
      h('dl', { class: 'legend' }, LANDSCAPES.map((l) => [h('dt', null, l.name), h('dd', null, tr(l.text))])),
    ),
  );

const keysTab = (): Node =>
  groupBox(t('ref.keys'), [
    h('p', null, tr(DATA_KEYS_NOTE)),
    table(
      [t('ref.key'), t('ref.meaning'), t('ref.otherLang')],
      DATA_KEYS.map((k) => [h('code', null, k.key), lang() === 'sk' ? k.sk : k.en, otherLangText(k.sk, k.en)]),
    ),
  ]);

const movementTab = (): Node =>
  h(
    'div',
    { class: 'stack' },
    groupBox(t('ref.movement'), [
      h('p', null, tr(MOVEMENT_TYPES_INTRO)),
      table(
        [t('ref.bwart'), t('ref.meaning'), t('ref.otherLang')],
        MOVEMENT_TYPES.map((m) => [h('code', null, m.bwart), lang() === 'sk' ? m.sk : m.en, otherLangText(m.sk, m.en)]),
      ),
      h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, tr(MOVEMENT_TYPES_NOTE))),
    ]),
    groupBox(t('ref.docFlow'), h('p', null, tr(DOCUMENT_FLOW))),
  );

const s4Tab = (): Node =>
  h(
    'div',
    { class: 'stack' },
    groupBox(
      t('ref.s4'),
      table(
        [t('ref.topic'), t('ref.meaning'), t('ref.codes')],
        S4_CHANGES.map((c) => [c.topic, tr(c.text), h('span', { class: 'code-row' }, c.codes.map((code) => codeLink(code)))]),
      ),
    ),
    groupBox(t('ref.checklist'), h('ol', { class: 'steps' }, PRE_PROJECT_CHECKLIST.map((v) => h('li', null, tr(v))))),
  );

const sourcesTab = (): Node =>
  h(
    'div',
    { class: 'stack' },
    groupBox(t('ref.provenance'), [
      h('p', null, t('ref.provenanceText')),
      h('p', { class: 'muted' }, `${catalog.source.title}, ${catalog.source.edition}, ${catalog.source.pages} pp.`),
    ]),
    groupBox(t('ref.sources'), table([t('ref.key'), t('ref.meaning')], SOURCES.map((s) => [s.id, s.title]))),
    groupBox(t('ref.scope'), h('p', null, tr(SCOPE_NOTE))),
    groupBox(t('about.disclaimerTitle'), h('p', null, t('disclaimer'))),
  );

const TABS = ['legend', 'keys', 'movement', 's4', 'sources'] as const;

export const referenceView = (tab: string): Screen => {
  const initial = (TABS as readonly string[]).includes(tab) ? tab : 'legend';
  return {
    title: t('ref.title'),
    transaction: 'REFERENCE',
    content: h(
      'div',
      { class: 'stack' },
      lead(t('ref.lead')),
      tabStrip(
        [
          { id: 'legend', label: t('ref.legend'), render: legendTab },
          { id: 'keys', label: t('ref.keys'), render: keysTab },
          { id: 'movement', label: t('ref.movement'), render: movementTab },
          { id: 's4', label: t('ref.s4'), render: s4Tab },
          { id: 'sources', label: t('ref.sources'), render: sourcesTab },
        ],
        initial,
        (id) => history.replaceState(null, '', `#/ref/${id}`),
      ),
    ),
  };
};
