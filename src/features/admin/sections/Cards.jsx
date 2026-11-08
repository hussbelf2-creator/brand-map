/* البطاقات: قائمة بطاقات المحور، أو محرّر البطاقة (admCards) */
import React from 'react';
import { N, N_Q, STAGES, cmsA, cmsG, qcode } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { ADM, admSet, useAdm } from '../store.js';
import { AdmHead, DirtyBar } from '../parts.jsx';
import { cardHide, startEdit } from '../logic.js';
import CardEditor from '../CardEditor.jsx';
import { openLesson } from '../../lessons/LessonDrawer.jsx';

function CardStatus({ q }) {
  const G = cmsG();
  return (
    <>
      {q.isNew ? <span className="chip ok">مضافة</span> : null}
      {(G.cards || {})[q.id] && !q.isNew ? <span className="chip warn">معدّلة</span> : null}
      {q.hidden ? <span className="chip bad">مخفية</span> : null}
      {q.gold ? <span className="chip gold">ذهبية</span> : null}
      {((cmsA().cards || {})[q.id] || {}).off ? <span className="chip bad">الوكيل موقوف</span> : null}
    </>
  );
}

export default function Cards() {
  useEngine(); useAdm();
  if (ADM.eq) return <CardEditor />;
  const s = STAGES[ADM.ax - 1] || STAGES[0];
  const list = [...s.qs, ...(s.hiddenQs || [])].sort((a, b) => a.no - b.no);
  return (
    <>
      <AdmHead t="البطاقات" sub={`${N(N_Q)} بطاقة نشطة في ${N(STAGES.length)} محاور. التعديل يصل للطاولة والدروس والوكلاء والوثيقة.`}>
        <button className="btn pri" onClick={() => startEdit(null, s.n)}><Icon name="plus" /> بطاقة جديدة في «{s.name}»</button>
      </AdmHead>
      <DirtyBar />
      <div className="axtabs">
        {STAGES.map((x) => <button key={x.n} className={ADM.ax === x.n ? 'on' : ''} style={{ '--c': x.c, '--ci': x.ci }} onClick={() => admSet({ ax: x.n })}><i>{x.n}</i>{x.name}<small>{N(x.qs.length)}</small></button>)}
      </div>
      <div className="clist">
        {list.map((q) => (
          <article key={q.id} className={'crow ' + (q.hidden ? 'hid' : '')} style={{ '--c': s.c, '--ci': s.ci }}>
            <span className="cic"><Icon name={q.ic || 'circle-help'} /></span>
            <div className="cb">
              <b><span className="codechip">{qcode(q)}</span> {q.slot}</b>
              <small>{q.head || q.sub || ''}</small>
              <span className="chips">
                {q.type === 'opt' ? <span className="chip">اختيار · {N(q.ans.filter((a) => !a.spare).length)} إجابات</span> : <span className="chip">تعبئة · {N(q.ans.length)} حقول</span>}
                <CardStatus q={q} />
              </span>
            </div>
            <div className="ca">
              <button className="btn sm" onClick={() => startEdit(q.id)}><Icon name="pen-line" /> تعديل</button>
              {q.hidden ? null : <button className="btn sm ghost" onClick={() => openLesson(q.id)}><Icon name="book" /> الدرس</button>}
              <button className="btn sm ghost" onClick={() => cardHide(q.id, !q.hidden)}><Icon name={q.hidden ? 'eye' : 'eye-off'} /> {q.hidden ? 'إظهار' : 'إخفاء'}</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
