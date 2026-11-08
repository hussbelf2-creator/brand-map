/* يد اللاعب (renderPanel): بطاقة السؤال، بطاقات الإجابة أو التعبئة، المؤقت، التأكد، التصويت، والوضع على اللوحة */
import React, { useReducer } from 'react';
import {
  S, RO, Q, ALLQ, N_Q, CL, AK, AR, ui, fmt, plist, confOf, doubtOn, timeOf, resolved, ansTitle, ansSummary, reviewMax,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { QuestionCard, CardTop, AnswerCardFace, Votes } from './QuestionCard.jsx';
import { FillBox } from './FillBox.jsx';
import { Timer, FloorBar } from './Timer.jsx';
import { fval, typeFill, selAnswer, setConf, toggleDoubt, doPlace, unplace, prevQ, nextQ, conflictsOfQ, openConflict, resolveExit } from './actions.js';

/** بطاقة الاحتياط: إجابة يكتبها الفريق بنفسه */
function SpareCard({ q, a, on }) {
  const [, force] = useReducer((x) => x + 1, 0);
  const v = fval(q.id, a.k);
  return (
    <div className={'acard spare ' + (on ? 'sel' : '')}>
      <CardTop q={q} a={a} /><span className="art"><Icon name="pen-line" /></span><b>{a.t || 'بطاقة احتياط'}</b><Votes qid={q.id} k={a.k} />
      <small>{a.d || 'اكتبوا إجابتكم إن لم تجدوها بين البطاقات'}</small>
      <input className="inp" id={'sp_' + q.id} value={v.text == null ? '' : String(v.text)} placeholder="اكتب هنا…" disabled={RO} onChange={(e) => { typeFill(q.id, a.k, ['text'], e.target.value); force(); }} />
      <button className={'btn sm ' + (on ? 'pri' : '')} type="button" onClick={() => selAnswer(a.k)}>{on ? 'مختارة' : 'اختر هذه البطاقة'}</button>
    </div>
  );
}

/** بطاقات الإجابة في اليد (answersHTML) */
export function Answers({ q }) {
  useEngine();
  if (q.type !== 'opt') return <>{q.ans.map((a) => <FillBox key={a.k} q={q} a={a} />)}</>;
  const sel = ui.sel[q.id] || plist(q.id);
  return (
    <>
      {q.ans.map((a) => {
        const on = sel.includes(a.k);
        if (a.spare) return <SpareCard key={a.k} q={q} a={a} on={on} />;
        return (
          <AnswerCardFace key={a.k} as="button" q={q} a={a} className={on ? 'sel' : ''} onClick={() => selAnswer(a.k)} aria-pressed={on}>
            <Votes qid={q.id} k={a.k} />
          </AnswerCardFace>
        );
      })}
    </>
  );
}

/** درجة التأكد وبطاقة الشك (confHTML) */
export function ConfBox({ q }) {
  useEngine();
  const c = confOf(q.id); const dz = doubtOn(q.id);
  return (
    <div className="confbox">
      <div className="h"><span>درجة التأكد</span><small>{c ? CL[c].t + ' — ' + CL[c].d : 'ظلّل من ١ إلى ٥'}</small></div>
      <div className="dots">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={n <= c ? 'on' : ''} style={n <= c ? { background: CL[c].c } : undefined} onClick={() => setConf(n)} aria-label={`تأكد ${n}: ${CL[n].t}`}>{n}<small>{CL[n].t}</small></button>)}
      </div>
      {c && c <= reviewMax() ? <div className="warnbox">قاعدة درجة التأكد: هذا القرار يدخل «قائمة إعادة النظر» في نهاية المحور.</div> : null}
      <div className="rowacts"><button type="button" className={'toggle ' + (dz ? 'on' : '')} onClick={toggleDoubt}><Icon name="circle-help" /> بطاقة شك {dz ? '· مرفوعة' : ''}</button></div>
    </div>
  );
}

/** حصيلة تصويت الطاولة (voteTally) */
export function VoteTally({ q }) {
  useEngine();
  const V = (S && S.votes && S.votes[q.id]) || {}; const voters = Object.entries(V).filter(([, a]) => Array.isArray(a) && a.length);
  if (!voters.length) return null;
  const by = {}; voters.forEach(([, a]) => a.forEach((k) => { by[k] = (by[k] || 0) + 1; }));
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0]; const a = AK(q, top[0]);
  return <div className="whybox"><b><Icon name="users" /> تصويت الطاولة</b>{AR(voters.length)} صوّتوا · الأعلى: «{a ? (a.t || ansTitle(q, top[0])) : top[0]}» ({AR(top[1])})</div>;
}

/** كروت التعارض الكاملة لبطاقة (conflictsHTML) — بمخارجها الثلاثة */
export function ConflictCards({ q }) {
  useEngine();
  const cs = conflictsOfQ(q.id); if (!cs.length || !S) return null;
  return (
    <>
      {cs.map((c) => (
        <div className="conf-card" key={c.id}>
          <h4><Icon name="triangle-alert" /> كرت التعارض: {c.title}</h4><p>{c.why}</p>
          <div className="exits">{c.exits.map((e, i) => { const on = !!(S.res && S.res[c.id] === i); return <button key={i} type="button" className={on ? 'on' : ''} onClick={() => resolveExit(c.id, i)}>{on ? '✓ ' : ''}{e}</button>; })}</div>
        </div>
      ))}
    </>
  );
}

/** اليد كاملة للبطاقة الحالية */
export function HandPanel() {
  useEngine();
  if (!S) return null;
  const q = Q[ui.q] || ALLQ[0]; const s = q.s; const pl = plist(q.id); const tm = timeOf(q.id); const idx = ALLQ.indexOf(q);
  const opt = q.type === 'opt';
  const sel = opt ? (ui.sel[q.id] || pl) : null;
  const changed = opt && pl.length > 0 && sel.join() !== pl.join();
  const many = opt && q.ans.length > 8;
  const hint = opt ? (q.max > 1 ? `اختاروا حتى ${AR(q.max)} بطاقات من اليد` : 'اختاروا بطاقة واحدة من اليد') : (q.max > 1 ? `املؤوا بطاقة لكل خيار (حتى ${AR(q.max)})` : 'اكتبوا إجابتكم على البطاقة');
  const why = opt ? sel.map((k) => AK(q, k)).filter((a) => a && (a.x || a.warn)) : [];
  const cfs = conflictsOfQ(q.id);
  return (
    <div className="hand-in" key={q.id} style={{ '--c': s.c, '--ci': s.ci }}>
      <div className="qslot"><QuestionCard q={q} /></div>
      <div className="arow-wrap">
        <div className="arow-h"><b>{opt ? 'بطاقات الإجابة' : 'بطاقة التعبئة'}</b><span>{hint}{opt ? <> · <span className="num">{sel.length}/{q.max}</span></> : null}</span></div>
        <div className={'arow ' + (many ? 'many' : '') + ' ' + (opt ? '' : 'fills')} id="arow" data-q={q.id}><Answers q={q} /></div>
      </div>
      <div className="ctrl">
        <FloorBar /><Timer /><ConfBox q={q} />{opt ? <VoteTally q={q} /> : null}
        {why.length
          ? why.map((a) => <div className="whybox" key={a.k}><b>{((a.pre ? a.pre + ' ' : '') + (a.t || '')).replace(/ـ+/g, '')}</b>{a.x || ''}{a.warn ? <div style={{ color: 'var(--danger)', fontWeight: 600, marginTop: '4px' }}>⚠ {a.warn}</div> : null}</div>)
          : (opt ? <div className="whybox hint">اسحبوا بطاقة من اليد لتروا متى تُختار ولماذا.</div> : null)}
        {cfs.map((c) => { const ok = resolved(c); return <button key={c.id} className={'cfx ' + (ok ? 'ok' : '')} onClick={() => openConflict(c)}><Icon name="triangle-alert" /> {ok ? 'محسوم: ' : 'تعارض: '}{c.title}</button>; })}
        <div className="placebar">
          {pl.length ? <div className="placed-note"><Icon name="badge-check" /><span>على اللوحة: {ansSummary(q)}</span>{tm ? <span className="num" style={{ color: tm.s > tm.d ? 'var(--danger)' : 'var(--ok)' }}>⏱ {fmt(tm.s)}</span> : null}</div> : null}
          {(!pl.length || changed || !opt)
            ? <button className={'btn ' + (q.gold ? 'gold' : 'pri') + ' big'} onClick={() => doPlace(false)} disabled={RO}><Icon name={pl.length ? 'refresh-cw' : 'download'} /> {pl.length ? 'حدّث البطاقة على اللوحة' : 'ضع البطاقة على اللوحة'}</button>
            : null}
          <div className="qnav">
            <button className="btn sm ghost" onClick={prevQ} disabled={idx === 0}><Icon name="chevron-right" /> السابقة</button>
            {pl.length && !RO ? <button className="btn sm ghost" onClick={unplace}><Icon name="undo-2" /> أعدها لليد</button> : null}
            <button className="btn sm ghost" onClick={nextQ} disabled={idx === N_Q - 1}>التالية <Icon name="chevron-left" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HandPanel;
