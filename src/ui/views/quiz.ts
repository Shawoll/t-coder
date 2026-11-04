import { QUIZ } from '../../data/quiz.ts';
import { otherLang, t, tr } from '../../i18n/index.ts';
import { h } from '../dom.ts';
import { button, codeLink, lead } from '../components/basics.ts';
import type { Screen } from '../shell.ts';

// Session-only position in the deck, so switching language keeps the card.
let order: number[] = QUIZ.map((_, i) => i);
let position = 0;
let revealed = false;

const shuffle = (): void => {
  order = [...order];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  position = 0;
  revealed = false;
};

export const quizView = (): Screen => {
  const card = h('div', { class: 'flashcard-wrap' });

  const render = (): void => {
    const item = QUIZ[order[position]!];
    if (!item) {
      card.replaceChildren();
      return;
    }
    const answerId = 'quiz-answer';
    card.replaceChildren(
      h(
        'article',
        { class: 'flashcard', 'aria-live': 'polite' },
        h('p', { class: 'flashcard__progress' }, t('quiz.progress', { n: position + 1, total: QUIZ.length })),
        h('h2', { class: 'flashcard__q' }, tr(item.question)),
        h('p', { class: 'muted', lang: otherLang() }, item.question[otherLang()]),
        h(
          'div',
          { class: 'flashcard__actions' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn--primary',
              'aria-expanded': String(revealed),
              'aria-controls': answerId,
              onclick: () => {
                revealed = !revealed;
                render();
              },
            },
            revealed ? t('quiz.hide') : t('quiz.reveal'),
          ),
        ),
        h(
          'div',
          { class: 'flashcard__answer', id: answerId, hidden: !revealed },
          h('h3', { class: 'subhead' }, t('quiz.answer')),
          h('p', null, tr(item.answer)),
          item.codes.length
            ? h('p', { class: 'code-row' }, h('span', { class: 'label' }, `${t('quiz.codes')}: `), item.codes.map((c) => codeLink(c)))
            : null,
        ),
      ),
      h(
        'div',
        { class: 'flashcard__nav' },
        button(t('quiz.prev'), () => step(-1), { iconName: 'chevronLeft' }),
        button(t('quiz.next'), () => step(1), { iconName: 'chevronRight', className: 'btn--icon-end' }),
      ),
    );
  };

  const step = (d: number): void => {
    position = (position + d + QUIZ.length) % QUIZ.length;
    revealed = false;
    render();
  };

  render();
  return {
    title: t('quiz.title'),
    transaction: 'SELF_TEST',
    appToolbar: [
      button(t('quiz.shuffle'), () => (shuffle(), render()), { iconName: 'quiz' }),
      button(t('quiz.restart'), () => ((position = 0), (revealed = false), render())),
    ],
    content: h('div', { class: 'stack' }, lead(t('quiz.lead')), card),
  };
};
