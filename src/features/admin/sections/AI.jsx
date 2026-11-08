/* وكلاء الذكاء الاصطناعي (admAI · aiSave) */
import React, { useState } from 'react';
import { AI_FEATS, ALLQ, N, N_Q, Q, TIERS, cmsA, flag, qcode } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { Panel } from '../../../ui/Panel.jsx';
import { need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Tog } from '../parts.jsx';
import { aiSave } from '../logic.js';

export default function AI() {
  useEngine();
  const { v: D, err, rev } = useLoad(() => need('sessions'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  return <AIBody key={rev} D={D} />;
}

function initForm() {
  const A = cmsA(), on = A.on || {}, F = A.feat || {}, g = A.global || {};
  const feat = {};
  AI_FEATS.forEach(([k]) => { const f = F[k] || {}; feat[k] = { on: on[k] === undefined ? true : !!on[k], tier: TIERS.some((x) => x[0] === f.tier) ? f.tier : '', extra: f.extra || '' }; });
  const cards = {};
  ALLQ.forEach((q) => { const c = (A.cards || {})[q.id] || {}; cards[q.id] = { on: !c.off, x: c.extra || '' }; });
  const ch = F.chat || {};
  return { tier: TIERS.some((x) => x[0] === g.tier) ? g.tier : 'default', extra: g.extra || '', feat, welcome: ch.welcome || '', starters: (ch.starters || []).join('\n'), cards };
}

function AIBody({ D }) {
  const [v, setV] = useState(initForm);
  const runs = {};
  D.sessions.forEach((s) => Object.entries(s.agents || {}).forEach(([q, r]) => { runs[q] = (runs[q] || 0) + Object.keys(r || {}).length; }));
  const tot = Object.values(runs).reduce((a, b) => a + b, 0);
  const top = Object.entries(runs).sort((a, b) => b[1] - a[1]).slice(0, 3).filter((x) => Q[x[0]]);
  const setF = (k, f, x) => setV((o) => ({ ...o, feat: { ...o.feat, [k]: { ...o.feat[k], [f]: x } } }));
  const setC = (id, f, x) => setV((o) => ({ ...o, cards: { ...o.cards, [id]: { ...o.cards[id], [f]: x } } }));
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  return (
    <>
      <AdmHead t="وكلاء الذكاء الاصطناعي" sub="شغّل كل ميزة ذكية أو أوقفها، واضبط عمقها وتعليماتها، ووجّه وكيل كل بطاقة."><button className="btn pri" onClick={() => aiSave(v)}><Icon name="check" /> احفظ الإعدادات</button></AdmHead>
      <div className="kps">
        <div className="kp"><span className="l">تشغيلات الوكلاء</span><span className="v num">{N(tot)}</span><span className="s">في كل الجلسات</span></div>
        <div className="kp"><span className="l">الأكثر استخداماً</span><span className="v" style={{ fontSize: 16 }}>{top.map((x) => qcode(Q[x[0]]) + ' ' + Q[x[0]].slot).join('، ') || '—'}</span><span className="s">حسب عدد التشغيلات</span></div>
        <div className="kp"><span className="l">الميزات المفعّلة</span><span className="v num">{N(AI_FEATS.filter((f) => flag(f[0])).length)}/{N(AI_FEATS.length)}</span><span className="s">ميزات ذكية</span></div>
      </div>
      <Panel title={<><Icon name="sparkles" /> تعليمات عامة لكل الوكلاء</>} sub="تُضاف قبل كل طلب ذكي في المنصة.">
        <div className="formgrid">
          <label className="fld">العمق الافتراضي<select className="inp" id="agT" value={v.tier} onChange={set('tier')}>{TIERS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
          <label className="fld full">التعليمات<textarea className="inp" id="agX" rows={3} value={v.extra} onChange={set('extra')} placeholder="مثال: خاطب السوق السعودي والخليجي، واستخدم أمثلة محلية، وتجنّب الوعود الرقمية غير المسندة" /></label>
        </div>
      </Panel>
      <div className="axgrid">
        {AI_FEATS.map(([k, t, d]) => {
          const f = v.feat[k];
          return (
            <div key={k} className="axed">
              <div className="axed-h"><b>{t}</b></div>
              <p className="mini-note">{d}</p>
              <Tog id={'ai_on_' + k} on={f.on} onChange={(x) => setF(k, 'on', x)} lbl="مفعّلة" />
              <div className="formgrid">
                <label className="fld">العمق<select className="inp" id={'ai_t_' + k} value={f.tier} onChange={(e) => setF(k, 'tier', e.target.value)}><option value="">حسب الإعداد العام</option>{TIERS.map(([x, y]) => <option key={x} value={x}>{y}</option>)}</select></label>
                <label className="fld full">تعليمات إضافية<textarea className="inp" rows={2} id={'ai_x_' + k} value={f.extra} onChange={(e) => setF(k, 'extra', e.target.value)} /></label>
                {k === 'chat' ? (
                  <>
                    <label className="fld full">رسالة الترحيب<input className="inp" id="ai_w" value={v.welcome} onChange={set('welcome')} placeholder="اسألني عن أي بطاقة أو قاعدة في براند ماب…" /></label>
                    <label className="fld full">أسئلة مقترحة (سطر لكل سؤال)<textarea className="inp" rows={3} id="ai_s" value={v.starters} onChange={set('starters')} /></label>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <Panel title={<><Icon name="layout-grid" /> وكلاء البطاقات ({N(N_Q)})</>} sub="أوقف وكيل بطاقة بعينها أو أعطه تعليمات خاصة. يمكن ذلك أيضاً من محرّر البطاقة.">
        <div className="atw"><table className="atable">
          <thead><tr><th>البطاقة</th><th>مفعّل</th><th>تشغيلات</th><th>تعليمات خاصة</th></tr></thead>
          <tbody>{ALLQ.map((q) => {
            const c = v.cards[q.id] || { on: true, x: '' };
            return (
              <tr key={q.id}>
                <td><span className="codechip">{qcode(q)}</span> {q.slot}</td>
                <td><input type="checkbox" className="agc-on" checked={c.on} onChange={(e) => setC(q.id, 'on', e.target.checked)} /></td>
                <td className="num">{N(runs[q.id] || 0)}</td>
                <td><input className="inp sm agc-x" value={c.x} onChange={(e) => setC(q.id, 'x', e.target.value)} placeholder="—" /></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      </Panel>
    </>
  );
}
