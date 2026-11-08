/* وجوه البطاقات: بطاقة السؤال، رأس البطاقة، ووجه بطاقة الإجابة الثابت (qCardHTML/cardTop/artOf في الأصل).
   تعمل بلا جلسة (S قد يكون null) لأنها تُستخدم في الدروس ومعاينات الإدارة أيضاً. */
import React from 'react';
import { S, AR, qcode, optT, face, art, fixedName, colorOf, initial, memberName } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon, Art } from '../../ui/Icon.jsx';
import { openLesson } from '../lessons/LessonDrawer.jsx';

const cx = (...a) => a.filter(Boolean).join(' ');

/** رأس البطاقة: رمزها واسم فتحتها (cardTop). بلا a يظهر رمز السؤال */
export function CardTop({ q, a }) {
  return <span className="ac-top"><span className="num">{a ? 'Q' + q.no + '.' + a.k : qcode(q)}</span><span>{q.slot}</span></span>;
}

/** هل لهذه الإجابة رسم؟ (artOf في الأصل يعيد نصاً فارغاً حين لا رسم) */
export function hasArt(a) { if (!a) return false; if (a.col || a.face || a.ic) return true; if (a.art) return !!art(a.art); return false; }

/** الرسم داخل <span class="art"> (لون، وجه، رسم، أو أيقونة) — null إن لم يوجد */
export function ArtOf({ a }) {
  if (!a) return null;
  if (a.col) return <span className="art"><span className="sw" style={{ background: a.col }} /></span>;
  if (a.face) return <Art className="art" html={face(a.face)} />;
  if (a.art) { const h = art(a.art); if (h) return <Art className="art" html={h} />; }
  if (a.ic) return <span className="art"><Icon name={a.ic} /></span>;
  return null;
}

/** أصوات الطاولة على إجابة (votesHTML) */
export function votersOf(qid, k) { const V = (S && S.votes && S.votes[qid]) || {}; return Object.entries(V).filter(([, a]) => Array.isArray(a) && a.includes(k)).map(([u]) => u); }
export function Votes({ qid, k }) {
  const v = votersOf(qid, k); if (!v.length) return null;
  return (
    <span className="votes" title={v.map(memberName).join('، ')}>
      {v.slice(0, 4).map((u) => <i key={u} style={{ background: colorOf(u) }}>{initial(memberName(u))}</i>)}
      {v.length > 4 ? <i className="n">+{v.length - 4}</i> : null}
    </span>
  );
}

/** وجه بطاقة الإجابة الثابت (رسم، عنوان، وصف، مثال، اقتباس). as='button' للبطاقات القابلة للاختيار؛ children تُلحق في الآخر (مثل الأصوات) */
export function AnswerCardFace({ q, a, as: Tag = 'div', className = '', children, ...rest }) {
  if (!q || !a) return null;
  if (a.spare) {
    return (
      <Tag className={cx('acard spare', className)} {...rest}>
        <CardTop q={q} a={a} /><span className="art"><Icon name="pen-line" /></span><b>{a.t || 'بطاقة احتياط'}</b><small>{a.d || ''}</small>{children}
      </Tag>
    );
  }
  if (a.f) {
    return (
      <Tag className={cx('acard', className)} {...rest}>
        <CardTop q={q} /><span className="art"><Icon name="pen-line" /></span><b>بطاقة تعبئة</b><small>{a.head || a.prompt || ''}</small>
        <span className="lnfake"><i /><i /><i /><i /><i /></span>{children}
      </Tag>
    );
  }
  return (
    <Tag className={cx('acard', className)} {...rest}>
      <CardTop q={q} a={a} /><ArtOf a={a} /><b>{optT(a)}</b>
      {a.d ? <small>{a.d}</small> : null}{a.ex ? <span className="ex">{a.ex}</span> : null}{a.q ? <span className="quote">{a.q}</span> : null}{children}
    </Tag>
  );
}

/** بطاقة السؤال (qCardHTML) */
export function QuestionCard({ q }) {
  useEngine();
  if (!q) return null;
  const s = q.s, fx = s.n === 6 ? fixedName() : '';
  return (
    <article className={cx('qcard', q.gold && 'gold')}>
      <div className="qc-top"><span>المحور {AR(s.n)} · {s.name}</span><span className="qno">{qcode(q)}</span></div>
      <span className="qc-ic"><Icon name={q.ic || 'circle-help'} /></span>
      <h2>{q.tag ? <small>{q.tag}</small> : null}{q.t}</h2>
      {q.sub ? <p>{q.sub}{q.sub2 ? ' — ' + q.sub2 : ''}</p> : null}
      {q.note ? <div className="qc-note">{q.note}</div> : null}
      {q.gold ? <div className="qc-gold">★ بطاقة ذهبية: لا توضع ولا تُقلب إلا بإجماع الطاولة</div> : null}
      {fx ? <div className="qc-note"><Icon name="lock" /> الاسم محسوم مسبقاً: <b>{fx}</b>. العبوا المحور فحصاً لا توليداً.</div> : null}
      <div className="qc-foot"><span>{s.ask}</span><button type="button" onClick={() => openLesson(q.id)}><Icon name="book" /> درس البطاقة</button></div>
    </article>
  );
}

export default QuestionCard;
