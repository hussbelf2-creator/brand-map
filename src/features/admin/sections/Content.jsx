/* المحتوى والدروس: الدروس الأساسية، كروت التعارض، الصفحة الرئيسية، شريط الإعلان (admContent · ctSave) */
import React, { useState } from 'react';
import { PRISTINE, Q, SPECIAL0, cmsG, cmsL, qcode } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { Panel } from '../../../ui/Panel.jsx';
import { ADM, admSet, useAdm } from '../store.js';
import { AdmHead, DirtyBar, Seg, Tog } from '../parts.jsx';
import { ctSave, lsReset } from '../logic.js';

const TABS = [['lessons', 'الدروس الأساسية'], ['conf', 'كروت التعارض'], ['landing', 'الصفحة الرئيسية'], ['ann', 'شريط الإعلان']];

export default function Content() {
  useEngine(); useAdm();
  const t = ADM.ktab || 'lessons';
  const tabs = <Seg items={TABS} val={t} onPick={(k) => admSet({ ktab: k })} />;
  if (t === 'conf') return <ConfTab tabs={tabs} />;
  if (t === 'landing') return <LandingTab tabs={tabs} />;
  if (t === 'ann') return <AnnTab tabs={tabs} />;
  return <LessonsTab key={cmsL().ver || 0} tabs={tabs} />;
}

const SaveBtn = ({ k, v }) => <button className="btn pri" onClick={() => ctSave(k, v)}><Icon name="check" /> احفظ</button>;

function LessonsTab({ tabs }) {
  const L = cmsL();
  const [v, setV] = useState(() => Object.fromEntries(SPECIAL0.map((x) => { const o = (L.lessons || {})[x.id] || {}; return [x.id, { t: o.t || x.t, b: o.body || x.body, u: (o.use || x.use || []).join('\n') }]; })));
  const set = (id, k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [id]: { ...o[id], [k]: x } })); };
  return (
    <>
      <AdmHead t="المحتوى والدروس" sub="الدروس الأساسية في قسم الدروس، ويقرؤها المساعد الذكي أيضاً. دروس البطاقات تُعدَّل من قسم البطاقات.">{tabs}<SaveBtn k="lessons" v={v} /></AdmHead>
      <div className="axgrid">
        {SPECIAL0.map((x) => {
          const o = (L.lessons || {})[x.id] || {}; const f = v[x.id];
          return (
            <div key={x.id} className="axed">
              <div className="axed-h"><span className="axn"><Icon name={x.ic} /></span><b>{o.t || x.t}</b>{Object.keys(o).length ? <button className="btn sm ghost" onClick={() => lsReset(x.id)}><Icon name="undo-2" /> الأصل</button> : null}</div>
              <div className="formgrid">
                <label className="fld full">العنوان<input className="inp" id={'ls_t_' + x.id} value={f.t} onChange={set(x.id, 't')} /></label>
                <label className="fld full">الشرح<textarea className="inp" rows={4} id={'ls_b_' + x.id} value={f.b} onChange={set(x.id, 'b')} /></label>
                <label className="fld full">كيف تستفيد (سطر لكل نقطة)<textarea className="inp" rows={3} id={'ls_u_' + x.id} value={f.u} onChange={set(x.id, 'u')} /></label>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const qid = (x) => String(x).replace('.', '_');
function ConfTab({ tabs }) {
  const G = cmsG();
  const [v, setV] = useState(() => Object.fromEntries(PRISTINE.conflicts.map((c) => { const o = (G.conflicts || {})[c.id] || {}; return [c.id, { on: !o.off, t: o.title || c.title, w: o.why || c.why, x: (o.exits || c.exits).join('\n') }]; })));
  const put = (id, k, x) => setV((o) => ({ ...o, [id]: { ...o[id], [k]: x } }));
  const set = (id, k) => (e) => put(id, k, e.target.value);
  return (
    <>
      <AdmHead t="المحتوى والدروس" sub="كروت التعارض تُرفع تلقائياً حين يتصادم قراران.">{tabs}<SaveBtn k="conf" v={v} /></AdmHead>
      <DirtyBar />
      <div className="axgrid">
        {PRISTINE.conflicts.map((c) => {
          const o = (G.conflicts || {})[c.id] || {}; const f = v[c.id];
          const a = Q[qid(c.a[0])], bb = c.b.map((b) => Q[qid(b[0])]).filter(Boolean);
          return (
            <div key={c.id} className="axed">
              <div className="axed-h"><b>{o.title || c.title}</b><small>{a ? qcode(a) : ''} × {bb.map(qcode).join('، ')}</small></div>
              <Tog id={'cf_on_' + c.id} on={f.on} onChange={(x) => put(c.id, 'on', x)} lbl="الكرت مفعّل" />
              <div className="formgrid">
                <label className="fld full">العنوان<input className="inp" id={'cf_t_' + c.id} value={f.t} onChange={set(c.id, 't')} /></label>
                <label className="fld full">لماذا يتعارضان<textarea className="inp" rows={2} id={'cf_w_' + c.id} value={f.w} onChange={set(c.id, 'w')} /></label>
                <label className="fld full">مخارج الحسم (سطر لكل مخرج)<textarea className="inp" rows={3} id={'cf_x_' + c.id} value={f.x} onChange={set(c.id, 'x')} /></label>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function LandingTab({ tabs }) {
  const [v, setV] = useState(() => { const P = cmsL().landing || {}; return { eyebrow: P.eyebrow || '', a: P.a || '', b: P.b || '', lead: P.lead || '' }; });
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  return (
    <>
      <AdmHead t="المحتوى والدروس" sub="نصوص الواجهة الأولى التي يراها الزائر.">{tabs}<SaveBtn k="landing" v={v} /></AdmHead>
      <Panel title="الواجهة الرئيسية" sub="اترك الحقل فارغاً لاستخدام النص الأصلي.">
        <div className="formgrid">
          <label className="fld full">السطر الصغير فوق العنوان<input className="inp" id="lpE" value={v.eyebrow} onChange={set('eyebrow')} placeholder="لعبة طاولة لبناء استراتيجية العلامة" /></label>
          <label className="fld">العنوان<input className="inp" id="lpA" value={v.a} onChange={set('a')} placeholder="ثمانية قرارات" /></label>
          <label className="fld">الجزء الملوّن من العنوان<input className="inp" id="lpB" value={v.b} onChange={set('b')} placeholder="تصنع علامة" /></label>
          <label className="fld full">الفقرة التعريفية<textarea className="inp" rows={4} id="lpL" value={v.lead} onChange={set('lead')} /></label>
        </div>
      </Panel>
    </>
  );
}

const ANN_TO = [['', 'بلا زر'], ['plans', 'الباقات'], ['start', 'البداية'], ['upload', 'رفع صور اللعبة'], ['lessons', 'الدروس'], ['chat', 'المساعد الذكي']];
function AnnTab({ tabs }) {
  const [v, setV] = useState(() => { const A = cmsL().announce || {}; return { on: !!A.on, text: A.text || '', btn: A.btn || '', to: ANN_TO.some((x) => x[0] === A.to) ? A.to : '', kind: A.kind === 'info' ? 'info' : 'gold' }; });
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  return (
    <>
      <AdmHead t="المحتوى والدروس" sub="شريط أعلى كل الصفحات لإعلان أو عرض أو تنبيه صيانة.">{tabs}<SaveBtn k="ann" v={v} /></AdmHead>
      <Panel title="شريط الإعلان">
        <Tog id="anOn" on={v.on} onChange={(x) => setV((o) => ({ ...o, on: x }))} lbl="الشريط ظاهر" />
        <div className="formgrid">
          <label className="fld full">النص<input className="inp" id="anT" value={v.text} onChange={set('text')} maxLength={160} placeholder="مثال: خصم ٢٠٪ على الباقة السنوية حتى نهاية الشهر بكود BRAND20" /></label>
          <label className="fld">نص الزر<input className="inp" id="anB" value={v.btn} onChange={set('btn')} placeholder="اعرف أكثر" /></label>
          <label className="fld">وجهة الزر<select className="inp" id="anU" value={v.to} onChange={set('to')}>{ANN_TO.map(([k, x]) => <option key={k} value={k}>{x}</option>)}</select></label>
          <label className="fld">النمط<select className="inp" id="anK" value={v.kind} onChange={set('kind')}><option value="gold">ذهبي (عرض)</option><option value="info">معلومة</option></select></label>
        </div>
      </Panel>
    </>
  );
}
