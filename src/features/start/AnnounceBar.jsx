/* شريط الإعلان أعلى كل الصفحات (من إدارة المحتوى: cms/lessons.announce) */
import React, { useEffect, useState } from 'react';
import { cmsL } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { go } from '../../nav.js';
import { openPlans } from '../plans/PlansModal.jsx';
import { openAIChat } from '../ai/AIChat.jsx';

const seenV = () => { try { return localStorage.getItem('bm3:ann'); } catch (e) { return null; } };

/* وجهة زر الشريط */
function annGo(t) {
  if (t === 'plans') openPlans();
  else if (t === 'upload') go('start', { startTab: 'photo' });
  else if (t === 'chat') openAIChat();
  else go(t);
}

export default function AnnounceBar() {
  useEngine();
  const [, setTick] = useState(0);
  const A = (cmsL().announce) || {};
  const on = !!(A.on && A.text && seenV() !== String(A.v));
  useEffect(() => {
    document.body.classList.toggle('has-ann', on);
    return () => document.body.classList.remove('has-ann');
  }, [on]);
  if (!on) return null;
  const annX = () => { try { localStorage.setItem('bm3:ann', String(A.v)); } catch (x) {} setTick((n) => n + 1); };
  return (
    <div id="annBar" className={'annbar ' + (A.kind === 'info' ? 'info' : 'gold')}>
      <span>{A.text}</span>
      {A.to && A.btn ? <button className="btn sm" onClick={() => annGo(A.to)}>{A.btn}</button> : null}
      <button className="ibtn" onClick={annX} aria-label="إخفاء"><Icon name="x" /></button>
    </div>
  );
}
