/* أكواد الخصم (admCoupons · cpForm · cpSave) */
import React, { useState } from 'react';
import { N, PLANS, cur, fmtDate, money, planById } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { openModal, closeModal } from '../../../ui/overlays.jsx';
import { need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Opts, Tog, askConfirm } from '../parts.jsx';
import { cpDel, cpSave } from '../logic.js';

export default function Coupons() {
  useEngine();
  const { v: D, err } = useLoad(() => need('coupons', 'plans'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  const L = D.coupons.slice().sort((a, b) => (b.at || 0) - (a.at || 0));
  return (
    <>
      <AdmHead t="أكواد الخصم" sub="أكواد تُستخدم عند طلب الاشتراك، وتُراجَع تلقائياً عند تفعيله."><button className="btn pri sm" onClick={() => cpForm(null)}><Icon name="plus" /> كود جديد</button></AdmHead>
      <div className="atw"><table className="atable">
        <thead><tr><th>الكود</th><th>الخصم</th><th>الاستخدام</th><th>الصلاحية</th><th>الباقات</th><th>الحالة</th><th></th></tr></thead>
        <tbody>{L.length ? L.map((c) => {
          const exp = c.exp && c.exp < Date.now();
          return (
            <tr key={c.id}>
              <td><span className="codechip" style={{ fontSize: 14 }}>{c.id}</span>{c.note ? <small>{c.note}</small> : null}</td>
              <td><b>{c.type === 'pct' ? N(c.val) + '٪' : money(c.val)}</b></td>
              <td className="num">{N(c.used || 0)}{c.max ? ' / ' + N(c.max) : ' / ∞'}</td>
              <td className="num">{c.exp ? fmtDate(c.exp) : 'مفتوح'}</td>
              <td>{(c.plans || []).length ? c.plans.map((id) => (planById(id) || {}).name || '').join('، ') : 'كل الباقات'}</td>
              <td><span className={'stpill ' + (c.active === false || exp ? 'bad' : 'ok')}>{c.active === false ? 'موقوف' : exp ? 'منتهٍ' : 'فعّال'}</span></td>
              <td><button className="btn sm" onClick={() => cpForm(c)}>تعديل</button></td>
            </tr>
          );
        }) : <tr><td colSpan={7} className="empty">لا أكواد بعد.</td></tr>}</tbody>
      </table></div>
    </>
  );
}

/** نافذة كود الخصم (cpForm) */
export function cpForm(c) { openModal(<CpForm c={c} />); }

function CpForm({ c }) {
  const c0 = c || { type: 'pct', val: 10, active: true };
  const PL = PLANS || [];
  const [v, setV] = useState(() => ({
    code: c0.id || '', type: c0.type === 'fix' ? 'fix' : 'pct', val: c0.val || 0, max: c0.max || 0,
    exp: c0.exp ? new Date(c0.exp).toISOString().slice(0, 10) : '', note: c0.note || '', plans: c0.plans || [], active: c0.active !== false,
  }));
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  const save = () => cpSave({ ...v, plans: PL.map((p) => p.id).filter((id) => v.plans.includes(id)) });
  const del = () => askConfirm('حذف كود الخصم ' + c0.id + '؟', () => cpDel(c0.id));
  return (
    <>
      <h3><Icon name="coins" /> {c0.id ? 'تعديل الكود' : 'كود خصم جديد'}</h3>
      <div className="mb">
        <div className="formgrid">
          <label className="fld">الكود *<input className="inp" id="cpC" dir="ltr" maxLength={24} value={v.code} onChange={set('code')} readOnly={!!c0.id} placeholder="RAMADAN25" style={{ textTransform: 'uppercase' }} /></label>
          <label className="fld">النوع<select className="inp" id="cpT" value={v.type} onChange={set('type')}><option value="pct">نسبة مئوية</option><option value="fix">مبلغ ثابت ({cur()})</option></select></label>
          <label className="fld">القيمة<input className="inp" id="cpV" type="number" min="0" dir="ltr" value={v.val} onChange={set('val')} /></label>
          <label className="fld">أقصى عدد استخدام (٠ = بلا حد)<input className="inp" id="cpM" type="number" min="0" dir="ltr" value={v.max} onChange={set('max')} /></label>
          <label className="fld">ينتهي في<input className="inp" id="cpE" type="date" dir="ltr" value={v.exp} onChange={set('exp')} /></label>
          <label className="fld">ملاحظة داخلية<input className="inp" id="cpN" value={v.note} onChange={set('note')} placeholder="مثال: شراكة مع حاضنة" /></label>
        </div>
        <div className="fld">يشمل الباقات (بلا اختيار = كل الباقات)
          <Opts id="cpP" items={PL.map((p) => [p.id, p.name])} sel={v.plans} onChange={(plans) => setV((o) => ({ ...o, plans }))} empty={<span className="mini-note">لا باقات بعد.</span>} />
        </div>
        <Tog id="cpA" on={v.active} onChange={(x) => setV((o) => ({ ...o, active: x }))} lbl="الكود فعّال" />
      </div>
      <div className="mf">
        {c0.id ? <button className="btn ghost" onClick={del} style={{ marginInlineEnd: 'auto', color: 'var(--danger)' }}><Icon name="trash-2" /> حذف</button> : null}
        <button className="btn" onClick={closeModal}>إلغاء</button>
        <button className="btn pri" onClick={save}><Icon name="check" /> احفظ</button>
      </div>
    </>
  );
}
