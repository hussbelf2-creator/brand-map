/* بطاقة المشروع: تجربة بأربع خطوات (ثلاث للوقائع + الحضور الرقمي) مع معاينة ورقية حيّة — منقولة من ui.js و digital.js */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  S, CODE, RO, ui, setUI, patch, flush, clone, deepMerge, fget, SND, LOGO, STAGES, AR,
  INTAKE, IK_SECS, DPLAT, ikCount, reqMissing, digitalDone, digitalParts,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal, closeDrawer, isModalOpen, isDrawerOpen, toast } from '../../ui/overlays.jsx';
import { debounced } from '../../ui/util.js';
import { go } from '../../nav.js';

/* ---------- حالة الوحدة (IK في الأصل) ---------- */
// from: الشاشة التي فُتحت منها البطاقة · gate: دالة تُستدعى بعد الإكمال عند الفتح من بوابة لوحة المتابعة
const IK = { from: 'start', gate: null };

const ikHelp = { s1: 'جملة واحدة تجيب: ماذا نقدّم، ولمن. تتصدّر الطاولة طوال الجلسة.', s3: 'المرحلة تحدّد عمق الجلسة: الفكرة تحتاج تأسيساً، والقائم يحتاج إعادة تموضع.', s4: '', s6: 'نقارن بالسعر الحالي لا المستهدف. الطموح مكانه محور الرؤية.', s7: '', s8: 'يوجّه خاتمة الوثيقة وخطة ٣٠/٦٠/٩٠.', s11: 'اختر كل ما ينطبق.' };

/* ---------- حفظ مؤجّل قابل للتفريغ (ikT / dgT في الأصل) ---------- */
const pend = {};
function later(key, p) { pend[key] = p; debounced(key, () => { delete pend[key]; patch(p, { silent: true }); }, 350); }
function cancel(key) { if (key in pend) { delete pend[key]; debounced(key, () => {}, 0); } }
function flushPend() {
  const ks = Object.keys(pend); if (!ks.length) return;
  const all = {}; ks.forEach((k) => { deepMerge(all, pend[k]); cancel(k); });
  if (S && !RO) patch(all, { silent: true });
}

/* ---------- أدوات مسارات الحضور الرقمي ---------- */
const nest = (path, val) => { const parts = path.split('.'); const o = {}; let c = o; for (let i = 0; i < parts.length - 1; i++) { c[parts[i]] = {}; c = c[parts[i]]; } c[parts[parts.length - 1]] = val; return o; };
const getPath = (o, path) => path.split('.').reduce((a, k) => (a && typeof a === 'object' ? a[k] : undefined), o);

/* نسخ محلية من ikDone / digitalParts تعمل على المسودة المدموجة (قيم الكتابة قبل الحفظ) */
function doneIn(x, I) {
  const v = I[x.k];
  if (x.type === 'pair') return !!(v && (v.a || '').trim() && (v.b || '').trim());
  if (x.type === 'many') return Array.isArray(v) && v.length > 0;
  if (x.type === 'yn') return v === 'n' || (v === 'y' && !!String(I.s9x || '').trim());
  if (x.other && v === x.other) return !!String(I[x.k + 'x'] || '').trim();
  return !!(v && String(v).trim());
}
function partsIn(d) {
  const pro = d.pro || {}, pl = d.plats || {};
  const pres = !!((d.web || '').trim() || DPLAT.some(([k]) => pl[k] && pl[k].on && String(pl[k].handle || '').trim()) || d.none);
  const cont = !!(String(pro.email || '').trim() || String(pro.phone || '').trim());
  return { pres, cont };
}

const syncHtml = () => document.documentElement.classList.toggle('ik-open', !!(ui.ikOpen || ui.scanOpen));

/* ---------- واجهة الأوامر ---------- */
/** يفتح بطاقة المشروع. بلا رقم خطوة: أول قسم فيه معلومة مطلوبة ناقصة (كالأصل) */
export function openIntake(step) {
  if (!S) return;
  IK.from = ui.view; IK.gate = null;
  let st = +step;
  if (!st || st < 1 || st > IK_SECS.length) { const first = INTAKE.find((x) => x.req && !doneIn(x, S.intake || {})); st = first ? first.sec : (ui.ikStep || 1); }
  setUI({ ikOpen: true, ikStep: st });
  syncHtml();
}

/** يغلق البطاقة بعد حفظ ما كُتب */
export function closeIntake() {
  flushPend();
  setUI({ ikOpen: false });
  syncHtml();
  flush();
}

/* ikClose: احفظ وأغلق */
function ikClose() {
  flushPend();
  if (S && !RO) patch({ intake: clone(S.intake || {}) }, { now: true, silent: true });
  IK.gate = null;
  closeIntake();
}

/* ikFinish مع بوابة digital.js */
function ikFinish() {
  if (!S) return;
  flushPend();
  const g = IK.gate; IK.gate = null; if (g) IK.from = 'gate';
  const I = S.intake || {};
  if (!RO) {
    const p = {};
    if (I.s10 && !fget('1_3', '1').name) p.fill = { '1_3': { '1': { name: I.s10 } } };
    if (Object.keys(p).length) patch(p, { silent: true });
    patch({ intake: clone(I) }, { now: true, silent: true });
  }
  const n = ikCount(), from = IK.from;
  closeIntake();
  toast(n === 11 ? 'اكتملت بطاقة المشروع. جملة التعريف تتصدّر الطاولة الآن.' : `حُفظت البطاقة (${n} من ١١). يمكنك إكمالها لاحقاً من أيقونة البطاقة في الطاولة.`, n === 11 ? 'gold' : '');
  if (n === 11) SND.play('gold');
  if (from === 'start') go('play');
  if (g) {
    if (!reqMissing().length && digitalDone()) setTimeout(g, 300);
    else toast('ما زالت هناك معلومات مطلوبة في ملف المشروع.', 'err');
  }
}

/* gateFill: يفتح البطاقة على أول خطوة ناقصة في وضع البوابة */
function gateFill(onDone) {
  closeModal();
  const m = reqMissing();
  openIntake(m.length ? m[0].sec : 4);
  IK.gate = typeof onDone === 'function' ? onDone : () => {};
}

/** بوابة إنشاء لوحة المتابعة: true إن اكتملت المعلومات المطلوبة والحضور الرقمي والتواصل.
 *  وإلا يعرض نافذة «أكملوا ملف المشروع أولاً» (كالأصل) ثم يفتح البطاقة، ويستدعي onDone بعد إكمالها، ويعيد false.
 *  { direct:true } يتخطى النافذة ويفتح البطاقة مباشرة. */
export function requireCompletion(onDone, { direct = false } = {}) {
  if (!S) return false;
  if (!reqMissing().length && digitalDone()) return true;
  closeModal(); closeDrawer();
  if (direct) { toast('أكملوا ملف المشروع أولاً', 'err'); gateFill(onDone); }
  else openModal(<GateModal onDone={onDone} />);
  return false;
}

function GateModal({ onDone }) {
  useEngine();
  const miss = reqMissing(), P = digitalParts();
  return (
    <>
      <h3><Icon name="clipboard-list" /> أكملوا ملف المشروع أولاً</h3>
      <div className="mb">
        <p>لوحة المتابعة والتقارير تُبنى على وقائع المشروع وحضوره الرقمي. قبل إنشائها أكملوا:</p>
        <ul className="ls-ol">
          {miss.map((x) => <li key={x.k}>{x.t}</li>)}
          {!P.pres && <li>رابط الموقع أو حساب تواصل واحد على الأقل، أو «لا يوجد حضور رقمي بعد»</li>}
          {!P.cont && <li>البريد الرسمي أو رقم التواصل</li>}
        </ul>
      </div>
      <div className="mf">
        <button className="btn" onClick={closeModal}>لاحقاً</button>
        <button className="btn gold" onClick={() => gateFill(onDone)}><Icon name="clipboard-list" /> أكمل ملف المشروع</button>
      </div>
    </>
  );
}

/* ---------- المكوّن العام ---------- */
export default function IntakeOverlay() {
  useEngine();
  useEffect(() => {
    // Escape يحفظ ويغلق (ما لم تكن نافذة أو درج مفتوحاً فوقها)
    const k = (e) => { if (e.key === 'Escape' && ui.ikOpen && !isModalOpen() && !isDrawerOpen()) ikClose(); };
    document.addEventListener('keydown', k, true);
    return () => document.removeEventListener('keydown', k, true);
  }, []);
  // أُغلقت الجلسة والبطاقة مفتوحة: أغلقها لئلا يبقى تمرير الصفحة مقفلاً
  useEffect(() => { if (ui.ikOpen && !S) closeIntake(); });
  if (!ui.ikOpen || !S) return null;
  return <IntakeBody key={CODE} />;
}

/* renderIntake */
function IntakeBody() {
  const root = useRef(null);
  const [draft, setDraft] = useState({}); // قيم الحقول المكتوبة قبل الحفظ المؤجّل
  const [dgDraft, setDgDraft] = useState({}); // path -> value للحضور الرقمي
  const [focus, setFocus] = useState(null);

  const I = { ...((S && S.intake) || {}), ...draft };
  const D = clone((S && S.digital) || {});
  Object.entries(dgDraft).forEach(([p, v]) => deepMerge(D, nest(p, v)));
  const DP = partsIn(D);
  const n = INTAKE.filter((x) => doneIn(x, I)).length;
  const secDone = (sn) => INTAKE.filter((x) => x.sec === sn && doneIn(x, I)).length;
  const miss = INTAKE.filter((x) => x.req && !doneIn(x, I));
  const st = Math.min(Math.max(+ui.ikStep || 1, 1), IK_SECS.length), sec = IK_SECS[st - 1], last = st === IK_SECS.length;

  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    const top = el.querySelector('.ik-top');
    el.style.setProperty('--ikh', (top ? top.offsetHeight : 170) + 'px');
  });
  useEffect(() => {
    const el = root.current;
    const fit = () => { const top = el && el.querySelector('.ik-top'); if (top) el.style.setProperty('--ikh', top.offsetHeight + 'px'); };
    window.addEventListener('resize', fit);
    const t = setTimeout(() => { const i = el && el.querySelector('.ikc:not(.done) input'); i && i.focus({ preventScroll: true }); }, 80);
    return () => { window.removeEventListener('resize', fit); clearTimeout(t); };
  }, []);

  /* ikSet */
  const typeIk = (k, v) => { if (RO) return; setDraft((d) => ({ ...d, [k]: v })); setFocus(k.replace(/x$/, '')); later('ik:' + k, { intake: { [k]: v } }); };
  const setNow = (k, v) => {
    if (RO) return; cancel('ik:' + k);
    setDraft((d) => { if (!(k in d)) return d; const c = { ...d }; delete c[k]; return c; });
    setFocus(k.replace(/x$/, '')); patch({ intake: { [k]: v } }, { silent: true });
  };
  /* dgSet */
  const typeDg = (path, v) => { if (RO) return; setDgDraft((d) => ({ ...d, [path]: v })); later('dg:' + path, { digital: nest(path, v) }); };
  const dgNow = (path, v) => {
    if (RO) return; cancel('dg:' + path);
    setDgDraft((d) => { if (!(path in d)) return d; const c = { ...d }; delete c[path]; return c; });
    patch({ digital: nest(path, v) }, { silent: true });
  };

  const focusLater = (id) => setTimeout(() => { const i = document.getElementById(id); i && i.focus(); }, 30);
  const goStep = (nn) => { if (nn < 1 || nn > IK_SECS.length) return; setFocus(null); setUI({ ikStep: nn }); if (root.current) root.current.scrollTop = 0; };
  const ikPick = (x, v) => {
    const k = x.k; setNow(k, I[k] === v && k !== 's9' ? '' : v); SND.play('select');
    if ((k === 's9' && v === 'y') || x.other === v) focusLater('ik_' + k + 'x');
  };
  const ikMany = (x, v) => {
    const k = x.k; let a = Array.isArray(I[k]) ? I[k].slice() : [];
    a = a.includes(v) ? a.filter((y) => y !== v) : [...a, v];
    if (v === 'لا قيود واضحة') a = a.includes(v) ? [v] : []; else a = a.filter((y) => y !== 'لا قيود واضحة');
    setNow(k, a); SND.play('select');
  };
  const onF = (k) => () => setFocus(k.replace(/x$/, ''));

  /* ikQ */
  const ikQ = (x) => {
    const v = I[x.k], done = doneIn(x, I);
    let b = null;
    if (x.type === 'pair') {
      const set = (f) => (e) => typeIk(x.k, { ...(I[x.k] || {}), [f]: e.target.value });
      b = (<>
        <div className="ik-sent">
          <span>{x.a}</span><input className="inp" id={'ik_' + x.k + '_a'} value={(v || {}).a || ''} placeholder="ماذا تقدّمون؟" disabled={RO} onChange={set('a')} onFocus={onF(x.k)} />
          <span>{x.b}</span><input className="inp" id={'ik_' + x.k + '_b'} value={(v || {}).b || ''} placeholder="لمن؟" disabled={RO} onChange={set('b')} onFocus={onF(x.k)} />
        </div>
        {x.ex ? <p className="ik-ex"><b>مثال:</b> {x.ex}</p> : null}
      </>);
    } else if (x.type === 'one') {
      b = (<>
        <div className={'ik-tiles' + (x.o.length > 6 ? ' many' : '')}>
          {x.o.map((o) => <button key={o} type="button" className={v === o ? 'on' : ''} aria-pressed={v === o} disabled={RO} onClick={() => ikPick(x, o)}>{o}</button>)}
        </div>
        {x.other && v === x.other ? <input className="inp" id={'ik_' + x.k + 'x'} value={I[x.k + 'x'] || ''} placeholder={'اكتب ' + x.t} style={{ marginTop: 8 }} disabled={RO} onChange={(e) => typeIk(x.k + 'x', e.target.value)} onFocus={onF(x.k)} /> : null}
      </>);
    } else if (x.type === 'many') {
      b = (<div className="ik-tiles">
        {x.o.map((o) => { const on = Array.isArray(v) && v.includes(o); return <button key={o} type="button" className={on ? 'on' : ''} aria-pressed={on} disabled={RO} onClick={() => ikMany(x, o)}>{on ? '✓ ' : ''}{o}</button>; })}
      </div>);
    } else if (x.type === 'text') {
      b = <input className="inp" id={'ik_' + x.k} value={v || ''} placeholder="اسم المنافس" disabled={RO} onChange={(e) => typeIk(x.k, e.target.value)} onFocus={onF(x.k)} />;
    } else if (x.type === 'yn') {
      b = (<>
        <div className="ik-yn">
          {[['y', x.y, x.yd], ['n', x.n, x.nd]].map(([k, t, d]) => (
            <button key={k} type="button" className={v === k ? 'on' : ''} aria-pressed={v === k} disabled={RO} onClick={() => ikPick(x, k)}><b>{t}</b><small>{d}</small></button>
          ))}
        </div>
        {v === 'y' ? <div className="ik-name"><span className="chip gold">★ قرار ذهبي</span><input className="inp" id="ik_s9x" value={I.s9x || ''} placeholder="اسم العلامة المحسوم" disabled={RO} onChange={(e) => typeIk('s9x', e.target.value)} onFocus={onF('s9x')} /></div> : null}
      </>);
    }
    const hint = x.hint || ikHelp[x.k] || x.note || '';
    return (
      <article key={x.k} className={'ikc' + (done ? ' done' : '')} data-q={x.k}>
        <div className="ikc-h"><span className="n">{done ? '✓' : x.no}</span><div><h3>{x.t}</h3>{hint ? <p>{hint}</p> : null}</div><span className="req">{x.req ? 'مطلوب' : 'اختياري'}</span></div>
        {b}
      </article>
    );
  };

  return (
    <div id="ikx" className="ikx" role="dialog" aria-modal="true" aria-label="بطاقة المشروع" ref={root}>
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="ik-top"><div className="wrap">
        <div className="ik-bar">
          <span className="brandmk"><img src={LOGO} alt="" /><span>بطاقة المشروع<small>{S.brand}</small></span></span>
          <span className="ik-prog"><span className="meter"><i style={{ width: (n / 11 * 100) + '%' }} /></span><b className="num">{n}/11</b><small>{n === 11 ? 'مكتملة' : 'محفوظة تلقائياً'}</small></span>
          <button className="btn sm" onClick={ikClose}><Icon name="check" /> احفظ وأغلق</button>
        </div>
        <nav className="ik-steps">
          {IK_SECS.map((s) => {
            const tot = s.n === 4 ? 2 : INTAKE.filter((x) => x.sec === s.n).length;
            const d = s.n === 4 ? (DP.pres ? 1 : 0) + (DP.cont ? 1 : 0) : secDone(s.n);
            return (
              <button key={s.n} className={[s.n === st && 'on', d === tot && 'ok'].filter(Boolean).join(' ')} style={{ '--k': s.k }} onClick={() => goStep(s.n)}>
                <span className="sn">{d === tot ? '✓' : AR(s.n)}</span><span><b>{s.t}</b><small>{s.sub} · {AR(d)}/{AR(tot)}</small></span>
              </button>
            );
          })}
        </nav>
      </div></header>
      <div className="wrap ik-body">
        <section className="ik-qs" style={{ '--k': sec.k }}>
          <div className="ik-sh"><span className="eyebrow">الخطوة {AR(st)} من {AR(IK_SECS.length)}</span><h2>{sec.t}</h2><p>{sec.sub}. ليست قرارات، بل وقائع تجعل الطاولة كلها تلعب على أرض واحدة.</p></div>
          {st === 4 ? <DigitalStep D={D} P={DP} typeDg={typeDg} dgNow={dgNow} /> : INTAKE.filter((x) => x.sec === st).map(ikQ)}
          <div className="ik-nav">
            <button className="btn big ghost" disabled={st === 1} onClick={() => goStep(st - 1)}><Icon name="chevron-right" /> السابق</button>
            {last ? (
              <span className="ik-end">
                {!DP.pres || !DP.cont ? <small>الحضور الرقمي: {!DP.pres ? 'رابط أو حساب أو «لا يوجد بعد»' : ''}{!DP.pres && !DP.cont ? ' · ' : ''}{!DP.cont ? 'البريد أو الجوال' : ''}</small> : null}
                {miss.length ? <small>باقي {AR(miss.length)} معلومات مطلوبة: {miss.map((x) => x.t).join('، ')}</small> : null}
                <button className="btn gold big" onClick={ikFinish}><Icon name="check" /> {IK.from === 'start' ? 'احفظ البطاقة وادخل الطاولة' : 'احفظ البطاقة'}</button>
              </span>
            ) : (
              <button className="btn pri big" onClick={() => goStep(st + 1)}>التالي: {IK_SECS[st].t} <Icon name="chevron-left" /></button>
            )}
          </div>
        </section>
        <aside className="ik-prev" aria-label="معاينة بطاقة المشروع"><IkPreview I={I} n={n} focus={focus} /></aside>
      </div>
    </div>
  );
}

/* ikRow */
function IkRow({ l, v, k, focus }) {
  const e = !v || !String(v).trim();
  return <div className={'pp-r' + (focus === k ? ' hl' : '')}><dt>{l}</dt><dd className={e ? 'ppb' : ''}>{e ? '' : v}</dd></div>;
}

/* ikPreview: المعاينة الورقية الحيّة */
function IkPreview({ I, n, focus }) {
  const s1 = I.s1 || {}, L = 2 * Math.PI * 17;
  const R = (l, v, k) => <IkRow l={l} v={v} k={k} focus={focus} />;
  return (
    <div className="paper">
      <div className="pp-h">
        <img src={LOGO} alt="" /><div><small>بطاقة المشروع</small><b>{S.brand}</b></div>
        <span className="pp-ring" title={`${n} من ١١`}>
          <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" stroke="var(--paperLine)" /><circle cx="20" cy="20" r="17" stroke={n === 11 ? '#1F7D63' : '#D9A63A'} strokeDasharray={L} strokeDashoffset={L * (1 - n / 11)} /></svg>
          <span>{n}<small>/11</small></span>
        </span>
      </div>
      <p className={'pp-def' + (focus === 's1' ? ' hl' : '')}>نحن نقدّم «<i className={s1.a ? '' : 'blank'}>{s1.a || ''}</i>» لـ«<i className={s1.b ? '' : 'blank'}>{s1.b || ''}</i>»</p>
      <dl>
        {R('القطاع', I.s2 === 'أخرى' ? I.s2x : I.s2, 's2')}{R('المرحلة', I.s3, 's3')}{R('ماذا نبيع', I.s4, 's4')}{R('لمن نبيع', I.s5, 's5')}{R('سعرنا مقارنة بالسوق', I.s6, 's6')}{R('النطاق الجغرافي', I.s7, 's7')}{R('دافع الجلسة', I.s8, 's8')}
        {R('الاسم', I.s9 === 'y' ? ('★ ' + (I.s9x || '')) : I.s9 === 'n' ? 'سيُولَّد في الجلسة' : '', 's9')}{R('أبرز منافس', I.s10, 's10')}{R('القيود', Array.isArray(I.s11) ? I.s11.join('، ') : '', 's11')}
      </dl>
      <p className="pp-f">جملة التعريف تتصدّر الطاولة طوال الجلسة، ويُرجع إليها عند كل خلاف.</p>
    </div>
  );
}

/* ---------- الخطوة الرابعة: الحضور الرقمي (digitalStepHTML) ---------- */
function DigitalStep({ D, P, typeDg, dgNow }) {
  const pl = D.plats || {};
  /* dgIn */
  const dgIn = (path, ph, o = {}) => {
    const v = getPath(D, path);
    return <input className="inp" value={v == null ? '' : String(v)} placeholder={ph || ''} type={o.type || undefined} dir={o.ltr ? 'ltr' : undefined} inputMode={o.num ? 'decimal' : undefined} disabled={RO} onChange={(e) => typeDg(path, e.target.value)} />;
  };
  return (
    <>
      <article className={'ikc' + (P.pres ? ' done' : '')}>
        <div className="ikc-h"><span className="n">{P.pres ? '✓' : '١٢'}</span><div><h3>الموقع والمتجر</h3><p>روابط تظهر في لوحة المتابعة وتُبنى عليها تقارير المنصات.</p></div><span className="req">مطلوب واحد على الأقل</span></div>
        <div className="formgrid">
          <label className="fld">الموقع الإلكتروني{dgIn('web', 'brand.sa', { ltr: 1 })}</label>
          <label className="fld">المتجر الإلكتروني (سلة، زد، نون…){dgIn('store', 'store.brand.sa', { ltr: 1 })}</label>
        </div>
      </article>
      <article className="ikc">
        <div className="ikc-h"><span className="n">١٣</span><div><h3>حسابات التواصل</h3><p>فعّلوا المنصات الموجودة، وأدخلوا المعرّف وأرقام اليوم. تصبح خط الأساس لتقارير المنصات.</p></div><span className="req">اختياري</span></div>
        <div className="dplats">
          {DPLAT.map(([k, nm, c, base, ab]) => {
            const p = pl[k] || {};
            return (
              <div key={k} className={'dpl' + (p.on ? ' on' : '')} style={{ '--pc': c }}>
                <button type="button" className="dpl-t" aria-pressed={!!p.on} disabled={RO} onClick={() => dgNow('plats.' + k + '.on', !p.on)}>
                  <span className="pi">{ab}</span><b>{nm}</b><span className={'sw2' + (p.on ? ' on' : '')} />
                </button>
                {p.on ? (
                  <div className="dpl-f">
                    {dgIn('plats.' + k + '.handle', base ? '@المعرّف أو الرابط' : 'رابط الموقع على الخرائط', { ltr: 1 })}
                    <div className="dpl-n">
                      <label>المتابعون{dgIn('plats.' + k + '.fol', '0', { num: 1, ltr: 1 })}</label>
                      <label>منشورات/أسبوع{dgIn('plats.' + k + '.ppw', '0', { num: 1, ltr: 1 })}</label>
                      <label>التفاعل ٪{dgIn('plats.' + k + '.eng', '0', { num: 1, ltr: 1 })}</label>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <label className="consent" style={{ marginTop: 6 }}><input type="checkbox" checked={!!D.none} disabled={RO} onChange={(e) => dgNow('none', e.target.checked)} /> لا يوجد حضور رقمي بعد (علامة قيد الإطلاق)</label>
      </article>
      <article className={'ikc' + (P.cont ? ' done' : '')}>
        <div className="ikc-h"><span className="n">{P.cont ? '✓' : '١٤'}</span><div><h3>البيانات الاحترافية</h3><p>تظهر في غلاف الوثيقة وتُستخدم في التواصل بخصوص المشروع.</p></div><span className="req">البريد أو الجوال مطلوب</span></div>
        <div className="formgrid">
          <label className="fld">البريد الرسمي{dgIn('pro.email', 'info@brand.sa', { ltr: 1, type: 'email' })}</label>
          <label className="fld">رقم التواصل{dgIn('pro.phone', '05XXXXXXXX', { ltr: 1, type: 'tel' })}</label>
          <label className="fld">المدينة والعنوان{dgIn('pro.city', 'الرياض')}</label>
          <label className="fld">سنة التأسيس أو الإطلاق{dgIn('pro.year', '2026', { ltr: 1, num: 1 })}</label>
          <label className="fld">السجل التجاري (اختياري){dgIn('pro.cr', '', { ltr: 1 })}</label>
          <label className="fld">رابط ملفات الهوية (اختياري){dgIn('pro.assets', 'drive / dropbox', { ltr: 1 })}</label>
        </div>
      </article>
    </>
  );
}
