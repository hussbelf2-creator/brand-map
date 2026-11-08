/* أوامر لوحة الإدارة (admin.js / admin2.js / admin3.js): الحفظ والحذف والتصدير والتحرير */
import {
  ADM_SECS, AI_FEATS, ALLQ, CARDMAP, CMS, DAY, DOCSECS, FEATS, ICONS, PERIODS, PRISTINE, Q, ROLE_DEF, S, SPECIAL0, STAGES, TRACKS, ui,
  aDel, aGet, aSet, afterOpen, applyFeatClasses, applyLessons, applySettingsLive, audit, bump, clone, cmsA, cmsL, cmsPut, cmsS, fmtDate, fmtShort,
  gClone, newId, openSession, planById, qcode, subLive, whoName,
} from '../../engine/engine.js';
import { toast, closeModal, closeDrawer } from '../../ui/overlays.jsx';
import { go } from '../../nav.js';
import { saveFile } from '../docs/export.js';
import { ADM, admSet, need, reload } from './store.js';
import { gameSaved } from './parts.jsx';

const err = (m = 'تعذّر الحفظ.') => toast(m, 'err');

/* ---------- التنقل ---------- */
/** يفتح قسماً في اللوحة (admSec) */
export function pickSec(k) {
  admSet({ sec: k, eq: null });
  if (ui.view !== 'admin') go('admin');
  window.scrollTo(0, 0);
}
export const openAdmin = pickSec;
/** يفتح جلسة من القائمة (openRecent) */
export async function openRecent(code) {
  if (await openSession(code)) { afterOpen(); closeDrawer(); go(S.done ? 'dash' : 'play'); }
}
/** عدد البطاقات الموضوعة في جلسة */
export const placedN = (s) => ALLQ.filter((q) => (s.place || {})[q.id] && s.place[q.id].length).length;

/* ---------- العملاء والاشتراكات ---------- */
export async function cuSave(uid, ext, v = {}) {
  const D = ADM.data; const old = (D.subs || []).find((x) => x.id === uid) || {};
  const plan = ext ? old.plan : v.plan;
  if (!plan) { await aDel('subs', uid); ADM.data.subs = (D.subs || []).filter((x) => x.id !== uid); await audit('إلغاء اشتراك', uid); toast('أُزيل الاشتراك.'); reload(); return; }
  let end = ext ? Math.max(old.end || Date.now(), Date.now()) + 30 * DAY : (v.end ? new Date(v.end + 'T23:59:00').getTime() : 0);
  if (!ext && !end) { const p = planById(plan); const d = p && PERIODS[p.period] ? PERIODS[p.period][1] : 30; end = d ? Date.now() + d * DAY : 0; }
  const doc = { ...old, plan, st: ext ? (old.st || 'active') : v.st, start: old.start || Date.now(), end, amount: ext ? old.amount || 0 : +v.amt || 0, upd: Date.now(), by: whoName() };
  delete doc.id;
  try {
    await aSet('subs', uid, doc);
    await audit(ext ? 'تمديد اشتراك' : 'تعديل اشتراك', uid, (planById(plan) || {}).name + ' حتى ' + fmtDate(end));
    toast('حُفظ الاشتراك.'); reload();
  } catch (e) { err(); }
}
export async function cuBlock(u, on) {
  try {
    if (on) await aSet('blocked', u, { at: Date.now(), by: whoName() }); else await aDel('blocked', u);
    await audit(on ? 'إيقاف حساب' : 'إلغاء إيقاف', u); toast('تم.'); reload();
  } catch (x) { err('تعذّر التحديث.'); }
}
export async function cuNote(u, t) {
  try { await aSet('cnotes', u, { t: String(t || '').trim(), at: Date.now(), by: whoName() }); toast('حُفظت الملاحظة.'); } catch (x) { err(); }
}
/** تصدير العملاء CSV (admExport) */
export async function exportClients() {
  const D = await need('facilitators', 'subs', 'sessions');
  const rows = [['الاسم', 'البريد', 'الجوال', 'الجهة', 'الدور', 'الباقة', 'الحالة', 'ينتهي', 'الجلسات', 'التسجيل']];
  D.facilitators.forEach((f) => { const s = D.subs.find((x) => x.id === f.id); rows.push([f.name, f.email, f.phone, f.org, f.role, s ? ((planById(s.plan) || {}).name || '') : '', s ? (subLive(s) ? 'فعّال' : 'منتهٍ') : '', s && s.end ? fmtShort(s.end) : '', D.sessions.filter((x) => x.owner === f.id).length, fmtShort(f.at)]); });
  const csv = '﻿' + rows.map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  await saveFile('brand-map-clients.csv', csv, 'text/csv');
  await audit('تصدير العملاء', 'csv');
}

/* ---------- الباقات والطلبات ---------- */
export async function planSave(id, v) {
  const name = String(v.name || '').trim(); if (!name) { toast('اكتب اسم الباقة.', 'err'); return; }
  const feat = { sessions: +v.sessions || 0 }; FEATS.forEach(([k]) => { feat[k] = !!v.feat[k]; });
  const doc = { name, price: +v.price || 0, period: v.period, desc: String(v.desc || '').trim(), ord: +v.ord || 0, feat, active: !!v.active, hl: !!v.hl, upd: Date.now() };
  id = id || 'p_' + newId();
  try { await aSet('plans', id, doc); await audit('حفظ باقة', name); closeModal(); toast('حُفظت الباقة.'); reload(); } catch (e) { err(); }
}
export async function planDel(id) { await aDel('plans', id); await audit('حذف باقة', id); closeModal(); reload(); }
export async function reqDecide(uid, ok, amt) {
  const r = (ADM.data.subreq || []).find((x) => x.id === uid); if (!r) return;
  try {
    if (ok) {
      const p = planById(r.plan); const d = p && PERIODS[p.period] ? PERIODS[p.period][1] : 30;
      await aSet('subs', uid, { plan: r.plan, st: 'active', start: Date.now(), end: d ? Date.now() + d * DAY : 0, amount: +amt || 0, coupon: r.coupon || '', upd: Date.now(), by: whoName() });
      if (r.coupon) { const c = await aGet('coupons', r.coupon); if (c) await aSet('coupons', r.coupon, { ...c, used: (c.used || 0) + 1 }); }
    }
    const nr = { ...r, st: ok ? 'approved' : 'rejected', dec: Date.now(), by: whoName() }; delete nr.id;
    await aSet('subreq', uid, nr);
    await audit(ok ? 'تفعيل اشتراك' : 'رفض طلب اشتراك', r.name, (planById(r.plan) || {}).name);
    toast(ok ? 'فُعّل الاشتراك.' : 'رُفض الطلب.'); reload();
  } catch (e) { err('تعذّر التحديث.'); }
}

/* ---------- أكواد الخصم ---------- */
export async function cpSave(v) {
  const id = String(v.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ''); if (!id) { toast('اكتب الكود بحروف إنجليزية وأرقام.', 'err'); return; }
  const old = (ADM.data.coupons || []).find((c) => c.id === id) || {};
  const doc = { type: v.type, val: +v.val || 0, max: +v.max || 0, exp: v.exp ? new Date(v.exp + 'T23:59:00').getTime() : 0, note: String(v.note || '').trim(), plans: v.plans || [], active: !!v.active, used: old.used || 0, at: old.at || Date.now() };
  if (doc.type === 'pct' && (doc.val <= 0 || doc.val > 100)) { toast('النسبة بين ١ و١٠٠.', 'err'); return; }
  try { await aSet('coupons', id, doc); await audit('حفظ كود خصم', id); closeModal(); toast('حُفظ الكود.'); reload(); } catch (e) { err(); }
}
export async function cpDel(id) { await aDel('coupons', id); await audit('حذف كود خصم', id); closeModal(); reload(); }

/* ---------- الفريق ---------- */
export async function addStaff(u, r, secs) {
  if (!u) return;
  const f = (ADM.data.facilitators || []).find((x) => x.id === u) || {};
  try {
    await aSet('staff', u, { role: r, secs: r === 'custom' ? ADM_SECS.map((x) => x[0]).filter((k) => secs.includes(k)) : [], name: f.name || '', at: Date.now() });
    await audit('تعيين دور', f.name || u, ROLE_DEF[r][0]); toast('عُيّن الدور.'); reload();
  } catch (x) { err('تعذّر الحفظ. التعيين للمالك فقط.'); }
}
export async function delStaff(u) { await aDel('staff', u); await audit('إزالة دور', u); reload(); }

/* ---------- الإعدادات والنسخ الاحتياطي ---------- */
export async function setSave(v) {
  const s = JSON.parse(JSON.stringify(cmsS()));
  s.flags = { ...(s.flags || {}), register: !!v.register, consult: !!v.consult, enforce: !!v.enforce };
  s.biz = { currency: String(v.currency || '').trim() || 'ر.س', vat: +v.vat || 0, freePlan: v.freePlan, pay: String(v.pay || '').trim() };
  s.design = { ...(s.design || {}), timer: +v.timer || 180, review: +v.review || 2 };
  s.contact = { wa: String(v.wa || '').trim(), email: String(v.email || '').trim(), hours: String(v.hours || '').trim() };
  try { await cmsPut('settings', s); await audit('حفظ الإعدادات', 'settings'); applySettingsLive(); toast('حُفظت الإعدادات وطُبّقت.', 'gold'); admSet(); } catch (e) { err('تعذّر الحفظ. تأكد أنك محرّر.'); }
}
export async function bkExport() {
  const D = await need('plans', 'coupons');
  const data = { app: 'brand-map', at: new Date().toISOString(), cms: CMS, plans: D.plans, coupons: D.coupons };
  await saveFile('brand-map-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(data, null, 1), 'application/json');
  await audit('تنزيل نسخة احتياطية', 'backup');
}
export async function bkImport(file) {
  try {
    const d = JSON.parse(await file.text()); if (d.app !== 'brand-map' || !d.cms) throw 0;
    for (const part of ['game', 'lessons', 'settings', 'agents']) if (d.cms[part]) await cmsPut(part, { ...d.cms[part] });
    for (const p of d.plans || []) { const { id, ...x } = p; await aSet('plans', id, x); }
    for (const c of d.coupons || []) { const { id, ...x } = c; await aSet('coupons', id, x); }
    await audit('استعادة نسخة احتياطية', file.name);
    toast('استُعيدت النسخة. أعد تحميل الأداة لتطبيق محتوى اللعبة.', 'gold'); reload();
  } catch (e) { toast('الملف غير صالح.', 'err'); }
}
/** إعادة محتوى اللعبة للأصل (cmsResetOk) */
export async function cmsReset() {
  try { await cmsPut('game', {}); closeModal(); gameSaved('إعادة المحتوى للأصل'); } catch (x) { toast('تعذّر.', 'err'); }
}

/* ---------- المحاور ---------- */
export const AX_KEYS = ['name', 'ask', 'min', 'c', 'ci', 'intro'];
/** vals: {[n]: {name, ask, min, c, ci, intro}} */
export async function axSave(vals) {
  const G = gClone(); G.stages = {};
  STAGES.forEach((s, i) => {
    const P = PRISTINE.stages[i], o = {}, X = vals[s.n] || {};
    AX_KEYS.forEach((k) => {
      let v = String(X[k] ?? '').trim(); if (k === 'min') v = +v || P.min;
      const pv = String(P[k] ?? '');
      const diff = k === 'c' || k === 'ci' ? String(v).toLowerCase() !== pv.toLowerCase() : String(v) !== pv;
      if (diff) o[k] = v;
    });
    if (Object.keys(o).length) G.stages[s.n] = o;
  });
  try { await cmsPut('game', G); gameSaved('المحاور'); } catch (e) { err('تعذّر الحفظ. تأكد أنك محرّر.'); }
}
export async function axReset(n) {
  const G = gClone(); if (G.stages) delete G.stages[n];
  await cmsPut('game', G); gameSaved('استعادة المحور ' + n);
}

/* ---------- البطاقات ---------- */
export const ICON_KEYS = () => Object.keys(ICONS).sort();
export function cardData(q) {
  const P = {};
  ['slot', 't', 'tag', 'sub', 'note', 'head', 'ic', 'type', 'gold', 'max', 'ans', 'g'].forEach((k) => { if (q[k] !== undefined) P[k] = JSON.parse(JSON.stringify(q[k])); });
  const d = {};
  ['slot', 't', 'tag', 'sub', 'note', 'head', 'ic', 'type', 'gold', 'max'].forEach((k) => { d[k] = P[k] === undefined ? '' : P[k]; });
  d.g = { why: (P.g || {}).why || '', trap: (P.g || {}).trap || '' }; d.ans = P.ans || []; d.gold = !!P.gold; d.max = P.max || 1;
  return d;
}
export const optRow = (k) => ({ k, t: '', d: '', ic: 'circle-help', x: '' });
export const fillRow = (k) => ({ k, f: 'lines', head: '', prompt: '', rows: 6 });
/** يفتح محرّر البطاقة: qid لبطاقة قائمة، أو null مع رقم المحور لبطاقة جديدة */
export function startEdit(qid, n) {
  let eq;
  if (qid) {
    const q = Q[qid]; const r = CARDMAP.find((x) => x.q === qid) || {}; const a = (cmsA().cards || {})[qid] || {};
    eq = { id: qid, n: q.s.n, no: q.no, isNew: !!q.isNew, d: cardData(q), m: { out: r.out || '', use: r.use || '', lead: r.lead || '', decide: r.decide || '', recv: r.recv || [], secs: r.secs || [] }, ag: { off: !!a.off, extra: a.extra || '' } };
  } else {
    const s = STAGES[n - 1]; const no = Math.max(0, ...[...s.qs, ...(s.hiddenQs || [])].map((q) => q.no)) + 1;
    eq = { id: n + '_' + no, n, no, isNew: true, fresh: true, d: { slot: '', t: '', tag: '', sub: '', note: '', head: '', ic: 'square-plus', type: 'opt', gold: false, max: 1, g: { why: '', trap: '' }, ans: [optRow('1'), optRow('2')] }, m: { out: '', use: '', lead: 'قائد الجلسة', decide: 'الطاولة', recv: [], secs: [] }, ag: { off: false, extra: '' } };
  }
  admSet({ eq, sec: 'cards' }); window.scrollTo(0, 0);
}
/** كائن سؤال مؤقت للمعاينة */
export function eqPreviewQ(E) {
  const s = STAGES[E.n - 1];
  return { ...E.d, t: E.d.t || E.d.slot || 'عنوان البطاقة', slot: E.d.slot || 'بطاقة', id: E.id, no: E.no, s };
}
export async function cardSave() {
  if (!ADM.eq) return;
  const E = clone(ADM.eq); const d = E.d;
  d.slot = String(d.slot || '').trim(); if (!d.slot) { toast('اكتب الاسم المختصر للبطاقة.', 'err'); return; }
  if (d.type === 'opt' && d.ans.filter((a) => !a.spare && String(a.t || '').trim()).length < 2) { toast('بطاقة الاختيار تحتاج إجابتين على الأقل.', 'err'); return; }
  d.ans = d.ans.filter((a) => a.spare || (a.f && a.f !== 'lines') || String(a.t || a.head || '').trim());
  d.ans.forEach((a) => { if (a.f === 'lines' && a.rows !== undefined) a.rows = +a.rows || 6; });
  E.m.recv = Object.keys(TRACKS).filter((k) => E.m.recv.includes(k));
  E.m.secs = DOCSECS.map((x, i) => i + 1).filter((i) => E.m.secs.includes(i));
  const out = { slot: d.slot, t: String(d.t || '').trim() || d.slot, type: d.type, ic: d.ic, gold: !!d.gold, max: +d.max || 1, ans: d.ans, g: { why: String(d.g.why || '').trim(), trap: String(d.g.trap || '').trim() } };
  ['tag', 'sub', 'note', 'head'].forEach((k) => { if (String(d[k] || '').trim()) out[k] = String(d[k]).trim(); else if (!E.isNew) out[k] = ''; });
  if (!out.head && out.sub) out.head = out.sub;
  const G = gClone(); G.cards = G.cards || {}; G.newCards = G.newCards || {}; G.map = G.map || {};
  if (E.isNew) G.newCards[E.id] = { ...(G.newCards[E.id] || {}), ...out, n: E.n, no: E.no };
  else G.cards[E.id] = { ...out, hidden: !!((G.cards[E.id] || {}).hidden) };
  G.map[E.id] = { card: 'Q' + E.no + ' ' + d.slot, ...E.m, recvTxt: E.m.recv.map((k) => (TRACKS[k] || {}).n).filter(Boolean).join('، ') };
  const A = JSON.parse(JSON.stringify(cmsA())); A.cards = A.cards || {};
  const ag = { off: !!E.ag.off, extra: String(E.ag.extra || '').trim() }; const prev = A.cards[E.id] || {};
  try {
    await cmsPut('game', G);
    if (!!prev.off !== ag.off || (prev.extra || '') !== ag.extra) { A.cards[E.id] = ag; await cmsPut('agents', A); }
    E.fresh = false;
    if (ADM.eq && ADM.eq.id === E.id) admSet({ eq: E });
    gameSaved('البطاقة Q' + E.n + '.' + E.no + ' «' + d.slot + '»');
  } catch (e) { err('تعذّر الحفظ. تأكد أنك محرّر.'); }
}
export async function cardHide(qid, on) {
  const G = gClone(); const q = Q[qid];
  if (q && q.isNew) { G.newCards = G.newCards || {}; G.newCards[qid] = { ...G.newCards[qid], hidden: !!on }; } else { G.cards = G.cards || {}; G.cards[qid] = { ...(G.cards[qid] || {}), hidden: !!on }; }
  try { await cmsPut('game', G); if (q) q.hidden = !!on; gameSaved((on ? 'إخفاء' : 'إظهار') + ' البطاقة ' + (q ? qcode(q) : qid)); } catch (e) { err(); }
}
export async function cardReset(qid) {
  const G = gClone(); if (G.cards) delete G.cards[qid]; if (G.map) delete G.map[qid];
  await cmsPut('game', G); admSet({ eq: null }); closeModal(); gameSaved('استعادة البطاقة');
}
export async function cardDel(qid) {
  const G = gClone(); if (G.newCards) delete G.newCards[qid]; if (G.map) delete G.map[qid];
  await cmsPut('game', G); admSet({ eq: null }); closeModal(); gameSaved('حذف بطاقة');
}

/* ---------- المحتوى والدروس ---------- */
const lines = (t) => String(t || '').split('\n').map((s) => s.trim()).filter(Boolean);
/** k: lessons | conf | landing | ann ، vals: قيم النموذج */
export async function ctSave(k, vals) {
  try {
    if (k === 'conf') {
      const G = gClone(); G.conflicts = {};
      PRISTINE.conflicts.forEach((c) => {
        const o = {}; const X = vals[c.id] || {};
        if (!X.on) o.off = true;
        const t = String(X.t || '').trim(), w = String(X.w || '').trim(), x = lines(X.x);
        if (t && t !== c.title) o.title = t; if (w && w !== c.why) o.why = w; if (x.length && x.join('|') !== c.exits.join('|')) o.exits = x;
        if (Object.keys(o).length) G.conflicts[c.id] = o;
      });
      await cmsPut('game', G); gameSaved('كروت التعارض'); return;
    }
    const L = JSON.parse(JSON.stringify(cmsL()));
    if (k === 'lessons') {
      L.lessons = {};
      SPECIAL0.forEach((x) => {
        const o = {}; const X = vals[x.id] || {};
        const t = String(X.t || '').trim(), b = String(X.b || '').trim(), u = lines(X.u);
        if (t && t !== x.t) o.t = t; if (b && b !== x.body) o.body = b; if (u.length && u.join('|') !== (x.use || []).join('|')) o.use = u;
        if (Object.keys(o).length) L.lessons[x.id] = o;
      });
    }
    if (k === 'landing') L.landing = { eyebrow: String(vals.eyebrow || '').trim(), a: String(vals.a || '').trim(), b: String(vals.b || '').trim(), lead: String(vals.lead || '').trim() };
    if (k === 'ann') L.announce = { on: !!vals.on, text: String(vals.text || '').trim(), btn: String(vals.btn || '').trim(), to: vals.to, kind: vals.kind, v: Date.now() };
    await cmsPut('lessons', L);
    await audit('تعديل المحتوى', { lessons: 'الدروس', landing: 'الصفحة الرئيسية', ann: 'شريط الإعلان' }[k]);
    applyLessons(); bump();
    toast('حُفظ وطُبّق فوراً.', 'gold');
  } catch (e) { err('تعذّر الحفظ. تأكد أنك محرّر.'); }
}
export async function lsReset(id) {
  const L = JSON.parse(JSON.stringify(cmsL())); if (L.lessons) delete L.lessons[id];
  await cmsPut('lessons', L); applyLessons(); bump(); toast('استُعيد الدرس.');
}

/* ---------- وكلاء الذكاء الاصطناعي ---------- */
export async function aiSave(v) {
  const A = JSON.parse(JSON.stringify(cmsA())); A.global = { tier: v.tier, extra: String(v.extra || '').trim() }; A.on = {}; A.feat = A.feat || {};
  AI_FEATS.forEach(([k]) => { const f = v.feat[k] || {}; A.on[k] = !!f.on; A.feat[k] = { ...(A.feat[k] || {}), tier: f.tier || '', extra: String(f.extra || '').trim() }; });
  A.feat.chat = A.feat.chat || {};
  A.feat.chat.welcome = String(v.welcome || '').trim(); A.feat.chat.starters = lines(v.starters).slice(0, 6);
  A.cards = A.cards || {};
  ALLQ.forEach((q) => { const c = v.cards[q.id] || { on: true, x: '' }; const x = String(c.x || '').trim(); if (!c.on || x) A.cards[q.id] = { off: !c.on, extra: x }; else delete A.cards[q.id]; });
  try { await cmsPut('agents', A); await audit('إعدادات الذكاء الاصطناعي', 'agents'); applyFeatClasses(); bump(); toast('حُفظت إعدادات الوكلاء وطُبّقت.', 'gold'); } catch (e) { err('تعذّر الحفظ. تأكد أنك محرّر.'); }
}
