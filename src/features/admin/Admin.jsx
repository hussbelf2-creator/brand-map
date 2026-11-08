/* لوحة الإدارة: التحكم الكامل بالمنصة (renderAdmin / admRender) */
import React from 'react';
import { ADM_SECS, CONS, IS_ADMIN, IS_OWNER, LOGO, MY_STAFF, N, ROLE_DEF, canSec, whoName } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { go } from '../../nav.js';
import { ADM, refreshAll, useAdm } from './store.js';
import { Boundary } from './parts.jsx';
import { pickSec } from './logic.js';
import Over from './sections/Over.jsx';
import Axes from './sections/Axes.jsx';
import Cards from './sections/Cards.jsx';
import Content from './sections/Content.jsx';
import AI from './sections/AI.jsx';
import Cons from './sections/Cons.jsx';
import Clients from './sections/Clients.jsx';
import Plans from './sections/Plans.jsx';
import Coupons from './sections/Coupons.jsx';
import Perms from './sections/Perms.jsx';
import Settings from './sections/Settings.jsx';
import Audit from './sections/Audit.jsx';

export { openAdmin } from './logic.js';
export { openClient } from './ClientDrawer.jsx';

const SECS = { over: Over, axes: Axes, cards: Cards, content: Content, ai: AI, cons: Cons, clients: Clients, plans: Plans, coupons: Coupons, perms: Perms, settings: Settings, audit: Audit };

/* شارة العدد بجانب القسم (admBadge) */
function Badge({ k }) {
  const D = ADM.data;
  let n = 0;
  if (k === 'plans' && D.subreq) n = D.subreq.filter((r) => r.st === 'pending').length;
  if (k === 'cons' && CONS) n = CONS.filter((c) => !c.ok && !c.manual).length;
  return n ? <i className="nb">{N(n)}</i> : null;
}

export default function Admin() {
  useEngine(); useAdm();
  if (!IS_ADMIN) {
    return (
      <section id="v-admin">
        <div className="wrap" style={{ padding: '80px 16px' }}>
          <div className="emptyst"><Icon name="lock" /><b>هذه الصفحة لإدارة المنصة فقط</b><p>تظهر لمالك الأداة ومحرّريها.</p><button className="btn" onClick={() => go('home')}>العودة للرئيسية</button></div>
        </div>
      </section>
    );
  }
  const secs = ADM_SECS.filter((s) => canSec(s[0]));
  const sec = secs.some((s) => s[0] === ADM.sec) ? ADM.sec : (secs[0] || [])[0];
  if (sec && sec !== ADM.sec) ADM.sec = sec;
  const Sec = SECS[sec];
  const role = IS_OWNER ? 'المالك' : MY_STAFF ? (ROLE_DEF[MY_STAFF.role] || [''])[0] : 'محرّر';
  return (
    <section id="v-admin">
      <div className="adm">
        <aside className="adm-nav">
          <div className="adm-brand"><img src={LOGO} alt="" /><span><b>إدارة براند ماب</b><small>{whoName()} · {role}</small></span></div>
          <nav>
            {secs.map(([k, t, ic]) => <button key={k} className={sec === k ? 'on' : ''} onClick={() => pickSec(k)}><Icon name={ic} /><span>{t}</span><Badge k={k} /></button>)}
          </nav>
          <div className="adm-foot">
            <button className="btn sm ghost" onClick={() => go('start')}><Icon name="house" /> الأداة</button>
            <button className="btn sm ghost" onClick={refreshAll}><Icon name="refresh-cw" /> تحديث</button>
          </div>
        </aside>
        <main className="adm-main" id="admMain">
          {Sec ? <Boundary key={sec} k={sec}><Sec /></Boundary> : <p className="empty">لا أقسام متاحة لدورك.</p>}
        </main>
      </div>
    </section>
  );
}
