/* صف مهمة متخصصة (مشترك بين الصفحات النهائية والمتابعة المتخصصة) — taskRow الأصلي */
import React, { useState } from 'react';
import { RO, TRACKS, TST, AR, placed, ansSummary, fmtDate } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal } from '../../ui/overlays.jsx';
import { CommitInput } from './CommitInput.jsx';
import { allTasks, setTask, saveTaskNote } from './logic.js';

const isoDay = (t) => { const d = new Date(t); return isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : ''; };

function TaskNoteModal({ id }) {
  useEngine();
  const t = allTasks().find((x) => x.id === id);
  const [note, setNote] = useState(t ? t.note : '');
  return (
    <>
      <h3><Icon name="pen-line" /> ملاحظة على المهمة</h3>
      <div className="mb"><p className="mini-note">{t ? t.t : ''}</p><textarea className="inp" id="tnT" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={() => { saveTaskNote(id, note); closeModal(); }}>احفظ</button></div>
    </>
  );
}
export const openTaskNote = (id) => openModal(<TaskNoteModal id={id} />);

export function TaskRow({ t, showPage = false }) {
  const T = TRACKS[t.track], st = TST[t.st] || TST.todo; const pl = placed(t.q);
  return (
    <div className={`task ${t.st} ${t.overdue ? 'late' : ''}`} style={{ '--tc': T.c }}>
      <span className="tk-ic" title={T.n}><Icon name={T.ic} /></span>
      <div className="tk-b">
        <b>{t.t}</b><small>{t.use}</small>
        <small className="dec">{pl ? 'القرار: ' + ansSummary(t.qq) : 'بانتظار قرار الطاولة على هذه البطاقة'}{showPage ? ` · الصفحات: ${t.secs.map((x) => AR(x)).join('، ')}` : ''}</small>
        {t.stale ? <span className="flag"><Icon name="triangle-alert" /> تغيّرت البطاقة بعد إنجاز المهمة — راجعوا التسليم</span> : null}
        {t.overdue ? <span className="flag"><Icon name="calendar-clock" /> متأخرة منذ {fmtDate(t.due)}</span> : null}
        {t.note ? <small className="nt">{t.note}</small> : null}
      </div>
      <div className="tk-c">
        <select className={`inp sm st-${st[1]}`} value={t.st} onChange={(e) => setTask(t.id, 'st', e.target.value)} aria-label="حالة المهمة" disabled={RO || !pl}>
          {Object.entries(TST).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
        <CommitInput className="inp sm" value={t.who} onCommit={(v) => setTask(t.id, 'who', v)} placeholder="المسؤول" aria-label="المسؤول" disabled={RO} />
        <CommitInput className={`inp sm ${t.dueSet ? '' : 'sug'}`} type="date" dir="ltr" value={isoDay(t.due)} onCommit={(v) => setTask(t.id, 'due', v)}
          title={t.dueSet ? 'الموعد المحدد' : 'موعد مقترح — غيّره أو ثبّته ليُحسب'} aria-label="الموعد" disabled={RO} />
        <button className="ibtn sm" onClick={() => openTaskNote(t.id)} title="ملاحظة على المهمة" aria-label="ملاحظة" disabled={RO}><Icon name="pen-line" /></button>
      </div>
    </div>
  );
}
