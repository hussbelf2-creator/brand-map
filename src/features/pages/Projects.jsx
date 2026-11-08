/* شاشة «مشاريعي» (حافظة المشاريع) — renderProjects/projShell الأصليتان */
import React, { useEffect, useState } from 'react';
import { PROFILE, STAGES, LOGO, N_Q, TRACKS, whoName, ago, fmtShort } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { go } from '../../nav.js';
import { loadProjects, projMetrics, openProj, newProj, joinProj, daysTo } from './logic.js';

/** مؤشر دائري (gauge في لوحة المتابعة) */
function Gauge({ v, c }) {
  const L = 2 * Math.PI * 38;
  return <div className="gauge"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="38" stroke="var(--line)" /><circle cx="46" cy="46" r="38" stroke={c} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - v / 100)} /></svg><span className="t">{v}</span></div>;
}
const hcol = (v) => (v >= 70 ? 'var(--ok)' : v >= 45 ? 'var(--warn)' : 'var(--danger)');

function ProjShell({ children }) {
  return (
    <>
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="dband"><div className="wrap">
        <div className="db-top"><span className="brandmk"><img src={LOGO} alt="" /><span>براند ماب<small>BRAND MAP</small></span></span>
          <span className="db-acts"><button className="btn sm dk" onClick={() => go('start')}><Icon name="house" /> البداية</button><button className="btn sm dk" onClick={joinProj}><Icon name="log-in" /> انضم لمشروع</button><button className="btn sm gold" onClick={newProj}><Icon name="plus" /> مشروع جديد</button></span></div>
        <div className="db-main" style={{ paddingBottom: 26 }}><div><div className="eyebrow">حافظة المشاريع</div><h1>مشاريعي</h1>
          <div className="db-sub">{PROFILE ? <span><b>{PROFILE.name}</b> · {PROFILE.org || ''}</span> : <span>{whoName()}</span>}<span>كل علامة لها طاولتها ولوحتها وصفحاتها ومتابعتها المستقلة.</span></div></div></div>
      </div></header>
      <main className="wrap dbody">{children}</main>
    </>
  );
}

const K = (l, v, s) => <div className="kp" key={l}><span className="l">{l}</span><span className="v">{v}</span><span className="s">{s}</span></div>;

export function ProjBody({ rows }) {
  const late = rows.flatMap((x) => x.m.lateTasks).sort((a, b) => a.due - b.due);
  return (
    <>
      <div className="kps">
        {K('المشاريع', rows.length, `${rows.filter((x) => x.p.role === 'owner').length} أنشأتها`)}
        {K('جلسات جارية', rows.filter((x) => !x.m.done).length, 'على الطاولة')}
        {K('لوحات متابعة', rows.filter((x) => x.m.done).length, 'بعد إنهاء الجلسة')}
        {K('صفحات معتمدة', <>{rows.reduce((a, x) => a + x.m.pages, 0)}<small>/{rows.length * 11}</small></>, 'عبر كل المشاريع')}
        {K('مهام تحتاج تدخّلاً', <span style={{ color: late.length ? 'var(--danger)' : 'inherit' }}>{late.length}</span>, 'متأخرة أو تغيّرت بطاقتها')}
        {K('مراجعات محاور متأخرة', rows.reduce((a, x) => a + x.m.late, 0), 'حسب دورة كل مشروع')}
      </div>
      {rows.length
        ? <div className="projs">{rows.map(({ p, m }) => {
          const need = m.tasks.overdue + m.tasks.stale;
          return (
            <article key={p.code} className="proj">
              <div className="ph"><div style={{ minWidth: 0 }}><h3>{p.doc.brand}</h3><small><span className="codechip">{p.code}</span> {p.role === 'owner' ? 'أنت المنشّط' : 'عضو في الطاولة'}{p.doc.ownerName && p.role !== 'owner' ? ' · المنشّط ' + p.doc.ownerName : ''}</small></div><Gauge v={m.health} c={hcol(m.health)} /></div>
              <div className="pm2">
                <div><span className="l">الحالة</span><b>{m.done ? 'لوحة متابعة' : 'جلسة جارية'}</b><small>{m.n}/{N_Q} قراراً</small></div>
                <div><span className="l">الصفحات</span><b className="num">{m.pages}/11</b><small>معتمدة</small></div>
                <div><span className="l">المهام</span><b className="num">{m.tasks.done}/{m.tasks.all}</b><small>{need ? <span className="od">{need} تحتاج تدخّلاً</span> : 'منجزة'}</small></div>
                <div><span className="l">المراجعة</span><b>{m.done ? (daysTo(m.next) < 0 ? 'متأخرة' : 'بعد ' + daysTo(m.next) + ' يوم') : '—'}</b><small>آخر نشاط {ago(m.upd)}</small></div>
              </div>
              <div className="pa2"><button className="btn sm" onClick={() => openProj(p.code, 'play')}><Icon name="orbit" /> الطاولة</button><button className="btn sm pri" onClick={() => openProj(p.code, 'dash')}><Icon name="layout-dashboard" /> لوحة المتابعة</button></div>
            </article>
          );
        })}</div>
        : <div className="pn"><div className="emptyst"><Icon name="layout-grid" /><b>لا مشاريع بعد</b><p>أنشئ جلستك الأولى أو انضم لجلسة برمزها، وستظهر هنا مع كل مشروع لاحق.</p><button className="btn pri" onClick={newProj}><Icon name="plus" /> مشروع جديد</button></div></div>}
      {late.length
        ? <Panel title={<><Icon name="triangle-alert" /> ما يحتاج تدخّلك عبر المشاريع</>} sub="مهام متخصصة متأخرة، أو تغيّرت بطاقاتها بعد إنجازها.">
          <div className="feed">{late.slice(0, 20).map((t) => (
            <button key={t.code + '|' + t.id} className="fi lt" onClick={() => openProj(t.code, 'tracks')} style={{ '--ci': TRACKS[t.track].c }}>
              <span className="dot" /><div style={{ minWidth: 0 }}><p><b>{t.brand}</b> · {TRACKS[t.track].n}{t.who ? ' · ' + t.who : ''}</p><p className="t">{t.t}{t.stale ? ' — تغيّرت البطاقة بعد الإنجاز' : ''}</p></div><time>{fmtShort(t.due)}</time>
            </button>
          ))}</div>
        </Panel>
        : null}
    </>
  );
}

export default function Projects() {
  useEngine();
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let alive = true;
    loadProjects().then((list) => { if (alive) setRows(list.map((p) => ({ p, m: projMetrics(p.doc) })).filter((x) => x.m)); }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, []);
  return (
    <section id="v-projects">
      <ProjShell>{rows == null ? <div className="pn"><p className="empty">يحمّل مشاريعك…</p></div> : <ProjBody rows={rows} />}</ProjShell>
    </section>
  );
}
