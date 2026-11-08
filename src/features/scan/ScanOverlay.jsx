/* اللعب الفيزيائي: رفع صور لوحة الاستلام وقراءتها بالذكاء الاصطناعي — منقول من physical.js */
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  S, RO, CAP, ui, setUI, patch, logEv, STAGES, ALLQ, N_Q, AR, AK, optT, LOGO,
  placed, ansSummary, whoName, newId,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon, Art } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { openModal, closeModal, isModalOpen, isDrawerOpen, toast } from '../../ui/overlays.jsx';
import { go } from '../../nav.js';
import { openLesson } from '../lessons/LessonDrawer.jsx';
import { figSpecial } from '../lessons/figures.js';

/* ---------- حالة الرفع (SC في الأصل) — مخزن صغير خارج React ---------- */
const SC0 = () => ({ files: [], results: null, busy: false, prog: '', err: '', caps: undefined });
let SC = SC0();
const subs = new Set();
const setSC = (p) => { SC = { ...SC, ...p }; subs.forEach((f) => f()); };
const subSC = (f) => { subs.add(f); return () => subs.delete(f); };
const useSC = () => useSyncExternalStore(subSC, () => SC);

const syncHtml = () => document.documentElement.classList.toggle('ik-open', !!(ui.ikOpen || ui.scanOpen));
const pl0 = (q) => (placed(q.id) ? ansSummary(q) : '');
const to2d = () => setUI({ boardMode: '2d' });

export async function scanCaps() { if (!CAP.sample) return null; try { const l = await CAP.sample.limits(); return l && l.images ? l.images : null; } catch (e) { return null; } }

export function openScan() {
  if (!S) return;
  // روابط المعاينة تُلغى عند الإغلاق، فتُعاد هنا للصور المحفوظة
  setSC({ files: SC.files.map((f) => ({ ...f, url: f.url || URL.createObjectURL(f.file) })) });
  setUI({ scanOpen: true });
  syncHtml();
  scanCaps().then((c) => setSC({ caps: c }));
}

export function closeScan() {
  setUI({ scanOpen: false });
  syncHtml();
  SC.files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
  setSC({ files: SC.files.map((f) => ({ ...f, url: '' })) });
}

export function fillSpecText(q) {
  return q.ans.map((a) => {
    switch (a.f) {
      case 'pestle': return `${a.k}: {p,e,s,t,l,n} سياسي/اقتصادي/اجتماعي/تقني/قانوني/بيئي`;
      case 'comp': return `${a.k}: {name,risk(منخفضة|متوسطة|عالية),strong,weak}`;
      case 'fields': return `${a.k}: {${a.fields.map((f) => f[0] + '=' + f[1]).join(', ')}}`;
      case 'lines': case 'prod': return `${a.k}${a.code2 ? ' (' + a.code2 + ')' : ''}: {text}`;
      case 'swot': return `${a.k}: {s,w,o,t}`;
      case 'scales': return `${a.k}: {"0".."${a.scales.length - 1}": 1-7}`;
      case 'tagline': return `${a.k}: {t1,t2,t3,pick}`;
      case 'matrix': return `${a.k}: {x,y,we,them}`;
      case 'ntype': return `${a.k}: {type: وصفي|رمزي|مختزل|شخصي|مختلق|عاطفي}`;
      case 'domains': return `${a.k}: {com:{st},sa:{st},social:{st}} st=متاح|محجوز`;
    }
    return '';
  }).filter(Boolean).join(' ; ');
}

export function scanPrompt() {
  const L = STAGES.map((s) => `المحور ${s.n} «${s.name}» (لون العمود ${s.c}):\n` + s.qs.map((q) => `  Q${q.no} «${q.slot}»${q.gold ? ' ★ذهبية' : ''} — ${q.type === 'opt' ? 'بطاقات اختيار: ' + q.ans.map((a) => `Q${q.no}.${a.k}=${optT(a) || 'احتياط مكتوب'}`).join('، ') : 'بطاقة تعبئة مكتوبة بخط اليد: ' + fillSpecText(q)}`).join('\n')).join('\n');
  return `هذه صورة (أو جزء) من «لوحة استلام الأجوبة» في لعبة براند ماب المطبوعة لعلامة «${S.brand}».
اللوحة ثمانية أعمدة ملوّنة من اليمين إلى اليسار، عمود لكل محور، وتحت كل رأس عمود فتحات مرقّمة Q1، Q2… توضع فيها بطاقات الإجابة.
كل بطاقة إجابة مطبوع في أسفلها رمز مثل «Q1.3» (رقم السؤال داخل المحور، ثم رقم الإجابة)، وخمس دوائر لدرجة التأكد يظلّل اللاعبون عدداً منها، وفي أعلاها اسم المحور ولونه.
بطاقات التعبئة فيها أسطر مكتوبة بخط اليد.

خريطة البطاقات:
${L}

المطلوب: لكل فتحة ظاهرة فيها بطاقة، حدّد المحور والسؤال والإجابة (أو النص المكتوب)، وعدد دوائر التأكد المظلّلة (0 إن لم يظلَّل شيء)، ووضوح القراءة.
لا تخمّن ما لا يظهر. إن كان الرمز أو الكتابة غير مقروءين اجعل clarity="unclear" واكتب السبب في note.
أعد JSON فقط:
{"cards":[{"axis":1,"q":1,"answers":["3"],"conf":4,"fill":{"1":{"text":"..."}},"clarity":"clear","note":""}],"empty":[{"axis":1,"q":2}],"notes":"ملاحظة عامة عن الصورة"}
- answers: أرقام الإجابات كنصوص لبطاقات الاختيار (بطاقة الاحتياط المكتوبة رقمها "p" ونصها في fill.p.text).
- fill: لبطاقات التعبئة فقط، بمفاتيح الحقول المذكورة أعلاه، والقيم نصوص كما كُتبت (أسطر متعددة بفاصل \\n).`;
}

/** يصغّر الصورة إلى 2000px على الأكثر ويحوّلها JPEG عند الحاجة */
export async function prepImage(f) {
  try {
    const bmp = await createImageBitmap(f); const m = 2000, sc = Math.min(1, m / Math.max(bmp.width, bmp.height));
    if (sc === 1 && f.size < 8e6 && /jpe?g|png|webp/.test(f.type)) return f;
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise((r) => cv.toBlob((b) => r(b || f), 'image/jpeg', 0.9));
  } catch (e) { return f; }
}

/** ينظّف بطاقة قرأها النموذج ويطابقها مع خريطة الأسئلة */
export function cleanCard(d) {
  const ax = +d.axis, qn = +d.q; const s = STAGES[ax - 1]; if (!s) return null;
  const q = s.qs.find((x) => x.no === qn); if (!q) return null; const keys = q.ans.map((a) => a.k);
  let ans = (Array.isArray(d.answers) ? d.answers : []).map(String).filter((k) => keys.includes(k)).slice(0, q.max); const fill = {};
  if (d.fill && typeof d.fill === 'object') Object.entries(d.fill).forEach(([k, v]) => {
    const a = AK(q, k); if (!a || !v || typeof v !== 'object') return; const o = {};
    Object.entries(v).forEach(([kk, vv]) => {
      if (vv == null) return;
      if (typeof vv === 'object' && !Array.isArray(vv)) { o[kk] = {}; Object.entries(vv).forEach(([a2, b2]) => { if (typeof b2 !== 'object') o[kk][a2] = String(b2).slice(0, 600); }); }
      else o[kk] = typeof vv === 'number' ? vv : String(vv).slice(0, 1200);
    });
    if (Object.keys(o).length) { fill[k] = o; if (!ans.includes(k) && (q.type === 'fill' || a.spare)) ans.push(k); }
  });
  if (q.type === 'fill') ans = ans.filter((k) => fill[k]);
  return { qid: q.id, q, answers: ans, conf: Math.max(0, Math.min(5, Math.round(+d.conf || 0))), fill, clarity: d.clarity === 'unclear' || !ans.length ? 'unclear' : 'clear', note: String(d.note || '').slice(0, 200) };
}

export async function analyzeScan() {
  if (SC.busy) return;
  if (!CAP.sample) { toast('قراءة الصور تعمل عند فتح الأداة من رابطها في Claude.', 'err'); return; }
  if (!SC.files.length) { toast('أضيفوا صورة واحدة على الأقل.', 'err'); return; }
  const files = SC.files.slice();
  setSC({ busy: true, err: '' });
  const found = {}, empty = [], notes = []; let err = '';
  for (let i = 0; i < files.length; i++) {
    setSC({ prog: `يقرأ الصورة ${AR(i + 1)} من ${AR(files.length)}…` });
    try {
      const img = await prepImage(files[i].file);
      const r = await CAP.sample.json(scanPrompt(), { images: [img], modelTier: 'default', feat: 'scan' });
      (Array.isArray(r && r.cards) ? r.cards : []).forEach((d) => {
        const c = cleanCard(d); if (!c) return; const prev = found[c.qid]; c.photo = i + 1;
        if (prev) {
          const same = prev.answers.join() === c.answers.join();
          if (!same) { prev.clarity = 'unclear'; prev.note = (prev.note ? prev.note + ' · ' : '') + `قراءة مختلفة في الصورة ${AR(i + 1)}`; }
          else if (c.clarity === 'clear') prev.clarity = prev.clarity === 'clear' ? 'clear' : prev.clarity;
        } else found[c.qid] = c;
      });
      (Array.isArray(r && r.empty) ? r.empty : []).forEach((e) => { const s = STAGES[(+e.axis) - 1]; const q = s && s.qs.find((x) => x.no === +e.q); if (q) empty.push(q.id); });
      if (r && r.notes) notes.push(`الصورة ${AR(i + 1)}: ${String(r.notes).slice(0, 200)}`);
    } catch (e) {
      const c = e && e.code;
      err = c === 'not_granted' ? 'لم يُسمح بإرسال الصور للمستشار في هذا العرض.' : c === 'images_unavailable' ? 'هذا العرض لا يدعم قراءة الصور.' : c === 'image_rejected' ? `الصورة ${AR(i + 1)} غير مقبولة (النوع أو الحجم).` : c === 'rate_limited' ? 'طلبات كثيرة. انتظروا دقيقة ثم أعيدوا المحاولة.' : 'تعذّرت قراءة إحدى الصور. جرّبوا صورة أوضح.';
      setSC({ err });
      if (c === 'not_granted' || c === 'images_unavailable') break;
    }
  }
  const results = { cards: Object.values(found).sort((a, b) => ALLQ.indexOf(a.q) - ALLQ.indexOf(b.q)), empty: [...new Set(empty)], notes, sel: {} };
  results.cards.forEach((c) => { results.sel[c.qid] = c.clarity === 'clear' || c.answers.length > 0; });
  setSC({ results, busy: false, prog: '', err });
}

export function applyScan() {
  if (RO) return; const R = SC.results; if (!R) return;
  const p = { place: {}, conf: {}, fill: {}, src: {}, hist: {} }; let n = 0, unc = 0;
  R.cards.forEach((c) => {
    if (!R.sel[c.qid] || !c.answers.length) return; n++; p.place[c.qid] = c.answers; if (c.conf) p.conf[c.qid] = c.conf; if (Object.keys(c.fill).length) p.fill[c.qid] = c.fill;
    p.src[c.qid] = { photo: true, clarity: c.clarity, reviewed: false, at: Date.now(), note: c.note }; if (c.clarity === 'unclear') unc++;
    const from = pl0(c.q), to = c.answers.map((k) => { const a = AK(c.q, k); return a && !a.f ? optT(a) : (a && a.code2) || 'نص مكتوب'; }).join('، ');
    if (from !== to) p.hist[c.qid] = { [newId()]: { at: Date.now(), by: whoName() + ' (من الصورة)', from, to } };
  });
  R.cards.filter((c) => !c.answers.length).forEach((c) => { p.src[c.qid] = { photo: true, clarity: 'unclear', reviewed: false, at: Date.now(), note: c.note || 'لم تُقرأ' }; unc++; });
  patch(p, { now: true }); logEv('card', `عبّأ ${n} بطاقة من صور لوحة الاستلام${unc ? ` · ${unc} تحتاج مراجعة` : ''}`, { verb: 'رفع صور اللوحة' });
  const miss = ALLQ.filter((q) => !placed(q.id)).length;
  closeScan(); setSC({ ...SC0(), caps: SC.caps });
  if (ui.view !== 'play') go('play'); to2d();
  openModal(<AppliedModal n={n} unc={unc} miss={miss} />);
}

function AppliedModal({ n, unc, miss }) {
  return (
    <>
      <h3><Icon name="camera" /> عُبّئت اللوحة من الصور</h3>
      <div className="mb">
        <div className="kps three">
          <div className="kp"><span className="l">قُرئت بوضوح</span><span className="v" style={{ color: 'var(--ok)' }}>{n - unc < 0 ? 0 : n - unc}</span></div>
          <div className="kp"><span className="l">تحتاج مراجعة</span><span className="v" style={{ color: 'var(--warn)' }}>{unc}</span></div>
          <div className="kp"><span className="l">ناقصة</span><span className="v" style={{ color: 'var(--danger)' }}>{miss}</span></div>
        </div>
        <p>البطاقات المعلّمة بإطار برتقالي على لوحة الاستلام قُرئت بشكل غير مؤكد، والفتحات الفارغة لم تظهر في الصور. اضغطوا أي فتحة لتفتح البطاقة في يد اللاعب وتُدخلوا الإجابة يدوياً.</p>
      </div>
      <div className="mf"><button className="btn pri" onClick={closeModal}>ابدأ المراجعة</button></div>
    </>
  );
}

export function addScanFiles(fl) {
  const max = (SC.caps && SC.caps.maxCount) ? Math.max(SC.caps.maxCount, 12) : 12;
  const files = SC.files.slice();
  [...(fl || [])].filter((f) => /^image\//.test(f.type)).forEach((f) => { if (files.length < max) files.push({ file: f, url: URL.createObjectURL(f) }); });
  setSC({ files });
}
function delFile(i) { const files = SC.files.slice(); const f = files.splice(i, 1)[0]; if (f && f.url) URL.revokeObjectURL(f.url); setSC({ files }); }
/* scManual */
function manual() { closeScan(); if (ui.view !== 'play') go('play'); to2d(); }

/* ---------- المكوّن العام (renderScan) ---------- */
export default function ScanOverlay() {
  useEngine();
  const sc = useSC();
  const [over, setOver] = useState(false);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && ui.scanOpen && !SC.busy && !isModalOpen() && !isDrawerOpen()) closeScan(); };
    document.addEventListener('keydown', k, true);
    return () => document.removeEventListener('keydown', k, true);
  }, []);
  useEffect(() => { if (ui.scanOpen && !S) closeScan(); });
  if (!ui.scanOpen || !S) return null;
  const R = sc.results, caps = sc.caps;
  const selN = R ? Object.values(R.sel).filter(Boolean).length : 0;
  const toggle = (id, v) => setSC({ results: { ...R, sel: { ...R.sel, [id]: v } } });

  return (
    <div id="scanx" className="ikx" role="dialog" aria-modal="true" aria-label="رفع صور لوحة الاستلام">
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="ik-top"><div className="wrap"><div className="ik-bar">
        <span className="brandmk"><img src={LOGO} alt="" /><span>رفع صور لوحة الاستلام<small>{S.brand} · اللعب الفيزيائي</small></span></span>
        <span style={{ marginInlineStart: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn sm ghost" onClick={() => openLesson('physical')}><Icon name="book" /> كيف أصوّر؟</button>
          <button className="btn sm" onClick={closeScan}><Icon name="x" /> إغلاق</button>
        </span>
      </div></div></header>
      <div className="wrap sc-body">
        {!R ? (
          <section className="pn">
            <div className="sc-guide">
              <Art as="div" className="ls-fig" html={figSpecial('physical')} />
              <ol className="ls-ol">
                <li>بعد انتهاء اللعب، صوّروا لوحة الاستلام من الأعلى مباشرة بإضاءة جيدة.</li>
                <li>الأفضل صورة لكل عمودين (محورين)؛ الصورة القريبة تُقرأ بدقة أعلى.</li>
                <li>تأكدوا أن رمز كل بطاقة (مثل Q1.3) ودوائر التأكد والكتابة ظاهرة.</li>
                <li>ارفعوا الصور هنا، وراجعوا النتيجة، وما لم يُقرأ بوضوح تُدخلونه من لوحة اللعبة.</li>
              </ol>
            </div>
            <label className={'drop' + (over ? ' ov' : '')} id="drop"
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); addScanFiles(e.dataTransfer.files); }}>
              <input type="file" id="scFile" accept={caps && caps.mediaTypes ? caps.mediaTypes.join(',') : 'image/jpeg,image/png,image/webp'} multiple hidden
                onChange={(e) => { addScanFiles(e.target.files); e.target.value = ''; }} />
              <Icon name="image-plus" /><b>اسحبوا الصور هنا أو اضغطوا للاختيار</b>
              <small>JPEG أو PNG أو WebP{caps && caps.maxCount ? ` · حتى ${AR(caps.maxCount)} صور في كل قراءة` : ''}</small>
            </label>
            {sc.files.length ? (
              <div className="thumbs">
                {sc.files.map((f, i) => (
                  <figure key={f.url || i}>
                    <img src={f.url} alt={'صورة ' + AR(i + 1)} />
                    <figcaption>صورة {AR(i + 1)}<button className="ibtn sm" aria-label="حذف الصورة" onClick={() => delFile(i)}><Icon name="x" /></button></figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
            {!CAP.sample
              ? <div className="warnbox">قراءة الصور تعمل عند فتح الأداة من رابطها في Claude. يمكنكم الآن إدخال الإجابات يدوياً من لوحة الاستلام.</div>
              : caps === null ? <div className="warnbox">هذا العرض لا يسمح بإرسال الصور. افتحوا الأداة من رابطها في Claude.</div> : null}
            {sc.err ? <div className="warnbox">{sc.err}</div> : null}
            <div className="ik-nav">
              <button className="btn big ghost" onClick={manual}><Icon name="layout-grid" /> أدخل يدوياً من لوحة الاستلام</button>
              <button className="btn gold big" disabled={sc.busy || !sc.files.length || !CAP.sample} onClick={analyzeScan}><Icon name="scan-line" /> {sc.busy ? sc.prog : 'اقرأ الصور وعبّئ اللوحة'}</button>
            </div>
          </section>
        ) : (
          <Panel
            title={<><Icon name="scan-line" /> نتيجة القراءة</>}
            sub={`${AR(R.cards.length)} بطاقة قُرئت · ${AR(R.cards.filter((c) => c.clarity === 'unclear').length)} غير واضحة · ${AR(N_Q - R.cards.length)} لم تظهر. راجعوا وأزيلوا العلامة عن أي قراءة خاطئة قبل التعبئة.`}
            act={<button className="btn sm ghost" onClick={() => setSC({ results: null })}><Icon name="rotate-ccw" /> صور أخرى</button>}>
            {sc.err ? <div className="warnbox">{sc.err}</div> : null}
            {R.notes.length ? <div className="whybox">{R.notes.map((t, i) => <React.Fragment key={i}>{i ? <br /> : null}{t}</React.Fragment>)}</div> : null}
            <div className="sc-res">
              {STAGES.map((s) => {
                const cs = R.cards.filter((c) => c.q.s === s);
                return (
                  <div key={s.n} className="sc-col" style={{ '--c': s.c, '--ci': s.ci }}>
                    <div className="rb-ax">{s.name}</div>
                    {s.qs.map((q) => {
                      const c = cs.find((x) => x.qid === q.id);
                      if (!c) return <div key={q.id} className="sc-it miss"><span className="num">Q{q.no}</span><span>{q.slot}</span><small>لم تظهر</small></div>;
                      const fillTx = Object.keys(c.fill).length ? Object.values(c.fill).map((v) => Object.values(v).filter((x) => typeof x === 'string').join(' / ')).join(' | ').slice(0, 90) : '';
                      return (
                        <label key={q.id} className={'sc-it ' + c.clarity}>
                          <input type="checkbox" checked={!!R.sel[q.id]} onChange={(e) => toggle(q.id, e.target.checked)} />
                          <span className="num">Q{q.no}</span>
                          <span>
                            <b>{c.answers.length ? c.answers.map((k) => { const a = AK(q, k); return a && !a.f && !a.spare ? optT(a) : 'نص مكتوب'; }).join('، ') : 'غير مقروءة'}</b>
                            {fillTx ? <small className="tx">{fillTx}</small> : null}
                            <small>{c.conf ? 'تأكد ' + c.conf + '/5 · ' : ''}صورة {AR(c.photo)}{c.note ? ' · ' + c.note : ''}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="ik-nav">
              <button className="btn big ghost" onClick={closeScan}>إلغاء</button>
              <button className="btn gold big" disabled={RO} onClick={applyScan}><Icon name="check" /> عبّئ اللوحة بالمحدَّد ({AR(selN)})</button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
