/* تبويب «الصفحات النهائية» في لوحة المتابعة — dPages الأصلي */
import React, { useRef, useState } from 'react';
import { ui, setUI, RO, CAP, Q, CM, DOCSECS, DOCST, TRACKS, AR, qcode, fmtDate, ago, featOn } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Mcard } from '../dashboard/Mcard.jsx';
import { dlDocx, dlHtml } from '../docs/export.js';
import { runPageAgents } from '../agents/AgentPanel.jsx';
import { CommitInput } from './CommitInput.jsx';
import { TaskRow } from './TaskRow.jsx';
import { pageState, allTasks, taskStats, pagesApproved, pageBlocks, pageNotes, dlPage, setPageSt, setPageOwner, addPageNote } from './logic.js';

const ST_CLS = ['none', 'warn', 'ok'];

/** عرض كتل الوثيقة كنص الصفحة (blocksHTML الأصلي): العناوين والفقرات والقوائم والجداول */
export function BlocksView({ B }) {
  // البنود المتتالية تُجمع في قائمة واحدة (مثل دمج </ul><ul> في الأصل)
  const G = []; B.forEach((b, i) => { if (b.li) { const l = G[G.length - 1]; if (l && l.lis) l.lis.push([i, b.li]); else G.push({ i, lis: [[i, b.li]] }); } else G.push({ i, b }); });
  const out = [];
  G.forEach(({ i, b, lis }) => {
    if (lis) { out.push(<ul key={'u' + i}>{lis.map(([j, t]) => <li key={j}>{t}</li>)}</ul>); return; }
    if (b.h) { const H = 'h' + Math.min(5, b.h + 2); out.push(<H key={i} style={b.c ? { color: b.c } : undefined}>{b.t}</H>); }
    else if (b.p != null) out.push(<p key={i} className={[b.b ? 'b' : '', b.muted ? 'm' : ''].filter(Boolean).join(' ') || undefined}>{b.p}</p>);
    else if (b.tb) out.push(<div key={i} className="tbw"><table className="t"><thead><tr>{b.head.map((x, j) => <th key={j}>{x}</th>)}</tr></thead><tbody>{b.tb.map((r, j) => <tr key={j}>{r.map((x, k) => <td key={k}>{x}</td>)}</tr>)}</tbody></table></div>);
  });
  return out.length ? <>{out}</> : null;
}

/** بطاقة مصغّرة مع مخرجها في الوثيقة (pcard الأصلي) */
function Pcard({ qid }) { const r = CM[qid]; return <Mcard q={Q[qid]}><small className="spec">المخرج: {r ? r.out : ''}</small></Mcard>; }

export default function PagesTab() {
  useEngine();
  const pgRef = useRef(null);
  const [pn, setPn] = useState('');
  const n = ui.page && DOCSECS[ui.page - 1] ? +ui.page : 1;
  const d = DOCSECS[n - 1], ps = pageState(n);
  const all = allTasks();
  const ts = all.filter((t) => t.secs.includes(n)); const bt = [...new Set(ts.map((t) => t.track))];
  const goPage = (x) => { setUI({ page: x }); const pg = pgRef.current; if (pg && innerWidth < 1000) pg.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const body = BlocksView({ B: pageBlocks(n).slice(1).filter((b) => b.p !== d.what) });
  const notes = pageNotes(n);
  const wf = ps.st === 0
    ? <button className="btn sm pri" onClick={() => setPageSt(n, 1)} disabled={RO}><Icon name="send" /> أرسلها للمراجعة</button>
    : ps.st === 1
      ? <><button className="btn sm gold" onClick={() => setPageSt(n, 2)} disabled={RO}><Icon name="badge-check" /> اعتمد الصفحة</button><button className="btn sm ghost" onClick={() => setPageSt(n, 0)} disabled={RO}>أعدها مسودة</button></>
      : <button className="btn sm ghost" onClick={() => setPageSt(n, 1)} disabled={RO}><Icon name="undo-2" /> ألغِ الاعتماد</button>;
  const addNote = () => { if (addPageNote(n, pn)) setPn(''); };

  return (
    <div className="pgw">
      <aside className="pn toc-w">
        <div className="pn-h"><div><h2><Icon name="file-text" /> الصفحات النهائية</h2><p>{AR(pagesApproved())} من ١١ معتمدة</p></div></div>
        {DOCSECS.map((x) => {
          const s = pageState(x.n), tk = taskStats(all.filter((t) => t.secs.includes(x.n))); const pc = s.feeds.length ? Math.round(s.placedN / s.feeds.length * 100) : 100;
          return (
            <button key={x.n} className={'toc' + (x.n === n ? ' on' : '')} onClick={() => goPage(x.n)}>
              <span className="i num">{AR(x.n)}</span>
              <span className="tt"><b>{x.t}</b><span className="meter"><i style={{ width: pc + '%', background: pc === 100 ? 'var(--ok)' : 'var(--warn)' }} /></span></span>
              <span className="sp">{s.changedAfter.length ? <i className="fl" title="تغيّرت بطاقاتها بعد الاعتماد">!</i> : null}<span className={'stpill ' + ST_CLS[s.st]}>{DOCST[s.st]}</span>{tk.overdue ? <small className="od">{AR(tk.overdue)} متأخرة</small> : null}</span>
            </button>
          );
        })}
        <div className="dlrow">{featOn('docx') ? <button className="btn sm" onClick={() => dlDocx()}><Icon name="download" /> الوثيقة كاملة Word</button> : null}<button className="btn sm ghost" onClick={() => dlHtml()}>HTML</button></div>
      </aside>

      <section className="pn page" ref={pgRef}>
        <div className="pg-h">
          <span className="pg-n">الصفحة {AR(n)} من ١١</span><h2>{d.t}</h2><p>{d.what}</p>
          <div className="pg-meta">
            <span className={'stpill ' + ST_CLS[ps.st]}>{DOCST[ps.st]}</span>
            {ps.st === 2 && ps.by ? <small>اعتمدها {ps.by} · {fmtDate(ps.at)}</small> : ps.by ? <small>{ps.by} · {ago(ps.at || Date.now())}</small> : null}
            <label className="owner">مالك الصفحة: <CommitInput key={n} id={'pgOwn_' + n} value={ps.owner} onCommit={(v) => setPageOwner(n, v)} placeholder="من يصوغها ويتابعها" disabled={RO} /></label>
            <span className="wf">{wf}{CAP.sample && featOn('agents')
              ? <button className="btn sm" onClick={() => runPageAgents(n)} disabled={!!ui.agBatch || RO}><Icon name="wand-sparkles" /> {ui.agBatch === n ? (ui.agBatchMsg || 'يعمل…') : 'شغّل وكلاء الصفحة'}</button>
              : null}</span>
          </div>
          {ps.changedAfter.length ? <div className="warnbox"><Icon name="triangle-alert" /> تغيّرت {AR(ps.changedAfter.length)} بطاقة بعد اعتماد هذه الصفحة: {ps.changedAfter.map((q) => qcode(Q[q]) + ' ' + Q[q].slot).join('، ')}. راجعوا النص وأعيدوا الاعتماد.</div> : null}
          {ps.weak.length && ps.st < 2 ? <div className="whybox"><b>قبل الاعتماد</b>{AR(ps.weak.length)} بطاقة في هذه الصفحة بتأكد منخفض أو بطاقة شك: {ps.weak.map((q) => Q[q].slot).join('، ')}.</div> : null}
        </div>

        {n === 10 ? null : <>
          <h3 className="pg-s"><Icon name="layout-grid" /> البطاقات المرتبطة بهذه الصفحة <small>{AR(ps.placedN)} من {AR(ps.feeds.length)} على الطاولة</small></h3>
          <div className="mgrid">{ps.feeds.map((q) => <Pcard key={q} qid={q} />)}</div>
        </>}

        <h3 className="pg-s"><Icon name="file-text" /> نص الصفحة كما سيظهر في الوثيقة <small>يتحدّث تلقائياً مع كل تغيير على البطاقات</small></h3>
        <div className="pg-body">{body || <p className="empty">لا محتوى بعد.</p>}</div>

        <h3 className="pg-s"><Icon name="users" /> المتابعة المتخصصة لهذه الصفحة <small>{bt.length ? bt.map((k) => TRACKS[k].n).join('، ') : 'لا جهات استلام محددة'}</small></h3>
        <div className="tasks">{ts.length
          ? bt.map((k) => <div key={k} className="tgrp"><h4 style={{ '--tc': TRACKS[k].c }}><Icon name={TRACKS[k].ic} /> {TRACKS[k].n}</h4>{ts.filter((t) => t.track === k).map((t) => <TaskRow key={t.id} t={t} />)}</div>)
          : <p className="empty">هذه الصفحة تُبنى من التعارضات وبطاقات الشك ودرجات التأكد، ولا تُسلَّم لجهة تنفيذ بعينها.</p>}</div>

        <h3 className="pg-s"><Icon name="messages-square" /> ملاحظات ومراجعات الصفحة</h3>
        <div className="pnote"><input className="inp" id="pnIn" maxLength={300} placeholder="اكتب ملاحظة أو قرار مراجعة…" value={pn} onChange={(e) => setPn(e.target.value)} disabled={RO} /><button className="btn pri" onClick={addNote} disabled={RO}>أضف</button></div>
        <div className="feed">{notes.length
          ? notes.map((x, i) => <div key={x.at + '-' + i} className="fi" style={{ '--ci': '#7A8896' }}><span className="dot" /><div><p><b>{x.by}</b></p><p className="t">{x.t}</p></div><time>{ago(x.at)}</time></div>)
          : <p className="empty">لا ملاحظات بعد.</p>}</div>

        <div className="dlrow pg-dl">
          <span className="mini-note">سلّم هذه الصفحة وحدها لجهتها:</span>
          <button className="btn sm pri" onClick={() => dlPage(n, 'docx')}><Icon name="download" /> Word</button><button className="btn sm" onClick={() => dlPage(n, 'html')}>HTML</button>
          <span style={{ marginInlineStart: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn sm ghost" onClick={() => goPage(Math.max(1, n - 1))} disabled={n === 1}><Icon name="chevron-right" /> السابقة</button>
            <button className="btn sm ghost" onClick={() => goPage(Math.min(11, n + 1))} disabled={n === 11}>التالية <Icon name="chevron-left" /></button>
          </span>
        </div>
      </section>
    </div>
  );
}
