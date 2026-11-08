/* الصفحة التعريفية (v-home): الشريط العلوي، البطل مع الطاولة ثلاثية الأبعاد، الفكرة، المحاور، حلقة اللعب، المخرجات */
import React, { useEffect, useRef } from 'react';
import { Board, DEMO, LOGO, DOCSECS, STAGES, ALLQ, N_Q, AR, ICONS, cmsL, featOn } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { go } from '../../nav.js';

const STRIPES = ['#6A97CF', '#A3D16C', '#A58FC6', '#4DC2EC', '#E989BA', '#5CC3A5', '#EE5565', '#FBC23A'];
const Stripes = () => <div className="stripes">{STRIPES.map((c) => <i key={c} style={{ background: c }} />)}</div>;

/* أيقونة المساعد الذكي: كانت تُضاف لمكتبة الأيقونات من aichat.js؛ نرسمها هنا إن لم تكن في المحرّك */
function BotIcon() {
  if (ICONS.bot) return <Icon name="bot" />;
  return (
    <svg className="ic " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  );
}

/* تمرير ناعم داخل الصفحة (data-scroll في الأصل) */
function scrollToSec(e, id) {
  e.preventDefault();
  const t = document.getElementById(id);
  if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

/* رفع صور اللعبة المطبوعة (toUpload) */
function toUpload() {
  go('start', { startTab: 'photo', created: null });
  setTimeout(() => { const f = document.getElementById('startForm'); f && f.scrollIntoView({ block: 'start' }); }, 60);
}
const toLessons = (e) => { e.preventDefault(); go('lessons'); };

export default function Home() {
  useEngine();
  const hero = useRef(null);
  useEffect(() => {
    if (!hero.current) return;
    Board.mount(hero.current, 'hero');
    Board.sync(DEMO);
    /* فتح الرابط على قسم معيّن (#idea #axes #how #out) */
    const h = (location.hash || '').slice(1);
    if (['idea', 'axes', 'how', 'out'].includes(h)) { const t = document.getElementById(h); t && t.scrollIntoView(); }
  }, []);

  /* نصوص الواجهة من إدارة المحتوى (applyLanding) */
  const P = (cmsL().landing) || {};
  const gold = ALLQ.filter((q) => q.gold).length;
  const p1 = STAGES.slice(0, 4).reduce((a, s) => a + s.min, 0), p2 = STAGES.slice(4).reduce((a, s) => a + s.min, 0);
  const scanOn = featOn('scan');

  return (
    <section id="v-home">
      <Stripes />
      <header className="lnav"><div className="wrap in">
        <span className="brandmk"><img id="logoNav" src={LOGO} alt="شعار براند ماب" /><span>براند ماب<small>BRAND MAP</small></span></span>
        <nav aria-label="أقسام الصفحة">
          <a href="#lessons" onClick={toLessons}>الدروس</a>
          <a href="#idea" onClick={(e) => scrollToSec(e, 'idea')}>الفكرة</a>
          <a href="#axes" onClick={(e) => scrollToSec(e, 'axes')}>المحاور</a>
          <a href="#how" onClick={(e) => scrollToSec(e, 'how')}>كيف تُلعب</a>
          <a href="#out" onClick={(e) => scrollToSec(e, 'out')}>ماذا تستلم</a>
        </nav>
        <button className="btn pri" onClick={() => go('start')}>ابدأ</button>
      </div></header>

      <div className="hero"><div className="wrap in">
        <div>
          <p className="eyebrow">{P.eyebrow || 'لعبة طاولة لبناء استراتيجية العلامة'}</p>
          {(P.a || P.b)
            ? <h1>{P.a || ''} <em>{P.b || ''}</em></h1>
            : <h1>ثمانية قرارات <em>تصنع علامة</em></h1>}
          <p className="lead">{P.lead || 'معظم العلامات في سوقنا تبدأ من النهاية: شعار قبل تموضع، وحساب إنستغرام قبل جمهور، واسم اختير في جلسة عائلية. براند ماب يعكس الترتيب. يجلس الفريق حول لوحة واحدة، يقرأ البطاقة، يتناقش ثلاث دقائق، ثم يضع قراره في فتحته. بعد جلستين تخرج بخريطة كاملة ووثيقة استراتيجية ولوحة متابعة تبقى معك بعد الورشة.'}</p>
          <div className="acts">
            <button className="btn gold big" onClick={() => go('start')}>ابدأ الآن</button>
            <a className="btn big ghost" href="#how" onClick={(e) => scrollToSec(e, 'how')}>كيف تُلعب؟</a>
            {scanOn && <button className="btn big ghost" onClick={toUpload}>📷 ارفع صور لعبتك المطبوعة</button>}
            <a className="btn big ghost" href="#lessons" onClick={toLessons}>الدروس</a>
          </div>
          <div className="facts">
            <div><b className="num">{STAGES.length}</b><span>محاور من السوق إلى الرؤية</span></div>
            <div><b className="num">{N_Q}</b><span>بطاقة قرار</span></div>
            <div><b className="num">{gold}</b><span>قرارات ذهبية بالإجماع</span></div>
            <div><b className="num">2×90</b><span>دقيقة على جلستين</span></div>
          </div>
        </div>
        <div className="hero3d" id="hero3d" ref={hero}><div className="cap"><span>لوحة توضيحية · اسحب لتدوير الطاولة</span><span>كل محور يكتمل يعيد بتلته إلى الزهرة</span></div></div>
      </div></div>

      <section className="sec" id="idea"><div className="wrap problem">
        <div><p className="eyebrow">الفكرة</p><h2 style={{ marginTop: 8 }}>لماذا لعبة وليس استبياناً؟</h2>
          <blockquote style={{ marginTop: 22 }}>الاستشارة الاستراتيجية بقيت حكراً على من يملك ميزانيتها وصبراً على تقاريرها. براند ماب يفكّك علم بناء العلامات إلى ٣٥ بطاقة قرار، ويضعها <b>على الطاولة</b>.</blockquote>
          <p className="kick">كل بطاقة إطار عالمي مصغّر، من تحليل بنية السوق إلى النماذج السردية، بروح عربية وأمثلة من سوقنا.</p></div>
        <div className="whys">
          <div className="why"><span className="ico" id="w1"><Icon name="users" /></span><div><b>الطاولة تكسر رهبة الاستشارة</b><p>يقول الشريك على الطاولة ما يخفيه في الاجتماع، لأن القرار يُتّخذ لعباً لا عرضاً.</p></div></div>
          <div className="why"><span className="ico" id="w2"><Icon name="layout-grid" /></span><div><b>البطاقة تجبر على الاختيار</b><p>«جمهورنا الجميع» تنتهي عند بطاقة لا تقبل إلا شريحة واحدة.</p></div></div>
          <div className="why"><span className="ico" id="w3"><Icon name="circle-help" /></span><div><b>الفتحة الفارغة تفضح القرار المؤجَّل</b><p>ترى بنظرة واحدة ما حُسم على اللوحة وما زال معلّقاً.</p></div></div>
        </div>
      </div></section>

      <section className="sec" id="axes"><div className="wrap">
        <p className="eyebrow">رحلة المحاور الثمانية</p><h2 style={{ marginTop: 8 }}>من الخارج إلى الداخل</h2>
        <p className="kick">تفهم الملعب، ثم لمن تلعب، ثم ماذا تقدّم، فمن أنت، فماذا تقول، فما اسمك، فكيف تبدو، وأخيراً إلى أين. كل محور يبني على ما قبله، ولهذا يُمنع القفز: من يختار ألوانه قبل جمهوره يلوّن لنفسه لا لعميله.</p>
        <div className="axes" id="axesList">
          {STAGES.map((s) => (
            <article key={s.n} className="ax" style={{ '--c': s.c, '--ci': s.ci }}>
              <div className="n"><span>المحور {AR(s.n)}</span><span className="num">{s.qs.length} بطاقات · {s.min} د</span></div>
              <h3>{s.name}</h3>
              <div className="q">{s.ask}</div>
              <ul>{s.qs.map((q) => <li key={q.id || q.no} className={q.gold ? 'g' : ''}>{q.gold ? '★ ' : ''}{q.slot}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="sessbar" id="sessBar">
          <div><b>الجلسة الأولى · {AR(p1)} دقيقة</b><br />السوق ← الجمهور ← القيمة ← الشخصية: «أين تلعب ومن أنت؟»</div>
          <div><b>الجلسة الثانية · {AR(p2)} دقيقة</b><br />الرسالة ← التسمية ← الهوية ← الرؤية: «ماذا تقول وكيف تبدو؟»</div>
        </div>
      </div></section>

      <section className="sec" id="how"><div className="wrap">
        <p className="eyebrow">حلقة اللعب</p><h2 style={{ marginTop: 8 }}>ست خطوات لكل بطاقة</h2>
        <p className="kick">من ٢ إلى ٦ لاعبين، والمثالي ٣ أو ٤ من صنّاع القرار الفعليين. ثلاثة أدوار تُوزَّع أول الجلسة: قائد الجلسة يقرأ ويدير، والكاتب يملأ البطاقات، وحارس الوقت يملك الجرس.</p>
        <ol className="loop" style={{ marginTop: 44 }}>
          <li><b>اقرأ</b><span>سؤال واحد بصوت مسموع. البطاقة تنفتح للجميع على أجهزتهم.</span></li>
          <li className="t"><b>ناقش ٣ دقائق</b><span>مؤقت على كل إجابة. الخلاف مسموح والتأجيل ممنوع، والجرس يرنّ عند النهاية.</span></li>
          <li><b>قرّر وضَع</b><span>البطاقة تطير إلى فتحتها على اللوحة، والبيدق يتقدّم.</span></li>
          <li><b>حدّد التأكد</b><span>ظلّل من ١ إلى ٥. دائرتان أو أقل تعني «قائمة إعادة النظر».</span></li>
          <li><b>افحص التعارض</b><span>كرت أحمر يرتفع فوق اللوحة حين يتصادم قراران، وله ثلاثة مخارج.</span></li>
          <li><b>وثّق</b><span>كل حركة تُحفظ لحظياً، ويُسجَّل زمن نقاش كل إجابة.</span></li>
        </ol>
        <div className="rules">
          <div className="rule g"><h3>★ قاعدة الذهبية</h3><p>الشريحة الأهم، والقيمة الأساسية، ونوع الاسم: ثلاث بطاقات ذهبية لا تُقلب بعد وضعها إلا بإجماع الطاولة كاملة، لا بالأغلبية. اللون يتغيّر بقرار مصمم، أما الاسم فتغييره إحراق لرأس مال العلامة.</p></div>
          <div className="rule"><h3>⚑ قاعدة درجة التأكد</h3><p>أي قرار ظُلّلت له دائرتان أو أقل يدخل تلقائياً «قائمة إعادة النظر» في نهاية المحور. القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب.</p></div>
        </div>
        <div className="whys" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', display: 'grid', marginTop: 14 }}>
          <div className="why"><span className="ico" id="f1"><Icon name="orbit" /></span><div><b>طاولة ثلاثية الأبعاد</b><p>لوحة دائرية تطابق الخريطة المطبوعة، تدور وتقترب من البطاقة الحالية.</p></div></div>
          <div className="why"><span className="ico" id="f2"><Icon name="music" /></span><div><b>مكتبة صوتية</b><p>عود على مقام الحجاز، مطر، ليل الصحراء، ومؤثرات لكل حركة على الطاولة.</p></div></div>
          <div className="why"><span className="ico" id="f3"><Icon name="share-2" /></span><div><b>فريق على أجهزة متعددة</b><p>رمز واحد للجلسة، والكل يرى الطاولة نفسها والمؤقت نفسه لحظياً.</p></div></div>
          {featOn('consult') && <div className="why"><span className="ico" id="f4"><Icon name="handshake" /></span><div><b>مستشارون حقيقيون</b><p>احجزوا مستشاراً معتمداً بالاسم والتخصص والموعد، أو اطلبوا انضمامه للطاولة أثناء اللعب.</p></div></div>}
          {featOn('chat') && <div className="why"><span className="ico" id="f5"><BotIcon /></span><div><b>مساعد ذكي للعبة</b><p>اسألوه عن أي بطاقة أو قاعدة في أي لحظة، ويحيلكم للمستشار حين يحتاج القرار رأياً بشرياً.</p></div></div>}
        </div>
      </div></section>

      <section className="sec" id="out"><div className="wrap">
        <p className="eyebrow">المخرجات</p><h2 style={{ marginTop: 8 }}>ماذا تستلم في النهاية؟</h2>
        <div className="outs">
          <div className="out"><span className="ico" style={{ background: '#3F72B5' }} id="o1"><Icon name="map" /></span><h3>الخريطة المكتملة</h3><p>٣٥ قراراً على لوحة واحدة، مع زمن نقاش كل إجابة ودرجة تأكدها وبطاقات الشك.</p></div>
          <div className="out"><span className="ico" style={{ background: '#2E9477' }} id="o2"><Icon name="file-text" /></span><h3>وثيقة المشروع</h3><p>ملف Word جاهز للتحرير، مبني على أحد عشر قسماً:</p><ol id="docList">{DOCSECS.map((d) => <li key={d.n}>{d.t}</li>)}</ol></div>
          <div className="out"><span className="ico" style={{ background: '#B07A00' }} id="o3"><Icon name="layout-dashboard" /></span><h3>لوحة متابعة ثابتة</h3><p>تبقى للعميل بعد الجلسة: مسؤول ومؤشر لكل محور، ودورة مراجعة أسبوعية أو شهرية أو ربع سنوية، وسجل يُظهر اتجاه كل محور، وخطة ٣٠/٦٠/٩٠ مشتقّة من القرارات.</p></div>
        </div>
      </div></section>

      <div className="wrap"><div className="ctaband"><Stripes />
        <h2>جاهز لرسم خريطة علامتك؟</h2><p>أنشئ جلسة في أقل من دقيقة، وشارك رمزها مع فريقك، وابدأ من محور السوق.</p><button className="btn gold big" onClick={() => go('start')}>ابدأ</button></div>
        <footer className="lfoot"><span>Brand Map™ · من إنتاج زورق للتسويق والإعلام</span><span>القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب</span></footer></div>
    </section>
  );
}
