import React from 'react';
import { ICONS } from '../engine/engine.js';
/** أيقونة SVG من مكتبة الأيقونات (مسارات ثابتة موثوقة داخل المشروع) */
export function Icon({ name, cls = '' }) {
  return <svg className={'ic ' + cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.info }} />;
}
/** يعرض رسماً SVG/HTML ثابتاً مولّداً داخل المشروع (رسومات الدروس والبطاقات). لا تمرّر له نصاً من المستخدم. */
export function Art({ html, as: Tag = 'span', className, style }) {
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
