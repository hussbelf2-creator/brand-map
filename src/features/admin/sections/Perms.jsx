/* الصلاحيات والفريق (admPerms) */
import React, { useState } from 'react';
import { ADM_SECS, FEATS, IS_OWNER, N, ROLE_DEF, admLocal, flag } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { Panel } from '../../../ui/Panel.jsx';
import { need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Opts } from '../parts.jsx';
import { addStaff, delStaff } from '../logic.js';

export default function Perms() {
  useEngine();
  const { v: D, err, rev } = useLoad(() => need('staff', 'facilitators', 'plans'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  return <PermsBody key={rev} D={D} />;
}

function PermsBody({ D }) {
  const PL = D.plans || [];
  const nm = (uid) => { const f = D.facilitators.find((x) => x.id === uid); return f ? f.name + (f.email ? ' · ' + f.email : '') : uid; };
  const [u, setU] = useState((D.facilitators[0] || {}).id || '');
  const [r, setR] = useState(Object.keys(ROLE_DEF)[0]);
  const [secs, setSecs] = useState([]);
  return (
    <>
      <AdmHead t="الصلاحيات والفريق" sub="من يدير ماذا داخل لوحة الإدارة، وما تفتحه كل باقة للعملاء." />
      <Panel title={<><Icon name="lock" /> مستويات الوصول في الأداة</>} sub="الصلاحية الفعلية تُمنح من قائمة «مشاركة» في Claude. الأدوار أدناه تحدّد ما يراه كل محرّر داخل لوحة الإدارة.">
        <div className="atw"><table className="atable">
          <thead><tr><th>المستوى في المشاركة</th><th>من هم</th><th>ما يستطيعه</th></tr></thead>
          <tbody>
            <tr><td><b>المالك</b></td><td>أنت</td><td>كل شيء، ومنه تعيين أدوار الفريق</td></tr>
            <tr><td><b>محرّر (Editor)</b></td><td>فريق المنصة</td><td>لوحة الإدارة حسب الدور المعيّن أدناه، وتعديل المحتوى والباقات والمستشارين</td></tr>
            <tr><td><b>مساهم (Contributor)</b></td><td>المنشّطون واللاعبون والمستشارون</td><td>إنشاء الجلسات واللعب والحجز ولوحة المستشار، دون أي وصول للإدارة</td></tr>
            <tr><td><b>مشاهد (Viewer)</b></td><td>العملاء للاطلاع</td><td>مشاهدة الجلسات ولوحات المتابعة فقط</td></tr>
          </tbody>
        </table></div>
      </Panel>
      <Panel title={<><Icon name="users" /> فريق الإدارة</>} sub="محرّر بلا دور معيّن يرى كل الأقسام. عيّن دوراً لتقصر وصوله على أقسامه.">
        <div className="atw"><table className="atable">
          <thead><tr><th>العضو</th><th>الدور</th><th>الأقسام</th><th></th></tr></thead>
          <tbody>{D.staff.length ? D.staff.map((s) => {
            const R = ROLE_DEF[s.role] || ROLE_DEF.custom; const ss = s.role === 'custom' ? (s.secs || []) : R[1];
            return (
              <tr key={s.id}>
                <td><b>{s.name || nm(s.id)}</b></td><td>{R[0]}</td>
                <td><small>{ss === '*' ? 'كل الأقسام' : (ss || []).map((k) => (ADM_SECS.find((x) => x[0] === k) || [, ''])[1]).join('، ')}</small></td>
                <td>{IS_OWNER ? <button className="btn sm ghost" onClick={() => delStaff(s.id)}>إزالة</button> : null}</td>
              </tr>
            );
          }) : <tr><td colSpan={4} className="empty">لم تُعيَّن أدوار بعد.</td></tr>}</tbody>
        </table></div>
        {IS_OWNER || admLocal() ? (
          <div className="formgrid" style={{ marginTop: 12 }}>
            <label className="fld">العضو (من المسجّلين)<select className="inp" id="stU" value={u} onChange={(e) => setU(e.target.value)}>{D.facilitators.map((f) => <option key={f.id} value={f.id}>{`${f.name || ''} ${f.email ? '· ' + f.email : ''}`}</option>)}</select></label>
            <label className="fld">الدور<select className="inp" id="stR" value={r} onChange={(e) => setR(e.target.value)}>{Object.entries(ROLE_DEF).map(([k, x]) => <option key={k} value={k}>{x[0]}</option>)}</select></label>
            <div className="fld full">أقسام الدور المخصّص<Opts id="stS" items={ADM_SECS.map(([k, t]) => [k, t])} sel={secs} onChange={setSecs} /></div>
            <div className="full"><button className="btn pri sm" onClick={() => addStaff(u, r, secs)}><Icon name="user-plus" /> عيّن الدور</button><span className="mini-note"> العضو يجب أن يكون محرّراً في المشاركة أيضاً.</span></div>
          </div>
        ) : <p className="mini-note">تعيين الأدوار للمالك فقط.</p>}
      </Panel>
      <Panel title={<><Icon name="badge-check" /> ما تفتحه كل باقة</>} sub={flag('enforce') ? 'الفرض مفعّل: العميل يرى ميزات باقته فقط، واللاعبون في جلسته يرثونها.' : 'الفرض غير مفعّل الآن، فكل الميزات متاحة للجميع.'}>
        <div className="atw"><table className="atable mx">
          <thead><tr><th>الميزة</th>{PL.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
          <tbody>
            <tr><td>الجلسات شهرياً</td>{PL.map((p) => <td key={p.id} className="num">{+((p.feat || {}).sessions) ? N(p.feat.sessions) : '∞'}</td>)}</tr>
            {FEATS.map(([k, t]) => <tr key={k}><td>{t}</td>{PL.map((p) => <td key={p.id}>{(p.feat || {})[k] ? <span className="ok">✓</span> : <span className="no">—</span>}</td>)}</tr>)}
          </tbody>
        </table></div>
        {PL.length ? null : <p className="empty">أنشئ الباقات أولاً.</p>}
      </Panel>
    </>
  );
}
