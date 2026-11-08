/* الشريط العلوي للطاولة (renderHud) والحضور (presenceHTML) وجملة التعريف (renderDefBar) ومبدّل اللوحة */
import React from 'react';
import {
  S, CODE, ME, LOCAL, RO, SAVE_ST, LOGO, Q, ALLQ, N_Q, STAGES, AR, ui, SND,
  placedCount, stageCount, defLine, reviewItems, onlinePeople, colorOf, initial, setHand, isConsMember, featOn,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { go } from '../../nav.js';
import { openLesson } from '../lessons/LessonDrawer.jsx';
import { openScan } from '../scan/ScanOverlay.jsx';
import { openExpert } from '../consult/ExpertModal.jsx';
import { openAIChat } from '../ai/AIChat.jsx';
import { openIntake } from '../intake/IntakeOverlay.jsx';
import { goStage, giveFloor, openSound, openReview, exitTable, setBoardMode } from './actions.js';

const isPhy = () => !!(S && S.cfg && S.cfg.mode === 'physical');
const BADGE = { position: 'absolute', top: '3px', insetInlineEnd: '3px', minWidth: '16px', height: '16px', borderRadius: '8px', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontFamily: 'var(--fn)', display: 'grid', placeItems: 'center', padding: '0 3px' };

/** الحاضرون الآن، ورفع اليد لطلب الكلمة */
export function Presence() {
  useEngine();
  const ppl = onlinePeople(); const host = S && S.owner; const fl = S && S.floor && S.floor.uid;
  const hands = ppl.filter((p) => p.hand).sort((a, b) => a.hand - b.hand); const amHost = !!(ME.id && host === ME.id);
  return (
    <div className="pres" id="pres" title="الحاضرون الآن">
      {ppl.slice(0, 7).map((p) => {
        const cons = isConsMember(p.id);
        const title = p.name + (p.id === host ? ' · المنشّط' : '') + (cons ? ' · مستشار براند ماب' : '') + (p.hand ? ' · طلب الكلمة' : '') + (amHost ? ' — اضغط لمنحه الكلمة' : '');
        return (
          <button key={p.id} className={'av ' + (p.id === fl ? 'floor' : '') + ' ' + (p.hand ? 'hand' : '')} style={{ background: colorOf(p.id) }} title={title} onClick={amHost ? () => giveFloor(p.id, p.name) : undefined}>
            {initial(p.name)}{p.id === host ? <i className="crown">★</i> : null}{cons ? <i className="cns">م</i> : null}{p.hand ? <i className="hd">{AR(hands.indexOf(p) + 1)}</i> : null}
          </button>
        );
      })}
      {ppl.length > 7 ? <span className="more">+{ppl.length - 7}</span> : null}
      <button className={'ibtn ' + (ui.hand ? 'on' : '')} onClick={() => setHand(!ui.hand)} title={ui.hand ? 'إنزال اليد' : 'اطلب الكلمة'} aria-label="اطلب الكلمة">✋</button>
    </div>
  );
}

/** جملة التعريف أعلى المسرح — تفتح بطاقة المشروع */
export function DefBar() {
  useEngine();
  if (!S) return <button className="defbar" id="defBar" hidden />;
  const d = defLine();
  return (
    <button className={'defbar' + (d ? '' : ' empty')} id="defBar" title="افتح بطاقة المشروع" onClick={() => openIntake()}>
      {d ? <><small>جملة التعريف</small><span>{d}</span></> : <><Icon name="clipboard-list" /> أضيفوا جملة التعريف من بطاقة المشروع</>}
    </button>
  );
}

/** مبدّل طريقة عرض اللوحة: ثلاثية الأبعاد / لوحة الاستلام (+ رفع الصور في اللعب الفيزيائي) */
export function BoardToggle() {
  useEngine();
  const m = ui.boardMode === '2d' ? '2d' : '3d';
  return (
    <div className="bmode" id="bmode" role="group" aria-label="طريقة عرض اللوحة">
      <button className={m === '3d' ? 'on' : ''} onClick={() => setBoardMode('3d')}><Icon name="orbit" /> ثلاثية الأبعاد</button>
      <button className={m === '2d' ? 'on' : ''} onClick={() => setBoardMode('2d')}><Icon name="layout-grid" /> لوحة الاستلام</button>
      {isPhy() && featOn('scan') ? <button className="up" onClick={() => openScan()}><Icon name="camera" /> ارفع صور اللوحة</button> : null}
    </div>
  );
}

/** الشريط العلوي: العلامة، المحاور، الحاضرون، العدّاد، والأدوات */
export function Hud() {
  useEngine();
  if (!S) return <header className="hud" id="hud" />;
  const n = placedCount(); const cq = Q[ui.q] || ALLQ[0]; const cs = cq.s; const rv = reviewItems().length; const phy = isPhy();
  return (
    <header className="hud" id="hud">
      <span className="brandmk"><img src={LOGO} alt="" /></span>
      <div className="bn"><b>{S.brand}</b><small><span className="codechip" title="رمز الجلسة">{CODE}</span><span id="saveSt" data-s={LOCAL || RO ? undefined : SAVE_ST}>{LOCAL ? 'على هذا الجهاز' : RO ? 'للمشاهدة' : SAVE_ST || 'محفوظ'}</span></small></div>
      <div className="strip" role="group" aria-label="المحاور">
        {STAGES.map((s) => {
          const c = stageCount(s), d = c === s.qs.length;
          return (
            <button key={s.n} style={{ '--w': String(s.qs.length), '--p': (c / s.qs.length * 100) + '%', '--c': s.c, '--ci': s.ci }} className={(s === cs ? 'cur' : '') + ' ' + (d ? 'done' : '')} onClick={() => goStage(s.n)} title={`${s.name} · ${c}/${s.qs.length}`}>
              <i /><span>{s.name}</span>
            </button>
          );
        })}
      </div>
      <Presence /><span className="cnt num">{n}<small>/{N_Q}</small></span>
      <div className="tools">
        <button className={'ibtn ' + (SND.cur() ? 'on' : '')} onClick={openSound} title="المكتبة الصوتية" aria-label="المكتبة الصوتية"><Icon name="music" /></button>
        <button className="ibtn" onClick={openReview} title="قائمة إعادة النظر" aria-label="قائمة إعادة النظر" style={{ position: 'relative' }}><Icon name="list-checks" />{rv ? <span style={BADGE}>{rv}</span> : null}</button>
        <button className="ibtn" onClick={() => openLesson(ui.q)} title="درس البطاقة الحالية" aria-label="درس البطاقة الحالية"><Icon name="book" /></button>
        {featOn('scan') ? <button className={'ibtn ' + (phy ? 'lbl up' : '')} onClick={() => openScan()} title="رفع صور لوحة الاستلام" aria-label="رفع صور لوحة الاستلام"><Icon name="camera" />{phy ? <span>ارفع الصور</span> : null}</button> : null}
        {featOn('consult') ? <button className="ibtn xp" onClick={() => openExpert()} title="استعن بمستشار (شخص حقيقي)" aria-label="استعن بمستشار"><Icon name="handshake" /></button> : null}
        {featOn('chat') ? <button className="ibtn ai" onClick={() => openAIChat()} title="المساعد الذكي للعبة" aria-label="المساعد الذكي للعبة"><Icon name="bot" /></button> : null}
        <button className="ibtn" onClick={() => openIntake()} title="بطاقة المشروع" aria-label="بطاقة المشروع"><Icon name="clipboard-list" /></button>
        <button className="ibtn" onClick={() => go('dash')} title="لوحة المتابعة" aria-label="لوحة المتابعة"><Icon name="layout-dashboard" /></button>
        <button className="ibtn" onClick={exitTable} title="خروج من الطاولة" aria-label="خروج"><Icon name="log-out" /></button>
      </div>
    </header>
  );
}

export default Hud;
