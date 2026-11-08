/* ================= وثيقة المشروع: النموذج المشترك، HTML للطباعة، Word (.docx)، JSON، والتحميل ================= */
import JSZip from 'jszip';
import {
  S, CODE, CAP, Q, ALLQ, STAGES, N_Q, CL, AR, INTAKE, DOCSECS,
  esc, defLine, placed, placedCount, ansSummary, ansTitle, fillText, fget, plist, AK, qcode, confOf, timeOf, doubtOn,
  fixedName, fmt, fmtDate, fmtShort, stageOf,
} from '../../engine/engine.js';
import { toast } from '../../ui/overlays.jsx';
import { riskList, plan, follows, STS } from '../dashboard/logic.js';
import { digitalBlocks } from '../digital/logic.js';
import { showDownload } from './DownloadModal.jsx';

/* ---------- document model (shared by Word & HTML) ---------- */
export function docModel() {
  const B = []; const h = (l, t, c) => B.push({ h: l, t, c }), p = (t, o = {}) => B.push({ p: t, ...o }), li = (t) => B.push({ li: t }), tb = (rows, head) => B.push({ tb: rows, head });
  const I = S.intake || {};
  B.push({ cover: true });
  h(1, '١. الملخص التنفيذي', '#2C3E50');
  if (defLine()) p(defLine(), { b: true });
  [['2_1', 'الشريحة الأهم ★'], ['3_3', 'القيمة الأساسية ★'], ['6_1', 'نوع الاسم ★'], ['5_2', 'الشعار اللفظي'], ['8_2', 'الرؤية']].forEach(([id, l]) => { if (placed(id)) p(`${l}: ${ansSummary(Q[id])}`); });
  if (placed('5_1')) { const v = fget('5_1', '1'); p(`بيان التموضع: لـ«${v.seg || '…'}»، نحن «${v.cat || '…'}» التي «${v.edge || '…'}».`, { b: true }); }
  if (placed('8_1')) p('لماذا نوجد: ' + fillText(Q['8_1'], '1'));
  const sec = (n, t, ids) => {
    const d = DOCSECS[n - 1]; h(1, `${AR(n)}. ${t}`, null); p(d.what, { muted: true });
    ids.forEach((id) => {
      const q = Q[id]; h(3, `${qcode(q)} · ${q.slot}${q.gold ? ' ★' : ''}`, q.s.ci);
      if (!placed(id)) { p('لم يُحسم بعد على الطاولة.', { muted: true }); return; }
      const keys = plist(id); keys.forEach((k) => { const a = AK(q, k) || {}; if (!a.f && !a.spare) { p('القرار: ' + ansTitle(q, k), { b: true }); if (a.x) p(a.x); } else { const t2 = fillText(q, k); if (a.f === 'comp' || a.f === 'prod') p(ansTitle(q, k), { b: true }); if (t2) t2.split('\n').forEach((x) => li(x)); else p(ansTitle(q, k)); } });
      const c = confOf(id), tm = timeOf(id); p(`درجة التأكد: ${c ? c + '/5 · ' + CL[c].t : 'غير محددة'}${doubtOn(id) ? ' · بطاقة شك مرفوعة' : ''}${tm ? ` · زمن النقاش ${fmt(tm.s)} من ${fmt(tm.d)}` : ''}`, { muted: true });
    });
  };
  sec(2, 'تشخيص الملعب', DOCSECS[1].feeds); sec(3, 'العميل المستهدف', DOCSECS[2].feeds); sec(4, 'كيف نفوز', ['3_1', '3_2', '3_3', '3_4', '5_4']);
  sec(5, 'دليل الشخصية والصوت', ['4_1', '4_2', '4_3', '4_4', '4_5']); sec(6, 'المنظومة اللفظية', ['5_1', '5_2', '5_3']); sec(7, 'استراتيجية الاسم', DOCSECS[6].feeds);
  if (fixedName()) p('الاسم المحسوم مسبقاً (بطاقة المشروع): ' + fixedName(), { b: true });
  sec(8, 'موجز التصميم', ['7_1', '7_2', '7_3']); sec(9, 'البوصلة', DOCSECS[8].feeds);
  h(1, '١٠. المخاطر وقائمة التحقق', null); const rs = riskList(); if (rs.length) rs.forEach((r) => li(`${r.t} — ${r.d}`)); else p('لا مخاطر مفتوحة عند إصدار الوثيقة.');
  h(1, '١١. خطة ٣٠ / ٦٠ / ٩٠', null); const P = plan(); [30, 60, 90].forEach((d) => { h(3, `أول ${AR(d)} يوماً`, null); P[d].forEach(li); });
  h(1, 'ملحق أ — سجل القرارات الخمسة والثلاثين', null);
  tb(ALLQ.map((q) => { const tm = timeOf(q.id), c = confOf(q.id); return [`${qcode(q)} ${q.slot}${q.gold ? ' ★' : ''}`, placed(q.id) ? ansSummary(q) : '—', c ? `${c}/5` : '—', tm ? fmt(tm.s) : '—']; }), ['البطاقة', 'القرار', 'التأكد', 'الزمن']);
  const I2 = INTAKE.map((x) => { const v = I[x.k]; let t = ''; if (x.type === 'pair') t = v && (v.a || v.b) ? `${x.a} ${v.a || '…'} ${x.b} ${v.b || '…'}` : ''; else if (Array.isArray(v)) t = v.join('، '); else if (x.type === 'yn') t = v === 'y' ? 'نعم' + (I.s9x ? ' — ' + I.s9x : '') : v === 'n' ? 'لا' : ''; else t = v || ''; return t ? [x.t, t] : null; }).filter(Boolean);
  if (I2.length) { h(1, 'ملحق ب — بطاقة المشروع', null); tb(I2, ['المعلومة', 'الإجابة']); }
  const fl = follows(); if (fl.length) { h(1, 'ملحق ج — سجل المتابعة الدورية', null); tb(fl.map((f) => [fmtShort(f.at), stageOf(+f.ax).name, (STS[f.st] || STS.ok).t + (f.pct != null ? ` · ${f.pct}٪` : ''), [f.kpi, f.note, f.next && ('التالي: ' + f.next)].filter(Boolean).join(' — ')]), ['التاريخ', 'المحور', 'الحالة', 'الملاحظة']); }
  B.push(...(digitalBlocks() || []));
  return B;
}
export const docName = (ext) => `${(S.brand || 'brand-map').replace(/[\\/:*?"<>|\s]+/g, '-')}-وثيقة-براند-ماب-${new Date().toISOString().slice(0, 10)}.${ext}`;

/* ---------- HTML document ---------- */
export function docHTML(B0) {
  const B = B0 || docModel(); const s = (x) => esc(x); let body = '';
  B.forEach((b) => {
    if (b.cover) body += `<section class="cover"><div class="stripes">${STAGES.map((x) => `<i style="background:${x.c}"></i>`).join('')}</div><p class="eb">BRAND MAP · وثيقة استراتيجية العلامة</p><h1>${s(S.brand)}</h1>${defLine() ? `<p class="def">${s(defLine())}</p>` : ''}<table class="meta"><tr><td>الفريق</td><td>${s(S.team || '—')}</td></tr><tr><td>المنشّط</td><td>${s(S.facilitator || '—')}</td></tr><tr><td>تاريخ الجلسة</td><td>${s(S.date || '')}</td></tr><tr><td>رمز الجلسة</td><td dir="ltr">${s(CODE)}</td></tr><tr><td>القرارات</td><td>${placedCount()} من ${N_Q}</td></tr><tr><td>تاريخ الإصدار</td><td>${fmtDate(Date.now())}</td></tr></table></section>`;
    else if (b.title) body += `<h1 style="font-size:36px;margin:10px 0">${s(b.title)}</h1>`;
    else if (b.h) body += `<h${b.h + 1} ${b.c ? `style="color:${b.c}"` : ''}>${s(b.t)}</h${b.h + 1}>`;
    else if (b.p != null) body += `<p class="${b.b ? 'b' : ''} ${b.muted ? 'm' : ''}">${s(b.p)}</p>`;
    else if (b.li) body += `<ul><li>${s(b.li)}</li></ul>`;
    else if (b.tb) body += `<table class="t"><thead><tr>${b.head.map((x) => `<th>${s(x)}</th>`).join('')}</tr></thead><tbody>${b.tb.map((r) => `<tr>${r.map((x) => `<td>${s(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  });
  body = body.replace(/<\/ul><ul>/g, '');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${s(S.brand)} — وثيقة براند ماب</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Baloo+Bhaijaan+2:wght@700;800&display=swap" rel="stylesheet">
<style>body{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;color:#22313F;max-width:820px;margin:0 auto;padding:40px 28px;line-height:1.85;font-size:15px}h1,h2{font-family:'Baloo Bhaijaan 2','IBM Plex Sans Arabic',sans-serif}
.cover{min-height:88vh;display:flex;flex-direction:column;justify-content:center;gap:12px;break-after:page}.stripes{display:flex;height:8px;border-radius:4px;overflow:hidden}.stripes i{flex:1}.eb{letter-spacing:.2em;color:#5D6D7E;font-size:12px}.cover h1{font-size:56px;margin:0}.def{font-size:22px;font-weight:600}
.meta{border-collapse:collapse;margin-top:20px}.meta td{padding:6px 14px;border-bottom:1px solid #E1E6EC}.meta td:first-child{color:#5D6D7E}
h2{font-size:28px;margin:42px 0 6px;padding-top:16px;border-top:3px solid #22313F}h4{font-size:17px;margin:22px 0 4px}h3{font-size:20px}p{margin:6px 0}p.b{font-weight:700}p.m{color:#5D6D7E;font-size:13.5px}ul{margin:4px 0;padding-inline-start:22px}
table.t{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}table.t th{background:#24364A;color:#fff;padding:8px;text-align:start}table.t td{padding:7px 8px;border-bottom:1px solid #E1E6EC;vertical-align:top}
@media print{body{padding:0}h2{break-before:page}}</style></head><body>${body}<p class="m" style="margin-top:40px;border-top:1px solid #E1E6EC;padding-top:10px">Brand Map™ · زورق — القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب</p></body></html>`;
}

/* ---------- Word (.docx) document ---------- */
// eslint-disable-next-line no-control-regex
export const xe = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
export function wRun(t, { b = false, color = null, sz = null } = {}) {
  const rp = `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${b ? '<w:b/><w:bCs/>' : ''}${color ? `<w:color w:val="${color.replace('#', '')}"/>` : ''}${sz ? `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>` : ''}<w:rtl/></w:rPr>`;
  return String(t).split('\n').map((l, i) => `${i ? `<w:r>${rp}<w:br/></w:r>` : ''}<w:r>${rp}<w:t xml:space="preserve">${xe(l)}</w:t></w:r>`).join('');
}
export function wP(t, { style = null, b = false, color = null, sz = null, bullet = false, after = null } = {}) {
  return `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}<w:bidi/>${bullet ? '<w:ind w:start="360" w:hanging="240"/>' : ''}${after != null ? `<w:spacing w:after="${after}"/>` : ''}</w:pPr>${wRun((bullet ? '• ' : '') + t, { b, color, sz })}</w:p>`;
}
export function wTable(rows, head, widths) {
  const W = widths || head.map(() => Math.floor(9600 / head.length));
  const cell = (t, w, hd) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${hd ? '<w:shd w:val="clear" w:color="auto" w:fill="24364A"/>' : ''}</w:tcPr>${wP(t, { b: hd, color: hd ? '#FFFFFF' : null, sz: 19, after: 40 })}</w:tc>`;
  const bd = '<w:top w:val="single" w:sz="4" w:color="D8DFE7"/><w:bottom w:val="single" w:sz="4" w:color="D8DFE7"/><w:insideH w:val="single" w:sz="4" w:color="D8DFE7"/>';
  return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${bd}</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:start w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:end w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${W.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>
 <w:tr><w:trPr><w:tblHeader/></w:trPr>${head.map((h, i) => cell(h, W[i], true)).join('')}</w:tr>${rows.map((r) => `<w:tr>${r.map((c, i) => cell(c, W[i], false)).join('')}</w:tr>`).join('')}</w:tbl>${wP('', { after: 120 })}`;
}
export function docxXML(B0) {
  const B = B0 || docModel(); let x = '';
  B.forEach((b) => {
    if (b.cover) {
      x += wP('BRAND MAP · وثيقة استراتيجية العلامة', { color: '#5D6D7E', sz: 20 }) + wP(S.brand, { style: 'Title' }) + (defLine() ? wP(defLine(), { b: true, sz: 30, after: 240 }) : '') +
        wTable([['الفريق', S.team || '—'], ['المنشّط', S.facilitator || '—'], ['تاريخ الجلسة', S.date || ''], ['رمز الجلسة', CODE], ['القرارات', placedCount() + ' من ' + N_Q], ['تاريخ الإصدار', fmtDate(Date.now())]], ['البند', 'القيمة'], [3000, 6600]) + '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    } else if (b.title) x += wP(b.title, { style: 'Title' });
    else if (b.h) x += wP(b.t, { style: 'Heading' + b.h, color: b.c || null });
    else if (b.p != null) x += wP(b.p, { b: b.b, color: b.muted ? '#5D6D7E' : null, sz: b.muted ? 19 : null });
    else if (b.li) x += wP(b.li, { bullet: true, after: 40 });
    else if (b.tb) x += wTable(b.tb, b.head, b.head.length === 4 ? [2900, 4300, 1100, 1300] : null);
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${x}${wP('Brand Map™ · زورق — القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب', { color: '#5D6D7E', sz: 18 })}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1300" w:right="1150" w:bottom="1300" w:left="1150" w:header="700" w:footer="700" w:gutter="0"/><w:bidi/></w:sectPr></w:body></w:document>`;
}
export const DOCX_STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/><w:spacing w:after="100" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="1600" w:after="200"/></w:pPr><w:rPr><w:b/><w:bCs/><w:color w:val="22313F"/><w:sz w:val="72"/><w:szCs w:val="72"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pageBreakBefore/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="22313F"/></w:pBdr><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:color w:val="22313F"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="60"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:bCs/><w:color w:val="24364A"/><w:sz w:val="25"/><w:szCs w:val="25"/></w:rPr></w:style></w:styles>`;
export async function buildDocx(B0) {
  const z = new JSZip();
  z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
  z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
  z.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  z.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xe(S.brand)} — وثيقة براند ماب</dc:title><dc:creator>Brand Map</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`);
  z.file('word/styles.xml', DOCX_STYLES); z.file('word/document.xml', docxXML(B0));
  return z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/** saveFile(name,data,type): حفظ عبر قدرة التحميل في Claude، وإلا رابط تنزيل من المتصفح */
export async function saveFile(name, data, type) {
  if (CAP.dl) {
    try { await CAP.dl.save({ filename: name, data }); toast('جاهز: ' + name); return true; } catch (e) {
      const c = e && e.code; if (c === 'declined') return false;
      if (c === 'rate_limited') { toast('نافذة حفظ مفتوحة بالفعل. أكملها ثم أعد المحاولة.', 'err'); return false; }
      if (!['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(c)) { toast('تعذّر التحميل: ' + ((e && e.message) || c), 'err'); return false; }
    }
  }
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type + ';charset=utf-8' }); const u = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); return true;
  } catch (e) { toast('التحميل غير متاح في هذا العرض. افتح الأداة من رابطها في Claude.', 'err'); return false; }
}

/** openDownload(): نافذة تحميل وثيقة المشروع */
export function openDownload() { if (!S) return; showDownload(); }
export async function dlDocx() { try { const b = await buildDocx(); await saveFile(docName('docx'), b, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); } catch (e) { toast('تعذّر إنشاء ملف Word في هذا العرض. جرّب نسخة HTML.', 'err'); } }
export function dlHtml() { return saveFile(docName('html'), docHTML(), 'text/html'); }
export function dlJson() { return saveFile(docName('json'), JSON.stringify({ app: 'brand-map', v: 3, exported: new Date().toISOString(), session: S }, null, 1), 'application/json'); }
