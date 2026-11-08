/* اشتراك مكوّنات React في المحرّك: أي تغيير في الجلسة أو حالة الواجهة يعيد الرسم */
import { useSyncExternalStore } from 'react';
import { subscribe, getVersion } from '../engine/engine.js';
/** استدعه في أعلى أي مكوّن يقرأ من المحرّك (S, ui, PROFILE...) ليُعاد رسمه عند التغيير */
export function useEngine() { return useSyncExternalStore(subscribe, getVersion, getVersion); }
