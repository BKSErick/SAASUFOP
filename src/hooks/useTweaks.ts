"use client";

/* =========================================================
   useTweaks — tema / densidade / paleta (localStorage)
   Port de _prototype/app.jsx (PALETTES) + tweaks-panel.jsx
   (useTweaks), sem o protocolo de host de prototipagem.
   ========================================================= */

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type Density = "compact" | "comfortable" | "spacious";
export type PaletteKey = "burgundy" | "forest" | "indigo" | "slate";

export interface Tweaks {
  theme: ThemeMode;
  density: Density;
  palette: PaletteKey;
}

export const TWEAK_DEFAULTS: Tweaks = {
  theme: "light",
  density: "comfortable",
  palette: "burgundy",
};

const STORAGE_KEY = "ufop-tweaks";

interface PaletteVars {
  accent: string;
  accentFg: string;
  accentSoft: string;
  accentSoftFg: string;
  accentLine: string;
}

const PALETTES: Record<PaletteKey, Record<ThemeMode, PaletteVars>> = {
  burgundy: {
    light: { accent: "oklch(0.43 0.13 22)", accentFg: "oklch(0.99 0.003 70)", accentSoft: "oklch(0.93 0.04 22)", accentSoftFg: "oklch(0.38 0.13 22)", accentLine: "oklch(0.86 0.06 22)" },
    dark: { accent: "oklch(0.66 0.16 22)", accentFg: "oklch(0.13 0.01 60)", accentSoft: "oklch(0.32 0.09 22)", accentSoftFg: "oklch(0.84 0.13 22)", accentLine: "oklch(0.4 0.11 22)" },
  },
  forest: {
    light: { accent: "oklch(0.4 0.1 155)", accentFg: "oklch(0.99 0.003 70)", accentSoft: "oklch(0.93 0.04 155)", accentSoftFg: "oklch(0.34 0.1 155)", accentLine: "oklch(0.84 0.06 155)" },
    dark: { accent: "oklch(0.66 0.13 155)", accentFg: "oklch(0.13 0.01 155)", accentSoft: "oklch(0.3 0.07 155)", accentSoftFg: "oklch(0.84 0.13 155)", accentLine: "oklch(0.4 0.08 155)" },
  },
  indigo: {
    light: { accent: "oklch(0.42 0.14 265)", accentFg: "oklch(0.99 0.003 70)", accentSoft: "oklch(0.93 0.05 265)", accentSoftFg: "oklch(0.36 0.14 265)", accentLine: "oklch(0.84 0.07 265)" },
    dark: { accent: "oklch(0.68 0.16 265)", accentFg: "oklch(0.13 0.01 265)", accentSoft: "oklch(0.3 0.08 265)", accentSoftFg: "oklch(0.84 0.13 265)", accentLine: "oklch(0.4 0.1 265)" },
  },
  slate: {
    light: { accent: "oklch(0.3 0.025 250)", accentFg: "oklch(0.99 0.003 70)", accentSoft: "oklch(0.93 0.015 250)", accentSoftFg: "oklch(0.3 0.025 250)", accentLine: "oklch(0.84 0.018 250)" },
    dark: { accent: "oklch(0.84 0.015 250)", accentFg: "oklch(0.13 0.01 250)", accentSoft: "oklch(0.3 0.013 250)", accentSoftFg: "oklch(0.92 0.015 250)", accentLine: "oklch(0.4 0.015 250)" },
  },
};

export const PALETTE_HEX: Record<PaletteKey, string> = {
  burgundy: "#8d2a3a",
  forest: "#2d6b4f",
  indigo: "#3b3d8f",
  slate: "#3a4452",
};

export const HEX_TO_PALETTE: Record<string, PaletteKey> = Object.fromEntries(
  Object.entries(PALETTE_HEX).map(([k, v]) => [v, k as PaletteKey]),
) as Record<string, PaletteKey>;

function applyTweaks(t: Tweaks) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = t.theme;
  root.dataset.density = t.density;
  const p = PALETTES[t.palette]?.[t.theme];
  if (p) {
    root.style.setProperty("--accent", p.accent);
    root.style.setProperty("--accent-fg", p.accentFg);
    root.style.setProperty("--accent-soft", p.accentSoft);
    root.style.setProperty("--accent-soft-fg", p.accentSoftFg);
    root.style.setProperty("--accent-line", p.accentLine);
  }
}

export function useTweaks(): [Tweaks, <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void] {
  const [tw, setTw] = useState<Tweaks>(TWEAK_DEFAULTS);

  // Hidrata do localStorage no client (após mount → evita mismatch SSR)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Tweaks>;
        // SSR-safe: localStorage só existe no client, então hidratamos
        // após mount. setState aqui é intencional (sync com external store).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTw((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Aplica no DOM + persiste sempre que muda
  useEffect(() => {
    applyTweaks(tw);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tw));
    } catch {
      /* ignore */
    }
  }, [tw]);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
      setTw((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return [tw, setTweak];
}

/** Script inline anti-FOUC: aplica theme/density/palette antes do React montar. */
export const themeInitScript = `
(function(){
  try {
    var raw = localStorage.getItem('${STORAGE_KEY}');
    var t = raw ? JSON.parse(raw) : ${JSON.stringify(TWEAK_DEFAULTS)};
    var r = document.documentElement;
    r.dataset.theme = t.theme || 'light';
    r.dataset.density = t.density || 'comfortable';
  } catch(e) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.density = 'comfortable';
  }
})();
`;
