/* ================= لوحة متابعة العميل (renderDash الأصلية) — بيانات حيّة ================= */
import React, { useEffect, useRef, useState } from 'react';
import {
  S, CODE, ui, setUI, LS, LOCAL, RO, CAP, LOGO, STAGES, ALLQ, Q, N_Q, CL, AR, DAY, AXMETA, DOCSECS, DOCST,
  onlinePeople, feedItems, onSync, featOn, ago, fmt, fmtDate, fmtShort, defLine, placedCount, placed, confOf, doubtOn,
  plist, AK, ansSummary, stageCount, stageAvgConf, stageTime, timeOf, stageOf, compList, compName, fget, deepFilled,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { toast } from '../../ui/overlays.jsx';
import { go } from '../../nav.js';
import ProjSwitch from '../pages/ProjSwitch.jsx';
import PagesTab from '../pages/PagesTab.jsx';
import TracksTab from '../pages/TracksTab.jsx';
import DigitalTab from '../digital/DigitalTab.jsx';
import { pageState, allTasks, taskStats, pagesApproved } from '../pages/logic.js';
import { finishSession } from '../play/actions.js';
import { openDownload, dlDocx, dlHtml, dlJson } from '../docs/export.js';
import {
  CADS, STS, DTABS, PEST, IMP, RISK_L, dcf, feedF, setDcf, setFeedF, follows, cad, axLast, axDue, axHealth, overall, nextReview, daysTo,
  riskList, plan, threatAll, threatLbl, indReadings, momentum, lastChange, isNew, hcol, liveInds,
  dashInput, setDtab, markSeen, axCardsGo, copyDash, aiRead, pimpSet, indSug, indDel, cadSet, docstNext, saveCheck,
  pestSave, indSave, readSave, moveSave, compSave,
} from './logic.js';
import { Gauge, Spark, LineChart, ConfDots, PosMap } from './charts.jsx';
import { Mcard } from './Mcard.jsx';
import { openCardD, CardDrawer } from './CardDrawer.jsx';
import { openCheck, CheckBody, checkBody, openPestEdit, openIndAdd, openRead, openMove, openCompAdd, openFinishAsk } from './forms.jsx';

export { openCardD, CardDrawer, Mcard, Gauge, Spark, LineChart, ConfDots, PosMap, openCheck, CheckBody, checkBody, saveCheck, openPestEdit, openIndAdd, openRead, openMove, openCompAdd, openFinishAsk, aiRead, dashInput, hcol };
/* أسماء الأصل للرسوم (مكوّنات React) */
export { Gauge as gauge, Spark as spark, LineChart as lineChart, ConfDots as confDots, PosMap as posMap, Mcard as mcard };

/* تحديث مباشر: إشعار حين يصل تغيير من عضو آخر واللوحة مفتوحة (onSync الأصلية) */
onSync((prev, src) => {
  if (!S || ui.view !== 'dash' || !prev) return; const f = feedItems()[0];
  if (src === 'remote' && f && f.at > (ui.lastFeedAt || 0) && f.at > Date.now() - 60000) toast(`تحديث مباشر: ${f.by || 'عضو'} ${f.verb || ''} — ${f.t}`.slice(0, 140));
  if (f && f.at !== ui.lastFeedAt) setUI({ lastFeedAt: f.at });
});

/** «آخر تغيير» يتحدّث كل ١٠ ثوانٍ */
function LastUpd() {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 10000); return () => clearInterval(t); }, []);
  return <b id="lastUpd">{ago((S && S.updated) || Date.now())}</b>;
}

/** dashAction(act, d): موزّع أفعال اللوحة بأسماء الأصل (d يقابل dataset، وقيم النماذج لأفعال الحفظ) */
export function dashAction(act, d = {}) {
  switch (act) {
    case 'dtab': setDtab(d.t); return true;
    case 'feedF': setFeedF(d.k); return true;
    case 'markSeen': markSeen(); return true;
    case 'axCards': axCardsGo(d.n); return true;
    case 'cfAx': setDcf({ ax: +d.n }); return true;
    case 'cfSt': setDcf({ st: d.k }); return true;
    case 'cardD': openCardD(d.q); return true;
    case 'aiRead': aiRead(); return true;
    case 'pimp': pimpSet(d.k, d.v); return true;
    case 'pestEdit': openPestEdit(d.k); return true;
    case 'peSave': return pestSave(d.k, d.v);
    case 'indSug': indSug(); return true;
    case 'indAdd': openIndAdd(); return true;
    case 'indSave': return indSave(d);
    case 'indDel': indDel(d.id); return true;
    case 'readAdd': openRead(d.id); return true;
    case 'readSave': return readSave(d);
    case 'moveAdd': openMove(d.c); return true;
    case 'moveSave': return moveSave(d);
    case 'compAdd': openCompAdd(); return true;
    case 'compSave': return compSave(d);
    case 'chk': openCheck(+d.n); return true;
    case 'ckSave': return saveCheck(d);
    case 'cad': cadSet(d.d); return true;
    case 'docst': docstNext(d.n); return true;
    case 'copyDash': copyDash(); return true;
    case 'toProjects': go('projects'); return true;
    case 'enterPlay': go('play'); return true;
    case 'finish': finishSession(); return true;
    case 'finishAsk': openFinishAsk(); return true;
    case 'dl': if (ui.view === 'dash') setDtab('pages'); else openDownload(); return true;
    case 'dlDocx': dlDocx(); return true;
    case 'dlHtml': dlHtml(); return true;
    case 'dlJson': dlJson(); return true;
    default: return false;
  }
}

/* ---------- shell ---------- */
export default function Dashboard() {
  useEngine();
  // قائمة المشاريع يحمّلها ProjSwitch؛ عند مغادرة اللوحة تُعلَّم التغييرات مقروءة (show الأصلية)
  useEffect(() => () => { if (CODE) LS.set('bm3:seen:' + CODE, Date.now()); }, []);
  if (!S) return <section id="v-dash" />;
  const tab = ui.dtab || 'over';
  const h = overall(), ppl = onlinePeople().length; const fresh = feedItems().filter((f) => isNew(f.at)).length;
  const Body = { over: DOver, pages: PagesTab, tracks: TracksTab, digital: DigitalTab, market: DMarket, comp: DComp, cards: DCards, follow: DFollow, doc: PagesTab }[tab] || DOver;
  return (
    <section id="v-dash">
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="dband"><div className="wrap">
        <div className="db-top"><span className="brandmk"><img src={LOGO} alt="" /><span>براند ماب<small>BRAND MAP</small></span></span>
          <span className="db-acts"><ProjSwitch />
            <button className="btn sm dk" onClick={() => go('projects')}><Icon name="layout-grid" /> مشاريعي</button>
            <button className="btn sm dk" onClick={() => go('play')}><Icon name="orbit" /> الطاولة</button>
            <button className="btn sm dk" onClick={copyDash}><Icon name="share-2" /> رابط اللوحة</button>
            <button className="btn sm gold" onClick={() => dashAction('dl')}><Icon name="download" /> الوثيقة</button>
          </span></div>
        <div className="db-main"><div style={{ minWidth: 0 }}><div className="eyebrow">لوحة متابعة العلامة</div><h1>{S.brand}</h1>
          <div className="db-sub">
            <span className={'live' + (LOCAL ? ' off' : '')}><i />{LOCAL ? 'محفوظة على هذا الجهاز' : 'مباشر'}</span>
            <span>آخر تغيير <LastUpd /></span>
            {LOCAL ? null : <span><b id="liveCount">{ppl}</b> متصل الآن</span>}
            <span className="codechip">{CODE}</span>
            {S.done ? <span>اكتملت الجلسة {fmtDate(S.doneAt)}</span> : <span className="chip warn">الجلسة جارية</span>}
            {S.ownerName ? <span>المنشّط: {S.ownerName}</span> : null}
          </div>
          {defLine() ? <p className="db-def">{defLine()}</p> : null}</div>
          <div className="db-health"><Gauge v={h} c={hcol(h)} /><div><b>صحة العلامة</b><small>اكتمال القرارات ٤٠٪ · التأكد ٣٠٪ · حالة المتابعة ٣٠٪</small></div></div></div>
        <nav className="dtabs" role="tablist">
          {DTABS.map(([k, l, ic]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setDtab(k)}><Icon name={ic} /> {l}{k === 'over' && fresh ? <i className="badge">{fresh}</i> : null}</button>
          ))}
        </nav></div></header>
      {!S.done ? (
        <div className="wrap"><div className="banner"><Icon name="info" /><span>اللوحة تقرأ الطاولة لحظياً. تبدأ المتابعة الدورية بعد إنهاء الجلسة ({AR(placedCount())} من {AR(N_Q)} قراراً على اللوحة).</span>
          <button className="btn sm pri" disabled={RO} onClick={openFinishAsk}>إنهاء الجلسة</button></div></div>
      ) : null}
      <main className="wrap dbody"><Body /></main>
      <footer className="wrap lfoot" style={{ marginTop: 30 }}><span>Brand Map™ · زورق</span><span>القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب</span></footer>
    </section>
  );
}

/* ---------- overview ---------- */
/** kpi(l,v,s,cls,act): بطاقة رقم؛ الضغط ينقل للتبويب act */
function Kp({ l, v, s, cls = '', act = '' }) {
  return <button className={('kp ' + cls).trim()} disabled={!act} onClick={act ? () => setDtab(act) : undefined}><span className="l">{l}</span><span className="v">{v}</span><span className="s">{s}</span></button>;
}
const FEEDF = [['all', 'الكل'], ['card', 'البطاقات'], ['page', 'الصفحات والمهام'], ['market', 'السوق'], ['comp', 'المنافسون'], ['follow', 'المتابعة']];

export function DOver() {
  useEngine();
  const n = placedCount(), rs = riskList(), th = threatAll(), tl = threatLbl(th), mo = momentum(), nr = nextReview(), dd = daysTo(nr);
  const avg = (() => { const r = ALLQ.map((q) => confOf(q.id)).filter(Boolean); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0; })();
  const F = feedItems(), fr = F.filter((f) => isNew(f.at)); const FF = F.filter((f) => feedF === 'all' || f.kind === feedF || (feedF === 'page' && f.kind === 'task'));
  const P = plan();
  const ts = taskStats(allTasks()); const tx = ts.overdue + ts.blocked + ts.stale;
  const changed = DOCSECS.some((d) => ((pageState(d.n) || {}).changedAfter || []).length);
  const crit = rs.filter((r) => r.lvl === 'b').length;
  return (
    <>
      <div className="kps">
        <Kp l="القرارات على اللوحة" v={<>{n}<small>/{N_Q}</small></>} s={`${ALLQ.filter((q) => q.gold && placed(q.id)).length}/3 ذهبية`} act="cards" />
        <Kp l="متوسط التأكد" v={<>{avg ? avg.toFixed(1) : '—'}<small>/5</small></>} s={avg ? CL[Math.max(1, Math.round(avg))].t : 'لم تُقيَّم'} act="cards" />
        <Kp l="تهديد المنافسين" v={<>{th}<small>/100</small></>} s={<><span className={'chip ' + tl[1]}>{tl[0]}</span> عدد المنافسين {compList().length}</>} act="comp" />
        <Kp l="زخم السوق" v={mo.n ? <>{mo.up}<small>/{mo.n}</small></> : '—'} s={mo.n ? 'مؤشرات تتحسّن' : 'سجّلوا قراءتين لكل مؤشر'} act="market" />
        <Kp l="الصفحات المعتمدة" v={<>{pagesApproved()}<small>/11</small></>} s={changed ? <span className="chip warn">صفحات تحتاج إعادة اعتماد</span> : 'من الصفحات النهائية'} act="pages" />
        <Kp l="المتابعة المتخصصة" v={<>{ts.done}<small>/{ts.all}</small></>} s={tx ? <span style={{ color: 'var(--danger)' }}>{tx} تحتاج تدخّلاً</span> : 'مهام منجزة'} act="tracks" />
        <Kp l="مخاطر مفتوحة" v={<span style={{ color: rs.some((r) => r.lvl === 'b') ? 'var(--danger)' : 'inherit' }}>{rs.length}</span>} s={`${crit} حرجة`} />
        <Kp l="المراجعة القادمة" v={S.done ? (dd === 0 ? 'اليوم' : <><span style={{ color: dd < 0 ? 'var(--danger)' : 'inherit' }}>{Math.abs(dd)}</span><small> يوم</small></>) : '—'} s={S.done ? (dd < 0 ? 'متأخرة' : fmtDate(nr)) : 'بعد إنهاء الجلسة'} act="follow" />
      </div>
      <div className="g2">
        <Panel cls="span7" title={<><Icon name="activity" /> ما الذي تغيّر</>}
          sub={fr.length ? <><b className="newc">{AR(fr.length)} تغييرات جديدة</b> منذ زيارتك الأخيرة {ui.seenAt ? fmtDate(ui.seenAt) : ''}</> : 'كل تغيير على البطاقات والسوق والمنافسين والمتابعة يظهر هنا لحظة حدوثه.'}
          act={fr.length ? <button className="btn sm" onClick={markSeen}><Icon name="check-check" /> تمّت القراءة</button> : null}>
          <div className="chips">{FEEDF.map(([k, l]) => <button key={k} className={feedF === k ? 'on' : ''} onClick={() => setFeedF(k)}>{l}</button>)}</div>
          <div className="feed">
            {FF.length ? FF.slice(0, 40).map((f, i) => {
              const s = f.ax ? STAGES[f.ax - 1] : null; const nw = isNew(f.at);
              return (
                <div key={i} className={'fi' + (nw ? ' new' : '') + (ui.dashOpenAt && f.at > ui.dashOpenAt ? ' fresh' : '')} style={{ '--ci': s ? s.ci : '#7A8896' }}>
                  <span className="dot" />
                  <div style={{ minWidth: 0 }}><p><b>{f.by || 'عضو'}</b> {f.verb || ''}{nw ? <> <i className="nb">جديد</i></> : null}</p><p className="t">{f.t}</p></div>
                  <time>{ago(f.at)}</time>
                </div>
              );
            }) : <p className="empty">لا تغييرات بعد. ابدأوا من الطاولة أو سجّلوا أول قراءة سوق.</p>}
          </div>
        </Panel>
        <Panel cls="span5" title={<><Icon name="sparkles" /> القراءة الذكية</>}
          sub={S.ai && S.ai.at ? `آخر قراءة ${ago(S.ai.at)} بطلب ${S.ai.by || ''}` : 'قراءة آلية تقرأ التغيّرات الأخيرة وتستخرج الإشارات والخطوات. للرأي البشري احجزوا مستشاراً.'}
          act={CAP.sample && featOn('read') ? <button className="btn sm pri" disabled={!!ui.aiBusy || RO} onClick={aiRead}><Icon name="wand-sparkles" /> {ui.aiBusy ? 'يقرأ…' : 'اقرأ التغيّرات الآن'}</button> : null}>
          <AiHTML />
        </Panel>
      </div>
      <Panel title={<><Icon name="chart-column-increasing" /> صحة المحاور الثمانية</>} sub="اضغط أي محور لفتح بطاقاته.">
        <div className="hbars">
          {STAGES.map((s) => {
            const hv = axHealth(s), l = axLast(s.n), st = l ? STS[l.st] : null, lc = s.qs.map((q) => lastChange(q.id)).filter(Boolean).sort((a, b) => b.at - a.at)[0];
            return (
              <button key={s.n} className="hb" style={{ '--ci': s.ci }} onClick={() => axCardsGo(s.n)}>
                <span className="nm"><i>{s.n}</i>{s.name}</span><span className="bar"><i style={{ width: hv + '%' }} /></span><span className="num hv">{hv}</span>
                <span className="st">{st ? <span className={'stpill ' + st.c}>{st.t}</span> : <span className="stpill none">لم يُراجَع</span>}</span>
                <span className="lc">{lc ? 'تغيّر ' + ago(lc.at) : ''}</span>
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="g2">
        <Panel cls="span5" title={<><Icon name="triangle-alert" /> المخاطر وقائمة التحقق</>}>
          <div className="risks">
            {rs.length ? rs.slice(0, 10).map((r, i) => (
              <div key={i} className={'risk ' + r.lvl}><span className="ico"><Icon name={r.lvl === 'b' ? 'triangle-alert' : 'circle-help'} /></span><div><b>{r.t}</b><small>{r.d}</small></div></div>
            )) : <p className="empty">لا مخاطر مفتوحة.</p>}
          </div>
        </Panel>
        <Panel cls="span7" title={<><Icon name="calendar-clock" /> خطة ٣٠ / ٦٠ / ٩٠</>} sub="مشتقّة من قرارات الطاولة وتتغيّر معها.">
          <div className="plan">
            {[30, 60, 90].map((d) => (
              <div key={d} className="p"><h4>أول {AR(d)} يوماً<small>{d === 30 ? 'تثبيت' : d === 60 ? 'تطبيق' : 'قياس'}</small></h4><ul>{P[d].map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/** aiHTML(): نتيجة القراءة الذكية */
export function AiHTML() {
  useEngine();
  if (!CAP.sample && !(S.ai && S.ai.data)) return <p className="empty">القراءة الذكية تعمل عند فتح اللوحة من رابطها في Claude.</p>;
  const d = S.ai && S.ai.data; if (!d) return <p className="empty">{ui.aiBusy ? 'يقرأ المستشار البيانات…' : 'لم تُطلب قراءة بعد.'}</p>;
  const T = { opp: ['فرصة', 'ok'], risk: ['خطر', 'bad'], watch: ['راقب', 'warn'] };
  return (
    <div className="ai">
      <h3>{d.headline || ''}</h3><p>{d.summary || ''}</p>
      {(d.signals || []).length ? <div className="sig">{d.signals.slice(0, 6).map((s, i) => { const t = T[s.type] || T.watch; return <div key={i}><span className={'chip ' + t[1]}>{t[0]}</span><span>{s.t || ''}</span></div>; })}</div> : null}
      {(d.actions || []).length ? (
        <>
          <h4>الخطوات المقترحة</h4>
          <ol>{d.actions.slice(0, 5).map((a, i) => <li key={i}>{a.t || ''}{a.owner || a.when ? <> <small>{[a.owner, a.when].filter(Boolean).join(' · ')}</small></> : null}</li>)}</ol>
        </>
      ) : null}
    </div>
  );
}
export const aiHTML = AiHTML;

/* ---------- market ---------- */
const PROF = [['1_1', 'مرحلة السوق'], ['1_4', 'كثافة المصنّعين'], ['1_5', 'نوع المنتجات'], ['1_6', 'حواجز الدخول']];
export function DMarket() {
  useEngine();
  const pv = fget('1_2', '1'); const imp = S.pimp || {}; const cnt = { opp: 0, threat: 0, watch: 0 }; PEST.forEach(([k]) => { if (deepFilled(pv[k])) cnt[imp[k] || 'watch']++; });
  const inds = liveInds();
  return (
    <>
      <Panel title={<><Icon name="store" /> ملف السوق</>} sub="من محور السوق على الطاولة. أي تعديل هناك يظهر هنا فوراً.">
        <div className="tiles4">
          {PROF.map(([id, l]) => {
            const q = Q[id], k = plist(id)[0], a = k ? AK(q, k) : null, lc = lastChange(id);
            return (
              <button key={id} className="tile" style={{ '--ci': q.s.ci }} onClick={() => openCardD(id)}>
                <span className="l">{l}</span><b>{a && a.t ? a.t.replace(/ـ+/g, '') : 'لم تُحسم'}</b><small>{a && a.x ? a.x : ''}</small>
                <span className="ft"><ConfDots id={id} />{lc ? <span className={isNew(lc.at) ? 'nb' : ''}>تغيّر {ago(lc.at)}</span> : null}</span>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title={<><Icon name="globe" /> الاتجاهات المؤثرة PESTLE</>} sub={`${AR(cnt.opp)} فرص · ${AR(cnt.threat)} تهديدات · ${AR(cnt.watch)} تحت المراقبة. صنّفوا كل اتجاه وحدّثوه حين يتغيّر.`}>
        <div className="pest">
          {PEST.map(([k, L, n]) => {
            const t = pv[k] || '', im = IMP[imp[k] || 'watch'] || IMP.watch, fl = deepFilled(t);
            return (
              <div key={k} className={'pc' + (fl ? '' : ' empty')}>
                <div className="ph"><span className="lt">{L}</span><b>{n}</b>{fl ? <span className={'chip ' + im[1]}>{im[0]}</span> : null}</div>
                <p>{fl ? String(t) : 'لم يُكتب اتجاه بعد'}</p>
                <div className="pa">
                  {Object.entries(IMP).map(([ik, iv]) => <button key={ik} className={(imp[k] || 'watch') === ik ? 'on ' + iv[1] : ''} disabled={RO} onClick={() => pimpSet(k, ik)}>{iv[0]}</button>)}
                  <button disabled={RO} onClick={() => openPestEdit(k)}><Icon name="pen-line" /> تحديث</button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title={<><Icon name="trending-up" /> مؤشرات السوق</>} sub="قراءات دورية يدخلها فريقكم من مصادره: المبيعات، تقارير القطاع، الهيئة العامة للإحصاء. كل قراءة تُرسم فوراً وتدخل القراءة الذكية."
        act={inds.length ? <span style={{ display: 'flex', gap: 6 }}><button className="btn sm" disabled={RO} onClick={openIndAdd}><Icon name="plus" /> مؤشر</button><button className="btn sm pri" disabled={RO} onClick={() => openRead()}><Icon name="plus" /> قراءة</button></span> : null}>
        {inds.length ? (
          <div className="inds">
            {inds.map(([id, i]) => {
              const r = indReadings(id), last = r[r.length - 1], prev = r[r.length - 2]; const d = last && prev ? (+last.v) - (+prev.v) : null; const good = d == null ? null : d * (i.good === 'down' ? -1 : 1) > 0;
              return (
                <div key={id} className="ind">
                  <div className="ih"><b>{i.name}</b><span className="u">{i.unit || ''}</span><button className="ibtn sm" title="إخفاء المؤشر" aria-label="إخفاء المؤشر" disabled={RO} onClick={() => indDel(id)}><Icon name="x" /></button></div>
                  <div className="iv"><span className="num big">{last ? String(last.v) : '—'}</span>{d != null ? <span className={'dl ' + (good ? 'ok' : 'bad')}>{d > 0 ? '▲' : d < 0 ? '▼' : '■'} {Math.abs(Math.round(d * 100) / 100)}</span> : null}<span className="mini-note">{last ? ago(last.ts || last.at) + ' · ' + (last.by || '') : 'لا قراءات'}</span></div>
                  <LineChart rs={r} color="var(--accent2)" good={i.good} />
                  <button className="btn sm" disabled={RO} onClick={() => openRead(id)}><Icon name="plus" /> قراءة جديدة</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="emptyst"><Icon name="chart-column-increasing" /><b>لا مؤشرات بعد</b><p>ابدأوا بمؤشرات مقترحة لمتابعة السوق، أو أضيفوا مؤشراً خاصاً بفئتكم.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}><button className="btn pri" disabled={RO} onClick={indSug}>أضف المؤشرات المقترحة</button><button className="btn" disabled={RO} onClick={openIndAdd}>مؤشر خاص</button></div></div>
        )}
      </Panel>
    </>
  );
}

/* ---------- competitors ---------- */
const IMP_C = ['', '#5E9A2A', '#C99A12', '#D9443F'], IMP_K = ['', 'ok', 'warn', 'bad'], IMP_T = ['', 'منخفض', 'متوسط', 'عالٍ'];
export function DComp() {
  useEngine();
  const cs = compList(), th = threatAll(), tl = threatLbl(th);
  const mv = Object.entries(S.cmoves || {}).map(([id, m]) => ({ id, ...m })).filter((m) => m && m.at).sort((a, b) => b.at - a.at);
  const top = [...cs].sort((a, b) => b.threat - a.threat)[0];
  const p54 = fget('5_4', '1');
  return (
    <>
      <div className="kps three">
        <div className="kp"><span className="l">مؤشر تهديد المنافسين</span><span className="v">{th}<small>/100</small></span><span className="s"><span className={'chip ' + tl[1]}>{tl[0]}</span></span></div>
        <div className="kp"><span className="l">تحرّكات خلال ٩٠ يوماً</span><span className="v">{mv.filter((m) => Date.now() - m.at < 90 * DAY).length}</span><span className="s">{mv[0] ? 'آخرها ' + ago(mv[0].at) : 'لم يُرصد شيء'}</span></div>
        <div className="kp"><span className="l">الأخطر الآن</span><span className="v" style={{ fontSize: 22 }}>{top ? top.name : '—'}</span><span className="s">{top ? 'تهديد ' + top.threat + '/100' : ''}</span></div>
      </div>
      <Panel title={<><Icon name="users" /> المنافسون</>} sub="الأساس من بطاقة المنافسين على الطاولة، وتتحدّث الخطورة مع كل تحرّك تسجّلونه."
        act={<button className="btn sm" disabled={RO} onClick={openCompAdd}><Icon name="plus" /> منافس</button>}>
        {cs.length ? (
          <div className="comps">
            {cs.map((c) => {
              const r = c.risk, tl2 = threatLbl(c.threat); const lm = c.moves[c.moves.length - 1];
              return (
                <div key={c.id} className="cc">
                  <div className="ch"><b>{c.name}</b><span className={'chip ' + (['', 'ok', 'warn', 'bad'][r] || '')}>خطورة {RISK_L[r]}</span></div>
                  <div className="tm"><span className="l">التهديد</span><span className="bar"><i style={{ width: c.threat + '%', background: `var(--${tl2[1] === 'ok' ? 'ok' : tl2[1] === 'warn' ? 'warn' : 'danger'})` }} /></span><span className="num">{c.threat}</span></div>
                  <dl><dt>أهم قوة</dt><dd>{c.strong || '—'}</dd><dt>أهم ضعف · بوابة تموضعكم</dt><dd>{c.weak || '—'}</dd></dl>
                  <div className="cf"><small>{c.src === 'card' ? 'من بطاقة المنافسين' : 'أُضيف من اللوحة'} · {AR(c.moves.length)} تحرّكات{lm ? ' · آخرها ' + ago(lm.at) : ''}</small><button className="btn sm" disabled={RO} onClick={() => openMove(c.id)}><Icon name="plus" /> تحرّك</button></div>
                </div>
              );
            })}
          </div>
        ) : <div className="emptyst"><Icon name="users" /><b>لا منافسين بعد</b><p>املؤوا بطاقة «المنافسون» على الطاولة، أو أضيفوا منافساً هنا.</p></div>}
      </Panel>
      <div className="g2">
        <Panel cls="span6" title={<><Icon name="orbit" /> خريطة التموضع</>} sub={`المحاور من بطاقة «مصفوفة التموضع». اسحبوا كل نقطة إلى موقعها، ويُحفظ لحظياً للجميع.${p54.we ? ' موقعنا المقصود: ' + p54.we : ''}`}>
          <div className="pmw"><PosMap /></div>
        </Panel>
        <Panel cls="span6" title={<><Icon name="activity" /> سجل تحرّكات المنافسين</>} sub="كل تحرّك يُسجَّل بتاريخه وأثره، ويدخل حساب التهديد."
          act={cs.length ? <button className="btn sm pri" disabled={RO} onClick={() => openMove()}><Icon name="plus" /> سجّل تحرّكاً</button> : null}>
          <div className="feed">
            {mv.length ? mv.slice(0, 30).map((m) => {
              const ix = m.imp || 1;
              return (
                <div key={m.id} className="fi" style={{ '--ci': IMP_C[ix] }}>
                  <span className="dot" />
                  <div style={{ minWidth: 0 }}>
                    <p><b>{compName(m.c)}</b> · {m.type} <span className={'chip ' + IMP_K[ix]}>أثر {IMP_T[ix]}</span>{m.risk ? <> <span className="chip">الخطورة ← {RISK_L[m.risk]}</span></> : null}</p>
                    {m.note ? <p className="t">{m.note}</p> : null}
                    <p className="t" style={{ fontSize: 12 }}>{m.by || ''}</p>
                  </div>
                  <time>{fmtShort(m.at)}</time>
                </div>
              );
            }) : <p className="empty">لم يُرصد أي تحرّك بعد.</p>}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ---------- all cards ---------- */
const CF_ST = [['all', 'الكل'], ['gold', 'ذهبية'], ['new', 'تغيّرت مؤخراً'], ['low', 'تأكد منخفض'], ['doubt', 'بطاقات شك'], ['open', 'لم تُحسم']];
export function DCards() {
  useEngine();
  const [qv, setQv] = useState(dcf.q);
  const flt = (q) => {
    if (dcf.ax && q.s.n !== dcf.ax) return false; const pl = placed(q.id), lc = lastChange(q.id);
    if (dcf.st === 'gold' && !q.gold) return false; if (dcf.st === 'low' && !(pl && confOf(q.id) && confOf(q.id) <= 2)) return false; if (dcf.st === 'doubt' && !doubtOn(q.id)) return false; if (dcf.st === 'open' && pl) return false;
    if (dcf.st === 'new' && !(lc && (isNew(lc.at) || Date.now() - lc.at < 7 * DAY))) return false;
    if (dcf.q) { const t = (q.slot + ' ' + q.t + ' ' + ansSummary(q) + ' ' + ALLQ.indexOf(q)).toLowerCase(); if (!t.includes(dcf.q.toLowerCase())) return false; }
    return true;
  };
  const groups = STAGES.map((s) => ({ s, qs: s.qs.filter(flt) })).filter((g) => g.qs.length);
  return (
    <Panel title={<><Icon name="layout-grid" /> كل البطاقات</>} sub="القرارات الخمسة والثلاثون كما هي على الطاولة الآن. اضغط أي بطاقة لترى نصها الكامل وسجل تغيّراتها.">
      <div className="cfilt">
        <input className="inp" id="cardQ" placeholder="ابحث في البطاقات والإجابات…" value={qv} aria-label="بحث في البطاقات" onChange={(e) => { setQv(e.target.value); setDcf({ q: e.target.value }); }} />
        <div className="chips">{[[0, 'كل المحاور'], ...STAGES.map((s) => [s.n, s.name])].map(([n, l]) => <button key={n} className={dcf.ax === n ? 'on' : ''} onClick={() => setDcf({ ax: +n })}>{l}</button>)}</div>
        <div className="chips">{CF_ST.map(([k, l]) => <button key={k} className={dcf.st === k ? 'on' : ''} onClick={() => setDcf({ st: k })}>{l}</button>)}</div>
      </div>
      {groups.length ? groups.map((g) => (
        <div key={g.s.n} className="cg">
          <h3 style={{ '--ci': g.s.ci }}><i>{g.s.n}</i>{g.s.name} <small>{g.s.ask} · {stageCount(g.s)}/{g.s.qs.length}</small></h3>
          <div className="mgrid">{g.qs.map((q) => <Mcard key={q.id} q={q} />)}</div>
        </div>
      )) : <p className="empty">لا بطاقات تطابق هذا التصفية.</p>}
    </Panel>
  );
}

/* ---------- follow-up ---------- */
/** حقل مسؤول/مؤشر المحور: حفظ صامت مؤجّل (dashInput) */
function DashField({ k, n, def, ...rest }) {
  const sv = (S.dash && S.dash[k] && S.dash[k][n]) || def;
  const [v, setV] = useState(sv); const foc = useRef(false);
  useEffect(() => { if (!foc.current) setV(sv); }, [sv]);
  return <input id={k + '_' + n} value={v} onFocus={() => { foc.current = true; }} onBlur={() => { foc.current = false; }} onChange={(e) => { setV(e.target.value); dashInput(k, n, e.target.value); }} {...rest} />;
}

/** axCard(s): بطاقة متابعة محور */
export function AxCard({ s }) {
  useEngine();
  const l = axLast(s.n), st = l ? STS[l.st] || STS.ok : null, dd = daysTo(axDue(s.n));
  const t = stageTime(s), bud = s.min * 60, c = stageCount(s), ac = stageAvgConf(s);
  return (
    <article className="axc" style={{ '--ci': s.ci, '--c': s.c }}>
      <div className="top"><span className="n">{s.n}</span>
        <h3>{s.name}<small>{s.ask} · <span className="owner">المسؤول: <DashField k="own" n={s.n} def={AXMETA[s.n].own} aria-label={'مسؤول محور ' + s.name} /></span></small></h3>
        {st ? <span className={'stpill ' + st.c}><Icon name={st.c === 'ok' ? 'check' : st.c === 'warn' ? 'triangle-alert' : 'x'} /> {st.t}</span> : <span className="stpill none">لم يُراجَع</span>}
      </div>
      <div className="decs">
        {s.qs.map((q) => {
          const tm = timeOf(q.id); const pl = placed(q.id);
          return (
            <div key={q.id}><span className="k">Q{q.no}</span>
              <span className={'v' + (pl ? '' : ' empty')} title={q.slot}>{q.gold ? <><span className="g">★</span> </> : null}{pl ? ansSummary(q) : q.slot + ' — قيد الحسم'}</span>
              <span className={'tm' + (tm ? (tm.s > tm.d ? ' over' : ' in') : '')}>{tm ? fmt(tm.s) : '—'}</span></div>
          );
        })}
      </div>
      <div className="axstats">
        <div><span className="l">الاكتمال</span><span className="v num">{c}/{s.qs.length}</span><div className="meter"><i style={{ width: c / s.qs.length * 100 + '%', background: s.ci }} /></div></div>
        <div><span className="l">متوسط التأكد</span><span className="v num">{ac ? ac.toFixed(1) : '—'}<small style={{ color: 'var(--muted)' }}>/5</small></span><div className="meter"><i style={{ width: ac / 5 * 100 + '%', background: ac ? CL[Math.max(1, Math.round(ac))].c : 'transparent' }} /></div></div>
        <div><span className="l">وقت النقاش</span><span className="v num" style={{ color: t > bud ? 'var(--danger)' : 'inherit' }}>{fmt(t)} <small style={{ color: 'var(--muted)' }}>/ {s.min}د</small></span><div className="meter"><i style={{ width: Math.min(100, t / bud * 100) + '%', background: t > bud ? 'var(--danger)' : 'var(--muted)' }} /></div></div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
          <span><Icon name="activity" /> مؤشر المتابعة: <DashField k="kpi" n={s.n} def={AXMETA[s.n].kpi} style={{ border: 0, borderBottom: '1px dashed var(--line)', background: 'none', color: 'var(--ink)', fontSize: 12.5, width: 'min(220px,50vw)' }} aria-label={'مؤشر محور ' + s.name} /></span>
          {l && l.kpi ? <b style={{ color: 'var(--ink)' }}>{l.kpi}</b> : null}
        </div>
        <Spark n={s.n} ci={s.ci} />
      </div>
      <div className="axfoot"><Icon name="calendar-clock" /> {l ? 'آخر مراجعة ' + fmtDate(l.at) : 'لم تبدأ المتابعة'} · {S.done ? (dd < 0 ? <b style={{ color: 'var(--danger)' }}>متأخرة {AR(-dd)} يوم</b> : `القادمة بعد ${AR(dd)} يوم`) : 'تبدأ بعد إنهاء الجلسة'}{' '}
        <button className="btn sm" disabled={RO} onClick={() => openCheck(s.n)}><Icon name="plus" /> سجّل متابعة</button></div>
      <p className="mini-note" style={{ marginTop: -4 }}><Icon name="eye" /> سؤال المراجعة: {AXMETA[s.n].watch}</p>
    </article>
  );
}
export const axCard = AxCard;

export function DFollow() {
  useEngine();
  const fl = follows(), dd = daysTo(nextReview());
  return (
    <>
      <Panel title={<><Icon name="calendar-clock" /> دورة المتابعة</>} sub="كل محور له مسؤول ومؤشر وسؤال مراجعة ثابت. سجّلوا متابعة في كل دورة، وتتحدّث الصحة والاتجاه تلقائياً.">
        <div className="cadence">
          <div className="seg">{CADS.map(([d, t]) => <button key={d} className={cad() === d ? 'on' : ''} disabled={RO} onClick={() => cadSet(d)}>{t}</button>)}</div>
          <span className="due">{S.done ? (dd < 0 ? <span className="chip bad"><Icon name="triangle-alert" /> مراجعة متأخرة {AR(-dd)} يوم</span> : <span className="chip ok"><Icon name="check" /> القادمة بعد {AR(dd)} يوم</span>) : <span className="chip">تبدأ بعد إنهاء الجلسة</span>}</span>
          <button className="btn sm pri" disabled={RO} onClick={() => openCheck(0)}><Icon name="plus" /> متابعة جديدة</button>
        </div>
      </Panel>
      <div className="axgrid">{STAGES.map((s) => <AxCard key={s.n} s={s} />)}</div>
      <Panel title={<><Icon name="activity" /> سجل المتابعات</>}>
        <div className="tl">
          {fl.length ? fl.map((f) => {
            const s = stageOf(+f.ax), st = STS[f.st] || STS.ok;
            return (
              <div key={f.id} className="it" style={{ '--c': s.ci }}>
                <span className="d">{fmtShort(f.at)}</span><span className="dot" />
                <div>
                  <b>{s.name}</b> <span className={'stpill ' + st.c} style={{ padding: '1px 8px', fontSize: 11.5 }}>{st.t}</span> <span className="num" style={{ color: 'var(--muted)', fontSize: 12 }}>{f.pct != null ? f.pct + '٪' : ''}</span>
                  {f.kpi ? <p>المؤشر: <b style={{ color: 'var(--ink)' }}>{f.kpi}</b></p> : null}
                  {f.note ? <p>{f.note}</p> : null}
                  {f.next ? <div className="na"><Icon name="chevron-left" /> الخطوة التالية: {f.next}</div> : null}
                  {f.by ? <p style={{ fontSize: 12 }}>— {f.by}</p> : null}
                </div>
              </div>
            );
          }) : <p className="empty">لا متابعات بعد. اضغط «سجّل متابعة» على أي محور لتضع خط الأساس.</p>}
        </div>
      </Panel>
    </>
  );
}

/* ---------- document tab (dDoc الأصلية؛ التبويب «doc» صار يعرض الصفحات النهائية) ---------- */
export function DDoc() {
  useEngine();
  const rs = riskList();
  return (
    <div className="g2">
      <Panel cls="span7" title={<><Icon name="file-text" /> الوثيقة الاستراتيجية</>} sub="أحد عشر قسماً، كل قسم يُبنى من بطاقات محددة ويتحدّث مع الطاولة. اضغط الحالة لنقلها: مسودة ← قيد المراجعة ← معتمدة.">
        <div className="docs">
          {DOCSECS.map((d) => {
            const f = d.feeds, c = f.filter(placed).length; const st = (S.docst && S.docst[d.n]) || 0; const pc = f.length ? Math.round(c / f.length * 100) : 100;
            return (
              <div key={d.n} className="r"><span className="i">{AR(d.n)}</span>
                <div style={{ minWidth: 0 }}><b>{d.t}</b><small>{d.what}</small></div>
                <div><div className="meter"><i style={{ width: pc + '%', background: pc === 100 ? 'var(--ok)' : 'var(--warn)' }} /></div><small className="num" style={{ textAlign: 'center' }}>{f.length ? c + '/' + f.length + ' بطاقات' : AR(rs.length) + ' بنود'}</small></div>
                <button className={'st s' + (st + 1)} disabled={RO} onClick={() => docstNext(d.n)}>{DOCST[st]}</button>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel cls="span5" title={<><Icon name="download" /> تحميل</>} sub={`«${S.brand}» · ${placedCount()} من ${N_Q} قراراً · ${follows().length} متابعة`}>
        <div className="dlopts">
          {featOn('docx') ? <button onClick={dlDocx}><span className="di" style={{ background: '#2B5A94' }}><Icon name="file-text" /></span><span><b>وثيقة Word (.docx)</b><small>الأقسام الأحد عشر، المخاطر، خطة ٣٠/٦٠/٩٠، وملاحق القرارات والمتابعة.</small></span></button> : null}
          <button onClick={dlHtml}><span className="di" style={{ background: '#1F7A69' }}><Icon name="globe" /></span><span><b>صفحة HTML للطباعة</b><small>افتحها في المتصفح واحفظها PDF من أمر الطباعة.</small></span></button>
          <button onClick={dlJson}><span className="di" style={{ background: '#B07A00' }}><Icon name="database" /></span><span><b>ملف البيانات (JSON)</b><small>كل شيء: البطاقات، السوق، المنافسون، المتابعات.</small></span></button>
        </div>
      </Panel>
    </div>
  );
}

export { dcf, feedF };
