import React from 'react';
/** لوحة المحتوى الموحّدة (pnl في الأصل): عنوان، وصف، أزرار، ومحتوى */
export function Panel({ title, sub, act, cls = '', children }) {
  return (
    <section className={'pn ' + cls}>
      <div className="pn-h"><div><h2>{title}</h2>{sub ? <p>{sub}</p> : null}</div>{act}</div>
      {children}
    </section>
  );
}
