/* نافذة تحميل وثيقة المشروع (openDownload الأصلية) */
import React from 'react';
import { S, N_Q, placedCount, featOn } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openModal, closeModal } from '../../ui/overlays.jsx';
import { follows } from '../dashboard/logic.js';
import { dlDocx, dlHtml, dlJson } from './export.js';

export function DownloadModal() {
  useEngine();
  if (!S) return null;
  return (
    <>
      <h3><Icon name="download" /> تحميل وثيقة المشروع</h3>
      <p className="mini-note">«{S.brand}» · {placedCount()} من {N_Q} قراراً · {follows().length} متابعة مسجّلة. الوثيقة مبنية على هيكل الأقسام الأحد عشر.</p>
      <div className="mb dlopts">
        {featOn('docx') ? (
          <button onClick={dlDocx}><span className="di" style={{ background: '#2B5A94' }}><Icon name="file-text" /></span><span><b>وثيقة Word (.docx)</b><small>للتحرير والمشاركة: الغلاف، الأقسام الأحد عشر، المخاطر، خطة ٣٠/٦٠/٩٠، وملاحق القرارات والمتابعة.</small></span></button>
        ) : null}
        <button onClick={dlHtml}><span className="di" style={{ background: '#1F7A69' }}><Icon name="globe" /></span><span><b>صفحة HTML للطباعة</b><small>افتحها في المتصفح واحفظها PDF من أمر الطباعة.</small></span></button>
        <button onClick={dlJson}><span className="di" style={{ background: '#B07A00' }}><Icon name="database" /></span><span><b>ملف الجلسة (JSON)</b><small>نسخة احتياطية كاملة: البطاقات والكتابات والتوقيت والمتابعات.</small></span></button>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إغلاق</button></div>
    </>
  );
}

export function showDownload() { openModal(<DownloadModal />); }
