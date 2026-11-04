import { CODES } from '../../data/catalog.ts';
import { searchCodes } from '../../engine/search.ts';
import { whisper } from '../../engine/whisper.ts';
import { t } from '../../i18n/index.ts';
import { href, navigate } from '../../router.ts';
import { store } from '../../state.ts';
import { h, nextId } from '../dom.ts';
import { alvGrid } from '../components/alvGrid.ts';
import { groupBox } from '../components/basics.ts';
import type { Screen } from '../shell.ts';
import { hitCard, whisperLine } from './whisperParts.ts';

export const searchForm = (q: string, onSubmit: (q: string) => void, labelText: string, placeholder: string, buttonText: string): HTMLElement => {
  const id = nextId('q');
  const input = h('input', { id, class: 'input input--wide', type: 'search', value: q, placeholder, enterkeyhint: 'search', autocomplete: 'off' });
  return h(
    'form',
    {
      class: 'inline-form',
      role: 'search',
      onsubmit: (e: Event) => {
        e.preventDefault();
        onSubmit(input.value.trim());
      },
    },
    h('label', { class: 'visually-hidden', for: id }, labelText),
    h('div', { class: 'inline-form__row' }, input, h('button', { type: 'submit', class: 'btn btn--primary' }, buttonText)),
  );
};

export const searchView = (q: string): Screen => {
  const form = searchForm(q, (next) => navigate({ name: 'search', q: next }), t('search.label'), t('search.placeholder'), t('search.button'));
  const body: (Node | null)[] = [groupBox(t('search.title'), form)];

  if (!q) {
    body.push(h('p', { class: 'hint' }, t('search.empty')));
    body.push(groupBox(t('search.allCodes', { n: CODES.length }), alvGrid(CODES, { caption: t('search.allCodes', { n: CODES.length }), showArea: true })));
  } else {
    const hits = searchCodes(q, { limit: 100 });
    const w = whisper(q, { landscape: store.state.landscape, limit: 3 });
    if (w.hits.length) {
      body.push(
        groupBox(t('search.whisperSuggests'), [
          whisperLine(w.ranking),
          ...w.hits.slice(0, 2).map((hit) => hitCard(hit, { compact: true })),
          h('p', null, h('a', { href: href({ name: 'whisper', q }) }, `${t('nav.whisper')}: “${q}”`)),
        ], { className: 'group--whisper' }),
      );
    }
    body.push(
      hits.length
        ? groupBox(
            t('search.results', { n: hits.length, q }),
            alvGrid(hits.map((x) => x.code), { caption: t('search.results', { n: hits.length, q }), showArea: true, initialSort: 'none' }),
          )
        : h('p', { class: 'message message--W' }, t('search.none', { q })),
    );
  }
  return {
    title: t('search.title'),
    transaction: 'SEARCH_SAP_MENU',
    content: h('div', { class: 'stack' }, body),
  };
};
