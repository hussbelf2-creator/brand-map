/* أدوات واجهة مشتركة */
import { patch } from '../engine/engine.js';
import { toast } from './overlays.jsx';

export async function copyText(t, msg = 'نُسخ') {
  try { await navigator.clipboard.writeText(t); toast(msg); }
  catch (e) { window.prompt('انسخ يدوياً:', t); }
}
const timers = {};
/** يؤجّل حفظ تعديل متكرر (كتابة نص) حتى يتوقف المستخدم: key فريد للحقل */
export function debounced(key, fn, ms = 350) { clearTimeout(timers[key]); timers[key] = setTimeout(fn, ms); }
/** حفظ صامت مؤجّل لجزء من الجلسة (لا يطلق إشعارات تغيير للفريق) */
export function patchLater(key, p, ms = 350) { debounced(key, () => patch(p, { silent: true }), ms); }
