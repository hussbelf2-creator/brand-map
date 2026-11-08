/* تبويب «المتابعة المتخصصة» في لوحة المتابعة — dTracks الأصلي */
import React from 'react';
import { ui, setUI, S, RO, TRACKS, AR } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { CommitInput } from './CommitInput.jsx';
import { TaskRow } from './TaskRow.jsx';
import { allTasks, taskStats, fixDues, setTrackLead } from './logic.js';

const FILTERS = [['open', 'مفتوحة'], ['late', 'تحتاج تدخّلاً'], ['done', 'منجزة'], ['wait', 'بانتظار الطاولة'], ['all', 'الكل']];

export default function TracksTab() {
  useEngine();
  const all = allTasks(); const tk = TRACKS[ui.trk] ? ui.trk : 'all'; const f = ui.tkf || 'open';
  const leadOf = (k) => (((S && S.tracks) || {})[k] || {}).who || '';
  const cards = Object.entries(TRACKS).map(([k, T]) => {
    const st = taskStats(all.filter((t) => t.track === k)); const pc = st.all ? Math.round(st.done / st.all * 100) : 0; const lead = leadOf(k);
    return (
      <button key={k} className={'trk' + (tk === k ? ' on' : '')} onClick={() => setUI({ trk: k })} style={{ '--tc': T.c }}>
        <span className="th"><span className="ti"><Icon name={T.ic} /></span><b>{T.n}</b></span><span className="tn">{lead || 'لم يُحدَّد مسؤول'}</span>
        <span className="meter"><i style={{ width: pc + '%', background: T.c }} /></span>
        <span className="tc"><span className="num">{st.done}/{st.all}</span> منجزة{st.overdue ? <> · <b className="od">{AR(st.overdue)} متأخرة</b></> : null}{st.blocked ? <> · <b className="od">{AR(st.blocked)} متعثّرة</b></> : null}{st.stale ? <> · <b className="od">{AR(st.stale)} تحتاج مراجعة</b></> : null}</span>
      </button>
    );
  });
  let list = all.filter((t) => tk === 'all' || t.track === tk);
  list = list.filter((t) => (f === 'all' ? true : f === 'open' ? t.ready && t.st !== 'done' : f === 'late' ? t.overdue || t.stale : f === 'done' ? t.st === 'done' : f === 'wait' ? !t.ready : true)).sort((a, b) => (b.overdue - a.overdue) || (a.due - b.due));
  const sAll = taskStats(all); const need = sAll.overdue + sAll.blocked + sAll.stale;

  return (
    <>
      <div className="kps three">
        <div className="kp"><span className="l">مهام جاهزة للتنفيذ</span><span className="v">{sAll.all}</span><span className="s">من {AR(all.length)} مهمة في الجدول</span></div>
        <div className="kp"><span className="l">منجزة</span><span className="v">{sAll.done}<small>/{sAll.all}</small></span><span className="s">{sAll.doing} جارية</span></div>
        <div className="kp"><span className="l">تحتاج تدخّلاً</span><span className="v" style={{ color: need ? 'var(--danger)' : 'inherit' }}>{need}</span><span className="s">متأخرة {sAll.overdue} · متعثّرة {sAll.blocked} · تغيّرت بطاقتها {sAll.stale}</span></div>
      </div>
      <Panel title={<><Icon name="users" /> المتابعة المتخصصة</>} sub="كل مخرج من البطاقات يُسلَّم لجهة تنفيذ بحسب جدول «من البطاقة إلى الوثيقة». حدّدوا مسؤول كل جهة وتابعوا مهامها."
        act={<span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn sm" onClick={() => fixDues(tk)} title="تحويل المواعيد المقترحة إلى مواعيد ملزِمة تُحسب في التأخير" disabled={RO}><Icon name="calendar-clock" /> ثبّت المواعيد المقترحة{tk === 'all' ? '' : ' لهذا المسار'}</button>
          <button className={'btn sm' + (tk === 'all' ? ' pri' : '')} onClick={() => setUI({ trk: 'all' })}>كل الجهات</button>
        </span>}>
        <div className="trks">{cards}</div>
      </Panel>
      <Panel title={tk === 'all' ? 'كل المهام' : <><Icon name={TRACKS[tk].ic} /> {TRACKS[tk].n}</>}
        sub={tk === 'all' ? '' : <label className="owner">مسؤول المسار: <CommitInput key={tk} id="trkLead" value={leadOf(tk)} onCommit={(v) => setTrackLead(tk, v)} placeholder="اسم من يقود هذا التخصص" disabled={RO} /></label>}>
        <div className="chips">{FILTERS.map(([k, l]) => <button key={k} className={f === k ? 'on' : undefined} onClick={() => setUI({ tkf: k })}>{l}</button>)}</div>
        <div className="tasks">{list.length ? list.map((t) => <TaskRow key={t.id} t={t} showPage />) : <p className="empty">لا مهام في هذا التصنيف.</p>}</div>
      </Panel>
    </>
  );
}
