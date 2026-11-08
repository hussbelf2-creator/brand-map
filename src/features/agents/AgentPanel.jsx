/* ================= وكيل لكل بطاقة ================= */
import React from 'react';
import {
  S, Q, CM, RO, CAP, INTAKE, DOCSECS, ui, setUI, patch, logEv, placed, plist, AK, fillText, ansTitle, ansSummary,
  activeConflicts, resolved, confOf, doubtOn, defLine, qcode, newId, whoName, AR, ago, fmtShort, featOn, cmsA,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { toast } from '../../ui/overlays.jsx';
import { pageFeeds } from '../pages/logic.js';

/** دورات الوكيل على البطاقة، الأحدث أولاً */
export const agentRuns = (qid) => Object.entries(((S && S.agents) || {})[qid] || {}).map(([id, r]) => ({ id, ...r })).filter((r) => r && r.at && r.data).sort((a, b) => b.at - a.at);
export const VERD = { strong: ['قوي', 'ok'], develop: ['يحتاج تطويراً', 'warn'], weak: ['ضعيف', 'bad'] };
export function agentName(q) { return `وكيل «${q.slot}»`; }

/** لوحة وكيل البطاقة (agentPanel الأصلية مع غلاف الإدارة من admin2) */
export function AgentPanel({ qid, small = false }) {
  useEngine();
  if (!featOn('agents')) return <p className="mini-note">وكلاء البطاقات غير متاحين حالياً.</p>;
  if (((cmsA().cards || {})[qid] || {}).off) return <p className="mini-note">وكيل هذه البطاقة موقوف من إدارة المنصة.</p>;
  const runs = agentRuns(qid), L = runs[0];
  const busy = ui.agBusy === qid;
  const can = !!CAP.sample && !RO && placed(qid);
  const btn = (
    <button className={'btn sm ' + (L ? '' : 'pri')} disabled={!can || busy} onClick={() => runAgent(qid)}>
      <Icon name="wand-sparkles" /> {busy ? 'يعمل الوكيل…' : L ? 'دورة تطوير جديدة' : 'شغّل الوكيل'}
    </button>
  );
  if (!L) return (
    <div className="agp">
      {!CAP.sample ? <p className="mini-note">الوكيل يعمل عند فتح الأداة من رابطها في Claude.</p>
        : !placed(qid) ? <p className="mini-note">ضعوا البطاقة على اللوحة أولاً ثم شغّلوا وكيلها.</p>
          : <p className="mini-note">لم يعمل الوكيل على هذه البطاقة بعد.</p>}
      {btn}
    </div>
  );
  const d = L.data, v = VERD[d.verdict] || VERD.develop, prev = runs[1];
  const dl = prev ? (d.score - (prev.data.score || 0)) : null;
  return (
    <div className="agp">
      <div className="agh">
        <span className={'chip ' + v[1]}>{v[0]}</span>
        <b className="num">{d.score}<small>/100</small></b>
        {dl != null ? <span className={'dl ' + (dl >= 0 ? 'ok' : 'bad')}>{dl >= 0 ? '▲' : '▼'} {Math.abs(dl)}</span> : null}
        <small className="mini-note">الدورة {AR(runs.length)} · {ago(L.at)}</small>
      </div>
      <p>{d.summary}</p>
      {small ? null : (
        <>
          {(d.issues || []).length ? <><h5>ملاحظات على الإجابة</h5><ul>{d.issues.map((x, i) => <li key={i}>{x}</li>)}</ul></> : null}
          {(d.develop || []).length ? <><h5>كيف تتطور</h5><ul>{d.develop.map((x, i) => <li key={i}><b>{x.t}</b>{x.why ? ` — ${x.why}` : ''}</li>)}</ul></> : null}
        </>
      )}
      {d.deliverable ? <details open={!small}><summary>المخرج المقترح للوثيقة</summary><pre className="ft">{d.deliverable}</pre></details> : null}
      {d.next ? <p className="mini-note"><Icon name="refresh-cw" /> في الدورة القادمة: {d.next}</p> : null}
      {runs.length > 1 ? <div className="agv">{runs.slice().reverse().map((r, i) => <span key={r.id} title={fmtShort(r.at)}>ن{AR(i + 1)}: {r.data.score}</span>)}</div> : null}
      {btn}
    </div>
  );
}

/** يشغّل وكيل البطاقة دورة جديدة ويحفظ تقريره في الجلسة */
export async function runAgent(qid, { quiet = false } = {}) {
  if (!CAP.sample || (ui.agBusy && !quiet)) return false;
  const q = Q[qid]; if (!q || !placed(qid)) return false;
  setUI({ agBusy: qid });
  const g = q.g || {}, r = CM[qid] || {}, prev = agentRuns(qid)[0];
  const ans = plist(qid).map((k) => { const a = AK(q, k); const t = fillText(q, k); return `- ${ansTitle(q, k)}${t ? '\n' + t : ''}${a && a.x ? ' (' + a.x + ')' : ''}`; }).join('\n');
  const rel = [...new Set((r.secs || []).flatMap((n) => pageFeeds(n)))].filter((id) => id !== qid && placed(id)).slice(0, 14).map((id) => `${Q[id].slot}: ${ansSummary(Q[id])}`).join('\n');
  const cfs = activeConflicts().filter((c) => c.a[0] === qid || c.b.some((b) => b[0] === qid)).map((c) => `${c.title}${resolved(c) ? ' (محسوم: ' + c.exits[S.res[c.id]] + ')' : ''}`).join('، ');
  const I = S.intake || {};
  const ik = INTAKE.map((x) => { const v = I[x.k]; if (!v) return ''; return `${x.t}: ${typeof v === 'object' ? (Array.isArray(v) ? v.join('، ') : Object.values(v).join(' / ')) : v}`; }).filter(Boolean).join(' · ');
  const prompt = `أنت «${agentName(q)}»: وكيل متخصص في هذه البطاقة من لعبة «براند ماب» لبناء استراتيجية العلامات، تعمل لعلامة «${S.brand}» في السوق السعودي والخليجي.
${defLine()}
بطاقة المشروع: ${ik || 'غير مكتملة'}

البطاقة: ${qcode(q)} · المحور «${q.s.name}» (${q.s.ask}) · السؤال: ${q.t}${q.sub ? ' — ' + q.sub : ''}${q.gold ? ' · قرار ذهبي' : ''}
لماذا هي مهمة: ${g.why || '-'}
طريقة اللعب: ${g.how || '-'}
الخطأ الشائع: ${g.trap || '-'}
اختبار الجودة: ${q.tests || '-'}
المخرج المطلوب للوثيقة: ${r.out || '-'} · يستخدم في: ${r.use || '-'}

إجابة الطاولة:
${ans}
درجة التأكد: ${confOf(qid) || 'غير محددة'}/5${doubtOn(qid) ? ' · بطاقة شك مرفوعة' : ''}${cfs ? '\nتعارضات: ' + cfs : ''}
قرارات مرتبطة:
${rel || 'لا شيء'}
${prev ? `\nتقريرك السابق (الدورة ${agentRuns(qid).length}): ${prev.data.summary} · الدرجة ${prev.data.score} · ما وعدت به للدورة القادمة: ${prev.data.next || '-'}\nابنِ على تقريرك السابق ووضّح ما تغيّر.` : ''}

المهمة: قيّم الإجابة باختبار الجودة، واقترح كيف تتطور، واكتب المخرج المقترح كما يُصاغ في الوثيقة النهائية. لا تخترع أرقاماً أو حقائق عن السوق، ولا تدّعِ أنك بحثت في الإنترنت. اكتب بالعربية بجمل قصيرة.
أعد JSON فقط:
{"verdict":"strong|develop|weak","score":0-100,"summary":"جملتان","issues":["ملاحظة محددة"],"develop":[{"t":"خطوة تطوير","why":"سببها"}],"deliverable":"نص المخرج للوثيقة (٣-٦ أسطر)","next":"ما ستراجعه في الدورة القادمة"}`;
  try {
    const a = await CAP.sample.json(prompt, { modelTier: 'default', feat: 'agents', q: qid });
    const L = (x, n) => (Array.isArray(x) ? x : []).slice(0, n);
    const data = {
      verdict: ['strong', 'develop', 'weak'].includes(a && a.verdict) ? a.verdict : 'develop',
      score: Math.max(0, Math.min(100, Math.round(+(a && a.score) || 0))),
      summary: String((a && a.summary) || '').slice(0, 500),
      issues: L(a && a.issues, 5).map((x) => String(x).slice(0, 240)),
      develop: L(a && a.develop, 4).map((x) => ({ t: String((x && x.t) || x || '').slice(0, 200), why: String((x && x.why) || '').slice(0, 200) })),
      deliverable: String((a && a.deliverable) || '').slice(0, 1500),
      next: String((a && a.next) || '').slice(0, 240),
    };
    patch({ agents: { [qid]: { [newId()]: { at: Date.now(), by: whoName(), data } } } }, { now: true });
    logEv('card', `${agentName(q)}: ${data.summary}`, { ax: q.s.n, verb: 'شغّل وكيل بطاقة' });
    if (!quiet) toast(`أنهى ${agentName(q)} الدورة ${AR(agentRuns(qid).length)}.`, 'gold');
    return true;
  } catch (e) {
    if (!quiet) toast(e && e.code === 'rate_limited' ? 'طلبات كثيرة للوكلاء. انتظروا دقيقة.' : 'تعذّر تشغيل الوكيل الآن.', 'err');
    return false;
  } finally {
    setUI({ agBusy: null });
  }
}

/** يشغّل وكلاء كل البطاقات الموضوعة في صفحة من الوثيقة، واحداً تلو الآخر. التقدّم في ui.agBatch / ui.agBatchMsg */
export async function runPageAgents(n) {
  const ids = pageFeeds(n).filter(placed);
  if (!ids.length) { toast('لا بطاقات موضوعة في هذه الصفحة.', 'err'); return; }
  setUI({ agBatch: n });
  let ok = 0;
  for (const id of ids) {
    setUI({ agBatchMsg: `${AR(ok + 1)} من ${AR(ids.length)}: ${Q[id].slot}` });
    if (await runAgent(id, { quiet: true })) ok++;
    await new Promise((r) => setTimeout(r, 600));
  }
  setUI({ agBatch: null });
  toast(`عمل ${AR(ok)} وكلاء على صفحة «${DOCSECS[n - 1].t}».`, 'gold');
}

/** شارة درجة آخر دورة للوكيل (agentScoreChip) */
export function AgentScoreChip({ qid }) {
  useEngine();
  const L = agentRuns(qid)[0]; if (!L) return null;
  const v = VERD[L.data.verdict] || VERD.develop;
  return <span className={'agc ' + v[1]} title={agentName(Q[qid])}><Icon name="wand-sparkles" />{L.data.score}</span>;
}
