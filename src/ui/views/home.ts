import { AREAS, codesInArea, getCode } from '../../data/catalog.ts';
import { AREA_INFO } from '../../data/areas.ts';
import { NOTES } from '../../data/notes.ts';
import { FAST_START, TOOLBOX } from '../../data/reference.ts';
import { pickOfTheDay } from '../../engine/daily.ts';
import { t, tr } from '../../i18n/index.ts';
import { codeHref, href, navigate } from '../../router.ts';
import { store } from '../../state.ts';
import type { TCode } from '../../types.ts';
import { h, nextId } from '../dom.ts';
import { button, codeLink, groupBox, stepCodes, typeBadge } from '../components/basics.ts';
import { setAllFolders, tree, type TreeNode } from '../components/tree.ts';
import type { Screen } from '../shell.ts';

const leaf = (prefix: string, c: TCode): TreeNode => ({
  id: `${prefix}:${c.code}`,
  code: c.code,
  label: tr(c.purpose),
  href: codeHref(c.code),
});

const leaves = (prefix: string, codes: readonly string[]): TreeNode[] =>
  codes.flatMap((code) => {
    const c = getCode(code);
    return c ? [leaf(prefix, c)] : [];
  });

const treeNodes = (): TreeNode[] => [
  {
    id: 'fav',
    label: t('home.favorites'),
    iconName: 'star',
    children: leaves('fav', store.state.favorites),
    emptyText: t('home.favoritesEmpty'),
  },
  {
    id: 'fast',
    label: t('home.fastStart'),
    children: FAST_START.map((g, i) => ({ id: `fast-${i}`, label: tr(g.title), children: leaves(`fast-${i}`, g.codes) })),
  },
  ...AREAS.map(
    (a): TreeNode => ({
      id: `area-${a.id}`,
      label: `${a.id} ${tr(a.title)}`,
      children: codesInArea(a.id).map((c) => leaf(`area-${a.id}`, c)),
    }),
  ),
  {
    id: 'recent',
    label: t('home.recent'),
    children: leaves('recent', store.state.recent),
    emptyText: t('home.recentEmpty'),
  },
];

const dailyBox = (): HTMLElement | null => {
  const pool = Object.keys(NOTES).length ? Object.keys(NOTES) : FAST_START.flatMap((g) => g.codes);
  const code = pickOfTheDay(pool, new Date());
  const entry = code ? getCode(code) : undefined;
  if (!entry) return null;
  const note = NOTES[entry.code];
  return groupBox(t('home.daily'), [
    h(
      'div',
      { class: 'daily' },
      h('a', { class: 'daily__code code', href: codeHref(entry.code) }, entry.code),
      typeBadge(entry.type),
    ),
    h('p', { class: 'daily__purpose' }, tr(entry.purpose)),
    note ? h('p', { class: 'muted' }, tr(note.whenToUse)) : h('p', { class: 'muted' }, tr(AREA_INFO[entry.area]!.short)),
  ]);
};

const quickWhisper = (): HTMLElement => {
  const id = nextId('qw');
  const input = h('input', { id, class: 'input input--wide', type: 'search', placeholder: t('whisper.placeholder'), enterkeyhint: 'search' });
  return groupBox(t('home.quickWhisper'), [
    h(
      'form',
      {
        class: 'inline-form',
        role: 'search',
        onsubmit: (e: Event) => {
          e.preventDefault();
          navigate({ name: 'whisper', q: input.value.trim() });
        },
      },
      h('label', { class: 'visually-hidden', for: id }, t('whisper.label')),
      input,
      h('button', { type: 'submit', class: 'btn btn--primary' }, t('whisper.button')),
    ),
    h('p', { class: 'hint' }, t('home.quickWhisperHint')),
  ]);
};

const toolboxBox = (): HTMLElement =>
  groupBox(t('home.toolbox'), [
    h('p', { class: 'muted' }, t('home.toolboxText')),
    h(
      'ul',
      { class: 'toolbox' },
      TOOLBOX.map((s) => h('li', null, stepCodes({ codes: s.codes, why: s.why }), h('span', { class: 'toolbox__why' }, tr(s.why)))),
    ),
  ]);

export const homeView = (): Screen => {
  const nodes = treeNodes();
  const treeEl = h('div', { class: 'tree-panel' }, tree(nodes, t('home.tree'), ['fast']));
  const rerenderTree = (): void => {
    treeEl.replaceChildren(tree(treeNodes(), t('home.tree')));
  };
  return {
    title: t('home.title'),
    transaction: 'SESSION_MANAGER',
    appToolbar: [
      button(t('home.expandAll'), () => (setAllFolders(treeNodes(), true), rerenderTree()), { iconName: 'folderOpen' }),
      button(t('home.collapseAll'), () => (setAllFolders(treeNodes(), false), rerenderTree()), { iconName: 'folder' }),
      h('a', { class: 'btn', href: href({ name: 'whisper', q: '' }) }, t('nav.whisper')),
    ],
    content: h(
      'div',
      { class: 'easy-access' },
      treeEl,
      h('aside', { class: 'easy-access__side' }, quickWhisper(), dailyBox(), toolboxBox()),
    ),
  };
};

/** Used by the favorites and recent folders: a compact list of code links. */
export const codeList = (codes: readonly string[]): HTMLElement =>
  h('ul', { class: 'code-list' }, codes.map((c) => h('li', null, codeLink(c, { withPurpose: true }))));
