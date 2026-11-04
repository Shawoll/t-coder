import { ARCHETYPES, getArchetype } from '../../data/archetypes.ts';
import { AREAS, getCode } from '../../data/catalog.ts';
import { AREA_INFO } from '../../data/areas.ts';
import { searchCodes } from '../../engine/search.ts';
import { scenarioTrail, whisper } from '../../engine/whisper.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { href, navigate } from '../../router.ts';
import { store } from '../../state.ts';
import { SYMPTOMS, type Landscape, type Symptom } from '../../types.ts';
import { h } from '../dom.ts';
import { icon } from '../icons.ts';
import { alvGrid } from '../components/alvGrid.ts';
import { codeLink, groupBox, lead, typeBadge } from '../components/basics.ts';
import type { Screen } from '../shell.ts';
import { notFoundView } from './notFound.ts';
import { searchForm } from './search.ts';
import { hitCard, sourceLabel, trailList, whisperLine } from './whisperParts.ts';

const isSymptom = (s: string | undefined): s is Symptom => !!s && (SYMPTOMS as readonly string[]).includes(s);

const landscapeSwitch = (): HTMLElement =>
  h(
    'div',
    { class: 'field field--inline' },
    h('span', { class: 'field__label', id: 'landscape-label' }, t('whisper.landscape')),
    h(
      'div',
      { class: 'seg seg--large', role: 'group', 'aria-labelledby': 'landscape-label' },
      (['ecc', 's4', 'btp'] as Landscape[]).map((l) =>
        h(
          'button',
          {
            type: 'button',
            class: 'seg__btn',
            'aria-pressed': String(store.state.landscape === l),
            onclick: () => store.setLandscape(l),
          },
          t(`landscape.${l}`),
        ),
      ),
    ),
  );

const btpBanner = (): HTMLElement | null =>
  store.state.landscape === 'btp'
    ? h('div', { class: 'banner banner--info', role: 'note' }, icon('msgI'), h('p', null, t('whisper.btp')))
    : null;

const guided = (q: string, area: string | undefined, symptom: Symptom | undefined): HTMLElement => {
  const go = (next: { area?: string | undefined; symptom?: string | undefined }) => {
    const r: { name: 'whisper'; q: string; area?: string; symptom?: string } = { name: 'whisper', q };
    const a = 'area' in next ? next.area : area;
    const s = 'symptom' in next ? next.symptom : symptom;
    if (a) r.area = a;
    if (s) r.symptom = s;
    navigate(r, { replace: true });
  };
  return h(
    'div',
    { class: 'guided' },
    h(
      'label',
      { class: 'field field--inline' },
      h('span', { class: 'field__label' }, t('whisper.area')),
      h(
        'select',
        { class: 'input', onchange: (e: Event) => go({ area: (e.target as HTMLSelectElement).value || undefined }) },
        h('option', { value: '' }, t('whisper.anyArea')),
        AREAS.map((a) => h('option', { value: a.id, selected: a.id === area }, `${a.id} ${tr(AREA_INFO[a.id]!.short)}`)),
      ),
    ),
    h(
      'div',
      { class: 'field field--inline' },
      h('span', { class: 'field__label', id: 'symptom-label' }, t('whisper.symptom')),
      h(
        'div',
        { class: 'chips', role: 'group', 'aria-labelledby': 'symptom-label' },
        SYMPTOMS.map((s) =>
          h(
            'button',
            { type: 'button', class: 'chip', 'aria-pressed': String(s === symptom), onclick: () => go({ symptom: s === symptom ? undefined : s }) },
            t(`symptom.${s}`),
          ),
        ),
      ),
    ),
  );
};

const scenarioIndex = (): HTMLElement =>
  h(
    'div',
    { class: 'grid-2' },
    groupBox(
      t('whisper.playbooks'),
      h('ol', { class: 'link-list link-list--numbered' }, ARCHETYPES.filter((a) => a.source === 'almanac').map((a) => h('li', null, h('a', { href: href({ name: 'archetype', id: a.id }) }, tr(a.title))))),
    ),
    groupBox(
      t('whisper.curated'),
      h('ul', { class: 'link-list link-list--columns' }, ARCHETYPES.filter((a) => a.source === 'curated').map((a) => h('li', null, h('a', { href: href({ name: 'archetype', id: a.id }) }, tr(a.title))))),
    ),
  );

export const whisperView = (q: string, areaParam?: string, symptomParam?: string): Screen => {
  const area = areaParam && AREA_INFO[areaParam] ? areaParam : undefined;
  const symptom = isSymptom(symptomParam) ? symptomParam : undefined;
  const form = searchForm(
    q,
    (next) => {
      const r: { name: 'whisper'; q: string; area?: string; symptom?: string } = { name: 'whisper', q: next };
      if (area) r.area = area;
      if (symptom) r.symptom = symptom;
      navigate(r);
    },
    t('whisper.label'),
    t('whisper.placeholder'),
    t('whisper.button'),
  );

  const body: (Node | null)[] = [
    lead(t('whisper.lead')),
    groupBox(t('whisper.label'), [form, h('p', { class: 'subhead' }, t('whisper.guided')), guided(q, area, symptom), landscapeSwitch()], { className: 'group--form' }),
  ];

  const options: Parameters<typeof whisper>[1] = { landscape: store.state.landscape };
  if (area) options.area = area;
  if (symptom) options.symptom = symptom;
  const result = q || area || symptom ? whisper(q, { ...options, limit: q ? 5 : 12 }) : undefined;

  if (!result) {
    body.push(scenarioIndex());
  } else {
    body.push(btpBanner());
    body.push(whisperLine(result.ranking));
    if (result.literalCodes.length) {
      body.push(
        groupBox(
          t('whisper.literal'),
          h(
            'ul',
            { class: 'code-cards' },
            result.literalCodes.map((c) => {
              const e = getCode(c)!;
              return h('li', { class: 'code-card' }, codeLink(c), typeBadge(e.type), h('span', null, tr(e.purpose)));
            }),
          ),
        ),
      );
    }
    if (result.hits.length) {
      body.push(h('p', { class: 'muted' }, t('whisper.results', { n: result.hits.length })));
      body.push(...result.hits.map((hit) => hitCard(hit)));
    } else if (!q) {
      body.push(h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, t('whisper.noGuided'))));
    } else {
      const hits = searchCodes(q, { limit: 20 });
      body.push(
        groupBox(t('home.toolbox'), [
          h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, t('whisper.fallback', { q }))),
          trailList(result.toolbox),
        ]),
      );
      if (hits.length) body.push(groupBox(t('whisper.searchResults'), alvGrid(hits.map((x) => x.code), { caption: t('whisper.searchResults'), filters: false, showArea: true })));
    }
  }
  body.push(groupBox(t('whisper.how'), h('p', { class: 'muted' }, t('whisper.howText'))));

  return {
    title: t('whisper.title'),
    transaction: 'WHISPER',
    content: h('div', { class: 'stack' }, body),
  };
};

export const archetypeView = (id: string): Screen => {
  const a = getArchetype(id);
  if (!a) return notFoundView(t('whisper.notFound', { id }));
  const trail = scenarioTrail(a, store.state.landscape);
  const terms = a.signals.flatMap((s) => s.terms);
  return {
    title: tr(a.title),
    transaction: `WHISPER_${a.id.toUpperCase().replace(/-/g, '_')}`,
    appToolbar: [h('a', { class: 'btn', href: href({ name: 'whisper', q: '' }) }, icon('whisper'), h('span', { class: 'btn__label' }, t('whisper.allScenarios')))],
    content: h(
      'div',
      { class: 'stack' },
      h('p', { class: 'hit__meta' }, h('span', { class: 'pill' }, sourceLabel(a)), a.areas.map((ar) => h('a', { class: 'pill pill--link', href: `#/area/${ar}` }, `${ar} ${tr(AREA_INFO[ar]!.short)}`))),
      groupBox(t('tcode.summary'), [lead(tr(a.summary)), h('p', { class: 'muted', lang: otherLang() }, a.summary[otherLang()])]),
      landscapeSwitch(),
      btpBanner(),
      groupBox(t('whisper.trail'), trailList(trail)),
      a.caution ? h('p', { class: 'message message--W' }, icon('msgW'), h('span', null, h('strong', null, `${t('whisper.caution')}: `), tr(a.caution))) : null,
      groupBox(t('whisper.signals'), h('ul', { class: 'matches' }, terms.map((term) => h('li', { class: 'match match--term' }, term)))),
    ),
  };
};
