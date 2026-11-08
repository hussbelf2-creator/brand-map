/* النوافذ المنبثقة والدرج الجانبي والإشعارات — واجهة أوامر مماثلة للأصل (modal/drawer/toast) */
import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { Icon } from './Icon.jsx';

let st = { modal: null, modalWide: false, drawer: null, drawerWide: false, toasts: [] };
const subs = new Set();
const set = (p) => { st = { ...st, ...p }; subs.forEach((f) => f()); };
const sub = (f) => { subs.add(f); return () => subs.delete(f); };

/** يفتح نافذة وسطية. node عنصر React، مثل <MyModal/> */
export function openModal(node, { wide = false } = {}) { set({ modal: node, modalWide: wide }); }
export function closeModal() { set({ modal: null }); }
/** يفتح الدرج الجانبي */
export function openDrawer(node, { wide = false } = {}) { set({ drawer: node, drawerWide: wide }); }
export function closeDrawer() { set({ drawer: null, drawerWide: false }); }
export const isModalOpen = () => !!st.modal;
export const isDrawerOpen = () => !!st.drawer;

let tid = 0;
/** إشعار قصير. kind: '' | 'gold' | 'err'. actions: [{t, fn}] */
export function toast(msg, kind = '', { sticky = false, actions = [] } = {}) {
  const id = ++tid;
  set({ toasts: [...st.toasts, { id, msg, kind, sticky, actions }].slice(-3) });
  if (!sticky) setTimeout(() => dismiss(id), kind === 'err' ? 6500 : 3800);
}
function dismiss(id) { set({ toasts: st.toasts.filter((t) => t.id !== id) }); }

/** رأس الدرج الجانبي الموحّد */
export function DrawerHead({ title, children }) {
  return <div className="dh"><h3>{title}</h3>{children}<button className="ibtn" onClick={closeDrawer} aria-label="إغلاق"><Icon name="x" /></button></div>;
}

export function Overlays() {
  const s = useSyncExternalStore(sub, () => st);
  const mref = useRef(null);
  useEffect(() => {
    if (!s.modal || !mref.current) return;
    const f = mref.current.querySelector('input,textarea,button.btn');
    const t = setTimeout(() => f && f.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [s.modal]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && (st.modal || st.drawer)) { if (st.modal) closeModal(); else closeDrawer(); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  return (
    <>
      <div className={'scrim' + (s.modal || s.drawer ? ' on' : '')} onClick={() => { closeModal(); closeDrawer(); }} />
      <div ref={mref} className={'modal' + (s.modal ? ' on' : '') + (s.modalWide ? ' wide' : '')} role="dialog" aria-modal="true">{s.modal}</div>
      <aside className={'drawer' + (s.drawer ? ' on' : '') + (s.drawerWide ? ' wide' : '')} aria-hidden={!s.drawer}>{s.drawer}</aside>
      <div className="toasts" aria-live="polite">
        {s.toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            <span>{t.msg}</span>
            {t.actions.map((a, i) => <button key={i} className="act" onClick={() => { a.fn(); dismiss(t.id); }}>{a.t}</button>)}
            {t.sticky && <button className="act" onClick={() => dismiss(t.id)}>إغلاق</button>}
          </div>
        ))}
      </div>
    </>
  );
}
