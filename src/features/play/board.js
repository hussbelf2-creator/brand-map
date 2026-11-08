/* أغلفة آمنة لاستدعاءات اللوحة ثلاثية الأبعاد: لا تُسقط الواجهة إن لم يعمل WebGL أو لم تُهيّأ اللوحة بعد */
import { S, ui, Board } from '../../engine/engine.js';

const safe = (f) => { try { if (Board.ok) f(); } catch (e) { /* اللوحة غير مهيّأة بعد */ } };

/** يركّب اللوحة على المسرح (حتى في وضع لوحة الاستلام، كما في الأصل، لتبقى المشهد جاهزاً) */
export function mountBoard(el) { if (!el || !S) return; safe(() => { Board.mount(el, 'play'); Board.sync(S); Board.focus(ui.q, { instant: true }); }); }
export const boardFocus = (qid, o) => safe(() => Board.focus(qid, o));
export const boardSync = (st, o) => safe(() => Board.sync(st, o));
export const boardOverview = (n) => safe(() => Board.overview(n));
export const boardFinale = () => safe(() => Board.finale());
export const boardTimer = (m) => { try { Board.setTimer(m); } catch (e) { /* noop */ } };
