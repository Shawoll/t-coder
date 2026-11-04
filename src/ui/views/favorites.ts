import { getCode } from '../../data/catalog.ts';
import { t } from '../../i18n/index.ts';
import { navigate } from '../../router.ts';
import { store } from '../../state.ts';
import type { TCode } from '../../types.ts';
import { h } from '../dom.ts';
import { alvGrid } from '../components/alvGrid.ts';
import { button, groupBox } from '../components/basics.ts';
import type { Screen } from '../shell.ts';
import { status } from '../status.ts';
import { codeList } from './home.ts';

const resolve = (codes: readonly string[]): TCode[] => codes.flatMap((c) => getCode(c) ?? []);

export const favoritesView = (): Screen => {
  const favorites = resolve(store.state.favorites);
  const recent = store.state.recent;
  const clear = (key: 'favorites' | 'recent') => () => {
    store.clear(key);
    status('S', t('status.cleared'));
    navigate({ name: 'favorites' }, { replace: true });
  };
  return {
    title: t('fav.title'),
    transaction: 'FAVORITES',
    appToolbar: [
      button(t('fav.clearFavorites'), clear('favorites'), { iconName: 'cancel' }),
      button(t('fav.clearRecent'), clear('recent'), { iconName: 'cancel' }),
    ],
    content: h(
      'div',
      { class: 'stack' },
      h('p', { class: 'muted' }, t('fav.local')),
      groupBox(
        t('fav.title'),
        favorites.length ? alvGrid(favorites, { caption: t('fav.title'), showArea: true, filters: false }) : h('p', { class: 'hint' }, t('fav.empty')),
      ),
      groupBox(t('fav.recent'), recent.length ? codeList(recent) : h('p', { class: 'hint' }, t('fav.recentEmpty'))),
    ),
  };
};
