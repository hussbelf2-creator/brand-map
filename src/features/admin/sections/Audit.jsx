/* سجل التغييرات (admAudit) */
import React from 'react';
import { aList, fmtDate } from '../../../engine/engine.js';
import { useEngine } from '../../../ui/hooks.js';
import { useLoad } from '../store.js';
import { AdmHead, Loading, LoadErr } from '../parts.jsx';

const tm = (t) => new Date(t).toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' });

export default function Audit() {
  useEngine();
  const { v: L, err } = useLoad(async () => (await aList('audit', 400)).sort((a, b) => b.at - a.at));
  if (err) return <LoadErr e={err} />;
  if (!L) return <Loading />;
  const rows = L.slice(0, 300);
  return (
    <>
      <AdmHead t="سجل التغييرات" sub="كل تعديل يجريه فريق الإدارة يُسجَّل هنا: من، ومتى، وماذا." />
      <div className="atw"><table className="atable">
        <thead><tr><th>الوقت</th><th>بواسطة</th><th>الإجراء</th><th>العنصر</th><th>التفاصيل</th></tr></thead>
        <tbody>{rows.length ? rows.map((a) => (
          <tr key={a.id}>
            <td className="num">{fmtDate(a.at)} <small>{tm(a.at)}</small></td>
            <td>{a.by || ''}</td><td><b>{a.action || ''}</b></td><td>{a.target || ''}</td><td><small>{a.detail || ''}</small></td>
          </tr>
        )) : <tr><td colSpan={5} className="empty">لا تغييرات بعد.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
