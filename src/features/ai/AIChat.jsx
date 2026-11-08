/* ================= المساعد الذكي للعبة (آلي) — يجيب عن أسئلة اللعبة ويحيل للمستشار البشري ================= */
import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  S, Q, ALLQ, N_Q, CODE, CAP, LS, ICONS, STAGES, SPECIAL, CONFLICTS, ui, setUI, qcode, plist, ansSummary, confOf, doubtOn,
  activeConflicts, resolved, cmsA, featOn,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { toast } from '../../ui/overlays.jsx';
import { openLesson } from '../lessons/LessonDrawer.jsx';
import { openExpert } from '../consult/ExpertModal.jsx';

// أيقونتان أضافهما الأصل في aichat.js (غير موجودتين في مكتبة المحرّك)
if (!ICONS.bot) ICONS.bot = '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>';
if (!ICONS.eraser) ICONS.eraser = '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>';

/* حالة المحادثة (خارج المكوّن لتبقى بين الشاشات) */
const AI = { busy: false, msgs: [], k: null };
const aiSubs = new Set();
const aiBump = () => aiSubs.forEach((f) => f());
const aiKey = () => 'bm3:ai:' + (CODE || 'general');
function aiLoad() { AI.msgs = LS.get(aiKey()) || []; AI.k = aiKey(); }
function aiSave() { LS.set(aiKey(), AI.msgs.slice(-40)); }

/* المعرفة: قواعد اللعبة + فهرس البطاقات + كروت التعارض + ميزات المنصة */
export const AI_KB = (() => {
  const st = STAGES.map((s) => `المحور ${s.n} «${s.name}» (${s.min || ''} دقيقة): ${s.ask || ''}\n` + s.qs.map((q) => `  ${qcode(q)} «${q.slot}»${q.gold ? ' [ذهبية]' : ''}: ${q.head || q.sub || ''}${q.type === 'opt' ? ' — الإجابات: ' + q.ans.filter((a) => !a.spare).map((a) => `${a.k}) ${a.t}: ${a.d || ''}`).join(' | ') : ' — بطاقة تعبئة يكتب فيها الفريق' + ((q.ans || []).length ? ': ' + q.ans.filter((a) => !a.spare).map((a) => a.t).join(' | ') : '')}${q.g && q.g.why ? ' — لماذا تهم: ' + q.g.why : ''}${q.g && q.g.trap ? ' — الفخ: ' + q.g.trap : ''}`).join('\n')).join('\n');
  const sp = SPECIAL.map((x) => `• ${x.t}: ${x.body}${x.use ? ' — ' + x.use.join('؛ ') : ''}`).join('\n');
  const cf = CONFLICTS.map((c) => `• ${c.title}: ${c.why} المخارج: ${c.exits.join('؛ ')}`).join('\n');
  const pf = `• المنصة: جلسة جديدة (تحتاج تسجيل منشّط) أو انضمام برمز BM-XXXX. وضعان: رقمي على الطاولة ثلاثية الأبعاد، أو فيزيائي بالبطاقات المطبوعة ثم تصوير لوحة الاستلام (زر الكاميرا).
• لكل بطاقة مؤقت، ودرجة تأكد من ١ إلى ٥، وبطاقة شك، ودرس (زر الكتاب)، ووكيل ذكي يقيّم القرار في لوحة المتابعة.
• بطاقة المشروع: إحدى عشرة معلومة قبل اللعب، وتُستكمل بعده بالحضور الرقمي (الموقع والحسابات) قبل إنهاء الجلسة.
• لوحة المتابعة بعد الجلسة: نظرة عامة، الصفحات النهائية والمهام، المسارات، الحضور الرقمي، السوق، المنافسون، البطاقات، المتابعة الدورية، وتحميل وثيقة المشروع Word.
• «استعن بمستشار» (زر المصافحة): حجز مستشار حقيقي معتمد بموعد أو انضمام فوري للطاولة.`;
  return `## المحاور والبطاقات\n${st}\n\n## أساسيات اللعبة\n${sp}\n\n## كروت التعارض\n${cf}\n\n## ميزات المنصة\n${pf}`;
})();

/** سياق الجلسة المفتوحة للمساعد */
export function aiSessionCtx() {
  if (!S) return 'لا توجد جلسة مفتوحة الآن.';
  const q = Q[ui.q]; const placed = ALLQ.filter((x) => plist(x.id).length);
  const lines = [`العلامة: ${S.brand || '—'} · الوضع: ${(S.cfg && S.cfg.mode) === 'physical' ? 'فيزيائي' : 'رقمي'} · الإنجاز: ${placed.length} من ${N_Q}${S.done ? ' · الجلسة منتهية وفي مرحلة المتابعة' : ''}`];
  if (q) lines.push(`البطاقة المفتوحة الآن: ${qcode(q)} «${q.slot}» — ${q.head || q.sub || ''}${q.gold ? ' | بطاقة ذهبية' : ''}${q.type === 'fill' ? ' | بطاقة تعبئة' : ''}${plist(q.id).length ? ' | قرار الطاولة: ' + ansSummary(q) : ' | لم تُحسم بعد'}`);
  const dec = placed.slice(0, 40).map((x) => `${qcode(x)} ${x.slot}: ${ansSummary(x)}${confOf(x.id) ? ' (تأكد ' + confOf(x.id) + '/5)' : ''}${doubtOn(x.id) ? ' [شك]' : ''}`);
  if (dec.length) lines.push('قرارات الطاولة:\n' + dec.join('\n'));
  const cs = activeConflicts(); if (cs.length) lines.push('تعارضات مفتوحة: ' + cs.map((c) => c.title + (resolved(c) ? ' (محسوم)' : '')).join('، '));
  const ik = (S.intake || {}); const ikv = Object.entries(ik).filter(([, v]) => typeof v === 'string' && v.trim()).slice(0, 8).map(([, v]) => v.slice(0, 80));
  if (ikv.length) lines.push('من بطاقة المشروع: ' + ikv.join(' · '));
  return lines.join('\n');
}

/** نص الطلب الكامل للمساعد */
export function aiPrompt(question) {
  const hist = AI.msgs.slice(-8).map((m) => (m.r === 'u' ? 'المستخدم: ' : 'المساعد: ') + String(m.t).slice(0, 600)).join('\n');
  return `أنت «مساعد براند ماب الذكي»: مساعد آلي داخل منصة لعبة «براند ماب» لبناء استراتيجية العلامة التجارية (٨ محاور، ٣٥ بطاقة، ٣ بطاقات ذهبية) من إعداد زورق.
مهمتك: الإجابة عن الأسئلة المتعلقة باللعبة فقط: قواعدها، معنى كل بطاقة وإجاباتها، الفرق بين الخيارات، كيف تُدار الجلسة، وكيف تُستخدم ميزات المنصة. وتساعد الطاولة على فهم السؤال دون أن تقرّر عنها.
قواعد:
- أجب بالعربية الفصحى المبسّطة، بإيجاز ودقة (٣ إلى ٨ أسطر غالباً). استخدم «• » للنقاط عند الحاجة. لا تستخدم Markdown آخر.
- عند ذكر بطاقة اكتب رمزها بالصيغة Q<المحور>.<الرقم> مثل Q2.1 ليصبح رابطاً لدرسها.
- استند إلى المعرفة أدناه ولا تخترع بطاقات أو قواعد غير موجودة. إن لم تجد الجواب فيها فقل ذلك.
- أنت لست مستشاراً بشرياً. إن كان السؤال قراراً استراتيجياً خاصاً بعمل العميل يحتاج حكماً مهنياً (اختيار شريحة أو تسعير أو تموضع بعينه، أو مسألة قانونية في التسمية والتسجيل، أو خلاف حاد في الطاولة)، فقدّم الإطار والأسئلة التي تساعدهم، واجعل escalate=true مع سبب قصير ليحجزوا مستشاراً حقيقياً.
- إن كان السؤال خارج اللعبة والعلامة التجارية تماماً، فاعتذر بلطف واذكر ما تستطيع المساعدة فيه.
- اقترح سؤالين أو ثلاثة للمتابعة قصيرة جداً (أقل من ٧ كلمات).

=== المعرفة ===
${AI_KB}

=== سياق الجلسة الحالية ===
${aiSessionCtx()}
الشاشة الحالية: ${({ home: 'الصفحة الرئيسية', start: 'البداية', play: 'الطاولة', dash: 'لوحة المتابعة', projects: 'المشاريع', lessons: 'الدروس', consult: 'لوحة المستشار' })[ui.view] || ui.view}

=== المحادثة السابقة ===
${hist || '(بداية المحادثة)'}

سؤال المستخدم الآن: ${question}

أعد JSON فقط بالشكل: {"answer":"…","cards":["Q1.1"],"suggest":["…","…"],"escalate":false,"why":""}`;
}

/** أسئلة البداية المقترحة (قابلة للتخصيص من إدارة المنصة) */
export const AI_STARTERS = () => {
  const cs = (((cmsA().feat || {}).chat) || {}).starters; if (cs && cs.length) return cs.slice(0, 5);
  const q = S && Q[ui.q]; const a = [];
  if (ui.view === 'play' && q) a.push(`اشرح لي البطاقة ${qcode(q)}`, `ما الفرق بين إجابات «${q.slot}»؟`);
  a.push('كيف تعمل البطاقات الذهبية؟', 'متى يُرفع كرت التعارض؟', 'ما معنى درجة التأكد؟', 'كيف أصوّر لوحة الاستلام؟');
  if (ui.view === 'dash') a.unshift('كيف أستفيد من لوحة المتابعة؟');
  return a.slice(0, 5);
};

/** يرسل سؤالاً للمساعد */
export async function aiAsk(t) {
  t = String(t || '').trim(); if (!t || AI.busy) return;
  if (AI.k !== aiKey()) aiLoad();
  AI.msgs = [...AI.msgs, { r: 'u', t, at: Date.now() }]; AI.busy = true; aiSave(); aiBump();
  if (!CAP.sample) {
    await new Promise((r) => setTimeout(r, 300));
    AI.msgs = [...AI.msgs, { r: 'a', t: 'المساعد الذكي يعمل في الأداة المنشورة فقط. افتحوا الرابط من Claude لتجربته.', err: true, at: Date.now() }];
    AI.busy = false; aiSave(); aiBump(); return;
  }
  try {
    const r = await CAP.sample.json(aiPrompt(t), { modelTier: 'default', feat: 'chat' });
    const m = {
      r: 'a', at: Date.now(),
      t: String((r && r.answer) || 'لم أجد جواباً واضحاً. أعيدوا صياغة السؤال.').slice(0, 2400),
      cards: (Array.isArray(r && r.cards) ? r.cards : []).map(String).filter((c) => /^Q[1-8]\.[1-9]$/.test(c)).slice(0, 4),
      suggest: (Array.isArray(r && r.suggest) ? r.suggest : []).map((s) => String(s).slice(0, 60)).filter(Boolean).slice(0, 3),
      esc: !!(r && r.escalate), why: String((r && r.why) || '').slice(0, 200),
    };
    AI.msgs = [...AI.msgs, m];
  } catch (e) {
    const c = e && e.code;
    AI.msgs = [...AI.msgs, { r: 'a', err: true, at: Date.now(), t: c === 'not_granted' ? 'لم يُسمح باستخدام الذكاء الاصطناعي في هذا العرض.' : c === 'rate_limited' ? 'أسئلة كثيرة في وقت قصير. انتظروا دقيقة ثم أعيدوا المحاولة.' : 'تعذّر الرد الآن. أعيدوا المحاولة بعد قليل.' }];
  } finally {
    AI.busy = false; aiSave(); aiBump();
  }
}

/** يفتح لوحة المساعد */
export function openAIChat() { setUI({ aiOpen: true }); }
export function closeAIChat() { setUI({ aiOpen: false }); }
/** يبدّل فتح/إغلاق اللوحة (زر المساعد في الطاولة) */
export function toggleAIChat() { setUI({ aiOpen: !ui.aiOpen }); }

/** يحوّل رموز البطاقات (Q1.3) إلى روابط لدروسها، والأسطر إلى فواصل */
function Linkified({ text }) {
  const parts = String(text).split(/(\bQ[1-8]\.[1-9]\b|\n)/);
  return parts.map((p, i) => {
    if (p === '\n') return <br key={i} />;
    const m = p.match(/^Q([1-8])\.([1-9])$/);
    if (m) { const id = m[1] + '_' + m[2]; if (Q[id]) return <button key={i} className="qlink" title={Q[id].slot} onClick={() => openLesson(id)}>{p}</button>; }
    return p ? <React.Fragment key={i}>{p}</React.Fragment> : null;
  });
}

function aiEsc() {
  if (S) { closeAIChat(); openExpert(); }
  else toast('افتحوا جلسة أو انضموا لطاولة أولاً، ثم احجزوا مستشاراً من زر المصافحة.', 'err');
}

function Msg({ m }) {
  if (m.r === 'u') return <div className="aim u"><p>{m.t}</p></div>;
  return (
    <div className={'aim a ' + (m.err ? 'err' : '')}>
      <span className="aiav"><Icon name="bot" /></span>
      <div>
        <p><Linkified text={m.t} /></p>
        {(m.cards || []).length ? (
          <div className="aicards">
            {m.cards.map((c, i) => { const x = String(c).match(/^Q([1-8])\.([1-9])$/); const id = x && x[1] + '_' + x[2]; return id && Q[id] ? <button key={i} onClick={() => openLesson(id)}><Icon name="book" /> {c} · {Q[id].slot}</button> : null; })}
          </div>
        ) : null}
        {m.esc ? (
          <div className="aiesc"><Icon name="handshake" /><span><b>هذا يحتاج رأياً بشرياً</b>{m.why ? m.why : 'قرار خاص بعملكم يستحق حكم مستشار حقيقي.'}</span><button className="btn sm gold" data-act="aiEsc" onClick={aiEsc}>احجز مستشاراً</button></div>
        ) : null}
      </div>
    </div>
  );
}

/** زر المساعد العائم + اللوحة الجانبية (عام في التطبيق) */
export default function AIChat() {
  useEngine();
  const [, force] = useReducer((x) => x + 1, 0);
  const [val, setVal] = useState('');
  const inRef = useRef(null), bodyRef = useRef(null), wasBusy = useRef(false);
  useEffect(() => { aiSubs.add(force); return () => { aiSubs.delete(force); }; }, []);
  if (AI.k !== aiKey()) aiLoad();
  const on = featOn('chat');
  const open = !!ui.aiOpen && on;
  useEffect(() => { document.body.classList.toggle('ai-on', open); }, [open]);
  useEffect(() => { if (open) { const t = setTimeout(() => inRef.current && inRef.current.focus(), 80); return () => clearTimeout(t); } }, [open]);
  useEffect(() => { const b = bodyRef.current; if (b) b.scrollTop = b.scrollHeight; }, [AI.msgs, AI.busy, open]);
  useEffect(() => { if (wasBusy.current && !AI.busy && open && inRef.current) inRef.current.focus(); wasBusy.current = AI.busy; });
  if (!on) return null;

  const send = () => { const v = val; setVal(''); aiAsk(v); };
  const last = AI.msgs[AI.msgs.length - 1];
  const sug = last && last.r === 'a' && (last.suggest || []).length ? last.suggest : AI.msgs.length ? [] : AI_STARTERS();
  const welcome = (((cmsA().feat || {}).chat) || {}).welcome || 'اسألني عن أي بطاقة أو قاعدة في براند ماب، أو عن طريقة استخدام المنصة. أنا مساعد آلي ولا أتخذ القرار عنكم.';
  const fabHidden = open || ui.view === 'play' || ui.view === 'admin';
  return (
    <>
      <button id="aiFab" className="aifab" aria-label="المساعد الذكي للعبة" hidden={fabHidden} onClick={toggleAIChat}><Icon name="bot" /><span>اسأل عن اللعبة</span></button>
      <aside id="aiPanel" className={'aip' + (open ? ' on' : '')} aria-label="المساعد الذكي">
        <header className="aih">
          <span className="aiav big"><Icon name="bot" /></span>
          <div><b>المساعد الذكي للعبة</b><small>آلي · يجيب عن القواعد والبطاقات والمنصة{S ? ' · يعرف جلسة ' + S.brand : ''}</small></div>
          <button className="ibtn" title="محادثة جديدة" aria-label="محادثة جديدة" onClick={() => { AI.msgs = []; aiSave(); aiBump(); }}><Icon name="eraser" /></button>
          <button className="ibtn" aria-label="إغلاق" onClick={closeAIChat}><Icon name="x" /></button>
        </header>
        <div className="aibody" id="aiBody" ref={bodyRef}>
          {AI.msgs.length ? null : (
            <div className="aiwel"><p>{welcome}</p><p className="mini-note">للقرارات الخاصة بعملكم: <Icon name="handshake" /> «استعن بمستشار» يحجز لكم شخصاً حقيقياً معتمداً.</p></div>
          )}
          {AI.msgs.map((m, i) => <Msg key={(m.at || 0) + '-' + i} m={m} />)}
          {AI.busy ? <div className="aim a"><span className="aiav"><Icon name="bot" /></span><div><p className="typing"><i /><i /><i /></p></div></div> : null}
        </div>
        {sug.length && !AI.busy ? <div className="aisug">{sug.map((s, i) => <button key={i} onClick={() => aiAsk(s)}>{s}</button>)}</div> : null}
        <form className="aiform" id="fAI" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <textarea ref={inRef} className="inp" id="aiIn" rows={1} maxLength={600} placeholder="اكتب سؤالك عن اللعبة…" disabled={AI.busy} value={val}
            onChange={(e) => { setVal(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button className="btn pri" type="submit" disabled={AI.busy} aria-label="أرسل"><Icon name="send" /></button>
        </form>
        <p className="aifoot">إجابات آلية قد تخطئ. القرار للطاولة.</p>
      </aside>
    </>
  );
}
