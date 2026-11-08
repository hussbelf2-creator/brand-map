/* ================= شاشة الدروس (#lessons) ================= */
import React, { useRef, useState } from 'react';
import { S, STAGES, SPECIAL, N_Q, LOGO, ui, setUI, AR } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { debounced } from '../../ui/util.js';
import { go } from '../../nav.js';
import { Lesson } from './LessonDrawer.jsx';

export default function Lessons() {
  useEngine();
  const [lq, setLq] = useState(ui.lq || '');
  const mainRef = useRef(null);
  const cur = ui.lesson || 'loop';
  const qf = lq.trim();
  const match = (t) => !qf || t.includes(qf);
  const pick = (id) => {
    setUI({ lesson: id });
    setTimeout(() => { const m = mainRef.current; if (m && innerWidth < 1000) m.scrollIntoView({ behavior: 'smooth' }); else window.scrollTo({ top: 0 }); }, 0);
  };
  const onQ = (e) => { const v = e.target.value; setLq(v); debounced('lsQ', () => setUI({ lq: v }), 250); };
  return (
    <section id="v-lessons">
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <header className="dband">
        <div className="wrap">
          <div className="db-top">
            <span className="brandmk"><img src={LOGO} alt="" /><span>براند ماب<small>BRAND MAP</small></span></span>
            <span className="db-acts">
              {S ? <button className="btn sm dk" onClick={() => go('play')}><Icon name="orbit" /> العودة للطاولة</button> : null}
              <button className="btn sm dk" onClick={() => go('home')}><Icon name="house" /> الرئيسية</button>
              <button className="btn sm gold" onClick={() => go('start')}>ابدأ</button>
            </span>
          </div>
          <div className="db-main" style={{ paddingBottom: 24 }}>
            <div>
              <div className="eyebrow">مكتبة الدروس</div>
              <h1>الدروس</h1>
              <div className="db-sub"><span>{AR(N_Q)} درساً لكل بطاقة، و{AR(SPECIAL.length)} دروس في أساسيات اللعبة. كل درس: المعنى، والرسم التوضيحي، وطريقة اللعب، ومتى تختارون كل إجابة، وما تُنتجه البطاقة.</span></div>
            </div>
          </div>
        </div>
      </header>
      <main className="wrap ls-wrap">
        <nav className="ls-nav-side pn">
          <div className="ls-search"><input className="inp" id="lsQ" placeholder="ابحث في الدروس…" value={lq} onChange={onQ} aria-label="بحث في الدروس" /></div>
          <div className="ls-grp">
            <b>أساسيات اللعبة</b>
            {SPECIAL.filter((x) => match(x.t)).map((x) => (
              <button key={x.id} className={cur === x.id ? 'on' : ''} onClick={() => pick(x.id)}><Icon name={x.ic} /> {x.t}</button>
            ))}
          </div>
          {STAGES.map((s) => {
            const qs = s.qs.filter((q) => match(q.slot + ' ' + q.t));
            if (!qs.length) return null;
            return (
              <div key={s.n} className="ls-grp" style={{ '--ci': s.ci }}>
                <b><i>{s.n}</i>{s.name} <small>{s.ask}</small></b>
                {qs.map((q) => (
                  <button key={q.id} className={cur === q.id ? 'on' : ''} onClick={() => pick(q.id)}><span className="num">Q{q.no}</span> {q.slot}{q.gold ? ' ★' : ''}</button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="pn ls-main" ref={mainRef}><Lesson id={cur} inGame={false} onNav={pick} /></div>
      </main>
    </section>
  );
}
