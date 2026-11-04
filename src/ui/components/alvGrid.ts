// An ALV-style list: light-blue key column, zebra rows, sortable headers,
// type and area filters, and a yellow totals band. Below 640px the rows
// collapse into cards (pure CSS).

import { AREAS, getArea } from '../../data/catalog.ts';
import { AREA_INFO } from '../../data/areas.ts';
import { TYPE_LEGEND } from '../../data/reference.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { codeHref } from '../../router.ts';
import { TTYPES, type AreaId, type TCode, type TType } from '../../types.ts';
import { h, nextId } from '../dom.ts';
import { typeBadge } from './basics.ts';

type SortKey = 'code' | 'description' | 'type' | 'area' | 'none';

export interface GridOptions {
  caption: string;
  showArea?: boolean;
  filters?: boolean;
  /** Keep the incoming order (e.g. search relevance) until a header is clicked. */
  initialSort?: SortKey;
}

const TYPE_ORDER: Record<TType, number> = { R: 0, W: 1, A: 2, O: 3, L: 4 };

export const alvGrid = (rows: readonly TCode[], options: GridOptions): HTMLElement => {
  const { caption, showArea = false, filters = true, initialSort = 'none' } = options;
  let sort: { key: SortKey; dir: 1 | -1 } = { key: initialSort, dir: 1 };
  const types = new Set<TType>();
  let area: AreaId | '' = '';

  const tbody = h('tbody');
  const total = h('td', { class: 'alv__total', colspan: showArea ? 4 : 3 });
  const headers = new Map<SortKey, HTMLElement>();

  const header = (key: SortKey, label: string, className: string): HTMLElement => {
    const th = h(
      'th',
      { scope: 'col', class: className, 'aria-sort': 'none' },
      h('button', { type: 'button', class: 'alv__sort', onclick: () => toggleSort(key) }, label, h('span', { class: 'alv__arrow', 'aria-hidden': 'true' })),
    );
    headers.set(key, th);
    return th;
  };

  const toggleSort = (key: SortKey): void => {
    sort = { key, dir: sort.key === key ? ((-sort.dir) as 1 | -1) : 1 };
    render();
  };

  const compare = (a: TCode, b: TCode): number => {
    switch (sort.key) {
      case 'code':
        return a.code.localeCompare(b.code);
      case 'description':
        return tr(a.purpose).localeCompare(tr(b.purpose), undefined, { sensitivity: 'base' });
      case 'type':
        return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
      case 'area':
        return a.area.localeCompare(b.area);
      case 'none':
        return 0;
    }
  };

  const row = (c: TCode): HTMLElement => {
    const areaInfo = getArea(c.area);
    return h(
      'tr',
      null,
      h('th', { scope: 'row', class: 'alv__key' }, h('a', { class: 'alv__link', href: codeHref(c.code) }, c.code)),
      h('td', { class: 'alv__desc' }, tr(c.purpose), h('span', { class: 'alv__alt', lang: otherLang() }, c.purpose[otherLang()])),
      h('td', { class: 'alv__type' }, typeBadge(c.type)),
      showArea
        ? h('td', { class: 'alv__area' }, h('a', { href: `#/area/${c.area}`, title: areaInfo ? tr(areaInfo.title) : null }, `${c.area} ${AREA_INFO[c.area] ? tr(AREA_INFO[c.area]!.short) : ''}`))
        : null,
    );
  };

  const render = (): void => {
    let list = rows.filter((c) => (types.size === 0 || types.has(c.type)) && (!area || c.area === area));
    if (sort.key !== 'none') list = [...list].sort((a, b) => compare(a, b) * sort.dir);
    tbody.replaceChildren(
      ...(list.length
        ? list.map(row)
        : [h('tr', null, h('td', { class: 'alv__empty', colspan: showArea ? 4 : 3 }, t('grid.noRows')))]),
    );
    total.textContent = t('grid.entries', { n: list.length });
    for (const [key, th] of headers) {
      const active = key === sort.key;
      th.setAttribute('aria-sort', active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none');
      th.querySelector('.alv__arrow')!.textContent = active ? (sort.dir === 1 ? '▲' : '▼') : '';
    }
  };

  const captionId = nextId('alv');
  const table = h(
    'table',
    { class: `alv ${showArea ? 'alv--area' : ''}`, 'aria-labelledby': captionId },
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        header('code', t('grid.code'), 'alv__key-head'),
        header('description', t('grid.description'), ''),
        header('type', t('grid.type'), 'alv__type-head'),
        showArea ? header('area', t('grid.area'), 'alv__area-head') : null,
      ),
    ),
    tbody,
    h('tfoot', null, h('tr', null, total)),
  );

  const toolbar = filters ? filterBar() : null;
  function filterBar(): HTMLElement {
    const typeChips = TTYPES.filter((ty) => rows.some((c) => c.type === ty)).map((ty) => {
      const chip = h(
        'button',
        {
          type: 'button',
          class: `chip chip--${ty}`,
          'aria-pressed': 'false',
          title: tr(TYPE_LEGEND[ty].label),
          onclick: () => {
            if (types.has(ty)) types.delete(ty);
            else types.add(ty);
            chip.setAttribute('aria-pressed', String(types.has(ty)));
            render();
          },
        },
        h('span', { class: `badge badge--${ty}`, 'aria-hidden': 'true' }, ty),
        h('span', { class: 'chip__label' }, tr(TYPE_LEGEND[ty].label)),
      );
      return chip;
    });
    const areaSelect = showArea
      ? h(
          'label',
          { class: 'field field--inline' },
          h('span', { class: 'field__label' }, t('grid.areaFilter')),
          h(
            'select',
            {
              class: 'input',
              onchange: (e: Event) => {
                area = (e.target as HTMLSelectElement).value;
                render();
              },
            },
            h('option', { value: '' }, t('grid.allAreas')),
            AREAS.filter((a) => rows.some((c) => c.area === a.id)).map((a) => h('option', { value: a.id }, `${a.id} ${tr(a.title)}`)),
          ),
        )
      : null;
    return h(
      'div',
      { class: 'alv-toolbar' },
      h('div', { class: 'chips', role: 'group', 'aria-label': t('grid.typeFilter') }, typeChips),
      areaSelect,
    );
  }

  render();
  return h(
    'div',
    { class: 'alv-wrap' },
    h('h3', { class: 'visually-hidden', id: captionId }, caption),
    toolbar,
    h('div', { class: 'alv-scroll' }, table),
  );
};
