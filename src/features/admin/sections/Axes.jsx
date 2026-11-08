/* المحاور والتصميم (admAxes · axSave) */
import React, { useState } from 'react';
import { N, STAGES, cmsG } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { admSet, useAdm } from '../store.js';
import { AdmHead, DirtyBar } from '../parts.jsx';
import { AX_KEYS, axReset, axSave } from '../logic.js';

export default function Axes() {
  useEngine(); useAdm();
  const [vals, setVals] = useState(() => Object.fromEntries(STAGES.map((s) => [s.n, Object.fromEntries(AX_KEYS.map((k) => [k, s[k] ?? '']))])));
  const set = (n, k) => (e) => { const x = e.target.value; setVals((o) => ({ ...o, [n]: { ...o[n], [k]: x } })); };
  const G = cmsG();
  return (
    <>
      <AdmHead t="المحاور والتصميم" sub="أسماء المحاور وأسئلتها ومددها وألوانها كما تظهر على الطاولة والخريطة والدروس والوثيقة."><button className="btn pri" onClick={() => axSave(vals)}><Icon name="check" /> احفظ المحاور</button></AdmHead>
      <DirtyBar />
      <div className="axgrid">
        {STAGES.map((s) => {
          const o = (G.stages || {})[s.n] || {}; const v = vals[s.n] || {};
          return (
            <div key={s.n} className="axed" style={{ '--c': s.c, '--ci': s.ci }}>
              <div className="axed-h">
                <span className="axn">{s.n}</span><b>{s.name}</b>
                <small>{N(s.qs.length)} بطاقات{(s.hiddenQs || []).length ? ' · ' + N(s.hiddenQs.length) + ' مخفية' : ''}</small>
                {Object.keys(o).length ? <button className="btn sm ghost" onClick={() => axReset(s.n)}><Icon name="undo-2" /> الأصل</button> : null}
              </div>
              <div className="formgrid">
                <label className="fld">اسم المحور<input className="inp" value={v.name} onChange={set(s.n, 'name')} /></label>
                <label className="fld">السؤال المحوري<input className="inp" value={v.ask} onChange={set(s.n, 'ask')} /></label>
                <label className="fld">المدة المقترحة (دقيقة)<input className="inp" type="number" min="5" dir="ltr" value={v.min} onChange={set(s.n, 'min')} /></label>
                <div className="fld">الألوان<span className="clr">
                  <input type="color" value={v.c} onChange={set(s.n, 'c')} title="اللون الأساسي" />
                  <input type="color" value={v.ci} onChange={set(s.n, 'ci')} title="لون الحبر" />
                  <i style={{ background: v.c }} /><i style={{ background: v.ci }} />
                </span></div>
                <label className="fld full">تمهيد المحور<textarea className="inp" rows={2} value={v.intro} onChange={set(s.n, 'intro')} /></label>
              </div>
              <button className="btn sm" onClick={() => admSet({ ax: s.n, sec: 'cards', eq: null })}><Icon name="layout-grid" /> بطاقات المحور</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
