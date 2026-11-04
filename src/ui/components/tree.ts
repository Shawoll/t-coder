// An SAP-Easy-Access-style tree (WAI-ARIA tree pattern): tap or click to
// open folders, arrow keys to move, Enter to open a transaction.

import { h } from '../dom.ts';
import { icon, type IconName } from '../icons.ts';

export interface TreeNode {
  id: string;
  label: string;
  /** Monospace prefix, e.g. the T-code of a leaf. */
  code?: string;
  href?: string;
  iconName?: IconName;
  children?: TreeNode[];
  /** Shown inside an empty folder. */
  emptyText?: string;
}

const STORAGE_KEY = 'tcoder:tree';
const loadExpanded = (): Set<string> => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
};
const expanded = loadExpanded();
let firstVisit = expanded.size === 0;
const saveExpanded = (): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    /* storage unavailable */
  }
};

export const tree = (nodes: readonly TreeNode[], label: string, defaultOpen: readonly string[] = []): HTMLElement => {
  if (firstVisit) {
    defaultOpen.forEach((id) => expanded.add(id));
    firstVisit = false;
  }
  const root = h('ul', { class: 'tree', role: 'tree', 'aria-label': label });

  const renderNode = (node: TreeNode, level: number): HTMLElement => {
    const isFolder = node.children !== undefined;
    const open = isFolder && expanded.has(node.id);
    const li = h('li', {
      role: 'treeitem',
      class: `tree__item ${isFolder ? 'tree__item--folder' : 'tree__item--leaf'}`,
      'aria-level': level,
      tabindex: '-1',
      'data-id': node.id,
      'aria-expanded': isFolder ? String(open) : null,
    });
    const iconName: IconName = node.iconName ?? (isFolder ? (open ? 'folderOpen' : 'folder') : 'transaction');
    const content = [
      isFolder ? h('span', { class: 'tree__twisty', 'aria-hidden': 'true' }) : h('span', { class: 'tree__spacer', 'aria-hidden': 'true' }),
      icon(iconName),
      node.code ? h('span', { class: 'tree__code code' }, node.code) : null,
      h('span', { class: 'tree__label' }, node.label),
    ];
    const row =
      !isFolder && node.href
        ? h('a', { class: 'tree__row', href: node.href, tabindex: '-1' }, content)
        : h('div', { class: 'tree__row' }, content);
    li.append(row);
    if (isFolder) {
      const group = h('ul', { role: 'group', class: 'tree__group' });
      if (open) fillGroup(group, node, level);
      li.append(group);
    }
    return li;
  };

  const fillGroup = (group: HTMLElement, node: TreeNode, level: number): void => {
    const kids = node.children ?? [];
    group.replaceChildren(
      ...(kids.length
        ? kids.map((c) => renderNode(c, level + 1))
        : [h('li', { class: 'tree__empty', role: 'none' }, node.emptyText ?? '')]),
    );
  };

  const findNode = (id: string, list: readonly TreeNode[] = nodes): TreeNode | undefined => {
    for (const n of list) {
      if (n.id === id) return n;
      const found = n.children && findNode(id, n.children);
      if (found) return found;
    }
    return undefined;
  };

  const setOpen = (li: HTMLElement, open: boolean): void => {
    const node = findNode(li.dataset['id'] ?? '');
    if (!node?.children) return;
    const group = li.querySelector(':scope > .tree__group') as HTMLElement;
    if (open) {
      expanded.add(node.id);
      fillGroup(group, node, Number(li.getAttribute('aria-level')));
    } else {
      expanded.delete(node.id);
      group.replaceChildren();
    }
    li.setAttribute('aria-expanded', String(open));
    const svg = li.querySelector(':scope > .tree__row > .icon');
    svg?.replaceWith(icon(node.iconName ?? (open ? 'folderOpen' : 'folder')));
    saveExpanded();
  };

  // Closed folders hold no children in the DOM, so every rendered item is visible.
  const visibleItems = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[role="treeitem"]')];

  const focusItem = (li: HTMLElement | undefined): void => {
    if (!li) return;
    root.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((el) => (el.tabIndex = el === li ? 0 : -1));
    li.focus();
  };

  const activate = (li: HTMLElement): void => {
    if (li.hasAttribute('aria-expanded')) setOpen(li, li.getAttribute('aria-expanded') !== 'true');
    else li.querySelector<HTMLAnchorElement>(':scope > a.tree__row')?.click();
  };

  root.addEventListener('click', (e) => {
    const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
    if (!li || !root.contains(li)) return;
    if (li.hasAttribute('aria-expanded') && (e.target as Element).closest('.tree__row')) {
      setOpen(li, li.getAttribute('aria-expanded') !== 'true');
    }
    focusItem(li);
  });

  root.addEventListener('keydown', (e) => {
    const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
    if (!li) return;
    const items = visibleItems();
    const i = items.indexOf(li);
    const isOpen = li.getAttribute('aria-expanded') === 'true';
    switch (e.key) {
      case 'ArrowDown':
        focusItem(items[i + 1]);
        break;
      case 'ArrowUp':
        focusItem(items[i - 1]);
        break;
      case 'ArrowRight':
        if (li.hasAttribute('aria-expanded') && !isOpen) setOpen(li, true);
        else if (isOpen) focusItem(li.querySelector<HTMLElement>('[role="treeitem"]') ?? undefined);
        break;
      case 'ArrowLeft':
        if (isOpen) setOpen(li, false);
        else focusItem(li.parentElement?.closest<HTMLElement>('[role="treeitem"]') ?? undefined);
        break;
      case 'Home':
        focusItem(items[0]);
        break;
      case 'End':
        focusItem(items[items.length - 1]);
        break;
      case 'Enter':
      case ' ':
        activate(li);
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  root.append(...nodes.map((n) => renderNode(n, 1)));
  const first = root.querySelector<HTMLElement>('[role="treeitem"]');
  if (first) first.tabIndex = 0;
  return root;
};

/** Open or close every folder (used by the "Expand all" toolbar buttons). */
export const setAllFolders = (nodes: readonly TreeNode[], open: boolean): void => {
  const walk = (list: readonly TreeNode[]): void =>
    list.forEach((n) => {
      if (!n.children) return;
      if (open) expanded.add(n.id);
      else expanded.delete(n.id);
      walk(n.children);
    });
  walk(nodes);
  saveExpanded();
};
