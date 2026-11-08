/* عناصر مشتركة في لوحة الإدارة: رأس القسم، المفاتيح، التبويبات، التأكيد، وشريط التعديلات غير المطبّقة */
import React from 'react';
import { audit } from '../../engine/engine.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal } from '../../ui/overlays.jsx';
import { ADM, admSet, useAdm } from './store.js';

/** رأس القسم (ah في الأصل) */
export function AdmHead({ t, sub, children }) {
  return <header className="adm-h"><div><h1>{t}</h1>{sub ? <p>{sub}</p> : null}</div><div className="adm-acts">{children}</div></header>;
}

/** مفتاح تشغيل (tog في الأصل): label.tg > input + span.sw + span */
export function Tog({ id, on, onChange, lbl, sub }) {
  return (
    <label className="tg">
      <input type="checkbox" id={id} checked={!!on} onChange={(e) => onChange && onChange(e.target.checked)} />
      <span className="sw" />
      <span><b>{lbl}</b>{sub ? <small>{sub}</small> : null}</span>
    </label>
  );
}

/** تبويبات .seg */
export function Seg({ items, val, onPick, style }) {
  return <div className="seg" style={style}>{items.map(([k, t]) => <button key={k} type="button" className={val === k ? 'on' : ''} onClick={() => onPick(k)}>{t}</button>)}</div>;
}

/** اختيار متعدد .opts (أزرار تُبدَّل) */
export function Opts({ id, items, sel, onChange, empty = null }) {
  const tg = (v) => onChange(sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v]);
  return <div className="opts" id={id}>{items.length ? items.map(([v, t]) => <button key={v} type="button" className={sel.includes(v) ? 'on' : ''} onClick={() => tg(v)}>{t}</button>) : empty}</div>;
}

export const Loading = () => <p className="empty">يحمّل…</p>;
export const LoadErr = ({ e }) => <div className="warnbox">تعذّر تحميل القسم: {(e && e.message) || ''}</div>;

/** حاجز أخطاء الرسم: يعرض fallback بدل انهيار اللوحة. يُعاد ضبطه عند تغيّر k */
export class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(e) { console.error(e); }
  componentDidUpdate(prev) { if (prev.k !== this.props.k && this.state.err) this.setState({ err: null }); }
  render() {
    if (this.state.err) return this.props.fallback ? this.props.fallback(this.state.err) : <LoadErr e={this.state.err} />;
    return this.props.children;
  }
}

function Confirm({ msg, onOk }) {
  return (
    <>
      <h3><Icon name="triangle-alert" /> تأكيد</h3>
      <p style={{ marginTop: 10, lineHeight: 1.8 }}>{msg}</p>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={() => onOk()}>تأكيد</button></div>
    </>
  );
}
/** نافذة تأكيد: onOk يُستدعى عند الضغط على «تأكيد» */
export function askConfirm(msg, onOk) { openModal(<Confirm msg={msg} onOk={onOk} />); }

export const reloadApp = () => location.reload();

function GameSaved({ what }) {
  return (
    <>
      <h3><Icon name="check" /> حُفظ: {what}</h3>
      <p style={{ marginTop: 10, lineHeight: 1.8 }}>التعديل محفوظ ويصل لكل المستخدمين. يُطبَّق على الطاولة والخريطة والدروس عند فتح الأداة من جديد.</p>
      <div className="mf"><button className="btn" onClick={closeModal}>أكمل التعديل</button><button className="btn pri" onClick={reloadApp}><Icon name="refresh-cw" /> طبّق الآن (إعادة تحميل)</button></div>
    </>
  );
}
/** بعد حفظ محتوى اللعبة: يسجّل في السجل ويعرض خيار إعادة التحميل */
export function gameSaved(what) { admSet({ dirty: true }); audit('تعديل محتوى اللعبة', what); openModal(<GameSaved what={what} />); }

/** شريط «تعديلات محفوظة لم تُطبَّق» (dirtyBar) */
export function DirtyBar() {
  useAdm();
  if (!ADM.dirty) return null;
  return <div className="banner"><Icon name="refresh-cw" /> <span>لديك تعديلات محفوظة على محتوى اللعبة لم تُطبَّق في هذه النافذة بعد.</span><button className="btn sm pri" onClick={reloadApp}>طبّق الآن</button></div>;
}
