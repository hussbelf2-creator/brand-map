/* شريط حالة اللعب الفيزيائي فوق لوحة الاستلام (scanBannerHTML في physical.js) */
import React from 'react';
import { S, ALLQ, AR, plist } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { openScan } from './ScanOverlay.jsx';

export default function ScanBanner() {
  useEngine();
  if (!S) return null;
  const src = S.src || {}; const read = Object.keys(src).length;
  if (!(S.cfg && S.cfg.mode === 'physical') && !read) return null;
  const unc = Object.values(src).filter((x) => x && x.clarity === 'unclear' && !x.reviewed).length;
  const miss = ALLQ.filter((q) => !plist(q.id).length).length;
  return (
    <div className={'rb-scan' + (read ? ' has' : '')}>
      <span className="ic0"><Icon name={read ? 'scan-line' : 'camera'} /></span>
      <div>
        {read ? (
          <><b>قرأت المنصة {AR(read)} بطاقة من الصور</b><small>{unc ? `${AR(unc)} غير واضحة (معلّمة بالبرتقالي) — اضغطوها لإدخالها يدوياً. ` : ''}{miss ? `${AR(miss)} فتحة ما زالت فارغة.` : 'اكتملت كل الفتحات.'}</small></>
        ) : (
          <><b>لعبتم على اللوحة المطبوعة؟</b><small>صوّروها وارفعوا الصور، وستمتلئ هذه اللوحة تلقائياً.</small></>
        )}
      </div>
      <button className={'btn' + (read ? '' : ' gold')} onClick={openScan}><Icon name="camera" /> {read ? 'ارفع صوراً إضافية' : 'ارفع صور اللوحة'}</button>
    </div>
  );
}
