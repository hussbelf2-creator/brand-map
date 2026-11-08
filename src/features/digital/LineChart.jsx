/* رسم خطي للقراءات (lineChart في لوحة المتابعة الأصلية): rs = [{at, v, note?}] */
import React from 'react';
import { fmtShort } from '../../engine/engine.js';

export function LineChart({ rs, color }) {
  const W = 320, H = 120, P = { l: 8, r: 8, t: 12, b: 22 };
  if (!rs.length) return <p className="empty" style={{ padding: '22px 0' }}>لا قراءات بعد</p>;
  const vs = rs.map((r) => +r.v); let mn = Math.min(...vs), mx = Math.max(...vs); if (mn === mx) { mn -= 1; mx += 1; } const pad = (mx - mn) * 0.15; mn -= pad; mx += pad;
  const t0 = rs[0].at, t1 = rs[rs.length - 1].at || t0 + 1;
  const X = (t) => P.l + (rs.length === 1 ? (W - P.l - P.r) / 2 : (t - t0) / Math.max(1, t1 - t0) * (W - P.l - P.r));
  const Y = (v) => P.t + (1 - (v - mn) / (mx - mn)) * (H - P.t - P.b);
  const pts = rs.map((r) => `${X(r.at).toFixed(1)},${Y(+r.v).toFixed(1)}`).join(' '); const last = rs[rs.length - 1];
  return (
    <svg className="lc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${rs.length} قراءات، آخرها ${last.v}`}>
      {[0, 0.5, 1].map((f) => <line key={f} className="gr" x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} />)}
      {rs.length > 1 ? <>
        <polygon fill={color} opacity=".12" points={`${X(t0)},${H - P.b} ${pts} ${X(t1)},${H - P.b}`} />
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
      </> : null}
      {rs.map((r, i) => (
        <circle key={i} cx={X(r.at)} cy={Y(+r.v)} r={i === rs.length - 1 ? 5 : 3} fill={i === rs.length - 1 ? color : 'var(--panel)'} stroke={color} strokeWidth="2">
          <title>{`${r.v} · ${fmtShort(r.at)}${r.note ? ' — ' + r.note : ''}`}</title>
        </circle>
      ))}
      <text x={P.l} y={H - 6} className="ax">{fmtShort(t0)}</text>
      {rs.length > 1 ? <text x={W - P.r} y={H - 6} textAnchor="end" className="ax">{fmtShort(t1)}</text> : null}
    </svg>
  );
}
