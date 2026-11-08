/* العناصر الحيّة التي تتحدث كل ٢٥٠ مللي ثانية: حلقة المؤقت، نبض المسرح، وشريط الكلمة */
import React from 'react';
import { S, ME, RO, AR, ui, fmt, memberName, onlinePeople } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { useTick, timerView } from './timer.js';
import { startTm, tmToggle, tmAdd, tmReset, giveFloor } from './actions.js';

const DANGER = { color: 'var(--danger)' };

/** مؤقت النقاش (timerHTML + updTimer) */
export function Timer() {
  useEngine(); useTick();
  if (!S) return null;
  const { t, tmRec, pl, mode, frac, label, dur0 } = timerView();
  const ringCls = 'ring ' + (mode === 'over' ? 'over' : mode === 'warn' ? 'warn' : mode === 'idle' ? 'idle' : '');
  let ctl;
  if (pl) ctl = tmRec ? <span className={'chip ' + (tmRec.s > tmRec.d ? 'bad' : 'ok')}><Icon name="timer" /> استغرقت {fmt(tmRec.s)} من {fmt(tmRec.d)}</span> : <span className="chip"><Icon name="timer" /> وُضعت بلا توقيت</span>;
  else if (mode === 'idle') ctl = <button className="btn sm pri" onClick={() => startTm(ui.q)} disabled={RO}><Icon name="play" /> ابدأ النقاش</button>;
  else ctl = <>
    <button className="btn sm" onClick={tmToggle} disabled={RO}><Icon name={t.run ? 'pause' : 'play'} /> {t.run ? 'إيقاف مؤقت' : 'استئناف'}</button>
    <button className="btn sm ghost" onClick={tmAdd} disabled={RO}>+٣٠ث</button>
    <button className="ibtn" onClick={tmReset} title="إعادة المؤقت" aria-label="إعادة المؤقت" disabled={RO}><Icon name="rotate-ccw" /></button>
  </>;
  const lbl = pl
    ? (tmRec ? (tmRec.s > tmRec.d ? <><b style={DANGER}>تجاوزت وقتها بـ{fmt(tmRec.s - tmRec.d)}.</b> الزمن المسجّل لهذه الإجابة.</> : 'حُسمت ضمن وقتها.') : 'وُضعت دون تشغيل المؤقت.')
    : mode === 'over' ? <><b style={DANGER}>انتهى الوقت.</b> التأجيل ممنوع: قرّروا الآن، ودوّنوا الشك إن لزم.</>
    : mode === 'warn' ? <><b>أقل من ٣٠ ثانية.</b> اتجهوا للحسم.</>
    : mode === 'idle' ? `حارس الوقت يملك الجرس: ${fmt(dur0)} لكل بطاقة.`
    : 'ناقش: الخلاف مسموح، والتأجيل ممنوع.';
  return (
    <div className={'timer' + (mode === 'over' ? ' over' : '')} id="timerBox">
      <div className={ringCls} id="ring">
        <svg viewBox="0 0 86 86"><circle className="bgc" cx="43" cy="43" r="37" /><circle className="fg" id="ringFg" cx="43" cy="43" r="37" strokeDasharray="232.5" strokeDashoffset={String(232.5 * (1 - frac))} /></svg>
        <span className="t num" id="ringT">{label}</span>
      </div>
      <div><div className="ctl" id="tmCtl">{ctl}</div><div className="lbl" id="tmLbl">{lbl}</div></div>
    </div>
  );
}

/** توهّج المسرح حين يقترب الوقت أو ينتهي */
export function Pulse() {
  useEngine(); useTick();
  let m = '';
  if (S) { const v = timerView(); if (v.mine && !v.pl && (v.mode === 'warn' || v.mode === 'over')) m = v.mode; }
  return <div className={'pulse ' + m} id="pulse" />;
}

/** من يملك الكلمة ومن طلبها (floorHTML) */
export function FloorBar() {
  useEngine(); useTick();
  const f = S && S.floor; const hands = onlinePeople().filter((p) => p.hand).sort((a, b) => a.hand - b.hand);
  if ((!f || !f.uid) && !hands.length) return <div id="floorBar" hidden />;
  return (
    <div id="floorBar" className="floorbar">
      {f && f.uid
        ? <><span className="mic">🎙</span><b>الكلمة الآن لـ{f.name || memberName(f.uid)}</b><span className="num" data-since={f.at}>{fmt((Date.now() - f.at) / 1000)}</span></>
        : <b>لا أحد يملك الكلمة</b>}
      {hands.length ? <span className="q">طلبوا الكلمة: {hands.map((x, i) => `${AR(i + 1)}. ${x.name}`).join('، ')}</span> : null}
      {S && S.owner === ME.id && f && f.uid ? <button className="btn sm ghost" onClick={() => giveFloor('', '')}>إنهاء الكلمة</button> : null}
    </div>
  );
}
