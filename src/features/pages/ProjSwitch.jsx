/* مبدّل المشروع في رأس لوحة المتابعة — projSwitch الأصلي (يظهر عند وجود مشروعين أو أكثر) */
import React, { useEffect } from 'react';
import { ui, setUI, CODE } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { loadProjects, switchProj } from './logic.js';

export default function ProjSwitch() {
  useEngine();
  // تحميل قائمة المشاريع عند الحاجة (كما في renderDash الأصلية) — مرة واحدة حتى يمسحها afterOpen
  useEffect(() => {
    if (ui.projList || ui.projLoading) return;
    setUI({ projLoading: true });
    loadProjects().then(() => setUI({ projLoading: false })).catch(() => setUI({ projLoading: false, projList: [] }));
  });
  const L = ui.projList || [];
  if (L.length < 2) return null;
  return (
    <label className="psw"><Icon name="layout-grid" />
      <select id="projSel" aria-label="بدّل المشروع" value={CODE || ''} onChange={(e) => switchProj(e.target.value)}>
        {L.map((p) => <option key={p.code} value={p.code}>{p.doc.brand}</option>)}
      </select>
    </label>
  );
}
