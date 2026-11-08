/* ================= لوحة متابعة العميل — المنطق (بلا عرض) =================
   منقول من dash.js بالأسماء الأصلية. الحالة المحلية للوحة (dsel, dcf, feedF) متغيرات وحدة تُقرأ مباشرة وتُغيَّر عبر setDsel/setDcf/setFeedF. */
import {
  S, CODE, ui, setUI, bump, patch, notify, logEv, newId, whoName, LS, ME, SND, CAP,
  STAGES, ALLQ, DAY, AR, CL, AXMETA,
  plist, placed, confOf, doubtOn, qlabel, qcode, ansSummary, activeConflicts, resolved,
  stageCount, stageAvgConf, stageOf, compList, compName, defLine, feedItems, fmtShort, fget,
} from '../../engine/engine.js';
import { copyText } from '../../ui/util.js';

/** رابط الأداة المنشورة (من boot.js الأصلي) — لنسخ رابط اللوحة */
export const APP_URL = 'https://claude.ai/artifact/AchzsWfXYWCtENipa9da3o';

export const CADS = [[7, 'أسبوعية'], [14, 'كل أسبوعين'], [30, 'شهرية'], [90, 'ربع سنوية']];
export const STS = { ok: { t: 'على المسار', d: 'القرار مطبّق ويعمل', c: 'ok', sc: 30 }, warn: { t: 'يحتاج انتباه', d: 'تطبيق جزئي أو مؤشر يتراجع', c: 'warn', sc: 15 }, bad: { t: 'متعثّر', d: 'القرار لا يُطبَّق أو ثبت خطؤه', c: 'bad', sc: 0 } };

/** اختيار نموذج المتابعة الحالي (المحور، الحالة، النسبة) */
export let dsel = { st: 'ok', ax: 1 };
export function setDsel(p) { dsel = { ...dsel, ...p }; }

export const follows = () => Object.entries((S && S.follow) || {}).map(([id, f]) => ({ id, ...f })).filter((f) => f && f.ax && f.at).sort((a, b) => b.at - a.at);
export const axFollows = (n) => follows().filter((f) => +f.ax === n);
export const cad = () => ((S && S.dash && S.dash.cad) || 30);
export function axLast(n) { return axFollows(n)[0] || null; }
export function axDue(n) { const l = axLast(n); const base = l ? l.at : (S.doneAt || S.updated || Date.now()); return base + cad() * DAY; }
export function axHealth(s) { const comp = stageCount(s) / s.qs.length, cf = stageAvgConf(s) / 5, l = axLast(s.n); const st = l ? (STS[l.st] || STS.ok).sc : 18; return Math.round(comp * 40 + cf * 30 + st); }
export function overall() { return Math.round(STAGES.reduce((a, s) => a + axHealth(s), 0) / STAGES.length); }
export function nextReview() { return Math.min(...STAGES.map((s) => axDue(s.n))); }
export const daysTo = (t) => Math.round((t - Date.now()) / DAY);

export function riskList() {
  const out = [];
  activeConflicts().forEach((c) => { const r = S.res && S.res[c.id]; out.push({ lvl: resolved(c) ? 'w' : 'b', t: 'تعارض: ' + c.title, d: resolved(c) ? 'المخرج المختار: ' + c.exits[r] : c.why }); });
  ALLQ.forEach((q) => {
    if (doubtOn(q.id)) out.push({ lvl: 'b', t: `بطاقة شك · ${qlabel(q)} ${q.slot}`, d: placed(q.id) ? 'القرار: ' + ansSummary(q) : 'لم توضع بعد' });
    const c = confOf(q.id); if (placed(q.id) && c && c <= 2) out.push({ lvl: 'w', t: `تأكد منخفض · ${qlabel(q)} ${q.slot}`, d: `${CL[c].t}: ${ansSummary(q)} — يحتاج دليلاً قبل الإطلاق` });
  });
  const open = ALLQ.filter((q) => !placed(q.id)); if (open.length) out.push({ lvl: 'w', t: `${AR(open.length)} قرارات لم تُحسم`, d: open.slice(0, 6).map((q) => q.slot).join('، ') + (open.length > 6 ? '…' : '') });
  STAGES.forEach((s) => { if (S.done && daysTo(axDue(s.n)) < 0) out.push({ lvl: 'b', t: `متابعة متأخرة · ${s.name}`, d: `مضى موعد المراجعة بـ${AR(-daysTo(axDue(s.n)))} يوم` }); });
  return out;
}
export function optKey(qid) { return plist(qid)[0]; }
export function plan() {
  const P = { 30: [], 60: [], 90: [] }; const g = ALLQ.filter((q) => q.gold && placed(q.id));
  P[30].push(g.length ? `ثبّت القرارات الذهبية: ${g.map((q) => ansSummary(q)).join(' · ')}` : 'احسم القرارات الذهبية الثلاث بالإجماع (الشريحة، القيمة، الاسم)');
  const low = ALLQ.filter((q) => placed(q.id) && confOf(q.id) && confOf(q.id) <= 2).length + ALLQ.filter((q) => doubtOn(q.id)).length; if (low) P[30].push(`اختبر ${AR(low)} قرارات هشّة بدليل حسّي: مقابلات عملاء أو أرقام مبيعات`);
  if (placed('6_1') || placed('6_3')) P[30].push('افحص الاسم قانونياً وسجّل العلامة والنطاقات المتاحة');
  if (placed('7_1') || placed('7_3')) P[30].push('سلّم موجز التصميم (المزاج، نوع الشعار، الألوان) للمصمم');
  const m = optKey('1_1'); P[60].push({ 3: 'خصّص ميزانية لتعليم السوق: من يعلّم الفئة يملكها', 4: 'ركّز على الحصة: توسّع في القنوات أسرع من تحسين المنتج', 1: 'أطلق برنامج ولاء وتمايز: القضم من المنافس لا من فراغ', 2: 'قرّر: تجديد الفئة، أو التموضع في سوق مجاور نامٍ' }[m] || 'حدّد مرحلة السوق لتعرف نوع معركتك');
  if (optKey('1_6') === '1') P[60].push('ابنِ حواجز ناعمة سريعاً: مجتمع، قصة، علاقات توزيع حصرية');
  const v = optKey('3_3'); if (v) { const t = { 1: 'اعتمد إيقاع إصدارات دائماً لحماية قيادة المنتج', 2: 'صمّم رحلة خدمة شخصية تُقاس برضا العميل', 3: 'وثّق العمليات وخفّض التكلفة لكل طلب' }[v]; if (t) P[60].push(t); }
  if (placed('5_2')) P[60].push('اختبر الشعار اللفظي مع ٢٠ عميلاً من الشريحة الأهم');
  if (placed('2_5')) P[60].push('افتح نقطة دخول واحدة على الأقل في «يوم في حياة عميلي»');
  P[90].push('راجع مؤشرات المحاور الثمانية في لوحة المتابعة وقارنها بخط الأساس');
  if (placed('8_3')) P[90].push('حوّل الرسالة المؤسسية إلى ثلاث مبادرات بأسماء ومسؤولين');
  P[90].push('جلسة مراجعة ربع سنوية: أعِد فتح أي محور حالته «متعثّر»');
  return P;
}

/* ---------- لوحة العميل الاحترافية ---------- */
export const DTABS = [['over', 'نظرة عامة', 'layout-dashboard'], ['pages', 'الصفحات النهائية', 'file-text'], ['tracks', 'المتابعة المتخصصة', 'list-checks'], ['digital', 'الحضور الرقمي', 'globe'], ['market', 'السوق', 'store'], ['comp', 'المنافسون', 'users'], ['cards', 'كل البطاقات', 'layout-grid'], ['follow', 'متابعة المحاور', 'calendar-clock']];
export const PEST = [['p', 'P', 'سياسي'], ['e', 'E', 'اقتصادي'], ['s', 'S', 'اجتماعي'], ['t', 'T', 'تقني'], ['l', 'L', 'قانوني'], ['n', 'E', 'بيئي']];
export const IMP = { opp: ['فرصة', 'ok'], threat: ['تهديد', 'bad'], watch: ['مراقبة', 'warn'] };
export const MOVE_T = ['تغيير سعر', 'منتج جديد', 'حملة تسويقية', 'توسّع أو فرع جديد', 'شراكة', 'تغيير في الهوية', 'أخرى'];
export const RISK_L = ['', 'منخفضة', 'متوسطة', 'عالية'];
export const SUG_IND = [{ name: 'حجم السوق التقديري', unit: 'مليون ريال', good: 'up' }, { name: 'نمو الفئة', unit: '٪', good: 'up' }, { name: 'متوسط سعر الفئة', unit: 'ريال', good: 'up' }, { name: 'حصتنا التقديرية', unit: '٪', good: 'up' }];

/** تصفية «كل البطاقات» وتصفية سجل التغييرات — تبقى بين التبويبات */
export let dcf = { ax: 0, st: 'all', q: '' };
export let feedF = 'all';
export function setDcf(p, { replace = false } = {}) { dcf = replace ? { ax: 0, st: 'all', q: '', ...p } : { ...dcf, ...p }; bump(); }
export function setFeedF(k) { feedF = k; bump(); }

export function threatAll() { const c = compList(); return c.length ? Math.round(c.reduce((a, x) => a + x.threat, 0) / c.length) : 0; }
export const threatLbl = (v) => (v >= 65 ? ['مرتفع', 'bad'] : v >= 35 ? ['متوسط', 'warn'] : ['منخفض', 'ok']);
export function indReadings(id) { return Object.values((S && S.mread) || {}).filter((r) => r && r.ind === id && isFinite(+r.v)).sort((a, b) => a.at - b.at); }
export function momentum() { let up = 0, n = 0; Object.entries((S && S.mind) || {}).forEach(([id, ind]) => { if (!ind || ind.del) return; const r = indReadings(id); if (r.length < 2) return; n++; const d = (+r[r.length - 1].v) - (+r[r.length - 2].v); if (d * (ind.good === 'down' ? -1 : 1) > 0) up++; }); return { up, n }; }
export const lastChange = (qid) => { const h = Object.values(((S && S.hist) || {})[qid] || {}).filter((e) => e && e.at).sort((a, b) => b.at - a.at); return h[0] || null; };
export const histCount = (qid) => Object.keys(((S && S.hist) || {})[qid] || {}).length;
export const isNew = (t) => t && ui.seenAt && t > ui.seenAt;
export const hcol = (v) => (v >= 70 ? 'var(--ok)' : v >= 45 ? 'var(--warn)' : 'var(--danger)');
/** المؤشرات الظاهرة (غير المحذوفة) */
export const liveInds = () => Object.entries((S && S.mind) || {}).filter(([, i]) => i && !i.del);

/** قيمة زر المقطع المختار (#id button.on) — للتوافق مع الأصل؛ نماذج React تحفظ الاختيار في الحالة */
export const segV = (id) => { const b = document.querySelector('#' + id + ' button.on'); return b ? b.dataset.v : ''; };
export const dateTs = (v) => { const t = v ? new Date(v + 'T12:00:00').getTime() : Date.now(); return isFinite(t) ? t : Date.now(); };
export const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------- أفعال (تعديل الجلسة) ---------- */
/** حفظ صامت مؤجّل لحقول المسؤول/المؤشر (dashInput الأصلية): k = own | kpi */
const dashT = {};
export function dashInput(k, n, value) { const id = k + '_' + n; clearTimeout(dashT[id]); dashT[id] = setTimeout(() => patch({ dash: { [k]: { [n]: value } } }, { silent: true }), 500); }

export function setDtab(t) { setUI({ dtab: t }); try { window.scrollTo({ top: 0 }); } catch (e) { /* */ } }
export function markSeen() { const t = Date.now(); if (CODE) LS.set('bm3:seen:' + CODE, t); setUI({ seenAt: t }); }
export function axCardsGo(n) { dcf = { ax: +n, st: 'all', q: '' }; setDtab('cards'); }
export function copyDash() { copyText((APP_URL || '') + '#dash-' + CODE, 'نُسخ رابط لوحة المتابعة'); }

/** تسجيل متابعة: v = {ax, st, pct, kpi, note, next, by} */
export function saveCheck(v) {
  const id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); const by = String(v.by || '').trim();
  if (by) { ME.alias = by; LS.set('bm3:alias', by); }
  const f = { ax: v.ax, at: Date.now(), st: v.st, pct: +v.pct, kpi: String(v.kpi || '').trim(), note: String(v.note || '').trim(), next: String(v.next || '').trim(), by };
  patch({ follow: { [id]: f } }, { now: true }); notify('سُجّلت متابعة محور ' + stageOf(f.ax).name + '.'); SND.play('place'); return true;
}
export function pimpSet(k, v) { patch({ pimp: { [k]: v } }); logEv('market', `صنّف الاتجاه ${PEST.find((x) => x[0] === k)[2]}: ${IMP[v][0]}`, { ax: 1, verb: 'حدّث PESTLE' }); }
export function pestSave(k, text) {
  const v = String(text || '').trim(); const p = { fill: { '1_2': { 1: { [k]: v } } } }; if (v && !placed('1_2')) p.place = { '1_2': ['1'] };
  patch(p); logEv('market', `حدّث اتجاه ${PEST.find((x) => x[0] === k)[2]}: ${v}`, { ax: 1, verb: 'حدّث PESTLE' }); return true;
}
export function indSug() { const m = {}; SUG_IND.forEach((i) => { m[newId()] = { ...i, at: Date.now() }; }); patch({ mind: m }); logEv('market', 'أضاف مؤشرات السوق المقترحة', { ax: 1, verb: 'أضاف مؤشرات' }); }
export function indSave({ name, unit, good }) { const n = String(name || '').trim(); if (!n) { notify('اكتب اسم المؤشر.', 'err'); return false; } patch({ mind: { [newId()]: { name: n, unit: String(unit || '').trim(), good: good || 'up', at: Date.now() } } }); return true; }
export function indDel(id) { patch({ mind: { [id]: { del: true } } }); }
export function readSave({ ind, v, date, note }) {
  if (v === '' || v == null || !isFinite(+v)) { notify('اكتب قيمة رقمية.', 'err'); return false; }
  patch({ mread: { [newId()]: { ind, v: +v, at: dateTs(date), ts: Date.now(), note: String(note || '').trim(), by: whoName() } } }, { now: true });
  notify('سُجّلت القراءة.'); SND.play('place'); return true;
}
export function moveSave({ c, type, imp, risk, date, note }) {
  const r = +risk || 0; const m = { c, type: type || MOVE_T[0], imp: +imp || 2, at: dateTs(date), ts: Date.now(), note: String(note || '').trim(), by: whoName() }; if (r) m.risk = r;
  patch({ cmoves: { [newId()]: m } }, { now: true }); notify('سُجّل التحرّك وتحدّث مؤشر التهديد.'); SND.play(m.imp >= 3 ? 'conflict' : 'place'); return true;
}
export function compSave({ name, risk, strong, weak }) {
  const n = String(name || '').trim(); if (!n) { notify('اكتب اسم المنافس.', 'err'); return false; }
  patch({ comps: { [newId()]: { name: n, risk: risk || 'متوسطة', strong: String(strong || '').trim(), weak: String(weak || '').trim(), at: Date.now() } } });
  logEv('comp', `أضاف منافساً: ${n}`, { ax: 1, verb: 'أضاف منافساً' }); return true;
}
export function cadSet(d) { patch({ dash: { cad: +d } }); }
export function docstNext(n) { const c = (S.docst && S.docst[n]) || 0; patch({ docst: { [n]: (c + 1) % 3 } }); }
/** نقل نقطة على خريطة التموضع (bindPosMap الأصلية عند الإفلات) */
export function posSave(id, x, y) {
  patch({ pos: { [id]: { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } } }, { silent: true });
  logEv('comp', `نقل «${id === 'we' ? S.brand : compName(id)}» على خريطة التموضع`, { ax: 5, verb: 'حدّث خريطة التموضع' });
}
/** محاور خريطة التموضع من بطاقة 5_4 */
export function posAxes() { const v = fget('5_4', '1'); const sp = (t) => { const a = String(t || '').split(/←|->|→|-/).map((x) => x.trim()).filter(Boolean); return a.length >= 2 ? a : [a[0] || 'منخفض', 'مرتفع']; }; const [xl, xh] = sp(v.x || 'تقليدي ← عصري'), [yl, yh] = sp(v.y || 'سعر ← أثر'); return { xl, xh, yl, yh, we: v.we }; }

/* ---------- القراءة الذكية ---------- */
export function aiPrompt() {
  const dec = ALLQ.map((q) => `${qcode(q)} ${q.s.name}/${q.slot}: ${placed(q.id) ? ansSummary(q) : 'لم تُحسم'}${confOf(q.id) ? ' (تأكد ' + confOf(q.id) + '/5)' : ''}${doubtOn(q.id) ? ' [شك]' : ''}`).join('\n');
  const ch = feedItems().slice(0, 30).map((f) => `${fmtShort(f.at)} · ${f.verb}: ${f.t}`).join('\n');
  const inds = liveInds().map(([id, i]) => `${i.name} (${i.unit || ''}, الأفضل ${i.good === 'down' ? 'نزولاً' : 'صعوداً'}): ${indReadings(id).slice(-4).map((r) => r.v + '@' + fmtShort(r.at)).join(' ، ') || 'لا قراءات'}`).join('\n');
  const comps = compList().map((c) => `${c.name}: خطورة ${RISK_L[c.risk]}، قوة: ${c.strong || '-'}، ضعف: ${c.weak || '-'}، تحرّكات ٩٠ يوماً: ${c.moves.filter((m) => Date.now() - m.at < 90 * DAY).map((m) => m.type + ' — ' + (m.note || '')).join(' | ') || 'لا شيء'}`).join('\n');
  return `أنت مستشار استراتيجي لعلامة «${S.brand}» في السوق السعودي والخليجي. هذه بيانات لوحة متابعتها المستخرجة من لعبة «براند ماب» (٨ محاور و٣٥ قراراً).
${defLine() ? 'التعريف: ' + defLine() + '\n' : ''}
القرارات:
${dec}

آخر التغيّرات (الأحدث أولاً):
${ch || 'لا تغييرات'}

مؤشرات السوق:
${inds || 'لا مؤشرات'}

المنافسون:
${comps || 'لا منافسين مسجلين'}

المهمة: اقرأ التغيّر الأحدث أولاً ثم أثره على القرارات. كن محدداً ومرتبطاً بهذه البيانات فقط، ولا تخترع أرقاماً. اكتب بالعربية بجمل قصيرة مباشرة.
أعد JSON فقط بهذا الشكل:
{"headline":"جملة واحدة تلخص أهم ما تغيّر","summary":"فقرة من ٢-٣ جمل","signals":[{"t":"إشارة محددة","type":"opp|risk|watch"}],"actions":[{"t":"خطوة عملية","owner":"الدور المسؤول","when":"هذا الأسبوع|هذا الشهر|هذا الربع"}]}
حتى ٥ إشارات و٤ خطوات.`;
}
export function aiClean(r) {
  return {
    headline: String((r && r.headline) || '').slice(0, 240), summary: String((r && r.summary) || '').slice(0, 900),
    signals: (Array.isArray(r && r.signals) ? r.signals : []).slice(0, 6).map((s) => ({ t: String((s && s.t) || '').slice(0, 240), type: ['opp', 'risk', 'watch'].includes(s && s.type) ? s.type : 'watch' })),
    actions: (Array.isArray(r && r.actions) ? r.actions : []).slice(0, 5).map((a) => ({ t: String((a && a.t) || '').slice(0, 240), owner: String((a && a.owner) || '').slice(0, 60), when: String((a && a.when) || '').slice(0, 40) })),
  };
}
export async function aiRead() {
  if (!CAP.sample || ui.aiBusy || !S) return; setUI({ aiBusy: true });
  try {
    const r = await CAP.sample.json(aiPrompt(), { modelTier: 'default', feat: 'read' });
    patch({ ai: { at: Date.now(), by: whoName(), data: aiClean(r) } }, { now: true }); notify('وصلت القراءة الذكية.', 'gold');
  } catch (e) {
    const c = e && e.code; notify(c === 'not_granted' ? 'لم يُسمح باستخدام الذكاء الاصطناعي في هذا العرض.' : c === 'rate_limited' ? 'طلبات كثيرة. انتظر دقيقة ثم أعد المحاولة.' : 'تعذّرت القراءة الآن. أعد المحاولة بعد قليل.', 'err');
  } finally { setUI({ aiBusy: false }); }
}

/** نص مؤشر/مسؤول المحور الحالي */
export const axOwn = (n) => (S && S.dash && S.dash.own && S.dash.own[n]) || AXMETA[n].own;
export const axKpi = (n) => (S && S.dash && S.dash.kpi && S.dash.kpi[n]) || AXMETA[n].kpi;
