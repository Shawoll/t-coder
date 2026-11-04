import { PROCESSES, getProcess, type Process } from '../../data/processes.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { href } from '../../router.ts';
import { h } from '../dom.ts';
import { icon } from '../icons.ts';
import { groupBox, lead, linkButton } from '../components/basics.ts';
import { processFlow } from '../components/flow.ts';
import type { Screen } from '../shell.ts';
import { notFoundView } from './notFound.ts';

const processBody = (p: Process): Node[] => [
  h('p', { class: 'stages' }, h('span', { class: 'label' }, `${t('process.stages')}: `), tr(p.stages)),
  h('p', { class: 'muted small', lang: otherLang() }, p.stages[otherLang()]),
  processFlow(p.touchpoints, `${tr(p.title)}: ${t('process.flow')}`),
  p.note ? h('p', { class: 'message message--I' }, icon('msgI'), h('span', null, h('strong', null, `${t('process.note')}: `), tr(p.note))) : null,
].filter((n): n is HTMLElement => n !== null);

export const processesView = (): Screen => ({
  title: t('process.title'),
  transaction: 'PROCESS_MAPS',
  appToolbar: PROCESSES.map((p) => linkButton(p.short, href({ name: 'process', id: p.id }), 'flow')),
  content: h(
    'div',
    { class: 'stack' },
    lead(t('process.lead')),
    PROCESSES.map((p) => groupBox(h('a', { href: href({ name: 'process', id: p.id }) }, tr(p.title)), processBody(p))),
  ),
});

export const processView = (id: string): Screen => {
  const p = getProcess(id);
  if (!p) return notFoundView(t('process.notFound', { id }));
  return {
    title: tr(p.title),
    transaction: `PROCESS_${p.short.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
    appToolbar: PROCESSES.map((other) => {
      const a = linkButton(other.short, href({ name: 'process', id: other.id }), 'flow');
      if (other.id === p.id) a.setAttribute('aria-current', 'page');
      return a;
    }),
    content: h('div', { class: 'stack' }, groupBox(t('process.flow'), processBody(p))),
  };
};
