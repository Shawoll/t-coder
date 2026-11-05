import { AUTHOR, SYSTEM } from '../../config.ts';
import { CODE_COUNTS, catalog } from '../../data/catalog.ts';
import { t } from '../../i18n/index.ts';
import { h } from '../dom.ts';
import { groupBox, lead } from '../components/basics.ts';
import type { Screen } from '../shell.ts';

export const aboutView = (): Screen => {
  const links = [
    AUTHOR.repository && { href: AUTHOR.repository, label: t('about.repository') },
    AUTHOR.linkedin && { href: AUTHOR.linkedin, label: t('about.linkedin') },
    AUTHOR.contact && { href: AUTHOR.contact, label: t('about.contact') },
  ].filter((l): l is { href: string; label: string } => !!l);

  return {
    title: t('about.title'),
    transaction: 'ABOUT',
    content: h(
      'div',
      { class: 'stack' },
      lead(t('about.lead', CODE_COUNTS)),
      h(
        'div',
        { class: 'grid-2' },
        groupBox(t('about.how'), h('p', null, t('about.howText'))),
        groupBox(t('whisper.how'), h('p', null, t('whisper.howText'))),
        groupBox(t('ref.provenance'), [
          h('p', null, t('ref.provenanceText', CODE_COUNTS)),
          h('p', { class: 'muted' }, `${catalog.source.title}, ${catalog.source.edition}. T-Coder ${SYSTEM.version}.`),
        ]),
        groupBox(t('about.author'), [
          h('p', null, AUTHOR.name),
          links.length
            ? h('ul', { class: 'link-list' }, links.map((l) => h('li', null, h('a', { href: l.href, rel: 'noopener', target: l.href.startsWith('http') ? '_blank' : null }, l.label))))
            : null,
        ]),
      ),
      groupBox(t('about.disclaimerTitle'), h('p', null, t('disclaimer'))),
    ),
  };
};
