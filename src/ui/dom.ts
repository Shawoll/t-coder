// A tiny hyperscript helper. Text is always set as text nodes, never parsed as
// HTML, so catalog content and user input cannot inject markup.

type Child = Node | string | number | false | null | undefined | Child[];
type Attrs = Record<string, string | number | boolean | EventListener | null | undefined>;

const append = (el: Element | DocumentFragment, child: Child): void => {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) child.forEach((c) => append(el, c));
  else el.append(child instanceof Node ? child : String(child));
};

/**
 * h('a', { href: '#/', class: 'link', onclick: fn }, 'text', child)
 * Attributes starting with "on" become event listeners; `true` sets an empty
 * attribute, `false`/null/undefined omit it.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K];
export function h(tag: string, attrs?: Attrs | null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }
  children.forEach((c) => append(el, c));
  return el;
}

export const fragment = (...children: Child[]): DocumentFragment => {
  const f = document.createDocumentFragment();
  children.forEach((c) => append(f, c));
  return f;
};

export const clear = (el: Element): void => el.replaceChildren();

let uid = 0;
/** Unique ids for aria-labelledby / aria-controls pairs. */
export const nextId = (prefix: string): string => `${prefix}-${++uid}`;
