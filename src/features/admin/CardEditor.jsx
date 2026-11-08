/* محرّر البطاقة مع معاينة حيّة (cardEditor · ansRow · eqSync · cardPreview) */
import React, { useEffect, useMemo, useState } from 'react';
import { DOCSECS, N, PRISTINE, STAGES, TRACKS, clone, cmsG } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { ADM, admSet, useAdm } from './store.js';
import { AdmHead, Boundary, Opts, Tog, askConfirm } from './parts.jsx';
import { ICON_KEYS, cardDel, cardReset, cardSave, eqPreviewQ, fillRow, optRow } from './logic.js';
import { QuestionCard, CardTop } from '../play/QuestionCard.jsx';

const FTYPE = { lines: 'أسطر كتابة', pestle: 'PESTLE', comp: 'منافسون', fields: 'حقول', prod: 'منتجات', swot: 'SWOT', scales: 'مقاييس', tagline: 'شعار لفظي', matrix: 'مصفوفة', ntype: 'نوع الاسم', domains: 'نطاقات' };

/** تحديث نسخة البطاقة قيد التحرير */
const upd = (fn) => { if (!ADM.eq) return; const n = clone(ADM.eq); fn(n); admSet({ eq: n }); };

/* المعاينة الحيّة: تتأخر ٢٠٠ مللي ثانية عن الكتابة كما في الأصل */
function CardPreview({ E }) {
  const [pv, setPv] = useState(E);
  useEffect(() => { const t = setTimeout(() => setPv(E), 200); return () => clearTimeout(t); }, [E]);
  const q = eqPreviewQ(pv);
  const vars = { '--c': q.s.c, '--ci': q.s.ci };
  return (
    <Boundary k={pv} fallback={() => <p className="empty">تعذّرت المعاينة.</p>}>
      <div className="qslot" style={vars}><QuestionCard q={q} /></div>
      {q.type === 'opt' ? (
        <div className="pv-ans">
          {q.ans.filter((a) => !a.spare).map((a, i) => (
            <div key={i} className="acard" style={vars}><CardTop q={q} a={a} /><span className="art"><Icon name={a.ic || 'circle-help'} /></span><b>{a.t || '—'}</b><small>{a.d || ''}</small></div>
          ))}
        </div>
      ) : null}
    </Boundary>
  );
}

function AnsRow({ a, i, type, iconOpts }) {
  const set = (f) => (e) => { const v = e.target.value; upd((n) => { const x = n.d.ans[i]; if (x) x[f] = f === 'rows' ? (v === '' ? '' : +v) : v; }); };
  const del = <button className="ibtn" onClick={() => upd((n) => { n.d.ans.splice(i, 1); })} aria-label="حذف"><Icon name="trash-2" /></button>;
  const mv = <button className="ibtn" onClick={() => upd((n) => { if (i > 0) { const t = n.d.ans[i - 1]; n.d.ans[i - 1] = n.d.ans[i]; n.d.ans[i] = t; } })} aria-label="أعلى"><Icon name="arrow-up" /></button>;
  if (type === 'opt') {
    return (
      <div className="ansrow">
        <span className="codechip">{a.k}</span>
        <div className="formgrid">
          <label className="fld">الإجابة<input className="inp" value={a.t || ''} onChange={set('t')} /></label>
          <label className="fld">الأيقونة<select className="inp" value={a.ic || ''} onChange={set('ic')}>{iconOpts}</select></label>
          <label className="fld full">الوصف على البطاقة<input className="inp" value={a.d || ''} onChange={set('d')} /></label>
          <label className="fld full">الشرح الموسّع (في الدرس وللوكيل)<textarea className="inp" rows={2} value={a.x || ''} onChange={set('x')} /></label>
        </div>
        <span className="ra">{i ? mv : null}{del}</span>
      </div>
    );
  }
  return (
    <div className="ansrow">
      <span className="codechip">{a.k}</span>
      <div className="formgrid">
        <label className="fld">عنوان الحقل<input className="inp" value={a.head ?? a.t ?? ''} onChange={set('head')} /></label>
        <label className="fld">نوع الحقل<input className="inp" value={FTYPE[a.f] || a.f || ''} disabled /></label>
        {a.f === 'lines' ? (
          <>
            <label className="fld full">التوجيه للكتابة<input className="inp" value={a.prompt || ''} onChange={set('prompt')} /></label>
            <label className="fld">عدد الأسطر<input className="inp" type="number" min="2" max="20" dir="ltr" value={a.rows ?? 6} onChange={set('rows')} /></label>
          </>
        ) : <p className="mini-note full">هذا حقل مركّب من تصميم اللعبة: يمكن تعديل عنوانه فقط.</p>}
      </div>
      <span className="ra">{a.f === 'lines' ? del : null}</span>
    </div>
  );
}

export default function CardEditor() {
  useEngine(); useAdm();
  const iconOpts = useMemo(() => ICON_KEYS().map((k) => <option key={k} value={k}>{k}</option>), []);
  const E = ADM.eq; if (!E) return null;
  const s = STAGES[E.n - 1], d = E.d;
  const Pq = PRISTINE.stages[E.n - 1].qs.find((q) => q.no === E.no);
  const setD = (k) => (e) => {
    const v = e.target.value;
    upd((n) => {
      if (k.startsWith('g.')) n.d.g[k.slice(2)] = v; else n.d[k] = k === 'max' ? +v : v;
      if (k === 'type') n.d.ans = v === 'opt' ? [optRow('1'), optRow('2')] : [fillRow('1')];
    });
  };
  const setM = (k) => (e) => { const v = e.target.value; upd((n) => { n.m[k] = v; }); };
  const ansAdd = () => upd((n) => { const ks = n.d.ans.map((a) => +a.k).filter((x) => !isNaN(x)); const k = String((ks.length ? Math.max(...ks) : 0) + 1); n.d.ans.push(n.d.type === 'opt' ? optRow(k) : fillRow(k)); });
  const changed = !E.isNew && (cmsG().cards || {})[E.id];
  return (
    <>
      <AdmHead t={<>{E.fresh ? 'بطاقة جديدة' : 'تعديل البطاقة'} <span className="codechip">Q{E.n}.{E.no}</span></>} sub={`محور «${s.name}»${E.isNew ? ' · بطاقة مضافة' : ''}`}>
        <button className="btn ghost" onClick={() => admSet({ eq: null })}><Icon name="chevron-right" /> البطاقات</button>
        {changed ? <button className="btn ghost" onClick={() => askConfirm('استعادة البطاقة كما في اللعبة الأصلية؟ تُحذف تعديلاتها.', () => cardReset(E.id))}><Icon name="undo-2" /> استعادة الأصل</button> : null}
        {E.isNew && !E.fresh ? <button className="btn ghost" onClick={() => askConfirm('حذف هذه البطاقة المضافة نهائياً؟', () => cardDel(E.id))} style={{ color: 'var(--danger)' }}><Icon name="trash-2" /> حذف</button> : null}
        <button className="btn pri" onClick={cardSave}><Icon name="check" /> احفظ البطاقة</button>
      </AdmHead>
      <div className="ced">
        <div className="ced-f">
          <Panel title="وجه البطاقة">
            <div className="formgrid">
              <label className="fld">الاسم المختصر (على اللوحة) *<input className="inp" value={d.slot} onChange={setD('slot')} maxLength={40} /></label>
              <label className="fld">عنوان البطاقة<input className="inp" value={d.t} onChange={setD('t')} /></label>
              <label className="fld">السؤال على البطاقة<input className="inp" value={d.sub} onChange={setD('sub')} placeholder="مثال: في أيّ مرحلة سوقك؟" /></label>
              <label className="fld">عنوان منطقة الإجابات<input className="inp" value={d.head} onChange={setD('head')} placeholder="اختياري، يُستخدم السؤال إن تُرك فارغاً" /></label>
              <label className="fld">وسم صغير فوق العنوان<input className="inp" value={d.tag} onChange={setD('tag')} /></label>
              <label className="fld">الأيقونة<select className="inp" value={d.ic} onChange={setD('ic')}>{iconOpts}</select></label>
              <label className="fld full">ملاحظة على البطاقة<input className="inp" value={d.note} onChange={setD('note')} /></label>
              {E.fresh ? (
                <label className="fld">نوع البطاقة<select className="inp" value={d.type} onChange={setD('type')}><option value="opt">اختيار من إجابات</option><option value="fill">تعبئة كتابية</option></select></label>
              ) : <div className="fld">نوع البطاقة<span className="chip">{d.type === 'opt' ? 'اختيار من إجابات' : 'تعبئة كتابية'}</span></div>}
              {d.type === 'opt' ? <label className="fld">عدد الإجابات المسموح<select className="inp" value={String(+d.max || 1)} onChange={setD('max')}>{[1, 2, 3].map((n) => <option key={n} value={String(n)}>{n}</option>)}</select></label> : null}
            </div>
            <div className="tgs"><Tog id="eGold" on={d.gold} onChange={(x) => upd((n) => { n.d.gold = x; })} lbl="بطاقة ذهبية" sub="لا توضع ولا تُقلب إلا بإجماع الطاولة" /></div>
          </Panel>
          <Panel title={d.type === 'opt' ? 'الإجابات' : 'حقول الكتابة'} sub={d.type === 'opt' ? 'رمز كل إجابة يُطبع على البطاقة (Q' + E.no + '.1، Q' + E.no + '.2…) وتقرؤه المنصة من الصور.' : ''}>
            <div className="ansl">{d.ans.map((a, i) => (a.spare ? null : <AnsRow key={i} a={a} i={i} type={d.type} iconOpts={iconOpts} />))}</div>
            <button className="btn sm" onClick={ansAdd}><Icon name="plus" /> {d.type === 'opt' ? 'أضف إجابة' : 'أضف حقل كتابة'}</button>
          </Panel>
          <Panel title="دليل المنشّط" sub="يظهر في درس البطاقة ويقرؤه وكيلها.">
            <div className="formgrid">
              <label className="fld full">لماذا تهم هذه البطاقة؟<textarea className="inp" rows={2} value={d.g.why} onChange={setD('g.why')} /></label>
              <label className="fld full">الفخ الشائع<textarea className="inp" rows={2} value={d.g.trap} onChange={setD('g.trap')} /></label>
            </div>
          </Panel>
          <Panel title={<><Icon name="file-text" /> الربط بالمخرجات النهائية</>} sub="أين يذهب قرار هذه البطاقة في وثيقة المشروع ومن ينفّذه.">
            <div className="formgrid">
              <label className="fld full">المخرج<input className="inp" value={E.m.out} onChange={setM('out')} placeholder="مثال: مرحلة واحدة: ناشئ، نمو، ناضج، منحدر" /></label>
              <label className="fld full">كيف يُستخدم<textarea className="inp" rows={2} value={E.m.use} onChange={setM('use')} /></label>
              <label className="fld">من يقود<input className="inp" value={E.m.lead} onChange={setM('lead')} /></label>
              <label className="fld">من يقرّر<input className="inp" value={E.m.decide} onChange={setM('decide')} /></label>
            </div>
            <div className="fld">يستلمه للتنفيذ<Opts id="eRecv" items={Object.entries(TRACKS).map(([k, t]) => [k, t.n])} sel={E.m.recv || []} onChange={(recv) => upd((n) => { n.m.recv = recv; })} /></div>
            <div className="fld">أقسام الوثيقة<Opts id="eSecs" items={DOCSECS.map((x, i) => [i + 1, N(i + 1) + '. ' + x.t])} sel={E.m.secs || []} onChange={(secs) => upd((n) => { n.m.secs = secs; })} /></div>
          </Panel>
          <Panel title={<><Icon name="wand-sparkles" /> وكيل البطاقة</>} sub="وكيل ذكي يقيّم قرار الطاولة على هذه البطاقة ويقترح تطويره.">
            <div className="tgs"><Tog id="eAgOn" on={!E.ag.off} onChange={(x) => upd((n) => { n.ag.off = !x; })} lbl="الوكيل مفعّل" /></div>
            <label className="fld">تعليمات خاصة لهذا الوكيل<textarea className="inp" rows={3} id="eAgX" value={E.ag.extra} onChange={(e) => { const v = e.target.value; upd((n) => { n.ag.extra = v; }); }} placeholder="مثال: ركّز على السوق السعودي واستشهد ببيانات الهيئة العامة للإحصاء عند الحاجة" /></label>
          </Panel>
        </div>
        <aside className="ced-p">
          <div className="pv-h">معاينة حيّة</div>
          <div id="cedPv"><CardPreview E={E} /></div>
          {!E.isNew && Pq ? <p className="mini-note">الأصل: «{Pq.slot}» · {N(Pq.ans.length)} {Pq.type === 'opt' ? 'إجابات' : 'حقول'}</p> : null}
        </aside>
      </div>
    </>
  );
}
