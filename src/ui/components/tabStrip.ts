import { h, nextId } from '../dom.ts';

export interface Tab {
  id: string;
  label: string;
  render: () => Node;
}

/**
 * An accessible tab strip (WAI-ARIA tabs pattern) styled as SAP GUI tab
 * folders. Arrow keys move between tabs; Home/End jump to the ends.
 */
export const tabStrip = (tabs: readonly Tab[], initial: string, onChange?: (id: string) => void): HTMLElement => {
  const base = nextId('tabs');
  const list = h('div', { class: 'tabstrip__tabs', role: 'tablist' });
  const panel = h('div', { class: 'tabstrip__panel', role: 'tabpanel', tabindex: '0' });
  const buttons = tabs.map((tab) =>
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        class: 'tabstrip__tab',
        id: `${base}-${tab.id}`,
        'aria-controls': `${base}-panel`,
        onclick: () => select(tab.id, true),
      },
      tab.label,
    ),
  );
  panel.id = `${base}-panel`;
  list.append(...buttons);

  const select = (id: string, focus = false): void => {
    const index = Math.max(0, tabs.findIndex((t) => t.id === id));
    buttons.forEach((b, i) => {
      b.setAttribute('aria-selected', String(i === index));
      b.tabIndex = i === index ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', buttons[index]!.id);
    panel.replaceChildren(tabs[index]!.render());
    if (focus) buttons[index]!.focus();
    onChange?.(tabs[index]!.id);
  };

  list.addEventListener('keydown', (e) => {
    const current = buttons.findIndex((b) => b === document.activeElement);
    if (current === -1) return;
    const last = buttons.length - 1;
    const next =
      e.key === 'ArrowRight' ? (current === last ? 0 : current + 1)
      : e.key === 'ArrowLeft' ? (current === 0 ? last : current - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    if (next === -1) return;
    e.preventDefault();
    select(tabs[next]!.id, true);
  });

  select(initial);
  return h('div', { class: 'tabstrip' }, list, panel);
};
