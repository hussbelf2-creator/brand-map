/* ================= «استعن بمستشار»: حجز مستشار حقيقي (جانب العميل) ================= */
import React, { useEffect, useState } from 'react';
import {
  S, Q, CODE, ME, PROFILE, LOCAL, CAP, RO, LS, DAY, DAYS, BK_KIND, BK_ST, ui, AR, qcode, DG, patch, logEv, newId, whoName,
  colorOf, initial, cspecT, fmtWhen, loadConsultants, approved, slotsFor, myBookings, activeConflicts, resolved,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal, toast } from '../../ui/overlays.jsx';

/** صورة رمزية بالحرف الأول ولون ثابت */
export function Avatar({ c, sz = 48 }) {
  return <span className="cav" style={{ '--s': sz + 'px', background: colorOf(c.id || c.name) }}>{initial(c.name)}</span>;
}

/** يرسل طلب الحجز: نسخة عامة في الجلسة، ونسخة كاملة (بالجوال والبريد) في صندوق المستشار */
export async function saveBooking(B, f, topicT) {
  const phone = f.phone.trim();
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) { toast('اكتبوا رقم جوال صحيحاً.', 'err'); return false; }
  const c = B.cid === 'team' ? null : approved().find((x) => x.id === B.cid);
  const when = B.kind === 2 ? Date.now() : (B.slot || B.custom || Date.now() + DAY);
  const bid = newId();
  const b = { at: Date.now(), by: whoName(), uid: ME.id || '', name: f.name.trim(), phone, email: f.email.trim(), when, kind: B.kind, topic: f.topic, topicT, note: f.note.trim(), st: 'new', brand: S.brand, code: CODE, cid: B.cid || 'team', cname: c ? c.name : '' };
  const pub = { ...b }; delete pub.phone; delete pub.email;
  patch({ bookings: { [bid]: pub } }, { now: true });
  if (!LOCAL && CAP.db) {
    try { await CAP.db.collection('cbook/' + b.cid + '/items').doc(bid).set(b); }
    catch (e) { toast('حُفظ الطلب في الجلسة لكن تعذّر إيصاله لصندوق المستشار. سيراه فريق المنصة.', 'err'); }
  } else { const L = LS.get('bm3:cbook') || {}; L[bid] = b; LS.set('bm3:cbook', L); }
  logEv('log', `حجز ${c ? c.name : 'مستشاراً'}: ${BK_KIND[b.kind]} · ${b.topicT}`, { verb: 'استعان بمستشار' });
  closeModal();
  toast(c ? `وصل طلبكم إلى ${c.name}. ستظهر حالته في «استعن بمستشار».` : 'وصل طلبكم لفريق المنصة لتوجيهه لمستشار مناسب.', 'gold');
  return true;
}

function ExpertModal() {
  useEngine();
  const [loaded, setLoaded] = useState(false);
  const [B, setB] = useState({ step: 1, cid: null, slot: null, kind: 0, day: 0, custom: null });
  const [w, setW] = useState('');
  const [f, setF] = useState(() => ({
    name: whoName(),
    phone: (PROFILE && PROFILE.phone) || (DG().pro || {}).phone || '',
    email: (PROFILE && PROFILE.email) || (DG().pro || {}).email || '',
    topic: ui.q || '', note: '',
  }));
  const [saving, setSaving] = useState(false);
  useEffect(() => { let live = true; loadConsultants(true).then(() => { if (live) setLoaded(true); }); return () => { live = false; }; }, []);
  const head = <h3><Icon name="handshake" /> استعن بمستشار</h3>;
  if (!S) return null;
  if (!loaded) return <>{head}<p className="empty">يحمّل المستشارين…</p></>;

  const q = Q[ui.q], ax = q.s.n;
  const list = approved().slice().sort((a, b) => ((b.spec || []).includes('ax' + ax) - (a.spec || []).includes('ax' + ax)) || ((b.live ? 1 : 0) - (a.live ? 1 : 0)));
  const mine = myBookings();
  const c = B.cid === 'team' ? null : approved().find((x) => x.id === B.cid);
  const up = (p) => setB({ ...B, ...p });
  const pick = (cid) => up({ cid, slot: null, day: 0, kind: 0 });
  const next = () => {
    const nb = { ...B };
    if (B.step === 2 && B.kind !== 2) {
      const cv = w ? new Date(w).getTime() : null;
      if (cv && isFinite(cv)) nb.custom = cv;
      if (!nb.slot && !nb.custom) { toast('اختاروا وقتاً أو اقترحوا موعداً.', 'err'); return; }
      if (cv) nb.slot = null;
    }
    nb.step = Math.min(3, B.step + 1); setB(nb);
  };
  const back = () => up({ step: Math.max(1, B.step - 1) });
  const opts = [
    [q.id, qcode(q) + ' · ' + q.slot + ' (البطاقة الحالية)'],
    ['', 'الجلسة عامة'],
    ...activeConflicts().filter((c2) => !resolved(c2)).map((c2) => ['c:' + c2.id, 'تعارض: ' + c2.title]),
    ['doc', 'مراجعة الوثيقة والمخرجات'],
  ];
  const topic = opts.some((o) => o[0] === f.topic) ? f.topic : opts[0][0];
  const setFld = (k) => (e) => setF({ ...f, [k]: e.target.value });

  let body = null;
  if (B.step === 1) {
    body = (
      <>
        <p className="mini-note">مستشارو براند ماب أشخاص حقيقيون معتمدون من فريق المنصة. اختاروا من يناسب المحور الذي تعملون عليه، والمقترحون أولاً لمحور «{q.s.name}».</p>
        <div className="cons-grid">
          {list.length ? list.map((x) => {
            const nx = slotsFor(x)[0]; const rec = (x.spec || []).includes('ax' + ax);
            return (
              <button key={x.id} className={'cons ' + (B.cid === x.id ? 'on' : '')} onClick={() => pick(x.id)}>
                <Avatar c={x} />
                <span className="cb">
                  <b>{x.name}{rec ? <>{' '}<span className="chip ok">مقترح</span></> : null}{x.live ? <>{' '}<span className="chip live">● متاح الآن</span></> : null}</b>
                  <small>{x.title || 'مستشار علامات'}</small>
                  <span className="sp">{(x.spec || []).slice(0, 4).map((k) => <i key={k}>{cspecT(k)}</i>)}</span>
                  {x.bio ? <small className="bio">{x.bio}</small> : null}
                  <small className="nx"><Icon name="calendar-clock" /> {nx ? 'أقرب موعد: ' + fmtWhen(nx) : 'لا مواعيد خلال ١٠ أيام'}</small>
                </span>
              </button>
            );
          }) : (
            <div className="emptyst"><Icon name="users" /><b>لا مستشارين معتمدين بعد</b><p>أرسلوا طلباً عاماً وسيوجّهه فريق المنصة لمستشار مناسب.</p></div>
          )}
          <button className={'cons team ' + (B.cid === 'team' ? 'on' : '')} onClick={() => pick('team')}>
            <span className="cav" style={{ '--s': '48px', background: '#24364A' }}><Icon name="users" /></span>
            <span className="cb"><b>أي مستشار متاح</b><small>يوجّه فريق المنصة طلبكم لأنسب مستشار.</small></span>
          </button>
        </div>
        {mine.length ? (
          <>
            <h4 style={{ fontSize: 15, marginTop: 6 }}>طلباتكم</h4>
            <div className="rlist">
              {mine.map((b) => {
                const st = BK_ST[b.st] || BK_ST.new;
                return (
                  <div key={b.id} className="ritem" style={{ '--c': '#24364A' }}>
                    <i />
                    <span style={{ display: 'grid', gap: 2 }}>
                      <b>{b.cname || 'فريق المنصة'} · {BK_KIND[b.kind] || ''}</b>
                      <small>{b.topicT || ''} · {fmtWhen(b.alt || b.when)}{b.alt ? ' (موعد مقترح)' : ''}</small>
                      {b.reply ? <small className="rep">{b.reply}</small> : null}
                    </span>
                    <span className={'stpill ' + st[1]}>{st[0]}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </>
    );
  } else if (B.step === 2) {
    const sl = c ? slotsFor(c) : [];
    const days = [...new Set(sl.map((t) => new Date(t).toDateString()))];
    const dsel = days[B.day] || days[0];
    const wIn = <input className="inp" id="bkW" type="datetime-local" dir="ltr" value={w} onChange={(e) => setW(e.target.value)} style={c && sl.length ? { marginTop: 6 } : undefined} />;
    body = (
      <>
        <div className="fld">نوع الجلسة
          <div className="seg" id="bkK">
            {BK_KIND.map((k, i) => (i === 2 && c && !c.live ? null : <button key={i} type="button" className={B.kind === i ? 'on' : ''} onClick={() => { up({ kind: i }); setW(''); }}>{k}</button>))}
          </div>
        </div>
        {B.kind === 2 ? (
          <div className="whybox"><b>انضمام فوري</b>يصل الطلب للمستشار الآن، ويدخل الطاولة برمز الجلسة <span className="codechip">{CODE}</span> عند قبوله.</div>
        ) : c && sl.length ? (
          <>
            <div className="fld">اختاروا اليوم
              <div className="days">
                {days.map((d, i) => { const x = new Date(d); return <button key={d} type="button" className={i === (B.day || 0) ? 'on' : ''} onClick={() => { up({ day: i, slot: null }); setW(''); }}><b>{DAYS[x.getDay()]}</b><small>{x.getDate()}/{x.getMonth() + 1}</small></button>; })}
              </div>
            </div>
            <div className="fld">الوقت
              <div className="slots">
                {sl.filter((t) => new Date(t).toDateString() === dsel).map((t) => <button key={t} type="button" className={B.slot === t ? 'on' : ''} onClick={() => { up({ slot: t, custom: null }); setW(''); }}>{new Date(t).toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' })}</button>)}
              </div>
            </div>
            <details><summary className="mini-note">لا يناسبكم أي وقت؟ اقترحوا موعداً</summary>{wIn}</details>
          </>
        ) : (
          <label className="fld">الموعد المفضّل{wIn}</label>
        )}
      </>
    );
  } else {
    body = (
      <>
        <div className="whybox"><b>{c ? c.name : 'أي مستشار متاح'} · {BK_KIND[B.kind]}</b>{B.kind === 2 ? 'الآن' : fmtWhen(B.slot || B.custom)}</div>
        <div className="formgrid">
          <label className="fld">الاسم<input className="inp" id="bkN" value={f.name} onChange={setFld('name')} /></label>
          <label className="fld">الجوال *<input className="inp" id="bkP" type="tel" dir="ltr" value={f.phone} onChange={setFld('phone')} placeholder="05XXXXXXXX" /></label>
          <label className="fld">البريد<input className="inp" id="bkE" type="email" dir="ltr" value={f.email} onChange={setFld('email')} /></label>
          <label className="fld">الموضوع
            <select className="inp" id="bkT" value={topic} onChange={setFld('topic')}>
              {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
        </div>
        <label className="fld">ما الذي تحتاجونه من المستشار؟<textarea className="inp" id="bkNote" rows={3} placeholder="مثال: الطاولة منقسمة بين شريحتين ونحتاج رأياً خارجياً" value={f.note} onChange={setFld('note')} /></label>
      </>
    );
  }
  const save = async () => {
    if (saving) return; setSaving(true);
    const ff = { ...f, topic };
    const t = (opts.find((o) => o[0] === topic) || opts[0])[1];
    try { await saveBooking(B, ff, t); } finally { setSaving(false); }
  };
  return (
    <>
      {head}
      <div className="bk-steps">{['المستشار', 'الموعد', 'التفاصيل'].map((t, i) => <span key={i} className={B.step === i + 1 ? 'on' : B.step > i + 1 ? 'ok' : ''}>{AR(i + 1)}. {t}</span>)}</div>
      <div className="mb">{body}</div>
      <div className="mf">
        {B.step === 1 ? (
          <><button className="btn" onClick={closeModal}>إغلاق</button><button className="btn pri" disabled={!B.cid} onClick={next}>التالي: الموعد <Icon name="chevron-left" /></button></>
        ) : B.step === 2 ? (
          <><button className="btn ghost" onClick={back}><Icon name="chevron-right" /> السابق</button><button className="btn pri" onClick={next}>التالي: التفاصيل <Icon name="chevron-left" /></button></>
        ) : (
          <><button className="btn ghost" onClick={back}><Icon name="chevron-right" /> السابق</button><button className="btn gold" disabled={RO || saving} onClick={save}><Icon name="calendar-clock" /> أرسل طلب الحجز</button></>
        )}
      </div>
    </>
  );
}

/** يفتح نافذة الحجز بثلاث خطوات (المستشار ← الموعد ← التفاصيل). تتطلب جلسة مفتوحة */
export function openExpert() {
  if (!S) return;
  openModal(<ExpertModal key={Date.now()} />, { wide: true });
}
