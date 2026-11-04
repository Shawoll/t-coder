// Status-bar messages, SAP style: S (success), W (warning), E (error),
// I (information). The message area is an aria-live region.

import { t } from '../i18n/index.ts';
import { h } from './dom.ts';
import { icon } from './icons.ts';

export type MessageType = 'S' | 'W' | 'E' | 'I';

export interface StatusAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

let region: HTMLElement | undefined;

export const mountStatus = (el: HTMLElement): void => {
  region = el;
};

export const clearStatus = (): void => {
  region?.replaceChildren();
  region?.removeAttribute('data-type');
};

export const status = (type: MessageType, text: string, actions: StatusAction[] = [], prefix?: string): void => {
  if (!region) return;
  region.dataset['type'] = type;
  const iconName = type === 'S' ? 'msgS' : type === 'W' ? 'msgW' : type === 'E' ? 'msgE' : 'msgI';
  region.replaceChildren(
    icon(iconName, t(`status.messageType.${type}`)),
    h('span', { class: 'status__text' }, text),
    ...(actions.length
      ? [h(
          'span',
          { class: 'status__actions' },
          prefix ? h('span', { class: 'status__prefix' }, prefix) : null,
          actions.map((a) =>
            a.href
              ? h('a', { class: 'status__action', href: a.href, onclick: () => a.onClick?.() }, a.label)
              : h('button', { type: 'button', class: 'status__action', onclick: () => a.onClick?.() }, a.label),
          ),
        )]
      : []),
  );
};

/** Copy text and report the result in the status bar. */
export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    status('S', t('status.copied', { text }));
  } catch {
    status('W', t('status.copyFailed'));
  }
};
