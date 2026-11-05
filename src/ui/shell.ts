// The window chrome of a classic SAP GUI session: title bar, menu bar,
// system toolbar with the command field, screen title, application toolbar,
// content area and status bar.

import { CODES, catalog, getCode } from '../data/catalog.ts';
import { SYSTEM } from '../config.ts';
import { parseCommand, typeahead } from '../engine/command.ts';
import { lang, t, tr, type MessageKey } from '../i18n/index.ts';
import { codeHref, href, navigate } from '../router.ts';
import { store } from '../state.ts';
import type { Landscape, Lang } from '../types.ts';
import { h, nextId } from './dom.ts';
import { icon, type IconName } from './icons.ts';
import { clearStatus, copyText, mountStatus, status } from './status.ts';

export interface Screen {
  title: string;
  /** Monospace code shown before the title (T-code screens). */
  titleCode?: string;
  /** Shown in the status bar's transaction segment (the code, or a screen ID). */
  transaction: string;
  /** The code on screen, if any: drives ★ and "Copy /n command". */
  code?: string;
  appToolbar?: Node[];
  content: Node;
}

// ─────────────────────────────────────────────────────────── menu model
type MenuItem =
  | { kind: 'link'; label: () => string; href: string }
  | { kind: 'action'; label: () => string; run: () => void; checked?: () => boolean }
  | { kind: 'separator' };

interface Menu {
  key: MessageKey;
  items: MenuItem[];
}

let currentCode: string | undefined;

const setLang = (l: Lang): void => {
  store.setLang(l);
  status('S', t('status.lang'));
};
const setLandscape = (l: Landscape): void => {
  store.setLandscape(l);
  status('S', t('status.landscape', { name: t(`landscape.${l}`) }));
};

const copyCommand = (): void => {
  if (currentCode) void copyText(`/n${currentCode}`);
  else status('W', t('status.noCopyTarget'));
};

const MENUS: Menu[] = [
  {
    key: 'menu.menu',
    items: [
      { kind: 'link', label: () => t('nav.home'), href: '#/' },
      { kind: 'link', label: () => t('nav.whisper'), href: '#/whisper' },
      { kind: 'link', label: () => t('nav.search'), href: '#/search' },
      { kind: 'link', label: () => t('nav.favorites'), href: '#/fav' },
    ],
  },
  {
    key: 'menu.edit',
    items: [
      { kind: 'action', label: () => t('menu.copyCommand'), run: copyCommand },
      { kind: 'separator' },
      { kind: 'action', label: () => t('menu.clearHistory'), run: () => (store.clear('history'), status('S', t('status.cleared'))) },
      { kind: 'action', label: () => t('menu.clearRecent'), run: () => (store.clear('recent'), status('S', t('status.cleared'))) },
    ],
  },
  {
    key: 'menu.goto',
    items: [
      { kind: 'link', label: () => t('nav.processes'), href: '#/process' },
      { kind: 'link', label: () => t('whisper.playbooks'), href: '#/whisper' },
      { kind: 'link', label: () => t('nav.reference'), href: '#/ref/legend' },
      { kind: 'link', label: () => t('nav.quiz'), href: '#/quiz' },
    ],
  },
  {
    key: 'menu.system',
    items: [
      { kind: 'action', label: () => 'Slovenčina', run: () => setLang('sk'), checked: () => lang() === 'sk' },
      { kind: 'action', label: () => 'English', run: () => setLang('en'), checked: () => lang() === 'en' },
      { kind: 'separator' },
      ...(['ecc', 's4', 'btp'] as const).map(
        (l): MenuItem => ({
          kind: 'action',
          label: () => `${t('whisper.landscape')}: ${t(`landscape.${l}`)}`,
          run: () => setLandscape(l),
          checked: () => store.state.landscape === l,
        }),
      ),
      { kind: 'separator' },
      {
        kind: 'action',
        label: () => t('menu.status'),
        run: () => status('I', t('status.system', { version: SYSTEM.version, codes: CODES.length, edition: catalog.source.edition })),
      },
    ],
  },
  {
    key: 'menu.help',
    items: [
      { kind: 'link', label: () => t('menu.cheatSheet'), href: '#/ref/legend' },
      { kind: 'link', label: () => t('menu.howWhisper'), href: '#/about' },
      { kind: 'link', label: () => t('nav.about'), href: '#/about' },
    ],
  },
];

/** A disclosure menu: a button that opens a panel of links and actions. */
const menuWidget = (menus: Menu[], label: () => string, className: string): HTMLElement => {
  const panelId = nextId('menu');
  const btn = h('button', { type: 'button', class: 'menubar__btn', 'aria-expanded': 'false', 'aria-controls': panelId });
  const panel = h('div', { class: 'menu__panel', id: panelId, hidden: true });
  const wrap = h('div', { class: `menu ${className}` }, btn, panel);

  const items = (): HTMLElement[] => [...panel.querySelectorAll<HTMLElement>('a, button')];
  const close = (focusButton = false): void => {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (focusButton) btn.focus();
  };
  const renderPanel = (): void => {
    panel.replaceChildren(
      ...menus.map((m) =>
        h(
          'div',
          { class: 'menu__group' },
          menus.length > 1 ? h('p', { class: 'menu__heading' }, t(m.key)) : null,
          m.items.map((item) => {
            if (item.kind === 'separator') return h('hr', { class: 'menu__sep' });
            if (item.kind === 'link') {
              return h('a', { class: 'menu__item', href: item.href, onclick: () => close() }, item.label());
            }
            const checked = item.checked?.();
            return h(
              'button',
              {
                type: 'button',
                class: 'menu__item',
                'aria-pressed': checked === undefined ? null : String(checked),
                onclick: () => {
                  close();
                  item.run();
                },
              },
              item.label(),
            );
          }),
        ),
      ),
    );
  };

  btn.addEventListener('click', () => {
    const open = panel.hidden;
    document.querySelectorAll<HTMLElement>('.menu__panel').forEach((p) => (p.hidden = true));
    document.querySelectorAll('.menubar__btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (open) {
      renderPanel();
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      items()[0]?.focus();
    }
  });
  wrap.addEventListener('keydown', (e) => {
    if (panel.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
    list[next]?.focus();
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target as Node)) close();
  });
  wrap.addEventListener('focusout', (e) => {
    if (!wrap.contains(e.relatedTarget as Node | null) && e.relatedTarget) close();
  });

  (wrap as HTMLElement & { relabel?: () => void }).relabel = () => {
    btn.replaceChildren(className === 'menu--compact' ? icon('menu') : '', h('span', null, label()));
  };
  return wrap;
};

// ─────────────────────────────────────────────────────────── toolbar
const toolButton = (iconName: IconName, labelKey: MessageKey, onClick: () => void, extra: Record<string, string> = {}): HTMLButtonElement => {
  const b = h('button', { type: 'button', class: 'tool', onclick: onClick, ...extra }, icon(iconName), h('span', { class: 'visually-hidden' }));
  (b as HTMLButtonElement & { labelKey?: MessageKey }).labelKey = labelKey;
  return b;
};

let fromCommandField = false;
let firstRender = true;

const executeCommand = (raw: string, input: HTMLInputElement): void => {
  const cmd = parseCommand(raw);
  if (cmd.kind !== 'empty') store.addHistory(raw.trim());
  const base = location.href.split('#')[0];
  switch (cmd.kind) {
    case 'empty':
      return;
    case 'home':
      fromCommandField = true;
      navigate({ name: 'home' });
      break;
    case 'newSession':
      window.open(`${base}#/`, '_blank', 'noopener');
      status('S', t('status.newSession', { target: t('nav.home') }));
      break;
    case 'open':
      if (cmd.newSession) {
        window.open(`${base}${codeHref(cmd.code)}`, '_blank', 'noopener');
        status('S', t('status.newSession', { target: cmd.code }));
      } else {
        fromCommandField = true;
        navigate(codeHref(cmd.code));
      }
      break;
    case 'unknown':
      status(
        'E',
        t('status.unknown', { code: cmd.code }),
        [
          ...cmd.suggestions.map((s) => ({ label: s, href: codeHref(s) })),
          { label: t('status.searchInstead', { q: cmd.code }), href: href({ name: 'search', q: cmd.code }) },
        ],
        cmd.suggestions.length ? `${t('status.didYouMean')}:` : undefined,
      );
      input.select();
      return;
    case 'search':
      fromCommandField = true;
      navigate({ name: 'search', q: cmd.query });
      break;
    case 'logoff':
      status('W', t('status.logoff'));
      break;
    case 'debug':
      status('I', t('status.debug'));
      break;
  }
  input.value = '';
};

// ─────────────────────────────────────────────────────────── shell
interface ShellRefs {
  title: HTMLElement;
  commandInput: HTMLInputElement;
  appToolbar: HTMLElement;
  main: HTMLElement;
  tx: HTMLElement;
  langSeg: HTMLElement;
  fav: HTMLButtonElement;
  relabel: () => void;
}

let refs: ShellRefs | undefined;

export const mountShell = (root: HTMLElement): void => {
  // Title bar (with the compact menu for small screens).
  const compactMenu = menuWidget(MENUS, () => t('menu.menu'), 'menu--compact');
  const titleBar = h(
    'header',
    { class: 'titlebar' },
    compactMenu,
    h('span', { class: 'titlebar__mark', 'aria-hidden': 'true' }, 'T'),
    h('span', { class: 'titlebar__title' }, 'T-Coder'),
    h('span', { class: 'titlebar__tagline' }),
  );

  // Menu bar (desktop).
  const menus = MENUS.map((m) => menuWidget([m], () => t(m.key), 'menu--bar'));
  const menuBar = h('nav', { class: 'menubar', 'aria-label': t('menu.menu') }, menus);

  // System toolbar.
  const inputId = nextId('cmd');
  const historyId = nextId('cmd-history');
  const suggestId = nextId('cmd-suggest');
  // The field is a WAI-ARIA combobox: typing a code opens a listbox of matching
  // T-codes. Focus stays in the field; aria-activedescendant points at the row.
  const input = h('input', {
    id: inputId,
    class: 'command__input',
    type: 'text',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': suggestId,
    autocomplete: 'off',
    autocapitalize: 'characters',
    spellcheck: 'false',
    enterkeyhint: 'go',
    'aria-describedby': historyId,
  });
  const historyList = h('div', { class: 'command__history', id: historyId, hidden: true, role: 'group' });
  const historyBtn = h(
    'button',
    { type: 'button', class: 'tool tool--history', 'aria-expanded': 'false', 'aria-controls': historyId },
    icon('history'),
    h('span', { class: 'visually-hidden' }),
  );
  const closeHistory = (): void => {
    historyList.hidden = true;
    historyBtn.setAttribute('aria-expanded', 'false');
  };

  // Type-ahead listbox.
  const suggestList = h('ul', { class: 'command__suggest', id: suggestId, role: 'listbox', hidden: true });
  let suggestions: string[] = [];
  let active = -1;
  const setActive = (i: number): void => {
    active = i;
    const rows = [...suggestList.children];
    rows.forEach((row, j) => row.setAttribute('aria-selected', String(j === i)));
    const row = rows[i];
    if (row) {
      input.setAttribute('aria-activedescendant', row.id);
      row.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };
  const closeSuggest = (): void => {
    suggestList.hidden = true;
    suggestList.replaceChildren();
    suggestions = [];
    setActive(-1);
    input.setAttribute('aria-expanded', 'false');
  };
  /** Run the chosen code, keeping a typed /n or /o (so /oVA0 → /oVA01 opens a new session). */
  const pick = (code: string): void => {
    const prefix = /^\s*(\/[no])/i.exec(input.value)?.[1] ?? '';
    closeSuggest();
    input.value = `${prefix}${code}`;
    executeCommand(input.value, input);
  };
  const openSuggest = (): void => {
    suggestions = typeahead(input.value);
    if (!suggestions.length) return closeSuggest();
    closeHistory();
    suggestList.replaceChildren(
      ...suggestions.map((code, i) =>
        h(
          'li',
          {
            id: `${suggestId}-${i}`,
            class: 'command__option',
            role: 'option',
            'aria-selected': 'false',
            // Keep focus (and the on-screen keyboard) in the field while clicking a row.
            onmousedown: (e: Event) => e.preventDefault(),
            onclick: () => pick(code),
          },
          h('span', { class: 'command__option-code' }, code),
          h('span', { class: 'command__option-text' }, tr(getCode(code)!.purpose)),
        ),
      ),
    );
    setActive(-1);
    suggestList.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  input.addEventListener('input', openSuggest);
  input.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    const open = !suggestList.hidden;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!open) openSuggest();
      const n = suggestions.length;
      if (!n) return;
      e.preventDefault();
      setActive(e.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1);
    } else if (e.key === 'Enter') {
      const code = open ? suggestions[active] : undefined;
      if (code) {
        e.preventDefault();
        pick(code);
      }
      // Without an active row the form submits and runs the input as typed.
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      closeSuggest();
    } else if (e.key === 'Tab') {
      closeSuggest();
    }
  });

  historyBtn.addEventListener('click', () => {
    if (!historyList.hidden) return closeHistory();
    closeSuggest();
    const entries = store.state.history;
    historyList.replaceChildren(
      ...(entries.length
        ? entries.map((e) =>
            h(
              'button',
              {
                type: 'button',
                class: 'command__entry',
                onclick: () => {
                  closeHistory();
                  input.value = e;
                  executeCommand(e, input);
                },
              },
              e,
            ),
          )
        : [h('p', { class: 'command__empty' }, t('cmd.historyEmpty'))]),
    );
    historyList.hidden = false;
    historyBtn.setAttribute('aria-expanded', 'true');
    historyList.querySelector<HTMLElement>('button')?.focus();
  });
  historyList.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeHistory();
      historyBtn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!historyList.contains(e.target as Node) && !historyBtn.contains(e.target as Node)) closeHistory();
  });
  const field = h('div', { class: 'command__field' }, input, historyBtn, historyList, suggestList);
  document.addEventListener('click', (e) => {
    if (!field.contains(e.target as Node)) closeSuggest();
  });
  field.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !field.contains(e.relatedTarget as Node)) closeSuggest();
  });

  const commandLabel = h('label', { class: 'visually-hidden', for: inputId });
  const form = h(
    'form',
    {
      class: 'command',
      role: 'search',
      onsubmit: (e: Event) => {
        e.preventDefault();
        closeSuggest();
        executeCommand(input.value, input);
      },
    },
    commandLabel,
    h('button', { type: 'submit', class: 'tool tool--enter' }, icon('check'), h('span', { class: 'visually-hidden' })),
    field,
  );

  const fav = toolButton('starOutline', 'tb.favorite', () => {
    if (!currentCode) return status('W', t('status.noFavTarget'));
    const on = store.toggleFavorite(currentCode);
    status('S', t(on ? 'status.favAdded' : 'status.favRemoved', { code: currentCode }));
  });
  fav.setAttribute('aria-pressed', 'false');

  const langButtons = (['sk', 'en'] as const).map((l) =>
    h('button', { type: 'button', class: 'seg__btn', lang: l, onclick: () => setLang(l) }, l.toUpperCase()),
  );
  const langSwitch = h('div', { class: 'seg', role: 'group' }, langButtons);

  const tools = h(
    'div',
    { class: 'toolbar__tools' },
    h('span', { class: 'toolbar__sep', 'aria-hidden': 'true' }),
    toolButton('back', 'tb.back', () => history.back()),
    toolButton('exit', 'tb.exit', () => navigate({ name: 'home' })),
    toolButton('cancel', 'tb.cancel', () => {
      input.value = '';
      clearStatus();
      navigate({ name: 'home' });
    }),
    h('span', { class: 'toolbar__sep', 'aria-hidden': 'true' }),
    fav,
    toolButton('search', 'tb.search', () => navigate({ name: 'search', q: '' })),
    toolButton('whisper', 'tb.whisper', () => navigate({ name: 'whisper', q: '' })),
    h('span', { class: 'toolbar__sep', 'aria-hidden': 'true' }),
    langSwitch,
  );
  const toolbar = h('div', { class: 'toolbar' }, form, tools);

  // Screen header, content, status bar.
  const title = h('h1', { class: 'screen__title', tabindex: '-1' });
  const appToolbar = h('div', { class: 'apptoolbar' });
  const main = h('main', { class: 'screen', id: 'content' }, h('div', { class: 'screen__head' }, title, appToolbar));
  const message = h('div', { class: 'status__message', role: 'status', 'aria-live': 'polite' });
  mountStatus(message);
  const tx = h('span', { class: 'status__seg status__seg--tx' });
  const langSeg = h('span', { class: 'status__seg' });
  const statusBar = h(
    'footer',
    { class: 'statusbar' },
    message,
    h('span', { class: 'status__seg' }, `${SYSTEM.id} (${SYSTEM.client})`),
    tx,
    langSeg,
  );

  const skip = h('a', { class: 'skip', href: '#content', onclick: (e: Event) => (e.preventDefault(), title.focus()) });

  root.replaceChildren(skip, h('div', { class: 'window' }, titleBar, menuBar, toolbar, main, statusBar));

  // Keyboard: Ctrl+/ jumps to the command field, as in SAP GUI.
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  const relabel = (): void => {
    skip.textContent = t('app.skip');
    titleBar.querySelector('.titlebar__tagline')!.textContent = t('app.tagline');
    menuBar.setAttribute('aria-label', t('menu.menu'));
    [compactMenu, ...menus].forEach((m) => (m as HTMLElement & { relabel?: () => void }).relabel?.());
    commandLabel.textContent = t('cmd.label');
    input.placeholder = t('cmd.placeholder');
    suggestList.setAttribute('aria-label', t('cmd.suggestions'));
    form.querySelector('.tool--enter .visually-hidden')!.textContent = t('tb.enter');
    historyBtn.querySelector('.visually-hidden')!.textContent = t('tb.history');
    historyBtn.title = t('tb.history');
    toolbar.querySelectorAll<HTMLButtonElement & { labelKey?: MessageKey }>('.tool').forEach((b) => {
      if (!b.labelKey) return;
      b.title = t(b.labelKey);
      b.querySelector('.visually-hidden')!.textContent = t(b.labelKey);
    });
    langSwitch.setAttribute('aria-label', t('tb.lang'));
    langButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.lang === lang())));
    tx.title = t('status.transaction.label');
    langSeg.textContent = lang().toUpperCase();
    updateFavorite();
  };

  refs = { title, commandInput: input, appToolbar, main, tx, langSeg, fav, relabel };
  relabel();
  store.subscribe((_, key) => {
    if (key === 'lang' || key === 'favorites') relabel();
  });
};

const updateFavorite = (): void => {
  if (!refs) return;
  const on = !!currentCode && store.isFavorite(currentCode);
  refs.fav.setAttribute('aria-pressed', String(on));
  refs.fav.querySelector('.icon')?.replaceWith(icon(on ? 'star' : 'starOutline'));
  const key: MessageKey = on ? 'tb.unfavorite' : 'tb.favorite';
  refs.fav.title = t(key);
  refs.fav.querySelector('.visually-hidden')!.textContent = t(key);
};

/** Render a screen into the window. `isNavigation` moves focus to the title. */
export const showScreen = (screen: Screen, { isNavigation }: { isNavigation: boolean }): void => {
  if (!refs) throw new Error('mountShell() must run first');
  currentCode = screen.code;
  refs.title.replaceChildren(
    screen.titleCode ? h('span', { class: 'screen__code code' }, screen.titleCode) : '',
    h('span', null, screen.title),
  );
  refs.appToolbar.replaceChildren(...(screen.appToolbar ?? []));
  refs.appToolbar.hidden = !screen.appToolbar?.length;
  const body = refs.main.querySelector('.screen__body');
  const next = h('div', { class: 'screen__body' }, screen.content, h('p', { class: 'screen__footer' }, t('disclaimer')));
  if (body) body.replaceWith(next);
  else refs.main.append(next);
  refs.tx.textContent = screen.transaction;
  document.title = `${screen.titleCode ? `${screen.titleCode} ` : ''}${screen.title} – T-Coder`;
  document.documentElement.lang = lang();
  updateFavorite();
  if (isNavigation) {
    refs.main.scrollTop = 0;
    window.scrollTo(0, 0);
    if (!fromCommandField) refs.commandInput.value = '';
    // Keep the cursor in the command field after a command (SAP habit); otherwise
    // move focus to the new screen title so screen readers announce it.
    if (fromCommandField || firstRender) fromCommandField = false;
    else refs.title.focus({ preventScroll: true });
    firstRender = false;
  }
};
