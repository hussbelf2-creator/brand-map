/* واجهة العميل: باقتي + طلب اشتراك (admin.js: planChip / openPlans / sendPlanReq) */
import React, { useState } from 'react';
import { PROFILE, PLANS, MY_SUB, MY_REQ, ME, myPlan, planById, PERIODS, FEATS, money, N, fmtDate, aSet, setVar, whoName } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal, toast } from '../../ui/overlays.jsx';

/** زر الباقة في شريط الحساب */
export function PlanChip() {
  useEngine();
  if (!PROFILE || !(PLANS || []).length) return null;
  const p = myPlan(); const s = MY_SUB;
  const lbl = p ? `${p.name}${s && s.end ? ' · حتى ' + fmtDate(s.end) : ''}` : (MY_REQ && MY_REQ.st === 'pending' ? 'طلب اشتراك قيد المراجعة' : 'بلا باقة');
  return <button className="btn sm ghost" onClick={() => openPlans()}><Icon name="badge-dollar-sign" /> {lbl}</button>;
}

/** يفتح نافذة الباقات (reason: سبب يظهر في تنبيه أعلى النافذة) */
export function openPlans(reason) { openModal(<PlansModal reason={reason} />, { wide: true }); }

/** يرسل طلب الاشتراك ويحفظه في subreq/{uid} */
export async function sendPlanReq({ plan, coupon, phone, note }) {
  if (!plan) { toast('اختر باقة.', 'err'); return false; }
  phone = String(phone || '').trim();
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) { toast('اكتب رقم جوال صحيحاً.', 'err'); return false; }
  const r = { plan, coupon: String(coupon || '').trim().toUpperCase(), phone, note: String(note || '').trim(), name: (PROFILE && PROFILE.name) || whoName(), email: (PROFILE && PROFILE.email) || '', org: (PROFILE && PROFILE.org) || '', at: Date.now(), st: 'pending' };
  try { await aSet('subreq', ME.id, r); setVar('MY_REQ', r); closeModal(); toast('وصل طلب الاشتراك. سيتواصل معكم فريق المنصة.', 'gold'); return true; }
  catch (e) { toast('تعذّر إرسال الطلب.', 'err'); return false; }
}

function PlansModal({ reason }) {
  useEngine();
  const L = (PLANS || []).filter((p) => p.active !== false); const p0 = myPlan();
  const [pick, setPick] = useState(p0 ? p0.id : null);
  const [coupon, setCoupon] = useState('');
  const [phone, setPhone] = useState((PROFILE && PROFILE.phone) || '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => { setBusy(true); await sendPlanReq({ plan: pick, coupon, phone, note }); setBusy(false); };
  return (
    <>
      <h3><Icon name="badge-dollar-sign" /> الباقات</h3>
      <div className="mb">
        {reason ? <div className="warnbox">{reason}</div> : null}
        {MY_REQ && MY_REQ.st === 'pending' ? <div className="whybox" style={{ '--c': '#B07A00' }}><b>طلبكم قيد المراجعة</b>باقة «{(planById(MY_REQ.plan) || {}).name || ''}»{MY_REQ.coupon ? ' · كود ' + MY_REQ.coupon : ''}. سيتواصل معكم فريق المنصة لإتمام الدفع والتفعيل.</div> : null}
        <div className="plgrid">{L.length ? L.map((p) => {
          const mine = p0 && p0.id === p.id; const F = p.feat || {};
          return (
            <label key={p.id} className={'pkg ' + (p.hl ? 'hl' : '') + ' ' + (mine ? 'mine' : '')}>
              <input type="radio" name="plPick" value={p.id} checked={pick === p.id} onChange={() => setPick(p.id)} />
              <b>{p.name}{p.hl ? <> <span className="chip gold">الأكثر طلباً</span></> : null}</b>
              <span className="pr num">{+p.price ? money(p.price) : 'مجاناً'}<small>{PERIODS[p.period] ? ' / ' + PERIODS[p.period][0] : ''}</small></span>
              {p.desc ? <small>{p.desc}</small> : null}
              <ul>
                {+F.sessions ? <li>{N(F.sessions)} جلسات شهرياً</li> : <li>جلسات بلا حد</li>}
                {FEATS.map(([k, t]) => <li key={k} className={F[k] ? '' : 'no'}>{t}</li>)}
              </ul>
              {mine ? <span className="chip ok">باقتكم الحالية</span> : null}
            </label>
          );
        }) : <p className="empty">لا توجد باقات منشورة بعد.</p>}</div>
        {L.length ? <>
          <div className="formgrid">
            <label className="fld">كود الخصم<input className="inp" id="plCoupon" dir="ltr" maxLength={24} placeholder="اختياري" style={{ textTransform: 'uppercase' }} value={coupon} onChange={(e) => setCoupon(e.target.value)} /></label>
            <label className="fld">الجوال للتواصل *<input className="inp" id="plPhone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label className="fld full">ملاحظة<input className="inp" id="plNote" placeholder="مثال: نريد فاتورة باسم الشركة" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          </div>
          <p className="mini-note">يُراجَع كود الخصم ويُحسب السعر النهائي عند تأكيد الطلب. الدفع والتفعيل يتمّان مع فريق المنصة.</p>
        </> : null}
      </div>
      <div className="mf">
        <button className="btn" onClick={closeModal}>إغلاق</button>
        {L.length ? <button className="btn gold" onClick={send} disabled={busy}><Icon name="send" /> أرسل طلب الاشتراك</button> : null}
      </div>
    </>
  );
}
