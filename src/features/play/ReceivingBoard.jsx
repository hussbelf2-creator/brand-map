/* لوحة استلام الإجابات ثنائية الأبعاد — حسب التصميم المطبوع (board2d.js في الأصل) */
import React from 'react';
import { S, LOGO, N_Q, STAGES, CL, AK, AR, ui, patch, fmt, qcode, optT, plist, placedCount, timeOf, confOf, doubtOn, ansTitle } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import ScanBanner from '../scan/ScanBanner.jsx';
import { openLesson } from '../lessons/LessonDrawer.jsx';
import { ArtOf, hasArt } from './QuestionCard.jsx';
import { goQ } from './actions.js';

/** بطاقة موضوعة داخل فتحتها (slotCard) */
function SlotCard({ q, k }) {
  const a = AK(q, k) || {}, s = q.s, tm = timeOf(q.id), c = confOf(q.id); const t = ansTitle(q, k) || optT(a);
  return (
    <div className="rc">
      <span className="ac-top"><span className="num">{qcode(q).replace('Q' + s.n + '.', 'Q')}.{k}</span><span>{q.slot}</span></span>
      {!a.f && !a.spare && hasArt(a) ? <ArtOf a={a} /> : <span className="art"><Icon name={a.f ? 'pen-line' : (q.ic || 'check')} /></span>}
      <b>{t}</b>
      <span className="rf">
        <span className="cdots">{[1, 2, 3, 4, 5].map((i) => <i key={i} style={i <= c ? { background: CL[c].c } : undefined} />)}</span>
        {tm ? <span className={'tmc ' + (tm.s > tm.d ? 'over' : '')}>{fmt(tm.s)}</span> : null}
      </span>
    </div>
  );
}

/** الضغط على فتحة: يعلّم المقروءة بغموض كمراجَعة ثم يفتح البطاقة (rbSlot) */
function pickSlot(qid) {
  const sr = ((S && S.src) || {})[qid];
  if (sr && sr.clarity === 'unclear' && !sr.reviewed) patch({ src: { [qid]: { reviewed: true } } }, { silent: true });
  goQ(qid);
}

/** اللوحة الورقية (recvBoardHTML) */
function RecvBoard() {
  const src = (S && S.src) || {}; const cur = ui.q;
  const photos = Object.values(src).filter((x) => x && x.photo).length;
  const unclear = Object.values(src).filter((x) => x && x.clarity === 'unclear' && !x.reviewed).length;
  return (
    <div className="rb">
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <div className="rb-h">
        <div className="rb-f"><span>العلامة: <b>{S.brand}</b></span><span>الفريق: <b>{S.team || '—'}</b></span></div>
        <div className="rb-t"><h2>لوحة استلام الأجوبة</h2><p>ضع بطاقة قرارك في مكانها، الرحلة تكتمل عمودياً، محوراً بعد محور</p></div>
        <div className="rb-f"><span>التاريخ: <b>{S.date || ''}</b></span><span>المنشّط: <b>{S.ownerName || S.facilitator || '—'}</b></span></div>
      </div>
      <div className="rb-cols">
        {STAGES.map((s) => (
          <div className="rb-col" key={s.n} style={{ '--c': s.c, '--ci': s.ci }}>
            <div className="rb-ax">{s.name}</div>
            {s.qs.map((q) => {
              const pl = plist(q.id), sr = src[q.id] || {}; const unc = sr.clarity === 'unclear' && !sr.reviewed;
              const cls = ['rb-slot', q.gold && 'gold', pl.length && 'full', q.id === cur && 'cur', unc && 'unc'].filter(Boolean).join(' ');
              return (
                <div className="rb-q" key={q.id}>
                  <div className="rb-l"><span className="num">Q{q.no}</span> {q.slot}</div>
                  <div className={cls} role="button" tabIndex={0} aria-label={q.slot} onClick={() => pickSlot(q.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickSlot(q.id); } }}>
                    {pl.length
                      ? <>{pl.slice(0, 2).map((k) => <SlotCard key={k} q={q} k={k} />)}{pl.length > 2 ? <span className="more">+{pl.length - 2}</span> : null}</>
                      : <span className="ph"><Icon name="square-plus" /><small>{q.gold ? 'ضع البطاقة الذهبية هنا' : 'ضع البطاقة هنا'}</small></span>}
                    {sr.photo ? <span className={'ph-b ' + (unc ? 'unc' : '')} title={unc ? 'غير واضحة في الصورة — راجعوها' : 'قُرئت من الصورة'}><Icon name="camera" /></span> : null}
                    {doubtOn(q.id) ? <span className="db">؟</span> : null}
                  </div>
                  <button className="rb-help" onClick={() => openLesson(q.id)} title={'درس البطاقة: ' + q.slot} aria-label="درس البطاقة">؟</button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="rb-foot">
        <img src={LOGO} alt="" />
        <span>{AR(placedCount())} من {AR(N_Q)} على اللوحة{photos ? ` · ${AR(photos)} من الصور` : ''}{unclear ? <> · <b className="od">{AR(unclear)} تحتاج مراجعة</b></> : null}</span>
      </div>
    </div>
  );
}

/** المحتوى داخل #board2d: شريط حالة الصور ثم اللوحة */
export default function ReceivingBoard() {
  useEngine();
  if (!S) return null;
  return <><ScanBanner /><RecvBoard /></>;
}
