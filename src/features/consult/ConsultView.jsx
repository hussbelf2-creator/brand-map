/* ================= لوحة المستشار (#consult): صندوق الطلبات الحي، الانضمام للطاولة، والملف ================= */
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  S, CODE, ME, LOCAL, CAP, LS, SND, STAGES, LOGO, CSPEC, DAYS, BK_KIND, BK_ST, CONS, CONS_ROLE,
  cspecT, fmtWhen, loadConsultants, myCons, patch, whoName, openSession, afterOpen,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { openModal, closeModal, toast } from '../../ui/overlays.jsx';
import { go } from '../../nav.js';

/* ---------- صندوق الطلبات (يبقى مستمعاً بعد مغادرة الشاشة كما في الأصل) ---------- */
let INBOX = [], INB_UNSUB = null, INB_CID = null;
const inbSubs = new Set();
const inbBump = () => inbSubs.forEach((f) => f());
const inbSub = (f) => { inbSubs.add(f); return () => inbSubs.delete(f); };
const getInbox = () => INBOX;

/** يستمع لصندوق طلبات المستشار لحظياً (أو يقرأ النسخة المحلية) */
export function listenInbox(cid) {
  if (INB_UNSUB) { try { INB_UNSUB(); } catch (e) { /* */ } INB_UNSUB = null; }
  INB_CID = cid;
  if (LOCAL || !CAP.db) {
    const L = LS.get('bm3:cbook') || {};
    INBOX = Object.entries(L).map(([id, b]) => ({ id, ...b })).filter((b) => b.cid === cid);
    inbBump(); return;
  }
  let first = true;
  INB_UNSUB = CAP.db.collection('cbook/' + cid + '/items').onSnapshot((qs) => {
    const prev = INBOX.length;
    INBOX = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (!first && INBOX.length > prev) { SND.play('gold'); toast('طلب جديد في صندوقك.', 'gold'); }
    first = false; inbBump();
  }, () => {});
}

/** يحدّث حالة طلب (تأكيد / موعد بديل / انتهى / إلغاء) في الصندوق وفي جلسة العميل */
export async function updBooking(id, p) {
  const b = INBOX.find((x) => x.id === id) || {}; const c = myCons(); p.upd = Date.now();
  if (!LOCAL && CAP.db) {
    try {
      await CAP.db.doc('cbook/' + (b.cid || c.id) + '/items/' + id).update(p);
      await CAP.db.doc('sessions/' + b.code).update({ bookings: { [id]: p } }).catch(() => {});
    } catch (e) { toast('تعذّر التحديث.', 'err'); return; }
    Object.assign(b, p); INBOX = INBOX.slice(); inbBump();
  } else {
    const L = LS.get('bm3:cbook') || {}; Object.assign(L[id] || {}, p); LS.set('bm3:cbook', L);
    if (S && CODE === b.code) patch({ bookings: { [id]: p } });
    listenInbox(c.id);
  }
  toast('حُدّث الطلب ويظهر للعميل.');
}

/** يحفظ ملف المستشار (الاسم، المسمى، النبذة، التخصصات، التوفّر) */
export async function saveConsProfile(p) {
  const c = myCons(); if (!c) return false;
  if (!LOCAL && CAP.db) { try { await CAP.db.doc('consultants/' + c.id).update(p); } catch (e) { toast('تعذّر الحفظ.', 'err'); return false; } }
  else { const L = LS.get('bm3:cons') || []; const x = L.find((y) => y.id === c.id); Object.assign(x, p); LS.set('bm3:cons', L); }
  Object.assign(c, p); toast('حُفظ ملفك.'); return true;
}

/** «ادخل الطاولة»: يفتح جلسة العميل ويسجّل المستشار عضواً فيها */
async function joinTable(code) {
  if (await openSession(code)) {
    afterOpen();
    if (ME.id) patch({ members: { [ME.id]: { name: whoName(), role: 'consultant', at: Date.now() } } }, { silent: true });
    go(S.done ? 'dash' : 'play');
  }
}

function AltModal({ id }) {
  const [w, setW] = useState(''); const [m, setM] = useState('');
  const send = () => { const t = new Date(w).getTime(); if (!isFinite(t)) { toast('اختر موعداً.', 'err'); return; } updBooking(id, { st: 'resched', alt: t, reply: m.trim() }); closeModal(); };
  return (
    <>
      <h3><Icon name="calendar-clock" /> اقترح موعداً آخر</h3>
      <div className="mb">
        <label className="fld">الموعد<input className="inp" id="altW" type="datetime-local" dir="ltr" value={w} onChange={(e) => setW(e.target.value)} /></label>
        <label className="fld">رسالة للعميل<input className="inp" id="altM" placeholder="مثال: الوقت المطلوب محجوز، هل يناسبكم هذا؟" value={m} onChange={(e) => setM(e.target.value)} /></label>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={send}>أرسل</button></div>
    </>
  );
}

/** نموذج ملف المستشار (consProfileForm) */
function ConsProfileForm({ c, onSaved }) {
  const av = c.avail || {};
  const [v, setV] = useState(() => ({ name: c.name || '', title: c.title || '', bio: c.bio || '', spec: (c.spec || []).slice(), days: (av.days || [0, 1, 2, 3, 4]).slice(), from: av.from || '16:00', to: av.to || '21:00' }));
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const tog = (k, x) => setV({ ...v, [k]: v[k].includes(x) ? v[k].filter((y) => y !== x) : [...v[k], x] });
  const submit = async (e) => {
    e.preventDefault();
    const p = { name: v.name.trim() || c.name, title: v.title.trim(), bio: v.bio.trim(), spec: CSPEC.map(([k]) => k).filter((k) => v.spec.includes(k)), avail: { days: DAYS.map((d, i) => i).filter((i) => v.days.includes(i)), from: v.from || '16:00', to: v.to || '21:00' }, upd: Date.now() };
    if (await saveConsProfile(p)) onSaved && onSaved();
  };
  return (
    <form id="fCons" className="formgrid" autoComplete="off" onSubmit={submit}>
      <label className="fld">الاسم<input className="inp" id="cpN" value={v.name} onChange={set('name')} /></label>
      <label className="fld">المسمى<input className="inp" id="cpT" value={v.title} onChange={set('title')} placeholder="مستشار علامات تجارية" /></label>
      <label className="fld full">نبذة قصيرة<textarea className="inp" id="cpB" rows={2} maxLength={280} value={v.bio} onChange={set('bio')} /></label>
      <div className="fld full">التخصصات<div className="opts" id="cpS">{CSPEC.map(([k, t]) => <button key={k} type="button" className={v.spec.includes(k) ? 'on' : ''} onClick={() => tog('spec', k)}>{t}</button>)}</div></div>
      <div className="fld full">أيام التوفّر<div className="opts" id="cpD">{DAYS.map((d, i) => <button key={i} type="button" className={v.days.includes(i) ? 'on' : ''} onClick={() => tog('days', i)}>{d}</button>)}</div></div>
      <label className="fld">من الساعة<input className="inp" id="cpF" type="time" dir="ltr" value={v.from} onChange={set('from')} /></label>
      <label className="fld">إلى الساعة<input className="inp" id="cpTo" type="time" dir="ltr" value={v.to} onChange={set('to')} /></label>
      <div className="full"><button className="btn pri" type="submit"><Icon name="check" /> احفظ الملف</button></div>
    </form>
  );
}

function Head({ t, sub }) {
  return (
    <>
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="dband">
        <div className="wrap">
          <div className="db-top">
            <span className="brandmk"><img src={LOGO} alt="" /><span>براند ماب<small>BRAND MAP</small></span></span>
            <span className="db-acts"><button className="btn sm dk" onClick={() => go('start')}><Icon name="house" /> البداية</button></span>
          </div>
          <div className="db-main" style={{ paddingBottom: 24 }}>
            <div><div className="eyebrow">لوحة المستشار</div><h1>{t}</h1><div className="db-sub"><span>{sub}</span></div></div>
          </div>
        </div>
      </header>
    </>
  );
}

export default function ConsultView() {
  useEngine();
  const inbox = useSyncExternalStore(inbSub, getInbox, getInbox);
  const [loaded, setLoaded] = useState(!!CONS);
  const [, setTick] = useState(0);
  const rerender = () => setTick((x) => x + 1);
  useEffect(() => { let live = true; loadConsultants().then(() => { if (live) setLoaded(true); }); return () => { live = false; }; }, []);
  const c = loaded ? myCons() : null;
  const ok = !!(c && c.ok), cid = c && c.id;
  useEffect(() => { if (ok && (LOCAL || !INB_UNSUB || INB_CID !== cid)) listenInbox(cid); }, [ok, cid]);

  if (!loaded) return <section id="v-consult" />;
  if (!c || !c.ok) return (
    <section id="v-consult">
      <Head t="لوحة المستشار" sub={c ? 'ملفك بانتظار اعتماد فريق المنصة.' : 'هذه الصفحة للمستشارين المعتمدين.'} />
      <main className="wrap dbody">
        <div className="pn">
          <div className="emptyst"><Icon name="handshake" /><b>{c ? 'بانتظار الاعتماد' : 'لست مستشاراً معتمداً'}</b><p>{c ? 'سيعتمد فريق المنصة ملفك قريباً، ثم تصلك طلبات العملاء هنا مباشرة.' : 'سجّل بدور «' + CONS_ROLE + '» من صفحة البداية، ثم ينتظر ملفك اعتماد فريق المنصة.'}</p></div>
        </div>
      </main>
    </section>
  );

  const L = inbox.slice().sort((a, b) => (a.st === 'new' ? 0 : 1) - (b.st === 'new' ? 0 : 1) || (a.when - b.when));
  const up = L.filter((b) => ['confirmed', 'resched'].includes(b.st) && (b.alt || b.when) > Date.now() - 3600e3);
  const nNew = L.filter((b) => b.st === 'new').length;
  const toggleLive = () => {
    const v = !c.live;
    (LOCAL || !CAP.db
      ? Promise.resolve((() => { const A = LS.get('bm3:cons') || []; const x = A.find((y) => y.id === c.id); if (x) x.live = v; LS.set('bm3:cons', A); })())
      : CAP.db.doc('consultants/' + c.id).update({ live: v }))
      .then(() => { c.live = v; rerender(); }).catch(() => toast('تعذّر التحديث.', 'err'));
  };
  return (
    <section id="v-consult">
      <Head t={c.name} sub={`${c.title || 'مستشار علامات'} · ${(c.spec || []).map(cspecT).join('، ')}`} />
      <main className="wrap dbody">
        <div className="kps">
          <div className="kp"><span className="l">طلبات جديدة</span><span className="v" style={{ color: nNew ? 'var(--warn)' : 'inherit' }}>{nNew}</span><span className="s">تحتاج ردّك</span></div>
          <div className="kp"><span className="l">جلسات قادمة</span><span className="v">{up.length}</span><span className="s">{up[0] ? fmtWhen(up[0].alt || up[0].when) : 'لا شيء مجدول'}</span></div>
          <div className="kp"><span className="l">منجزة</span><span className="v">{L.filter((b) => b.st === 'done').length}</span><span className="s">كل الوقت</span></div>
          <button className={'kp live-t ' + (c.live ? 'on' : '')} onClick={toggleLive}><span className="l">الانضمام الفوري للطاولات</span><span className="v">{c.live ? '● متاح الآن' : 'غير متاح'}</span><span className="s">اضغط للتبديل</span></button>
        </div>
        <Panel title={<><Icon name="handshake" /> طلبات العملاء</>} sub="تصلك لحظياً. أكّد الموعد أو اقترح موعداً آخر، وادخل الطاولة برمز الجلسة.">
          <div className="bks">
            {L.length ? L.map((b) => {
              const st = BK_ST[b.st] || BK_ST.new;
              return (
                <article key={b.id} className={'bk ' + b.st}>
                  <div className="bk-h"><b>{b.brand} <span className="codechip">{b.code}</span></b><span className={'stpill ' + st[1]}>{st[0]}</span></div>
                  <p><b>{BK_KIND[b.kind] || ''}</b> · {b.topicT || ''}</p>
                  <p className="mini-note"><Icon name="calendar-clock" /> {b.kind === 2 ? 'الآن (طلب انضمام فوري)' : fmtWhen(b.when)}{b.alt ? ` · اقترحتَ: ${fmtWhen(b.alt)}` : ''}</p>
                  <p className="mini-note">{b.name} · <span dir="ltr">{b.phone}</span>{b.email ? <> · <span dir="ltr">{b.email}</span></> : null}</p>
                  {b.note ? <p>{b.note}</p> : null}
                  {b.reply ? <p className="rep">ردّك: {b.reply}</p> : null}
                  <div className="bk-a">
                    <button className="btn sm pri" disabled={b.st === 'confirmed'} onClick={() => updBooking(b.id, { st: 'confirmed' })}><Icon name="check" /> تأكيد</button>
                    <button className="btn sm" onClick={() => openModal(<AltModal id={b.id} />)}><Icon name="calendar-clock" /> اقترح موعداً</button>
                    <button className="btn sm" onClick={() => joinTable(b.code)}><Icon name="orbit" /> ادخل الطاولة</button>
                    <button className="btn sm ghost" onClick={() => updBooking(b.id, { st: 'done' })}>انتهى</button>
                    <button className="btn sm ghost" onClick={() => updBooking(b.id, { st: 'cancel' })}>إلغاء</button>
                  </div>
                </article>
              );
            }) : <p className="empty">لا طلبات بعد. حين يحجزك عميل يظهر الطلب هنا فوراً.</p>}
          </div>
        </Panel>
        <Panel title={<><Icon name="user-round" /> ملفي كمستشار</>} sub="هذا ما يراه العملاء عند الحجز.">
          <ConsProfileForm key={c.id} c={c} onSaved={rerender} />
        </Panel>
      </main>
    </section>
  );
}
