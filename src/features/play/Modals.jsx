/* النوافذ الوسطية للطاولة: القرار الذهبي، قلب الذهبية، كرت التعارض، الخاتمة، وتأكيد الإنهاء */
import React, { useState } from 'react';
import { S, Q, AK, AR, N_Q, STAGES, has, qlabel, ansTitle, ansSummary, placedCount } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { closeModal, toast } from '../../ui/overlays.jsx';
import { doPlace, unplaceGold, resolveExit, finishSession } from './actions.js';

/** ★ قرار ذهبي: لا يوضع إلا بإجماع الطاولة */
export function GoldPlaceModal({ q, keys }) {
  const [agree, setAgree] = useState(false);
  const ok = () => { if (!agree) { toast('القاعدة الذهبية: يلزم إجماع الطاولة كاملة.', 'err'); return; } closeModal(); doPlace(true); };
  return (
    <>
      <h3 style={{ color: 'var(--gold)' }}>★ قرار ذهبي</h3>
      <div className="mb">
        <p>«{q.t}» بطاقة ذهبية. القاعدة: <b>لا تُوضع ولا تُقلب إلا بإجماع الطاولة كاملة</b>، لا بالأغلبية. وتُنقل مباشرة إلى الخريطة النهائية بخطّ واثق.</p>
        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" id="gAgree" style={{ width: '20px', height: '20px' }} checked={agree} onChange={(e) => setAgree(e.target.checked)} /> أجمعت الطاولة كلها على: {keys.map((k) => ansTitle(q, k) || (AK(q, k) || {}).t).join('، ')}
        </label>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>رجوع للنقاش</button><button className="btn gold" onClick={ok}>ضعها بالإجماع</button></div>
    </>
  );
}

/** ★ قلب بطاقة ذهبية */
export function GoldUnplaceModal() {
  return (
    <>
      <h3 style={{ color: 'var(--gold)' }}>★ قلب بطاقة ذهبية</h3>
      <div className="mb"><p>قلب القرار الذهبي يحتاج إجماع الطاولة كاملة. هل أجمعتم على إعادته للنقاش؟</p></div>
      <div className="mf"><button className="btn" onClick={closeModal}>إبقاء القرار</button><button className="btn gold" onClick={unplaceGold}>نعم، بالإجماع</button></div>
    </>
  );
}

/** كرت التعارض (openConflict) */
export function ConflictModal({ c }) {
  useEngine();
  if (!S || !c) return null;
  const qa = Q[c.a[0]], bref = c.b.find((b) => has(...b)) || c.b[0], qb = Q[bref[0]];
  return (
    <>
      <h3 style={{ color: 'var(--danger)' }}><Icon name="triangle-alert" /> كرت التعارض</h3>
      <div className="mb">
        <div className="conf-card">
          <h4>{c.title}</h4><p>{c.why}</p>
          <small style={{ color: 'var(--muted)' }}>بين {qlabel(qa)} «{ansSummary(qa)}» و{qlabel(qb)} «{ansSummary(qb)}»</small>
          <div className="exits">{c.exits.map((e, i) => <button key={i} type="button" className={S.res && S.res[c.id] === i ? 'on' : ''} onClick={() => resolveExit(c.id, i, true)}>{e}</button>)}</div>
        </div>
        <p className="mini-note">اختر مخرجاً من الثلاثة، أو أغلق الآن ليبقى التعارض على اللوحة خطاً أحمر حتى يُحسم.</p>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>لاحقاً</button></div>
    </>
  );
}

/** الخاتمة: اكتملت الزهرة (openFinale) */
export function FinaleModal() {
  useEngine();
  return (
    <div className="finale">
      <svg className="flower" viewBox="0 0 120 120">
        {STAGES.map((s, i) => { const a = (i * 45 - 90) * Math.PI / 180; const x = 60 + Math.cos(a) * 30, y = 60 + Math.sin(a) * 30; return <ellipse key={i} cx={x} cy={y} rx="22" ry="13" fill={s.c} transform={`rotate(${i * 45 - 90} ${x} ${y})`} />; })}
        <circle cx="60" cy="60" r="10" fill="#D9A63A" />
      </svg>
      <h3 style={{ justifyContent: 'center', fontSize: '30px' }}>اكتملت خريطة {S ? S.brand : ''}</h3>
      <p style={{ color: 'var(--muted)' }}>٣٥ قراراً على اللوحة، والزهرة اكتملت ببتلاتها الثماني. الخطوة التالية: لوحة متابعة ثابتة للعميل تراجع المحاور دورياً، مع وثيقة المشروع.</p>
      <div className="mf" style={{ justifyContent: 'center' }}><button className="btn" onClick={closeModal}>ابقَ على الطاولة</button><button className="btn pri big" onClick={() => finishSession()}><Icon name="layout-dashboard" /> أنشئ لوحة المتابعة</button></div>
    </div>
  );
}

/** إنهاء الجلسة قبل اكتمال اللوحة (finishAsk) */
export function FinishAskModal() {
  useEngine();
  return (
    <>
      <h3><Icon name="layout-dashboard" /> إنهاء الجلسة الآن؟</h3>
      <div className="mb"><p>على اللوحة {AR(placedCount())} من {AR(N_Q)} قراراً. البطاقات غير الموضوعة ستظهر في لوحة المتابعة «قيد الحسم»، ويمكن العودة للطاولة لاحقاً.</p></div>
      <div className="mf"><button className="btn" onClick={closeModal}>أكمل اللعب</button><button className="btn pri" onClick={() => finishSession()}>أنهِ وأنشئ اللوحة</button></div>
    </>
  );
}
