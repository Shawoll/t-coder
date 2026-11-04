import { t } from '../../i18n/index.ts';
import { h } from '../dom.ts';
import { icon } from '../icons.ts';
import type { Screen } from '../shell.ts';

export const notFoundView = (message: string, extra?: Node): Screen => ({
  title: t('notFound.title'),
  transaction: 'ERROR',
  content: h(
    'div',
    { class: 'stack' },
    h('p', { class: 'message message--E' }, icon('msgE'), h('span', null, message)),
    extra ?? null,
    h('p', null, h('a', { href: '#/' }, t('common.home'))),
  ),
});
