import { getArea } from '../../data/catalog.ts';
import { AREA_INFO } from '../../data/areas.ts';
import { getNote, type Note } from '../../data/notes.ts';
import { SAFETY_RULE } from '../../data/reference.ts';
import { explain, type Explanation } from '../../engine/explain.ts';
import { coOccurring, sameArea, siblings, usedIn } from '../../engine/related.ts';
import { suggestCodes } from '../../engine/search.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { href } from '../../router.ts';
import { store } from '../../state.ts';
import { h } from '../dom.ts';
import { icon } from '../icons.ts';
import { button, codeLink, groupBox, stepCodes, typeBadge } from '../components/basics.ts';
import { tabStrip } from '../components/tabStrip.ts';
import type { Screen } from '../shell.ts';
import { copyText, status } from '../status.ts';
import { notFoundView } from './notFound.ts';

const SAME_AREA_PREVIEW = 8;

const overview = (x: Explanation): Node => {
  const area = getArea(x.code.area);
  const info = AREA_INFO[x.code.area];
  return h(
    'div',
    { class: 'grid-2' },
    groupBox(t('tcode.purpose'), [
      h('p', { class: 'lead' }, tr(x.code.purpose)),
      h('p', { class: 'muted' }, h('span', { class: 'label' }, `${t('tcode.otherLang')}: `), h('span', { lang: otherLang() }, x.code.purpose[otherLang()])),
      h('p', null, tr(x.summary)),
    ]),
    groupBox(t('tcode.type'), [
      h('p', { class: 'type-line' }, typeBadge(x.code.type), h('strong', null, tr(x.typeLabel))),
      h('p', null, tr(x.typeMeaning)),
      h('p', { class: `message message--${x.code.type === 'R' || x.code.type === 'O' ? 'I' : 'W'}` }, icon(x.code.type === 'R' || x.code.type === 'O' ? 'msgI' : 'msgW'), h('span', null, tr(x.safety))),
      h('p', { class: 'muted small' }, tr(SAFETY_RULE)),
    ]),
    groupBox(t('tcode.forms'), [
      h(
        'ul',
        { class: 'forms' },
        x.forms.map((form) =>
          h(
            'li',
            null,
            h('code', { class: 'form-code' }, form),
            button(t('tcode.copy'), () => void copyText(form), { iconName: 'copy', title: t('tcode.copyLabel', { form }), className: 'btn--small' }),
          ),
        ),
      ),
      x.namespace ? h('p', { class: 'muted' }, tr(x.namespace)) : null,
    ]),
    groupBox(t('tcode.area'), [
      area ? h('p', null, h('a', { href: `#/area/${area.id}` }, `${area.id} ${tr(area.title)}`)) : null,
      info ? h('p', { class: 'muted' }, tr(info.intro)) : null,
      x.fastStart ? h('p', { class: 'type-line' }, h('span', { class: 'pill' }, t('tcode.fastStart')), t('tcode.fastStartText')) : null,
    ]),
    groupBox(t('tcode.verify'), h('ol', { class: 'steps' }, x.verify.map((v) => h('li', null, tr(v))))),
  );
};

const noteTab = (note: Note): Node =>
  h(
    'div',
    { class: 'stack' },
    h('p', { class: 'curated-label' }, icon('msgI'), h('span', null, t('tcode.curatedLabel'))),
    groupBox(t('tcode.whenToUse'), h('p', { class: 'lead' }, tr(note.whenToUse))),
    h(
      'div',
      { class: 'grid-2' },
      groupBox(t('tcode.tips'), h('ul', { class: 'bullets' }, note.tips.map((tip) => h('li', null, tr(tip))))),
      groupBox(t('tcode.pitfalls'), h('ul', { class: 'bullets bullets--warn' }, note.pitfalls.map((p) => h('li', null, tr(p))))),
    ),
    note.s4 ? groupBox(t('tcode.s4'), h('p', null, tr(note.s4))) : null,
  );

const codeGrid = (codes: readonly string[]): HTMLElement =>
  h('ul', { class: 'code-list' }, codes.map((c) => h('li', null, codeLink(c, { withPurpose: true }))));

const relatedTab = (code: string): Node => {
  const sib = siblings(code);
  const co = coOccurring(code);
  const area = sameArea(code, [...sib, ...co]);
  const preview = area.slice(0, SAME_AREA_PREVIEW);
  const areaList = codeGrid(preview);
  const more =
    area.length > SAME_AREA_PREVIEW
      ? button(t('common.more', { n: area.length }), (e) => {
          areaList.replaceWith(codeGrid(area));
          (e.currentTarget as HTMLElement).remove();
        })
      : null;
  return h(
    'div',
    { class: 'grid-2' },
    sib.length ? groupBox(t('tcode.siblings'), codeGrid(sib)) : null,
    co.length ? groupBox(t('tcode.coOccurring'), codeGrid(co)) : null,
    area.length ? groupBox(t('tcode.sameArea'), [areaList, more]) : null,
  );
};

const usedInTab = (code: string): Node => {
  const u = usedIn(code);
  if (!u.playbooks.length && !u.archetypes.length && !u.processes.length) {
    return h('p', { class: 'muted' }, t('tcode.unused'));
  }
  const list = (items: { href: string; label: string }[]) =>
    h('ul', { class: 'link-list' }, items.map((i) => h('li', null, h('a', { href: i.href }, i.label))));
  return h(
    'div',
    { class: 'grid-2' },
    u.playbooks.length
      ? groupBox(t('tcode.playbooks'), list(u.playbooks.map((a) => ({ href: href({ name: 'archetype', id: a.id }), label: `${String(a.playbook).padStart(2, '0')} ${tr(a.title)}` }))))
      : null,
    u.processes.length
      ? groupBox(t('tcode.processes'), list(u.processes.map((p) => ({ href: href({ name: 'process', id: p.id }), label: tr(p.title) }))))
      : null,
    u.archetypes.length
      ? groupBox(t('tcode.archetypes'), list(u.archetypes.map((a) => ({ href: href({ name: 'archetype', id: a.id }), label: tr(a.title) }))))
      : null,
  );
};

const legacyBanner = (x: Explanation): HTMLElement | null => {
  if (!x.replacement) return null;
  return h(
    'div',
    { class: 'banner banner--legacy', role: 'note' },
    icon('msgW'),
    h(
      'div',
      null,
      h('p', { class: 'banner__title' }, t('tcode.legacyTitle')),
      h('p', null, tr(x.replacement.note)),
      h(
        'p',
        { class: 'banner__use' },
        `${t('tcode.legacyUse')}: `,
        x.replacement.steps.map((s, i) => [i ? ' + ' : '', stepCodes(s)]),
      ),
    ),
  );
};

let lastTab = 'overview';

export const tcodeView = (codeId: string): Screen => {
  const x = explain(codeId) ?? explain(codeId.toUpperCase());
  if (!x) {
    const suggestions = suggestCodes(codeId);
    return notFoundView(
      t('tcode.notFoundTitle', { code: codeId }),
      h('div', null, h('p', null, t('tcode.notFoundText')), suggestions.length ? codeGrid(suggestions) : null),
    );
  }
  const code = x.code.code;
  store.addRecent(code);
  const note = getNote(code);

  const tabs = [
    { id: 'overview', label: t('tcode.overview'), render: () => overview(x) },
    ...(note ? [{ id: 'note', label: t('tcode.note'), render: () => noteTab(note) }] : []),
    { id: 'related', label: t('tcode.related'), render: () => relatedTab(code) },
    { id: 'used', label: t('tcode.usedIn'), render: () => usedInTab(code) },
  ];
  const initial = tabs.some((tab) => tab.id === lastTab) ? lastTab : 'overview';

  const favButton = button(
    store.isFavorite(code) ? t('tb.unfavorite') : t('tb.favorite'),
    (e) => {
      const on = store.toggleFavorite(code);
      const b = e.currentTarget as HTMLButtonElement;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.btn__label')!.textContent = on ? t('tb.unfavorite') : t('tb.favorite');
      b.querySelector('.icon')!.replaceWith(icon(on ? 'star' : 'starOutline'));
      status('S', t(on ? 'status.favAdded' : 'status.favRemoved', { code }));
    },
    { iconName: store.isFavorite(code) ? 'star' : 'starOutline', pressed: store.isFavorite(code) },
  );

  return {
    title: tr(x.code.purpose),
    titleCode: code,
    transaction: code,
    code,
    appToolbar: [
      favButton,
      button(`/n${code}`, () => void copyText(`/n${code}`), { iconName: 'copy', title: t('tcode.copyLabel', { form: `/n${code}` }) }),
      h('a', { class: 'btn', href: `#/area/${x.code.area}` }, `${x.code.area} ${tr(AREA_INFO[x.code.area]!.short)}`),
    ],
    content: h(
      'div',
      { class: 'stack' },
      legacyBanner(x),
      note ? null : h('p', { class: 'muted small' }, t('tcode.noNote')),
      tabStrip(tabs, initial, (id) => (lastTab = id)),
    ),
  };
};

