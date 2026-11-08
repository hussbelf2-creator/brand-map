/* التنقل بين الشاشات عبر الرابط (#view أو #play-BM-XXXX) — مأخوذ من show/go/route الأصلية */
import { ui, setUI, S, CODE, LS, feedItems, openSession, afterOpen } from './engine/engine.js';

export const VIEWS = ['home', 'start', 'play', 'dash', 'projects', 'lessons', 'consult', 'admin'];

export function setHash(h) { try { if (location.hash !== '#' + h) history.replaceState(null, '', '#' + h); } catch (e) { location.hash = h; } }

/** يعرض شاشة ويحدّث حالة الواجهة (بديل show الأصلية) */
export function show(v, extra = {}) {
  const p = { view: v, ...extra };
  if (ui.view === 'dash' && v !== 'dash' && CODE) LS.set('bm3:seen:' + CODE, Date.now());
  if (v === 'dash') { p.dashOpenAt = Date.now(); p.seenAt = CODE ? (LS.get('bm3:seen:' + CODE) || 0) : 0; const f = S ? feedItems()[0] : null; p.lastFeedAt = f ? f.at : 0; }
  setUI(p);
  document.body.dataset.view = v;
  window.scrollTo(0, 0);
}

/** ينتقل لشاشة ويكتب الرابط (بديل go الأصلية) */
export function go(v, extra) {
  if ((v === 'play' || v === 'dash') && !S) v = 'start';
  setHash(v === 'play' && CODE ? 'play-' + CODE : v === 'dash' && CODE ? 'dash-' + CODE : v);
  show(v, extra);
}

export async function route() {
  const h = (location.hash || '').slice(1);
  const m = h.match(/^(play|dash)-(BM-[A-Z0-9]{4})$/i);
  if (m) { const ok = CODE === m[2].toUpperCase() && S ? true : await openSession(m[2]); if (ok) { afterOpen(); show(m[1].toLowerCase()); return; } show('start'); return; }
  if (h === 'play' || h === 'dash') { if (S) { show(h); return; } const last = LS.get('bm3:last'); if (last && await openSession(last, { quiet: true })) { afterOpen(); show(h); return; } show('start'); return; }
  if (h === 'upload') { show('start', { startTab: 'photo' }); return; }
  if (h === 'plans') { show('start'); setTimeout(() => import('./features/plans/PlansModal.jsx').then(m => m.openPlans()), 300); return; }
  show(VIEWS.includes(h) ? h : 'home');
}
