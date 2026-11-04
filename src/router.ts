// Hash routing: every view has a deep link and works from any static host.

export type Route =
  | { name: 'home' }
  | { name: 'area'; id: string }
  | { name: 'tcode'; code: string }
  | { name: 'search'; q: string }
  | { name: 'whisper'; q: string; area?: string; symptom?: string }
  | { name: 'archetype'; id: string }
  | { name: 'processes' }
  | { name: 'process'; id: string }
  | { name: 'reference'; tab: string }
  | { name: 'quiz' }
  | { name: 'favorites' }
  | { name: 'about' }
  | { name: 'notFound'; path: string };

const decode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Parse a location hash such as "#/t/%2FSCWM%2FMON" or "#/search?q=se16". */
export const parseHash = (hash: string): Route => {
  const raw = hash.replace(/^#/, '');
  const qIndex = raw.indexOf('?');
  const path = (qIndex === -1 ? raw : raw.slice(0, qIndex)).replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(qIndex === -1 ? '' : raw.slice(qIndex + 1));
  const parts = path.split('/').filter(Boolean);
  const [head, arg] = [parts[0], parts.length > 1 ? decode(parts.slice(1).join('/')) : undefined];

  switch (head) {
    case undefined:
      return { name: 'home' };
    case 'area':
      return arg ? { name: 'area', id: arg } : { name: 'home' };
    case 't':
      return arg ? { name: 'tcode', code: arg } : { name: 'home' };
    case 'search':
      return { name: 'search', q: params.get('q') ?? '' };
    case 'whisper': {
      if (arg) return { name: 'archetype', id: arg };
      const r: Route = { name: 'whisper', q: params.get('q') ?? '' };
      const area = params.get('area');
      const symptom = params.get('symptom');
      if (area) r.area = area;
      if (symptom) r.symptom = symptom;
      return r;
    }
    case 'process':
      return arg ? { name: 'process', id: arg } : { name: 'processes' };
    case 'ref':
      return { name: 'reference', tab: arg ?? 'legend' };
    case 'quiz':
      return { name: 'quiz' };
    case 'fav':
      return { name: 'favorites' };
    case 'about':
      return { name: 'about' };
    default:
      return { name: 'notFound', path };
  }
};

const query = (params: Record<string, string | undefined>): string => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
};

/** Build the hash for a route; the inverse of parseHash. */
export const href = (route: Route): string => {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'area':
      return `#/area/${route.id}`;
    case 'tcode':
      return `#/t/${encodeURIComponent(route.code)}`;
    case 'search':
      return `#/search${query({ q: route.q })}`;
    case 'whisper':
      return `#/whisper${query({ q: route.q, area: route.area, symptom: route.symptom })}`;
    case 'archetype':
      return `#/whisper/${encodeURIComponent(route.id)}`;
    case 'processes':
      return '#/process';
    case 'process':
      return `#/process/${route.id}`;
    case 'reference':
      return `#/ref/${route.tab}`;
    case 'quiz':
      return '#/quiz';
    case 'favorites':
      return '#/fav';
    case 'about':
      return '#/about';
    case 'notFound':
      return `#${route.path}`;
  }
};

export const codeHref = (code: string): string => href({ name: 'tcode', code });

export const navigate = (route: Route | string, { replace = false } = {}): void => {
  const target = typeof route === 'string' ? route : href(route);
  if (replace) {
    history.replaceState(null, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = target;
  }
};

export const onRouteChange = (fn: (route: Route) => void): void => {
  const fire = () => fn(parseHash(location.hash));
  window.addEventListener('hashchange', fire);
  fire();
};
