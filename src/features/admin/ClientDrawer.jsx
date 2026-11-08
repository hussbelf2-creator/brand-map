/* درج العميل: الاشتراك، الإيقاف، الملاحظات الداخلية، وجلساته (openClient في الأصل) */
import React, { useState } from 'react';
import { N, SUB_ST, aGet, ago, fmtDate } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openDrawer, DrawerHead } from '../../ui/overlays.jsx';
import { need, useLoad } from './store.js';
import { Loading, LoadErr } from './parts.jsx';
import { cuSave, cuBlock, cuNote, openRecent } from './logic.js';

/** يفتح درج العميل */
export function openClient(uid) { openDrawer(<ClientDrawer uid={uid} />); }

function ClientDrawer({ uid }) {
  useEngine();
  const { v, err, rev } = useLoad(async () => {
    const D = await need('facilitators', 'sessions', 'subs', 'plans', 'blocked');
    const note = await aGet('cnotes', uid);
    return { uid, D, note };
  }, [uid]);
  if (!v || v.uid !== uid) return <><DrawerHead title={<><Icon name="user-round" /> عميل</>} />{err ? <LoadErr e={err} /> : <Loading />}</>;
  return <ClientBody key={uid + ':' + rev} uid={uid} D={v.D} note={v.note} />;
}

function ClientBody({ uid, D, note }) {
  const f = D.facilitators.find((x) => x.id === uid) || {};
  const s = D.subs.find((x) => x.id === uid) || {};
  const my = D.sessions.filter((x) => x.owner === uid);
  const blk = D.blocked.some((b) => b.id === uid);
  const plans = D.plans || [];
  const [plan, setPlan] = useState(plans.some((p) => p.id === s.plan) ? s.plan : '');
  const [st, setSt] = useState(SUB_ST[s.st] ? s.st : 'active');
  const [end, setEnd] = useState(s.end ? new Date(s.end).toISOString().slice(0, 10) : '');
  const [amt, setAmt] = useState(s.amount || '');
  const [nt, setNt] = useState((note && note.t) || '');
  return (
    <>
      <DrawerHead title={<><Icon name="user-round" /> {f.name || 'عميل'}</>} />
      <div className="rlist"><div className="ritem" style={{ '--c': '#24364A' }}><i /><span style={{ display: 'grid', gap: 2 }}><b>{f.org || ''}</b><small dir="ltr">{f.email || ''} · {f.phone || ''}</small><small>{f.role || ''} · سجّل {fmtDate(f.at)}</small></span></div></div>
      <h4 className="dsub">الاشتراك</h4>
      <div className="formgrid">
        <label className="fld">الباقة<select className="inp" id="cuPlan" value={plan} onChange={(e) => setPlan(e.target.value)}><option value="">بلا باقة</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="fld">الحالة<select className="inp" id="cuSt" value={st} onChange={(e) => setSt(e.target.value)}>{Object.entries(SUB_ST).map(([k, x]) => <option key={k} value={k}>{x[0]}</option>)}</select></label>
        <label className="fld">ينتهي في<input className="inp" id="cuEnd" type="date" dir="ltr" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label className="fld">المبلغ المدفوع<input className="inp" id="cuAmt" type="number" min="0" step="1" dir="ltr" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn pri sm" onClick={() => cuSave(uid, false, { plan, st, end, amt })}><Icon name="check" /> احفظ الاشتراك</button>
        <button className="btn sm" onClick={() => cuSave(uid, true)}>+٣٠ يوماً</button>
        <button className={'btn sm ' + (blk ? '' : 'ghost')} onClick={() => cuBlock(uid, !blk)}>{blk ? 'ألغِ الإيقاف' : 'أوقف الحساب'}</button>
      </div>
      <h4 className="dsub">ملاحظات داخلية</h4>
      <textarea className="inp" id="cuNote" rows={3} placeholder="لا يراها العميل" value={nt} onChange={(e) => setNt(e.target.value)} />
      <button className="btn sm" onClick={() => cuNote(uid, nt)} style={{ marginTop: 6 }}>احفظ الملاحظة</button>
      <h4 className="dsub">جلساته ({N(my.length)})</h4>
      <div className="rlist">
        {my.length ? my.map((x) => (
          <button key={x.code} className="ritem" onClick={() => openRecent(x.code)} style={{ '--c': x.done ? '#1F7D63' : '#3F72B5' }}>
            <i /><span style={{ display: 'grid' }}><b>{x.brand} <span className="codechip">{x.code}</span></b><small>{x.done ? 'لوحة متابعة' : 'جارية'} · {x.updated ? ago(x.updated) : ''}</small></span><Icon name="chevron-left" />
          </button>
        )) : <p className="empty">لا جلسات.</p>}
      </div>
    </>
  );
}
