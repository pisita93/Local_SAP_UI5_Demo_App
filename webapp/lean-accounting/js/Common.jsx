// Common.jsx — shared helpers for the SAC kit
const { useState, useEffect, useRef, useLayoutEffect } = React;

// Lucide icon wrapper: React owns the <span>, we render the svg imperatively
// into it so React re-renders never collide with lucide's DOM replacement.
function Icon({ name, cls, style }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    el.appendChild(i);
    try { window.lucide.createIcons({ icons: window.lucide.icons }); } catch (e) {}
  });
  return <span className={"ic " + (cls || "")} ref={ref} style={style} />;
}

// tiny sparkline (svg polyline)
function Sparkline({ data, color, w = 150, h = 34 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = (max - min) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, { Icon, Sparkline });
