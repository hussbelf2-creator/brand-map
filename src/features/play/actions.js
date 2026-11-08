/* أفعال الطاولة (من ui.js الأصلي): التنقل بين البطاقات، المؤقت، الوضع على اللوحة، التعارضات، الإنهاء،
   وردود الفعل على تغيّر الجلسة (أصوات، إشعارات، تتبّع الطاولة، الخاتمة). لا عرض هنا: النوافذ في Modals.jsx و Drawers.jsx */
import { createElement as h } from 'react';
import {
  S, CODE, ME, RO, Q, ALLQ, N_Q, STAGES, CONFLICTS, AK, AR, DEF_TIMER, ui, setUI, patch, flush, onSync, SND,
  plist, placed, placedCount, fget, confOf, doubtOn, stageDone, deepFilled, deepMerge, clone, activeConflicts, resolved,
  ansTitle, ansSummary, newId, whoName, tmState, enforceCall,
} from '../../engine/engine.js';
import { boardFocus, boardSync, boardFinale } from './board.js';
import { openModal, closeModal, openDrawer, closeDrawer, toast } from '../../ui/overlays.jsx';
import { debounced } from '../../ui/util.js';
import { go } from '../../nav.js';
import { requireCompletion } from '../intake/IntakeOverlay.jsx';
import { ReviewDrawer, SoundDrawer, GuideDrawer } from './Drawers.jsx';
import { GoldPlaceModal, GoldUnplaceModal, ConflictModal, FinaleModal, FinishAskModal } from './Modals.jsx';

const durOf = () => (S && S.cfg && S.cfg.dur) || DEF_TIMER || 180;
const pl0 = (q) => (placed(q.id) ? ansSummary(q) : '');
const curQ = () => Q[ui.q] || ALLQ[0];

/* ---------- الكتابة في بطاقات التعبئة: حفظ صامت مؤجّل مع طبقة معلّقة محلية ---------- */
const PF = {}; // 'qid|k|path' → {code,qid,k,path,val}
const leafOf = (path, val) => (path.length > 1 ? { [path[0]]: { [path[1]]: val } } : { [path[0]]: val });
/** كتابة في حقل تعبئة (bindInput/lnCommit): القيمة تظهر فوراً عبر fval وتُحفظ صامتة بعد توقف الكتابة */
export function typeFill(qid, k, path, val) {
  if (RO || !S) return;
  const key = qid + '|' + k + '|' + path.join('.');
  PF[key] = { code: CODE, qid, k, path, val };
  debounced('fill:' + key, () => {
    const e = PF[key]; if (!e) return; delete PF[key];
    if (e.code === CODE) patch({ fill: { [qid]: { [k]: leafOf(path, e.val) } } }, { silent: true });
  }, 350);
}
/** قيمة بطاقة التعبئة كما يراها الكاتب الآن (المحفوظ + ما يُكتب) */
export function fval(qid, k) {
  const v = clone(fget(qid, k)) || {};
  Object.values(PF).forEach((e) => { if (e.qid === qid && e.k === k && e.code === CODE) deepMerge(v, leafOf(e.path, e.val)); });
  return v;
}
/** يحفظ كل كتابة معلّقة فوراً (قبل الوضع على اللوحة) */
export function flushTyping() {
  const es = Object.entries(PF); if (!es.length) return;
  const fill = {};
  es.forEach(([key, e]) => { if (e.code === CODE) deepMerge(fill, { [e.qid]: { [e.k]: leafOf(e.path, e.val) } }); delete PF[key]; debounced('fill:' + key, () => {}, 0); });
  if (Object.keys(fill).length) patch({ fill }, { silent: true });
}
/** ضغطة على خيار داخل بطاقة تعبئة (data-act="set") */
export function setFill(qid, k, path, val) { if (!S) return; patch({ fill: { [qid]: { [k]: leafOf(path, val) } } }); SND.play('select'); }
/** مقياس ١–٧ (data-act="scale") */
export function setScale(qid, k, i, n) { if (!S) return; const cur = fget(qid, k)[i]; patch({ fill: { [qid]: { [k]: { [i]: cur === n ? 0 : n } } } }); SND.play('select'); }

/* ---------- التنقل ---------- */
export function goQ(qid, { share = true } = {}) {
  if (!Q[qid]) return; const q = Q[qid]; const prevS = curQ().s.n;
  const p = { q: qid, guide: false };
  if (!ui.sel[qid]) p.sel = { ...ui.sel, [qid]: plist(qid).slice() };
  const earlier = STAGES.slice(0, q.s.n - 1).find((s) => !stageDone(s));
  if (earlier && !ui.warned[q.s.n] && q.s.n !== prevS) { p.warned = { ...ui.warned, [q.s.n]: 1 }; toast(`قاعدة الرحلة: محور «${earlier.name}» لم يكتمل بعد. من يختار ألوانه قبل جمهوره يلوّن لنفسه لا لعميله.`, ''); }
  setUI(p);
  if (share && S && !RO) { const sp = { cur: qid }; const t = S.tm || {}; if (S.cfg && S.cfg.auto && !placed(qid) && t.q !== qid) sp.tm = { q: qid, st: Date.now(), acc: 0, run: true, dur: durOf() }; patch(sp, { silent: true }); }
  SND.play('open'); boardFocus(qid);
  if (innerWidth <= 980) { const st = document.getElementById('stage3d'); st && st.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
export function nextOpen(from) { const i = ALLQ.findIndex((q) => q.id === from); for (let j = 1; j <= N_Q; j++) { const q = ALLQ[(i + j) % N_Q]; if (!placed(q.id)) return q.id; } return null; }
export function prevQ() { const i = ALLQ.findIndex((q) => q.id === ui.q); if (i > 0) goQ(ALLQ[i - 1].id); }
export function nextQ() { const i = ALLQ.findIndex((q) => q.id === ui.q); if (i < N_Q - 1) goQ(ALLQ[i + 1].id); }
/** زر المحور في شريط الرحلة: أول بطاقة غير موضوعة فيه */
export function goStage(n) { const s = STAGES[n - 1]; if (!s) return; const q = s.qs.find((x) => !placed(x.id)) || s.qs[0]; goQ(q.id); }
/** من قائمة إعادة النظر أو لوحة الاستلام */
export function jumpTo(qid) { closeDrawer(); if (ui.view !== 'play') go('play'); goQ(qid); }
export function setBoardMode(m) { setUI({ boardMode: m }); }
export function exitTable() { flush(); go('start'); }

/* ---------- المؤقت ---------- */
export function startTm(qid = ui.q) { if (!S) return; patch({ tm: { q: qid, st: Date.now(), acc: 0, run: true, dur: durOf() } }); }
export function tmToggle() { const t = tmState(); if (t.q !== ui.q) return startTm(ui.q); if (t.run) patch({ tm: { run: false, acc: t.el } }); else patch({ tm: { run: true, st: Date.now() } }); }
export function tmAdd() { patch({ tm: { dur: ((S.tm && S.tm.dur) || 180) + 30 } }); }
export function tmReset() { startTm(ui.q); }

/* ---------- الاختيار والتأكد ---------- */
export function selAnswer(k) {
  const q = curQ(); if (RO) return;
  let s = (ui.sel[q.id] || plist(q.id)).slice();
  if (s.includes(k)) s = s.filter((x) => x !== k);
  else { if (q.max === 1) s = [k]; else { if (s.length >= q.max) { toast(`الحد ${AR(q.max)} بطاقات لهذا السؤال.`, 'err'); return; } s.push(k); } }
  setUI({ sel: { ...ui.sel, [q.id]: s } });
  if (ME.id) patch({ votes: { [q.id]: { [ME.id]: s } } }, { silent: true });
  SND.play('select');
}
export function setConf(n) { patch({ conf: { [ui.q]: confOf(ui.q) === n ? 0 : n } }); }
export function toggleDoubt() { patch({ doubt: { [ui.q]: !doubtOn(ui.q) } }); }

/* ---------- الوضع على اللوحة ---------- */
export function keysForPlace(q) {
  if (q.type === 'opt') { const sel = (ui.sel[q.id] || []).slice(); return sel.filter((k) => { const a = AK(q, k); return a && (!a.spare || deepFilled(fget(q.id, k).text)); }); }
  if (q.ans.some((a) => a.f === 'prod')) return q.ans.filter((a) => fget(q.id, a.k).on).map((a) => a.k).slice(0, q.max);
  return q.ans.filter((a) => deepFilled(fget(q.id, a.k))).map((a) => a.k);
}
export function doPlace(confirmed = false) {
  const q = curQ(); if (RO || !S) return;
  flushTyping();
  const keys = keysForPlace(q);
  if (!keys.length) { toast(q.type === 'opt' ? 'اختر بطاقة إجابة أولاً.' : q.ans.some((a) => a.f === 'prod') ? 'أضف فئة واحدة على الأقل لتشكيلتكم.' : 'اكتب الإجابة أولاً ثم ضعها على اللوحة.', 'err'); return; }
  const sp = q.ans.find((a) => a.spare); if (sp && (ui.sel[q.id] || []).includes(sp.k) && !deepFilled(fget(q.id, sp.k).text)) { toast('اكتب الإجابة الخاصة أولاً.', 'err'); return; }
  if (q.gold && !confirmed) { openModal(h(GoldPlaceModal, { q, keys })); return; }
  const t = tmState(); const p = { place: { [q.id]: keys }, cur: q.id };
  if (t.q === q.id && t.el > 0) p.times = { [q.id]: { s: Math.round(t.el / 1000), d: Math.round(t.dur / 1000) } };
  if (t.q === q.id) p.tm = { run: false, acc: t.el };
  const from = pl0(q), to = keys.map((k) => ansTitle(q, k) || (AK(q, k) || {}).t || k).join('، ');
  if (from !== to) p.hist = { [q.id]: { [newId()]: { at: Date.now(), by: whoName(), from, to } } };
  setUI({ sel: { ...ui.sel, [q.id]: keys.slice() } }); patch(p);
  if (S.cfg && S.cfg.adv !== false) { const nx = nextOpen(q.id); if (nx && placedCount() < N_Q) setTimeout(() => { if (ui.view === 'play' && ui.q === q.id) goQ(nx); }, 1700); }
}
export function unplace() {
  const q = curQ(); if (!S) return;
  if (q.gold) { openModal(h(GoldUnplaceModal, { q })); return; }
  patch({ place: { [q.id]: [] }, times: { [q.id]: null }, hist: { [q.id]: { [newId()]: { at: Date.now(), by: whoName(), from: pl0(q), to: 'أُعيدت لليد' } } } });
}
/** قلب البطاقة الذهبية بعد تأكيد الإجماع */
export function unplaceGold() {
  closeModal(); const q = curQ();
  patch({ place: { [q.id]: [] }, times: { [q.id]: null }, hist: { [q.id]: { [newId()]: { at: Date.now(), by: whoName(), from: pl0(q), to: 'أُعيدت لليد بالإجماع' } } } });
}

/* ---------- التعارضات ---------- */
export function conflictsOfQ(qid) { return activeConflicts().filter((c) => c.a[0] === qid || c.b.some((b) => b[0] === qid)); }
export function openConflict(c) { if (c) openModal(h(ConflictModal, { c })); }
export function openConflictById(id) { openConflict(CONFLICTS.find((x) => x.id === id)); }
/** اختيار مخرج من مخارج كرت التعارض الثلاثة (exit3) */
export function resolveExit(cid, i, close = false) {
  patch({ res: { [cid]: S.res && S.res[cid] === i ? -1 : i } });
  if (close) closeModal();
  toast('حُسم التعارض. يُدوَّن المخرج في قسم المخاطر بالوثيقة.');
}

/* ---------- الكلمة على الطاولة ---------- */
export function giveFloor(u = '', n = '') {
  if (!S || S.owner !== ME.id) return; const cur = S.floor && S.floor.uid;
  patch({ floor: { uid: cur === u ? '' : u, name: n || '', at: Date.now() } });
  if (u && cur !== u) SND.play('select');
}

/* ---------- إعدادات الطاولة (من قائمة إعادة النظر) ---------- */
export const followOn = () => ui.follow !== false;
export function toggleFollow() { setUI({ follow: !followOn() }); }
export function toggleAdv() { patch({ cfg: { adv: !(S.cfg && S.cfg.adv !== false) } }); }
export function toggleCall() { patch({ cfg: { call: !(S.cfg && S.cfg.call) } }); enforceCall(); }

/* ---------- الدروج والنوافذ ---------- */
export function openReview() { if (!S) return; openDrawer(h(ReviewDrawer)); }
export function openSound() { openDrawer(h(SoundDrawer)); }
export function openGuide() { openDrawer(h(GuideDrawer)); }
export function finishAsk() { openModal(h(FinishAskModal)); }
export function openFinale() { if (!S) return; SND.play('finale'); boardFinale(); openModal(h(FinaleModal)); }

/** ينهي الجلسة وينشئ لوحة المتابعة. قبلها يتحقق من اكتمال بطاقة المشروع والحضور الرقمي (إلا مع force) */
export function finishSession(force = false) {
  if (!S) return;
  if (!force && !requireCompletion(() => finishSession(true))) return; // يفتح بوابة ملف المشروع ويكمل بعدها
  const p = { done: true, doneAt: S.doneAt || Date.now() }; if (!S.dash || !S.dash.cad) p.dash = { cad: 30 };
  patch(p, { now: true }); closeModal(); closeDrawer(); go('dash');
  toast('أُنشئت لوحة المتابعة. شارك رمز الجلسة مع العميل ليعود إليها في أي وقت.', 'gold');
}

/* ---------- ردود الفعل على تغيّر الجلسة (محلياً أو من الفريق) ---------- */
function hasIn(st, ref, key) { const p = (st.place && st.place[ref]) || []; if (ref === '6_1') return p.includes('1') && (((st.fill || {})['6_1'] || {})['1'] || {}).type === key; return p.includes(key); }
const activeIn = (st, c) => hasIn(st, ...c.a) && c.b.some((b) => hasIn(st, ...b));
let wired = false;
function wire() {
  if (wired) return; wired = true;
  onSync((prev, src) => {
    if (!S) return;
    const play = ui.view === 'play';
    if (play) {
      boardSync(S, { animate: true });
      if (src === 'remote' && followOn() && S.cur && S.cur !== ui.q && Q[S.cur]) { setUI({ q: S.cur, sel: { ...ui.sel, [S.cur]: plist(S.cur).slice() } }); boardFocus(S.cur); }
    }
    if (prev && prev.cfg && S.cfg && !prev.cfg.call && S.cfg.call) enforceCall();
    if (!prev) return;
    const was = CONFLICTS.filter((c) => activeIn(prev, c));
    const now = activeConflicts().filter((c) => !was.includes(c) && !resolved(c));
    if (now.length && play) { SND.play('conflict'); openConflict(now[0]); }
    STAGES.forEach((s) => { const d0 = s.qs.every((q) => ((prev.place || {})[q.id] || []).length), d1 = stageDone(s); if (!d0 && d1 && play) toast(`اكتمل محور «${s.name}» — عادت بتلته إلى الزهرة.`, 'gold'); });
    const n0 = ALLQ.filter((q) => ((prev.place || {})[q.id] || []).length).length;
    if (n0 < N_Q && placedCount() === N_Q && play) setTimeout(openFinale, 1900);
  });
}
wire();
