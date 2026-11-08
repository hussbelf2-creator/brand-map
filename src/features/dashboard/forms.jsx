/* نوافذ لوحة المتابعة: تسجيل متابعة، تحديث اتجاه PESTLE، مؤشر سوق، قراءة، تحرّك منافس، منافس جديد، إنهاء الجلسة */
import React, { useState } from 'react';
import { S, ME, STAGES, AXMETA, AR, N_Q, placedCount, stageOf, fget, compList } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal, toast } from '../../ui/overlays.jsx';
import { finishSession } from '../play/actions.js';
import {
  STS, PEST, MOVE_T, RISK_L, setDsel, axLast, axKpi, liveInds, todayISO,
  saveCheck, pestSave, indSave, readSave, moveSave, compSave,
} from './logic.js';

/* ---------- تسجيل متابعة ---------- */
/** checkBody(s,l): حقول نموذج المتابعة لمحور */
export function CheckBody({ s, l, v, set }) {
  const kpi = axKpi(s.n);
  return (
    <>
      <p style={{ padding: '10px 12px', borderRadius: 12, background: `color-mix(in srgb,${s.c} 16%,var(--panel))`, fontWeight: 600 }}>{s.name}: {AXMETA[s.n].watch}</p>
      <div className="fld">الحالة<div className="stchoice">
        {Object.entries(STS).map(([k, x]) => <button key={k} type="button" className={k + (v.st === k ? ' on' : '')} onClick={() => { set({ st: k }); setDsel({ st: k }); }}>{x.t}<small>{x.d}</small></button>)}
      </div></div>
      <label className="slider" style={{ gridTemplateColumns: '110px 1fr 48px' }}><span>نسبة التطبيق</span>
        <input type="range" id="ckPct" min="0" max="100" step="5" value={v.pct} onChange={(e) => set({ pct: +e.target.value })} /><output className="num">{v.pct}٪</output></label>
      <label className="fld">{kpi}{l && l.kpi ? <> <small style={{ fontWeight: 500 }}>(السابق: {l.kpi})</small></> : null}<input className="inp" id="ckKpi" placeholder="القيمة الحالية للمؤشر" value={v.kpi} onChange={(e) => set({ kpi: e.target.value })} /></label>
      <label className="fld">ماذا تغيّر منذ آخر مراجعة؟<textarea className="inp" id="ckNote" rows="3" value={v.note} onChange={(e) => set({ note: e.target.value })} /></label>
      <label className="fld">الخطوة التالية ومسؤولها<input className="inp" id="ckNext" placeholder="مثال: اختبار الشعار مع ٢٠ عميلاً — التسويق" value={v.next} onChange={(e) => set({ next: e.target.value })} /></label>
      <label className="fld">سجّلها<input className="inp" id="ckBy" placeholder="اسمك" value={v.by} onChange={(e) => set({ by: e.target.value })} /></label>
    </>
  );
}
export const checkBody = CheckBody;

function CheckModal({ n, init }) {
  useEngine();
  const blank = (st, pct) => ({ st, pct, kpi: '', note: '', next: '', by: ME.alias || '' });
  const [ax, setAx] = useState(n || 1);
  const [v, setV] = useState(() => blank(init.st, init.pct));
  const set = (p) => setV((o) => ({ ...o, ...p }));
  if (!S) return null;
  const s = stageOf(ax), l = axLast(ax);
  const pickAx = (x) => { setAx(x); setDsel({ ax: x }); setV((o) => blank(o.st, init.pct)); };
  const save = () => { if (saveCheck({ ax, ...v })) closeModal(); };
  return (
    <>
      <h3><Icon name="activity" /> تسجيل متابعة</h3>
      <div className="mb chkform">
        {n ? null : (
          <label className="fld">المحور<div className="seg" id="ckAx">
            {STAGES.map((x) => <button key={x.n} type="button" className={x.n === ax ? 'on' : ''} onClick={() => pickAx(x.n)}>{x.name}</button>)}
          </div></label>
        )}
        <div id="ckBody"><CheckBody s={s} l={l} v={v} set={set} /></div>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}><Icon name="check" /> احفظ المتابعة</button></div>
    </>
  );
}
/** openCheck(n): n = رقم المحور، أو 0 لاختيار المحور داخل النافذة */
export function openCheck(n) {
  const ax = n || 1; const pct = (axLast(ax) || {}).pct ?? 50;
  setDsel({ st: 'ok', ax, pct });
  openModal(<CheckModal key={Date.now()} n={n} init={{ st: 'ok', pct }} />);
}

/* ---------- PESTLE ---------- */
function PestEditModal({ k }) {
  const [, , n] = PEST.find((x) => x[0] === k);
  const [t, setT] = useState(() => fget('1_2', '1')[k] || '');
  const save = () => { if (pestSave(k, t)) closeModal(); };
  return (
    <>
      <h3><Icon name="globe" /> تحديث اتجاه: {n}</h3>
      <div className="mb"><label className="fld">الاتجاه بصيغة «التغيير ← فرصة أو تهديد علينا»<textarea className="inp" id="peT" rows="3" value={t} onChange={(e) => setT(e.target.value)} /></label><p className="mini-note">يُحدَّث على بطاقة «اتجاهات السوق» في الطاولة أيضاً، ويُسجَّل في سجل التغيّرات.</p></div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>احفظ</button></div>
    </>
  );
}
export function openPestEdit(k) { if (!PEST.find((x) => x[0] === k)) return; openModal(<PestEditModal key={k + Date.now()} k={k} />); }

/** مجموعة أزرار اختيار واحد (.seg / .opts) */
function Seg({ id, cls = 'seg', opts, value, onPick }) {
  return <div className={cls} id={id}>{opts.map(([v, t]) => <button key={v} type="button" className={String(value) === String(v) ? 'on' : ''} data-v={v} onClick={() => onPick(v)}>{t}</button>)}</div>;
}

/* ---------- مؤشرات السوق ---------- */
function IndAddModal() {
  const [f, setF] = useState({ name: '', unit: '', good: 'up' });
  const save = () => { if (indSave(f)) closeModal(); };
  return (
    <>
      <h3><Icon name="trending-up" /> مؤشر سوق جديد</h3>
      <div className="mb">
        <label className="fld">اسم المؤشر<input className="inp" id="iN" maxLength={50} placeholder="مثال: عدد المتاجر التي تبيع الفئة" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="fld">الوحدة<input className="inp" id="iU" maxLength={20} placeholder="ريال، ٪، متجر…" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></label>
        <div className="fld">الاتجاه الأفضل<Seg id="iG" opts={[['up', 'الصعود أفضل'], ['down', 'النزول أفضل']]} value={f.good} onPick={(v) => setF({ ...f, good: v })} /></div>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>أضف</button></div>
    </>
  );
}
export function openIndAdd() { openModal(<IndAddModal key={Date.now()} />); }

function ReadModal({ id }) {
  useEngine();
  const inds = liveInds();
  const [f, setF] = useState(() => ({ ind: id && inds.some(([k]) => k === id) ? id : (inds[0] ? inds[0][0] : ''), v: '', date: todayISO(), note: '' }));
  const save = () => { if (readSave(f)) closeModal(); };
  return (
    <>
      <h3><Icon name="plus" /> قراءة سوق جديدة</h3>
      <div className="mb">
        <label className="fld">المؤشر<select className="inp" id="rI" value={f.ind} onChange={(e) => setF({ ...f, ind: e.target.value })}>
          {inds.map(([k, i]) => <option key={k} value={k}>{i.name}{i.unit ? ' (' + i.unit + ')' : ''}</option>)}
        </select></label>
        <div className="formgrid">
          <label className="fld">القيمة<input className="inp" id="rV" type="number" step="any" inputMode="decimal" dir="ltr" value={f.v} onChange={(e) => setF({ ...f, v: e.target.value })} /></label>
          <label className="fld">تاريخ القراءة<input className="inp" id="rD" type="date" dir="ltr" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        </div>
        <label className="fld">المصدر أو الملاحظة<input className="inp" id="rN" maxLength={120} placeholder="مثال: تقرير الربع الثالث" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>سجّل</button></div>
    </>
  );
}
/** openRead(id): قراءة جديدة لمؤشر (أو يفتح إضافة مؤشر إن لم توجد مؤشرات) */
export function openRead(id) { if (!liveInds().length) { openIndAdd(); return; } openModal(<ReadModal key={Date.now()} id={id} />); }

/* ---------- المنافسون ---------- */
function MoveModal({ cid }) {
  useEngine();
  const cs = compList();
  const [f, setF] = useState(() => ({ c: cid && cs.some((c) => c.id === cid) ? cid : (cs[0] ? cs[0].id : ''), type: MOVE_T[0], imp: '2', risk: '0', date: todayISO(), note: '' }));
  const save = () => { if (moveSave(f)) closeModal(); };
  return (
    <>
      <h3><Icon name="activity" /> رصد تحرّك منافس</h3>
      <div className="mb">
        <label className="fld">المنافس<select className="inp" id="mC" value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })}>
          {cs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <div className="fld">نوع التحرّك<Seg id="mT" cls="opts" opts={MOVE_T.map((t) => [t, t])} value={f.type} onPick={(v) => setF({ ...f, type: v })} /></div>
        <div className="fld">أثره علينا<Seg id="mI" opts={['منخفض', 'متوسط', 'عالٍ'].map((t, i) => [String(i + 1), t])} value={f.imp} onPick={(v) => setF({ ...f, imp: v })} /></div>
        <div className="fld">تحديث خطورة المنافس<Seg id="mR" opts={[['0', 'بلا تغيير'], ...[1, 2, 3].map((r) => [String(r), RISK_L[r]])]} value={f.risk} onPick={(v) => setF({ ...f, risk: v })} /></div>
        <div className="formgrid"><label className="fld">التاريخ<input className="inp" id="mD" type="date" dir="ltr" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label></div>
        <label className="fld">ماذا حدث؟<textarea className="inp" id="mN" rows="2" placeholder="مثال: خفّض سعر المجموعة الرئيسية ١٥٪ في رمضان" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>سجّل</button></div>
    </>
  );
}
/** openMove(cid): رصد تحرّك منافس */
export function openMove(cid) { if (!compList().length) { toast('أضف منافساً أولاً.', 'err'); return; } openModal(<MoveModal key={Date.now()} cid={cid} />); }

function CompAddModal() {
  const [f, setF] = useState({ name: '', risk: RISK_L[2], strong: '', weak: '' });
  const save = () => { if (compSave(f)) closeModal(); };
  return (
    <>
      <h3><Icon name="users" /> منافس جديد</h3>
      <div className="mb">
        <label className="fld">الاسم<input className="inp" id="cN" maxLength={50} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <div className="fld">الخطورة<Seg id="cR" opts={[1, 2, 3].map((r) => [RISK_L[r], RISK_L[r]])} value={f.risk} onPick={(v) => setF({ ...f, risk: v })} /></div>
        <label className="fld">أهم قوة<input className="inp" id="cS" maxLength={100} value={f.strong} onChange={(e) => setF({ ...f, strong: e.target.value })} /></label>
        <label className="fld">أهم ضعف<input className="inp" id="cW" maxLength={100} value={f.weak} onChange={(e) => setF({ ...f, weak: e.target.value })} /></label>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>أضف</button></div>
    </>
  );
}
export function openCompAdd() { openModal(<CompAddModal key={Date.now()} />); }

/* ---------- إنهاء الجلسة من اللوحة (finishAsk / finish الأصلية) ---------- */
function FinishAskModal() {
  useEngine();
  return (
    <>
      <h3><Icon name="layout-dashboard" /> إنهاء الجلسة الآن؟</h3>
      <div className="mb"><p>على اللوحة {AR(placedCount())} من {AR(N_Q)} قراراً. البطاقات غير الموضوعة ستظهر في لوحة المتابعة «قيد الحسم»، ويمكن العودة للطاولة لاحقاً.</p></div>
      <div className="mf"><button className="btn" onClick={closeModal}>أكمل اللعب</button><button className="btn pri" onClick={() => finishSession()}>أنهِ وأنشئ اللوحة</button></div>
    </>
  );
}
export function openFinishAsk() { if (placedCount() === N_Q) { finishSession(); return; } openModal(<FinishAskModal />); }

