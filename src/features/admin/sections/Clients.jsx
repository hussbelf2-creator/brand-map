/* العملاء والجلسات (admClients) */
import React from 'react';
import { N, N_Q, SUB_ST, ago, fmtDate, planById, subLive } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { ADM, admSet, need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Seg } from '../parts.jsx';
import { exportClients, openRecent, placedN } from '../logic.js';
import { openClient } from '../ClientDrawer.jsx';

const has = (q, arr) => !q || arr.join(' ').toLowerCase().includes(q);

export default function Clients() {
  useEngine();
  const { v: D, err } = useLoad(() => need('facilitators', 'sessions', 'subs', 'plans', 'blocked'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  const q = (ADM.q || '').trim().toLowerCase();
  const sub = (uid) => D.subs.find((s) => s.id === uid), blk = (uid) => D.blocked.some((b) => b.id === uid);
  const tabs = <Seg items={[['clients', 'العملاء'], ['sessions', 'كل الجلسات']]} val={ADM.ctab} onPick={(k) => admSet({ ctab: k })} />;
  const search = <input className="inp sm" id="admQ" placeholder="ابحث بالاسم أو البريد أو العلامة" value={ADM.q} onChange={(e) => admSet({ q: e.target.value })} style={{ maxWidth: 280 }} />;

  if (ADM.ctab === 'sessions') {
    const L = D.sessions.filter((s) => has(q, [s.brand, s.code, s.ownerName, s.team])).sort((a, b) => (b.updated || 0) - (a.updated || 0));
    return (
      <>
        <AdmHead t="العملاء والجلسات" sub={`${N(D.sessions.length)} جلسة على المنصة.`}>{search}{tabs}</AdmHead>
        <div className="atw"><table className="atable">
          <thead><tr><th>العلامة</th><th>الرمز</th><th>المنشّط</th><th>الوضع</th><th>التقدّم</th><th>الحالة</th><th>آخر نشاط</th><th></th></tr></thead>
          <tbody>{L.length ? L.map((s) => {
            const n = placedN(s);
            return (
              <tr key={s.code || s.id}>
                <td><b>{s.brand || ''}</b><small>{s.team || ''}</small></td>
                <td><span className="codechip">{s.code}</span></td>
                <td>{s.ownerName || s.facilitator || '—'}</td>
                <td>{s.cfg && s.cfg.mode === 'physical' ? 'فيزيائي' : 'رقمي'}</td>
                <td><span className="pg"><i style={{ width: Math.round(n / N_Q * 100) + '%' }} /></span> <small className="num">{n}/{N_Q}</small></td>
                <td>{s.done ? <span className="stpill ok">لوحة متابعة</span> : <span className="stpill warn">جارية</span>}</td>
                <td className="num">{s.updated ? ago(s.updated) : '—'}</td>
                <td><button className="btn sm" onClick={() => openRecent(s.code)}>فتح</button></td>
              </tr>
            );
          }) : <tr><td colSpan={8} className="empty">لا نتائج.</td></tr>}</tbody>
        </table></div>
      </>
    );
  }

  const L = D.facilitators.filter((f) => has(q, [f.name, f.email, f.org, f.phone])).sort((a, b) => (b.upd || b.at || 0) - (a.upd || a.at || 0));
  return (
    <>
      <AdmHead t="العملاء والجلسات" sub={`${N(D.facilitators.length)} حساباً مسجّلاً. اضغط أي عميل لإدارة اشتراكه وجلساته.`}>
        {search}{tabs}<button className="btn sm" onClick={exportClients}><Icon name="download" /> تصدير CSV</button>
      </AdmHead>
      <div className="atw"><table className="atable">
        <thead><tr><th>العميل</th><th>التواصل</th><th>الدور</th><th>الباقة</th><th>الجلسات</th><th>التسجيل</th><th></th></tr></thead>
        <tbody>{L.length ? L.map((f) => {
          const s = sub(f.id), p = s && planById(s.plan), my = D.sessions.filter((x) => x.owner === f.id);
          const st = s ? (subLive(s) ? SUB_ST[s.st] || SUB_ST.active : SUB_ST.expired) : null;
          return (
            <tr key={f.id} className="clk" onClick={() => openClient(f.id)}>
              <td><b>{f.name || '—'}</b><small>{f.org || ''}{f.city ? ' · ' + f.city : ''}</small></td>
              <td><small dir="ltr">{f.email || ''}</small><small dir="ltr">{f.phone || ''}</small></td>
              <td>{f.role || ''}</td>
              <td>{p ? <>{p.name} <span className={'stpill ' + st[1]}>{st[0]}</span></> : <span className="mini-note">بلا باقة</span>}{blk(f.id) ? <> <span className="stpill bad">موقوف</span></> : null}</td>
              <td className="num">{N(my.length)}<small>{N(my.filter((x) => x.done).length)} مكتملة</small></td>
              <td className="num">{fmtDate(f.at)}</td>
              <td><Icon name="chevron-left" /></td>
            </tr>
          );
        }) : <tr><td colSpan={7} className="empty">لا عملاء بعد.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
