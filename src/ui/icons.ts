// Original 16×16 icons drawn for T-Coder in the spirit of late-90s desktop
// toolbars. No SAP icon assets are used.

const SVG_NS = 'http://www.w3.org/2000/svg';

type Shape = [tag: string, attrs: Record<string, string | number>];

const ICONS = {
  // Green "Enter" check on a rounded square.
  check: [
    ['rect', { x: 1.5, y: 1.5, width: 13, height: 13, rx: 2.5, fill: '#3f9b46', stroke: '#1f5e25' }],
    ['path', { d: 'M4.3 8.3l2.4 2.4 5-5.4', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }],
  ],
  // Back: green disc with a left arrow.
  back: [
    ['circle', { cx: 8, cy: 8, r: 6.5, fill: '#3f9b46', stroke: '#1f5e25' }],
    ['path', { d: 'M11.5 8H5.2M7.8 5.2L5 8l2.8 2.8', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }],
  ],
  // Exit: yellow disc with an up arrow.
  exit: [
    ['circle', { cx: 8, cy: 8, r: 6.5, fill: '#f2c230', stroke: '#9a7408' }],
    ['path', { d: 'M8 11.6V5M5.2 7.6L8 4.8l2.8 2.8', fill: 'none', stroke: '#5a4300', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }],
  ],
  // Cancel: red disc with a cross.
  cancel: [
    ['circle', { cx: 8, cy: 8, r: 6.5, fill: '#d9443a', stroke: '#8c1d16' }],
    ['path', { d: 'M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }],
  ],
  star: [['path', { d: 'M8 1.6l1.95 4 4.4.6-3.2 3.05.78 4.35L8 11.5l-3.93 2.1.78-4.35L1.65 6.2l4.4-.6z', fill: '#f2c230', stroke: '#9a7408', 'stroke-linejoin': 'round' }]],
  starOutline: [['path', { d: 'M8 1.6l1.95 4 4.4.6-3.2 3.05.78 4.35L8 11.5l-3.93 2.1.78-4.35L1.65 6.2l4.4-.6z', fill: 'none', stroke: '#5a6b80', 'stroke-linejoin': 'round' }]],
  folder: [
    ['path', { d: 'M1.5 4.2V13h13V5.6H7.6L6.2 4.2z', fill: '#e8c25a', stroke: '#8a6a12', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M1.5 6.4h13', stroke: '#8a6a12', 'stroke-opacity': 0.5 }],
  ],
  folderOpen: [
    ['path', { d: 'M1.5 4.2V13h11l2-6H4l-1.8 5', fill: 'none', stroke: '#8a6a12', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M1.5 13V4.2h4.7l1.4 1.4h5.4V7H4l-2.5 6z', fill: '#e8c25a', stroke: '#8a6a12', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M4 7h10.5l-2 6h-11z', fill: '#f5d77e', stroke: '#8a6a12', 'stroke-linejoin': 'round' }],
  ],
  // A transaction leaf: small window with a title bar.
  transaction: [
    ['rect', { x: 2, y: 2.5, width: 12, height: 11, fill: '#fff', stroke: '#4d6480' }],
    ['rect', { x: 2, y: 2.5, width: 12, height: 3, fill: '#2f67a6' }],
    ['path', { d: 'M4 8h6M4 10.5h4', stroke: '#8496ad' }],
  ],
  search: [
    ['circle', { cx: 6.6, cy: 6.6, r: 4.2, fill: '#dbe9f7', stroke: '#2f4a6b', 'stroke-width': 1.5 }],
    ['path', { d: 'M9.8 9.8l4 4', stroke: '#2f4a6b', 'stroke-width': 2.2, 'stroke-linecap': 'round' }],
  ],
  // Whisper: a speech bubble with three dots.
  whisper: [
    ['path', { d: 'M2 3.5h12v7.5H7.5L4.5 13.6V11H2z', fill: '#fff8d6', stroke: '#8a6a12', 'stroke-linejoin': 'round' }],
    ['circle', { cx: 5.3, cy: 7.2, r: 0.9, fill: '#5a4300' }],
    ['circle', { cx: 8, cy: 7.2, r: 0.9, fill: '#5a4300' }],
    ['circle', { cx: 10.7, cy: 7.2, r: 0.9, fill: '#5a4300' }],
  ],
  copy: [
    ['rect', { x: 5, y: 5, width: 8.5, height: 9, fill: '#fff', stroke: '#4d6480' }],
    ['path', { d: 'M3 11V2.5h7.5', fill: 'none', stroke: '#4d6480' }],
  ],
  history: [['path', { d: 'M4 6.5l4 4 4-4', fill: 'none', stroke: '#2f4a6b', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }]],
  chevronRight: [['path', { d: 'M6 3.5L10.5 8 6 12.5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }]],
  chevronLeft: [['path', { d: 'M10 3.5L5.5 8l4.5 4.5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }]],
  // Status-bar message types.
  msgS: [
    ['rect', { x: 1.5, y: 1.5, width: 13, height: 13, rx: 2, fill: '#3f9b46', stroke: '#1f5e25' }],
    ['path', { d: 'M4.5 8.3l2.2 2.2 4.6-5', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }],
  ],
  msgW: [
    ['path', { d: 'M8 1.8l6.6 11.7H1.4z', fill: '#f2c230', stroke: '#9a7408', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M8 6v3.6', stroke: '#3d2d00', 'stroke-width': 1.7, 'stroke-linecap': 'round' }],
    ['circle', { cx: 8, cy: 11.6, r: 0.95, fill: '#3d2d00' }],
  ],
  msgE: [
    ['path', { d: 'M5.3 1.5h5.4l3.8 3.8v5.4l-3.8 3.8H5.3l-3.8-3.8V5.3z', fill: '#d9443a', stroke: '#8c1d16', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4', stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round' }],
  ],
  msgI: [
    ['circle', { cx: 8, cy: 8, r: 6.5, fill: '#2f67a6', stroke: '#173a63' }],
    ['path', { d: 'M8 7.2v4.3', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round' }],
    ['circle', { cx: 8, cy: 4.9, r: 1, fill: '#fff' }],
  ],
  menu: [['path', { d: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }]],
  flow: [
    ['path', { d: 'M1.5 4h8l3 4-3 4h-8l3-4z', fill: '#dbe9f7', stroke: '#2f4a6b', 'stroke-linejoin': 'round' }],
  ],
  book: [
    ['path', { d: 'M2 3h5a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 007 12.5H2zM14 3H9.5A1.5 1.5 0 008 4.5V14a1.5 1.5 0 011.5-1.5H14z', fill: '#fff', stroke: '#4d6480', 'stroke-linejoin': 'round' }],
  ],
  quiz: [
    ['rect', { x: 2, y: 2, width: 12, height: 12, rx: 1.5, fill: '#fff', stroke: '#4d6480' }],
    ['path', { d: 'M6 6.2a2 2 0 113 1.7c-.7.4-1 .8-1 1.6M8 11.5v.1', fill: 'none', stroke: '#2f67a6', 'stroke-width': 1.6, 'stroke-linecap': 'round' }],
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

/** An inline SVG icon. Decorative (aria-hidden) unless a label is given. */
export const icon = (name: IconName, label?: string, size = 16): SVGSVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('class', 'icon');
  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  svg.setAttribute('focusable', 'false');
  for (const [tag, attrs] of ICONS[name] as Shape[]) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    svg.append(el);
  }
  return svg;
};
