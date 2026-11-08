/* بطاقة مصغّرة لقرار (mcard الأصلية): الرمز، الخانة، القرار، التأكد، الزمن، الشك، مرات التغيير، تقييم الوكيل */
import React from 'react';
import { placed, timeOf, doubtOn, qcode, ansSummary, fmt, AR } from '../../engine/engine.js';
import { AgentScoreChip } from '../agents/AgentPanel.jsx';
import { ConfDots } from './charts.jsx';
import { lastChange, histCount, isNew } from './logic.js';
import { openCardD } from './CardDrawer.jsx';

/** Mcard({q}) — الضغط يفتح درج البطاقة. children (اختياري) يُعرض بعد سطر القرار مباشرة (مثل «المخرج» في الصفحات) */
export function Mcard({ q, onClick, children }) {
  const pl = placed(q.id), tm = timeOf(q.id), lc = lastChange(q.id), hc = histCount(q.id);
  return (
    <button className={'mc' + (q.gold ? ' gold' : '') + (pl ? '' : ' open')} style={{ '--ci': q.s.ci, '--c': q.s.c }} onClick={onClick || (() => openCardD(q.id))}>
      <span className="mt"><span className="num">{qcode(q)}</span><span>{q.slot}</span></span>
      <b>{pl ? ansSummary(q) : 'قيد الحسم'}</b>
      {children}
      <span className="mf">
        <ConfDots id={q.id} />
        {tm ? <span className={'tmc' + (tm.s > tm.d ? ' over' : '')}>⏱ {fmt(tm.s)}</span> : null}
        {doubtOn(q.id) ? <span className="db">؟</span> : null}
        {hc > 1 ? <span className="hc" title="عدد مرات التغيير">↻ {AR(hc - 1)}</span> : null}
        <AgentScoreChip qid={q.id} />
        {lc && isNew(lc.at) ? <span className="nb">جديد</span> : null}
      </span>
    </button>
  );
}
export default Mcard;
