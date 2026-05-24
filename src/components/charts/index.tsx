"use client";

/* =========================================================
   Charts — sparkline, donut, stacked bars, hbars, funnel
   Pure SVG, sem deps. Port tipado de _prototype/charts.jsx
   ========================================================= */
import { useMemo } from "react";

// ----- Sparkline -----
export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
  points?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = "currentColor",
  fill = "none",
  lineWidth = 1.5,
  points = false,
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data?.length) return { d: "", ys: [] as number[], stepX: 0 };
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1 || 1);
    const ys = data.map((v) => height - ((v - min) / range) * (height - 4) - 2);
    let d = `M0 ${ys[0]}`;
    for (let i = 1; i < ys.length; i++) d += ` L${i * stepX} ${ys[i]}`;
    return { d, ys, stepX };
  }, [data, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {fill !== "none" && <path d={`${path.d} L${width} ${height} L0 ${height} Z`} fill={fill} opacity="0.18" />}
      <path d={path.d} fill="none" stroke={stroke} strokeWidth={lineWidth} strokeLinejoin="round" strokeLinecap="round" />
      {points && path.ys.length > 0 && (
        <circle cx={(data.length - 1) * path.stepX} cy={path.ys[path.ys.length - 1]} r={2.5} fill={stroke} />
      )}
    </svg>
  );
}

// ----- Donut -----
export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}
export interface DonutProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  gap?: number;
  label?: string;
}

export function Donut({ data, size = 140, thickness = 16, gap = 0.012, label }: DonutProps) {
  const rawTotal = data.reduce((s, d) => s + d.value, 0);
  const total = rawTotal || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  // Offset cumulativo precomputado de forma funcional (sem mutação)
  const segments = data.map((d, i) => ({
    ...d,
    startOffset: data.slice(0, i).reduce((s, x) => s + x.value / total, 0),
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--inset)" strokeWidth={thickness} />
          {segments.map((d, i) => {
            const len = (d.value / total) * circ - gap * circ;
            const dasharray = `${len} ${circ - len}`;
            const dashoffset = -d.startOffset * circ;
            return (
              <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={dasharray} strokeDashoffset={dashoffset} strokeLinecap="butt" />
            );
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="mono tabular" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{data.reduce((s, d) => s + d.value, 0)}</div>
          {label && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{label}</div>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", width: "100%" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "block" }} />
            <span style={{ color: "var(--fg-2)", flex: 1 }}>{d.label}</span>
            <span className="mono tabular" style={{ color: "var(--muted)" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- StackedBars -----
export interface StackedBarsProps {
  series: Record<string, number | string>[];
  width?: number;
  height?: number;
  keys: string[];
  colors: string[];
}

export function StackedBars({ series, width = 600, height = 200, keys, colors }: StackedBarsProps) {
  const totals = series.map((s) => keys.reduce((sum, k) => sum + (Number(s[k]) || 0), 0));
  const max = Math.max(...totals, 1);
  const barW = (width / series.length) * 0.62;
  const stepX = width / series.length;
  const padL = 8;
  const innerH = height - 28;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((g, i) => (
        <line key={i} x1={padL} x2={width - 4} y1={innerH - innerH * g} y2={innerH - innerH * g} stroke="var(--grid-line)" strokeDasharray="2 4" />
      ))}
      {series.map((s, i) => {
        let acc = 0;
        const x = i * stepX + (stepX - barW) / 2;
        return (
          <g key={i}>
            {keys.map((k, ki) => {
              const v = Number(s[k]) || 0;
              const h = (v / max) * innerH;
              const y = innerH - acc - h;
              acc += h;
              return <rect key={k} x={x} y={y} width={barW} height={h} fill={colors[ki]} rx={ki === keys.length - 1 ? 3 : 0} />;
            })}
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{String(s.m)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ----- HBars -----
export interface HBarDatum {
  label: string;
  value: number;
}
export interface HBarsProps {
  data: HBarDatum[];
  max?: number;
  height?: number;
  color?: string;
}

export function HBars({ data, max, height = 8, color = "var(--accent)" }: HBarsProps) {
  const m = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "var(--fg-2)" }}>{d.label}</span>
            <span className="mono tabular" style={{ color: "var(--muted)" }}>{d.value}</span>
          </div>
          <div style={{ height, background: "var(--inset)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / m) * 100}%`, height: "100%", background: color, borderRadius: 100 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- Funnel -----
export interface FunnelStage {
  label: string;
  value: number;
}

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.value || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const drop = i > 0 ? Math.round((s.value / stages[i - 1].value) * 100) : 100;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 500 }}>{s.label}</span>
              <span style={{ display: "flex", gap: 10 }}>
                <span className="mono tabular" style={{ color: "var(--fg)", fontWeight: 500 }}>{s.value}</span>
                <span className="mono tabular" style={{ color: "var(--muted)", fontSize: 11 }}>{drop}%</span>
              </span>
            </div>
            <div style={{ height: 28, background: `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${pct}%, var(--inset) ${pct}%, var(--inset) 100%)`, borderRadius: 6, opacity: 0.95 - i * 0.08 }} />
          </div>
        );
      })}
    </div>
  );
}
