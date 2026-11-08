/* الإعدادات (admSettings · setSave · النسخ الاحتياطي) */
import React, { useState } from 'react';
import { cmsS, flag, reviewMax } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { Icon } from '../../../ui/Icon.jsx';
import { Panel } from '../../../ui/Panel.jsx';
import { need, useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr, Tog, askConfirm } from '../parts.jsx';
import { bkExport, bkImport, cmsReset, setSave } from '../logic.js';

const TIMERS = [[120, 'دقيقتان'], [180, '٣ دقائق'], [300, '٥ دقائق']];

export default function Settings() {
  useEngine();
  const { v: D, err, rev } = useLoad(() => need('plans'));
  if (err) return <LoadErr e={err} />;
  if (!D) return <Loading />;
  return <SettingsBody key={rev} plans={D.plans || []} />;
}

function SettingsBody({ plans }) {
  const [v, setV] = useState(() => {
    const s = cmsS(), b = s.biz || {}, c = s.contact || {}, d = s.design || {};
    const tm = +d.timer || 180, rv = reviewMax();
    return {
      register: flag('register'), consult: flag('consult'), enforce: flag('enforce'),
      currency: b.currency || 'ر.س', vat: b.vat ?? 15, freePlan: plans.some((p) => p.id === b.freePlan) ? b.freePlan : '', pay: b.pay || '',
      timer: String(TIMERS.some((x) => x[0] === tm) ? tm : TIMERS[0][0]), review: String([1, 2, 3].includes(rv) ? rv : 1),
      wa: c.wa || '', email: c.email || '', hours: c.hours || '',
    };
  });
  const set = (k) => (e) => { const x = e.target.value; setV((o) => ({ ...o, [k]: x })); };
  const tg = (k) => (x) => setV((o) => ({ ...o, [k]: x }));
  const reset = () => askConfirm('ستعود المحاور والبطاقات وكروت التعارض إلى المحتوى الأصلي للعبة، وتُحذف البطاقات المضافة. متابعة؟', cmsReset);
  return (
    <>
      <AdmHead t="الإعدادات" sub="تشغيل الميزات وإيقافها، والاشتراكات، والتواصل، والنسخ الاحتياطي."><button className="btn pri" onClick={() => setSave(v)}><Icon name="check" /> احفظ الإعدادات</button></AdmHead>
      <Panel title={<><Icon name="cog" /> الميزات العامة</>} sub="الإيقاف هنا يخفي الميزة عن كل المستخدمين فوراً.">
        <div className="tgs">
          <Tog id="fl_register" on={v.register} onChange={tg('register')} lbl="التسجيل الجديد مفتوح" sub="عند الإغلاق لا يستطيع منشّط جديد إنشاء حساب" />
          <Tog id="fl_consult" on={v.consult} onChange={tg('consult')} lbl="حجز المستشارين" />
          <Tog id="fl_enforce" on={v.enforce} onChange={tg('enforce')} lbl="فرض الباقات" sub="إنشاء الجلسات والميزات حسب باقة المنشّط" />
        </div>
        <p className="mini-note">ميزات الذكاء الاصطناعي تُدار من قسم «وكلاء الذكاء الاصطناعي».</p>
      </Panel>
      <Panel title={<><Icon name="badge-dollar-sign" /> الاشتراكات والفوترة</>}>
        <div className="formgrid">
          <label className="fld">العملة<input className="inp" id="bzC" value={v.currency} onChange={set('currency')} /></label>
          <label className="fld">ضريبة القيمة المضافة ٪<input className="inp" id="bzV" type="number" min="0" dir="ltr" value={v.vat} onChange={set('vat')} /></label>
          <label className="fld">الباقة الافتراضية لمن لا اشتراك له<select className="inp" id="bzF" value={v.freePlan} onChange={set('freePlan')}><option value="">لا شيء (لا ميزات عند الفرض)</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="fld">تعليمات الدفع للعملاء<input className="inp" id="bzPay" value={v.pay} onChange={set('pay')} placeholder="مثال: تحويل بنكي، يرسل الفريق الفاتورة" /></label>
        </div>
      </Panel>
      <Panel title={<><Icon name="clock-3" /> قواعد اللعب</>}>
        <div className="formgrid">
          <label className="fld">مؤقت البطاقة الافتراضي<select className="inp" id="dsT" value={v.timer} onChange={set('timer')}>{TIMERS.map(([x, t]) => <option key={x} value={String(x)}>{t}</option>)}</select></label>
          <label className="fld">حدّ «إعادة النظر»: درجة التأكد ≤<select className="inp" id="dsR" value={v.review} onChange={set('review')}>{[1, 2, 3].map((n) => <option key={n} value={String(n)}>{n}</option>)}</select></label>
        </div>
      </Panel>
      <Panel title={<><Icon name="send" /> التواصل والدعم</>}>
        <div className="formgrid">
          <label className="fld">واتساب الدعم<input className="inp" id="ctW" dir="ltr" value={v.wa} onChange={set('wa')} placeholder="9665XXXXXXXX" /></label>
          <label className="fld">بريد الدعم<input className="inp" id="ctE" dir="ltr" value={v.email} onChange={set('email')} /></label>
          <label className="fld full">ساعات الدعم<input className="inp" id="ctH" value={v.hours} onChange={set('hours')} placeholder="الأحد–الخميس ٩ص–٥م" /></label>
        </div>
      </Panel>
      <Panel title={<><Icon name="database" /> النسخ الاحتياطي</>} sub="نسخة من المحتوى والباقات والأكواد والإعدادات، لاستعادتها أو نقلها.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={bkExport}><Icon name="download" /> تنزيل نسخة احتياطية</button>
          <label className="btn ghost"><Icon name="refresh-cw" /> استعادة من ملف<input type="file" id="bkImport" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) bkImport(f); }} /></label>
          <button className="btn ghost" onClick={reset} style={{ color: 'var(--danger)' }}><Icon name="undo-2" /> إعادة محتوى اللعبة للأصل</button>
        </div>
      </Panel>
    </>
  );
}
