/* ================= إدارة المنصة: المستشارون وطلبات الحجز ================= */
import React, { useEffect, useState } from 'react';
import { LOCAL, CAP, LS, CONS, CSPEC, DAYS, BK_KIND, BK_ST, CONS_ROLE, AR, cspecT, fmtWhen, loadConsultants, newId, whoName } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openDrawer, toast, DrawerHead } from '../../ui/overlays.jsx';

/** يعتمد مستشاراً أو يوقفه (ينشئ ملفه من حساب المنشّط إن لم يوجد) */
export async function approveCons(uid, on) {
  try {
    if (on) {
      const ex = (CONS || []).find((c) => c.id === uid);
      if (!ex && !LOCAL && CAP.db) {
        const f = await CAP.db.doc('facilitators/' + uid).get(); const p = f && f.exists ? f.data() : {};
        await CAP.db.doc('consultants/' + uid).set({ name: p.name || 'مستشار', title: 'مستشار براند ماب', bio: '', spec: [], avail: { days: [0, 1, 2, 3, 4], from: '16:00', to: '21:00' }, at: Date.now() });
      }
      if (!LOCAL && CAP.db) await CAP.db.doc('capprove/' + uid).set({ ok: true, at: Date.now(), by: whoName() });
      else { const L = LS.get('bm3:cons') || []; const x = L.find((y) => y.id === uid); if (x) x.ok = true; LS.set('bm3:cons', L); }
    } else {
      if (!LOCAL && CAP.db) await CAP.db.doc('capprove/' + uid).set({ ok: false, at: Date.now(), by: whoName() });
      else { const L = LS.get('bm3:cons') || []; const x = L.find((y) => y.id === uid); if (x) x.ok = false; LS.set('bm3:cons', L); }
    }
    toast(on ? 'اعتُمد المستشار ويظهر للعملاء الآن.' : 'أوقف المستشار.');
    return true;
  } catch (e) { toast('تعذّر التحديث. تأكد أنك مالك المنصة.', 'err'); return false; }
}

/** يضيف مستشاراً يدوياً (بلا حساب) ويعتمده */
async function addConsultant(v) {
  const n = v.name.trim(); if (!n) return false;
  const id = 'm_' + newId();
  const doc = { name: n, title: v.title.trim(), bio: v.bio.trim(), spec: CSPEC.map(([k]) => k).filter((k) => v.spec.includes(k)), avail: { days: DAYS.map((d, i) => i).filter((i) => v.days.includes(i)), from: v.from || '16:00', to: v.to || '21:00' }, manual: true, at: Date.now() };
  try {
    if (!LOCAL && CAP.db) { await CAP.db.doc('consultants/' + id).set(doc); await CAP.db.doc('capprove/' + id).set({ ok: true, at: Date.now(), by: whoName() }); }
    else { const L = LS.get('bm3:cons') || []; L.push({ ...doc, id, ok: true }); LS.set('bm3:cons', L); }
    toast('أُضيف المستشار واعتُمد.'); return true;
  } catch (x) { toast('تعذّرت الإضافة. تأكد أنك مالك المنصة.', 'err'); return false; }
}

/** يجمع كل طلبات الحجز من صناديق المستشارين وصندوق الفريق */
async function loadAllBookings() {
  const ids = ['team', ...(CONS || []).map((c) => c.id)]; const all = [];
  for (const id of ids) {
    try {
      if (LOCAL || !CAP.db) { Object.entries(LS.get('bm3:cbook') || {}).forEach(([k, b]) => { if (b.cid === id) all.push({ id: k, ...b }); }); continue; }
      const qs = await CAP.db.collection('cbook/' + id + '/items').limit(200).get(); qs.docs.forEach((d) => all.push({ id: d.id, ...d.data() }));
    } catch (e) { /* */ }
  }
  all.sort((a, b) => (a.st === 'new' ? 0 : 1) - (b.st === 'new' ? 0 : 1) || a.when - b.when);
  return all;
}

/** طلبات الاعتماد: منشّطون سجّلوا بدور المستشار ولم يُعتمدوا بعد */
async function loadPending() {
  let pend = [];
  if (!LOCAL && CAP.db) {
    try { const f = await CAP.db.collection('facilitators').limit(300).get(); pend = f.docs.map((d) => ({ ...d.data(), uid: d.id })).filter((x) => x && x.role === CONS_ROLE && !(CONS || []).some((c) => c.id === x.uid && c.ok)); } catch (e) { /* */ }
  }
  return pend;
}

function AddForm({ onDone }) {
  const [v, setV] = useState({ name: '', title: '', bio: '', spec: [], days: [0, 1, 2, 3, 4], from: '16:00', to: '21:00' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const tog = (k, x) => setV({ ...v, [k]: v[k].includes(x) ? v[k].filter((y) => y !== x) : [...v[k], x] });
  const submit = async (e) => { e.preventDefault(); if (await addConsultant(v)) onDone(); };
  return (
    <form id="fConsAdd" className="formgrid" onSubmit={submit}>
      <label className="fld">الاسم *<input className="inp" id="caN" required value={v.name} onChange={set('name')} /></label>
      <label className="fld">المسمى<input className="inp" id="caT" placeholder="مستشار علامات تجارية" value={v.title} onChange={set('title')} /></label>
      <label className="fld full">نبذة<textarea className="inp" id="caB" rows={2} value={v.bio} onChange={set('bio')} /></label>
      <div className="fld full">التخصصات<div className="opts" id="caS">{CSPEC.map(([k, t]) => <button key={k} type="button" className={v.spec.includes(k) ? 'on' : ''} onClick={() => tog('spec', k)}>{t}</button>)}</div></div>
      <div className="fld full">أيام التوفّر<div className="opts" id="caD">{DAYS.map((d, i) => <button key={i} type="button" className={v.days.includes(i) ? 'on' : ''} onClick={() => tog('days', i)}>{d}</button>)}</div></div>
      <label className="fld">من<input className="inp" id="caF" type="time" dir="ltr" value={v.from} onChange={set('from')} /></label>
      <label className="fld">إلى<input className="inp" id="caTo" type="time" dir="ltr" value={v.to} onChange={set('to')} /></label>
      <p className="mini-note full">المستشار المضاف يدوياً بلا حساب على المنصة: تصلك طلباته في «طلبات الحجز» وتتابعها أنت. ليرى طلباته بنفسه، يسجّل بدور «{CONS_ROLE}» وتعتمده من القائمة.</p>
      <div className="full"><button className="btn pri" type="submit">أضف واعتمد</button></div>
    </form>
  );
}

function BookingsList({ all, setAll }) {
  if (!all.length) return <p className="empty">لا طلبات بعد.</p>;
  const setSt = (b, v) => {
    const p = { st: v, upd: Date.now() };
    (LOCAL || !CAP.db ? Promise.resolve() : Promise.all([CAP.db.doc('cbook/' + b.cid + '/items/' + b.id).update(p), CAP.db.doc('sessions/' + b.code).update({ bookings: { [b.id]: p } }).catch(() => {})]))
      .then(() => { setAll(all.map((x) => (x === b ? { ...x, st: v } : x))); toast('حُدّثت الحالة.'); })
      .catch(() => toast('تعذّر التحديث.', 'err'));
  };
  return (
    <div className="bks">
      {all.map((b) => {
        const st = BK_ST[b.st] || BK_ST.new;
        return (
          <article key={b.cid + '/' + b.id} className="bk">
            <div className="bk-h"><b>{b.brand} <span className="codechip">{b.code}</span></b><span className={'stpill ' + st[1]}>{st[0]}</span></div>
            <p>{b.cname || 'غير موجّه (فريق المنصة)'} · {BK_KIND[b.kind] || ''} · {b.topicT || ''}</p>
            <p className="mini-note">{fmtWhen(b.when)} · {b.name} · <span dir="ltr">{b.phone}</span></p>
            {b.note ? <p>{b.note}</p> : null}
            <div className="seg">{Object.entries(BK_ST).map(([k, v]) => <button key={k} className={b.st === k ? 'on' : ''} onClick={() => setSt(b, k)}>{v[0]}</button>)}</div>
          </article>
        );
      })}
    </div>
  );
}

function ConsList({ pend, onApprove }) {
  return (
    <>
      <h4 style={{ fontSize: 15, marginBottom: 8 }}>بانتظار الاعتماد ({AR(pend.length)})</h4>
      <div className="rlist">
        {pend.length ? pend.map((p) => (
          <div key={p.uid} className="ritem" style={{ '--c': '#B07A00', gridTemplateColumns: '6px 1fr auto' }}>
            <i />
            <span style={{ display: 'grid', gap: 2 }}><b>{p.name}</b><small>{p.org || ''} · <span dir="ltr">{p.email || ''}</span></small></span>
            <button className="btn sm pri" onClick={() => onApprove(p.uid, true)}>اعتمد</button>
          </div>
        )) : <p className="empty">لا طلبات اعتماد.</p>}
      </div>
      <h4 style={{ fontSize: 15, margin: '16px 0 8px' }}>المستشارون ({AR((CONS || []).length)})</h4>
      <div className="rlist">
        {(CONS || []).length ? CONS.map((c) => (
          <div key={c.id} className="ritem" style={{ '--c': c.ok ? '#1F7D63' : '#7A8896', gridTemplateColumns: '6px 1fr auto' }}>
            <i />
            <span style={{ display: 'grid', gap: 2 }}>
              <b>{c.name} {c.live ? <span className="chip live">● متاح الآن</span> : null}</b>
              <small>{c.title || ''} · {(c.spec || []).map(cspecT).join('، ') || 'بلا تخصصات'}</small>
              <small>{c.manual ? 'مضاف يدوياً' : 'له حساب'}</small>
            </span>
            <button className={'btn sm ' + (c.ok ? 'ghost' : 'pri')} onClick={() => onApprove(c.id, !c.ok)}>{c.ok ? 'أوقف' : 'اعتمد'}</button>
          </div>
        )) : <p className="empty">لا مستشارين بعد. أضف مستشاراً أو اعتمد طلباً.</p>}
      </div>
    </>
  );
}

/** إدارة المستشارين (مضمّنة في قسم الإدارة): المعتمدون والطلبات · إضافة مستشار · طلبات الحجز. onTab اختياري ليحفظ المضيف التبويب */
export function ConsAdmin({ tab = 'list', onTab }) {
  useEngine();
  const [t, setT] = useState(tab || 'list');
  const [reload, setReload] = useState(0);
  const [data, setData] = useState(null);
  useEffect(() => { setT(tab || 'list'); }, [tab]);
  useEffect(() => {
    let live = true; setData(null);
    (async () => {
      await loadConsultants(true);
      const d = t === 'bk' ? { all: await loadAllBookings() } : t === 'list' ? { pend: await loadPending() } : {};
      if (live) setData({ ...d, t });
    })();
    return () => { live = false; };
  }, [t, reload]);
  const goTab = (k) => { setT(k); if (onTab) onTab(k); if (k === t) setReload((x) => x + 1); };
  const toList = () => { setT('list'); if (onTab) onTab('list'); setReload((x) => x + 1); };
  const onApprove = async (uid, on) => { if (await approveCons(uid, on)) toList(); };
  return (
    <>
      <div className="seg" style={{ marginBottom: 12 }}>
        {[['list', 'المعتمدون والطلبات'], ['add', 'إضافة مستشار'], ['bk', 'طلبات الحجز']].map(([k, x]) => <button key={k} className={t === k ? 'on' : ''} onClick={() => goTab(k)}>{x}</button>)}
      </div>
      <div id="caBox">
        {!data || data.t !== t ? <p className="empty">يحمّل…</p>
          : t === 'add' ? <AddForm onDone={toList} />
            : t === 'bk' ? <BookingsList all={data.all} setAll={(all) => setData({ ...data, all })} />
              : <ConsList pend={data.pend} onApprove={onApprove} />}
      </div>
    </>
  );
}

/** نفس إدارة المستشارين في الدرج الجانبي */
export function openConsAdmin(tab) {
  openDrawer(
    <>
      <DrawerHead title={<><Icon name="handshake" /> المستشارون</>} />
      <ConsAdmin tab={tab || 'list'} />
    </>,
  );
}
