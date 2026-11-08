/* مؤقت النقاش: حالة العرض المشتقة (updTimer في الأصل) ونبضة كل ٢٥٠ مللي ثانية للمكوّنات الحيّة */
import { useSyncExternalStore } from 'react';
import { S, ui, SND, DEF_TIMER, fmt, placed, timeOf, tmState } from '../../engine/engine.js';
import { boardTimer } from './board.js';

/* ---------- نبضة خفيفة: تعيد رسم المؤقت وشريط الكلمة فقط، لا الطاولة كلها ---------- */
let TICK = 0; const subs = new Set();
const sub = (f) => { subs.add(f); return () => subs.delete(f); };
export function useTick() { return useSyncExternalStore(sub, () => TICK); }
export function tickNow() { TICK++; subs.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }

export const durOf = () => (S && S.cfg && S.cfg.dur) || DEF_TIMER || 180;

/** حالة المؤقت للبطاقة الحالية: mode = idle | run | warn | over | done */
export function timerView(qid = ui.q) {
  const t = tmState(); const mine = t.q === qid; const tmRec = timeOf(qid); const pl = placed(qid); const dur0 = durOf();
  let mode = 'idle', frac = 1, label;
  if (mine && (t.run || t.el > 0) && !pl) { const rem = t.rem / 1000; frac = Math.max(0, rem) / (t.dur / 1000); mode = rem < 0 ? 'over' : rem <= 30 ? 'warn' : 'run'; label = rem < 0 ? '+' + fmt(-rem) : fmt(rem); }
  else if (pl && tmRec) { mode = tmRec.s > tmRec.d ? 'over' : 'done'; frac = Math.max(0, 1 - tmRec.s / tmRec.d); label = fmt(tmRec.s); }
  else label = fmt(dur0);
  return { t, mine, tmRec, pl, mode, frac, label, dur0 };
}

/* أصوات العتبات — مرة واحدة لكل عبور */
let tmKey = '', lastRem = null;
/** يُستدعى كل ٢٥٠ مللي ثانية أثناء عرض الطاولة: حالة اللوحة ثلاثية الأبعاد، الأصوات، ثم إعادة رسم المؤقت */
export function timerTick() {
  if (ui.view !== 'play' || !S) return;
  const v = timerView(); const t = v.t;
  boardTimer(v.mine && !v.pl ? v.mode : '');
  const key = t.q + '|' + t.st; if (tmKey !== key) { tmKey = key; lastRem = null; }
  if (v.mine && t.run && !v.pl) {
    const r = Math.ceil(t.rem / 1000); const L = lastRem;
    if (L != null && r !== L) { if (L > 30 && r <= 30) SND.play('warn'); if (r <= 10 && r >= 1 && r < L) SND.play('tick'); if (L > 0 && r <= 0) SND.play('bell'); }
    lastRem = r;
  }
  tickNow();
}
