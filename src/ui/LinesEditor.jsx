/* محرّر الكتابة بالأسطر: سطر لكل فكرة، Enter ينتقل لسطر جديد، و Backspace في سطر فارغ يعود للسابق */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';

const toLines = (v, min) => { const L = String(v || '').split('\n'); while (L.length < min) L.push(''); if (L[L.length - 1].trim()) L.push(''); return L; };

export function LinesEditor({ value, onChange, min = 6, placeholder = 'اكتب سطراً لكل فكرة', disabled = false }) {
  const [lines, setLines] = useState(() => toLines(value, min));
  const box = useRef(null);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setLines(toLines(value, min)); }, [value, min]);
  const commit = (L) => { setLines(L); const v = L.slice(); while (v.length && !v[v.length - 1].trim()) v.pop(); onChange && onChange(v.join('\n')); };
  const pending = useRef(null);
  // ينقل التركيز فور رسم السطر الجديد (قبل أي ضغطة مفتاح تالية)
  useLayoutEffect(() => { if (pending.current == null) return; const ins = box.current && box.current.querySelectorAll('input.ln'); const i = pending.current; pending.current = null; if (ins && ins[i]) ins[i].focus(); });
  const focusAt = (i) => { pending.current = i; const ins = box.current && box.current.querySelectorAll('input.ln'); if (ins && ins[i]) { pending.current = null; ins[i].focus(); } };
  const onKey = (e, i) => {
    if (e.key === 'Enter') { e.preventDefault(); if (i === lines.length - 1) setLines([...lines, '']); focusAt(i + 1); }
    else if (e.key === 'Backspace' && !lines[i] && i > 0) { e.preventDefault(); focusAt(i - 1); }
    else if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); focusAt(i - 1); }
    else if (e.key === 'ArrowDown' && i < lines.length - 1) { e.preventDefault(); focusAt(i + 1); }
  };
  return (
    <div className="lns" ref={box} onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }}>
      {lines.map((t, i) => (
        <input key={i} className="ln" value={t} disabled={disabled} aria-label={'سطر ' + (i + 1)} placeholder={i === 0 ? placeholder : ''}
          onChange={(e) => { const L = lines.slice(); L[i] = e.target.value; commit(L); }} onKeyDown={(e) => onKey(e, i)} />
      ))}
      <button type="button" className="ln-add" disabled={disabled} onClick={() => { setLines([...lines, '']); focusAt(lines.length); }}><Icon name="plus" /> أضف سطراً</button>
    </div>
  );
}
