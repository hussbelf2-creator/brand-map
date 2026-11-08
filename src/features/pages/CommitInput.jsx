/* حقل يحفظ عند الانتهاء (مثل حدث change الأصلي): عند مغادرة الحقل أو Enter، وفقط إن تغيّرت القيمة */
import React, { useEffect, useRef, useState } from 'react';

export function CommitInput({ value, onCommit, ...rest }) {
  const cur = value == null ? '' : String(value);
  const [v, setV] = useState(cur);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setV(cur); }, [cur]);
  return (
    <input {...rest} value={v}
      onChange={(e) => setV(e.target.value)}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; if (v !== cur) onCommit(v); }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
  );
}
