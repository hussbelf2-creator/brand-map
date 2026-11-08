/* حالة لوحة الإدارة (ADM في الأصل) وذاكرة البيانات المؤقتة need() */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { aList, ICONS, PLANS, setVar } from '../../engine/engine.js';

/* أيقونات أضافتها admin2.js الأصلية إلى المكتبة (غير موجودة في المحرّك) */
const EXTRA_ICONS = {
  'clock-3': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
};
Object.entries(EXTRA_ICONS).forEach(([k, v]) => { if (!ICONS[k]) ICONS[k] = v; });

/** حالة اللوحة: القسم الحالي، المحور، البطاقة قيد التحرير، البحث، التبويبات، والبيانات المجلوبة */
export const ADM = { sec: 'over', ax: 1, eq: null, q: '', ctab: 'clients', ptab: 'plans', ktab: 'lessons', consTab: 'list', data: {}, got: {}, dirty: false, rev: 0 };

let V = 0;
const subs = new Set();
/** يحدّث حالة اللوحة ويعيد رسم المشتركين */
export function admSet(p) {
  if (p) Object.assign(ADM, p);
  V++;
  subs.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
}
const sub = (f) => { subs.add(f); return () => subs.delete(f); };
/** اشتراك المكوّن في حالة اللوحة */
const snap = () => V;
export const useAdm = () => useSyncExternalStore(sub, snap, snap);

/** يُبطل البيانات المجلوبة فيُعاد جلبها (ADM.force=true ثم admRender في الأصل) */
export function reload() { admSet({ rev: ADM.rev + 1 }); }
/** تحديث كامل يمسح الذاكرة المؤقتة (admRefresh) */
export function refreshAll() { admSet({ data: {}, got: {}, rev: ADM.rev + 1 }); }

const inflight = {};
/** يجلب المجموعات المطلوبة مرة واحدة لكل إصدار من الذاكرة */
export async function need(...cols) {
  const r = ADM.rev;
  await Promise.all(cols.map(async (c) => {
    if (ADM.data[c] && ADM.got[c] === r) return;
    if (!inflight[c] || inflight[c].r !== r) inflight[c] = { r, p: aList(c) };
    const v = await inflight[c].p;
    if (c === 'plans') v.sort((a, b) => (a.ord || 0) - (b.ord || 0));
    ADM.data[c] = v;
    ADM.got[c] = r;
  }));
  if (cols.includes('plans') && PLANS !== ADM.data.plans) setVar('PLANS', ADM.data.plans);
  return ADM.data;
}

/** تحميل غير متزامن لقسم: يُعاد عند كل reload() أو تغيّر deps. يعيد {v, err, rev} */
export function useLoad(fn, deps = []) {
  useAdm();
  const rev = ADM.rev;
  const [st, setSt] = useState({ v: null, err: null, rev: -1 });
  useEffect(() => {
    let live = true;
    Promise.resolve().then(fn).then(
      (v) => { if (live) { setSt({ v, err: null, rev }); admSet(); } },
      (err) => { console.error(err); if (live) setSt({ v: null, err, rev }); },
    );
    return () => { live = false; };
  }, [rev, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return st;
}
