/* تبويب «الحضور الرقمي» في لوحة المتابعة — dDigital الأصلي: المؤشرات، الروابط، نمو المتابعين،
   اتساق كل منصة مع قرارات الطاولة، وتقارير وكيل المنصة */
import React, { useState } from 'react';
import { S, ui, RO, CAP, AR, DG, platOn, hrefOf, ago, featOn } from '../../engine/engine.js';
import { useEngine } from '../../ui/hooks.js';
import { Icon } from '../../ui/Icon.jsx';
import { Panel } from '../../ui/Panel.jsx';
import { openModal, closeModal } from '../../ui/overlays.jsx';
import { openIntake } from '../intake/IntakeOverlay.jsx';
import { LineChart } from './LineChart.jsx';
import { platReadings, chkItems, platAI, setChk, saveDRead } from './logic.js';

const nf = (v) => v.toLocaleString('en-US');

/** رابط خارجي إن أمكن، وإلا النص أو «—» */
function Link({ v, base }) {
  const h = hrefOf(v, base);
  return h ? <a href={h} target="_blank" rel="noopener" dir="ltr">{v}</a> : <>{v || '—'}</>;
}

/** تقرير وكيل المنصة (platAiHTML) */
export function PlatAi({ a }) {
  const pillars = a.pillars || [], gaps = a.gaps || [], plan = a.plan || [], kpis = a.kpis || [];
  return (
    <div className="ai">
      <h3>{a.headline || ''}</h3><p>{a.summary || ''}</p>
      {pillars.length ? <><h4>محاور المحتوى</h4><div className="sig">{pillars.map((x, i) => <div key={i}><span className="chip ok">محور</span><span>{x}</span></div>)}</div></> : null}
      {gaps.length ? <><h4>فجوات</h4><div className="sig">{gaps.map((x, i) => <div key={i}><span className="chip bad">فجوة</span><span>{x}</span></div>)}</div></> : null}
      {plan.length ? <><h4>خطة النشر الأسبوعية</h4><ol>{plan.map((x, i) => <li key={i}>{x}</li>)}</ol></> : null}
      {kpis.length ? <><h4>مؤشرات المتابعة</h4><ol>{kpis.map((x, i) => <li key={i}>{x}</li>)}</ol></> : null}
    </div>
  );
}

/** نافذة تسجيل قراءة منصة (openDRead) */
function DReadModal() {
  useEngine();
  const on = platOn();
  const [p, setP] = useState(on.length ? on[0][0] : '');
  const [fol, setFol] = useState(''); const [ppw, setPpw] = useState(''); const [eng, setEng] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const save = () => { if (saveDRead({ p, fol, ppw, eng, date })) closeModal(); };
  return (
    <>
      <h3><Icon name="plus" /> قراءة منصة</h3>
      <div className="mb">
        <label className="fld">المنصة<select className="inp" id="drP" value={p} onChange={(e) => setP(e.target.value)}>{on.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <div className="formgrid">
          <label className="fld">المتابعون<input className="inp" id="drF" type="number" dir="ltr" value={fol} onChange={(e) => setFol(e.target.value)} /></label>
          <label className="fld">منشورات/أسبوع<input className="inp" id="drW" type="number" step="any" dir="ltr" value={ppw} onChange={(e) => setPpw(e.target.value)} /></label>
          <label className="fld">التفاعل ٪<input className="inp" id="drE" type="number" step="any" dir="ltr" value={eng} onChange={(e) => setEng(e.target.value)} /></label>
          <label className="fld">التاريخ<input className="inp" id="drD" type="date" dir="ltr" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
      </div>
      <div className="mf"><button className="btn" onClick={closeModal}>إلغاء</button><button className="btn pri" onClick={save}>سجّل</button></div>
    </>
  );
}
export const openDRead = () => openModal(<DReadModal />);

export default function DigitalTab() {
  useEngine();
  if (!S) return null;
  const d = DG(), pro = d.pro || {}, on = platOn();
  const lastOf = (k) => { const r = platReadings(k); return r.length ? r[r.length - 1] : null; };
  const tot = on.reduce((a, [k]) => { const l = lastOf(k); return a + (l ? l.fol : 0); }, 0);
  const engs = on.map(([k]) => { const l = lastOf(k); return l ? l.eng : 0; }).filter(Boolean);
  const ppw = on.reduce((a, [k]) => { const l = lastOf(k); return a + (l ? l.ppw : 0); }, 0);
  const items = chkItems(); let ck = 0, ckt = 0; on.forEach(([k]) => items.forEach((x, i) => { ckt++; if (((S.dchk || {})[k] || {})[i]) ck++; }));
  const dgOpen = () => openIntake(4);
  const kps = [
    ['المتابعون عبر المنصات', nf(tot), `${AR(on.length)} منصات مفعّلة`],
    ['متوسط التفاعل', engs.length ? <>{(engs.reduce((a, b) => a + b, 0) / engs.length).toFixed(1)}<small>٪</small></> : '—', 'آخر قراءة لكل منصة'],
    ['منشورات أسبوعياً', ppw || '—', 'مجموع المنصات'],
    ['اتساق الحضور مع العلامة', ckt ? <>{Math.round(ck / ckt * 100)}<small>٪</small></> : '—', `${ck}/${ckt} بنود محقّقة`],
  ];

  return (
    <>
      <div className="kps">{kps.map(([l, v, s]) => <div key={l} className="kp"><span className="l">{l}</span><span className="v">{v}</span><span className="s">{s}</span></div>)}</div>
      {!d.web && !on.length && !d.none
        ? <div className="banner"><Icon name="info" /><span>لم يُسجَّل حضور رقمي بعد. أضيفوا الموقع والحسابات من ملف المشروع لتظهر التقارير هنا.</span><button className="btn sm pri" onClick={dgOpen}>أضف الحضور الرقمي</button></div>
        : null}
      <div className="g2">
        <Panel title={<><Icon name="globe" /> الموقع والمتجر والبيانات</>} cls="span5"
          act={<button className="btn sm" onClick={dgOpen} disabled={RO}><Icon name="pen-line" /> تعديل</button>}>
          <dl className="dgl">
            <dt>الموقع</dt><dd><Link v={d.web} /></dd><dt>المتجر</dt><dd><Link v={d.store} /></dd>
            <dt>البريد</dt><dd dir="ltr">{pro.email || '—'}</dd><dt>الجوال</dt><dd dir="ltr">{pro.phone || '—'}</dd>
            <dt>المدينة</dt><dd>{pro.city || '—'}</dd><dt>التأسيس</dt><dd>{pro.year || '—'}</dd>
            <dt>السجل التجاري</dt><dd dir="ltr">{pro.cr || '—'}</dd><dt>ملفات الهوية</dt><dd><Link v={pro.assets} /></dd>
          </dl>
        </Panel>
        <Panel title={<><Icon name="activity" /> نمو المتابعين</>} sub="كل قراءة جديدة تُرسم هنا. سجّلوا قراءة شهرية لكل منصة على الأقل." cls="span7"
          act={on.length ? <button className="btn sm pri" onClick={openDRead} disabled={RO}><Icon name="plus" /> قراءة منصة</button> : null}>
          {on.length
            ? <div className="inds">{on.map(([k, n, c]) => {
              const r = platReadings(k).map((x) => ({ at: x.at, v: x.fol })); const last = r[r.length - 1], prev = r[r.length - 2]; const dl = last && prev ? last.v - prev.v : null;
              return (
                <div key={k} className="ind">
                  <div className="ih"><b style={{ color: c }}>{n}</b></div>
                  <div className="iv"><span className="num big">{last ? nf(last.v) : '—'}</span>{dl != null ? <span className={'dl ' + (dl >= 0 ? 'ok' : 'bad')}>{dl >= 0 ? '▲' : '▼'} {nf(Math.abs(dl))}</span> : null}</div>
                  <LineChart rs={r} color={c} />
                </div>
              );
            })}</div>
            : <p className="empty">لا منصات مفعّلة.</p>}
        </Panel>
      </div>
      {on.map(([k, n, c, base, ab]) => {
        const p = (d.plats || {})[k] || {}, r = platReadings(k), last = r[r.length - 1] || {}, ai = (S.dai || {})[k]; const ch = (S.dchk || {})[k] || {};
        return (
          <Panel key={k} title={<><span className="pi" style={{ '--pc': c }}>{ab}</span> تقرير {n}</>}
            sub={<><Link v={p.handle} base={base} /> · {last.fol != null ? nf(last.fol) + ' متابع · ' : ''}{last.ppw ? last.ppw + ' منشور/أسبوع · ' : ''}{last.eng ? last.eng + '٪ تفاعل' : ''}</>}>
            <div className="g2 inner">
              <div className="span5"><h4 className="pg-s" style={{ marginTop: 0 }}><Icon name="list-checks" /> اتساق المنصة مع قرارات الطاولة</h4>
                <div className="chk">{items.map((x, i) => <label key={i}><input type="checkbox" checked={!!ch[i]} onChange={(e) => setChk(k, i, e.target.checked)} disabled={RO} /> {x}</label>)}</div></div>
              <div className="span7"><h4 className="pg-s" style={{ marginTop: 0 }}><Icon name="sparkles" /> تقرير وكيل المنصة {ai && ai.at ? <small>{ago(ai.at)}</small> : null}</h4>
                {ai && ai.data ? <PlatAi a={ai.data} /> : <p className="empty">{CAP.sample ? 'لم يُطلب تقرير بعد.' : 'تقارير الوكيل تعمل عند فتح اللوحة من رابطها في Claude.'}</p>}
                {CAP.sample && featOn('digital')
                  ? <button className="btn sm pri" onClick={() => platAI(k)} disabled={ui.platBusy === k || RO}><Icon name="wand-sparkles" /> {ui.platBusy === k ? 'يكتب التقرير…' : ai ? 'حدّث التقرير' : 'اطلب تقرير المنصة'}</button>
                  : null}</div>
            </div>
          </Panel>
        );
      })}
    </>
  );
}
