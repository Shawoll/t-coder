import '@fontsource/arimo/latin-400.css';
import '@fontsource/arimo/latin-ext-400.css';
import '@fontsource/arimo/latin-700.css';
import '@fontsource/arimo/latin-ext-700.css';
import '@fontsource/cousine/latin-400.css';
import '@fontsource/cousine/latin-ext-400.css';
import '@fontsource/cousine/latin-700.css';
import '@fontsource/cousine/latin-ext-700.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './styles/components.css';
import './styles/views.css';

import { t } from './i18n/index.ts';
import { onRouteChange, parseHash, type Route } from './router.ts';
import { store } from './state.ts';
import { mountShell, showScreen, type Screen } from './ui/shell.ts';
import { clearStatus, status } from './ui/status.ts';
import { aboutView } from './ui/views/about.ts';
import { areaView } from './ui/views/area.ts';
import { favoritesView } from './ui/views/favorites.ts';
import { homeView } from './ui/views/home.ts';
import { notFoundView } from './ui/views/notFound.ts';
import { processesView, processView } from './ui/views/process.ts';
import { quizView } from './ui/views/quiz.ts';
import { referenceView } from './ui/views/reference.ts';
import { searchView } from './ui/views/search.ts';
import { tcodeView } from './ui/views/tcode.ts';
import { archetypeView, whisperView } from './ui/views/whisper.ts';

const render = (route: Route): Screen => {
  switch (route.name) {
    case 'home':
      return homeView();
    case 'area':
      return areaView(route.id);
    case 'tcode':
      return tcodeView(route.code);
    case 'search':
      return searchView(route.q);
    case 'whisper':
      return whisperView(route.q, route.area, route.symptom);
    case 'archetype':
      return archetypeView(route.id);
    case 'processes':
      return processesView();
    case 'process':
      return processView(route.id);
    case 'reference':
      return referenceView(route.tab);
    case 'quiz':
      return quizView();
    case 'favorites':
      return favoritesView();
    case 'about':
      return aboutView();
    case 'notFound':
      return notFoundView(t('notFound.text', { path: route.path }));
  }
};

const root = document.getElementById('app');
if (!root) throw new Error('#app is missing');
mountShell(root);

onRouteChange((route) => {
  clearStatus();
  showScreen(render(route), { isNavigation: true });
  if (route.name === 'notFound') status('E', t('status.screenMissing', { path: route.path }));
});

// Language and landscape changes re-render the current screen in place.
store.subscribe((_, key) => {
  if (key === 'lang' || key === 'landscape' || (key === 'favorites' && parseHash(location.hash).name === 'home')) {
    const main = document.querySelector('main');
    const scroll = main?.scrollTop ?? 0;
    showScreen(render(parseHash(location.hash)), { isNavigation: false });
    if (main) main.scrollTop = scroll;
  }
});

// Offline support (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void import('virtual:pwa-register').then(({ registerSW }) =>
    registerSW({
      immediate: true,
      onOfflineReady: () => status('S', t('status.offline')),
    }),
  );
}
