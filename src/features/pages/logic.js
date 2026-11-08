/* الصفحات النهائية · المتابعة المتخصصة · مشاريعي — منطق بلا عرض (من pages.js الأصلي)
   الدوال التي تقرأ الجلسة تقبل وثيقة اختيارية D (الافتراضي الجلسة الحالية S)،
   حتى تحسب projMetrics مقاييس مشروع آخر دون تبديل S في المحرّك. */
import {
  S, CODE, LS, LOCAL, CAP, ME, Q, ALLQ, STAGES, DAY, CARDMAP, DOCSECS, DOCST, TRACKS, TST,
  AR, fmtDate, fmtShort, patch, logEv, whoName, newId, notify, setUI, SND, openSession, afterOpen,
} from '../../engine/engine.js';
import { docModel, docHTML, buildDocx, saveFile } from '../docs/export.js';
import { STS } from '../dashboard/logic.js';
import { go } from '../../nav.js';

/* ---------- مساعدات مقيّدة بوثيقة (بدائل placed/confOf/doubtOn/lastChange للوثيقة D) ---------- */
const plIn = (D, qid) => (D && D.place && D.place[qid]) || [];
export const placedIn = (D, qid) => plIn(D, qid).length > 0;
const confIn = (D, qid) => (D && D.conf && D.conf[qid]) || 0;
const doubtIn = (D, qid) => !!(D && D.doubt && D.doubt[qid]);
export const lastChangeIn = (D, qid) => { const h = Object.values(((D && D.hist) || {})[qid] || {}).filter((e) => e && e.at).sort((a, b) => b.at - a.at); return h[0] || null; };
export const daysTo = (t) => Math.round((t - Date.now()) / DAY);
export const dateTs = (v) => { const t = v ? new Date(v + 'T12:00:00').getTime() : Date.now(); return isFinite(t) ? t : Date.now(); };

/* ---------- الصفحات والمهام ---------- */
export const pageFeeds = (n) => CARDMAP.filter((r) => r.secs.includes(n)).map((r) => r.q).filter((q) => Q[q]);

export function pageState(n, D = S) {
  D = D || {};
  const p = (D.pages || {})[n] || {}; const st = p.st != null ? p.st : ((D.docst || {})[n] || 0); const feeds = pageFeeds(n);
  const changedAfter = st === 2 && p.at ? feeds.filter((q) => { const lc = lastChangeIn(D, q); return lc && lc.at > p.at; }) : [];
  const weak = feeds.filter((q) => placedIn(D, q) && ((confIn(D, q) && confIn(D, q) <= 2) || doubtIn(D, q)));
  return { ...p, st, feeds, changedAfter, weak, placedN: feeds.filter((q) => placedIn(D, q)).length, owner: p.owner || '' };
}

export function allTasks(D = S) {
  if (!D) return []; const out = []; const base = D.doneAt || D.created || Date.now();
  CARDMAP.forEach((r) => {
    const q = Q[r.q]; if (!q) return;
    r.recv.forEach((tk) => {
      const id = r.q + '-' + tk, s = (D.tasks || {})[id] || {}, lc = lastChangeIn(D, r.q), st = s.st || 'todo'; const due = s.due || (base + TRACKS[tk].dd * DAY);
      out.push({
        id, q: r.q, qq: q, track: tk, t: `${TRACKS[tk].verb}: ${q.slot}`, use: r.use, out: r.out, secs: r.secs, st, who: s.who || ((D.tracks || {})[tk] || {}).who || '', due, note: s.note || '', upd: s.upd || 0, by: s.by || '',
        dueSet: !!s.due, ready: placedIn(D, r.q), stale: st === 'done' && !!lc && !!s.upd && lc.at > s.upd, overdue: st !== 'done' && !!s.due && due < Date.now(),
      });
    });
  });
  return out;
}

export function taskStats(ts) { const r = ts.filter((t) => t.ready); return { all: r.length, done: r.filter((t) => t.st === 'done').length, doing: r.filter((t) => t.st === 'doing').length, blocked: r.filter((t) => t.st === 'blocked').length, overdue: r.filter((t) => t.overdue).length, stale: r.filter((t) => t.stale).length }; }

export const pagesApproved = (D = S) => DOCSECS.filter((d) => { const s = pageState(d.n, D); return s.st === 2 && !s.changedAfter.length; }).length;

export const pageNotes = (n, D = S) => Object.values((D && D.pnotes) || {}).filter((x) => x && +x.sec === n && x.at).sort((a, b) => b.at - a.at);

/* ---------- نموذج الصفحة (شريحة من الوثيقة) ---------- */
export function pageBlocks(n) { const B = docModel(); const idx = []; B.forEach((b, i) => { if (b.h === 1) idx.push(i); }); const a = idx[n - 1]; if (a == null) return []; const e = idx[n] != null ? idx[n] : B.length; return B.slice(a, e); }

export function pageDocModel(n) {
  const d = DOCSECS[n - 1], ps = pageState(n);
  const B = [{ title: `${S.brand} — ${d.t}` }, { p: `الصفحة ${AR(n)} من ١١ في وثيقة براند ماب · الحالة: ${DOCST[ps.st]}${ps.st === 2 && ps.by ? ' · اعتمدها ' + ps.by + ' في ' + fmtDate(ps.at) : ''} · ${fmtDate(Date.now())}`, muted: true }, { p: d.what, b: true }];
  B.push(...pageBlocks(n).slice(1).filter((b) => b.p !== d.what));
  const ts = allTasks().filter((t) => t.secs.includes(n) && t.ready);
  if (ts.length) { B.push({ h: 2, t: 'المتابعة المتخصصة' }); B.push({ tb: ts.map((t) => [TRACKS[t.track].n, t.t, t.who || '—', fmtShort(t.due), (TST[t.st] || TST.todo)[0]]), head: ['الجهة', 'المهمة', 'المسؤول', 'الموعد', 'الحالة'] }); }
  const ns = pageNotes(n); if (ns.length) { B.push({ h: 2, t: 'ملاحظات الصفحة' }); ns.forEach((x) => B.push({ li: `${fmtShort(x.at)} · ${x.by}: ${x.t}` })); }
  return B;
}

/** تحميل صفحة واحدة: f = 'docx' | 'html' */
export async function dlPage(n, f) {
  const B = pageDocModel(n); const nm = `${(S.brand || 'brand').replace(/[\\/:*?"<>|\s]+/g, '-')}-${DOCSECS[n - 1].t.replace(/[\\/:*?"<>|\s]+/g, '-')}.${f}`;
  if (f === 'html') return saveFile(nm, docHTML(B), 'text/html');
  try { const b = await buildDocx(B); await saveFile(nm, b, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); }
  catch (e) { notify('تعذّر إنشاء ملف Word هنا. جرّب HTML.', 'err'); }
}

/* ---------- أفعال الصفحات والمهام (pagesAction) ---------- */
export function setPageSt(n, v) {
  patch({ pages: { [n]: { st: v, at: Date.now(), by: whoName() } }, docst: { [n]: v } });
  logEv('page', `${['أعاد', 'أرسل', 'اعتمد'][v]} صفحة «${DOCSECS[n - 1].t}» ${['إلى المسودة', 'للمراجعة', ''][v]}`.trim(), { verb: 'حدّث صفحة' });
  if (v === 2) SND.play('gold');
}
export function setPageOwner(n, v) { patch({ pages: { [n]: { owner: v } } }); }
export function addPageNote(n, t) {
  t = String(t || '').trim(); if (!t) return false;
  patch({ pnotes: { [newId()]: { sec: +n, at: Date.now(), by: whoName(), t } } });
  logEv('page', `ملاحظة على «${DOCSECS[n - 1].t}»: ${t}`, { verb: 'علّق على صفحة' });
  return true;
}
/** تعديل حقل مهمة: f = 'st' | 'who' | 'due' (قيمة التاريخ yyyy-mm-dd) */
export function setTask(id, f, v) {
  if (f === 'due') v = dateTs(v);
  const p = { [f]: v, upd: Date.now(), by: whoName() }; patch({ tasks: { [id]: p } });
  const tk = allTasks().find((x) => x.id === id);
  if (f === 'st' && tk) logEv('task', `${TRACKS[tk.track].n}: ${tk.t} ← ${TST[v][0]}`, { ax: tk.qq.s.n, verb: 'حدّث مهمة متخصصة' });
  if (f === 'st' && v === 'done') SND.play('place');
}
export function saveTaskNote(id, note) { patch({ tasks: { [id]: { note: String(note || '').trim(), by: whoName() } } }); }
export function setTrackLead(tk, v) { patch({ tracks: { [tk]: { who: String(v || '').trim() } } }); }
/** ثبّت المواعيد المقترحة (كل المسارات أو مسار واحد) */
export function fixDues(tk = 'all') {
  const m = {};
  allTasks().filter((t) => t.ready && !t.dueSet && t.st !== 'done' && (tk === 'all' || t.track === tk)).forEach((t) => { m[t.id] = { due: Math.max(t.due, Date.now() + 3 * DAY), upd: Date.now(), by: whoName() }; });
  const n = Object.keys(m).length; if (!n) { notify('كل المواعيد مثبّتة.'); return 0; }
  patch({ tasks: m });
  logEv('task', `ثبّت ${n} موعداً للمتابعة المتخصصة${tk === 'all' ? '' : ' — ' + TRACKS[tk].n}`, { verb: 'حدّث المتابعة المتخصصة' });
  notify(`ثُبّت ${n} موعداً. المواعيد التي مضت نُقلت إلى ٣ أيام من اليوم.`);
  return n;
}

/* ---------- مشاريعي ---------- */
export async function loadProjects() {
  const map = new Map(); (LS.get('bm3:recent') || []).forEach((r) => map.set(r.code, { code: r.code, brand: r.brand, role: '', at: r.at }));
  if (!LOCAL && CAP.db && ME.id) {
    try { const qs = await CAP.db.collection('data/users/' + ME.id).limit(200).get(); qs.docs.forEach((d) => { const x = d.data(); if (x && x.code) map.set(x.code, { ...(map.get(x.code) || {}), ...x }); }); } catch (e) { /* تجاهل */ }
    try { const qs = await CAP.db.collection('sessions').where('owner', '==', ME.id).limit(100).get(); qs.docs.forEach((d) => { const x = d.data(); if (x && x.code) map.set(x.code, { ...(map.get(x.code) || {}), code: x.code, brand: x.brand, role: 'owner', doc: x }); }); } catch (e) { /* تجاهل */ }
  }
  const list = [...map.values()];
  await Promise.all(list.map(async (p) => {
    if (p.doc) return; if (LOCAL || !CAP.db) { p.doc = LS.get('bm3:s:' + p.code); return; }
    try { const s = await CAP.db.doc('sessions/' + p.code).get(); if (s && s.exists) p.doc = s.data(); } catch (e) { /* تجاهل */ }
  }));
  const out = list.filter((p) => p.doc).map((p) => ({ ...p, role: p.doc.owner && p.doc.owner === ME.id ? 'owner' : (p.role || 'member') })).sort((a, b) => (b.doc.updated || 0) - (a.doc.updated || 0));
  setUI({ projList: out });
  return out;
}

/* صحة العلامة لوثيقة D (نفس معادلة overall/axHealth في لوحة المتابعة) */
const followsIn = (D) => Object.entries((D && D.follow) || {}).map(([id, f]) => ({ id, ...f })).filter((f) => f && f.ax && f.at).sort((a, b) => b.at - a.at);
const axLastIn = (D, n) => followsIn(D).filter((f) => +f.ax === n)[0] || null;
const cadIn = (D) => (D && D.dash && D.dash.cad) || 30;
const axDueIn = (D, n) => { const l = axLastIn(D, n); const base = l ? l.at : (D.doneAt || D.updated || Date.now()); return base + cadIn(D) * DAY; };
const axHealthIn = (D, s) => {
  const comp = s.qs.filter((q) => placedIn(D, q.id)).length / s.qs.length;
  const cs = s.qs.map((q) => confIn(D, q.id)).filter(Boolean); const cf = (cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : 0) / 5;
  const l = axLastIn(D, s.n); const st = l ? (STS[l.st] || STS.ok).sc : 18;
  return Math.round(comp * 40 + cf * 30 + st);
};
const overallIn = (D) => Math.round(STAGES.reduce((a, s) => a + axHealthIn(D, s), 0) / STAGES.length);
const nextReviewIn = (D) => Math.min(...STAGES.map((s) => axDueIn(D, s.n)));

/** مقاييس مشروع من وثيقة جلسته (بلا تبديل الجلسة الحالية) */
export function projMetrics(doc) {
  try {
    const all = allTasks(doc); const ts = taskStats(all);
    return {
      n: ALLQ.filter((q) => placedIn(doc, q.id)).length, done: !!doc.done, health: overallIn(doc), pages: pagesApproved(doc), tasks: ts,
      late: STAGES.filter((s) => doc.done && daysTo(axDueIn(doc, s.n)) < 0).length, next: doc.done ? nextReviewIn(doc) : 0, upd: doc.updated || doc.created || 0,
      lateTasks: all.filter((t) => t.ready && (t.overdue || t.stale)).map((t) => ({ ...t, brand: doc.brand, code: doc.code })),
    };
  } catch (e) { return null; }
}

/** فتح مشروع من القائمة: v = 'play' | 'dash' | 'tracks' */
export async function openProj(code, v) {
  if (await openSession(code)) {
    afterOpen();
    if (v === 'tracks') go('dash', { dtab: 'tracks' });
    else go(v === 'play' && S.done ? 'dash' : v);
  }
}
/** بدّل المشروع من قائمة رأس اللوحة */
export async function switchProj(code) { if (code && code !== CODE && await openSession(code)) { afterOpen(); go('dash'); } }
export const newProj = () => go('start', { startTab: 'new', created: null });
export const joinProj = () => go('start', { startTab: 'join', created: null });
