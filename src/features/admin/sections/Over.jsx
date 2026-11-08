/* نظرة عامة (admOver) */
import React from 'react';
import { CONS, DAY, N, N_Q, PERIODS, STAGES, ago, cmsG, flag, fmtDate, loadConsultants, money, planById, subLive } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { Panel } from '../../../ui/Panel.jsx';
import { need, refreshAll, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr } from '../parts.jsx';
import { openRecent, pickSec, placedN } from '../logic.js';

function Kp({ l, v, s, go }) {
  return <button className="kp" onClick={go ? () => pickSec(go) : undefined}><span className="l">{l}</span><span className="v num">{v}</span><span className="s">{s}</span></button>;
}

export default function Over() {
  useEngine();
  const { v: D, err } = useLoad(async () => { const D = await need('facilitators', 'sessions', 'subs', 'subreq', 'plans'); await loadConsultants(true); return D; });
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  const now = Date.now(), liveSubs = D.subs.filter(subLive);
  const mrr = liveSubs.reduce((a, s) => { const p = planById(s.plan); if (!p) return a; const d = (PERIODS[p.period] || [0, 30])[1]; return a + (d ? (+s.amount || +p.price || 0) * 30 / d : 0); }, 0);
  const ss = D.sessions, done = ss.filter((s) => s.done).length, phy = ss.filter((s) => s.cfg && s.cfg.mode === 'physical').length, wk = ss.filter((s) => (s.updated || s.created || 0) > now - 7 * DAY).length;
  const bks = []; ss.forEach((s) => Object.entries(s.bookings || {}).forEach(([id, b]) => { if (b && b.at) bks.push({ ...b, code: s.code }); }));
  const newBk = bks.filter((b) => b.st === 'new').length;
  const pendReq = D.subreq.filter((r) => r.st === 'pending'), pendCons = (CONS || []).filter((c) => !c.ok && !c.manual);
  const todo = [
    ...pendReq.map((r) => ({ ic: 'badge-dollar-sign', t: `طلب اشتراك: ${r.name || 'عميل'} · ${(planById(r.plan) || {}).name || ''}`, go: 'plans' })),
    ...pendCons.map((c) => ({ ic: 'handshake', t: `مستشار بانتظار الاعتماد: ${c.name}`, go: 'cons' })),
    ...(newBk ? [{ ic: 'calendar-clock', t: `${N(newBk)} طلبات استشارة جديدة`, go: 'cons' }] : []),
  ];
  const G = cmsG(); const hid = STAGES.reduce((a, s) => a + (s.hiddenQs || []).length, 0);
  const recent = ss.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 8);
  return (
    <>
      <AdmHead t="نظرة عامة" sub="كل ما يحدث في المنصة في مكان واحد."><button className="btn sm" onClick={refreshAll}><Icon name="refresh-cw" /> تحديث</button></AdmHead>
      <div className="kps">
        <Kp l="العملاء المسجّلون" v={N(D.facilitators.length)} s="حسابات منشّطين" go="clients" />
        <Kp l="اشتراكات فعّالة" v={N(liveSubs.length)} s={'إيراد شهري تقديري ' + money(mrr)} go="plans" />
        <Kp l="الجلسات" v={N(ss.length)} s={`${N(done)} مكتملة · ${N(wk)} نشطة هذا الأسبوع`} go="clients" />
        <Kp l="اللعب الفيزيائي" v={ss.length ? Math.round(phy / ss.length * 100) + '٪' : '—'} s={`${N(phy)} جلسة بالبطاقات المطبوعة`} go="clients" />
        <Kp l="المستشارون" v={N((CONS || []).filter((c) => c.ok).length)} s={`${N(pendCons.length)} بانتظار الاعتماد`} go="cons" />
        <Kp l="طلبات الاستشارة" v={N(bks.length)} s={`${N(newBk)} جديدة`} go="cons" />
      </div>
      <div className="g2">
        <Panel title={<><Icon name="flag" /> يحتاج قرارك</>} sub={todo.length ? '' : 'لا شيء معلّق الآن.'} cls="span5">
          <div className="rlist">
            {todo.length ? todo.map((t, i) => (
              <button key={i} className="ritem" onClick={() => pickSec(t.go)} style={{ '--c': '#B07A00' }}><i /><span><Icon name={t.ic} /> {t.t}</span><Icon name="chevron-left" /></button>
            )) : <p className="empty">كل شيء محدّث.</p>}
          </div>
        </Panel>
        <Panel title={<><Icon name="orbit" /> آخر الجلسات</>} cls="span7">
          <div className="rlist">
            {recent.length ? recent.map((s) => {
              const n = placedN(s);
              return (
                <button key={s.code} className="ritem" onClick={() => openRecent(s.code)} style={{ '--c': s.done ? '#1F7D63' : '#3F72B5' }}>
                  <i /><span style={{ display: 'grid' }}><b>{s.brand || ''} <span className="codechip">{s.code}</span></b><small>{s.ownerName || ''} · {s.cfg && s.cfg.mode === 'physical' ? 'فيزيائي' : 'رقمي'} · {s.done ? 'مكتملة' : n + ' من ' + N_Q}{s.updated ? ' · ' + ago(s.updated) : ''}</small></span><Icon name="chevron-left" />
                </button>
              );
            }) : <p className="empty">لا جلسات بعد.</p>}
          </div>
        </Panel>
      </div>
      <div className="g2">
        <Panel title={<><Icon name="layout-grid" /> المحتوى</>} cls="span6">
          <p className="mini-note">{N(STAGES.length)} محاور · {N(N_Q)} بطاقة نشطة{hid ? ' · ' + N(hid) + ' مخفية' : ''} · {N(Object.keys(G.cards || {}).length)} بطاقة معدّلة · {N(Object.values(G.newCards || {}).length)} بطاقة مضافة</p>
          <p className="mini-note">آخر تعديل للمحتوى: {G.ver ? fmtDate(G.ver) + ' بواسطة ' + (G.by || '') : 'لم يُعدَّل بعد (المحتوى الأصلي)'}</p>
          <button className="btn sm" onClick={() => pickSec('cards')}>إدارة البطاقات</button>
        </Panel>
        <Panel title={<><Icon name="wand-sparkles" /> الذكاء الاصطناعي</>} cls="span6">
          <div className="chips">{[['chat', 'المساعد'], ['agents', 'الوكلاء'], ['read', 'القراءة الذكية'], ['scan', 'قراءة الصور'], ['digital', 'تقارير المنصات']].map(([k, t]) => <span key={k} className={'chip ' + (flag(k) ? 'ok' : 'bad')}>{flag(k) ? '●' : '○'} {t}</span>)}</div>
          <button className="btn sm" onClick={() => pickSec('ai')} style={{ marginTop: 10 }}>إعدادات الوكلاء</button>
        </Panel>
      </div>
    </>
  );
}
