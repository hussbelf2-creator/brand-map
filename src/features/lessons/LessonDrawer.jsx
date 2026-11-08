/* ================= الدرس: محتوى الدرس (lessonHTML / lessonCard) ودرج الدرس (openLesson) ================= */
import React from 'react';
import { S, Q, CM, CL, ALLQ, N_Q, CONFLICTS, DOCSECS, TRACKS, SPECIAL, ui, setUI, AR, qcode, optT, placed, ansSummary, confOf } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon, Art } from '../../ui/Icon.jsx';
import { openDrawer, closeDrawer, DrawerHead } from '../../ui/overlays.jsx';
import { go } from '../../nav.js';
import { goQ } from '../play/actions.js';
import { QuestionCard, CardTop, AnswerCardFace } from '../play/QuestionCard.jsx';
import { AgentPanel, agentName } from '../agents/AgentPanel.jsx';
import { figFor, figSpecial, artOf } from './figures.js';

/** وجه البطاقة وبطاقات إجاباتها كما على الطاولة (lessonCard) */
export function LessonCard({ q }) {
  const s = q.s;
  return (
    <div className="ls-cards" style={{ '--c': s.c, '--ci': s.ci }}>
      <div className="qslot"><QuestionCard q={q} /></div>
      <div className={'arow' + (q.ans.length > 8 ? ' many' : '')}>
        {q.type === 'opt'
          ? q.ans.map((a) => a.spare
            ? <div key={a.k} className="acard spare"><CardTop q={q} a={a} /><span className="art"><Icon name="pen-line" /></span><b>{a.t || 'بطاقة احتياط'}</b><small>{a.d || ''}</small></div>
            : <AnswerCardFace key={a.k} q={q} a={a} />)
          : q.ans.slice(0, 1).map((a) => (
            <div key={a.k} className="acard"><CardTop q={q} /><span className="art"><Icon name="pen-line" /></span><b>بطاقة تعبئة</b><small>{a.head || a.prompt || ''}</small><span className="lnfake"><i /><i /><i /><i /><i /></span></div>
          ))}
      </div>
    </div>
  );
}

const Sec = ({ t, cls = '', children }) => <section className={'ls-s ' + cls}><h3>{t}</h3>{children}</section>;
/** يدرج فاصلاً نصياً بين العناصر (بديل join(' ')) */
const joinWith = (arr, sep = ' ') => arr.flatMap((x, i) => (i ? [sep, x] : [x]));

/** محتوى الدرس (lessonHTML). onNav(id) للتنقل السابق/التالي */
export function Lesson({ id, inGame = false, onNav }) {
  useEngine();
  const sp = SPECIAL.find((x) => x.id === id);
  if (sp) return (
    <article className="lesson">
      <div className="ls-h"><span className="eyebrow">أساسيات اللعبة</span><h2><Icon name={sp.ic} /> {sp.t}</h2></div>
      <Art as="div" className="ls-fig" html={figSpecial(sp.id)} />
      <p className="ls-p">{sp.body}</p>
      <h3>كيف تستفيدون منها</h3>
      <ol className="ls-ol">{sp.use.map((u, i) => <li key={i}>{u}</li>)}</ol>
    </article>
  );
  const q = Q[id]; if (!q) return null;
  const s = q.s, g = q.g || {}, r = CM[id] || {};
  const cfs = CONFLICTS.filter((c) => c.a[0] === id || c.b.some((b) => b[0] === id));
  const inS = S && placed(id);
  const i = ALLQ.indexOf(q);
  const nav = (to) => onNav && onNav(to);
  const cf = confOf(id);
  return (
    <article className="lesson" style={{ '--c': s.c, '--ci': s.ci }}>
      <div className="ls-h">
        <span className="eyebrow">المحور {AR(s.n)} · {s.name} — {s.ask} · {qcode(q)}</span>
        <h2>{q.t}</h2>
        <p>{q.sub || q.head || ''}{q.sub2 ? ' — ' + q.sub2 : ''}</p>
        {q.gold ? <span className="chip gold">★ بطاقة ذهبية بالإجماع</span> : null}
      </div>
      <LessonCard q={q} />
      <div className="ls-grid">
        <div>
          <Sec t="ما معنى هذه البطاقة؟">
            <p className="ls-p">{g.why || q.note || ''}</p>
            {q.note && g.why ? <p className="ls-note">{q.note}</p> : null}
          </Sec>
          <section className="ls-s"><h3>الرسم التوضيحي</h3><Art as="div" className="ls-fig" html={figFor(q)} /></section>
          <Sec t="كيف تُلعب">
            <ol className="ls-ol">
              <li>يقرأ قائد الجلسة السؤال: «{q.t}».</li>
              <li>{q.type === 'opt' ? (q.max > 1 ? `ناقشوا ثلاث دقائق واختاروا حتى ${AR(q.max)} بطاقات.` : 'ناقشوا ثلاث دقائق واختاروا بطاقة واحدة فقط.') : 'اكتبوا الإجابة على البطاقة بخط واضح، سطراً لكل فكرة.'}</li>
              {g.how ? <li>{g.how}</li> : null}
              <li>{q.gold ? 'ضعوها بإجماع الطاولة كاملة لأنها ذهبية.' : 'ضعوا البطاقة في فتحتها على لوحة الاستلام.'}</li>
              <li>ظلّلوا درجة التأكد، وارفعوا بطاقة شك إن لزم.</li>
            </ol>
          </Sec>
          {q.type === 'opt' ? (
            <Sec t="الإجابات: متى تختارون كلاً منها">
              <div className="ls-ans">
                {q.ans.filter((a) => !a.spare).map((a) => (
                  <div key={a.k}>
                    <b>{artOf(a) ? <Art className="art" html={artOf(a)} /> : null}{optT(a)}</b>
                    <p>{a.x || a.d || ''}</p>
                    {a.warn ? <p className="wn">⚠ {a.warn}</p> : null}
                  </div>
                ))}
              </div>
            </Sec>
          ) : (
            <Sec t="كيف تُكتب البطاقة">
              <div className="ls-ans">
                {q.ans.map((a) => (
                  <div key={a.k}>
                    <b>{a.code2 || a.head || q.slot}</b>
                    {a.fields ? <ul>{a.fields.map((f, j) => <li key={j}>{f[1]}</li>)}</ul> : null}
                    {a.prompt ? <p>{a.prompt}</p> : null}
                    {a.scales ? <p>{AR(a.scales.length)} مقاييس متقابلة، ظلّلوا دائرة من ٧ لكل مقياس.</p> : null}
                    {a.f === 'pestle' ? <p>سطر لكل بُعد بصيغة «التغيير ← فرصة أو تهديد علينا».</p> : null}
                    {a.f === 'comp' ? <p>الاسم، الخطورة، أهم قوة، أهم ضعف.</p> : null}
                  </div>
                ))}
              </div>
            </Sec>
          )}
          {g.ex ? <Sec t="مثال من سوقنا"><p className="ls-ex">{g.ex}</p></Sec> : null}
          {g.trap ? <Sec t="الخطأ الشائع"><p className="ls-trap">{g.trap}</p></Sec> : null}
          {g.tip ? <Sec t="نصيحة المنشّط"><p className="ls-tip">{g.tip}</p></Sec> : null}
          {q.tests ? <Sec t="اختبار جودة الإجابة"><p className="ls-p">{q.tests}</p></Sec> : null}
          {cfs.length ? (
            <Sec t="التعارضات المرتبطة">
              {cfs.map((c) => (
                <div key={c.id} className="ls-cf"><b><Icon name="triangle-alert" /> {c.title}</b><p>{c.why}</p><small>المخارج: {c.exits.join(' · ')}</small></div>
              ))}
            </Sec>
          ) : null}
        </div>
        <aside className="ls-side">
          <div className="ls-box">
            <h4><Icon name="file-text" /> ماذا تُنتج</h4>
            <p>{r.out || ''}</p>
            <h4>أين تذهب في الوثيقة</h4>
            <p>{joinWith((r.secs || []).map((n) => <span key={n} className="chip">{AR(n)} · {DOCSECS[n - 1].t}</span>))}</p>
            <p className="mini-note">{r.use || ''}</p>
            <h4>من يستلمها وينفّذ</h4>
            <p>{(r.recv || []).length ? joinWith(r.recv.map((k) => <span key={k} className="chip" style={{ color: TRACKS[k].c }}>{TRACKS[k].n}</span>)) : '—'}</p>
          </div>
          <div className="ls-box ag">
            <h4><Icon name="wand-sparkles" /> {agentName(q)}</h4>
            <p className="mini-note">يقيّم إجابتكم، ويقترح تطويرها، ويصوغ مخرجها للوثيقة، ويبني كل دورة على سابقتها.</p>
            {S ? <AgentPanel qid={id} small /> : <p className="mini-note">يعمل داخل مشروع مفتوح.</p>}
          </div>
          {inS ? (
            <div className="ls-box">
              <h4><Icon name="badge-check" /> إجابتكم الحالية</h4>
              <p><b>{ansSummary(q)}</b></p>
              {cf ? <p className="mini-note">التأكد {cf}/5 · {CL[cf].t}</p> : null}
            </div>
          ) : null}
          {S && inGame ? <button className="btn pri" style={{ width: '100%' }} onClick={() => lsToCard(id)}><Icon name="orbit" /> افتحها في يد اللاعب</button> : null}
          <div className="ls-nav">
            <button className="btn sm ghost" disabled={i === 0} onClick={() => nav(i > 0 ? ALLQ[i - 1].id : id)}><Icon name="chevron-right" /> السابق</button>
            <button className="btn sm ghost" disabled={i === N_Q - 1} onClick={() => nav(i < N_Q - 1 ? ALLQ[i + 1].id : id)}>التالي <Icon name="chevron-left" /></button>
          </div>
        </aside>
      </div>
    </article>
  );
}

/** «افتحها في يد اللاعب»: يغلق الدرج وينتقل للبطاقة على الطاولة */
function lsToCard(id) { closeDrawer(); if (ui.view !== 'play') go('play'); goQ(id); }

function LessonDrawer({ id }) {
  useEngine();
  return (
    <>
      <DrawerHead title={<><Icon name="book" /> الدرس</>}>
        <button className="btn sm ghost" onClick={() => { closeDrawer(); go('lessons', { lesson: id }); }}><Icon name="layout-grid" /> كل الدروس</button>
      </DrawerHead>
      <Lesson id={id} inGame={ui.view === 'play'} onNav={openLesson} />
    </>
  );
}

/** يفتح درس بطاقة (مثل '1_3') أو درساً أساسياً (مثل 'gold', 'physical') في الدرج العريض */
export function openLesson(id) {
  setUI({ lastLesson: id });
  openDrawer(<LessonDrawer key={id} id={id} />, { wide: true });
  setTimeout(() => { const d = document.querySelector('aside.drawer'); if (d) d.scrollTop = 0; }, 0);
}
