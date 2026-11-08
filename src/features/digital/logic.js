/* الحضور الرقمي في لوحة المتابعة — منطق بلا عرض (النصف الخاص باللوحة من digital.js الأصلي)
   خطوة الحضور الرقمي في بطاقة المشروع وبوابة إنهاء الجلسة عند وحدة intake. */
import {
  S, ui, setUI, CAP, Q, DPLAT, DG, platOn, placed, ansSummary, defLine, fmtShort, patch, logEv, whoName, newId, notify,
} from '../../engine/engine.js';

export const dateTs = (v) => { const t = v ? new Date(v + 'T12:00:00').getTime() : Date.now(); return isFinite(t) ? t : Date.now(); };

/** قراءات منصة: خط الأساس من ملف المشروع ثم القراءات المسجّلة (الأقدم أولاً) */
export function platReadings(k) {
  const d = DG(), p = (d.plats || {})[k] || {};
  const base = p.fol != null && p.fol !== '' ? [{ at: (S.doneAt || S.created || Date.now()), fol: +p.fol, eng: +p.eng || 0, ppw: +p.ppw || 0, base: 1 }] : [];
  return base.concat(Object.values(S.dread || {}).filter((r) => r && r.p === k && r.at).map((r) => ({ at: r.at, fol: +r.fol, eng: +r.eng, ppw: +r.ppw, by: r.by })).sort((a, b) => a.at - b.at));
}

/** بنود اتساق المنصة مع قرارات الطاولة */
export function chkItems() {
  const t = (Q['4_1'] && placed('4_1')) ? ansSummary(Q['4_1']) : 'النبرة المختارة', tg = (Q['5_2'] && placed('5_2')) ? ansSummary(Q['5_2']) : 'الشعار اللفظي', co = (Q['7_3'] && placed('7_3')) ? ansSummary(Q['7_3']) : 'ألوان الهوية';
  return [`البايو يحمل جملة التعريف أو الشعار «${tg}»`, `آخر ١٠ منشورات بنبرة «${t}»`, `التصاميم تلتزم بألوان «${co}»`, 'الاسم والمعرّف موحّدان مع بقية المنصات', 'رابط الموقع أو المتجر في البايو'];
}

export const setChk = (k, i, on) => patch({ dchk: { [k]: { [i]: on } } });

/** تقرير وكيل المنصة (CAP.sample) — يُحفظ في S.dai[k] */
export async function platAI(k) {
  if (!CAP.sample || ui.platBusy) return;
  setUI({ platBusy: k });
  const [, n] = DPLAT.find((x) => x[0] === k); const d = DG(), p = (d.plats || {})[k] || {}, r = platReadings(k);
  const dec = ['2_1', '2_2', '3_3', '4_1', '4_2', '4_4', '5_1', '5_2', '5_3', '7_1', '7_3', '8_1'].filter((id) => Q[id] && placed(id)).map((id) => `${Q[id].slot}: ${ansSummary(Q[id])}`).join('\n');
  const prompt = `أنت مستشار حضور رقمي لعلامة «${S.brand}» في السعودية والخليج. ${defLine()}
المنصة: ${n} · المعرّف: ${p.handle || 'غير محدد'}
القراءات (الأقدم أولاً): ${r.map((x) => `${fmtShort(x.at)}: ${x.fol} متابع، ${x.ppw || 0} منشور/أسبوع، تفاعل ${x.eng || 0}٪`).join(' | ') || 'لا قراءات'}
قرارات العلامة من اللعبة:
${dec || 'لا قرارات بعد'}
بنود الاتساق المحققة: ${chkItems().filter((x, i) => ((S.dchk || {})[k] || {})[i]).join('، ') || 'لا شيء'}
اكتب تقريراً عملياً قصيراً بالعربية مبنياً على هذه البيانات فقط، دون أرقام مخترعة، ودون ادعاء أنك اطّلعت على الحساب.
أعد JSON فقط: {"headline":"","summary":"٢-٣ جمل","pillars":["محور محتوى مرتبط بالشخصية والرسالة"],"gaps":["فجوة"],"plan":["يوم: نوع المنشور"],"kpis":["مؤشر ومستهدف"]} حتى ٤ عناصر لكل قائمة.`;
  try {
    const a = await CAP.sample.json(prompt, { modelTier: 'default', feat: 'digital' }); const L = (x) => (Array.isArray(x) ? x : []).slice(0, 5).map((v) => String(v).slice(0, 220));
    patch({ dai: { [k]: { at: Date.now(), by: whoName(), data: { headline: String((a && a.headline) || '').slice(0, 200), summary: String((a && a.summary) || '').slice(0, 700), pillars: L(a && a.pillars), gaps: L(a && a.gaps), plan: L(a && a.plan), kpis: L(a && a.kpis) } } } }, { now: true });
    logEv('follow', `تقرير منصة ${n}`, { verb: 'طلب تقرير منصة' });
  } catch (e) { notify(e && e.code === 'rate_limited' ? 'طلبات كثيرة. انتظروا دقيقة.' : 'تعذّر إنشاء التقرير الآن.', 'err'); }
  finally { setUI({ platBusy: null }); }
}

/** تسجيل قراءة منصة (dReadSave). يعيد false عند خطأ الإدخال */
export function saveDRead({ p, fol, ppw, eng, date }) {
  if (fol === '' || fol == null || !isFinite(+fol)) { notify('اكتب عدد المتابعين.', 'err'); return false; }
  patch({ dread: { [newId()]: { p, fol: +fol, ppw: +ppw || 0, eng: +eng || 0, at: dateTs(date), by: whoName() } } }, { now: true });
  const pl = DPLAT.find((x) => x[0] === p);
  logEv('follow', `قراءة ${pl ? pl[1] : p}: ${(+fol).toLocaleString('en-US')} متابع`, { verb: 'سجّل قراءة منصة' });
  return true;
}

/** ملحق د في وثيقة المشروع */
export function digitalBlocks() {
  const d = DG(), pro = d.pro || {}, on = platOn(); if (!d.web && !on.length && !pro.email && !pro.phone) return [];
  const B = [{ h: 1, t: 'ملحق د — الحضور الرقمي وتقارير المنصات' }];
  B.push({ tb: [['الموقع', d.web || '—'], ['المتجر', d.store || '—'], ['البريد', pro.email || '—'], ['الجوال', pro.phone || '—'], ['المدينة', pro.city || '—'], ['التأسيس', pro.year || '—'], ['السجل التجاري', pro.cr || '—']], head: ['البند', 'القيمة'] });
  if (on.length) B.push({ tb: on.map(([k, n]) => { const p = (d.plats || {})[k] || {}, r = platReadings(k), l = r[r.length - 1] || {}; return [n, p.handle || '—', l.fol != null ? String(l.fol) : '—', l.eng ? l.eng + '٪' : '—']; }), head: ['المنصة', 'المعرّف', 'المتابعون', 'التفاعل'] });
  on.forEach(([k, n]) => { const a = ((S.dai || {})[k] || {}).data; if (!a) return; B.push({ h: 3, t: 'تقرير ' + n }); if (a.headline) B.push({ p: a.headline, b: true }); if (a.summary) B.push({ p: a.summary }); (a.pillars || []).forEach((x) => B.push({ li: 'محور محتوى: ' + x })); (a.kpis || []).forEach((x) => B.push({ li: 'مؤشر: ' + x })); });
  return B;
}
