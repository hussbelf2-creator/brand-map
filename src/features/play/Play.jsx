/* شاشة الطاولة #v-play: الشريط العلوي، المسرح (اللوحة ثلاثية الأبعاد أو لوحة الاستلام)، ويد اللاعب */
import React, { useEffect, useRef } from 'react';
import { S, CODE, Q, ALLQ, ui, SND, Board, enforceCall } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { isModalOpen } from '../../ui/overlays.jsx';
import { Hud, DefBar, BoardToggle } from './Hud.jsx';
import { HandPanel } from './Hand.jsx';
import { Pulse } from './Timer.jsx';
import ReceivingBoard from './ReceivingBoard.jsx';
import { timerTick } from './timer.js';
import { mountBoard, boardFocus, boardOverview, boardTimer } from './board.js';
import { goQ, prevQ, nextQ } from './actions.js';

const curQ = () => Q[ui.q] || ALLQ[0];

export default function Play() {
  useEngine();
  const stage = useRef(null);
  const mode2d = ui.boardMode === '2d';

  // دورة حياة الشاشة: وضع الاجتماع، اختيار البطاقة من اللوحة، المؤقت، الأسهم، وتهيئة الصوت عند أول نقرة
  useEffect(() => {
    enforceCall();
    Board.onPick = (qid) => { if (ui.view === 'play') goQ(qid); };
    timerTick();
    const iv = setInterval(timerTick, 250);
    const onKey = (e) => {
      if (ui.view !== 'play' || isModalOpen()) return;
      const tag = (document.activeElement || {}).tagName || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowLeft') nextQ();
      if (e.key === 'ArrowRight') prevQ();
    };
    const onClick = (e) => { if (e.isTrusted && SND.P.on && SND.ensure) SND.ensure(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick, true);
    return () => { clearInterval(iv); document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick, true); boardTimer(''); };
  }, []);

  // تركيب اللوحة عند الدخول (في الوضعين، كما في الأصل)، وعند الرجوع إلى العرض ثلاثي الأبعاد، وعند تبديل الجلسة
  useEffect(() => { mountBoard(stage.current); }, [mode2d, CODE, !!S]);

  if (!S) return <section id="v-play" />;
  const q = curQ();
  return (
    <section id="v-play" className={q.type === 'fill' ? 'fillmode' : undefined}>
      <Hud />
      <div id="stage3d" ref={stage} className={mode2d ? 'mode2d' : undefined}>
        <Pulse />
        <DefBar />
        <BoardToggle />
        <div id="board2d" className="board2d" hidden={!mode2d}>{mode2d ? <ReceivingBoard /> : null}</div>
        <div className="tip3d" hidden />
        <div className="legend3d">
          <span><i style={{ background: '#E2B54A', borderRadius: '50%' }} />البيدق: البطاقة الحالية</span>
          <span><i style={{ background: 'linear-gradient(90deg,#6A97CF,#A3D16C,#E989BA,#FBC23A)' }} />بتلة المحور تعود للزهرة حين يكتمل</span>
          <span><i style={{ background: '#D93A36' }} />كرت تعارض</span>
        </div>
        <div className="camtools">
          <button className="ibtn" onClick={() => boardOverview(curQ().s.n)} title="نظرة كاملة على اللوحة" aria-label="نظرة كاملة" id="camAll"><Icon name="orbit" /></button>
          <button className="ibtn" onClick={() => boardFocus(ui.q)} title="ركّز على البطاقة الحالية" aria-label="ركّز على البطاقة" id="camOne"><Icon name="eye" /></button>
        </div>
        {!Board.ok && !mode2d ? <div className="no3d">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز.<br />يمكنك متابعة اللعب من لوحة البطاقات.</div> : null}
      </div>
      <div className="hand" id="panel" aria-label="يد اللاعب: بطاقة السؤال والإجابات"><HandPanel /></div>
    </section>
  );
}
