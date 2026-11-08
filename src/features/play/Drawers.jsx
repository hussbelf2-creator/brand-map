/* الدروج الجانبية للطاولة: قائمة إعادة النظر، المكتبة الصوتية، ودليل البطاقة */
import React, { useReducer } from 'react';
import { S, ME, Q, ALLQ, N_Q, AR, ui, SND, bump, fmt, qlabel, qcode, placed, placedCount, timeOf, reviewItems } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { DrawerHead } from '../../ui/overlays.jsx';
import { jumpTo, followOn, toggleFollow, toggleAdv, toggleCall, finishSession, finishAsk } from './actions.js';

const H4 = { margin: '16px 0 8px', fontSize: '15px' };
const SW = { justifyContent: 'space-between', borderColor: 'var(--line)', color: 'var(--ink)' };

/** قائمة إعادة النظر (openReview) */
export function ReviewDrawer() {
  useEngine();
  if (!S) return <DrawerHead title="قائمة إعادة النظر" />;
  const it = reviewItems(); const open = ALLQ.filter((q) => !placed(q.id)); const over = ALLQ.filter((q) => { const t = timeOf(q.id); return t && t.s > t.d; });
  const li = (key, q, sub, extra) => (
    <button key={key} className="ritem" style={{ '--c': q.s.ci }} onClick={() => jumpTo(q.id)}>
      <i /><span><b>{qlabel(q)} · {q.slot}</b><small>{sub}</small></span>{extra || <Icon name="chevron-left" />}
    </button>
  );
  const fol = followOn(), adv = !!(S.cfg && S.cfg.adv !== false), call = !!(S.cfg && S.cfg.call);
  return (
    <>
      <DrawerHead title="قائمة إعادة النظر" />
      <p className="mini-note">القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب. كل ما هنا يُعاد فتحه ثلاث دقائق إضافية أو يُوسم للمراجعة بعد الجلسة.</p>
      <h4 style={H4}>تحتاج حسماً ({AR(it.length)})</h4>
      <div className="rlist">{it.length ? it.map((x, i) => li('c' + i, x.q, x.t)) : <p className="empty">لا شيء معلّق. أحسنتم.</p>}</div>
      <h4 style={H4}>تجاوزت وقتها ({AR(over.length)})</h4>
      <div className="rlist">{over.length ? over.map((q) => { const t = timeOf(q.id); return li(q.id, q, 'استغرقت ' + fmt(t.s) + ' من ' + fmt(t.d), <span className="chip bad num">{fmt(t.s)}</span>); }) : <p className="empty">كل البطاقات حُسمت ضمن وقتها.</p>}</div>
      <h4 style={H4}>لم توضع بعد ({AR(open.length)})</h4>
      <div className="rlist">{open.slice(0, 40).map((q) => li(q.id, q, q.s.ask))}</div>
      <div style={{ marginTop: '20px', display: 'grid', gap: '8px' }}>
        <label className={'toggle ' + (fol ? 'on' : '')} style={{ ...SW, background: 'none' }}><span><Icon name="eye" /> تتبّع الطاولة: انتقل تلقائياً مع من يدير الجلسة</span><button className={'sw2 ' + (fol ? 'on' : '')} onClick={toggleFollow} aria-label="تتبّع الطاولة" /></label>
        <label className="toggle" style={SW}><span><Icon name="chevron-left" /> انتقل للبطاقة التالية بعد الوضع</span><button className={'sw2 ' + (adv ? 'on' : '')} onClick={toggleAdv} aria-label="انتقال تلقائي" /></label>
        <label className="toggle" style={SW}><span>🎧 وضع الاجتماع الصوتي: أوقف الموسيقى لكل الأجهزة</span><button className={'sw2 ' + (call ? 'on' : '')} onClick={toggleCall} aria-label="وضع الاجتماع الصوتي" disabled={!!(S.owner && S.owner !== ME.id)} /></label>
        <button className="btn pri" onClick={() => (placedCount() === N_Q ? finishSession() : finishAsk())}><Icon name="layout-dashboard" /> إنهاء الجلسة وإنشاء لوحة المتابعة</button>
      </div>
    </>
  );
}

/** المكتبة الصوتية (openSound) */
export function SoundDrawer() {
  useEngine();
  const [, force] = useReducer((x) => x + 1, 0);
  const P = SND.P; const cur = SND.cur(); const call = !!(S && S.cfg && S.cfg.call);
  const after = () => { force(); bump(); }; // يعيد رسم زر الموسيقى في الشريط العلوي أيضاً
  return (
    <>
      <DrawerHead title={<><Icon name="music" /> المكتبة الصوتية</>} />
      <div className="snd">
        <p className="mini-note">كل الأصوات تُولَّد لحظياً على جهازك: عود على مقام الحجاز، دفّ، أجراس، ومؤثرات اللعب. لا تُحمَّل ملفات.</p>
        <label className="toggle" style={{ ...SW, width: '100%', marginTop: '12px' }}><span><Icon name={P.on ? 'volume-2' : 'volume-x'} /> تشغيل الأصوات</span><button className={'sw2 ' + (P.on ? 'on' : '')} onClick={() => { P.on = !P.on; SND.apply(); if (!P.on) SND.stopTrack(); after(); }} aria-label="تشغيل الأصوات" /></label>
        <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
          {[['vol', 'الصوت العام'], ['mus', 'الموسيقى الخلفية'], ['fx', 'المؤثرات']].map(([k, l]) => (
            <label className="slider" key={k}><span>{l}</span><input type="range" id={'sl_' + k} min="0" max="100" value={Math.round(P[k] * 100)} onChange={(e) => { P[k] = e.target.value / 100; SND.apply(); force(); }} /><output className="num">{Math.round(P[k] * 100)}</output></label>
          ))}
        </div>
        <h4>المسارات الخلفية</h4>
        {call ? <div className="whybox" style={{ marginBottom: '8px' }}><b>وضع الاجتماع الصوتي مفعّل</b>الموسيقى الخلفية متوقفة لأن الفريق يتحدث عبر السماعات. المؤثرات والجرس تعمل على كل جهاز في اللحظة نفسها. يمكن للمنشّط إيقاف هذا الوضع من «قائمة إعادة النظر».</div> : null}
        <div className="tracks" style={call ? { opacity: 0.45, pointerEvents: 'none' } : undefined}>
          {Object.entries(SND.TRACKS).map(([id, t]) => (
            <button key={id} className={'track ' + (cur === id ? 'on' : '')} onClick={() => { if (SND.cur() === id) SND.stopTrack(); else SND.startTrack(id); after(); }}>
              <span className="ti" style={{ background: t.c }}><Icon name={t.ic} /></span><span><b>{t.n}</b><small>{t.d}</small></span><span className="eq"><i /><i /><i /><i /></span>
            </button>
          ))}
        </div>
        {cur ? <button className="btn sm" style={{ marginTop: '8px' }} onClick={() => { SND.stopTrack(); after(); }}><Icon name="pause" /> أوقف المسار</button> : null}
        <h4>مؤثرات الطاولة</h4>
        <div className="fxlist">
          {Object.entries(SND.FX).map(([id, f]) => (
            <div className="fx" key={id}><span><b>{f.n}</b><small>{f.d}</small></span><button className="ibtn" onClick={() => SND.preview(id)} aria-label={'استمع: ' + f.n}><Icon name="play" /></button><button className={'sw2 ' + (P.off[id] ? '' : 'on')} onClick={() => { P.off[id] = !P.off[id]; SND.save(); force(); }} aria-label={'تفعيل ' + f.n} /></div>
          ))}
        </div>
      </div>
    </>
  );
}

/** دليل البطاقة الحالية (openGuide) */
export function GuideDrawer() {
  useEngine();
  const q = Q[ui.q] || ALLQ[0]; const g = q.g || {}, s = q.s;
  const parts = [['why', 'لماذا هذه البطاقة'], ['how', 'كيف تلعبها'], ['ex', 'مثال'], ['trap', 'الخطأ الشائع', 'trap'], ['tip', 'نصيحة المنشّط']].filter(([k]) => g[k]);
  return (
    <>
      <DrawerHead title={<><Icon name="book" /> دليل البطاقة</>} />
      <div style={{ '--c': s.c, '--ci': s.ci }}>
        <p className="mini-note" style={{ marginBottom: '12px' }}>{qcode(q)} · {s.name} — {q.t}</p>
        {q.note ? <div className="whybox" style={{ marginBottom: '12px' }}>{q.note}</div> : null}
        <div className="gb">{parts.length ? parts.map(([k, l, c]) => <div key={k} className={c || ''}><b>{l}</b>{g[k]}</div>) : <p className="mini-note">لا شرح إضافياً لهذه البطاقة في الدليل.</p>}</div>
        {q.type === 'opt' ? <><h4 style={{ margin: '18px 0 8px', fontSize: '15px' }}>متى تختار كل إجابة؟</h4><div className="gb">{q.ans.filter((a) => a.x).map((a) => <div key={a.k}><b>{a.t}</b>{a.x}</div>)}</div></> : null}
      </div>
    </>
  );
}
