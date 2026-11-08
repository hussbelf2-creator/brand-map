/* شاشة البداية (v-start): شريط الحساب، التسجيل، جلسة جديدة / انضمام / رفع صور، شاشة الإنشاء، وجلساتي وجلسات الفريق */
import React, { useEffect, useState } from 'react';
import {
  S, CODE, ME, PROFILE, IS_ADMIN, LOCAL, CAP, ui, setUI, STAGES, ALLQ, N_Q, AR, LOGO, LS, DEF_TIMER, ROLES, CONS_ROLE, SND,
  flag, cmsS, featOn, colorOf, initial, fmtDate, ago, ikCount, normCode, createSession, openSession, afterOpen, saveProfile, ensureConsProfile,
} from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { toast, openDrawer, DrawerHead } from '../../ui/overlays.jsx';
import { copyText } from '../../ui/util.js';
import { go, setHash } from '../../nav.js';
import { PlanChip } from '../plans/PlansModal.jsx';
import { openIntake } from '../intake/IntakeOverlay.jsx';
import { openScan } from '../scan/ScanOverlay.jsx';
import { openLesson } from '../lessons/LessonDrawer.jsx';

const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
const focusSel = (sel, ms = 0) => setTimeout(() => { const i = document.querySelector(sel); i && i.focus(); }, ms);
const pct = (n) => Math.round((n || 0) / N_Q * 100) + '%';
const placedIn = (x) => ALLQ.filter((q) => (x.place || {})[q.id] && x.place[q.id].length).length;

/* ---------- أفعال مشتركة ---------- */
function setTab(v) { setUI({ startTab: v, created: null, editProfile: false }); focusSel('#startForm input', 30); }
async function openRecent(code) { if (await openSession(code)) { afterOpen(); go(S.done ? 'dash' : 'play'); } }
/* بعد إنشاء/فتح جلسة اللعبة المطبوعة: لوحة الاستلام ثنائية الأبعاد ثم نافذة رفع الصور */
export function startScanFlow() { setUI({ created: null, boardMode: '2d' }); go('play'); setTimeout(openScan, 120); }

/* ---------- قائمة المسجّلين (للإدارة فقط) ---------- */
export function openAdmin() {
  if (!CAP.db) { toast('قائمة المسجّلين متاحة في الأداة المنشورة فقط.', 'err'); return; }
  openDrawer(<RegisteredUsers />);
}
function RegisteredUsers() {
  const [st, setSt] = useState({ rows: null, ses: [], err: false });
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [f, s] = await Promise.all([CAP.db.collection('facilitators').limit(200).get(), CAP.db.collection('sessions').limit(300).get()]);
        const ses = s.docs.map((x) => x.data()).filter(Boolean);
        const rows = f.docs.map((x) => x.data()).filter((x) => x && x.name).sort((a, b) => (b.at || 0) - (a.at || 0));
        if (live) setSt({ rows, ses, err: false });
      } catch (e) { if (live) setSt({ rows: null, ses: [], err: true }); }
    })();
    return () => { live = false; };
  }, []);
  const { rows, ses, err } = st;
  return (
    <>
      <DrawerHead title={<><Icon name="users" /> المسجّلون في المنصة</>} />
      <p className="mini-note">يراها مالك المنصة ومحرّروها فقط.</p>
      <div id="admBox" className="rlist" style={{ marginTop: 12 }}>
        {err ? <p className="empty">تعذّر تحميل القائمة.</p>
          : !rows ? <p className="empty">يحمّل…</p>
            : rows.length ? rows.map((r, i) => {
              const mine = ses.filter((x) => x.owner === r.uid); const done = mine.filter((x) => x.done).length;
              return (
                <div key={r.uid || i} className="ritem" style={{ '--c': '#24364A', gridTemplateColumns: '6px 1fr' }}><i />
                  <span><b>{r.name} <small style={{ color: 'var(--muted)' }}>· {r.role || ''}</small></b>
                    <small>{r.org || ''}{r.city ? ' · ' + r.city : ''}</small>
                    <small dir="ltr" style={{ display: 'block', textAlign: 'right' }}>{r.email || ''}{r.phone ? ' · ' + r.phone : ''}</small>
                    <small>سجّل {fmtDate(r.at)} · {AR(mine.length)} جلسات{done ? ' · ' + AR(done) + ' لوحات عملاء' : ''}</small></span>
                </div>
              );
            }) : <p className="empty">لا مسجّلين بعد.</p>}
      </div>
    </>
  );
}

/* ---------- شريط الحساب ---------- */
function AccountBar() {
  const admin = IS_ADMIN ? <button className="btn sm gold" onClick={() => go('admin')}><Icon name="cog" /> لوحة الإدارة</button> : null;
  if (!PROFILE) return (
    <div className="acct"><span className="ico"><Icon name="user-plus" /></span><span><b>لم تسجّل بعد</b><small>إنشاء الجلسات يحتاج حساب منشّط. الانضمام لجلسة لا يحتاج تسجيلاً.</small></span>{admin}</div>
  );
  return (
    <div className="acct on"><span className="av" style={{ background: colorOf(ME.id || 'x') }}>{initial(PROFILE.name)}</span>
      <span><b>{PROFILE.name}</b><small>{[PROFILE.role, PROFILE.org].filter(Boolean).join(' · ')}</small></span>
      <span style={{ marginInlineStart: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {admin}
        <PlanChip />
        {PROFILE.role === CONS_ROLE ? <button className="btn sm gold" onClick={() => go('consult')}><Icon name="handshake" /> لوحة المستشار</button> : null}
        <button className="btn sm ghost" onClick={() => go('lessons')}><Icon name="book" /> الدروس</button>
        <button className="btn sm ghost" onClick={() => setUI({ editProfile: true, startTab: 'new' })}><Icon name="pen-line" /> ملفي</button>
        <button className="btn sm pri" onClick={() => go('projects')}><Icon name="layout-grid" /> مشاريعي</button>
      </span>
    </div>
  );
}

/* ---------- نموذج التسجيل / ملف المنشّط ---------- */
function RegForm({ edit }) {
  const p = PROFILE || {};
  const [f, setF] = useState(() => ({ name: p.name || '', email: p.email || '', phone: p.phone || '', org: p.org || '', city: p.city || '', role: p.role || ROLES[0], ok: !!edit }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  if (!edit && !flag('register') && !IS_ADMIN) {
    const mail = (cmsS().contact || {}).email;
    return <div className="formcard"><div className="emptyst"><Icon name="lock" /><b>التسجيل الجديد مغلق مؤقتاً</b><p>يمكنكم الانضمام لجلسة برمزها. للتسجيل تواصلوا مع فريق المنصة{mail ? ': ' + mail : ''}.</p></div></div>;
  }

  async function submit(e) {
    e.preventDefault();
    const name = f.name.trim(), email = f.email.trim(), org = f.org.trim();
    if (!name || !org) { toast('أكمل الاسم والجهة.', 'err'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('اكتب بريداً إلكترونياً صحيحاً.', 'err'); return; }
    if (!f.ok) { toast('وافق على حفظ البيانات لإكمال التسجيل.', 'err'); return; }
    setBusy(true);
    const ok = await saveProfile({ name, email, org, phone: f.phone.trim(), city: f.city.trim(), role: ROLES.includes(f.role) ? f.role : ROLES[0] });
    setBusy(false);
    if (ok && PROFILE && PROFILE.role === CONS_ROLE) await ensureConsProfile();
    if (ok) {
      toast(ui.editProfile ? 'حُفظ ملفك.' : 'أهلاً ' + name + '! أصبح بإمكانك إنشاء الجلسات.', 'gold');
      setUI({ editProfile: false, startTab: ui.startTab === 'photo' ? 'photo' : 'new', photoReg: false });
      setTimeout(() => { const i = document.getElementById('nBrand') || document.getElementById('phBrand'); i && i.focus(); }, 30);
    }
  }

  return (
    <form className="formcard" id="fReg" autoComplete="on" onSubmit={submit}>
      <div className="reghead"><span className="ico" style={{ background: '#24364A' }}><Icon name="user-plus" /></span><div><h2>{edit ? 'ملف المنشّط' : 'سجّل في المنصة أولاً'}</h2><p className="mini-note">حساب المنشّط يجمع جلساتك ولوحات عملائك في مكان واحد. دخولك مرتبط بحسابك في Claude، فلا تحتاج كلمة مرور. بياناتك يراها مالك المنصة فقط، ولا تظهر للاعبين.</p></div></div>
      <div className="formgrid">
        <label className="fld">الاسم الكامل *<input className="inp" id="rName" required maxLength={60} autoComplete="name" value={f.name} onChange={set('name')} /></label>
        <label className="fld">البريد الإلكتروني *<input className="inp" id="rEmail" type="email" required maxLength={80} autoComplete="email" dir="ltr" value={f.email} onChange={set('email')} placeholder="name@company.com" /></label>
        <label className="fld">رقم الجوال<input className="inp" id="rPhone" type="tel" maxLength={20} autoComplete="tel" dir="ltr" value={f.phone} onChange={set('phone')} placeholder="05XXXXXXXX" /></label>
        <label className="fld">الجهة أو الشركة *<input className="inp" id="rOrg" required maxLength={60} autoComplete="organization" value={f.org} onChange={set('org')} /></label>
        <div className="fld full">دورك<div className="seg" id="rRole">{ROLES.map((r) => <button type="button" key={r} className={f.role === r ? 'on' : ''} onClick={() => setF({ ...f, role: r })}>{r}</button>)}</div></div>
        <label className="fld">المدينة<input className="inp" id="rCity" maxLength={40} value={f.city} onChange={set('city')} placeholder="الرياض" /></label>
      </div>
      <label className="consent"><input type="checkbox" id="rOk" checked={f.ok} onChange={set('ok')} required /> أوافق على حفظ بياناتي لإدارة الجلسات والتواصل بخصوصها.</label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn pri big" type="submit" disabled={busy}><Icon name="check" /> {edit ? 'احفظ الملف' : 'سجّل وتابع لإنشاء الجلسة'}</button>
        {edit ? <button className="btn big ghost" type="button" onClick={() => setTab('new')}>إلغاء</button> : null}
      </div>
    </form>
  );
}

/* ---------- جلسة جديدة ---------- */
const DURS = [[120, 'دقيقتان'], [180, '٣ دقائق'], [300, '٥ دقائق']];
function NewForm() {
  const [v, setV] = useState(() => ({ brand: '', team: '', fac: (PROFILE && PROFILE.name) || '', me: ME.alias || '', mode: 'digital', dur: DEF_TIMER }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!PROFILE) { toast('سجّل حساب المنشّط أولاً.', 'err'); return; }
    const brand = v.brand.trim(); if (!brand) { toast('اكتب اسم العلامة.', 'err'); return; }
    ME.alias = v.me.trim(); LS.set('bm3:alias', ME.alias);
    const dur = DURS.some(([d]) => d === v.dur) ? v.dur : 180;
    setBusy(true);
    const code = await createSession({ brand, team: v.team.trim(), facilitator: v.fac.trim(), dur, mode: v.mode || 'digital' });
    setBusy(false);
    if (code && await openSession(code)) {
      afterOpen(); setUI({ created: code }); setHash('start'); SND.play('gold');
      setTimeout(() => { const c = document.querySelector('.created2'); c && c.scrollIntoView({ behavior: smooth(), block: 'start' }); }, 60);
    }
  }

  return (
    <form className="formcard" id="fNew" autoComplete="off" onSubmit={submit}>
      <div className="formgrid">
        <label className="fld full">اسم العلامة أو المشروع *<input className="inp" id="nBrand" required maxLength={60} placeholder="مثال: كوما" value={v.brand} onChange={set('brand')} /></label>
        <label className="fld">الفريق<input className="inp" id="nTeam" maxLength={60} placeholder="المؤسسون + التسويق" value={v.team} onChange={set('team')} /></label>
        <label className="fld">المنشّط (قائد الجلسة)<input className="inp" id="nFac" maxLength={60} placeholder="اسم من يدير النقاش" value={v.fac} onChange={set('fac')} /></label>
        <label className="fld">اسمك على الطاولة<input className="inp" id="nMe" maxLength={40} value={v.me} onChange={set('me')} placeholder="يظهر مع تسجيلات المتابعة" /></label>
        <div className="fld full">طريقة اللعب<div className="modes" id="nMode">
          <button type="button" className={v.mode === 'digital' ? 'on' : ''} onClick={() => setV({ ...v, mode: 'digital' })}><Icon name="orbit" /><b>رقمي على الشاشة</b><small>الطاولة ثلاثية الأبعاد والبطاقات على أجهزة الفريق.</small></button>
          <button type="button" className={v.mode === 'physical' ? 'on' : ''} onClick={() => setV({ ...v, mode: 'physical' })}><Icon name="camera" /><b>بطاقات مطبوعة + تصوير</b><small>العبوا باللعبة المطبوعة، ثم صوّروا لوحة الاستلام لتُعبّأ المنصة.</small></button>
        </div></div>
        <div className="fld">مدة النقاش لكل بطاقة<div className="seg" id="nDur">{DURS.map(([d, t]) => <button type="button" key={d} className={v.dur === d ? 'on' : ''} onClick={() => setV({ ...v, dur: d })}>{t}</button>)}</div></div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}><button className="btn pri big" type="submit" disabled={busy}><Icon name="plus" /> أنشئ الجلسة</button><span className="mini-note">القاعدة في الدليل: ٣ دقائق لكل بطاقة، الخلاف مسموح والتأجيل ممنوع.</span></div>
    </form>
  );
}

/* ---------- الانضمام لجلسة + جلسات الفريق ---------- */
function TeamSessions() {
  const [d, setD] = useState([]);
  useEffect(() => {
    if (LOCAL || !CAP.db) return;
    let live = true;
    CAP.db.collection('sessions').limit(60).get().then((qs) => {
      if (!live) return;
      setD(qs.docs.map((x) => x.data()).filter((x) => x && x.code).sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 12));
    }).catch(() => {});
    return () => { live = false; };
  }, [CAP]);
  return (
    <div id="teamList">
      {d.length ? <>
        <h3 style={{ fontSize: 15, marginTop: 6 }}>جلسات الفريق في هذه الأداة</h3>
        <div className="slist" style={{ marginTop: 8 }}>{d.map((x) => {
          const n = placedIn(x);
          return <button type="button" key={x.code} onClick={() => openRecent(x.code)}><Icon name={x.done ? 'badge-check' : 'users'} /><span className="meta"><b>{x.brand}</b><small>{x.team || ''} {x.done ? '· مكتملة' : '· ' + n + ' من ' + N_Q}</small></span><span className="pg"><i style={{ width: pct(n) }} /></span><span className="codechip">{x.code}</span></button>;
        })}</div>
      </> : null}
    </div>
  );
}
function JoinForm() {
  const [code, setCode] = useState('');
  const [me, setMe] = useState(ME.alias || '');
  async function submit(e) {
    e.preventDefault();
    const c = normCode(code); if (!c) return;
    ME.alias = me.trim(); LS.set('bm3:alias', ME.alias);
    if (await openSession(c)) { afterOpen(); go(S.done ? 'dash' : 'play'); toast('انضممت إلى طاولة ' + S.brand); }
  }
  return (
    <form className="formcard" id="fJoin" autoComplete="off" onSubmit={submit}>
      <div className="formgrid">
        <label className="fld">رمز الجلسة<div className="codebox"><input className="inp" id="jCode" required maxLength={7} placeholder="BM-XXXX" value={code} onChange={(e) => setCode(e.target.value)} /></div></label>
        <label className="fld">اسمك على الطاولة<input className="inp" id="jMe" maxLength={40} value={me} onChange={(e) => setMe(e.target.value)} placeholder="اختياري" /></label>
      </div>
      <button className="btn pri big" type="submit"><Icon name="log-in" /> انضم للطاولة</button>
      <TeamSessions />
    </form>
  );
}

/* ---------- شاشة ما بعد الإنشاء: رقمي أو لعب فيزيائي بأربع خطوات ---------- */
function Created() {
  const n = S ? ikCount() : 0, ok = n === 11, phy = !!(S && S.cfg && S.cfg.mode === 'physical');
  const intake = () => { if (!S) return; openIntake(); };
  const top = (
    <div className="cr-top"><span className="chip ok"><Icon name="check" /> أُنشئت الجلسة{phy ? ' · لعب فيزيائي' : ''}</span><div className="bigcode">{ui.created}</div><p className="mini-note">رمز الجلسة. شاركه مع فريقك ليدخلوا من أجهزتهم.</p><button className="btn sm" onClick={() => copyText(ui.created || CODE, 'نُسخ رمز الجلسة')}><Icon name="clipboard-copy" /> انسخ الرمز</button></div>
  );
  const s1 = (
    <li className={ok ? 'ok' : 'cur'}><span className="sn">{ok ? '✓' : '١'}</span><div className="sb"><b>املأ بطاقة المشروع</b><p>١١ معلومة واقعية في دقيقتين تقريباً. ليست قرارات، بل الأرض التي تلعب عليها الطاولة. يمكن إكمالها بعد اللعب، لكنها إلزامية قبل لوحة المتابعة.</p>
      <div className="np"><span className="meter"><i style={{ width: (n / 11 * 100) + '%' }} /></span><small className="num">{n}/11</small></div>
      <button className={'btn ' + (ok ? '' : 'gold') + ' big'} onClick={intake}><Icon name="clipboard-list" /> {n ? (ok ? 'راجع البطاقة' : 'أكمل بطاقة المشروع') : 'ابدأ بطاقة المشروع'}</button></div></li>
  );
  if (!phy) return (
    <div className="formcard created2">{top}<ol className="nsteps">{s1}
      <li className={ok ? 'cur' : ''}><span className="sn">٢</span><div className="sb"><b>ادخل الطاولة</b><p>ابدأ من محور السوق. جملة التعريف من البطاقة تتصدّر اللوحة لكل الفريق.</p><button className={'btn ' + (ok ? 'pri' : '') + ' big'} onClick={() => go('play')}><Icon name="play" /> {ok ? 'ادخل الطاولة' : 'تخطَّ البطاقة وادخل الطاولة'}</button></div></li></ol></div>
  );
  return (
    <div className="formcard created2">{top}<ol className="nsteps four">{s1}
      <li><span className="sn">٢</span><div className="sb"><b>العبوا بالبطاقات المطبوعة</b><p>على لوحة الاستلام المطبوعة، بحلقة اللعب نفسها: اقرأ، ناقش ٣ دقائق، قرّر، ظلّل التأكد.</p><button className="btn big ghost" onClick={() => openLesson('physical')}><Icon name="book" /> طريقة اللعب والتصوير</button></div></li>
      <li className={ok ? 'cur' : ''}><span className="sn">٣</span><div className="sb"><b>صوّروا لوحة الاستلام وارفعوا الصور</b><p>تقرأ المنصة رمز كل بطاقة ودوائر التأكد والكتابة، وتعبّئ اللوحة الرقمية.</p>{featOn('scan') ? <button className={'btn ' + (ok ? 'gold' : '') + ' big'} onClick={() => openScan()}><Icon name="camera" /> ارفع الصور</button> : null}</div></li>
      <li><span className="sn">٤</span><div className="sb"><b>أكملوا الناقص من لوحة اللعبة</b><p>ما لم يُقرأ بوضوح يُعلَّم على لوحة الاستلام الرقمية لتُدخلوه يدوياً.</p><button className="btn big" onClick={() => go('play')}><Icon name="layout-grid" /> افتح لوحة الاستلام</button></div></li></ol></div>
  );
}

/* ---------- رفع صور اللعبة المطبوعة (physical.js) ---------- */
function PhotoForm() {
  const reg = !PROFILE; const rec = (LS.get('bm3:recent') || []).slice(0, 4);
  const [brand, setBrand] = useState(''); const [team, setTeam] = useState(''); const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const phReg = () => { setUI({ photoReg: true }); focusSel('#rName', 50); };

  async function submitNew(e) {
    e.preventDefault();
    if (!PROFILE) { setUI({ photoReg: true }); return; }
    const b = brand.trim(); if (!b) { toast('اكتب اسم العلامة.', 'err'); focusSel('#phBrand'); return; }
    setBusy(true);
    const c = await createSession({ brand: b, team: team.trim(), facilitator: (PROFILE && PROFILE.name) || '', dur: 180, mode: 'physical' });
    setBusy(false);
    if (c && await openSession(c)) { afterOpen(); startScanFlow(); toast('أُنشئت الجلسة ' + c + '. ارفعوا صور لوحة الاستلام.', 'gold'); }
  }
  async function submitJoin(e) {
    e.preventDefault();
    const c = normCode(code || ''); if (!c) { toast('اكتب رمز الجلسة بالصيغة BM-XXXX.', 'err'); return; }
    if (await openSession(c)) { afterOpen(); startScanFlow(); }
  }
  async function phRecent(c) { if (await openSession(c)) { afterOpen(); startScanFlow(); } }

  return (
    <div className="formcard phx">
      <div className="reghead"><span className="ico" style={{ background: '#B07A00' }}><Icon name="camera" /></span><div><h2>ارفعوا صور اللعبة المطبوعة</h2><p className="mini-note">بعد اللعب على لوحة الاستلام الورقية: صوّروا اللوحة، فتقرأ المنصة رمز كل بطاقة (مثل Q1.3) ودوائر التأكد والكتابة اليدوية، ثم تعبّئ اللوحة الرقمية وتبني منها لوحة المتابعة. ما لم يتضح يُعلَّم لتُدخلوه يدوياً.</p></div></div>
      <ol className="phsteps">
        <li><span>١</span><Icon name="camera" /><b>صوّروا اللوحة من الأعلى</b><small>إضاءة جيدة، بلا ظلال. صورة كاملة أو صورة لكل عمودين.</small></li>
        <li><span>٢</span><Icon name="image-plus" /><b>ارفعوا حتى ٥ صور</b><small>من الجوال أو الكمبيوتر.</small></li>
        <li><span>٣</span><Icon name="scan-line" /><b>راجعوا ما قُرئ واعتمدوه</b><small>كل بطاقة مع درجة وضوحها.</small></li>
        <li><span>٤</span><Icon name="pen-line" /><b>أكملوا الناقص يدوياً</b><small>البطاقات غير الواضحة معلّمة على اللوحة.</small></li>
      </ol>
      <div className="ph2">
        <form id="fPhotoNew" className="phbox" autoComplete="off" onSubmit={submitNew}><b><Icon name="plus" /> جلسة جديدة للعبة مطبوعة</b>
          {reg ? <><p className="mini-note">إنشاء الجلسة يحتاج حساب منشّط (مرة واحدة فقط).</p><button type="button" className="btn pri big" onClick={phReg}><Icon name="user-plus" /> سجّل ثم تابع للرفع</button></>
            : <><label className="fld">اسم العلامة أو المشروع *<input className="inp" id="phBrand" maxLength={60} placeholder="مثال: كوما" value={brand} onChange={(e) => setBrand(e.target.value)} /></label>
              <label className="fld">الفريق<input className="inp" id="phTeam" maxLength={60} placeholder="اختياري" value={team} onChange={(e) => setTeam(e.target.value)} /></label>
              <button className="btn gold big" type="submit" disabled={busy}><Icon name="camera" /> أنشئ الجلسة وارفع الصور</button></>}
        </form>
        <form id="fPhotoJoin" className="phbox" autoComplete="off" onSubmit={submitJoin}><b><Icon name="log-in" /> لديكم جلسة سابقة؟</b><p className="mini-note">أدخلوا رمزها لإضافة الصور إليها أو استكمالها. لا يحتاج تسجيلاً.</p>
          <label className="fld">رمز الجلسة<input className="inp" id="phCode" maxLength={7} placeholder="BM-XXXX" dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <button className="btn big" type="submit"><Icon name="image-plus" /> افتح الجلسة وارفع الصور</button>
          {rec.length ? <div className="phrec">{rec.map((r) => { const c = r.code || r; return <button type="button" key={c} onClick={() => phRecent(c)}><span className="codechip">{c}</span>{r.brand || ''}</button>; })}</div> : null}
        </form>
      </div>
    </div>
  );
}

/* ---------- جلساتي ولوحات عملائي ---------- */
function MySessions({ dep }) {
  const [d, setD] = useState([]);
  const uid = PROFILE ? ME.id : null;
  useEffect(() => {
    if (LOCAL || !CAP.db || !ME.id || !PROFILE) { setD([]); return; }
    let live = true;
    CAP.db.collection('sessions').where('owner', '==', ME.id).limit(40).get().then((qs) => {
      if (!live) return;
      setD(qs.docs.map((x) => x.data()).filter((x) => x && x.code).sort((a, b) => (b.updated || 0) - (a.updated || 0)));
    }).catch(() => {});
    return () => { live = false; };
  }, [uid, CAP, LOCAL, dep]);
  if (!d.length) return null;
  return (
    <>
      <h2 style={{ fontSize: 18, marginTop: 26 }}>جلساتي ولوحات عملائي ({AR(d.length)})</h2>
      <div className="slist" style={{ marginTop: 10 }}>{d.map((x) => {
        const n = placedIn(x);
        return <button type="button" key={x.code} onClick={() => openRecent(x.code)}><Icon name={x.done ? 'layout-dashboard' : 'orbit'} /><span className="meta"><b>{x.brand}</b><small>{x.done ? 'لوحة متابعة نشطة' : 'جلسة جارية · ' + n + ' من ' + N_Q}{x.updated ? ' · آخر نشاط ' + ago(x.updated) : ''}</small></span><span className="pg"><i style={{ width: pct(n) }} /></span><span className="codechip">{x.code}</span></button>;
      })}</div>
    </>
  );
}

/* ---------- الشاشة ---------- */
export default function Start() {
  useEngine();
  const [dashCode, setDashCode] = useState('');
  const t = ui.startTab;
  const recent = LS.get('bm3:recent') || [];

  async function openDash() { const c = normCode(dashCode); if (c && await openSession(c)) { afterOpen(); go('dash'); } }

  let form = null;
  if (t === 'photo') form = ui.photoReg && !PROFILE ? <RegForm key="reg-ph" edit={false} /> : <PhotoForm />;
  else if (t === 'new') form = !PROFILE || ui.editProfile ? <RegForm key={PROFILE ? 'reg-edit' : 'reg-new'} edit={!!PROFILE} /> : ui.created ? <Created /> : <NewForm />;
  else if (t === 'join') form = <JoinForm />;

  return (
    <section id="v-start">
      <div className="stripes">{STAGES.map((s) => <i key={s.n} style={{ background: s.c }} />)}</div>
      <div className="wrap">
        <div className="starthead"><span className="brandmk"><img src={LOGO} alt="" /><span>براند ماب<small>BRAND MAP</small></span></span><button className="btn ghost sm" onClick={() => go('home')}><Icon name="chevron-right" /> صفحة التعريف</button></div>
        {LOCAL ? <div className="warnbox" style={{ marginTop: 8 }}>هذا العرض لا يدعم المزامنة بين الأجهزة، فستُحفظ الجلسة على هذا الجهاز فقط. افتح الأداة من رابطها في Claude ليدخل فريقك من أجهزتهم.</div> : null}
        <AccountBar />
        <h1 style={{ fontSize: 'clamp(30px,4vw,44px)', marginTop: 18 }}>كيف تبدأ؟</h1>
        <p className="kick" style={{ color: 'var(--muted)', marginTop: 6 }}>جلسة واحدة لكل علامة. المنشّط ينشئها، والفريق ينضم برمزها فيرى الطاولة نفسها لحظياً.</p>
        <div className="choose">
          <button className={'choice ' + (t === 'new' ? 'on' : '')} onClick={() => setTab('new')}><span className="ico" style={{ background: '#3F72B5' }}><Icon name="plus" /></span><h2>جلسة جديدة</h2><p>{PROFILE ? 'أنشئ طاولة لعلامتك، ثم شارك الرمز مع فريقك ليدخلوا من أجهزتهم.' : 'سجّل حساب المنشّط أولاً، ثم أنشئ طاولة لعلامتك وشارك رمزها.'}</p></button>
          <button className={'choice ' + (t === 'join' ? 'on' : '')} onClick={() => setTab('join')}><span className="ico" style={{ background: '#2E9477' }}><Icon name="log-in" /></span><h2>انضمام لجلسة</h2><p>معك رمز من منشّط الجلسة؟ أدخله وستظهر لك الطاولة كما هي الآن.</p></button>
          {featOn('scan') ? <button className={'choice ph ' + (t === 'photo' ? 'on' : '')} onClick={() => setTab('photo')}><span className="ico" style={{ background: '#B07A00' }}><Icon name="camera" /></span><h2>رفع صور اللعبة المطبوعة</h2><p>لعبتم بالبطاقات على لوحة الاستلام الورقية؟ صوّروها وارفعوا الصور، وتعبّئ المنصة اللوحة الرقمية.</p></button> : null}
        </div>
        <div id="startForm">{form}</div>
        <div id="mySess"><MySessions dep={t + '|' + (ui.created || '')} /></div>
        <div className="formcard" style={{ marginTop: 22 }}><div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="ico" style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#B07A00', color: '#fff', fontSize: 20 }}><Icon name="layout-dashboard" /></span>
          <div style={{ flex: 1, minWidth: 200 }}><b style={{ fontSize: 17 }}>لوحة متابعة عميل</b><p className="mini-note">بعد انتهاء الجلسة تبقى للعلامة لوحة ثابتة تتابع منها المحاور الثمانية دورياً وتحمّل الوثيقة.</p></div>
          <div className="codebox" style={{ minWidth: 260 }}><input className="inp" id="dashCode" placeholder="BM-XXXX" maxLength={7} aria-label="رمز الجلسة" value={dashCode} onChange={(e) => setDashCode(e.target.value)} /><button className="btn pri" onClick={openDash}>افتح</button></div>
        </div></div>
        {recent.length ? <>
          <h2 style={{ fontSize: 18, marginTop: 26 }}>جلسات فتحتها على هذا الجهاز</h2>
          <div className="slist" style={{ marginTop: 10 }}>{recent.map((r) => (
            <button key={r.code} onClick={() => openRecent(r.code)}><Icon name={r.done ? 'badge-check' : 'users'} /><span className="meta"><b>{r.brand}</b><small>{r.done ? 'مكتملة — لوحة المتابعة' : 'جارية'} · {fmtDate(r.at)}</small></span><span className="pg"><i style={{ width: pct(r.n) }} /></span><span className="codechip">{r.code}</span></button>
          ))}</div>
        </> : null}
      </div>
    </section>
  );
}
