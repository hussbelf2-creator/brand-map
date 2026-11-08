/* درج البطاقة في لوحة المتابعة (openCardD الأصلية): القرار، النصوص، التأكد، التصويت، سجل التغيّرات، الوكيل، الدرس */
import React from 'react';
import { S, Q, ui, AR, CL, AK, plist, fillText, ansSummary, ansTitle, confOf, timeOf, doubtOn, qcode, fmt, fmtShort, memberName } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openDrawer, closeDrawer, DrawerHead } from '../../ui/overlays.jsx';
import { AgentPanel, agentName } from '../agents/AgentPanel.jsx';
import { openLesson } from '../lessons/LessonDrawer.jsx';
import { goQ } from '../play/actions.js';
import { go } from '../../nav.js';

export function CardDrawer({ qid }) {
  useEngine();
  const q = Q[qid]; if (!q || !S) return null;
  const s = q.s;
  const H = Object.values((S.hist || {})[qid] || {}).filter((e) => e && e.at).sort((a, b) => b.at - a.at);
  const pl = plist(qid); const V = (S.votes || {})[qid] || {};
  const c = confOf(qid), tm = timeOf(qid);
  const jump = () => { closeDrawer(); if (ui.view !== 'play') go('play'); goQ(qid); };
  return (
    <>
      <DrawerHead title={`${qcode(q)} · ${q.slot}`} />
      <div style={{ '--c': s.c, '--ci': s.ci }}>
        <p className="mini-note">المحور {AR(s.n)} · {s.name} — {q.t}{q.gold ? ' · ★ ذهبية' : ''}</p>
        <div className="whybox" style={{ marginTop: 12 }}><b>القرار الحالي</b>{pl.length ? ansSummary(q) : 'لم يُحسم بعد'}</div>
        {pl.map((k) => { const a = AK(q, k), t = fillText(q, k); return t ? <pre key={k} className="ft">{t}</pre> : a && a.x ? <p key={k} style={{ marginTop: 8, fontSize: 14 }}>{a.x}</p> : null; })}
        <div className="dmeta">
          <span>التأكد: <b>{c ? c + '/5 · ' + CL[c].t : '—'}</b></span>
          <span>زمن النقاش: <b>{tm ? fmt(tm.s) : '—'}</b></span>
          {doubtOn(qid) ? <span className="chip warn">بطاقة شك</span> : null}
        </div>
        {Object.keys(V).length ? (
          <>
            <h4 style={{ margin: '16px 0 6px', fontSize: 15 }}>تصويت الطاولة</h4>
            <div className="rlist">
              {Object.entries(V).filter(([, a]) => Array.isArray(a) && a.length).map(([u, a]) => (
                <div key={u} className="mini-note">{memberName(u)}: {a.map((k) => (AK(q, k) || {}).t || ansTitle(q, k)).join('، ')}</div>
              ))}
            </div>
          </>
        ) : null}
        <h4 style={{ margin: '16px 0 8px', fontSize: 15 }}>سجل التغيّرات ({AR(H.length)})</h4>
        <div className="feed">
          {H.length ? H.map((e, i) => (
            <div key={i} className="fi" style={{ '--ci': s.ci }}>
              <span className="dot" />
              <div style={{ minWidth: 0 }}><p><b>{e.by || ''}</b> {e.from ? 'غيّر القرار' : 'وضع القرار'}</p><p className="t">{e.from ? `«${e.from}» ← ` : ''}«{e.to}»</p></div>
              <time>{fmtShort(e.at)}</time>
            </div>
          )) : <p className="empty">لا تغييرات مسجّلة.</p>}
        </div>
        <h4 style={{ margin: '16px 0 8px', fontSize: 15 }}><Icon name="wand-sparkles" /> {agentName(q)}</h4>
        <div data-aghost={qid}><AgentPanel qid={qid} /></div>
        <button className="btn" style={{ marginTop: 12, width: '100%' }} onClick={() => openLesson(qid)}><Icon name="book" /> درس البطاقة</button>
        <button className="btn pri" style={{ marginTop: 8, width: '100%' }} onClick={jump}><Icon name="orbit" /> افتحها على الطاولة</button>
      </div>
    </>
  );
}

/** openCardD(qid): يفتح درج البطاقة */
export function openCardD(qid) { if (!Q[qid]) return; openDrawer(<CardDrawer qid={qid} />); }
