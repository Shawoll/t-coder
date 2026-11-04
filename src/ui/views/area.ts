import { AREAS, codesInArea, getArea } from '../../data/catalog.ts';
import { AREA_INFO } from '../../data/areas.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { h } from '../dom.ts';
import { alvGrid } from '../components/alvGrid.ts';
import { groupBox, lead, linkButton } from '../components/basics.ts';
import type { Screen } from '../shell.ts';
import { notFoundView } from './notFound.ts';

export const areaView = (id: string): Screen => {
  const area = getArea(id);
  const info = AREA_INFO[id];
  if (!area || !info) return notFoundView(t('area.notFound', { id }));
  const index = AREAS.indexOf(area);
  const prev = AREAS[index - 1];
  const next = AREAS[index + 1];
  return {
    title: `${area.id} ${tr(area.title)}`,
    transaction: `AREA_${area.id}`,
    appToolbar: [
      prev ? linkButton(`${prev.id} ${tr(AREA_INFO[prev.id]!.short)}`, `#/area/${prev.id}`, 'chevronLeft') : null,
      next ? linkButton(`${next.id} ${tr(AREA_INFO[next.id]!.short)}`, `#/area/${next.id}`, 'chevronRight') : null,
    ].filter((n): n is HTMLAnchorElement => n !== null),
    content: h(
      'div',
      { class: 'stack' },
      groupBox(t('area.intro'), [
        lead(tr(info.intro)),
        h('p', { class: 'muted', lang: otherLang() }, info.intro[otherLang()]),
      ]),
      groupBox(t('area.codes'), alvGrid(codesInArea(area.id), { caption: tr(area.title) })),
    ),
  };
};
