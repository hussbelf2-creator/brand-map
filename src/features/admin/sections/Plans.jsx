/* الباقات والاشتراكات والطلبات (admPlans · planForm · reqDecide) */
import React, { useState } from 'react';
import { FEATS, N, PERIODS, SUB_ST, couponCheck, cur, flag, fmtDate, money, planById, subLive } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { openModal, closeModal } from '../../../ui/overlays.jsx';
import { ADM, admSet, need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Seg, Tog, askConfirm } from '../parts.jsx';
import { planDel, planSave, reqDecide } from '../logic.js';
import { openClient } from '../ClientDrawer.jsx';

/** قائمة ميزات الباقة (مشتركة مع نافذة العميل) */
export function PlanFeats({ p }) {
  const F = p.feat || {};
  return <ul>{+F.sessions ? <li>{N(F.sessions)} جلسات شهرياً</li> : <li>جلسات بلا حد</li>}{FEATS.map(([k, t]) => <li key={k} className={F[k] ? '' : 'no'}>{t}</li>)}</ul>;
}

export default function Plans() {
  useEngine();
  const { v: D, err } = useLoad(() => need('plans', 'subs', 'subreq', 'facilitators'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  const PL = D.plans;
  const nm = (uid) => ((D.facilitators.find((f) => f.id === uid) || {}).name) || uid;
  const pend = D.subreq.filter((r) => r.st === 'pending').length;
  const tabs = <Seg items={[['plans', 'الباقات'], ['subs', 'الاشتراكات'], ['req', 'الطلبات' + (pend ? ' (' + N(pend) + ')' : '')]]} val={ADM.ptab} onPick={(k) => admSet({ ptab: k })} />;
  const H = (
    <AdmHead t="الباقات والاشتراكات" sub={<>فرض الباقات {flag('enforce') ? <><b style={{ color: 'var(--ok)' }}>مفعّل</b>: إنشاء الجلسات والميزات يتبع باقة المنشّط.</> : <><b>غير مفعّل</b>: كل الميزات متاحة للجميع. فعّله من الإعدادات بعد تجهيز الباقات.</>}</>}>{tabs}</AdmHead>
  );

  if (ADM.ptab === 'subs') {
    const L = D.subs.slice().sort((a, b) => (b.upd || 0) - (a.upd || 0));
    return (
      <>
        {H}
        <div className="atw"><table className="atable">
          <thead><tr><th>العميل</th><th>الباقة</th><th>الحالة</th><th>البداية</th><th>النهاية</th><th>المبلغ</th><th></th></tr></thead>
          <tbody>{L.length ? L.map((s) => {
            const p = planById(s.plan); const st = subLive(s) ? SUB_ST[s.st] || SUB_ST.active : SUB_ST.expired;
            return (
              <tr key={s.id} className="clk" onClick={() => openClient(s.id)}>
                <td><b>{nm(s.id)}</b></td><td>{p ? p.name : '—'}</td><td><span className={'stpill ' + st[1]}>{st[0]}</span></td>
                <td className="num">{fmtDate(s.start)}</td><td className="num">{s.end ? fmtDate(s.end) : 'مفتوح'}</td><td className="num">{money(s.amount)}</td><td><Icon name="chevron-left" /></td>
              </tr>
            );
          }) : <tr><td colSpan={7} className="empty">لا اشتراكات بعد. تُنشأ من طلبات العملاء أو من صفحة العميل.</td></tr>}</tbody>
        </table></div>
      </>
    );
  }

  if (ADM.ptab === 'req') return <>{H}<ReqList D={D} /></>;

  return (
    <>
      {H}
      <div className="plgrid adm">
        {PL.map((p) => (
          <div key={p.id} className={'pkg ' + (p.hl ? 'hl' : '') + ' ' + (p.active === false ? 'off' : '')}>
            <b>{p.name} {p.active === false ? <span className="chip bad">مخفية</span> : null}{p.hl ? <span className="chip gold">مميزة</span> : null}</b>
            <span className="pr num">{+p.price ? money(p.price) : 'مجاناً'}<small> / {(PERIODS[p.period] || ['—'])[0]}</small></span>
            {p.desc ? <small>{p.desc}</small> : null}
            <PlanFeats p={p} />
            <small className="mini-note">{N(D.subs.filter((s) => s.plan === p.id && subLive(s)).length)} مشترك فعّال</small>
            <div className="bk-a"><button className="btn sm" onClick={() => planForm(p)}><Icon name="pen-line" /> تعديل</button></div>
          </div>
        ))}
        <button className="pkg add" onClick={() => planForm(null)}><Icon name="plus" /><b>باقة جديدة</b></button>
      </div>
    </>
  );
}

/* طلبات الاشتراك: يُراجَع كود الخصم لكل طلب */
function ReqList({ D }) {
  const { v: cc } = useLoad(async () => {
    const out = {};
    for (const r of D.subreq) if (r.coupon) out[r.id] = await couponCheck(r.coupon, r.plan);
    return out;
  }, [D.subreq]);
  if (!cc) return <Loading />;
  const L = D.subreq.slice().sort((a, b) => (a.st === 'pending' ? 0 : 1) - (b.st === 'pending' ? 0 : 1) || b.at - a.at);
  if (!L.length) return <div className="bks"><p className="empty">لا طلبات اشتراك بعد. يرسلها العملاء من زر «الباقات» في صفحة البداية.</p></div>;
  return (
    <div className="bks">
      {L.map((r) => {
        const p = planById(r.plan); const c = r.coupon ? cc[r.id] : null; const base = p ? +p.price || 0 : 0; const fin = c && c.ok ? c.final(base) : base;
        const pendR = r.st === 'pending';
        return (
          <article key={r.id} className={'bk ' + (pendR ? 'new' : '')}>
            <div className="bk-h"><b>{r.name || ''} · {r.org || ''}</b><span className={'stpill ' + (pendR ? 'warn' : r.st === 'approved' ? 'ok' : 'bad')}>{pendR ? 'بانتظار المراجعة' : r.st === 'approved' ? 'مُفعّل' : 'مرفوض'}</span></div>
            <p>باقة <b>{p ? p.name : 'محذوفة'}</b> · {money(base)}{r.coupon ? <> · كود <span className="codechip">{r.coupon}</span> {c && c.ok ? <span className="stpill ok">صالح: −{c.label}</span> : <span className="stpill bad">{c ? c.reason : ''}</span>}</> : null}</p>
            <p><b>السعر النهائي: {money(fin)}</b></p>
            <p className="mini-note"><span dir="ltr">{r.phone || ''}</span> · <span dir="ltr">{r.email || ''}</span> · {fmtDate(r.at)}</p>
            {r.note ? <p>{r.note}</p> : null}
            {pendR ? <div className="bk-a"><button className="btn sm pri" onClick={() => reqDecide(r.id, true, fin)}><Icon name="check" /> فعّل الاشتراك (بعد الدفع)</button><button className="btn sm ghost" onClick={() => reqDecide(r.id, false)}>رفض</button></div> : null}
          </article>
        );
      })}
    </div>
  );
}

/** نافذة إنشاء/تعديل الباقة (planForm) */
export function planForm(p) { openModal(<PlanForm p={p} />, { wide: true }); }

const DEF_FEAT = { chat: true, agents: true, read: true, scan: true, digital: true, consult: true, docx: true };
function PlanForm({ p }) {
  const p0 = p || { feat: DEF_FEAT, period: 'month', active: true };
  const [v, setV] = useState(() => ({
    name: p0.name || '', price: p0.price || 0, period: PERIODS[p0.period] ? p0.period : 'month', sessions: (p0.feat || {}).sessions || 0,
    desc: p0.desc || '', ord: p0.ord || 0, feat: Object.fromEntries(FEATS.map(([k]) => [k, !!(p0.feat || {})[k]])), active: p0.active !== false, hl: !!p0.hl,
  }));
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  const tg = (k) => (c) => setV((o) => ({ ...o, [k]: c }));
  const del = () => askConfirm('حذف الباقة نهائياً؟ الاشتراكات القائمة عليها تبقى لكن بلا ميزات حتى تُنقل لباقة أخرى.', () => planDel(p0.id));
  return (
    <>
      <h3><Icon name="badge-dollar-sign" /> {p0.id ? 'تعديل الباقة' : 'باقة جديدة'}</h3>
      <div className="mb">
        <div className="formgrid">
          <label className="fld">اسم الباقة *<input className="inp" id="pnN" value={v.name} onChange={set('name')} placeholder="مثال: المنشّط المحترف" /></label>
          <label className="fld">السعر ({cur()})<input className="inp" id="pnP" type="number" min="0" dir="ltr" value={v.price} onChange={set('price')} /></label>
          <label className="fld">الدورة<select className="inp" id="pnD" value={v.period} onChange={set('period')}>{Object.entries(PERIODS).map(([k, x]) => <option key={k} value={k}>{x[0]}</option>)}</select></label>
          <label className="fld">الجلسات شهرياً (٠ = بلا حد)<input className="inp" id="pnS" type="number" min="0" dir="ltr" value={v.sessions} onChange={set('sessions')} /></label>
          <label className="fld full">وصف قصير<input className="inp" id="pnDesc" value={v.desc} onChange={set('desc')} placeholder="لمن هذه الباقة؟" /></label>
          <label className="fld">الترتيب<input className="inp" id="pnO" type="number" dir="ltr" value={v.ord} onChange={set('ord')} /></label>
        </div>
        <div className="fld">الميزات المشمولة<div className="tgs">{FEATS.map(([k, t]) => <Tog key={k} id={'pf_' + k} on={v.feat[k]} onChange={(c) => setV((o) => ({ ...o, feat: { ...o.feat, [k]: c } }))} lbl={t} />)}</div></div>
        <div className="tgs"><Tog id="pnA" on={v.active} onChange={tg('active')} lbl="ظاهرة للعملاء" /><Tog id="pnH" on={v.hl} onChange={tg('hl')} lbl="باقة مميزة" sub="تظهر بإطار ذهبي" /></div>
      </div>
      <div className="mf">
        {p0.id ? <button className="btn ghost" onClick={del} style={{ marginInlineEnd: 'auto', color: 'var(--danger)' }}><Icon name="trash-2" /> حذف</button> : null}
        <button className="btn" onClick={closeModal}>إلغاء</button>
        <button className="btn pri" onClick={() => planSave(p0.id || '', v)}><Icon name="check" /> احفظ</button>
      </div>
    </>
  );
}
