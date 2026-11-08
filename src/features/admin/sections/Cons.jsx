/* المستشارون داخل لوحة الإدارة (admCons) */
import React from 'react';
import { ADM } from '../store.js';
import { AdmHead } from '../parts.jsx';
import { ConsAdmin } from '../../consult/ConsAdmin.jsx';

export default function Cons() {
  return (
    <>
      <AdmHead t="المستشارون" sub="اعتماد المستشارين، إضافتهم، ومتابعة كل طلبات الحجز." />
      <div id="admConsBox"><ConsAdmin tab={ADM.consTab || 'list'} onTab={(k) => { ADM.consTab = k; }} /></div>
    </>
  );
}
