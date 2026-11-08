/* رسوم لوحة المتابعة: المؤشر الدائري، خط الاتجاه، منحنى القراءات، نقاط التأكد، خريطة التموضع (بالسحب) */
import React, { useRef, useState } from 'react';
import { S, RO, CL, fmtShort, compList, confOf } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { axFollows, posAxes, posSave } from './logic.js';

/** gauge(v,c) */
export function Gauge({ v, c }) {
  const L = 2 * Math.PI * 38;
  return (
    <div className="gauge">
      <svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="38" stroke="var(--line)" /><circle cx="46" cy="46" r="38" stroke={c} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - v / 100)} /></svg>
      <span className="t">{v}</span>
    </div>
  );
}

/** spark(n,ci): اتجاه نسبة التطبيق عبر المتابعات */
export function Spark({ n, ci }) {
  const f = axFollows(n).slice().reverse().filter((x) => x.pct != null);
  if (f.length < 2) return <p className="mini-note">{f.length ? 'سجّل متابعة ثانية لرؤية الاتجاه.' : 'لا متابعات بعد. أول متابعة تضع خط الأساس.'}</p>;
  const W = 300, H = 40, xs = (i) => 4 + i * (W - 12) / (f.length - 1), ys = (v) => H - 4 - (v / 100) * (H - 8);
  const pts = f.map((x, i) => `${xs(i).toFixed(1)},${ys(x.pct).toFixed(1)}`).join(' '); const last = f[f.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`تقدّم المحور عبر ${f.length} متابعات، آخرها ${last.pct}٪`}>
      <line className="gr" x1="0" x2={W} y1={ys(50)} y2={ys(50)} />
      <polygon className="ar" fill={ci} points={`${xs(0)},${H} ${pts} ${xs(f.length - 1)},${H}`} />
      <polyline className="ln" stroke={ci} points={pts} />
      <circle cx={xs(f.length - 1)} cy={ys(last.pct)} r="4" fill={ci} stroke="var(--panel)" strokeWidth="2" />
    </svg>
  );
}

/** lineChart(rs,color,good): قراءات مؤشر سوق عبر الزمن */
export function LineChart({ rs, color }) {
  const W = 320, H = 120, P = { l: 8, r: 8, t: 12, b: 22 };
  if (!rs.length) return <p className="empty" style={{ padding: '22px 0' }}>لا قراءات بعد</p>;
  const vs = rs.map((r) => +r.v); let mn = Math.min(...vs), mx = Math.max(...vs); if (mn === mx) { mn -= 1; mx += 1; } const pad = (mx - mn) * 0.15; mn -= pad; mx += pad;
  const t0 = rs[0].at, t1 = rs[rs.length - 1].at || t0 + 1;
  const X = (t) => P.l + (rs.length === 1 ? (W - P.l - P.r) / 2 : (t - t0) / Math.max(1, t1 - t0) * (W - P.l - P.r)), Y = (v) => P.t + (1 - (v - mn) / (mx - mn)) * (H - P.t - P.b);
  const pts = rs.map((r) => `${X(r.at).toFixed(1)},${Y(+r.v).toFixed(1)}`).join(' '); const last = rs[rs.length - 1];
  return (
    <svg className="lc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${rs.length} قراءات، آخرها ${last.v}`}>
      {[0, 0.5, 1].map((f) => <line key={f} className="gr" x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} />)}
      {rs.length > 1 ? <polygon fill={color} opacity=".12" points={`${X(t0)},${H - P.b} ${pts} ${X(t1)},${H - P.b}`} /> : null}
      {rs.length > 1 ? <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} /> : null}
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

/** confDots(id): خمس نقاط درجة التأكد */
export function ConfDots({ id }) {
  const c = confOf(id);
  return (
    <span className="cdots" title={c ? CL[c].t : 'بلا تأكد'}>
      {[1, 2, 3, 4, 5].map((i) => <i key={i} style={i <= c ? { background: CL[c].c } : undefined} />)}
    </span>
  );
}

const PW = 420, PH = 330, PP = 36;
const PX = (x) => PP + x / 10 * (PW - 2 * PP), PY = (y) => PH - PP - y / 10 * (PH - 2 * PP);
const dflt = (i) => ({ x: [3, 6.5, 2.5, 7.5, 4.5][i % 5], y: [3, 4, 6.5, 2.5, 7.5][i % 5] });

/** posMap() + bindPosMap(): خريطة التموضع، اسحبوا النقاط ويُحفظ الموقع لحظياً للجميع */
export function PosMap() {
  useEngine();
  const svg = useRef(null);
  const drag = useRef(null);
  const [dp, setDp] = useState(null); // {id,x,y} أثناء السحب
  const { xl, xh, yl, yh } = posAxes();
  const comps = compList(); const pos = (S && S.pos) || {};
  const items = [{ id: 'we', name: S.brand, c: '#D9A63A', we: true, p: pos.we || { x: 7.5, y: 7.5 } }, ...comps.map((c, i) => ({ id: c.id, name: c.name, c: ['#7A8896', '#D99A3A', '#D9534F'][c.risk - 1] || '#7A8896', p: pos[c.id] || dflt(i) }))];
  const toVal = (e) => {
    const el = svg.current; const pt = el.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(el.getScreenCTM().inverse());
    return { x: Math.max(0, Math.min(10, (p.x - PP) / (PW - 2 * PP) * 10)), y: Math.max(0, Math.min(10, (PH - PP - p.y) / (PH - 2 * PP) * 10)) };
  };
  const down = (e, id) => { if (RO) return; drag.current = { id }; try { svg.current.setPointerCapture(e.pointerId); } catch (x) { /* */ } e.preventDefault(); };
  const move = (e) => { if (!drag.current) return; const v = toVal(e); drag.current.v = v; setDp({ id: drag.current.id, ...v }); };
  const end = () => { const d = drag.current; drag.current = null; if (d && d.v) posSave(d.id, d.v.x, d.v.y); setDp(null); };
  const cancel = () => { drag.current = null; setDp(null); };
  return (
    <svg id="posMap" ref={svg} className="pm" viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label="خريطة التموضع" onPointerMove={move} onPointerUp={end} onPointerCancel={cancel}>
      <rect x={PP} y={PP} width={PW - 2 * PP} height={PH - 2 * PP} className="pmbg" />
      <line className="mid" x1={PW / 2} x2={PW / 2} y1={PP} y2={PH - PP} /><line className="mid" x1={PP} x2={PW - PP} y1={PH / 2} y2={PH / 2} />
      <text x={PP} y={PH - 14} className="ax">{'◀ ' + xl}</text><text x={PW - PP} y={PH - 14} className="ax" textAnchor="end">{xh + ' ▶'}</text>
      <text x={PP} y={PP - 10} className="ax">{'▲ ' + yh}</text><text x={PP + 6} y={PH - PP - 8} className="ax">{'▼ ' + yl}</text>
      {items.map((it) => {
        const p = dp && dp.id === it.id ? dp : it.p;
        return (
          <g key={it.id} className={'pt' + (it.we ? ' we' : '')} data-pt={it.id} transform={`translate(${PX(p.x)},${PY(p.y)})`} tabIndex={0} onPointerDown={(e) => down(e, it.id)}>
            <circle r={it.we ? 13 : 10} fill={it.c} /><text y={it.we ? -18 : -15} textAnchor="middle">{it.name}</text><title>{`${it.name} — اسحب لتغيير الموقع`}</title>
          </g>
        );
      })}
    </svg>
  );
}
