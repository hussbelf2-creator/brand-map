/* بطاقة التعبئة (fillBox في الأصل): كل صيغ الكتابة على البطاقة */
import React, { useReducer } from 'react';
import { RO, AR, deepFilled } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { LinesEditor } from '../../ui/LinesEditor.jsx';
import { CardTop } from './QuestionCard.jsx';
import { fval, typeFill, setFill, setScale } from './actions.js';

const PESTLE = [['p', 'سياسي'], ['e', 'اقتصادي'], ['s', 'اجتماعي'], ['t', 'تقني'], ['l', 'قانوني'], ['n', 'بيئي']];
const SWOT = [['s', 'نقاط القوة'], ['w', 'نقاط الضعف'], ['o', 'الفرص'], ['t', 'التهديدات']];
const RISK = ['منخفضة', 'متوسطة', 'عالية'];
const NTYPES = ['وصفي', 'رمزي', 'مختزل', 'شخصي', 'مختلق', 'عاطفي'];
const DOM_ST = ['متاح', 'محجوز'];
const LN_PH = 'اكتب سطراً لكل فكرة';
const str = (v) => (v == null ? '' : String(v));

/** معاينة جملة التموضع (تتحدث مع الكتابة) */
export function StmtPreview({ v }) {
  return <div className="stmt">لـ<b>{v.seg || '…'}</b>، نحن <b>{v.cat || '…'}</b> التي <b>{v.edge || '…'}</b>.</div>;
}

export function FillBox({ q, a }) {
  useEngine();
  const [, force] = useReducer((x) => x + 1, 0);
  const id = q.id, k = a.k;
  const v = fval(id, k);
  const on = deepFilled(v);
  const head = a.head || q.head || q.slot;
  const type = (p, val) => { typeFill(id, k, p.split('.'), val); force(); };
  const set = (p, val) => setFill(id, k, p.split('.'), val);
  // حقل سطر واحد (inp)
  const inp = (p, val, ph = '') => <input className="inp" id={`f_${id}_${k}_${p}`} value={str(val)} placeholder={ph} disabled={RO} onChange={(e) => type(p, e.target.value)} />;
  // محرّر بالأسطر (linesEd)
  const lines = (p, val, min, ph) => <LinesEditor value={str(val)} min={min} placeholder={ph || LN_PH} disabled={RO} onChange={(t) => type(p, t)} />;
  const row = (key, lab, body) => <div className="frow" key={key}><span>{lab}</span>{body}</div>;
  const pills = (p, cur, opts) => <div className="pills">{opts.map((o) => <button key={o} type="button" className={cur === o ? 'on' : ''} onClick={() => set(p, o)}>{o}</button>)}</div>;

  let b = null;
  switch (a.f) {
    case 'pestle': b = PESTLE.map(([x, l]) => row(x, l, inp(x, v[x], 'التغيير ← فرصة/تهديد علينا'))); break;
    case 'comp': b = <>
      {row('name', 'اسم المنافس', inp('name', v.name))}
      {row('risk', 'الخطورة (تداخل الشريحة × القيمة)', pills('risk', v.risk, RISK))}
      {row('strong', 'أهم قوة', inp('strong', v.strong))}
      {row('weak', 'أهم ضعف — بوابة تموضعك', inp('weak', v.weak))}
    </>; break;
    case 'fields': b = <>
      {(a.fields || []).map(([x, l, r]) => row(x, l, r > 1 ? lines(x, v[x], Math.max(3, r), '') : inp(x, v[x], '')))}
      {a.stmt ? <StmtPreview v={v} /> : null}
    </>; break;
    case 'lines': b = row('text', a.prompt || '', lines('text', v.text, Math.max(6, a.rows || 6), LN_PH)); break;
    case 'prod': { const sel = !!v.on; b = <>
      <div className="pills"><button type="button" className={sel ? 'on' : ''} onClick={() => set('on', sel ? '' : '1')}>{sel ? 'ضمن تشكيلتنا' : 'أضفها لتشكيلتنا'}</button></div>
      {row('text', 'ما تبيعه لهذه الفئة', lines('text', v.text, 4, 'منتج أو خدمة في كل سطر'))}
    </>; break; }
    case 'swot': b = <div className="swot">{SWOT.map(([x, l]) => row(x, l, lines(x, v[x], 4, '')))}</div>; break;
    case 'scales': b = (a.scales || []).map((p, i) => (
      <div className="scale" key={i}><span>{p[0]}</span>
        <div className="pts">{[1, 2, 3, 4, 5, 6, 7].map((n) => <button key={n} type="button" className={v[i] === n ? 'on' : ''} onClick={() => setScale(id, k, i, n)} aria-label={`${p[0]} ${n} من 7`}>{n}</button>)}</div>
        <span>{p[1]}</span></div>
    )); break;
    case 'tagline': b = [1, 2, 3].map((n) => row('t' + n, `مقترح ${AR(n)} ${v.pick == n ? '★ المختار' : ''}`,
      <div style={{ display: 'flex', gap: '6px' }}>{inp('t' + n, v['t' + n], '٢–٥ كلمات')}<button type="button" className={'btn sm ' + (v.pick == n ? 'pri' : '')} onClick={() => set('pick', n)}>اختر</button></div>)); break;
    case 'matrix': b = <>
      {row('x', 'المحور الأفقي (س)', inp('x', v.x, 'مثال: سعر منخفض ← مرتفع'))}
      {row('y', 'المحور الرأسي (ص)', inp('y', v.y, 'مثال: تقليدي ← مبتكر'))}
      {row('we', 'موقعنا', inp('we', v.we, 'أين نقف؟'))}
      {row('them', 'المنافسون والفجوة البيضاء', lines('them', v.them, 3, ''))}
    </>; break;
    case 'ntype': b = <>
      {pills('type', v.type, NTYPES)}
      {a.warn ? <div className="warnbox">⚠ {a.warn}</div> : null}
    </>; break;
    case 'domains': b = (a.rows || []).map(([x, l]) => { const d = v[x] || {}; return row(x, l,
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{pills(x + '.st', d.st, DOM_ST)}{inp(x + '.note', d.note, 'البديل أو الملاحظة')}</div>); }); break;
    default: b = null;
  }
  return (
    <div className={'wcard ' + (on ? 'on' : '') + ' ' + (['swot', 'scales'].includes(a.f) ? 'wide' : '')}>
      <CardTop q={q} a={a} />
      <h4>{a.code2 ? a.code2 : head}{on ? <span className="chip ok"><Icon name="check" /> مكتوبة</span> : null}</h4>
      {b}
    </div>
  );
}

export default FillBox;
