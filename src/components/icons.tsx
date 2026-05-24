/* =========================================================
   Icons — minimal stroke icons, no library
   Port tipado de _prototype/icons.jsx
   ========================================================= */
import type { CSSProperties, ReactElement } from "react";

export interface IconProps {
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}

function svgProps({ size = 16, color = "currentColor", stroke = 1.6, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export type IconName =
  | "home" | "docente" | "aluno" | "book" | "file" | "chart" | "calendar"
  | "flask" | "mic" | "plug" | "bell" | "search" | "upload" | "refresh"
  | "mail" | "out" | "chevron" | "plus" | "filter" | "dot" | "close"
  | "cmd" | "warn" | "check" | "clock" | "user" | "download" | "sparkles"
  | "arrowUp" | "arrowDown" | "dotsV" | "grid" | "list";

export const Ico: Record<IconName, (p?: IconProps) => ReactElement> = {
  home: (p = {}) => <svg {...svgProps(p)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>,
  docente: (p = {}) => <svg {...svgProps(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c.6-4 4-6 8-6s7.4 2 8 6" /></svg>,
  aluno: (p = {}) => <svg {...svgProps(p)}><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 11v5c0 1.5 2 3 5 3s5-1.5 5-3v-5" /></svg>,
  book: (p = {}) => <svg {...svgProps(p)}><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" /><path d="M4 17a3 3 0 0 1 3-3h12" /></svg>,
  file: (p = {}) => <svg {...svgProps(p)}><path d="M14 3H6v18h12V8z" /><path d="M14 3v5h4" /></svg>,
  chart: (p = {}) => <svg {...svgProps(p)}><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-5" /><path d="M12 16V8" /><path d="M16 16v-3" /></svg>,
  calendar: (p = {}) => <svg {...svgProps(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4M16 3v4" /></svg>,
  flask: (p = {}) => <svg {...svgProps(p)}><path d="M9 3h6" /><path d="M10 3v6L4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L14 9V3" /></svg>,
  mic: (p = {}) => <svg {...svgProps(p)}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>,
  plug: (p = {}) => <svg {...svgProps(p)}><path d="M9 7V3M15 7V3" /><path d="M6 7h12v5a6 6 0 0 1-12 0V7z" /><path d="M12 18v3" /></svg>,
  bell: (p = {}) => <svg {...svgProps(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>,
  search: (p = {}) => <svg {...svgProps(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></svg>,
  upload: (p = {}) => <svg {...svgProps(p)}><path d="M12 4v12" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>,
  refresh: (p = {}) => <svg {...svgProps(p)}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>,
  mail: (p = {}) => <svg {...svgProps(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  out: (p = {}) => <svg {...svgProps(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>,
  chevron: (p = {}) => <svg {...svgProps(p)}><path d="M9 6l6 6-6 6" /></svg>,
  plus: (p = {}) => <svg {...svgProps(p)}><path d="M12 5v14M5 12h14" /></svg>,
  filter: (p = {}) => <svg {...svgProps(p)}><path d="M3 5h18l-7 9v6l-4-2v-4z" /></svg>,
  dot: (p = {}) => <svg {...svgProps(p)}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></svg>,
  close: (p = {}) => <svg {...svgProps(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  cmd: (p = {}) => <svg {...svgProps(p)}><path d="M9 6H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6h-3v12a3 3 0 0 1-6 0V6z" /></svg>,
  warn: (p = {}) => <svg {...svgProps(p)}><path d="M10.3 3.9L2 19a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>,
  check: (p = {}) => <svg {...svgProps(p)}><path d="M5 12l5 5L20 7" /></svg>,
  clock: (p = {}) => <svg {...svgProps(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  user: (p = {}) => <svg {...svgProps(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c.6-4 4-6 8-6s7.4 2 8 6" /></svg>,
  download: (p = {}) => <svg {...svgProps(p)}><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>,
  sparkles: (p = {}) => <svg {...svgProps(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>,
  arrowUp: (p = {}) => <svg {...svgProps(p)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  arrowDown: (p = {}) => <svg {...svgProps(p)}><path d="M12 5v14M5 12l7 7 7-7" /></svg>,
  dotsV: (p = {}) => <svg {...svgProps(p)}><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" /></svg>,
  grid: (p = {}) => <svg {...svgProps(p)}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  list: (p = {}) => <svg {...svgProps(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
};
