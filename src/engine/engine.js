/* ================= Brand Map engine — framework-agnostic game logic =================
   Generated from the original modules. React components import from here; nothing in this file renders UI. */
import * as THREE from 'three';
window.THREE=THREE; /* the 3D board module reads THREE from window */
const ui={view:'home',q:'1_1',boardMode:(()=>{try{return JSON.parse(localStorage.getItem('bm3:bmode'))||'3d'}catch(e){return'3d'}})(),sel:{},warned:{},hand:null,dtab:'over'};
let VERSION=0;const SUBS=new Set();
function bump(){VERSION++;SUBS.forEach(f=>{try{f()}catch(e){console.error(e)}})}
function subscribe(fn){SUBS.add(fn);return()=>SUBS.delete(fn)}
const getVersion=()=>VERSION;
const BUS={};
function on(evt,fn){(BUS[evt]=BUS[evt]||new Set()).add(fn);return()=>BUS[evt].delete(fn)}
function emit(evt,...a){(BUS[evt]||[]).forEach(f=>{try{f(...a)}catch(x){console.error(x)}})}
function notify(msg,kind='',opts={}){emit('toast',msg,kind,opts)}
function setUI(p){Object.assign(ui,p);if(p&&p.boardMode){try{localStorage.setItem('bm3:bmode',JSON.stringify(p.boardMode))}catch(e){}}bump()}
let SAVE_ST='محفوظ';

const ICONS={"store": "<path d=\"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7\" /> <path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\" /> <path d=\"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4\" /> <path d=\"M2 7h20\" /> <path d=\"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7\" />", "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\" /> <polyline points=\"16 7 22 7 22 13\" />", "trending-down": "<polyline points=\"22 17 13.5 8.5 8.5 13.5 2 7\" /> <polyline points=\"16 17 22 17 22 11\" />", "sprout": "<path d=\"M7 20h10\" /> <path d=\"M10 20c5.5-2.5.8-6.4 3-10\" /> <path d=\"M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z\" /> <path d=\"M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z\" />", "chart-column-increasing": "<path d=\"M13 17V9\" /> <path d=\"M18 17V5\" /> <path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /> <path d=\"M8 17v-3\" />", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />", "file-chart-pie": "<path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.5\" /> <path d=\"M4.017 11.512a6 6 0 1 0 8.466 8.475\" /> <path d=\"M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z\" />", "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />", "construction": "<rect x=\"2\" y=\"6\" width=\"20\" height=\"8\" rx=\"1\" /> <path d=\"M17 14v7\" /> <path d=\"M7 14v7\" /> <path d=\"M17 3v3\" /> <path d=\"M7 3v3\" /> <path d=\"M10 14 2.3 6.3\" /> <path d=\"m14 6 7.7 7.7\" /> <path d=\"m8 6 8 8\" />", "scan-face": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /> <path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /> <path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /> <path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /> <path d=\"M8 14s1.5 2 4 2 4-2 4-2\" /> <path d=\"M9 9h.01\" /> <path d=\"M15 9h.01\" />", "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /> <path d=\"M12 18h.01\" />", "briefcase": "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\" /> <rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\" />", "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />", "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\" />", "presentation": "<path d=\"M2 3h20\" /> <path d=\"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3\" /> <path d=\"m7 21 5-5 5 5\" />", "hand-coins": "<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17\" /> <path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /> <path d=\"m2 16 6 6\" /> <circle cx=\"16\" cy=\"9\" r=\"2.9\" /> <circle cx=\"6\" cy=\"5\" r=\"3\" />", "cog": "<path d=\"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z\" /> <path d=\"M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z\" /> <path d=\"M12 2v2\" /> <path d=\"M12 22v-2\" /> <path d=\"m17 20.66-1-1.73\" /> <path d=\"M11 10.27 7 3.34\" /> <path d=\"m20.66 17-1.73-1\" /> <path d=\"m3.34 7 1.73 1\" /> <path d=\"M14 12h8\" /> <path d=\"M2 12h2\" /> <path d=\"m20.66 7-1.73 1\" /> <path d=\"m3.34 17 1.73-1\" /> <path d=\"m17 3.34-1 1.73\" /> <path d=\"m11 13.73-4 6.93\" />", "users-round": "<path d=\"M18 21a8 8 0 0 0-16 0\" /> <circle cx=\"10\" cy=\"8\" r=\"5\" /> <path d=\"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3\" />", "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /> <path d=\"M9 18h6\" /> <path d=\"M10 22h4\" />", "wallet": "<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\" /> <path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\" />", "circle-dollar-sign": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /> <path d=\"M12 18V6\" />", "piggy-bank": "<path d=\"M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z\" /> <path d=\"M2 9v1c0 1.1.9 2 2 2h1\" /> <path d=\"M16 11h.01\" />", "file-user": "<path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M15 18a3 3 0 1 0-6 0\" /> <path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z\" /> <circle cx=\"12\" cy=\"13\" r=\"2\" />", "user-round": "<circle cx=\"12\" cy=\"8\" r=\"5\" /> <path d=\"M20 21a8 8 0 0 0-16 0\" />", "square-plus": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M8 12h8\" /> <path d=\"M12 8v8\" />", "package-open": "<path d=\"M12 22v-9\" /> <path d=\"M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z\" /> <path d=\"M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13\" /> <path d=\"M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z\" />", "user-x": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <line x1=\"17\" x2=\"22\" y1=\"8\" y2=\"13\" /> <line x1=\"22\" x2=\"17\" y1=\"8\" y2=\"13\" />", "hand-heart": "<path d=\"M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16\" /> <path d=\"m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /> <path d=\"m2 15 6 6\" /> <path d=\"M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z\" />", "rocket": "<path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\" /> <path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\" /> <path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\" /> <path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\" />", "heart-handshake": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\" /> <path d=\"M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66\" /> <path d=\"m18 15-2-2\" /> <path d=\"m15 18-2-2\" />", "grid-2x2": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M3 12h18\" /> <path d=\"M12 3v18\" />", "audio-lines": "<path d=\"M2 10v3\" /> <path d=\"M6 6v11\" /> <path d=\"M10 3v18\" /> <path d=\"M14 8v7\" /> <path d=\"M18 5v13\" /> <path d=\"M22 10v3\" />", "drama": "<path d=\"M10 11h.01\" /> <path d=\"M14 6h.01\" /> <path d=\"M18 6h.01\" /> <path d=\"M6.5 13.1h.01\" /> <path d=\"M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3\" /> <path d=\"M17.4 9.9c-.8.8-2 .8-2.8 0\" /> <path d=\"M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7\" /> <path d=\"M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4\" />", "sparkles": "<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\" /> <path d=\"M20 3v4\" /> <path d=\"M22 5h-4\" /> <path d=\"M4 17v2\" /> <path d=\"M5 18H3\" />", "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /> <path d=\"M12 11h4\" /> <path d=\"M12 16h4\" /> <path d=\"M8 11h.01\" /> <path d=\"M8 16h.01\" />", "layout-dashboard": "<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" />", "messages-square": "<path d=\"M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z\" /> <path d=\"M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1\" />", "book": "<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" />", "boxes": "<path d=\"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z\" /> <path d=\"m7 16.5-4.74-2.85\" /> <path d=\"m7 16.5 5-3\" /> <path d=\"M7 16.5v5.17\" /> <path d=\"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z\" /> <path d=\"m17 16.5-5-3\" /> <path d=\"m17 16.5 4.74-2.85\" /> <path d=\"M17 16.5v5.17\" /> <path d=\"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z\" /> <path d=\"M12 8 7.26 5.15\" /> <path d=\"m12 8 4.74-2.85\" /> <path d=\"M12 13.5V8\" />", "file-pen-line": "<path d=\"m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2\" /> <path d=\"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /> <path d=\"M8 18h1\" />", "orbit": "<circle cx=\"12\" cy=\"12\" r=\"3\" /> <circle cx=\"19\" cy=\"5\" r=\"2\" /> <circle cx=\"5\" cy=\"19\" r=\"2\" /> <path d=\"M10.4 21.9a10 10 0 0 0 9.941-15.416\" /> <path d=\"M13.5 2.1a10 10 0 0 0-9.841 15.416\" />", "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\" /> <path d=\"M2 12h20\" />", "flame": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\" />", "zap": "<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\" />", "images": "<path d=\"M18 22H4a2 2 0 0 1-2-2V6\" /> <path d=\"m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18\" /> <circle cx=\"12\" cy=\"8\" r=\"2\" /> <rect width=\"16\" height=\"16\" x=\"6\" y=\"2\" rx=\"2\" />", "crown": "<path d=\"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z\" /> <path d=\"M5 21h14\" />", "id-card": "<path d=\"M16 10h2\" /> <path d=\"M16 14h2\" /> <path d=\"M6.17 15a3 3 0 0 1 5.66 0\" /> <circle cx=\"9\" cy=\"11\" r=\"2\" /> <rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />", "swatch-book": "<path d=\"M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z\" /> <path d=\"M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7\" /> <path d=\"M 7 17h.01\" /> <path d=\"m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8\" />", "hand-helping": "<path d=\"M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14\" /> <path d=\"m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /> <path d=\"m2 13 6 6\" />", "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />", "mail-open": "<path d=\"M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z\" /> <path d=\"m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10\" />", "badge-check": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /> <path d=\"m9 12 2 2 4-4\" />", "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /> <path d=\"M12 17h.01\" />", "flag": "<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\" /> <line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\" />", "pen-line": "<path d=\"M12 20h9\" /> <path d=\"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z\" />", "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /> <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />", "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />", "map": "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\" /> <path d=\"M15 5.764v15\" /> <path d=\"M9 3.236v15\" />", "layout-grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />", "check": "<path d=\"M20 6 9 17l-5-5\" />", "qr-code": "<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\" /> <rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" /> <path d=\"M21 16h-3a2 2 0 0 0-2 2v3\" /> <path d=\"M21 21v.01\" /> <path d=\"M12 7v3a2 2 0 0 1-2 2H7\" /> <path d=\"M3 12h.01\" /> <path d=\"M12 3h.01\" /> <path d=\"M12 16v.01\" /> <path d=\"M16 12h1\" /> <path d=\"M21 12v.01\" /> <path d=\"M12 21v-1\" />", "chevron-left": "<path d=\"m15 18-6-6 6-6\" />", "chevron-right": "<path d=\"m9 18 6-6-6-6\" />", "send": "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /> <path d=\"m21.854 2.147-10.94 10.939\" />", "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <polyline points=\"7 10 12 15 17 10\" /> <line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />", "share-2": "<circle cx=\"18\" cy=\"5\" r=\"3\" /> <circle cx=\"6\" cy=\"12\" r=\"3\" /> <circle cx=\"18\" cy=\"19\" r=\"3\" /> <line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /> <line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />", "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />", "arrow-right-left": "<path d=\"m16 3 4 4-4 4\" /> <path d=\"M20 7H4\" /> <path d=\"m8 21-4-4 4-4\" /> <path d=\"M4 17h16\" />", "user-plus": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\" /> <line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\" />", "log-in": "<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\" /> <polyline points=\"10 17 15 12 10 7\" /> <line x1=\"15\" x2=\"3\" y1=\"12\" y2=\"12\" />", "plus": "<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />", "badge-dollar-sign": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /> <path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /> <path d=\"M12 18V6\" />", "banknote": "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" /> <circle cx=\"12\" cy=\"12\" r=\"2\" /> <path d=\"M6 12h.01M18 12h.01\" />", "gem": "<path d=\"M6 3h12l4 6-10 13L2 9Z\" /> <path d=\"M11 3 8 9l4 13 4-13-3-6\" /> <path d=\"M2 9h20\" />", "trash-2": "<path d=\"M3 6h18\" /> <path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /> <path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /> <line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /> <line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />", "clipboard-copy": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /> <path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v4\" /> <path d=\"M21 14H11\" /> <path d=\"m15 10-4 4 4 4\" />", "info": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />", "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /> <path d=\"M21 3v5h-5\" /> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /> <path d=\"M8 16H3v5\" />", "undo-2": "<path d=\"M9 14 4 9l5-5\" /> <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\" />", "camera": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\" /> <circle cx=\"12\" cy=\"13\" r=\"3\" />", "image-plus": "<path d=\"M16 5h6\" /> <path d=\"M19 2v6\" /> <path d=\"M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5\" /> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" /> <circle cx=\"9\" cy=\"9\" r=\"2\" />", "scan-line": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /> <path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /> <path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /> <path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /> <path d=\"M7 12h10\" />", "wand-sparkles": "<path d=\"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72\" /> <path d=\"m14 7 3 3\" /> <path d=\"M5 6v4\" /> <path d=\"M19 14v4\" /> <path d=\"M10 2v2\" /> <path d=\"M7 8H3\" /> <path d=\"M21 16h-4\" /> <path d=\"M11 3H9\" />", "check-check": "<path d=\"M18 6 7 17l-5-5\" /> <path d=\"m22 10-7.5 7.5L13 16\" />", "calculator": "<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"6\" y2=\"6\" /> <line x1=\"16\" x2=\"16\" y1=\"14\" y2=\"18\" /> <path d=\"M16 10h.01\" /> <path d=\"M12 10h.01\" /> <path d=\"M8 10h.01\" /> <path d=\"M12 14h.01\" /> <path d=\"M8 14h.01\" /> <path d=\"M12 18h.01\" /> <path d=\"M8 18h.01\" />", "coins": "<circle cx=\"8\" cy=\"8\" r=\"6\" /> <path d=\"M18.09 10.37A6 6 0 1 1 10.34 18\" /> <path d=\"M7 6h1v4\" /> <path d=\"m16.71 13.88.7.71-2.82 2.82\" />", "calendar-clock": "<path d=\"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5\" /> <path d=\"M16 2v4\" /> <path d=\"M8 2v4\" /> <path d=\"M3 10h5\" /> <path d=\"M17.5 17.5 16 16.3V14\" /> <circle cx=\"16\" cy=\"16\" r=\"6\" />", "handshake": "<path d=\"m11 17 2 2a1 1 0 1 0 3-3\" /> <path d=\"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4\" /> <path d=\"m21 3 1 11h-2\" /> <path d=\"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3\" /> <path d=\"M3 4h8\" />", "factory": "<path d=\"M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /> <path d=\"M17 18h1\" /> <path d=\"M12 18h1\" /> <path d=\"M7 18h1\" />", "database": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /> <path d=\"M3 5V19A9 3 0 0 0 21 19V5\" /> <path d=\"M3 12A9 3 0 0 0 21 12\" />", "hash": "<line x1=\"4\" x2=\"20\" y1=\"9\" y2=\"9\" /> <line x1=\"4\" x2=\"20\" y1=\"15\" y2=\"15\" /> <line x1=\"10\" x2=\"8\" y1=\"3\" y2=\"21\" /> <line x1=\"16\" x2=\"14\" y1=\"3\" y2=\"21\" />"};
const LOGO='data:image/webp;base64,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';
/* ===== Brand Map deck — source of truth: printed cards ===== */
const STAGES=[
{n:1,min:25,name:'السوق',ord:'الأولى',ask:'أين تلعب؟',c:'#6A97CF',ci:'#3F72B5',
 intro:'لا استراتيجية بلا ملعب محدّد. هذا المحور يمنعك من أخطر خطأ افتتاحي: تعريف سوقك بأوسع مما تبيع فعلاً — فمن يقول «سوق التجميل» وهو يصنع عطور نيش، سيقيس نفسه بمنافسين ليسوا منافسيه.',
 qs:[
 {no:1,slot:'دورة حياة السوق',t:'دورة حياة السوق',sub:'في أيّ مرحلة سوقك؟',ic:'store',head:'في أيّ مرحلة سوقك؟',type:'opt',
  ans:[
   {k:'1',t:'سوق ناضج',d:'السوق مستقر ومتشبّع. الولاء والتمايز يفوزان على الكمية.',ic:'trending-up',x:'متشبّع ومستقر: الولاء والتمايز يفوزان على الكمّية — تقضم من المنافس لا من فراغ.'},
   {k:'2',t:'سوق منحدر',d:'الطلب يتراجع. التجديد، أو إعادة التموضع، أو الانسحاب.',ic:'trending-down',x:'الطلب يتراجع بنيوياً: تجديد الفئة، أو إعادة تموضع لسوق مجاور نامٍ، أو انسحاب مبكر مشرّف.'},
   {k:'3',t:'سوق ناشئ',d:'العملاء يكتشفون المنتج. التعليم والابتكار قبل البيع.',ic:'store',x:'العملاء يكتشفون الفئة أصلاً: مهمتك التعليم قبل البيع — ومن يعلّم السوق يملكه.'},
   {k:'4',t:'سوق نمو',d:'الطلب يزيد سنوياً. التركيز على الحصة السوقية والتوسّع.',ic:'sprout',x:'الطلب يتّسع سنوياً: المعركة على الحصة — توسّع أسرع من تحسينك.'}],
  g:{why:'مرحلة السوق تحدّد نوع معركتك قبل أي قرار آخر: تعليمٌ أم حصةٌ أم ولاءٌ أم تجديد.',trap:'ملء البطاقات عن «السوق الذي نتمناه» لا الذي نبيع فيه فعلاً. العب بأرقام اليوم — الطموح مكانه محور الرؤية.'}},
 {no:2,slot:'اتجاهات السوق',t:'اتجاهات السـوق',sub:'أبرز الاتجاهات المؤثرة (PESTLE)',ic:'chart-column-increasing',type:'fill',
  ans:[{k:'1',f:'pestle',head:'أبرز الاتجاهات المؤثرة (PESTLE)'}],
  g:{why:'الهدف اصطياد الموجة قبل المنافس، لا وصف الحاضر.',how:'امسح الأبعاد الستة سريعاً، ثم ركّز على الأشد ضرباً لسوقك واكتبه بصيغة «التغيير ← الفرصة/التهديد علينا».',ex:'(اجتماعي) صعود الفخر بالهوية المحلية ← فرصة لعلامة تراثية. (قانوني) اشتراطات هيئة الغذاء والدواء ← التزام قبل الإطلاق لا بعده.'},
  tests:'هل كل بند مكتوب بصيغة «تغيير ← فرصة/تهديد علينا» أم مجرد وصف عام؟ هل يخصّ هذا السوق تحديداً أم يصلح لأي سوق؟'},
 {no:3,slot:'المنافسون',t:'المنافسون',sub:'من أخطر منافسيك؟',ic:'users',type:'fill',max:3,
  ans:[{k:'1',f:'comp',n:1,head:'المنافس رقم 1'},{k:'2',f:'comp',n:2,head:'المنافس رقم 2'},{k:'3',f:'comp',n:3,head:'المنافس رقم 3'}],
  g:{why:'الخطورة = تداخل الشريحة × تداخل القيمة — لا الحجم. متجرٌ صغير يخطف شريحتك أخطر من عملاق يخدم غيرها.',how:'لكل منافس: الاسم، الخطورة، أهم قوة، أهم ضعف. ضعفه هو بوابة تموضعك في مرحلة الرسالة.',trap:'نسيان البديل غير المباشر — المقلّد الرخيص يسحب شريحة السعر بصمت.',tip:'إن اختلفوا على كثافة السوق، اطلب من كلٍّ تسمية خمسة منافسين في ٣٠ ثانية — العجز عن التسمية يحسم أكثر من الجدل.'},
  tests:'هل الخطورة مقدّرة بتداخل الشريحة والقيمة لا بالحجم؟ هل الضعف المكتوب قابل للاستغلال في التموضع؟'},
 {no:4,slot:'المصنّعين',t:'خصائص السوق',sub:'حدّد طبيعة السوق',sub2:'كم عدد المصنّعين؟',ic:'file-chart-pie',head:'عدد المصنّعين',type:'opt',
  ans:[
   {k:'1',t:'واحـد',d:'',art:'m1',x:'سوق شبه احتكاري نادر: معركتك مع البدائل من خارج الفئة لا مع منافسين.'},
   {k:'2',t:'قليـل',d:'',art:'m4',x:'قلّة مهيمنة يعرف بعضها بعضاً: التمايز بالهوية ممكن — لكن كل حركة تُرصد وتُقلَّد سريعاً.'},
   {k:'3',t:'كثيـر',d:'',art:'m16',x:'سوق مزدحم مفتّت: التفرّد الحاد شرط بقاء لا ترف، والمنافسة بالسعر فخّ بلا قاع.'}],
  g:{why:'عدد اللاعبين يحدّد هل تتنافس بالهوية أم بالبقاء.'}},
 {no:5,slot:'المنتجات',t:'خصائص السوق',sub:'حدّد طبيعة السوق',sub2:'ماهو نوع المنتجات ؟',ic:'file-chart-pie',head:'نوع المنتجات',type:'opt',
  ans:[
   {k:'1',t:'متطابق',d:'',art:'same',x:'سلعة تتشابه عند الجميع: العلامة هي الفارق الوحيد تقريباً — قصة وتجربة وتوزيع.'},
   {k:'2',t:'مختلف',d:'',art:'diff',x:'تمايز وظيفي ممكن: اربط كل فرق تقني بفائدة يشعر بها العميل — الفرق غير المحسوس غير موجود.'},
   {k:'3',t:'فريـد',d:'',ic:'star',x:'ابتكار قليل النظائر: عبء تعليم السوق عليك، وحمايتك سرعة الإيقاع وقوة القصة.'}],
  g:{why:'مدى تشابه المنتجات يحدّد وزن العلامة في قرار الشراء.'}},
 {no:6,slot:'حواجز الدخول',t:'خصائص السوق',sub:'حدّد طبيعة السوق',sub2:'كمية حواجز الدخول ؟',ic:'file-chart-pie',head:'حواجز الدخول',type:'opt',
  ans:[
   {k:'1',t:'قليلة',d:'',art:'b1',warn:'(حواجز قليلة) + (تمايز بقيادة المنتج) = خطر تقليد سريع',x:'أي نجاح يُستنسخ خلال أشهر: ابنِ حواجز ناعمة فوراً — مجتمع، قصة، علاقات توزيع.'},
   {k:'2',t:'متوسطة',d:'',art:'b2',x:'تكلفة دخول معتبرة: نافس على الكفاءة والعلامة معاً.'},
   {k:'3',t:'فائقة',d:'',art:'b3',x:'رأس مال أو تراخيص ثقيلة: قلّة تتنافس على التميّز التشغيلي والثقة.'}],
  g:{why:'الحواجز تحدّد كم يعيش تميّزك قبل أن يُنسخ.'}}
 ]},
{n:2,min:25,name:'الجمهور',ord:'الثانية',ask:'لمن تلعب؟',c:'#A3D16C',ci:'#5E9A2A',
 intro:'من يستهدف الجميع لا يصيب أحداً. هذا المحور يجبرك على أقسى قرار كريم: اختيار من تخدمهم — لأن الشريحة الأهم قرار ذهبي تُبنى عليه الرسالة والسعر والهوية كلها.',
 qs:[
 {no:1,slot:'من عميلك الأساسي',t:'من هو عميلك الأساسي؟',tag:'( الشريحة الأهم)',lbl:'شريحة العملاء',note:'واحد فقط كأولوية أولى، الذي يستهدف الكل لا يصيب أحداً.',ic:'scan-face',head:'من هو عميلك الأساسي؟',type:'opt',gold:true,
  ans:[
   {k:'1',t:'جيـل Z',d:'١٨-٢٦ سنة. رقميون، يبحثون عن المعنى والشفافية. القيم قبل المنتج.',ic:'smartphone',x:'القيم قبل المنتج — يفضحون الادّعاء بثانية.'},
   {k:'2',t:'جيل الألفية',d:'٢٧-٤٢ سنة. مهنيون، يقدّرون التجربة والجودة. القيمة مقابل المال.',ic:'briefcase',x:'القيمة مقابل المال — يدفعون للمُثبَت لا للمُدّعى.'},
   {k:'3',t:'جيـل X',d:'٤٣-٥٨ سنة. قرار مدروس، ولاء للعلامات الموثوقة. الثقة قبل الإغراء.',ic:'house',x:'الثقة قبل الإغراء — كسبه بطيء وخسارته شبه نهائية.'},
   {k:'4',t:'شركات',t2:'(B2B)',d:'قرار جماعي ومنطقي. عائد الاستثمار والكفاءة قبل الجاذبية.',ic:'wrench',x:'العائد والكفاءة قبل الجاذبية — أقنع اللجنة لا الفرد.'},
   {k:'p',spare:true,t:'كرت احتياط',d:'بطاقة فارغة لكتابة شريحة مخصّصة لحالتك إن لم تجدها أعلاه.',ic:'square-plus',code:'Q5.2'}],
  g:{why:'قرار ذهبي: كل ما بعده — الرسالة والسعر والهوية — يُبنى على هذه البطاقة.',trap:'«جمهورنا الجميع — الكل يحتاج منتجنا». إن صحّ ذلك فأنت سلعة عامة؛ عُد لمرحلة السوق واعترف بها والعب لعبتها.',tip:'عند التردد بين شريحتين اسأل: «لو اتصلت الاثنتان الآن ولديكم مخزون لواحدة — لمن تبيعون؟» الجواب الغريزي هو الذهبية.'}},
 {no:2,slot:'تجزئة السوق',t:'تجزئة السوق',sub:'الشريحة الأهم ومحرّكها؟',ic:'presentation',head:'الشريحة الأهم ومحرّكها؟',type:'opt',
  ans:[
   {k:'1',pre:'الباحث',t:'عن السعر',ic:'hand-coins',warn:'(الباحث عن السعر) يتوتر مع (قيمة فاخرة)',x:'القيمة الكمّية أولاً. اخترها إن كان التميز التشغيلي قيمتك — وإلا فراجع التعارض.'},
   {k:'2',pre:'الباحث',t:'عن الأداء',ic:'cog',x:'النتيجة والجودة أولاً: يدفع أكثر مقابل تفوّق يُقارَن.'},
   {k:'3',pre:'الباحث',t:'عن الانتماء',ic:'users-round',x:'المعنى والهوية أولاً: يشتري ما يمثّله لا ما يحتاجه — قصتك هي منتجك.'},
   {k:'4',pre:'الباحث',t:'عن السهولة',ic:'lightbulb',x:'الوقت والراحة أولاً: بسّط حياته وسيدفع ثمن التبسيط بلا نقاش.'}],
  g:{why:'العمر يقول من هو، والمحرّك يقول لماذا يشتري — والرسالة تُبنى على الثاني.'}},
 {no:3,slot:'شريحة الدخل لعميلك',t:'ما شريحة الدخل الأقرب لعميلك؟',lbl:'شريحة الدخل',note:'يربط البراند بالسعر والقيمة المتوقعة.',ic:'wallet',head:'شريحة الدخل',type:'opt',
  ans:[
   {k:'1',t:'اقتصادي',d:'حساس للسعر، يقارن بدقة. اللعب على القيمة الكمّية.',ic:'badge-dollar-sign',x:'العب على القيمة الكمّية والوضوح — لا وعود فخامة.'},
   {k:'2',t:'متوسط',d:'يبحث عن التوازن. قيمة جيّدة بسعر معقول. الأكثر شيوعاً.',ic:'circle-dollar-sign',x:'«قيمة جيدة بسعر معقول» — الأوسع والأشرس تنافساً.'},
   {k:'3',t:'فوق متوسط',d:'يدفع أكثر مقابل التميّز. الجودة والذكاء معاً.',ic:'piggy-bank',x:'الجودة والذكاء معاً — يكره الابتزاز ويكافئ الإتقان.'},
   {k:'4',t:'مرتفع / فاخر',d:'السعر ليس عائقاً. يبحث عن التجربة والاستثناء والمكانة.',ic:'chart-column-increasing',x:'يشتري التجربة والاستثناء والمكانة — والندرة جزء من المنتج.'}],
  g:{why:'شريحة الدخل تربط العلامة بالسعر المتوقع — وتكشف مبكراً أي وعد لن يدفع العميل ثمنه.'}},
 {no:4,slot:'ملف العميل',t:'ملف العميل',sub:'من هو عميلك المثالي؟',ic:'file-user',type:'fill',
  ans:[{k:'1',f:'fields',head:'من هو عميلك المثالي؟',fields:[['story','السمات والقصة',3],['pains','المشاكل',3],['asks','الحلول التي يطلبها',3]]}],
  g:{why:'«ريان، ٣٣، مدير مبيعات» يتّخذ الفريق لأجله قرارات أفضل من «الشريحة أ». التفاصيل تصنع القرار، والتجريد يقتله.',how:'أعطه اسماً وعمراً ومهنة، ثم اكتب مشاكله بلغته هو. الأثمن: الاعتراض — الجملة التي يقولها قبل ألا يشتري («غالي حتى أجرّبه») لأن رسالتك ستُبنى لتفكيكها.',ex:'«ريما، ٣٢، مصمّمة، تريد عباءة تميّزها دون مبالغة — تعترض على السعر حتى تلمس الخامة» ← إذن الخامة تُقدَّم قبل السعر في كل نقطة بيع.'},
  tests:'هل للعميل اسم وعمر ومهنة وقصة؟ هل المشاكل مكتوبة بلغته لا بلغة الشركة؟ هل يظهر اعتراض واضح قبل الشراء؟ هل الحلول متّسقة مع الشريحة المختارة؟'},
 {no:5,slot:'يوم في حياة عميلي',t:'يوم في حياة عميلي',sub:'من الاستيقاظ الى النوم وأين تدخل علامتك؟',ic:'user-round',type:'fill',
  ans:[{k:'1',f:'lines',head:'يوم في حياة عميلي',prompt:'اكتب رحلة يوم كامل - أين تظهر علامتك ؟',rows:10}],
  g:{why:'يكشف اللحظة التي يحتاجك فيها العميل فعلاً.',how:'اكتب يومه ساعةً بساعة، وضع نجمة على «لحظة الاحتياج» — لا اللحظة التي يسهل إعلانك فيها. الفرق بينهما هو الفرق بين حضور مرحَّب به وإزعاج مدفوع.'},
  tests:'هل الرحلة ساعة بساعة؟ هل هناك لحظة احتياج حقيقية محدّدة أم مجرد لحظة يسهل الإعلان فيها؟'}
 ]},
{n:3,min:25,name:'القيمة',ord:'الثالثة',ask:'لماذا أنت؟',c:'#A58FC6',ci:'#7560A3',
 intro:'لا علامة تتفوّق في كل شيء — ومن يدّعي ذلك لا يتفوّق في شيء. هذا المحور يفرض قيمة أولى تتفوّق فيها على الجميع، وثانية لا تقلّ فيها عن السوق، وثالثة تكتفي فيها بالمقبول.',
 qs:[
 {no:1,slot:'المنتجات',t:'المنتجات',sub:'B2B أم B2C ؟',sub2:'وما منتجاتك؟',ic:'package-open',head:'ماهو المنتج / الخدمة؟',type:'fill',max:2,
  ans:[
   {k:'1',f:'prod',code2:'B2C',art:'b2c',x:'قرار فردي عاطفي سريع: التجربة والقصة والعلامة تصنع الشراء — والمنطق يبرّره لاحقاً.'},
   {k:'2',f:'prod',code2:'B2B',art:'b2b',x:'قرار جماعي منطقي متعدد المصادقات: رسالتك عائد وأرقام ومخاطر مُدارة — والعاطفة توابل لا طبقاً.'},
   {k:'3',f:'prod',code2:'B2G',art:'b2g',x:'البيع للجهات الحكومية: دورة شراء أطول تحكمها المنافسات والاشتراطات.'}],
  g:{why:'لمن تبيع يغيّر الرسالة كلها: منشأة تقرّر بلجنة، وفرد يقرّر بقلبه.',how:'اختر البطاقة (أو اثنتين إن كنت تبيع للطرفين فعلاً اليوم) واكتب عليها منتجاتك/خدماتك.'},
  tests:'هل المنتجات محدّدة (أسماء/فئات/أسعار تقريبية) أم عامة؟ هل نوع البيع متّسق مع الشريحة المختارة في الجمهور؟'},
 {no:2,slot:'البديل الحقيقي',t:'البديل الحقيقي',lbl:'لو لم نوجد',note:'سيضطر عميلي إلى ...',ic:'user-x',type:'fill',
  ans:[{k:'1',f:'lines',head:'البديل الحقيقي',prompt:'لو لم نوجد سيضطر عميلي إلى ..',rows:10}],
  g:{why:'أصدق سؤال في اللعبة: إجابته تكشف منافسك الحقيقي — الذي قد لا يكون في فئتك أصلاً.',how:'البديل ليس دائماً منتجاً منافساً؛ قد يكون «قراراً متسرّعاً بلا استشارة» أو «طريقةً أخرى ليُلاحَظ».',ex:'بديل تطبيق التعلّم ليس تطبيقاً آخر — بل «فيديوهات يوتيوب المجانية المبعثرة» ← إذن قيمتك التنظيم لا المحتوى.'},
  tests:'هل البديل هو ما سيفعله العميل فعلاً (قد يكون عادة أو طريقة لا منتجاً)؟ ماذا تكشف الإجابة عن القيمة الحقيقية للعلامة؟'},
 {no:3,slot:'القيمة الأساسية',t:'ماهي القيمة الأساسية لبراندك؟',lbl:'عرض القيمة',note:'كل الشركات تحوي القيم الثلاث، لكن الترتيب يصنع البراند.',ic:'hand-helping',head:'ماهي القيمة الأساسية لبراندك؟',type:'opt',gold:true,
  ans:[
   {k:'1',t:'قيادة المنتج',d:'ابتكار وتجربة لا مثيل لها. أمثلة:',ex:'Apple, Tesla',ic:'rocket',warn:'(قيادة المنتج) + سوق متراجع / جمهور السعر = توتر',x:'اخترها إن كنت مستعداً لإيقاع إصدارات دائم وتسعير أعلى — وتحمّل المقلّدين.'},
   {k:'2',t:'قرب العميل',d:'علاقة وخدمة استثنائية. أمثلة:',ex:'Ritz-Carlton',ic:'heart-handshake',x:'اخترها إن كانت المعرفة الشخصية بعميلك أصلك الحقيقي — تكلفتها بشرٌ لا آلات.'},
   {k:'3',t:'التميز التشغيلي',d:'كفاءة وسرعة وسعر. أمثلة:',ex:'IKEA, Southwest',ic:'cog',x:'اخترها إن كانت عملياتك سلاحاً يعجز غيرك عن مجاراته — وإلا فهي حرب استنزاف.'}],
  g:{why:'قرار ذهبي. قيمة أولى تتفوّق فيها على الجميع، وثانية لا تقلّ فيها عن السوق — قائد منتجٍ خدمتُه كارثية يخسر قيادته — وثالثة تكتفي فيها بالمقبول.',trap:'اختيار «قيادة المنتج» لأنه يبدو الأفخم — بينما عملياتكم ممتازة وابتكاركم عادي. القيمة تُختار من مرآة القدرات لا من واجهة الأمنيات.',tip:'اطلب دليلاً حسّياً واحداً لكل قيمة مقترحة: «ما الذي فعلتموه الشهر الماضي يثبتها؟» — القيمة بلا دليل حديث أمنية.'}},
 {no:4,slot:'التحليل الرباعي',t:'التحليل الرباعي SWOT الداخلي والخارجي',lbl:'اكتب نقاط',note:'القوة والضعف والفرص والتهديدات',ic:'grid-2x2',type:'fill',
  ans:[{k:'1',f:'swot',head:'تحليل SWOT الداخلي والخارجي'}],
  g:{why:'جسر بين الخارج والداخل قبل التموضع.',how:'القوة والضعف تحت سيطرتك (فريق، منتج، علامة). الفرص والتهديدات خذها جاهزة من بطاقة الاتجاهات في مرحلة السوق حتى لا تكون عامة. ثلاثة بنود لكل ربع تكفي — الرباعي المكتظ لم يُفكَّر فيه.',tip:'كل «ضعف» يُكتب يجب أن يُقرَّر بجانبه: نعالجه، أم نحيّده، أم نتعايش معه واعين.'},
  tests:'هل القوة والضعف داخليان فعلاً والفرص والتهديدات خارجية؟ هل البنود محدّدة أم عامة (مثل «فريق متحمس»)؟ هل لكل ضعف قرار (نعالج/نحيّد/نتعايش)؟ هل تتّسق الفرص مع بطاقة الاتجاهات؟'}
 ]},
{n:4,min:20,name:'الشخصية',ord:'الرابعة',ask:'من أنت؟',c:'#4DC2EC',ci:'#1B8DB8',
 intro:'الناس لا يرتبطون بمنتجات بل بشخصيات. هذا المحور يحوّل علامتك من «شركة» إلى «أحد» — له نبرة وعمر وسمات ونموذج سردي يتعرّفه الجمهور قبل أن يقرأ اسمك.',
 qs:[
 {no:1,slot:'النبرة الأقرب لبراندك',t:'ما النبرة الأقرب لبراندك؟',lbl:'نبرة الصوت',note:'تحكم كل ما يُكتب: إعلانات، سوشيال، رسائل بريدية.',ic:'audio-lines',head:'ما النبرة الأقرب لبراندك؟',type:'opt',
  ans:[
   {k:'1',t:'ودّي/إنساني',d:'دافئ، قريب، يخاطبك كصديق.',q:'"يا هلا، شخبارك؟"',face:'love',x:'قرب فوري — يناسب الخدمات اليومية وجمهور السهولة.'},
   {k:'2',t:'رسمي/موثوق',d:'مهني، مدروس، هادئ.',q:'"تحية طيبة، نتشرف بإفادتكم..."',face:'nerd',x:'هيبة وثقة — الأنسب للمال والصحة وB2B.'},
   {k:'3',t:'مرح/لعوب',d:'طاقة، روح دعابة، خفّة.',q:'يستخدم الإيموجي، يكسر الجدّية.',face:'tongue',x:'انتباه جيل Z — لكنه يحتاج انضباطاً كي لا يصبح استخفافاً.'},
   {k:'4',t:'جريء/متحدّي',d:'واثق، صريح، مستفزّ أحياناً.',q:'"نحن لسنا للجميع، ولا نحاول أن نكون."',face:'cool',x:'استقطاب واعٍ: يطرد البعض ليخلص لك الباقون.'}],
  g:{why:'النبرة تحكم كل ما يُكتب باسمك — من الإعلان إلى رسالة خدمة العملاء.'}},
 {no:2,slot:'البراند شبابي أم راسخ',t:'هل البراند شبابي أم راسخ ؟',lbl:'عمر البراند',note:'يحدّد نوع التصميم والإيقاع البصري.',ic:'drama',head:'البراند شبابي أم راسخ ؟',type:'opt',
  ans:[
   {k:'1',t:'شبابي',d:'طاقة، تجدّد، مغامرة.',q:'يلائم جيل Z والابتكار.',face:'cool',x:'إيقاع سريع وصور متحركة وجرأة لونية.'},
   {k:'2',t:'متوازن',d:'عصري لكنّه ثابت.',q:'يجمع التجدّد بالموثوقية.',face:'smile',x:'الخيار الآمن للأسواق العائلية — حداثة بلا صخب.'},
   {k:'3',t:'راسخ',d:'خبرة، هيبة، تراث.',q:'يلائم القطاعات التي تحتاج ثقة.',face:'monocle',x:'بطء واثق وتفاصيل كلاسيكية — «كنّا هنا وسنبقى».'}],
  g:{why:'عمر العلامة يحدّد الإيقاع البصري ونوع الخط لاحقاً.'}},
 {no:3,slot:'سمات العلامة',t:'سمات العلامـة',ic:'sparkles',type:'fill',
  ans:[{k:'1',f:'fields',head:'سمات العلامة',fields:[['soc','المجتمع يصفنا بـ',1],['cli','عملاؤنا',1],['voice','صوتنا',1],['impact','قيمتنا (الأثر)',1],['edge','ميزتنا الفارقة',1]]}],
  g:{why:'خمس كلمات تصف العلامة من خمس زوايا.',trap:'«مميّز» و«احترافي» و«جودة» كلمات محرّمة هنا — يدّعيها الجميع فلا تصف أحداً.',how:'ابحث عن صفات لها حدّ: غامض، حِرَفي، متمرّد، دافئ، صريح.'},
  tests:'هل استُخدمت كلمات عامة محرّمة (مميّز، احترافي، جودة)؟ هل تتّسق الكلمات مع النبرة والعمر المختارين؟ هل «ميزتنا الفارقة» تنكسر إن وُضع اسم منافس مكان اسمنا؟'},
 {no:4,slot:'نموذج Archetype',t:'النموذج Archetype',sub:'أيّ نموذج تتبنّاه علامتك ؟',ic:'clipboard-list',head:'أي نموذج تتبنّاه علامتك؟',type:'opt',max:2,
  ans:[
   {k:'1',t:'البريء',d:'تفاؤل وبساطة وصدق',face:'frown',x:'لمنتجات النقاء والعائلة.'},
   {k:'2',t:'الحكيم',d:'معرفة وحقيقة وإرشاد',face:'halo',x:'للاستشارات والتعليم والمحتوى العميق.'},
   {k:'3',t:'المستكشف',d:'حرية واكتشاف وتجربة جديدة.',face:'cool',x:'للسفر والمغامرة وكسر الروتين.'},
   {k:'4',t:'البطل',d:'شجاعة وإنجاز وتغلّب على التحدّي',ex:'مثال: Nike',face:'smile',x:'للرياضة والتحدّي وتحقيق الذات.'},
   {k:'5',t:'المتمّرد',d:'كسر القواعد والثورة على المألوف',face:'wow',x:'لمن يبيع الثورة على السائد — التزمه أو لا تدّعه.'},
   {k:'6',t:'الساحر',d:'تحويل الحلم إلى واقع والدهشة',ex:'مثال: Apple',face:'stars',x:'للتقنية والتحوّلات والتجارب الآسرة.'},
   {k:'7',t:'العادي/الرفيق',d:'انتماء وواقعية وقرب من الناس',face:'plain',x:'للعلامات الشعبية اليومية — «واحد منّا».'},
   {k:'8',t:'العاشق',d:'جمال وعلاقة وحميمية',face:'hearts',x:'للعطور والضيافة وكل ما يُهدى.'},
   {k:'9',t:'المهرج',d:'متعة ولحظة وخفّة روح',face:'dizzy',x:'للترفيه والوجبات الخفيفة وكل ما يُستهلك بمرح.'},
   {k:'10',t:'الراعي',d:'رعاية وحماية وسخاء',face:'content',x:'للصحة والرعاية والخدمات التي تحمي.'},
   {k:'11',t:'الحاكم',d:'نظام وسيطرة ومكانة',face:'nerd2',x:'للفخامة والقيادة والعلامات التي تضع المعيار.'},
   {k:'12',t:'الصانع',d:'إبداع وإتقان وبناء',face:'grin',x:'للحِرَف والأدوات والإبداع.'}],
  g:{why:'النموذج السردي يمنح الشخصية قصة يتعرّفها الجمهور لا شعورياً.',how:'نموذج أساسي واحد + ظل ثانوي كحد أقصى (الساحر/العاشق). ثلاثة نماذج = بلا نموذج. والنموذج يُلزم: «المتمرّد» الذي يعتذر عن كل نقد ليس متمرّداً.',trap:'اختيار الشخصية التي يحبها المؤسّس لنفسه لا التي يحتاجها الجمهور المختار — العلامة مرآة عميلك قبل مرآتك.',tip:'لعبة كاشفة: «لو دخلت علامتكم هذا المجلس شخصاً — ماذا ترتدي وبمَ تفتتح الكلام؟» الإجابات المتضاربة تكشف أن كل شريك يبني علامة مختلفة في رأسه.'}},
 {no:5,slot:'الطباع الإنسانية',t:'الطباع الإنسانية',sub:'أين تقع علامتك على المقاييس؟',ic:'clipboard-list',type:'fill',
  ans:[{k:'1',f:'scales',head:'الطباع الإنسانية',scales:[['أنثويـة','ذكورية'],['بسيطة','مركبة'],['شابـة','راسخة'],['كلاسيكية','عصرية'],['ودودة','رسمية'],['اقتصادية','باهظة'],['مرحـة','جـادة'],['غير مألوفة','سائدة'],['صناعية','طبيعية']]}],
  g:{why:'تحويل الشخصية من كلمات إلى مواضع قابلة للتنفيذ.',how:'الموضع الدقيق أهم من الطرف — «٦ من ٧ نحو الرسمية» قرار يُنفَّذ، أما «رسمية» فشعار. اربط كل مقياس متطرّف بقرار لاحق في الهوية (باهظة ← الأسود والتفاصيل الدقيقة).'},
  tests:'هل تتّسق المواضع مع النبرة والعمر والنموذج؟ هل هناك مقاييس في المنتصف تماماً تدل على عدم حسم؟'}
 ]},
{n:5,min:20,name:'الرسالة',ord:'الخامسة',ask:'ماذا تقول؟',c:'#E989BA',ci:'#C2528C',
 intro:'هنا تتحوّل قراراتك الصامتة إلى كلام: بيانٌ داخلي يُشتقّ منه كل شيء، وشعار لفظي يبقى في الذاكرة، وقاموس يضبط كل لسان يتكلّم باسمك، وموقعٌ على مصفوفة.',
 qs:[
 {no:1,slot:'بيان التموضع',t:'بيان التموضع',sub:'املأ قالب التموضع',ic:'layout-dashboard',type:'fill',
  ans:[{k:'1',f:'fields',head:'بيان التموضع',fields:[['seg','لـ(الشريحة)',3],['cat','نحن (الفئة) التي',3],['edge','الميزة الفارقة',3]],stmt:true}],
  g:{why:'نص داخلي لا يُنشر — لكنه يُشتقّ منه كل ما يُنشر.',how:'كل حقل يأتي من بطاقة سابقة: الشريحة من «من عميلك الأساسي»، والفئة من «المنتجات»، والميزة من «سمات العلامة». بيانٌ لا تستطيع ملأه = بطاقة سابقة لم تُحسم فعلاً.',trap:'صياغة بيان تموضع شاعري فضفاض «نلهم العالم لحياة أجمل» — البيان الذي لا يستبعد أحداً لا يموضع أحداً.',tip:'اقرأ البيان المكتمل ثم اسأل الطاولة: «أي جملة هنا يعجز منافسنا الأول عن قولها بصدق؟» — إن لم توجد، أعد فتح بطاقة الميزة.'},
  tests:'هل الشريحة محدّدة (لا «الجميع»)؟ هل الفئة واضحة؟ هل الميزة الفارقة تنكسر إن وُضع اسم المنافس الأول مكان اسمنا (اختبار الاستبدال)؟ هل يستبعد البيان أحداً؟'},
 {no:2,slot:'الشعار اللفظي',t:'الشعار اللفظي',sub:'جملة علامتك الموجزة؟',ic:'messages-square',type:'fill',
  ans:[{k:'1',f:'tagline',head:'جملة علامتك الموجزة؟'}],
  g:{why:'جملة من ٢–٥ كلمات تلخّص روح العلامة وتبقى في الذاكرة.',how:'ثلاثة اختبارات: (١) هل ينطبق على منافسك؟ إن نعم فهو ضعيف. (٢) هل يُقال شفهياً بلا تكلّف؟ (٣) هل يحمل صوت علامتك من مرحلة الشخصية؟ اكتب عشرة، صفِّ ثلاثة، ونَم ليلة قبل الحسم.',tip:'أكمل بصوت عميلك: «أريد أن يقول لصديقه عنّا: ___» — أنجح الشعارات تُشتقّ من هذه الجملة لا من العصف المجرد.'},
  tests:'طبّق الاختبارات الثلاثة على كل مقترح: هل ينطبق على المنافس؟ هل يُقال شفهياً بلا تكلّف؟ هل يحمل النبرة المختارة؟ وهل هو ٢–٥ كلمات؟'},
 {no:3,slot:'مفردات العلامة',t:'مفردات العلامة',sub:'قاموس علامتك الصغير',ic:'book',type:'fill',
  ans:[{k:'1',f:'fields',head:'قاموس علامتك الصغير',fields:[['say','كلمات نقولها',5],['avoid','كلمات نتجنّبها',5]],center:true}],
  g:{why:'القاموس هو ما يجعل عشرة كتّاب صوتاً واحداً.',how:'خمس كلمات نقولها دائماً (مصطلحاتنا الخاصة)، وخمس لا نقولها أبداً (لأنها تكسر التموضع أو تخصّ المنافس).',ex:'استشارية مستقلة تقول «شريك القرار» ولا تقول «وسيط». دار عطور تقول «أثر» ولا تقول «ريحة».'},
  tests:'هل الكلمات خاصة بالعلامة أم عامة؟ هل كلمات التجنّب تحمي التموضع فعلاً؟ هل تتّسق مع النبرة؟'},
 {no:4,slot:'مصفوفة التموضع',t:'مصفوفة التموضع',sub:'أين موقعك مقابل المنافسين؟',ic:'boxes',type:'fill',
  ans:[{k:'1',f:'matrix',head:'مصفوفة التموضع'}],
  g:{why:'ارسم موقعك وموقع المنافسين لتجد الفجوة البيضاء: الربع الذي يريده جمهورك ولا يقفه أحد.',how:'يصلح المحور إذا (أ) يهمّ عميلك فعلاً عند الشراء، و(ب) يفرز المنافسين لا يجمعهم. ضع المنافسين من بطاقات «المنافسون». إن لم توجد فجوة: بدّل محوراً، أو اقبل قتالاً مباشراً بوعي.',ex:'عباءات: (محتشم-تقليدي ↔ عصري-جريء) × (اقتصادي ↔ فاخر) ← فجوة «فاخر ميسور + عصري محتشم» كانت خالية تماماً.'},
  tests:'هل المحوران يهمّان العميل عند الشراء؟ هل يفرزان المنافسين أم يجمعانهم في زاوية؟ هل موقعنا في فجوة فعلاً؟'}
 ]},
{n:6,min:30,name:'التسمية',ord:'السادسة',ask:'ما اسمك؟',c:'#5CC3A5',ci:'#2E9477',
 intro:'الاسم هو القرار الذي يصعب تغييره — اللون يتغيّر بقرار مصمم، أما الاسم فتغييره إحراقٌ لرأس مال العلامة. ولهذا يُدار كقمعٍ صارم لا عصفٍ فوضوي.',
 qs:[
 {no:1,slot:'نوع الاسم',t:'نوع الاسم',sub:'أي نوع اسم تختار؟',ic:'file-pen-line',type:'fill',gold:true,
  ans:[{k:'1',f:'ntype',head:'نوع الاسم؟',warn:'(وصفي) يضعف تميّز (قيادة المنتج)'}],
  types:[['وصفي','يشرح ما تفعله («مغسلة الجودة»): فهمٌ فوري، تملّكٌ شبه معدوم — ويذوب في الفئة.'],['رمزي','يستحضر مكاناً أو قيمة أو أسطورة: عمق وقصة — بشرط أن يعرف جمهورك الرمز أو يسهل تعليمه.'],['مختزل','اختصار أو بترٌ لعبارة: عمليّ لـB2B — بارد العاطفة غالباً.'],['شخصي','اسم مؤسّس أو شخصية: مصداقية حِرَفية — ويقيّد البيع والتوريث لاحقاً.'],['مختلق','كلمة مصكوكة من العدم (KOMA): أعلى تملّك ونطاقات خالية — ويحتاج ميزانية تعريف.'],['عاطفي','يلمّح للإحساس والفائدة: التوازن الذهبي بين الفهم والتفرّد لمعظم العلامات الاستهلاكية.']],
  g:{why:'قرار ذهبي: نوع الاسم يحدّد مسار التوليد كله — ولا يُقلب إلا بإجماع الطاولة.',trap:'الاسم الوصفي مع «قيادة المنتج» — الاسم الشارح يذيبك في الفئة التي تدّعي قيادتها.'}},
 {no:2,slot:'بذور التوليد',t:'بذور التوليد',sub:'المادة الخام للمحرّك',ic:'orbit',type:'fill',
  ans:[{k:'1',f:'fields',head:'بذور التوليد',fields:[['seeds','كلمات بذرة (٣-٥)',3],['ref','مرجع / لهجة',2],['avoid','دلالات تُجنّب',2],['comp','منافسون للابتعاد',2]]}],
  g:{why:'البذور هي المادة الخام التي يُولَّد منها الاسم.',how:'طرق التوليد: من جذرٍ واحد (س-ر-د ← سَرد، سارِد، مِسرَد) · دمج كلمتين Portmanteau (Evo+Nexus) · قصّ كلمة أو قلب مقاطعها · اسم من عالمٍ آخر يحمل معناك (زورق = رحلة). والحروف تحمل معنى قبل الكلمة: الصفير سرعة، والحلقيّة عمق وفخامة، والميم دفء.',tip:'امنع نقد أي اسم أثناء التوليد منعاً باتاً — النقد المبكر يقتل البذور الغريبة، وخير الأسماء يولد غريباً.',ex:'«لبن» في مصر غير «لبن» في الخليج — والكارثة أن تكتشف الدلالة بعد الإطلاق لا قبله.'},
  tests:'هل البذور متنوّعة (جذر، مكان، قيمة، صوت)؟ هل هناك دلالات لهجية سلبية يجب تجنّبها في السوق المستهدف؟ اقترح ٥ أسماء مولّدة من البذور بطرق مختلفة.'},
 {no:3,slot:'دليل النطاقات',t:'دليل النطاقات',sub:'تحقّق التوفر',ic:'globe',type:'fill',
  ans:[{k:'1',f:'domains',head:'دليل النطاقات',rows:[['com','.com'],['sa','.sa'],['social','إنستقرام / إكس']]}],
  g:{why:'افحص قبل الوقوع في الحب.',trap:'الاسم الذي عشقته ثم وجدت علامته مسجّلة سيغريكم بحلول ملتوية تكلّف لاحقاً أضعاف بدء البحث من جديد.'},
  tests:'هل النطاقات والحسابات الأساسية متاحة؟ إن كانت محجوزة، ما البدائل المعقولة دون تشويه الاسم؟'},
 {no:4,slot:'بين حرفين',t:'بين حرفين',sub:'بأي لسان يولد اسمك؟',ic:'file-pen-line',head:'بين حرفين',type:'opt',
  ans:[
   {k:'1',t:'عربي/أصيل',d:'يُكتب لاتينياً بالنقحرة. عمق محلي',q:'واحتكاك عند التصدير',ic:'sparkles',x:'عمق محلي يصعب تقليده — واحتكاك نطقٍ عند التصدير: قرّر نقحرتك الرسمية اليوم (رِفل · مَعين).'},
   {k:'2',t:'لاتيني/عالمي',d:'يُعرَّب صوتياً. جاهز للتوسع',q:'أبرد حضوراً محلياً',ic:'flame',warn:'(لاتيني عالمي) + جمهور (الباحث عن الانتماء) = توتر',x:'جاهز للتوسع — أبرد حضوراً محلياً؛ عوّضه بعربية طاغية في الصوت والمحتوى.'},
   {k:'3',t:'هجين/ثنائي',d:'وجهان متكاملان بهوية واحدة.',ic:'zap',x:'أفضل العالمين — بشرط نظامٍ صارم: متى يظهر أيّ وجه؟'},
   {k:'4',t:'محايد/صوتي',d:'مقاطع تعمل بالاتجاهين بلا ترجمة',q:'الأصعب صناعةً والأعلى قيمة',ic:'zap',x:'مقاطع تعمل بالعربية واللاتينية بلا ترجمة (KOMA) — الأصعب صناعةً والأعلى قيمةً، كنز من عثر عليه.'}],
  g:{why:'لغة الاسم تحدّد أين يعيش بسهولة وأين يحتكّ.'}}
 ]},
{n:7,min:20,name:'الهوية',ord:'السابعة',ask:'كيف تبدو؟',c:'#EE5565',ci:'#D63446',
 intro:'أخيراً وصلنا حيث يبدأ الآخرون خطأً. وكل قرار هنا يُشتقّ لا يُخترع: المزاج من الشخصية، واللون من التموضع.',
 qs:[
 {no:1,slot:'الحس البصري',t:'ما الحس البصري الأقرب لبراندك؟',lbl:'المزاج البصري',note:'يحدّد لوحة الألوان واللغة البصرية.',ic:'images',head:'الحس البصري',type:'opt',
  ans:[
   {k:'1',t:'أدائي/بسيط',d:'أبيض، مساحات واسعة، خطوط دقيقة.',q:'الفخامة في القلّة.',ic:'sparkles',x:'الفخامة في القلّة — للتقنية والعلامات الواثقة.'},
   {k:'2',t:'دافئ/إنساني',d:'ألوان ترابية، عضوية، يدوية.',q:'القرب والصدق.',ic:'flame',x:'القرب والصدق — للحِرَفي والعائلي والتراثي.'},
   {k:'3',t:'جريء/حيوي',d:'ألوان قوية، تباين عالٍ، حركة.',q:'طاقة ولفت انتباه.',ic:'zap',x:'طاقة ولفت انتباه — للعلامة الشبابية وجمهور Z.'},
   {k:'4',t:'راقٍ/فاخر',d:'ذهبي، أسود، تفاصيل دقيقة.',q:'المكانة قبل المنفعة.',ic:'zap',x:'المكانة قبل المنفعة — للدخل المرتفع والعاشق/الحاكم.'}],
  g:{why:'المزاج البصري يُشتقّ من الشخصية: النبرة والعمر والنموذج.',trap:'اختيار مزاج يعجب الفريق لا يشبه القرارات السابقة.'}},
 {no:2,slot:'نوع الشعار',t:'ما نوع الشعار الأنسب لك ؟',lbl:'نوع الشعار',note:'يحدّد طريقة عرض الاسم والرمز.',ic:'id-card',head:'نوع الشعار الانسب؟',type:'opt',
  ans:[
   {k:'1',t:'نصي',t2:'(Wordmark)',d:'الاسم نفسه هو الشعار. أمثلة:',ex:'Google, Coca-Cola',art:'logo',x:'قوّته وضوحه — يحتاج اسماً قصيراً وخطاً مميزاً.'},
   {k:'2',t:'رمزي',t2:'(Symbol)',d:'رمز قوي بدون نص. أمثلة:',ex:'Apple, Nike, Twitter',ic:'crown',x:'أقوى اختزال — لكنه يحتاج سنوات وميزانية ليُعرف وحده.'},
   {k:'3',t:'مركّب',t2:'(Combo)',d:'رمز + اسم معاً.',q:'الأكثر شيوعاً واستخداماً.',ex:'adidas, amazon, Pizza Hut',art:'combo',x:'الأكثر أماناً للناشئة: يبني التعرّف تدريجياً ثم ينفصل الرمز حين ينضج.'}],
  g:{why:'طريقة عرض الاسم والرمز تحدّد كم يحتاج الشعار من وقت وميزانية ليُعرف.'}},
 {no:3,slot:'ألوان الشعار',t:'ما الألوان التي تخدم تموضعك؟',note:'اشتق اللون من قيمتك وشريحتك لا من ذوقك',ic:'swatch-book',head:'ما الألوان التي تخدم تموضعك؟',type:'opt',max:3,
  ans:[
   {k:'1',t:'الأزرق',col:'#1E9BD7',d:'الأمان - السلام - الولاء\nالهدوء - النزاهة - الثقة',x:'المال والصحة وB2B — الأكثر أماناً والأكثر ازدحاماً.'},
   {k:'2',t:'الأحمر',col:'#D71F26',d:'الحب - العاطفة - الطاقة\nالقوة - الرغبة - الحرارة',x:'الأغذية والرياضة والعروض — صوتٌ عالٍ فلا تصرخ به دائماً.'},
   {k:'3',t:'الأصفر',col:'#F0DB12',d:'الدفء - السعادة - المرح\nالإبتهاج - الحيوية - التفاؤل',x:'الشباب والضيافة — صعبُ القراءة وحده فازوجه بداكن.'},
   {k:'4',t:'الأخضر',col:'#52B147',d:'البيئة - الأمان - الأرض\nالشفاء - الخصوبة - الإيجابية',x:'الصحة والاستدامة والمال الإسلامي.'},
   {k:'5',t:'البنفسجي',col:'#9D4799',d:'الملكية - الولاء - الفخامة\nالثروة - الطموح - المبادرة',x:'الجمال والإبداع — جريء ومميّز في سوقنا.'},
   {k:'6',t:'البرتقالي',col:'#E26024',d:'الحماس – الطاقة – الشباب / الود\nالإبداع – المغامرة',x:'الترفيه والتوصيل — طاقة بلا عدوانية الأحمر.'},
   {k:'7',t:'الوردي',col:'#F06A87',d:'الرومانسية - الصحة - الانوثة\nاللعب - المرح - الجمال',x:'التجميل والحلويات — ودرجاته الداكنة تكسر النمطية.'},
   {k:'8',t:'الأسود',col:'#0B0B0B',d:'القوة - الحماية - الفخامة\nالجدية - رسمي - الغموض',x:'الفخامة والأزياء — سيّد المكانة حين يُمنح فراغاً.'},
   {k:'9',t:'الأبيض',col:'#FFFFFF',d:'النقاء - البساطة – الوضوح / الصدق\nالهدوء – الاتساع',x:'ليس فراغاً بل قرار — أساس كل مزاج أدائي.'}],
  g:{why:'حتى ثلاثة ألوان: رئيسي (٦٠٪) + ثانوي (٣٠٪) + لمسة (١٠٪). ترتيب وضع البطاقات على اللوحة يحدّد الدور.',how:'اللون يُشتقّ: تموضع فاخر ← الأسود شبه محسوم؛ ثقة B2B ← الأزرق يتصدّر.',trap:'«أحب البنفسجي» — أخطر جملة في المحور. الرد الجاهز: أعِد قراءة بطاقتَي الشريحة والقيمة بصوت مسموع ثم اسأل: ماذا تطلبان؟',tip:'اعرض ألوان أخطر ثلاثة منافسين قبل الاختيار — أحياناً يكون أقوى قرار هو اللون الذي تركوه فارغاً.'}}
 ]},
{n:8,min:20,name:'الرؤية',ord:'الثامنة',ask:'إلى أين؟',c:'#FBC23A',ci:'#B07A00',
 intro:'الختام حيث يبدأ سايمون سينك: لماذا توجدون أصلاً؟ أربع بطاقات تكتب الدائرة الذهبية كاملة — وتُختبر كل واحدة باختبارٍ لا يرحم.',
 qs:[
 {no:1,slot:'الغـرض',t:'الغرض',t2:'Purpose',sub:'لماذا توجد علامتك؟',ic:'hand-helping',type:'fill',
  ans:[{k:'1',f:'lines',head:'الغرض Purpose',prompt:'لماذا توجد علامتك؟',rows:10}],
  g:{why:'الغرض يجيب «لماذا» — بعيداً عن الربح.',how:'ابدأ بـ«لأن…».',trap:'لو أغلقتم غداً — ماذا يخسر العالم غير وظائفكم؟ إن كان الجواب «لا شيء يُذكر» فما كتبتموه وصفُ نشاطٍ لا غرض.',ex:'«لأن القرار المالي أمانةٌ لا عمولة» — غرضٌ يوجّه رفض عمولات البنوك قبل أن يوجّه الإعلانات.'},
  tests:'اختبار الإغلاق: لو أغلقت العلامة غداً، ماذا يخسر العالم غير الوظائف؟ هل هو وصف نشاط أم غرض؟ هل يوجّه قرارات رفض فعلية؟'},
 {no:2,slot:'الــرؤية',t:'الرؤية',t2:'Vision',sub:'أيّ مستقبل تصنعه؟',ic:'eye',type:'fill',
  ans:[{k:'1',f:'lines',head:'الرؤية Vision',prompt:'أيّ مستقبل تصنعه؟',rows:10}],
  g:{why:'الرؤية وجهة محدّدة خلال ٣–٥ سنوات.',how:'رؤيةٌ محدّدة طموحة، لا شعار جدارية.',trap:'تخيّل عنوان مقالٍ عنكم بعد خمس سنوات — إن صلح العنوان لأي منافس فهي ضبابية.'},
  tests:'اختبار العنوان: لو كُتب عنوان مقال عن العلامة بعد ٥ سنوات من هذه الرؤية، هل يصلح لأي منافس؟ هل هناك أفق زمني ومؤشر يمكن قياسه؟'},
 {no:3,slot:'الرســالة',t:'الرسالة المؤسسية',sub:'كيف نصنع هذا المستقبل؟',ic:'mail-open',type:'fill',
  ans:[{k:'1',f:'lines',head:'الرسالة المؤسسية',prompt:'كيف نصنع هذا المستقبل؟',rows:10}],
  g:{why:'الرؤية وجهة والرسالة طريق.',how:'فعلٌ مضارع ملموس يعرف الموظف الجديد منه ماذا يفعل صباح الأحد.'},
  tests:'هل تبدأ بفعل مضارع ملموس؟ هل يعرف موظف جديد منها ماذا يفعل صباح الأحد؟ هل تخدم الرؤية المكتوبة؟'},
 {no:4,slot:'القيــــم',t:'القيم',t2:'Values',sub:'3-5 قيم حاكمة',ic:'badge-check',type:'fill',
  ans:[{k:'1',f:'lines',head:'القيم Values',prompt:'القيم التي تحكم القرارات الصعبة؟',rows:10}],
  g:{why:'القيمة الحقيقية تكلّفك شيئاً حين تلتزمها — «الجودة» التي لا ترفض صفقةً رديئة ليست قيمة بل زخرفة.',how:'اكتب مع كل قيمة آخر قرارٍ مؤلم اتخذتموه بسببها.',ex:'«الاستقلال — نرفض عمولة البنك ولو خسرنا الصفقة». «الكرامة قبل الانتشار — نرفض المحتوى المُستغِل ولو حصد الملايين».',trap:'نسخ رؤية/رسالة/قيم شركة معجَبٍ بها بتغيير الاسم — فتحصل على جدارية أنيقة لا يذكرها موظف واحد بعد أسبوع.',tip:'اختم الجلسة بطقس: يقرأ كل لاعب قراراً ذهبياً بصوته — الالتزام يُصنع بالمشهد لا بالتوقيع فقط.'},
  tests:'اختبار التكلفة: هل لكل قيمة قرار مؤلم أو رفض فعلي يثبتها؟ هل هي ٣–٥ قيم فقط؟ هل هي كلمات عامة (جودة، نزاهة) بلا حدّ؟'}
 ]}
];

/* conflicts printed on the cards, exits from the guidebook (ch.12) */
const CONFLICTS=[
 {id:'c1',a:['2.2','1'],b:[['2.3','4'],['7.1','4']],title:'«الباحث عن السعر» × تموضع فاخر',
  why:'تعد جمهوراً حسّاساً للسعر بتجربة لن يدفع ثمنها — فتخسر الطرفين.',
  exits:['غيّر المحرّك إلى الانتماء أو الأداء','انزل درجة سعرية («فاخر ميسور»)','خط منتجات ثانٍ للدخول']},
 {id:'c2',a:['1.6','1'],b:[['3.3','1']],title:'حواجز قليلة × قيادة المنتج',
  why:'ابتكارك سيُستنسخ خلال أشهر ويصبح تكلفتك ميزةَ منافسك.',
  exits:['ابنِ حواجز ناعمة (قصة، مجتمع، توزيع حصري)','حوّل القيمة الأولى إلى قرب العميل','سابِق بإيقاع إصدارات لا يُلحَق']},
 {id:'c3',a:['3.3','1'],b:[['1.1','2']],title:'قيادة المنتج × سوق منحدر',
  why:'تبتكر في ملعبٍ يغادره الجمهور — أفضل منتجٍ لسوقٍ يموت.',
  exits:['أعد تعريف السوق (الوظيفة لا الفئة)','وجّه الابتكار لإحياء الفئة نفسها','انتقل لسوق مجاور نامٍ']},
 {id:'c4',a:['3.3','1'],b:[['2.2','1']],title:'قيادة المنتج × جمهور السعر',
  why:'قيادة المنتج تعني تسعيراً أعلى وإيقاع إصدارات مكلفاً — والجمهور المختار يقارن بالسعر أولاً.',
  exits:['غيّر المحرّك إلى الأداء (يدفع مقابل التفوّق)','اجعل القيمة الأولى التميز التشغيلي','خط منتج دخول بسعر أقل تحت العلامة نفسها']},
 {id:'c5',a:['6.1','وصفي'],b:[['3.3','1']],title:'اسم وصفي × قيادة المنتج',
  why:'الاسم الشارح يذيبك في الفئة التي تدّعي قيادتها.',
  exits:['ارتقِ لاسم إيحائي أو مختلق','اجعل الوصفي علامةَ خطٍّ تحت اسمٍ أمٍّ مميّز','ابقِ الوصفي واكتب الجسر على الخريطة بوعي']},
 {id:'c6',a:['6.4','2'],b:[['2.2','3']],title:'لاتيني عالمي × جمهور الانتماء',
  why:'جمهورٌ يشتري الهوية... باسمٍ لا يشبهه.',
  exits:['هجين ثنائي بوجهين','محايد صوتي بجذر محلي','عوّض بعربية طاغية في الصوت والمحتوى']}
];

/* intake form (بطاقة المشروع) — matches the printed 2-page form */
const INTAKE_SECS=[
 {n:1,t:'من نحن؟',sub:'بطاقة تعريف المشروع',k:'#2B5A94'},
 {n:2,t:'الواقع التجاري',sub:'ماذا يحدث فعلاً اليوم؟',k:'#1F7A69'},
 {n:3,t:'السياق والطموح',sub:'يوجّه خاتمة الوثيقة الذكية وخطة 30/60/90',k:'#C27417'}];
const INTAKE=[
 {k:'s1',sec:1,no:'١',t:'عرّف مشروعك في جملة واحدة',type:'pair',a:'نحن نقدّم',b:'لـ',req:1,ex:'نحن نقدّم «عطوراً فاخرة بهوية سعودية» لـ«جيلٍ يبحث عن الأثر لا الرائحة».'},
 {k:'s2',sec:1,no:'٢',t:'القطاع',type:'one',req:1,other:'أخرى',o:['عطور وتجميل','أزياء ومحتشمات','أغذية ومشروبات','تقنية وتطبيقات','خدمات مهنية واستشارات','تعليم وتدريب','صحة ولياقة','تجارة إلكترونية وتجزئة','ضيافة وسياحة','إعلام ومحتوى','أخرى']},
 {k:'s3',sec:1,no:'٣',t:'مرحلة المشروع',type:'one',req:1,o:['فكرة لم تُطلق بعد','إطلاق خلال ٣ أشهر','يعمل منذ أقل من سنة','قائم منذ سنوات (إعادة تموضع)']},
 {k:'s4',sec:2,no:'٤',t:'ماذا تبيع تحديداً؟',type:'one',req:1,o:['منتج ملموس','خدمة','منتج رقمي / اشتراك','مزيج']},
 {k:'s5',sec:2,no:'٥',t:'لمن تبيع اليوم؟',type:'one',req:1,o:['أفراد (B2C)','منشآت (B2B)','كلاهما'],hint:'يهيّئ بطاقة «المنتجات» في محور القيمة'},
 {k:'s6',sec:2,no:'٦',t:'سعرك مقارنةً بالسوق حالياً',type:'one',req:1,o:['أقل من المنافسين','مماثل','أعلى','أعلى بكثير (فاخر)','لم نسعّر بعد']},
 {k:'s7',sec:2,no:'٧',t:'النطاق الجغرافي المستهدف',type:'one',req:1,o:['مدينة / منطقة واحدة','السعودية','الخليج','عربي ودولي']},
 {k:'s8',sec:3,no:'٨',t:'ما الدافع الأكبر لهذه الجلسة؟',type:'one',req:1,o:['إطلاق علامة جديدة','تجديد علامة قائمة','حسم الاسم تحديداً','توحيد الفريق على اتجاه واحد','تجهيز ملف لمستثمر أو وكالة']},
 {k:'s9',sec:3,no:'٩',t:'هل الاسم محسوم مسبقاً؟',type:'yn',req:1,note:'يعيد تشكيل محور التسمية',
  y:'نعم — الاسم محسوم',yd:'اكتب الاسم (يُثبَّت قراراً ذهبياً، ويتحوّل محور التسمية إلى فحصٍ لا توليد):',n:'لا — سنولّده في الجلسة',nd:'سيمرّ الفريق بمحور التسمية كاملاً: نوع الاسم ← بذور التوليد ← دليل النطاقات ← بين حرفين.'},
 {k:'s10',sec:3,no:'١٠',t:'أبرز منافس يخطر ببالك الآن',type:'text',hint:'سيُزرع تلقائياً كـ«المنافس رقم ١» في بطاقة المنافسين.'},
 {k:'s11',sec:3,no:'١١',t:'القيد الأهم عليكم الآن',type:'many',o:['ميزانية محدودة','وقت ضيق','فريق صغير','منافسة شرسة','لا قيود واضحة']}
];

/* بطاقة الأرقام — رقمية فقط (لا توجد في اللعبة المطبوعة) */

const CARDMAP=[{"q": "1_1", "card": "Q1 دورة حياة السوق", "out": "مرحلة واحدة: ناشئ، نمو، ناضج، منحدر", "use": "تحدد نوع المعركة: تعليم السوق، أو الحصة، أو الولاء، أو التجديد. وتضبط أولويات خطة 30/60/90 (ناشئ ← ميزانية تعليم، ناضج ← برامج ولاء). تغذي تعارض «قيادة المنتج × سوق منحدر».", "secs": [2, 11], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["fin", "mkt"], "recvTxt": "المالية، التسويق"}, {"q": "1_2", "card": "Q2 اتجاهات السوق — PESTLE", "out": "ستة أسطر بصيغة «تغيير ← فرصة أو تهديد علينا»", "use": "قسم «الموجات الخارجية». تغذي ربعَي الفرص والتهديدات في SWOT، وكل مبادرة في الخطة تستند إلى موجة مسمّاة.", "secs": [2, 4, 11], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["mkt"], "recvTxt": "التسويق"}, {"q": "1_3", "card": "Q3 المنافسون", "out": "حتى ٣ منافسين: الاسم، الخطورة، أهم قوة، أهم ضعف", "use": "جدول المشهد التنافسي. ضعف المنافس يصبح «الميزة الفارقة» في بيان التموضع، ونقاطهم تُرسم على المصفوفة، وألوانهم تُستبعد عند اختيار الألوان.", "secs": [2, 4, 8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["mkt", "design", "sales"], "recvTxt": "التسويق، المصمم، المبيعات"}, {"q": "1_4", "card": "Q4 عدد المصنّعين", "out": "واحد، قليل، كثير", "use": "درجة ازدحام السوق، وهل التفرّد شرط بقاء أم ترف.", "secs": [2], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["fin"], "recvTxt": "المالية"}, {"q": "1_5", "card": "Q5 نوع المنتجات", "out": "متطابق، مختلف، فريد", "use": "وزن العلامة في قرار الشراء: المتطابق ← الاستثمار في القصة والتجربة، الفريد ← ميزانية تعليم.", "secs": [2, 11], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["fin", "mkt"], "recvTxt": "المالية، التسويق"}, {"q": "1_6", "card": "Q6 حواجز الدخول", "out": "قليلة، متوسطة، فائقة", "use": "عمر الميزة قبل أن تُنسخ. يولّد بند «الخنادق» (مجتمع، توزيع، قصة) في الخطة. يغذي تعارض «حواجز قليلة × قيادة المنتج».", "secs": [2, 10, 11], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["lead"], "recvTxt": "المؤسس"}, {"q": "2_1", "card": "Q1 ★ من عميلك الأساسي", "out": "شريحة واحدة (أو كرت احتياط مكتوب)", "use": "القرار الذهبي الأول: لمن نعمل. كل رسالة وسعر وقناة في الوثيقة تُقاس عليه، والقنوات في الخطة تُشتق منه.", "secs": [1, 3, 11], "lead": "قائد الجلسة", "decide": "الطاولة (بإجماع)", "recv": ["lead"], "recvTxt": "الجميع"}, {"q": "2_2", "card": "Q2 تجزئة السوق (المحرّك)", "out": "سعر، أداء، انتماء، سهولة", "use": "لماذا يشتري: يحدد زاوية الرسالة الرئيسية ونوع الدليل في الإعلانات (أرقام، قصة، راحة). يغذي ثلاثة تعارضات.", "secs": [3, 6], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["content", "sales"], "recvTxt": "المحتوى، المبيعات"}, {"q": "2_3", "card": "Q3 شريحة الدخل", "out": "اقتصادي، متوسط، فوق متوسط، فاخر", "use": "السقف السعري. يُقارن بالسعر الحالي في بطاقة المشروع (س٦) لكشف فجوة السعر، ويبرّر المزاج البصري.", "secs": [3, 8, 10], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["fin", "design"], "recvTxt": "المالية، المصمم"}, {"q": "2_4", "card": "Q4 ملف العميل", "out": "شخصية مسمّاة: السمات والقصة، المشاكل، الحلول المطلوبة", "use": "بطاقة العميل. الاعتراض المكتوب يتحول إلى قائمة «الاعتراضات وردودها» للمبيعات والمحتوى.", "secs": [3, 6], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["sales", "content"], "recvTxt": "المبيعات، المحتوى"}, {"q": "2_5", "card": "Q5 يوم في حياة عميلي", "out": "رحلة يوم كامل مع «لحظة الاحتياج»", "use": "خريطة نقاط التماس: أين ومتى تظهر العلامة، ومنها توقيت النشر والقنوات.", "secs": [3, 11], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["mkt"], "recvTxt": "التسويق الرقمي"}, {"q": "3_1", "card": "Q1 المنتجات", "out": "نوع البيع (B2C / B2B / B2G) وقائمة المنتجات", "use": "يحدد «الفئة» في بيان التموضع ونمط القرار (فرد عاطفي أم لجنة)، ومنه شكل المحتوى: قصة أم دراسة حالة.", "secs": [4, 6], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["sales", "content"], "recvTxt": "المبيعات، المحتوى"}, {"q": "3_2", "card": "Q2 البديل الحقيقي", "out": "نص يكمل: «لو لم نوجد سيضطر عميلي إلى…»", "use": "يكشف المنافس الحقيقي (قد يكون عادةً لا منتجاً). يعيد تعريف «ما نبيعه فعلاً» ويعطي مادة خام للرسالة.", "secs": [1, 4, 6], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["content"], "recvTxt": "المحتوى"}, {"q": "3_3", "card": "Q3 ★ القيمة الأساسية", "out": "قيادة المنتج، قرب العميل، التميز التشغيلي", "use": "القرار الذهبي الثاني: كيف نفوز. يحدد أين يذهب الاستثمار (ابتكار، فريق خدمة، عمليات) ومؤشرات الأداء KPIs. مركز معظم التعارضات.", "secs": [1, 4, 10, 11], "lead": "قائد الجلسة", "decide": "الطاولة (بإجماع)", "recv": ["lead"], "recvTxt": "الجميع"}, {"q": "3_4", "card": "Q4 التحليل الرباعي SWOT", "out": "٤ أرباع بثلاثة بنود لكل ربع، وقرار لكل ضعف", "use": "التشخيص الداخلي. كل ضعف مع قراره (نعالج، نحيّد، نتعايش) يصبح بنداً في خطة أول ٣٠ يوماً، والفرص تصبح مبادرات.", "secs": [4, 11], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["lead"], "recvTxt": "المؤسس، العمليات"}, {"q": "4_1", "card": "Q1 النبرة", "out": "ودّي، رسمي، مرح، جريء", "use": "قاعدة «هكذا نكتب» مع جمل نموذجية، تحكم كل نص يُنشر باسم العلامة.", "secs": [5, 6], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["content"], "recvTxt": "المحتوى، الوكالة"}, {"q": "4_2", "card": "Q2 عمر البراند", "out": "شبابي، متوازن، راسخ", "use": "الإيقاع البصري وسرعة المحتوى، ويدخل في موجز المصمم.", "secs": [5, 8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design"], "recvTxt": "المصمم"}, {"q": "4_3", "card": "Q3 سمات العلامة", "out": "٥ كلمات من ٥ زوايا (المجتمع، العملاء، الصوت، الأثر، الميزة)", "use": "معيار قبول: أي تصميم أو نص لا يعكسها يُرفض. «ميزتنا الفارقة» تغذي بيان التموضع.", "secs": [5, 6, 8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design", "content"], "recvTxt": "المصمم، المحتوى"}, {"q": "4_4", "card": "Q4 النموذج Archetype", "out": "نموذج أساسي + ظل ثانوي", "use": "النموذج السردي: أي قصص نروي ومن بطلها. مرجع لاختيار المؤثرين والحملات.", "secs": [5, 11], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["content"], "recvTxt": "المحتوى، الوكالة"}, {"q": "4_5", "card": "Q5 الطباع الإنسانية", "out": "٩ مقاييس من ١ إلى ٧", "use": "مخطط شخصية رقمي. كل مقياس متطرف يتحول إلى قرار تنفيذي في الهوية.", "secs": [5, 8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design"], "recvTxt": "المصمم"}, {"q": "5_1", "card": "Q1 بيان التموضع", "out": "«لـ(الشريحة)، نحن (الفئة) التي (الميزة الفارقة)»", "use": "قلب الوثيقة: الجملة الداخلية التي يُشتق منها كل شيء، ويُطبّق عليها اختبار الاستبدال.", "secs": [1, 6], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["lead"], "recvTxt": "الجميع"}, {"q": "5_2", "card": "Q2 الشعار اللفظي", "out": "٣ مقترحات، واحد منها مختار", "use": "الـTagline المعتمد مع بديلين، ويدخل في الهوية والإعلانات.", "secs": [6, 8], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["design", "mkt"], "recvTxt": "المصمم، التسويق"}, {"q": "5_3", "card": "Q3 مفردات العلامة", "out": "كلمات نقولها، وكلمات نتجنبها", "use": "قاموس العلامة، يُسلَّم لكل كاتب ووكالة.", "secs": [5, 6], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["content"], "recvTxt": "المحتوى، الوكالة"}, {"q": "5_4", "card": "Q4 مصفوفة التموضع", "out": "محوران، وموقع العلامة والمنافسين", "use": "الفجوة البيضاء بصرياً: تبرير التموضع أمام المستثمر أو الوكالة.", "secs": [4], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["fin", "content"], "recvTxt": "المستثمر، الوكالة"}, {"q": "6_1", "card": "Q1 ★ نوع الاسم", "out": "نوع واحد من ستة", "use": "القرار الذهبي الثالث. يحدد مسار التسمية وميزانية التعريف (المختلق يحتاج إنفاقاً أكبر). يغذي تعارض «وصفي × قيادة المنتج».", "secs": [1, 7, 10], "lead": "قائد الجلسة", "decide": "الطاولة (بإجماع)", "recv": ["legal", "design"], "recvTxt": "القانوني، المصمم"}, {"q": "6_2", "card": "Q2 بذور التوليد", "out": "كلمات بذرة، مرجع أو لهجة، دلالات تُجنّب، منافسون للابتعاد عنهم", "use": "موجز التسمية (Naming Brief)، يُسلَّم لمن يولّد الأسماء بشرياً أو بالذكاء الاصطناعي.", "secs": [7], "lead": "قائد الجلسة", "decide": "قائد الجلسة", "recv": ["legal"], "recvTxt": "فريق التسمية"}, {"q": "6_3", "card": "Q3 دليل النطاقات", "out": "متاح أو محجوز لـ .com و .sa والحسابات", "use": "قائمة مخاطر رقمية يجب حلّها قبل الإطلاق.", "secs": [7, 10], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["legal", "mkt"], "recvTxt": "القانوني، التسويق الرقمي"}, {"q": "6_4", "card": "Q4 بين حرفين", "out": "لغة الاسم: عربي، لاتيني، هجين، محايد", "use": "نظام الكتابة: النقحرة الرسمية ومتى يظهر كل وجه من وجهي الاسم. يغذي تعارض «لاتيني × جمهور الانتماء».", "secs": [7, 8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design", "content"], "recvTxt": "المصمم، المحتوى"}, {"q": "7_1", "card": "Q1 الحس البصري", "out": "أدائي، دافئ، جريء، راقٍ", "use": "اتجاه لوحة الإلهام (Moodboard).", "secs": [8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design"], "recvTxt": "المصمم"}, {"q": "7_2", "card": "Q2 نوع الشعار", "out": "نصي، رمزي، مركّب", "use": "مواصفات الشعار للمصمم، ومنها تقدير الوقت والميزانية.", "secs": [8, 11], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["design", "fin"], "recvTxt": "المصمم، المالية"}, {"q": "7_3", "card": "Q3 ألوان الشعار", "out": "حتى ٣ ألوان مرتبة (رئيسي، ثانوي، لمسة)", "use": "لوحة ألوان بنسب ٦٠/٣٠/١٠ مع مبرّر اشتقاقها من الشريحة والقيمة.", "secs": [8], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["design"], "recvTxt": "المصمم"}, {"q": "8_1", "card": "Q1 الغرض Purpose", "out": "جملة تبدأ بـ«لأن…»", "use": "افتتاحية الوثيقة وقصة «من نحن».", "secs": [1, 9], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["lead"], "recvTxt": "الجميع"}, {"q": "8_2", "card": "Q2 الرؤية Vision", "out": "وجهة خلال ٣ إلى ٥ سنوات", "use": "المؤشر البعيد الذي تُقاس عليه الخطة.", "secs": [9, 11], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["lead", "fin"], "recvTxt": "الإدارة، المستثمر"}, {"q": "8_3", "card": "Q3 الرسالة المؤسسية", "out": "فعل مضارع ملموس", "use": "تتحول إلى مبادرات الـ٩٠ يوماً.", "secs": [9, 11], "lead": "قائد الجلسة", "decide": "المؤسس", "recv": ["lead"], "recvTxt": "الفريق"}, {"q": "8_4", "card": "Q4 القيم Values", "out": "٣ إلى ٥ قيم، مع قرار مؤلم لكل قيمة", "use": "ميثاق القرارات: معيار للتوظيف والشراكات والرفض.", "secs": [9], "lead": "قائد الجلسة", "decide": "الطاولة", "recv": ["lead"], "recvTxt": "الموارد البشرية، الجميع"}];

/* ================= طبقة المحتوى القابل للتحرير (تُطبَّق قبل بناء الفهرس) ================= */
/* المصدر: قاعدة البيانات cms/{game,lessons,settings,agents}، مع نسخة محفوظة على الجهاز تُطبَّق فوراً عند الفتح */
const CMS_KEY='bm3:cms';
const PRISTINE={stages:JSON.parse(JSON.stringify(STAGES)),conflicts:JSON.parse(JSON.stringify(CONFLICTS)),cardmap:JSON.parse(JSON.stringify(CARDMAP))};
let CMS=(()=>{try{return JSON.parse(localStorage.getItem(CMS_KEY))||{}}catch(e){return{}}})();
const cmsG=()=>CMS.game||{},cmsS=()=>CMS.settings||{},cmsA=()=>CMS.agents||{},cmsL=()=>CMS.lessons||{};
const CARD_FIELDS=['slot','t','tag','sub','sub2','note','head','ic','type','gold','max','ans','g'];
function applyGame(G){G=G||{};
 /* المحاور */
 STAGES.forEach((s,i)=>{const P=PRISTINE.stages[i],o=(G.stages||{})[s.n]||{};['name','ask','intro','min','c','ci','ord'].forEach(k=>{s[k]=(o[k]!==undefined&&o[k]!=='')?o[k]:P[k]});
  /* البطاقات الأصلية: تعديل كامل أو إخفاء */
  const qs=P.qs.map(q0=>{const id=s.n+'_'+q0.no,ov=(G.cards||{})[id];const q=JSON.parse(JSON.stringify(q0));if(ov){CARD_FIELDS.forEach(k=>{if(ov[k]!==undefined)q[k]=JSON.parse(JSON.stringify(ov[k]))});if(ov.hidden)q.hidden=true}return q});
  /* البطاقات الجديدة */
  Object.entries(G.newCards||{}).filter(([id,c])=>c&&+c.n===s.n&&!c.deleted).sort((a,b)=>a[1].no-b[1].no).forEach(([id,c])=>{const q={};CARD_FIELDS.forEach(k=>{if(c[k]!==undefined)q[k]=JSON.parse(JSON.stringify(c[k]))});q.no=c.no;q.isNew=true;if(c.hidden)q.hidden=true;q.ans=q.ans||[];q.slot=q.slot||'بطاقة جديدة';q.t=q.t||q.slot;q.type=q.type||'opt';q.ic=q.ic||'square-plus';qs.push(q)});
  s.qs=qs.filter(q=>!q.hidden);s.hiddenQs=qs.filter(q=>q.hidden)});
 /* كروت التعارض */
 CONFLICTS.length=0;PRISTINE.conflicts.forEach(c0=>{const o=(G.conflicts||{})[c0.id]||{};if(o.off)return;CONFLICTS.push({...JSON.parse(JSON.stringify(c0)),...(o.title?{title:o.title}:{}),...(o.why?{why:o.why}:{}),...(Array.isArray(o.exits)&&o.exits.filter(Boolean).length?{exits:o.exits.filter(Boolean)}:{})})});
 /* ربط البطاقة بالمخرجات */
 CARDMAP.length=0;PRISTINE.cardmap.forEach(r=>CARDMAP.push(JSON.parse(JSON.stringify(r))));
 Object.entries(G.map||{}).forEach(([id,m])=>{if(!m)return;const r=CARDMAP.find(x=>x.q===id);if(r)Object.assign(r,m);else CARDMAP.push({q:id,card:'',out:'',use:'',secs:[],lead:'',decide:'',recv:[],recvTxt:'',...m})})}
try{applyGame(cmsG())}catch(e){console.warn('cms apply failed',e);CMS={}}
function cmsSave(){try{localStorage.setItem(CMS_KEY,JSON.stringify(CMS));return true}catch(e){return false}}
/* إعدادات افتراضية للأعلام والتصميم */
const FLAG_DEF={chat:true,agents:true,read:true,scan:true,digital:true,consult:true,docx:true,register:true,enforce:false};
const AI_KEYS=['chat','agents','read','scan','digital'];
const flag=k=>{const src=AI_KEYS.includes(k)?((cmsA().on)||{}):((cmsS().flags)||{});const v=src[k];return v===undefined?(FLAG_DEF[k]!==undefined?FLAG_DEF[k]:true):!!v};
const reviewMax=()=>+((cmsS().design||{}).review)||2;

function face(k){
 const E={dot:'<circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/>',
  happy:'<path d="M7.4 10.4q1.6-1.8 3.2 0M13.4 10.4q1.6-1.8 3.2 0"/>',
  closed:'<path d="M7.4 9.8q1.6 1.4 3.2 0M13.4 9.8q1.6 1.4 3.2 0"/>',
  glasses:'<circle cx="8.7" cy="10" r="2.1"/><circle cx="15.3" cy="10" r="2.1"/><path d="M10.8 10h2.4M4.2 9.3l2.4.4M19.8 9.3l-2.4.4"/>',
  sun:'<path d="M5.6 8.5h5.6v1.2a2.3 2.3 0 0 1-4.6.3zM12.8 8.5h5.6v1.2a2.3 2.3 0 0 1-4.6.3zM11.2 8.9h1.6"/>',
  hearts:'<path d="M8.7 12l-1.8-1.7a1.05 1.05 0 0 1 1.8-1.2a1.05 1.05 0 0 1 1.8 1.2z"/><path d="M15.3 12l-1.8-1.7a1.05 1.05 0 0 1 1.8-1.2a1.05 1.05 0 0 1 1.8 1.2z"/>',
  stars:'<path d="M8.7 7.9l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2zM15.3 7.9l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z"/>',
  x:'<path d="M7.6 8.6l2 2M9.6 8.6l-2 2M14.4 8.6l2 2M16.4 8.6l-2 2"/>',
  wide:'<circle cx="9" cy="9.6" r="1.5"/><circle cx="15" cy="9.6" r="1.5"/>',
  monocle:'<circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r="2.2"/><path d="M17.1 11v6.5"/>'};
 const M={smile:'<path d="M8.4 14.4q3.6 3.1 7.2 0"/>',big:'<path d="M7.6 13.6h8.8q-.4 4.3-4.4 4.3t-4.4-4.3z"/>',flat:'<path d="M9.6 15.6h4.8"/>',o:'<circle cx="12" cy="15.8" r="1.9"/>',
  frown:'<path d="M8.8 16.6q3.2-2.8 6.4 0"/>',tongue:'<path d="M8.4 14.2q3.6 2.6 7.2 0"/><path d="M11 15.3v1.4a1.3 1.3 0 0 0 2.6 0v-1.5"/>',smirk:'<path d="M9 15q3.2 1.9 6.2-.7"/>',small:'<path d="M10 14.9q2 1.4 4 0"/>'};
 const F={love:['happy','smile','hl'],nerd:['glasses','smile'],tongue:['closed','tongue'],cool:['sun','smirk'],smile:['dot','smile'],monocle:['monocle','flat'],frown:['dot','frown'],
  halo:['closed','small','halo'],wow:['wide','o'],stars:['stars','smile'],plain:['dot','small'],hearts:['hearts','smile'],dizzy:['x','tongue'],content:['closed','smile'],nerd2:['glasses','flat'],grin:['wide','big']}[k]||['dot','smile'];
 let x='';if(F[2]==='hl')x='<path d="M19.6 4.2l-.9-.9a.6.6 0 0 1 .9-.7a.6.6 0 0 1 .9.7zM4.8 17.6l-.9-.9a.6.6 0 0 1 .9-.7a.6.6 0 0 1 .9.7z"/>';
 if(F[2]==='halo')x='<ellipse cx="12" cy="2.6" rx="4.6" ry="1.1"/>';
 return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.4" r="8.6"/>${E[F[0]]}${M[F[1]]}${x}</svg>`}
function art(k){
 const w=b=>`<svg class="ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
 const cons=(x,y,s)=>`<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24" stroke-width="${1.6*24/s}">${ICONS.construction}</svg>`;
 switch(k){
 case'm1':return w('<circle cx="24" cy="24" r="13"/>');
 case'm4':return w([[16.5,16.5],[31.5,16.5],[16.5,31.5],[31.5,31.5]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="6.4"/>`).join(''));
 case'm16':{let s='';for(let i=0;i<4;i++)for(let j=0;j<4;j++)s+=`<circle cx="${13.5+j*7}" cy="${13.5+i*7}" r="3.1"/>`;return w(s)}
 case'same':return w('<circle cx="15" cy="24" r="8.5"/><circle cx="33" cy="24" r="8.5"/>');
 case'diff':return w('<rect x="6" y="15.5" width="17" height="17" rx="1"/><circle cx="33" cy="24" r="8.5"/>');
 case'b1':return w(cons(10,10,28));
 case'b2':return w(cons(2,15,17)+cons(15.5,11,17)+cons(29,15,17));
 case'b3':return w(cons(1,6,14)+cons(17,4,14)+cons(33,6,14)+cons(7,22,14)+cons(17,24,14)+cons(27,22,14));
 case'b2c':return w('<rect x="7" y="17" width="12" height="12"/><path d="M19 23h7"/><circle cx="32" cy="23" r="6"/>');
 case'b2b':return w('<rect x="7" y="17" width="12" height="12"/><path d="M19 23h10"/><rect x="29" y="17" width="12" height="12"/>');
 case'b2g':return w('<rect x="7" y="17" width="12" height="12"/><path d="M19 23h8"/><path d="M27 29l7-12 7 12z"/>');
 case'logo':return `<svg class="ic" viewBox="0 0 60 48"><text x="30" y="30" text-anchor="middle" font-family="Rubik" font-size="17" letter-spacing="1" fill="currentColor" font-weight="400">LOGO</text><path d="M12 37h36" stroke="currentColor" stroke-width="1.6"/></svg>`;
 case'combo':return w('<rect x="5" y="11" width="38" height="26" rx="5"/><path d="M15 17.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"/><path d="M26 19h11M26 24h11M26 29h11"/>');
 }return''}

/* ================= state ================= */

/* ================= core: utilities, data index, session store ================= */
Object.assign(ICONS,{
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 'volume-2':'<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/>',
 'volume-x':'<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
 play:'<polygon points="6 3 20 12 6 21 6 3"/>',pause:'<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
 'rotate-ccw':'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
 timer:'<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
 coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
 moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
 'cloud-rain':'<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
 'log-out':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
 'file-text':'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
 activity:'<path d="M22 12h-2.5a2 2 0 0 0-1.9 1.5l-2.4 8.3a.3.3 0 0 1-.5 0L9.2 2.2a.3.3 0 0 0-.5 0l-2.3 8.3A2 2 0 0 1 4.5 12H2"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
 'list-checks':'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>'
});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
const LS={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const icon=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||ICONS.info}</svg>`;
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const fmtDate=t=>t?new Date(t).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn',{day:'numeric',month:'short',year:'numeric'}):'—';
const fmtShort=t=>t?new Date(t).toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'}):'—';
const DAY=864e5;

/* ---------- index questions (ids use "_" so storage keys carry no dots) ---------- */
const Q={},ALLQ=[];
STAGES.forEach(s=>{s.qs.forEach(q=>{q.id=s.n+'_'+q.no;q.s=s;q.max=q.max||1;q.slot=q.slot.replace(/ـ+/g,'');q.t=(q.t||'').replace(/ـ+/g,'');Q[q.id]=q;ALLQ.push(q)});(s.hiddenQs||[]).forEach(q=>{q.id=s.n+'_'+q.no;q.s=s;q.max=q.max||1;Q[q.id]=q})});
CONFLICTS.forEach(c=>{c.a[0]=c.a[0].replace('.','_');c.b.forEach(b=>b[0]=b[0].replace('.','_'))});
const AK=(q,k)=>q.ans.find(a=>a.k===k);
const CL=[null,{t:'تخمين',d:'رأي أولي بلا معلومات كافية',c:'#D9443F'},{t:'ميل ضعيف',d:'نميل إليه لكن الأساس هش',c:'#E07F1F'},{t:'مرجّح',d:'منطقي ومتّسق مع ما سبق',c:'#C99A12'},{t:'واثق',d:'تتفق عليه الطاولة وله شواهد',c:'#5E9A2A'},{t:'مؤكد بدليل',d:'دليل حسّي أو رقم يثبته',c:'#1F7D63'}];
const qcode=q=>'Q'+q.s.n+'.'+q.no;
const qlabel=q=>q.s.name+' · Q'+q.no;

/* per-axis follow-up meta — derived from "من البطاقة إلى الوثيقة" (who receives & executes) */
const AXMETA={
 1:{own:'المالية + التسويق',kpi:'حصة سوقية تقديرية / منافسون جدد',watch:'هل تغيّرت مرحلة السوق أو دخل منافس يقتحم شريحتك؟'},
 2:{own:'المبيعات + التسويق',kpi:'نسبة المبيعات من الشريحة الذهبية',watch:'هل ما زالت الشريحة الأهم هي مصدر الإيراد الأكبر؟'},
 3:{own:'المؤسس + المالية',kpi:'هامش الربح / معدل تكرار الشراء',watch:'هل القيمة الأولى ما زالت تتفوّق فيها فعلاً أمام المنافس؟'},
 4:{own:'المصمم + المحتوى',kpi:'اتساق النبرة في المحتوى (من ١٠)',watch:'هل يتكلم كل محتوى العلامة بالشخصية نفسها؟'},
 5:{own:'المحتوى/الوكالة + المبيعات',kpi:'تذكّر الشعار اللفظي في الاستبيانات %',watch:'هل بيان التموضع مستخدم فعلاً في البيع والإعلان؟'},
 6:{own:'القانوني + المصمم',kpi:'تسجيل العلامة والنطاقات',watch:'هل الاسم مسجّل ومحمي؟ هل ظهر تشابه جديد؟'},
 7:{own:'المصمم',kpi:'نسبة الأصول المطابقة للدليل %',watch:'هل الهوية مطبّقة في كل نقاط التماس؟'},
 8:{own:'المؤسس + الفريق',kpi:'تقدّم مبادرات 30/60/90 %',watch:'هل القرارات الصعبة الأخيرة اتُّخذت وفق القيم المعلنة؟'}};
/* final document structure — 11 sections, each fed by specific cards (from the outputs reference) */
const DOCSECS=[
 {n:1,t:'الملخص التنفيذي',feeds:['2_1','3_3','6_1','5_1','8_1'],what:'العلامة في صفحة واحدة: لمن، وكيف نفوز، وماذا نقول، ولماذا نوجد'},
 {n:2,t:'تشخيص الملعب',feeds:['1_1','1_2','1_3','1_4','1_5','1_6'],what:'نوع المعركة، والموجات، والمنافسون، وعمر الميزة'},
 {n:3,t:'العميل المستهدف',feeds:['2_1','2_2','2_3','2_4','2_5'],what:'من هو، ولماذا يشتري، وكم يدفع، ومتى يحتاجنا'},
 {n:4,t:'كيف نفوز',feeds:['3_1','3_2','3_3','3_4','5_4','1_3'],what:'الميزة التنافسية، والفجوة البيضاء، والتشخيص الداخلي'},
 {n:5,t:'دليل الشخصية والصوت',feeds:['4_1','4_2','4_3','4_4','4_5','5_3'],what:'كيف نتكلم ونتصرّف، وما يُرفض'},
 {n:6,t:'المنظومة اللفظية',feeds:['5_1','5_2','5_3','2_2','2_4'],what:'بيان التموضع، والشعار اللفظي، والقاموس، وردود الاعتراضات'},
 {n:7,t:'استراتيجية الاسم',feeds:['6_1','6_2','6_3','6_4'],what:'نوع الاسم، وموجز التوليد، والفحص، ونظام الكتابة'},
 {n:8,t:'موجز التصميم',feeds:['7_1','7_2','7_3','4_2','4_5','2_3'],what:'ما يسلَّم للمصمم: المزاج، والشعار، والألوان'},
 {n:9,t:'البوصلة',feeds:['8_1','8_2','8_3','8_4'],what:'الغرض، والرؤية، والرسالة، والقيم'},
 {n:10,t:'المخاطر وقائمة التحقق',feeds:[],what:'ما قد يكسر الاستراتيجية، وما يجب التحقق منه قبل الإطلاق'},
 {n:11,t:'خطة 30/60/90',feeds:['3_4','1_1','1_6','2_5','8_3'],what:'أولويات التنفيذ ومؤشراتها'}];
const DOCST=['مسودة','قيد المراجعة','معتمدة'];

/* ---------- capabilities & session store ---------- */
let CAP={db:null,user:null,dl:null};
let ME={id:null,alias:LS.get('bm3:alias')||''};
let S=null,CODE=null,LOCAL=false,UNSUB=null,RO=false,READY=false;
let pendingPatch={},inflight=null,ptimer=null;
const listeners=[];const onSync=fn=>listeners.push(fn);
function deepMerge(t,s){for(const k in s){const v=s[k];if(v&&typeof v==='object'&&!Array.isArray(v)){if(!t[k]||typeof t[k]!=='object'||Array.isArray(t[k]))t[k]={};deepMerge(t[k],v)}else t[k]=Array.isArray(v)?v.slice():v}return t}
const isEmpty=o=>!o||!Object.keys(o).length;
function setSave(t){SAVE_ST=t;bump()}
function patch(p,{now=false,silent=false}={}){
 if(!S)return false;if(RO){notify('هذه الجلسة مفتوحة لك للمشاهدة فقط.','err');return false}
 const prev=clone(S);deepMerge(S,clone(p));S.updated=Date.now();
 if(LOCAL){LS.set('bm3:s:'+CODE,S);rememberRecent()}
 else{deepMerge(pendingPatch,clone(p));setSave('يحفظ…');clearTimeout(ptimer);ptimer=setTimeout(flush,now?0:420)}
 if(!silent)listeners.forEach(fn=>fn(prev,'local'));return true}
async function flush(){
 if(LOCAL||inflight||isEmpty(pendingPatch))return;
 const p=pendingPatch;pendingPatch={};p.updated=Date.now();inflight=p;
 try{await CAP.db.doc('sessions/'+CODE).update(p);setSave('محفوظ')}
 catch(e){const c=e&&e.code;
  if(c==='invalid_argument'||c==='not_granted'){RO=true;notify('لا تملك صلاحية التعديل في هذه الجلسة. اطلب من مالك الأداة صلاحية «مساهم».','err',{sticky:true});setSave('للمشاهدة')}
  else if(c==='quota_exceeded'){notify('امتلأت سعة البيانات. احذف جلسات قديمة ثم أعد المحاولة.','err');setSave('غير محفوظ')}
  else if(c==='revoked'){notify('انتهى الوصول إلى هذه الجلسة.','err');setSave('غير محفوظ')}
  else{deepMerge(p,pendingPatch);pendingPatch=p;setSave('يعيد المحاولة…');setTimeout(flush,1500+Math.random()*800)}}
 finally{inflight=null;if(!isEmpty(pendingPatch))setTimeout(flush,60)}}
function onSnap(snap){if(!snap.exists)return;const d=clone(snap.data());if(inflight)deepMerge(d,clone(inflight));deepMerge(d,clone(pendingPatch));
 const prev=S;S=d;listeners.forEach(fn=>fn(prev,'remote'))}

function newCode(){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return 'BM-'+s}
function normCode(c){c=String(c||'').trim().toUpperCase().replace(/\s+/g,'');if(!c)return'';c=c.replace(/^BM-?/,'');return 'BM-'+c.slice(0,4)}
function blank(m,code){const dur=m.dur||180;return{v:3,code,brand:m.brand,team:m.team||'',facilitator:m.facilitator||'',date:new Date().toISOString().slice(0,10),
 created:Date.now(),updated:Date.now(),host:ME.id||'',owner:ME.id||'',ownerName:(PROFILE&&PROFILE.name)||m.facilitator||'',ownerOrg:(PROFILE&&PROFILE.org)||'',cfg:{dur,auto:true,adv:true,call:true,mode:m.mode||'digital'},members:{},votes:{},hist:{},log:{},comps:{},cmoves:{},pos:{},mind:{},mread:{},pimp:{},floor:{uid:''},intake:{},place:{},fill:{},conf:{},doubt:{},res:{},times:{},
 cur:'1_1',tm:{q:'1_1',st:0,acc:0,run:false,dur},done:false,doneAt:0,dash:{cad:30,own:{},kpi:{}},follow:{},docst:{}}}
async function createSession(m){
 let code=newCode();
 if(!LOCAL){for(let i=0;i<4;i++){const g=await CAP.db.doc('sessions/'+code).get().catch(()=>null);if(!g||!g.exists)break;code=newCode()}}
 const doc=blank(m,code);
 if(LOCAL){LS.set('bm3:s:'+code,doc)}else{
  try{await CAP.db.doc('sessions/'+code).set(doc)}catch(e){
   if(e&&e.code==='invalid_argument'){notify('لا تملك صلاحية إنشاء جلسة هنا. اطلب من مالك الأداة صلاحية «مساهم».','err',{sticky:true});return null}
   if(e&&e.code==='quota_exceeded'){notify('امتلأت سعة الجلسات في هذه الأداة. احذف جلسات قديمة.','err');return null}
   notify('تعذّر إنشاء الجلسة. تحقّق من الاتصال ثم أعد المحاولة.','err');return null}}
 return code}
async function openSession(code,{quiet=false}={}){
 code=normCode(code);if(!code)return false;
 if(UNSUB){try{UNSUB()}catch(e){}UNSUB=null}
 pendingPatch={};RO=false;
 if(LOCAL){const d=LS.get('bm3:s:'+code);if(!d){if(!quiet)notify('لا توجد جلسة بهذا الرمز على هذا الجهاز: '+code,'err');return false}CODE=code;S=d;rememberRecent();return true}
 const snap=await CAP.db.doc('sessions/'+code).get().catch(()=>null);
 if(!snap||!snap.exists){if(!quiet)notify('لم نجد جلسة بالرمز '+code+'. تأكّد من الرمز مع منشّط الجلسة.','err');return false}
 CODE=code;S=clone(snap.data());rememberRecent();
 UNSUB=CAP.db.doc('sessions/'+code).onSnapshot(onSnap,e=>{if(e&&e.code==='revoked')notify('انتهى الوصول إلى الجلسة.','err');else if(e&&e.code==='unavailable'){setTimeout(()=>{if(CODE===code)openSession(code,{quiet:true}).then(()=>listeners.forEach(fn=>fn(null,'remote')))},2500)}});
 if(CAP.user&&!quiet){try{const w=await CAP.user.can('data.write');if(w===false){RO=true}}catch(e){}}
 return true}
function rememberRecent(){if(!S)return;LS.set('bm3:last',CODE);const r=LS.get('bm3:recent')||[];LS.set('bm3:recent',[{code:CODE,brand:S.brand,n:placedCount(),at:Date.now(),done:!!S.done},...r.filter(x=>x.code!==CODE)].slice(0,8))}
function closeSession(){if(UNSUB){try{UNSUB()}catch(e){}UNSUB=null}flush();S=null;CODE=null;LS.del('bm3:last')}

/* ---------- derived state ---------- */
const plist=qid=>(S&&S.place&&S.place[qid])||[];
const placed=qid=>plist(qid).length>0;
const placedCount=()=>S?ALLQ.filter(q=>placed(q.id)).length:0;
const fget=(qid,k)=>(S&&S.fill&&S.fill[qid]&&S.fill[qid][k])||{};
const confOf=qid=>(S&&S.conf&&S.conf[qid])||0;
const doubtOn=qid=>!!(S&&S.doubt&&S.doubt[qid]);
const timeOf=qid=>(S&&S.times&&S.times[qid])||null;
const stageCount=s=>s.qs.filter(q=>placed(q.id)).length;
const stageDone=s=>s.qs.every(q=>placed(q.id));
const stageAvgConf=s=>{const r=s.qs.map(q=>confOf(q.id)).filter(Boolean);return r.length?r.reduce((a,b)=>a+b,0)/r.length:0};
const stageTime=s=>s.qs.reduce((a,q)=>a+((timeOf(q.id)||{}).s||0),0);
function deepFilled(v){if(v==null)return false;if(typeof v==='string')return v.trim()!=='';if(typeof v==='number')return true;if(Array.isArray(v))return v.some(deepFilled);if(typeof v==='object')return Object.values(v).some(deepFilled);return!!v}
function has(ref,key){if(!S)return false;const p=plist(ref);if(ref==='6_1')return p.includes('1')&&fget('6_1','1').type===key;return p.includes(key)}
const confActive=c=>has(...c.a)&&c.b.some(b=>has(...b));
const activeConflicts=()=>CONFLICTS.filter(confActive);
const resolved=c=>S&&S.res&&S.res[c.id]!=null&&S.res[c.id]!==-1;
function ansTitle(q,k){const a=AK(q,k);if(!a)return'';const v=fget(q.id,k);
 if(a.spare)return v.text||'إجابة خاصة';
 if(!a.f)return((a.pre?a.pre+' ':'')+a.t+(a.t2?' '+a.t2:'')).replace(/ـ+/g,'');
 switch(a.f){
  case'comp':return v.name||('المنافس '+a.n);
  case'prod':return a.code2+(v.text?' — '+v.text.split('\n')[0]:'');
  case'ntype':return v.type?'اسم '+v.type:'نوع الاسم';
  case'tagline':return v.pick&&v['t'+v.pick]?v['t'+v.pick]:(v.t1||'الشعار اللفظي');
  case'lines':return(v.text||'').split('\n')[0]||q.slot;
  case'fields':{const f=a.fields.find(f=>deepFilled(v[f[0]]));return f?String(v[f[0]]).split('\n')[0]:q.slot}
  case'pestle':{const n=['p','e','s','t','l','n'].filter(x=>deepFilled(v[x])).length;return n+' اتجاهات مؤثرة'}
  case'swot':return'SWOT · '+['s','w','o','t'].filter(x=>deepFilled(v[x])).length+'/4';
  case'scales':return Object.keys(v).length+' مقاييس محدّدة';
  case'matrix':return(v.x||'المحور الأفقي')+' × '+(v.y||'الرأسي');
  case'domains':return['com','sa','social'].map(x=>(v[x]||{}).st).filter(Boolean).join(' · ')||'النطاقات';
 }return q.slot}
function ansSummary(q){return plist(q.id).map(k=>ansTitle(q,k)).filter(Boolean).join('، ')}
/* full readable text of an answer, for the document */
function fillText(q,k){const a=AK(q,k),v=fget(q.id,k);if(!a)return'';
 if(a.spare)return v.text||'';
 if(!a.f)return'';
 const L=(lab,val)=>deepFilled(val)?`${lab}: ${String(val).trim()}`:'';
 switch(a.f){
  case'pestle':return[['p','سياسي'],['e','اقتصادي'],['s','اجتماعي'],['t','تقني'],['l','قانوني'],['n','بيئي']].map(([x,l])=>L(l,v[x])).filter(Boolean).join('\n');
  case'comp':return[L('المنافس',v.name),L('الخطورة',v.risk),L('أهم قوة',v.strong),L('أهم ضعف',v.weak)].filter(Boolean).join('\n');
  case'fields':return a.fields.map(([x,l])=>L(l,v[x])).filter(Boolean).join('\n');
  case'lines':case'prod':return(v.text||'').trim();
  case'swot':return[['s','نقاط القوة'],['w','نقاط الضعف'],['o','الفرص'],['t','التهديدات']].map(([x,l])=>L(l,v[x])).filter(Boolean).join('\n');
  case'scales':return a.scales.map((p,i)=>v[i]?`${p[0]} ↔ ${p[1]}: ${v[i]}/7`:'').filter(Boolean).join('\n');
  case'tagline':return[1,2,3].map(n=>v['t'+n]?`${v.pick==n?'★ ':''}مقترح ${n}: ${v['t'+n]}`:'').filter(Boolean).join('\n');
  case'matrix':return[L('المحور الأفقي',v.x),L('المحور الرأسي',v.y),L('موقعنا',v.we),L('المنافسون',v.them)].filter(Boolean).join('\n');
  case'ntype':return v.type?'نوع الاسم: '+v.type:'';
  case'domains':return a.rows.map(([x,l])=>{const d=v[x]||{};return d.st?`${l}: ${d.st}${d.note?' — '+d.note:''}`:''}).filter(Boolean).join('\n');
 }return''}
function defLine(){const v=S&&S.intake&&S.intake.s1;if(!v||!(v.a||v.b))return'';return `نحن نقدّم «${v.a||'…'}» لـ«${v.b||'…'}»`}

/* ---------- platform account (facilitator registration) ---------- */
let PROFILE=null,IS_ADMIN=false,ROOM=null,PEERS=[];
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const whoName=()=>(ME.alias||(PROFILE&&PROFILE.name)||'عضو').trim();
async function loadProfile(){PROFILE=LS.get('bm3:profile:'+(ME.id||'local'))||null;
 if(!LOCAL&&CAP.db&&ME.id){try{const s=await CAP.db.doc('facilitators/'+ME.id).get();if(s&&s.exists){PROFILE=s.data();LS.set('bm3:profile:'+ME.id,PROFILE)}}catch(e){}}
 if(PROFILE&&!ME.alias){ME.alias=PROFILE.name;LS.set('bm3:alias',ME.alias)}return PROFILE}
async function saveProfile(p){p.uid=ME.id||'local';p.at=(PROFILE&&PROFILE.at)||Date.now();p.upd=Date.now();
 if(!LOCAL&&CAP.db&&ME.id){try{await CAP.db.doc('facilitators/'+ME.id).set(p)}catch(e){
  notify(e&&e.code==='invalid_argument'?'لا تملك صلاحية التسجيل في هذه الأداة. اطلب من مالكها صلاحية «مساهم».':'تعذّر حفظ التسجيل. تحقّق من الاتصال ثم أعد المحاولة.','err');return false}}
 PROFILE=p;LS.set('bm3:profile:'+(ME.id||'local'),p);ME.alias=p.name;LS.set('bm3:alias',p.name);return true}
/* ---------- activity log & unified change feed ---------- */
function logEv(kind,t,extra={}){if(!S)return;patch({log:{[newId()]:{at:Date.now(),by:whoName(),kind,t,...extra}}},{silent:true})}
function compList(){if(!S)return[];const out=[];const R={منخفضة:1,متوسطة:2,عالية:3};
 ['1','2','3'].forEach(k=>{const v=fget('1_3',k);if(v&&v.name)out.push({id:'c'+k,name:v.name,base:R[v.risk]||2,strong:v.strong||'',weak:v.weak||'',src:'card',k})});
 Object.entries(S.comps||{}).forEach(([id,c])=>{if(c&&c.name&&!c.del)out.push({id,name:c.name,base:R[c.risk]||2,strong:c.strong||'',weak:c.weak||'',src:'dash'})});
 out.forEach(c=>{const mv=Object.values(S.cmoves||{}).filter(m=>m&&m.c===c.id).sort((a,b)=>a.at-b.at);c.moves=mv;const lr=[...mv].reverse().find(m=>m.risk);c.risk=lr?lr.risk:c.base;
  const recent=mv.filter(m=>Date.now()-m.at<90*DAY);c.threat=Math.min(100,Math.round(c.risk/3*70+Math.min(30,recent.reduce((a,m)=>a+(m.imp||1)*5,0))))});return out}
const compName=id=>{const c=compList().find(x=>x.id===id);return c?c.name:'منافس'};
function feedItems(){if(!S)return[];const out=[];
 Object.entries(S.hist||{}).forEach(([qid,h])=>{const q=Q[qid];if(!q)return;Object.values(h||{}).forEach(e=>{if(e&&e.at)out.push({at:e.at,by:e.by,kind:'card',q,ax:q.s.n,t:e.from?`${qcode(q)} ${q.slot}: «${e.from}» ← «${e.to}»`:`${qcode(q)} ${q.slot}: «${e.to}»`,verb:e.from?'غيّر قراراً':'وضع قراراً'})})});
 Object.values(S.follow||{}).forEach(f=>{if(f&&f.at&&f.ax){const st={ok:'على المسار',warn:'يحتاج انتباه',bad:'متعثّر'}[f.st]||'';out.push({at:f.at,by:f.by,kind:'follow',ax:+f.ax,t:`${STAGES[f.ax-1].name}: ${st}${f.kpi?' · '+f.kpi:''}${f.note?' — '+f.note:''}`,verb:'سجّل متابعة'})}});
 Object.values(S.cmoves||{}).forEach(m=>{if(m&&m.at)out.push({at:m.at,by:m.by,kind:'comp',ax:1,t:`${compName(m.c)}: ${m.type}${m.note?' — '+m.note:''}`,verb:'رصد تحرّك منافس',lvl:m.imp})});
 Object.values(S.mread||{}).forEach(r=>{const ind=(S.mind||{})[r.ind];if(ind&&r.at)out.push({at:r.ts||r.at,by:r.by,kind:'market',ax:1,t:`${ind.name}: ${r.v}${ind.unit?' '+ind.unit:''}${r.note?' — '+r.note:''}`,verb:'سجّل قراءة سوق'})});
 Object.values(S.log||{}).forEach(l=>{if(l&&l.at)out.push({at:l.at,by:l.by,kind:l.kind||'log',ax:l.ax,t:l.t,verb:l.verb||'حدّث'})});
 if(S.ai&&S.ai.at)out.push({at:S.ai.at,by:S.ai.by,kind:'ai',t:(S.ai.data&&S.ai.data.headline)||'قراءة جديدة',verb:'طلب القراءة الذكية'});
 return out.sort((a,b)=>b.at-a.at)}
const ago=t=>{const s=Math.max(0,(Date.now()-t)/1000);if(s<45)return'الآن';if(s<3600)return'قبل '+Math.round(s/60)+' د';if(s<86400)return'قبل '+Math.round(s/3600)+' س';return'قبل '+Math.round(s/86400)+' يوم'};

const SPECIAL=[
 {id:'loop',t:'حلقة اللعب',ic:'refresh-cw',body:'كل بطاقة تمرّ بست خطوات: يقرأ قائد الجلسة السؤال بصوت مسموع، ثم نقاش لثلاث دقائق يملك جرسها حارس الوقت، ثم القرار ووضع البطاقة في فتحتها، ثم تظليل درجة التأكد من ١ إلى ٥، ثم فحص التعارض مع ما سبق، ثم التوثيق.',use:['استخدموا المؤقت في كل بطاقة: الخلاف مسموح والتأجيل ممنوع.','لا تنتقلوا لبطاقة قبل تحديد التأكد؛ القرار بلا تأكد يُحسب ناقصاً في الوثيقة.','وثّقوا بعد كل محور: صورة للوحة الفيزيائية أو ضغطة «ضع البطاقة» في الرقمية.']},
 {id:'board',t:'لوحة استلام الإجابات',ic:'layout-grid',body:'لوحة بثمانية أعمدة، عمود لكل محور من اليمين (السوق) إلى اليسار (الرؤية). لكل سؤال فتحة بمقاس البطاقة، والفتحات الذهبية الثلاث للقرارات التي تحتاج إجماعاً. الرحلة تكتمل عمودياً: محوراً بعد محور.',use:['ضعوا بطاقة القرار في فتحتها فور الحسم؛ الفتحة الفارغة تفضح القرار المؤجَّل.','ظلّلوا دوائر التأكد على البطاقة قبل وضعها.','في اللعب الفيزيائي: هذه اللوحة هي ما تصوّرونه في النهاية لتُعبّأ المنصة آلياً.']},
 {id:'intake',t:'بطاقة المشروع',ic:'clipboard-list',body:'إحدى عشرة معلومة واقعية قبل أول بطاقة، وبعد اللعب يُضاف الحضور الرقمي والبيانات الاحترافية. ليست قرارات بل الأرض المشتركة: جملة التعريف تتصدّر الطاولة طوال الجلسة.',use:['املؤوها قبل البدء إن أمكن، وإلا فهي إلزامية قبل إنشاء لوحة المتابعة.','جملة التعريف هي المرجع عند كل خلاف.','روابط الموقع والحسابات تفتح تقارير المنصات في لوحة المتابعة.']},
 {id:'gold',t:'البطاقات الذهبية',ic:'star',body:'ثلاثة قرارات لا رجعة رخيصة عنها: الشريحة الأهم، والقيمة الأساسية، ونوع الاسم. تُطبع بوجه ذهبي ولا تُوضع ولا تُقلب إلا بإجماع الطاولة كاملة.',use:['اطلبوا تصويت كل الحاضرين قبل وضعها.','إن لم يتحقق الإجماع: مددوا النقاش ثلاث دقائق أو ارفعوا بطاقة شك.','تُنقل مباشرة إلى الملخص التنفيذي في الوثيقة.']},
 {id:'conf',t:'درجة التأكد',ic:'activity',body:'خمس دوائر في تذييل كل بطاقة: ١ تخمين، ٢ ميل ضعيف، ٣ مرجّح، ٤ واثق، ٥ مؤكد بدليل. أي قرار بدائرتين أو أقل يدخل قائمة إعادة النظر.',use:['التأكد العالي يحتاج دليلاً: رقم، مقابلة، مبيعات فعلية.','القرار الهشّ الموثَّق خيرٌ من قرارٍ واثقٍ كاذب.','متوسط التأكد يدخل حساب صحة العلامة في اللوحة.']},
 {id:'doubt',t:'بطاقة الشك',ic:'circle-help',body:'تُرفع فوق أي قرار وُضع دون اقتناع كامل. لا تمنع التقدّم، لكنها تضع القرار في قائمة التحقق قبل الإطلاق مع سبب الشك.',use:['ارفعوها بدل تعطيل الجلسة.','اكتبوا ما الذي يزيل الشك: رقم؟ مقابلة؟ تجربة؟','تظهر في قسم المخاطر في الوثيقة.']},
 {id:'conflict',t:'كروت التعارض',ic:'triangle-alert',body:'ستة كروت تُرفع تلقائياً حين يتصادم قراران، مثل «حواجز قليلة × قيادة المنتج». لكل كرت ثلاثة مخارج للحسم.',use:['لا تتجاهلوا الكرت: اختاروا مخرجاً أو عدّلوا أحد القرارين.','المخرج المختار يُكتب في قسم المخاطر مع جملة الجسر.','الكرت هو ما يجعل اللعبة مستشاراً لا استبياناً.']},
 {id:'physical',t:'اللعب الفيزيائي والتصوير',ic:'camera',body:'العبوا بالبطاقات المطبوعة على لوحة الاستلام، ثم صوّروا اللوحة وارفعوا الصور. تقرأ المنصة رمز كل بطاقة (مثل Q1.3) ودوائر التأكد المظلّلة والكتابة على بطاقات التعبئة، وتعبّئ اللوحة الرقمية.',use:['صوّروا من الأعلى مباشرة بإضاءة جيدة، كل عمودين في صورة.','تأكدوا أن رمز البطاقة ودوائر التأكد ظاهرة وغير مغطّاة.','ما لم يُقرأ بوضوح يُعلَّم على لوحة اللعبة لتدخلوه يدوياً.']},
 {id:'agent',t:'وكيل البطاقة',ic:'wand-sparkles',body:'لكل بطاقة وكيل ذكي متخصص في موضوعها. يقرأ إجابتكم واختبارات الجودة في الدليل وما تغيّر في المشروع، فيقيّم القرار ويقترح تطويره ويصوغ مخرج البطاقة للوثيقة. كل تشغيل نسخة جديدة تبني على السابقة.',use:['شغّلوه بعد وضع البطاقة، ثم بعد كل تغيير مهم في السوق أو المتابعة.','الوكيل يعمل على بيانات مشروعكم ومعرفته العامة، ولا يتصفح الإنترنت.','قراراته مقترحات: الطاولة تحسم.']},
 {id:'map',t:'الخريطة الدائرية',ic:'map',body:'المخرج المُسلَّم: قرار واحد لكل محور مرسوم على حلقة. في الطاولة ثلاثية الأبعاد تمتلئ الحلقة بالبطاقات، وتعود بتلة كل محور إلى الزهرة في المركز حين يكتمل.',use:['اقرؤوها من «ابدأ» باتجاه الرحلة.','المحور الناقص يظهر كبتلة شفافة.','صورتها في نهاية الجلسة هي ملخّص اللعبة كلها.']}];
const optT=a=>((a.pre?a.pre+' ':'')+(a.t||'')+(a.t2?' '+a.t2:'')).replace(/ـ+/g,'');
const TRACKS={
 design:{n:'المصمم',ic:'swatch-book',c:'#C2528C',verb:'طبّقه في الهوية',dd:30},
 content:{n:'المحتوى والوكالة',ic:'pen-line',c:'#1B8DB8',verb:'حوّله إلى محتوى ونبرة',dd:30},
 mkt:{n:'التسويق',ic:'presentation',c:'#3F72B5',verb:'ابنِ عليه الحملات والقنوات',dd:30},
 sales:{n:'المبيعات',ic:'handshake',c:'#2E9477',verb:'درّب فريق البيع عليه',dd:21},
 fin:{n:'المالية والمستثمر',ic:'calculator',c:'#B07A00',verb:'اعكسه في الميزانية والتسعير',dd:30},
 legal:{n:'القانوني',ic:'badge-check',c:'#7560A3',verb:'افحصه وسجّله',dd:14},
 lead:{n:'الإدارة والمؤسس',ic:'crown',c:'#24364A',verb:'اعتمده وعمّمه على الفريق',dd:7}};
const TST={todo:['لم يبدأ','none'],doing:['جارٍ','warn'],done:['منجز','ok'],blocked:['متعثّر','bad']};
const CM={};CARDMAP.forEach(r=>CM[r.q]=r);
function projIndex(){if(LOCAL||!CAP.db||!ME.id||!S||!CODE)return;CAP.db.collection('data/users/'+ME.id).doc('p_'+CODE).set({code:CODE,brand:S.brand,role:S.owner===ME.id?'owner':'member',at:Date.now()}).catch(()=>{})}
const DPLAT=[['ig','إنستقرام','#C2528C','instagram.com/','IG'],['x','إكس','#22313F','x.com/','X'],['tt','تيك توك','#1B8DB8','tiktok.com/@','TT'],['sc','سناب شات','#B07A00','snapchat.com/add/','SC'],['li','لينكدإن','#2F6FB3','linkedin.com/company/','in'],['yt','يوتيوب','#D63446','youtube.com/@','YT'],['wa','واتساب للأعمال','#2E9477','wa.me/','WA'],['gm','خرائط Google','#5E9A2A','','G']];
const IK_SECS=[...INTAKE_SECS,{n:4,t:'الحضور الرقمي',sub:'الموقع والمنصات والبيانات الاحترافية',k:'#B07A00'}];
const DG=()=>(S&&S.digital)||{};
const platOn=()=>DPLAT.filter(([k])=>{const p=(DG().plats||{})[k];return p&&p.on});
function digitalParts(){const d=DG(),pro=d.pro||{};const pres=!!((d.web||'').trim()||platOn().some(([k])=>((d.plats||{})[k].handle||'').trim())||d.none);const cont=!!((pro.email||'').trim()||(pro.phone||'').trim());return{pres,cont}}
const digitalDone=()=>{const p=digitalParts();return p.pres&&p.cont};
const reqMissing=()=>INTAKE.filter(x=>x.req&&!ikDone(x));
function hrefOf(v,base){v=String(v||'').trim();if(!v)return'';if(/^https?:\/\//i.test(v))return v;if(/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v))return'https://'+v;return base?'https://'+base+v.replace(/^@/,''):''}
const N_Q=ALLQ.length;
const DEMO=(()=>{const d={place:{},conf:{},times:{},doubt:{},cur:'4_3'};const pick={'1_1':'4','1_4':'2','1_5':'2','1_6':'1','2_1':'2','2_2':'2','2_3':'3','3_3':'2','4_1':'1','4_2':'2'};
 ALLQ.forEach((q,i)=>{if(q.s.n>3&&!pick[q.id])return;if(q.s.n===3&&q.id==='3_4')return;d.place[q.id]=[pick[q.id]||'1'];d.conf[q.id]=3+(i%3);d.times[q.id]={s:95+(i*37)%140,d:180}});d.doubt['2_3']=1;return d})();
function stageOf(n){return STAGES[n-1]}
function fixedName(){const I=S&&S.intake;return I&&I.s9==='y'&&I.s9x?I.s9x:''}
function tmState(){const t=(S&&S.tm)||{};const el=(t.acc||0)+(t.run&&t.st?Date.now()-t.st:0);const dur=(t.dur||(S&&S.cfg&&S.cfg.dur)||180)*1000;return{...t,el,dur,rem:dur-el}}
function reviewItems(){if(!S)return[];const out=[];
 activeConflicts().filter(c=>!resolved(c)).forEach(c=>out.push({k:'c',q:Q[c.a[0]],t:'تعارض غير محسوم: '+c.title,c}));
 ALLQ.forEach(q=>{if(!placed(q.id))return;const c=confOf(q.id);if(c&&c<=reviewMax())out.push({k:'l',q,t:`تأكد منخفض (${CL[c].t})`});if(doubtOn(q.id))out.push({k:'d',q,t:'بطاقة شك مرفوعة'});if(!c)out.push({k:'n',q,t:'بلا درجة تأكد'})});return out}
const ROLES=['منشّط مستقل','وكالة تسويق','صاحب علامة','فريق تسويق داخلي','مستشار براند ماب'];
const PAL=['#3F72B5','#5E9A2A','#7560A3','#1B8DB8','#C2528C','#2E9477','#D63446','#B07A00'];
const colorOf=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return PAL[h%PAL.length]};
const initial=n=>(String(n||'؟').trim()[0]||'؟');
const memberName=uid=>(S&&S.members&&S.members[uid]&&S.members[uid].name)||(uid===ME.id?whoName():'عضو');
async function joinRoom(){if(!CAP.room||!CODE)return;try{if(ROOM){try{await ROOM.leave()}catch(e){}ROOM=null}
 ROOM=await CAP.room.join('bm-'+CODE);PEERS=ROOM.peers();ROOM.presence({id:ME.id,name:whoName(),hand:null});
 ROOM.onPeers(ch=>{PEERS=ch.peers.slice();bump()})}catch(e){ROOM=null}}
function onlinePeople(){const m=new Map();(PEERS||[]).forEach(p=>{const pr=p.presence||{};const id=pr.id||p.by||p.peer;if(!id)return;const cur=m.get(id);if(!cur||(pr.hand&&!cur.hand))m.set(id,{id,name:pr.name||memberName(id),hand:pr.hand||null,me:p.isMe})});
 if(!m.size&&ME.id)m.set(ME.id,{id:ME.id,name:whoName(),hand:ui.hand||null,me:true});return[...m.values()]}
function setHand(on){ui.hand=on?Date.now():null;if(ROOM)ROOM.presence({id:ME.id,name:whoName(),hand:ui.hand}).catch(()=>{});bump()}
const ikVal=k=>((S&&S.intake)||{})[k];
function ikDone(x){const v=ikVal(x.k);if(x.type==='pair')return!!(v&&(v.a||'').trim()&&(v.b||'').trim());if(x.type==='many')return Array.isArray(v)&&v.length>0;
 if(x.type==='yn')return v==='n'||(v==='y'&&!!String(ikVal('s9x')||'').trim());if(x.other&&v===x.other)return!!String(ikVal(x.k+'x')||'').trim();return!!(v&&String(v).trim())}
const ikCount=()=>INTAKE.filter(ikDone).length;
const ikSecDone=n=>INTAKE.filter(x=>x.sec===n&&ikDone(x)).length;
function afterOpen(){if(S&&S.cfg&&S.cfg.mode==='physical'&&!LS.get('bm3:bmode'))ui.boardMode='2d';ui.hand=null;ui.projList=null;projIndex();if(S&&ME.id&&!RO&&(!S.members||!S.members[ME.id]||S.members[ME.id].name!==whoName()))patch({members:{[ME.id]:{name:whoName(),at:Date.now()}}},{silent:true});joinRoom();ui.seenAt=LS.get('bm3:seen:'+S.code)||0;ui.sel={};ui.warned={};const first=ALLQ.find(q=>!placed(q.id));ui.q=(S.cur&&Q[S.cur])?S.cur:(first||ALLQ[0]).id;ui.tmKey='';ui.lastRem=null}
function enforceCall(){if(S&&S.cfg&&S.cfg.call&&SND.cur()){SND.stopTrack();notify('أوقفنا الموسيقى الخلفية: وضع الاجتماع الصوتي مفعّل حتى لا تزاحم أصوات المتحدثين.')}}
const CSPEC=[...STAGES.map(s=>['ax'+s.n,'محور '+s.name]),['naming','التسمية والفحص القانوني'],['visual','الهوية البصرية'],['price','التسعير والنمو'],['content','المحتوى والمنصات'],['facil','تنشيط الجلسات']];
const cspecT=k=>(CSPEC.find(x=>x[0]===k)||[,k])[1];
const DAYS=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const BK_KIND=['مكالمة قصيرة ١٥ دقيقة','جلسة استشارية ٤٥ دقيقة','ينضم للطاولة الآن'];
const BK_ST={new:['جديد','warn'],confirmed:['مؤكد','ok'],resched:['اقتُرح موعد آخر','warn'],done:['انتهى','ok'],cancel:['أُلغي','bad']};
const CONS_ROLE='مستشار براند ماب';
let CONS=null,ui_bk={step:1,cid:null,slot:null,kind:0,day:0};
const fmtWhen=t=>t?new Date(t).toLocaleString('ar-SA-u-ca-gregory-nu-latn',{weekday:'long',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'—';
async function loadConsultants(force){if(CONS&&!force)return CONS;
 if(LOCAL||!CAP.db){CONS=LS.get('bm3:cons')||[];return CONS}
 try{const [c,a]=await Promise.all([CAP.db.collection('consultants').limit(200).get(),CAP.db.collection('capprove').limit(400).get()]);const ok={};a.docs.forEach(d=>{const x=d.data();if(x&&x.ok)ok[d.id]=x});
  CONS=c.docs.map(d=>({...d.data(),id:d.id,ok:!!ok[d.id]})).filter(x=>x&&x.name)}catch(e){CONS=CONS||[]}return CONS}
const approved=()=>(CONS||[]).filter(c=>c.ok);
const myCons=()=>CONS&&ME.id?CONS.find(c=>c.id===ME.id):null;
function slotsFor(c,days=10){const av=c.avail||{};const ds=Array.isArray(av.days)?av.days:[0,1,2,3,4];const tm=s=>{const[h,m]=String(s||'').split(':').map(Number);return(h||0)*60+(m||0)};const f=tm(av.from||'16:00'),to=tm(av.to||'21:00');const out=[];const now=Date.now();
 for(let d=0;d<days;d++){const day=new Date();day.setHours(0,0,0,0);day.setDate(day.getDate()+d);if(!ds.includes(day.getDay()))continue;for(let m=f;m+30<=to;m+=30){const t=day.getTime()+m*6e4;if(t>now+60*6e4)out.push(t)}}return out}
function myBookings(){return Object.entries((S&&S.bookings)||{}).map(([id,b])=>({id,...b})).filter(b=>b&&b.at).sort((a,b)=>b.at-a.at)}
async function ensureConsProfile(){const p=PROFILE;if(!p)return;await loadConsultants(true);if(myCons())return;
 const doc={name:p.name,title:'مستشار براند ماب',bio:'',spec:[],avail:{days:[0,1,2,3,4],from:'16:00',to:'21:00'},at:Date.now()};
 if(!LOCAL&&CAP.db){try{await CAP.db.doc('consultants/'+ME.id).set(doc)}catch(e){notify('تعذّر إنشاء ملف المستشار.','err');return}}else{const L=LS.get('bm3:cons')||[];L.push({...doc,id:ME.id,ok:false});LS.set('bm3:cons',L)}
 await loadConsultants(true);notify('أُرسل ملفك كمستشار لاعتماد فريق المنصة. أكمل تخصصاتك ومواعيدك من «لوحة المستشار».','gold')}
let BK_SEEN=null;onSync(()=>{if(!S)return;const cur={};Object.entries(S.bookings||{}).forEach(([id,b])=>{if(b&&b.at)cur[id]=(b.st||'')+'|'+(b.alt||'')});
 if(BK_SEEN&&BK_SEEN.code===CODE)Object.entries(cur).forEach(([id,v])=>{if(BK_SEEN.m[id]&&BK_SEEN.m[id]!==v){const b=S.bookings[id];const st=BK_ST[b.st];if(b.uid&&b.uid!==ME.id&&ui.view!=='play')return;notify(`${b.cname||'المستشار'}: ${st?st[0]:'تحديث'}${b.st==='resched'&&b.alt?' · '+fmtWhen(b.alt):''}${b.reply?' — '+b.reply:''}`,'gold');SND.play('gold')}});
 BK_SEEN={code:CODE,m:cur}});
const isConsMember=uid=>!!(S&&S.members&&S.members[uid]&&S.members[uid].role==='consultant');
const ADM_SECS=[['over','نظرة عامة','layout-dashboard'],['axes','المحاور والتصميم','orbit'],['cards','البطاقات','layout-grid'],['content','المحتوى والدروس','book'],['ai','وكلاء الذكاء الاصطناعي','wand-sparkles'],['cons','المستشارون','handshake'],['clients','العملاء والجلسات','users'],['plans','الباقات والاشتراكات','badge-dollar-sign'],['coupons','أكواد الخصم','coins'],['perms','الصلاحيات والفريق','lock'],['settings','الإعدادات','cog'],['audit','سجل التغييرات','clipboard-list']];
const ROLE_DEF={owner:['مدير عام','*'],content:['محرر المحتوى',['over','axes','cards','content','ai','audit']],sales:['المبيعات والاشتراكات',['over','clients','plans','coupons']],consult:['مدير المستشارين',['over','cons','clients']],support:['الدعم الفني',['over','clients','cons','audit']],custom:['مخصص',null]};
const FEATS=[['chat','المساعد الذكي للعبة'],['agents','وكلاء البطاقات'],['read','القراءة الذكية'],['scan','رفع صور اللعبة المطبوعة'],['digital','تقارير المنصات الرقمية'],['consult','حجز المستشارين'],['docx','تحميل وثيقة Word']];
const PERIODS={month:['شهري',30],quarter:['ربع سنوي',91],year:['سنوي',365],once:['مدى الحياة',0]};
const SUB_ST={active:['فعّال','ok'],trial:['تجريبي','warn'],expired:['منتهٍ','bad'],cancel:['ملغى','bad']};
let IS_OWNER=false,MY_STAFF=null,MY_SUB=null,MY_BLOCK=false,PLANS=null,MY_REQ=null;
const N=x=>(+x||0).toLocaleString('en-US');
const cur=()=>(cmsS().biz||{}).currency||'ر.س';
const money=v=>(Math.round((+v||0)*100)/100).toLocaleString('ar-SA-u-nu-latn')+' '+cur();
const admLocal=()=>LOCAL||!CAP.db;
function localSessions(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('bm3:s:')===0){const d=JSON.parse(localStorage.getItem(k));if(d&&d.code)out.push({id:d.code,...d})}}}catch(e){}return out}
async function aList(col,lim=500){if(admLocal()){if(col==='sessions')return localSessions();if(col==='facilitators'){const L=LS.get('bm3:adm:facilitators')||{};if(PROFILE&&ME.id)L[ME.id]={...PROFILE};return Object.entries(L).map(([id,d])=>({id,...d}))}return Object.entries(LS.get('bm3:adm:'+col)||{}).map(([id,d])=>({id,...d}))}
 try{const qs=await CAP.db.collection(col).limit(lim).get();return qs.docs.map(d=>({id:d.id,...d.data()}))}catch(e){return[]}}
async function aGet(col,id){if(admLocal())return(LS.get('bm3:adm:'+col)||{})[id]||null;try{const d=await CAP.db.doc(col+'/'+id).get();return d&&d.exists?d.data():null}catch(e){return null}}
async function aSet(col,id,doc){if(admLocal()){const L=LS.get('bm3:adm:'+col)||{};L[id]=doc;LS.set('bm3:adm:'+col,L);return}await CAP.db.doc(col+'/'+id).set(doc)}
async function aDel(col,id){if(admLocal()){const L=LS.get('bm3:adm:'+col)||{};delete L[id];LS.set('bm3:adm:'+col,L);return}await CAP.db.doc(col+'/'+id).delete()}
async function audit(action,target,detail){try{await aSet('audit',newId(),{at:Date.now(),by:whoName(),uid:ME.id||'',action,target:String(target||''),detail:String(detail||'').slice(0,300)})}catch(e){}}
async function cmsPut(part,data){data.ver=Date.now();data.by=whoName();if(!admLocal())await CAP.db.doc('cms/'+part).set(data);CMS[part]=data;cmsSave();if(part==='game'){try{sessionStorage.setItem('bm3:cmsR',String(data.ver))}catch(e){}}}
function canSec(k){if(!IS_ADMIN)return false;if(IS_OWNER||!MY_STAFF)return true;const r=ROLE_DEF[MY_STAFF.role];const s=MY_STAFF.role==='custom'?(MY_STAFF.secs||[]):r&&r[1];return s==='*'||(Array.isArray(s)&&s.includes(k))}
const planById=id=>(PLANS||[]).find(p=>p.id===id);
function subLive(s){return s&&['active','trial'].includes(s.st)&&(!s.end||s.end>Date.now())}
function myPlan(){if(MY_SUB&&subLive(MY_SUB))return planById(MY_SUB.plan)||null;const fp=(cmsS().biz||{}).freePlan;return fp?planById(fp):null}
function myEnt(){const p=myPlan();if(!p)return flag('enforce')?Object.fromEntries(FEATS.map(f=>[f[0],false])):{};return{...(p.feat||{}),plan:p.name}}
function featOn(k){if(!flag(k))return false;if(IS_ADMIN||!flag('enforce'))return true;const E=(S&&S.ent)?S.ent:myEnt();return E[k]!==false&&E[k]!==undefined?!!E[k]:false}
function applyFeatClasses(){const b=document.body;FEATS.forEach(([k])=>b.classList.toggle('off-'+k,!featOn(k)));b.classList.toggle('reg-closed',!flag('register'))}
async function loadBiz(){PLANS=(await aList('plans')).filter(p=>p&&p.name).sort((a,b)=>(a.ord||0)-(b.ord||0));if(ME.id){MY_SUB=await aGet('subs',ME.id);MY_REQ=await aGet('subreq',ME.id);MY_BLOCK=!!(await aGet('blocked',ME.id))}
 if(!admLocal()&&ME.id){MY_STAFF=await aGet('staff',ME.id)}applyFeatClasses()}
async function mySessionsThisMonth(){const m=new Date();m.setDate(1);m.setHours(0,0,0,0);if(admLocal())return localSessions().filter(s=>s.owner===ME.id&&(s.created||0)>=m.getTime()).length;
 try{const qs=await CAP.db.collection('sessions').where('owner','==',ME.id).limit(200).get();return qs.docs.map(d=>d.data()).filter(s=>(s.created||0)>=m.getTime()).length}catch(e){return 0}}
async function couponCheck(code,planId){const c=await aGet('coupons',String(code||'').toUpperCase());if(!c)return{ok:false,reason:'غير موجود'};if(c.active===false)return{ok:false,reason:'موقوف'};if(c.exp&&c.exp<Date.now())return{ok:false,reason:'منتهي'};if(c.max&&(c.used||0)>=c.max)return{ok:false,reason:'استُنفد'};if(Array.isArray(c.plans)&&c.plans.length&&planId&&!c.plans.includes(planId))return{ok:false,reason:'لا يشمل هذه الباقة'};
 return{ok:true,label:c.type==='pct'?N(c.val)+'٪':money(c.val),final:b=>Math.max(0,c.type==='pct'?b*(1-(+c.val||0)/100):b-(+c.val||0))}}
let DEF_TIMER=180;
{const _cs=createSession;createSession=async function(o){if(!IS_ADMIN){if(MY_BLOCK){notify('حسابك موقوف مؤقتاً. تواصل مع فريق المنصة.','err');return null}
  if(flag('enforce')){const p=myPlan();if(!p){emit('openPlans','إنشاء الجلسات يحتاج باقة فعّالة.');return null}const lim=+((p.feat||{}).sessions)||0;if(lim&&await mySessionsThisMonth()>=lim){emit('openPlans',`استهلكت ${N(lim)} جلسات هذا الشهر في باقة «${p.name}».`);return null}}}
 return _cs(o)}}
{const _ao=afterOpen;afterOpen=function(...a){const r=_ao(...a);if(S&&ME.id&&S.owner===ME.id&&!S.ent&&flag('enforce')&&!RO)patch({ent:myEnt()},{silent:true});applyFeatClasses();return r}}
onSync(()=>applyFeatClasses());
const SPECIAL0=JSON.parse(JSON.stringify(SPECIAL));
const gClone=()=>JSON.parse(JSON.stringify(cmsG()));
const AI_FEATS=[['chat','المساعد الذكي للعبة','يجيب عن القواعد والبطاقات ويحيل للمستشار البشري.'],['agents','وكلاء البطاقات','وكيل لكل بطاقة يقيّم القرار ويطوّره في لوحة المتابعة.'],['read','القراءة الذكية','تقرأ تغيّرات لوحة المتابعة وتستخرج الإشارات والخطوات.'],['scan','قراءة صور اللعبة المطبوعة','تقرأ رموز البطاقات ودوائر التأكد من صور لوحة الاستلام.'],['digital','تقارير المنصات الرقمية','تحلّل حسابات العلامة على المنصات.']];
const TIERS=[['quick','سريع وموفّر'],['default','متوازن (افتراضي)'],['complex','عميق للمهام المعقّدة']];
function applyLessons(){const O=(cmsL().lessons)||{};SPECIAL.forEach((x,i)=>{const P=SPECIAL0.find(y=>y.id===x.id)||x;const o=O[x.id]||{};x.t=o.t||P.t;x.body=o.body||P.body;x.use=o.use||P.use})}
function wrapSample(raw){if(!raw)return raw;return{limits:(...a)=>raw.limits(...a),json:(p,o={})=>{const{feat,q,...r}=o;const A=cmsA();
 if(feat&&!featOn(feat))return Promise.reject({code:'not_granted',message:'disabled by admin'});const c=(feat==='agents'&&q)?((A.cards||{})[q]||{}):{};if(c.off)return Promise.reject({code:'not_granted',message:'agent off'});
 const f=(A.feat||{})[feat]||{},g=A.global||{};const ex=[g.extra&&'تعليمات عامة من إدارة المنصة: '+g.extra,f.extra&&'تعليمات لهذه الميزة: '+f.extra,c.extra&&'تعليمات خاصة بوكيل هذه البطاقة: '+c.extra].filter(Boolean);
 const tier=f.tier||g.tier;if(tier)r.modelTier=tier;return raw.json(ex.length?`[التزم بهذه التعليمات من إدارة المنصة ما لم تخالف تنسيق الإجابة المطلوب]\n${ex.join('\n')}\n\n${p}`:p,r)}}}
async function cmsLoad(){if(admLocal()){applyLessons();applySettingsLive();return}
 try{const qs=await CAP.db.collection('cms').limit(10).get();const n={};qs.docs.forEach(d=>n[d.id]=d.data());const oldG=(CMS.game||{}).ver||0,newG=(n.game||{}).ver||0;CMS=n;cmsSave();applyLessons();applySettingsLive();bump();
  if(oldG!==newG){let done=false;try{if(sessionStorage.getItem('bm3:cmsR')!==String(newG)&&ui.view!=='play'){sessionStorage.setItem('bm3:cmsR',String(newG));if(cmsSave()){location.reload();done=true}}}catch(e){}
   if(!done)notify('حُدّث محتوى اللعبة من إدارة المنصة.','gold',{sticky:true,actions:[{t:'أعد التحميل',fn:()=>location.reload()}]})}}catch(e){}}
/* ================= المكتبة الصوتية — كل الأصوات مُولَّدة لحظياً (WebAudio) بلا ملفات خارجية ================= */
const SND=(()=>{
 const HZ={D2:73.42,A2:110,D3:146.83,Eb3:155.56,Fs3:185,G3:196,A3:220,Bb3:233.08,C4:261.63,D4:293.66,Eb4:311.13,Fs4:369.99,G4:392,A4:440,Bb4:466.16,C5:523.25,D5:587.33};
 const HIJAZ=['D3','Eb3','Fs3','G3','A3','Bb3','C4','D4','Eb4','Fs4','G4','A4'];
 const def={on:true,vol:.8,mus:.45,fx:.85,track:'majlis',playing:false,off:{}};
 let P=Object.assign({},def,LS.get('bm3:snd')||{});P.off=P.off||{};P.playing=false;
 let ctx=null,master,musBus,fxBus,comp,noiseBuf=null,curStop=null,curId=null;
 const ksCache={};
 const save=()=>LS.set('bm3:snd',{...P,playing:false});
 function ensure(){
  if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
   try{ctx=new C()}catch(e){return null}
   comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;
   master=ctx.createGain();musBus=ctx.createGain();fxBus=ctx.createGain();
   musBus.connect(master);fxBus.connect(master);master.connect(comp);comp.connect(ctx.destination);apply()}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx}
 function apply(){if(!ctx)return;const t=ctx.currentTime;master.gain.setTargetAtTime(P.on?P.vol:0,t,.05);musBus.gain.setTargetAtTime(P.mus*.55,t,.2);fxBus.gain.setTargetAtTime(P.fx,t,.05)}
 function noise(){if(noiseBuf)return noiseBuf;const n=ctx.sampleRate*2;noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf}
 /* Karplus–Strong: وتر منقور يشبه العود، يُحسب مسبقاً في مخزن */
 function ks(f,dur=1.8,bright=.5){const key=f.toFixed(2)+'|'+dur+'|'+bright;if(ksCache[key])return ksCache[key];
  const sr=ctx.sampleRate,N=Math.round(sr/f),len=Math.floor(sr*dur),b=ctx.createBuffer(1,len,sr),d=b.getChannelData(0);
  const buf=new Float32Array(N);for(let i=0;i<N;i++)buf[i]=(Math.random()*2-1)*(i<N*.5?1:.6);
  let p=0,last=0;const damp=.996-(1-bright)*.006;
  for(let i=0;i<len;i++){const v=buf[p];const nx=buf[(p+1)%N];const y=damp*(.5*(v+nx));d[i]=v*(i<40?i/40:1);last=y;buf[p]=y;p=(p+1)%N}
  ksCache[key]=b;return b}
 function pluck(note,t,{g=.5,dur=1.8,bright=.55,dest=fxBus,pan=0}={}){const f=typeof note==='number'?note:HZ[note];if(!f)return;
  const s=ctx.createBufferSource();s.buffer=ks(f,dur,bright);const gn=ctx.createGain();gn.gain.value=g;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600+bright*2600;
  const bd=ctx.createBiquadFilter();bd.type='peaking';bd.frequency.value=f*2.2;bd.gain.value=4;bd.Q.value=1.2;
  let node=gn;if(ctx.createStereoPanner){const pn=ctx.createStereoPanner();pn.pan.value=pan;gn.connect(pn);node=pn}
  s.connect(lp);lp.connect(bd);bd.connect(gn);node.connect(dest);s.start(t);s.stop(t+dur)}
 function tone(f,t,{type='sine',g=.3,a=.005,d=.4,dest=fxBus,f2=null}={}){const o=ctx.createOscillator(),gn=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+a);gn.gain.exponentialRampToValueAtTime(.0001,t+a+d);o.connect(gn);gn.connect(dest);o.start(t);o.stop(t+a+d+.05)}
 function nz(t,{g=.3,d=.2,type='lowpass',f=1200,q=.8,dest=fxBus,f2=null}={}){const s=ctx.createBufferSource();s.buffer=noise();const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q;
  const gn=ctx.createGain();gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(gn);gn.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+d+.05)}
 function bell(f,t,{g=.35,d=3.2,dest=fxBus}={}){[[1,1],[2.76,.5],[5.4,.28],[8.93,.16],[.5,.22]].forEach(([r,a],i)=>tone(f*r,t,{g:g*a,a:.002,d:d/(1+i*.6),dest}));nz(t,{g:g*.4,d:.05,type:'highpass',f:3000,dest})}
 function daf(t,{g=.5,dest=musBus,slap=false}={}){tone(slap?180:72,t,{g:g*(slap?.35:1),a:.002,d:slap?.12:.42,f2:slap?120:48,dest});nz(t,{g:g*(slap?.5:.18),d:slap?.09:.05,type:'bandpass',f:slap?2600:900,q:1.4,dest})}

 const FX={
  place:{n:'وضع البطاقة',d:'ارتطام البطاقة بفتحتها على اللوحة',f(t){tone(110,t,{g:.55,a:.002,d:.22,f2:46});nz(t,{g:.38,d:.12,f:1700,f2:300});nz(t+.04,{g:.12,d:.06,type:'highpass',f:4200})}},
  flip:{n:'قلب البطاقة',d:'حفيف الورق حين تطير البطاقة',f(t){nz(t,{g:.22,d:.28,type:'bandpass',f:900,f2:5200,q:.7})}},
  select:{n:'اختيار إجابة',d:'نقرة وتر خفيفة عند انتقاء بطاقة',f(t){pluck('A4',t,{g:.28,dur:.7,bright:.8})}},
  hop:{n:'حركة البيدق',d:'خطوة القطعة بين الفتحات',f(t){tone(620,t,{type:'triangle',g:.18,a:.002,d:.07,f2:900});tone(330,t+.07,{type:'triangle',g:.12,a:.002,d:.08})}},
  gold:{n:'القرار الذهبي',d:'رنين ذهبي لبطاقات الإجماع الثلاث',f(t){['D4','Fs4','A4','D5'].forEach((n,i)=>bell(HZ[n],t+i*.09,{g:.16,d:2.4}));tone(1760,t+.3,{g:.05,d:1.2})}},
  tick:{n:'عدّ الثواني الأخيرة',d:'طرقة خشبية في آخر عشر ثوانٍ',f(t){tone(1250,t,{type:'square',g:.06,a:.001,d:.035});tone(2500,t,{g:.05,a:.001,d:.02})}},
  warn:{n:'تنبيه ٣٠ ثانية',d:'إشارة هادئة أن الوقت يقترب',f(t){tone(660,t,{type:'triangle',g:.22,d:.25});tone(880,t+.18,{type:'triangle',g:.2,d:.35})}},
  bell:{n:'جرس انتهاء الوقت',d:'جرس الدقائق الثلاث — التأجيل ممنوع',f(t){bell(523.25,t,{g:.42,d:3.6});bell(523.25,t+.55,{g:.3,d:3})}},
  stage:{n:'اكتمال محور',d:'جملة عود على مقام الحجاز وبتلة تعود للزهرة',f(t){['D3','Fs3','A3','D4','Eb4','D4'].forEach((n,i)=>pluck(n,t+i*.12,{g:.5,dur:2,pan:(i%2?.2:-.2)}));daf(t,{g:.45,dest:fxBus});daf(t+.36,{g:.3,dest:fxBus,slap:true});nz(t+.5,{g:.1,d:.8,type:'bandpass',f:400,f2:3000})}},
  conflict:{n:'كرت التعارض',d:'نبضة متوترة حين يتصادم قراران',f(t){tone(146.83,t,{type:'sawtooth',g:.12,a:.02,d:.6});tone(207.65,t,{type:'sawtooth',g:.1,a:.02,d:.6});tone(146.83,t+.32,{type:'sawtooth',g:.1,a:.02,d:.5});nz(t,{g:.15,d:.3,type:'bandpass',f:300,q:3})}},
  finale:{n:'اكتمال الخريطة',d:'ختام الجلسة: الزهرة تكتمل',f(t){const m=['D3','A3','D4','Fs4','G4','A4','Bb4','A4','G4','Fs4','D4'];m.forEach((n,i)=>pluck(n,t+i*.14,{g:.5,dur:2.2,pan:Math.sin(i)*.4}));[0,.56,1.12].forEach(x=>daf(t+x,{g:.45,dest:fxBus}));['D4','A4','D5'].forEach((n,i)=>bell(HZ[n],t+1.6+i*.12,{g:.14,d:3}))}},
  open:{n:'فتح بطاقة',d:'انتقال إلى سؤال جديد',f(t){pluck('D4',t,{g:.22,dur:.9,bright:.7});pluck('A4',t+.06,{g:.16,dur:.9,bright:.7})}}
 };
 function play(id){if(!P.on||P.off[id])return;if(!ensure())return;const e=FX[id];if(e)try{e.f(ctx.currentTime+.01)}catch(err){}}
 function preview(id){const was=P.off[id];P.off[id]=false;const on=P.on;P.on=true;apply();ensure();FX[id].f(ctx.currentTime+.01);P.off[id]=was;P.on=on;setTimeout(apply,10)}

 /* ---------- المسارات الخلفية ---------- */
 function loopNoise(dest){const s=ctx.createBufferSource();s.buffer=noise();s.loop=true;s.connect(dest);s.start();return s}
 const TRACKS={
  majlis:{n:'مجلس',d:'عود على مقام الحجاز ودفّ بعيد — دفء الطاولة الخليجية',c:'#B07A00',ic:'coffee',start(out){
   const dr=ctx.createGain();dr.gain.value=0;dr.connect(out);dr.gain.linearRampToValueAtTime(.12,ctx.currentTime+3);
   const o1=ctx.createOscillator(),o2=ctx.createOscillator();o1.type='triangle';o2.type='sine';o1.frequency.value=HZ.D2;o2.frequency.value=HZ.A2;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;o1.connect(lp);o2.connect(lp);lp.connect(dr);o1.start();o2.start();
   let alive=true,idx=4,beat=0;const step=()=>{if(!alive)return;const t=ctx.currentTime+.05;
    if(Math.random()<.78){idx=Math.max(0,Math.min(HIJAZ.length-1,idx+[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)]));pluck(HIJAZ[idx],t,{g:.42,dur:2.2,bright:.45,dest:out,pan:(Math.random()-.5)*.6});
     if(Math.random()<.25)pluck(HIJAZ[Math.max(0,idx-2)],t+.18,{g:.25,dur:1.6,dest:out})}
    if(beat%4===0)daf(t,{g:.32,dest:out});else if(beat%4===2&&Math.random()<.6)daf(t,{g:.2,dest:out,slap:true});
    beat++;setTimeout(step,[560,560,840,1120][Math.floor(Math.random()*4)])};step();
   return()=>{alive=false;dr.gain.setTargetAtTime(0,ctx.currentTime,.4);setTimeout(()=>{try{o1.stop();o2.stop()}catch(e){}},1500)}}},
  focus:{n:'تركيز',d:'وسادة صوتية دافئة تتنفس ببطء — للنقاش العميق',c:'#3F72B5',ic:'lightbulb',start(out){
   const g=ctx.createGain();g.gain.value=0;g.connect(out);g.gain.linearRampToValueAtTime(.16,ctx.currentTime+4);
   const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.5;lp.connect(g);
   const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=420;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
   const CH=[[146.83,220,293.66,349.23],[130.81,196,261.63,329.63],[116.54,174.61,233.08,293.66],[130.81,196,261.63,392]];
   const os=[];for(let i=0;i<4;i++)for(const dt of[-4,4]){const o=ctx.createOscillator();o.type=i<2?'sawtooth':'triangle';o.detune.value=dt;o.frequency.value=CH[0][i];const og=ctx.createGain();og.gain.value=.05;o.connect(og);og.connect(lp);o.start();os.push([o,i])}
   let c=0,alive=true;const iv=setInterval(()=>{if(!alive)return;c=(c+1)%CH.length;const t=ctx.currentTime;os.forEach(([o,i])=>o.frequency.setTargetAtTime(CH[c][i],t,1.2))},9000);
   return()=>{alive=false;clearInterval(iv);g.gain.setTargetAtTime(0,ctx.currentTime,.5);setTimeout(()=>{os.forEach(([o])=>{try{o.stop()}catch(e){}});try{lfo.stop()}catch(e){}},2000)}}},
  desert:{n:'ليل الصحراء',d:'ريح تتحرك وأجراس متفرقة تحت سماء مفتوحة',c:'#C2528C',ic:'moon',start(out){
   const g=ctx.createGain();g.gain.value=0;g.connect(out);g.gain.linearRampToValueAtTime(.5,ctx.currentTime+4);
   const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;bp.frequency.value=500;bp.connect(g);const s=loopNoise(bp);
   
   let alive=true;const wind=()=>{if(!alive)return;bp.frequency.setTargetAtTime(250+Math.random()*900,ctx.currentTime,2.5);g.gain.setTargetAtTime(.25+Math.random()*.35,ctx.currentTime,2);setTimeout(wind,3000)};wind();
   const o=ctx.createOscillator();o.frequency.value=HZ.D2;const og=ctx.createGain();og.gain.value=.05;o.connect(og);og.connect(out);o.start();
   const ch=()=>{if(!alive)return;if(Math.random()<.6)bell([HZ.D5,HZ.A4,HZ.Fs4,1174.66][Math.floor(Math.random()*4)],ctx.currentTime+.05,{g:.05,d:4,dest:out});setTimeout(ch,2500+Math.random()*5000)};setTimeout(ch,2000);
   return()=>{alive=false;g.gain.setTargetAtTime(0,ctx.currentTime,.5);og.gain.setTargetAtTime(0,ctx.currentTime,.5);setTimeout(()=>{try{s.stop();o.stop()}catch(e){}},2000)}}},
  rain:{n:'مطر على النافذة',d:'مطر ناعم وقطرات قريبة — يعزل الطاولة عن الضجيج',c:'#1B8DB8',ic:'cloud-rain',start(out){
   const g=ctx.createGain();g.gain.value=0;g.connect(out);g.gain.linearRampToValueAtTime(.32,ctx.currentTime+3);
   const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000;hp.connect(lp);lp.connect(g);const s=loopNoise(hp);
   let alive=true;const drop=()=>{if(!alive)return;const t=ctx.currentTime+.02;const f=1800+Math.random()*2600;tone(f,t,{g:.05+Math.random()*.06,a:.001,d:.05,f2:f*.55,dest:out});setTimeout(drop,60+Math.random()*420)};drop();
   return()=>{alive=false;g.gain.setTargetAtTime(0,ctx.currentTime,.5);setTimeout(()=>{try{s.stop()}catch(e){}},2000)}}},
  clock:{n:'نبض الوقت',d:'تكّات ساعة ونبض منخفض — يذكّر الطاولة أن الوقت يمضي',c:'#2E9477',ic:'timer',start(out){
   let alive=true,n=0;const step=()=>{if(!alive)return;const t=ctx.currentTime+.03;tone(n%2?1500:1150,t,{type:'square',g:.035,a:.001,d:.03,dest:out});if(n%2===0)tone(58,t,{g:.4,a:.005,d:.25,f2:44,dest:out});if(n%2===0)tone(58,t+.22,{g:.22,a:.005,d:.22,f2:44,dest:out});n++;setTimeout(step,1000)};step();
   return()=>{alive=false}}}
 };
 function startTrack(id){if(!ensure())return;stopTrack();const tr=TRACKS[id];if(!tr)return;
  const out=ctx.createGain();out.gain.value=1;out.connect(musBus);const st=tr.start(out);curStop=()=>{st();setTimeout(()=>{try{out.disconnect()}catch(e){}},2600)};curId=id;P.track=id;P.playing=true;save()}
 function stopTrack(){if(curStop){curStop();curStop=null}curId=null;P.playing=false}
 return{P,FX,TRACKS,ensure,play,preview,startTrack,stopTrack,apply:()=>{apply();save()},cur:()=>curId,save}
})();

/* ================= اللوحة ثلاثية الأبعاد ================= */
const Board=(()=>{
 const T=window.THREE;let ok=!!T;
 const R=10,N=ALLQ.length,A=2*Math.PI/N,TH0=Math.PI/2,TOP=.26,HUBR=2.7,HUBH=.32;
 const F={hub:.27,axIn:.29,axOut:.43,trIn:.45,trOut:.62,cdIn:.64,cdOut:.915,rimIn:.93,rimOut:.985};
 const SL=ALLQ.map((q,i)=>({q,i,a0:TH0+i*A,a1:TH0+(i+1)*A,am:TH0+(i+.5)*A}));const slotOf={};SL.forEach(s=>slotOf[s.q.id]=s);
 const ST=STAGES.map(s=>{const sl=SL.filter(x=>x.q.s===s);return{s,a0:sl[0].a0,a1:sl[sl.length-1].a1,am:(sl[0].a0+sl[sl.length-1].a1)/2}});
 let renderer,scene,camera,host=null,mode='hero',raf=0,lastT=0,boardCanvas,boardTex,boardMat,hubTex,tableMat,raycaster,pt,pawn,curMesh,hoverQ=null,tipEl=null;
 const slotMeshes=[],cards={},petals=[],anims=[],ripples=[],confl=[];let pawnSlot=null,pawnQueue=[],pawnAnim=null,pawnPhys=0;
 let cam={az:Math.PI/2,el:.95,dist:30,tx:0,tz:.6},camTo={...cam},userCam=false,timerMode='';
 let VS=null;let api={onPick:null};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const polar=(r,a,y=0)=>new T.Vector3(r*Math.cos(a),y,r*Math.sin(a));
 const tok=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888';
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const easeOutBack=t=>{const c1=1.4,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};

 /* ---------- canvas helpers ---------- */
 function wrap(ctx,text,maxW,maxLines=4){const words=String(text).split(/\s+/).filter(Boolean);const lines=[];let cur='';
  for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width<=maxW||!cur)cur=t;else{lines.push(cur);cur=w}}if(cur)lines.push(cur);
  if(lines.length>maxLines){const l=lines.slice(0,maxLines);l[maxLines-1]+='…';return l}return lines}
 function fitFont(ctx,text,w,h,max,min,weight,fam,lines=4){for(let f=max;f>=min;f-=2){ctx.font=`${weight} ${f}px ${fam}`;const L=wrap(ctx,text,w,lines);if(L.length*f*1.22<=h&&L.every(l=>ctx.measureText(l).width<=w*1.02))return{f,L}}ctx.font=`${weight} ${min}px ${fam}`;return{f:min,L:wrap(ctx,text,w,lines)}}
 function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
 const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
 const FD="'Baloo Bhaijaan 2','IBM Plex Sans Arabic',sans-serif",FB="'IBM Plex Sans Arabic',sans-serif",FN="'Rubik',sans-serif";

 /* ---------- the printed map, redrawn as the board top ---------- */
 function drawBoard(){const Z=2048,c=boardCanvas.getContext('2d'),H=Z/2,P=f=>f*H;
  c.clearRect(0,0,Z,Z);c.save();c.translate(H,H);
  const g=c.createRadialGradient(0,0,P(.3),0,0,H);g.addColorStop(0,'#FFFFFF');g.addColorStop(1,'#F2F5F8');c.fillStyle=g;c.beginPath();c.arc(0,0,H*.998,0,7);c.fill();
  const sector=(r0,r1,a0,a1)=>{c.beginPath();c.arc(0,0,P(r1),a0,a1);c.arc(0,0,P(r0),a1,a0,true);c.closePath()};
  const done=n=>VS&&STAGES[n-1].qs.every(q=>(VS.place[q.id]||[]).length);
  // slots
  SL.forEach((sl,i)=>{const s=sl.q.s,q=sl.q;
   sector(F.trIn,F.trOut,sl.a0,sl.a1);c.fillStyle=hexA(s.c,i%2?.16:.24);c.fill();
   sector(F.cdIn,F.cdOut,sl.a0,sl.a1);c.fillStyle=hexA(s.c,i%2?.06:.11);c.fill();
   const d=.012;sector(F.cdIn+.012,F.cdOut-.01,sl.a0+d,sl.a1-d);c.setLineDash(q.gold?[]:[10,8]);c.lineWidth=q.gold?5:2.5;c.strokeStyle=q.gold?'#C99A2E':hexA(s.ci,.55);c.stroke();c.setLineDash([]);
   if(q.gold){sector(F.cdIn+.022,F.cdOut-.02,sl.a0+d*1.8,sl.a1-d*1.8);c.lineWidth=2;c.strokeStyle='rgba(201,154,46,.5)';c.stroke()}
   c.strokeStyle='#DDE3EA';c.lineWidth=2;c.beginPath();c.moveTo(P(F.trIn)*Math.cos(sl.a0),P(F.trIn)*Math.sin(sl.a0));c.lineTo(P(F.cdOut)*Math.cos(sl.a0),P(F.cdOut)*Math.sin(sl.a0));c.stroke();
   // label (tangential lines, upright when viewed from outside the slot)
   const rm=P((F.cdIn+F.cdOut)/2+.01);c.save();c.rotate(sl.am);c.translate(rm,0);c.rotate(Math.PI/2);c.rotate(Math.PI);
   c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle=s.ci;
   const ft=fitFont(c,q.slot,P(.7)*A*.86,P(F.cdOut-F.cdIn)*.72,34,20,700,FB,4);
   ft.L.forEach((l,j)=>c.fillText(l,0,(j-(ft.L.length-1)/2)*ft.f*1.2));
   if(q.gold){c.font=`700 22px ${FN}`;c.fillStyle='#B8871F';c.fillText('★',0,-P(.12))}
   c.restore();
   // Q number on the track
   c.save();c.rotate(sl.am);c.translate(P(.535),0);c.rotate(-Math.PI/2);
   c.fillStyle=s.ci;c.beginPath();c.arc(0,0,27,0,7);c.fill();c.fillStyle='#fff';c.font=`700 21px ${FN}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText('Q'+q.no,0,1);c.restore();
  });
  // rim band per stage
  ST.forEach(t=>{sector(F.rimIn,F.rimOut,t.a0+.006,t.a1-.006);c.fillStyle=t.s.c;c.fill()});
  SL.forEach(sl=>{if(sl.q.gold){c.save();c.rotate(sl.am);c.translate(P((F.rimIn+F.rimOut)/2),0);c.fillStyle='#FFF4CF';c.beginPath();c.arc(0,0,11,0,7);c.fill();c.restore()}});
  // axis band
  ST.forEach(t=>{const s=t.s;sector(F.axIn,F.axOut,t.a0+.012,t.a1-.012);c.fillStyle=done(s.n)?s.ci:s.c;c.fill();
   c.save();c.rotate(t.am);c.translate(P((F.axIn+F.axOut)/2),0);c.rotate(-Math.PI/2);c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';
   const span=(t.a1-t.a0)*P(.36)*.9;let fs=46;c.font=`800 ${fs}px ${FD}`;while(c.measureText(s.name).width>span-60&&fs>26){fs-=2;c.font=`800 ${fs}px ${FD}`}
   c.fillText(s.name,-14,-14);c.font=`600 ${Math.min(24,fs*.55)}px ${FB}`;c.globalAlpha=.92;c.fillText(s.ask,-14,26);c.globalAlpha=1;
   const w=c.measureText(s.name).width;c.font=`800 ${fs}px ${FD}`;const nw=c.measureText(s.name).width;
   c.beginPath();c.arc(nw/2+14,-14,22,0,7);c.fillStyle='rgba(255,255,255,.95)';c.fill();c.fillStyle=s.ci;c.font=`700 24px ${FN}`;c.direction='ltr';c.fillText(s.n,nw/2+14,-12);c.restore()});
  // start marker
  c.save();c.rotate(TH0);c.strokeStyle='#D63446';c.lineWidth=5;c.beginPath();c.moveTo(P(F.trIn-.01),0);c.lineTo(P(F.rimOut),0);c.stroke();
  c.translate(P(F.rimOut)-26,0);c.fillStyle='#D63446';c.beginPath();c.arc(0,0,24,0,7);c.fill();c.rotate(-Math.PI/2);c.fillStyle='#fff';c.font=`700 17px ${FB}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('ابدأ',0,1);c.restore();
  c.restore();if(boardTex)boardTex.needsUpdate=true}
 function drawHub(){const Z=1024,cv=document.createElement('canvas');cv.width=cv.height=Z;const c=cv.getContext('2d'),H=Z/2;
  const g=c.createRadialGradient(H,H,40,H,H,H);g.addColorStop(0,'#2E4258');g.addColorStop(1,'#1D2C3C');c.fillStyle=g;c.beginPath();c.arc(H,H,H,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=4;c.setLineDash([12,10]);
  ST.forEach(t=>{const a=t.am,hw=Math.PI/8.8,r1=.45/HUBR*H,r2=2.35/HUBR*H;c.beginPath();c.arc(H,H,r2,a-hw,a+hw);c.arc(H,H,r1,a+hw,a-hw,true);c.closePath();c.stroke()});
  c.setLineDash([]);c.fillStyle='rgba(255,255,255,.5)';c.font=`600 34px ${FB}`;c.textAlign='center';c.direction='rtl';
  const img=new Image();img.onload=()=>{c.globalAlpha=.18;c.drawImage(img,H-150,H-142,300,284);c.globalAlpha=1;if(hubTex)hubTex.needsUpdate=true};img.src=LOGO;
  return cv}

 /* ---------- card face ---------- */
 function cardFace(q,k,vs){const W=256,H=390,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d'),s=q.s,gold=!!q.gold;
  const a=AK(q,k)||{};const title=vs===S?ansTitle(q,k):((a.pre?a.pre+' ':'')+(a.t||q.slot)).replace(/ـ+/g,'');
  rrect(c,3,3,W-6,H-6,22);c.fillStyle='#FFFFFF';c.fill();c.lineWidth=7;
  if(gold){const gg=c.createLinearGradient(0,0,W,H);gg.addColorStop(0,'#F3D27C');gg.addColorStop(.5,'#C99A2E');gg.addColorStop(1,'#F0CF73');c.strokeStyle=gg}else c.strokeStyle=s.ci;c.stroke();
  c.save();rrect(c,3,3,W-6,H-6,22);c.clip();c.fillStyle=gold?'#C99A2E':s.ci;c.fillRect(0,0,W,70);c.restore();
  c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.font=`700 24px ${FN}`;c.fillText(qcode(q),W/2,26);
  c.direction='rtl';c.font=`600 17px ${FB}`;c.fillText(q.slot,W/2,52);
  if(a.col){c.fillStyle=a.col;rrect(c,40,92,W-80,120,16);c.fill();c.strokeStyle='#DDE3EA';c.lineWidth=2;c.stroke()}
  const ty=a.col?248:96,th=a.col?70:176;
  c.fillStyle=gold?'#7A5A10':s.ci;const ft=fitFont(c,title||'—',W-44,th,40,18,800,FD,4);
  ft.L.forEach((l,j)=>c.fillText(l,W/2,ty+th/2+(j-(ft.L.length-1)/2)*ft.f*1.18));
  // footer: confidence + time
  const conf=(vs.conf||{})[q.id]||0,tm=(vs.times||{})[q.id],doubt=(vs.doubt||{})[q.id];
  c.strokeStyle='#E6EBF0';c.lineWidth=2;c.beginPath();c.moveTo(20,300);c.lineTo(W-20,300);c.stroke();
  for(let i=1;i<=5;i++){c.beginPath();c.arc(W/2+(i-3)*24,326,8,0,7);c.fillStyle=i<=conf?CL[conf].c:'#E6EBF0';c.fill()}
  if(tm){const over=tm.s>tm.d;c.fillStyle=over?'#C9302C':'#1F7D63';rrect(c,W/2-56,346,112,32,16);c.fill();c.fillStyle='#fff';c.font=`700 19px ${FN}`;c.direction='ltr';c.fillText('⏱ '+fmt(tm.s),W/2,363)}
  if(doubt){c.fillStyle='#E58A12';c.beginPath();c.arc(W-30,98,20,0,7);c.fill();c.fillStyle='#fff';c.font=`800 26px ${FB}`;c.fillText('؟',W-30,100)}
  const tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tx}
 function makeCard(q,k,vs){const geo=new T.BoxGeometry(1.15,.04,1.75);const s=q.s;const edge=new T.MeshStandardMaterial({color:q.gold?0xD9A63A:new T.Color(s.ci),roughness:.5,metalness:q.gold?.4:0});
  const face=new T.MeshStandardMaterial({map:cardFace(q,k,vs),roughness:.62});const back=new T.MeshStandardMaterial({color:new T.Color(q.gold?'#C99A2E':s.ci),roughness:.6});
  const m=new T.Mesh(geo,[edge,edge,face,back,edge,edge]);m.castShadow=true;m.receiveShadow=true;return m}
 function cardPose(qid,idx,count){const sl=slotOf[qid];const r=R*.78+(idx-(count-1)/2)*.16;const a=sl.am+(idx-(count-1)/2)*.012;
  return{pos:polar(r,a,TOP+.03+idx*.045),rotY:Math.PI/2-sl.am+(idx-(count-1)/2)*.09}}
 function disposeMesh(m){scene.remove(m);m.geometry&&m.geometry.dispose();(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})}

 /* ---------- build scene ---------- */
 function init(){if(!ok)return false;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch(e){ok=false;return false}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.NoToneMapping;
  scene=new T.Scene();camera=new T.PerspectiveCamera(36,1,.1,300);
  scene.add(new T.HemisphereLight(0xffffff,0x8899aa,.58));
  const sun=new T.DirectionalLight(0xffffff,.82);sun.position.set(9,20,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:60});sun.shadow.bias=-.0004;scene.add(sun);
  const fill=new T.DirectionalLight(0xdfe8ff,.32);fill.position.set(-12,9,-8);scene.add(fill);
  tableMat=new T.MeshStandardMaterial({color:0x888888,roughness:.95});const table=new T.Mesh(new T.CircleGeometry(90,64),tableMat);table.rotation.x=-Math.PI/2;table.position.y=-.32;table.receiveShadow=true;scene.add(table);
  const body=new T.Mesh(new T.CylinderGeometry(R,R*1.012,.56,160),new T.MeshStandardMaterial({color:0x24364A,roughness:.55,metalness:.1}));body.position.y=TOP-.29;body.castShadow=true;body.receiveShadow=true;scene.add(body);
  const lip=new T.Mesh(new T.TorusGeometry(R,.06,10,180),new T.MeshStandardMaterial({color:0xD9A63A,roughness:.3,metalness:.6}));lip.rotation.x=Math.PI/2;lip.position.y=TOP-.01;scene.add(lip);
  boardCanvas=document.createElement('canvas');boardCanvas.width=boardCanvas.height=2048;drawBoard();
  boardTex=new T.CanvasTexture(boardCanvas);boardTex.encoding=T.sRGBEncoding;boardTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  boardMat=new T.MeshStandardMaterial({map:boardTex,roughness:.82});const top=new T.Mesh(new T.CircleGeometry(R*.999,160),boardMat);top.rotation.x=-Math.PI/2;top.position.y=TOP;top.receiveShadow=true;scene.add(top);
  hubTex=new T.CanvasTexture(drawHub());hubTex.encoding=T.sRGBEncoding;
  const hub=new T.Mesh(new T.CylinderGeometry(HUBR,HUBR*1.03,HUBH,96),[new T.MeshStandardMaterial({color:0x1D2C3C,roughness:.5}),new T.MeshStandardMaterial({map:hubTex,roughness:.6}),new T.MeshStandardMaterial({color:0x1D2C3C})]);
  hub.position.y=TOP+HUBH/2;hub.castShadow=true;hub.receiveShadow=true;scene.add(hub);
  const cap=new T.Mesh(new T.CylinderGeometry(.36,.4,.16,40),new T.MeshStandardMaterial({color:0xD9A63A,roughness:.28,metalness:.65}));cap.position.y=TOP+HUBH+.08;cap.castShadow=true;scene.add(cap);
  // slot hit areas
  SL.forEach(sl=>{const geo=new T.RingGeometry(R*F.trIn,R*F.cdOut,6,1,-sl.a1,A);const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:new T.Color(sl.q.s.ci),transparent:true,opacity:0,depthWrite:false}));
   m.rotation.x=-Math.PI/2;m.position.y=TOP+.012;m.userData.qid=sl.q.id;scene.add(m);slotMeshes.push(m)});
  curMesh=new T.Mesh(new T.RingGeometry(R*F.trIn,R*F.cdOut,6,1,0,A),new T.MeshBasicMaterial({color:0xD9A63A,transparent:true,opacity:0,depthWrite:false}));curMesh.rotation.x=-Math.PI/2;curMesh.position.y=TOP+.016;scene.add(curMesh);
  // petals
  const r1=.45,r2=2.35,hw=Math.PI/8.8;const sh=new T.Shape();sh.absarc(0,0,r2,-hw,hw,false);sh.absarc(0,0,r1,hw,-hw,true);
  const pg=new T.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:4,curveSegments:24});pg.computeBoundingBox();const cx=(pg.boundingBox.min.x+pg.boundingBox.max.x)/2;pg.translate(-cx,0,0);
  ST.forEach((t,i)=>{const mat=new T.MeshStandardMaterial({color:new T.Color(t.s.c),roughness:.4,metalness:.05,transparent:true,opacity:.16,depthWrite:false,emissive:new T.Color(t.s.ci),emissiveIntensity:.0});
   const m=new T.Mesh(pg,mat);m.rotation.x=-Math.PI/2;m.castShadow=true;const g=new T.Group();g.add(m);scene.add(g);
   const p={g,m,mat,t,home:{pos:polar(cx,t.am,TOP+HUBH+.02),rot:-t.am,sc:1},wait:{pos:polar(cx,t.am,TOP+HUBH-.06),rot:-t.am,sc:.96},band:{pos:polar(R*.36,t.am,TOP+.5),rot:-t.am,sc:.55},state:'wait',phase:i*.8};
   g.position.copy(p.wait.pos);g.rotation.y=p.wait.rot;g.scale.setScalar(p.wait.sc);petals.push(p)});
  // pawn
  const pts=[[0,0],[.44,0],[.46,.06],[.42,.13],[.26,.22],[.17,.44],[.14,.64],[.25,.68],[.27,.72],[.14,.77],[0,.77]].map(p=>new T.Vector2(p[0],p[1]));
  const pm=new T.MeshStandardMaterial({color:0xE2B54A,roughness:.3,metalness:.45,emissive:0x3a2a05,emissiveIntensity:.25});
  pawn=new T.Group();const pb=new T.Mesh(new T.LatheGeometry(pts,40),pm);pb.castShadow=true;const ph=new T.Mesh(new T.SphereGeometry(.24,32,24),pm);ph.position.y=.96;ph.castShadow=true;pawn.add(pb,ph);pawn.scale.setScalar(1.05);
  pawn.position.copy(polar(R*.535,SL[0].am,TOP));scene.add(pawn);pawnSlot=SL[0].q.id;
  raycaster=new T.Raycaster();pt=new T.Vector2();
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load(`700 30px 'IBM Plex Sans Arabic'`),document.fonts.load(`800 30px 'Baloo Bhaijaan 2'`),document.fonts.load(`700 20px 'Rubik'`)]).then(()=>{drawBoard();refreshFaces()}).catch(()=>{})}
  bindInput();document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop()});
  return true}
 function applyTheme(){if(!ok||!scene)return;const bg=new T.Color(tok('--table'));scene.background=bg;scene.fog=new T.Fog(bg,40,110);tableMat.color=new T.Color(tok('--table2'))}

 /* ---------- input: orbit + pick ---------- */
 function bindInput(){const el=renderer.domElement;const ptrs=new Map();let down=null,pinch=0;
  el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY,t:Date.now(),moved:0};if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}});
  el.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p){hover(e);return}
   if(ptrs.size===2){p.x=e.clientX;p.y=e.clientY;const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch){camTo.dist=Math.max(8,Math.min(48,camTo.dist*pinch/d));userCam=true}pinch=d;return}
   const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(down)down.moved+=Math.abs(dx)+Math.abs(dy);
   if(down&&down.moved>6){camTo.az-=dx*.006;camTo.el=Math.max(.38,Math.min(1.42,camTo.el+dy*.004));userCam=true;if(mode==='hero')heroIdle=performance.now()}});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=0;if(down&&down.moved<=6&&Date.now()-down.t<600&&ptrs.size===0){const q=pick(e);if(q&&api.onPick)api.onPick(q)}if(ptrs.size===0)down=null};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);down=null});
  el.addEventListener('pointerleave',()=>{setHover(null)});
  el.addEventListener('wheel',e=>{if(mode==='hero')return;e.preventDefault();camTo.dist=Math.max(8,Math.min(48,camTo.dist*(1+e.deltaY*.0012)));userCam=true},{passive:false})}
 let heroIdle=0;
 function pick(e){const r=renderer.domElement.getBoundingClientRect();pt.x=((e.clientX-r.left)/r.width)*2-1;pt.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pt,camera);const h=raycaster.intersectObjects(slotMeshes);return h.length?h[0].object.userData.qid:null}
 function hover(e){if(mode!=='play')return;const q=pick(e);setHover(q,e)}
 function setHover(qid,e){slotMeshes.forEach(m=>m.material.opacity=m.userData.qid===qid?.16:0);hoverQ=qid;renderer.domElement.style.cursor=qid?'pointer':'grab';
  if(!tipEl)return;if(!qid||!e){tipEl.hidden=true;return}const q=Q[qid],r=host.getBoundingClientRect();const a=VS&&(VS.place[qid]||[]).length?ansSummary(q):'لم تُحسم بعد';
  tipEl.innerHTML=`${esc(q.s.name)} · Q${q.no} ${esc(q.slot)}<small>${esc(a)}</small>`;tipEl.style.left=(e.clientX-r.left)+'px';tipEl.style.top=(e.clientY-r.top)+'px';tipEl.hidden=false}

 /* ---------- camera ---------- */
 function fitDist(){const w=host?host.clientWidth:800,h=host?host.clientHeight:600,asp=w/Math.max(1,h);return mode==='hero'?Math.max(25.5,31/asp)*1.02:Math.max(29,35/asp)}
 function overview(stageN){userCam=false;const am=stageN?ST[stageN-1].am:Math.PI/2;if(mode==='hero'){camTo={az:camTo.az,el:.98,dist:fitDist(),tx:0,tz:0};return}
 const w=host?host.clientWidth:800,h=host?host.clientHeight:600,asp=w/Math.max(1,h),t=Math.tan(18*Math.PI/180),el=asp>1.8?.8:.98;
 const dv=(10*Math.sin(el)+1.3)/t,dh=10.8/(t*asp);camTo={az:am,el,dist:Math.max(dv*.94,dh),tx:Math.cos(am)*1.2,tz:Math.sin(am)*1.2}}
 function focus(qid,{instant=false}={}){const sl=slotOf[qid];if(!sl)return;userCam=false;const w=host?host.clientWidth:800,h=host?host.clientHeight:600;const asp=w/Math.max(1,h);
  const tr=R*.6;camTo={az:sl.am,el:.98,dist:Math.max(14.5,17.5/Math.min(1.4,asp)),tx:tr*Math.cos(sl.am),tz:tr*Math.sin(sl.am)};
  if(instant)Object.assign(cam,camTo);
  curMesh.geometry.dispose();curMesh.geometry=new T.RingGeometry(R*F.trIn,R*F.cdOut,6,1,-sl.a1,A);curMesh.material.color=new T.Color(sl.q.s.ci);
  movePawn(qid)}
 function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
 function updCam(dt){const k=1-Math.exp(-dt*(reduce?30:2.6));
  if(mode==='hero'&&performance.now()-heroIdle>2500)camTo.az+=dt*.07;
  cam.az+=angDiff(camTo.az,cam.az)*k;cam.el+=(camTo.el-cam.el)*k;cam.dist+=(camTo.dist-cam.dist)*k;cam.tx+=(camTo.tx-cam.tx)*k;cam.tz+=(camTo.tz-cam.tz)*k;
  const ce=Math.cos(cam.el);camera.position.set(cam.tx+cam.dist*ce*Math.cos(cam.az),cam.dist*Math.sin(cam.el),cam.tz+cam.dist*ce*Math.sin(cam.az));camera.lookAt(cam.tx,0,cam.tz)}

 /* ---------- pawn ---------- */
 function movePawn(qid){if(!pawn||qid===pawnSlot)return;const from=SL[pawnAnim?pawnAnim.toI:pawnPhys],to=slotOf[qid];let d=to.i-from.i;if(Math.abs(d)>N/2)d=d>0?d-N:d+N;
  const steps=Math.abs(d),dir=Math.sign(d);pawnQueue=[];
  if(reduce||steps===0){if(!pawnAnim){pawn.position.copy(polar(R*.535,to.am,TOP));pawnPhys=to.i}pawnSlot=qid;return}
  const hops=Math.min(steps,7);for(let h=1;h<=hops;h++){const idx=from.i+dir*Math.round(steps*h/hops);pawnQueue.push(SL[(idx%N+N)%N])}
  pawnSlot=qid;if(!pawnAnim)nextHop()}
 function nextHop(){const to=pawnQueue.shift();if(!to){pawnAnim=null;return}const p0=pawn.position.clone();const p1=polar(R*.535,to.am,TOP);
  pawnAnim={t:0,dur:pawnQueue.length?.2:.32,p0,p1,toI:to.i,end:()=>{pawnPhys=to.i;SND.play('hop');nextHop()}}}

 /* ---------- sync state → scene ---------- */
 function sig(q,k,vs){const tm=(vs.times||{})[q.id];return [k,(vs.conf||{})[q.id]||0,(vs.doubt||{})[q.id]?1:0,tm?tm.s+'/'+tm.d:'',vs===S?ansTitle(q,k):''].join('|')}
 function sync(vs,{animate=false}={}){if(!ok||!scene)return;const prevVS=VS;VS=vs;let stageChanged=false;
  ALLQ.forEach(q=>{const keys=(vs.place&&vs.place[q.id])||[];const ex=cards[q.id]||{keys:[],meshes:[],sigs:[]};
   const sameKeys=ex.keys.join(',')===keys.join(',');
   if(sameKeys){keys.forEach((k,i)=>{const s=sig(q,k,vs);if(ex.sigs[i]!==s){const m=ex.meshes[i];const mat=m.material[2];if(mat.map)mat.map.dispose();mat.map=cardFace(q,k,vs);mat.needsUpdate=true;ex.sigs[i]=s}});return}
   ex.meshes.forEach(m=>fadeOut(m));const meshes=keys.map((k,i)=>{const m=makeCard(q,k,vs);const pose=cardPose(q.id,i,keys.length);
    if(animate&&!ex.keys.includes(k))flyIn(m,pose,i*.18,q);else{m.position.copy(pose.pos);m.rotation.set(0,pose.rotY,0);scene.add(m)}return m});
   cards[q.id]={keys:keys.slice(),meshes,sigs:keys.map(k=>sig(q,k,vs))}});
  ST.forEach((t,i)=>{const d=t.s.qs.every(q=>((vs.place||{})[q.id]||[]).length);const p=petals[i];if(d&&p.state!=='home'){stageChanged=true;if(animate)flyPetal(p);else setPetal(p,'home')}else if(!d&&p.state==='home'){stageChanged=true;setPetal(p,'wait')}});
  if(stageChanged||!prevVS)drawBoard();
  buildConflicts(vs);
  if(vs.cur&&mode==='play'&&vs.cur!==pawnSlot)movePawn(vs.cur)}
 function refreshFaces(){if(!VS)return;Object.keys(cards).forEach(id=>{const c=cards[id];c.sigs=c.sigs.map(()=>'')});sync(VS)}
 function fadeOut(m){anims.push({t:0,dur:.35,f:(p)=>{m.position.y+=.02;m.material.forEach(x=>{x.transparent=true;x.opacity=1-p})},end:()=>disposeMesh(m)})}
 function flyIn(m,pose,delay,q){const start=camera.position.clone().lerp(pose.pos,.62);start.y=Math.max(start.y*.6,5);m.position.copy(start);m.rotation.set(Math.PI,pose.rotY+1.2,.4);scene.add(m);
  const ctrl=start.clone().lerp(pose.pos,.5);ctrl.y=Math.max(start.y,pose.pos.y)+2.5;let flipped=false;
  anims.push({t:-delay,dur:reduce?.01:.95,f:(p)=>{if(!flipped&&p>0){flipped=true;SND.play('flip')}const e=ease(p),u=1-e;
   m.position.set(u*u*start.x+2*u*e*ctrl.x+e*e*pose.pos.x,u*u*start.y+2*u*e*ctrl.y+e*e*pose.pos.y,u*u*start.z+2*u*e*ctrl.z+e*e*pose.pos.z);
   m.rotation.x=Math.PI*(1-e);m.rotation.y=pose.rotY+1.2*(1-e);m.rotation.z=.4*(1-e)},
   end:()=>{m.position.copy(pose.pos);m.rotation.set(0,pose.rotY,0);SND.play(q.gold?'gold':'place');ripple(pose.pos,q.gold?0xD9A63A:new T.Color(q.s.ci))}})}
 function ripple(pos,color){const m=new T.Mesh(new T.RingGeometry(.5,.62,64),new T.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.copy(pos);m.position.y=TOP+.05;scene.add(m);
  anims.push({t:0,dur:1,f:p=>{m.scale.setScalar(1+p*3.5);m.material.opacity=.85*(1-p)},end:()=>disposeMesh(m)})}
 function setPetal(p,st){p.state=st;const s=p[st];p.g.position.copy(s.pos);p.g.rotation.y=s.rot;p.g.scale.setScalar(s.sc);p.mat.opacity=st==='home'?1:.16;p.mat.depthWrite=st==='home';p.mat.emissiveIntensity=0;p.m.castShadow=st==='home'}
 function flyPetal(p){p.state='flying';const a=p.band,b=p.home;p.g.position.copy(a.pos);p.g.scale.setScalar(a.sc);p.mat.depthWrite=true;p.m.castShadow=true;const p0=a.pos.clone(),ctrl=p0.clone().lerp(b.pos,.5);ctrl.y+=5.5;SND.play('stage');
  anims.push({t:-.6,dur:reduce?.01:1.7,f:(t)=>{const e=ease(t),u=1-e;p.g.position.set(u*u*p0.x+2*u*e*ctrl.x+e*e*b.pos.x,u*u*p0.y+2*u*e*ctrl.y+e*e*b.pos.y,u*u*p0.z+2*u*e*ctrl.z+e*e*b.pos.z);
   p.g.rotation.y=a.rot+(b.rot-a.rot)*e+Math.PI*2*e;p.g.scale.setScalar(a.sc+(b.sc-a.sc)*e);p.mat.opacity=Math.min(1,.2+t*3);p.mat.emissiveIntensity=.6*Math.sin(Math.PI*t)},
   end:()=>{setPetal(p,'home');ripple(new T.Vector3(0,TOP+HUBH,0),new T.Color(p.t.s.ci))}})}
 function buildConflicts(vs){confl.forEach(disposeMesh);confl.length=0;if(vs!==S)return;
  activeConflicts().filter(c=>!resolved(c)).forEach(c=>{const b=c.b.find(x=>has(...x));const pa=slotOf[c.a[0]],pb=slotOf[b[0]];if(!pa||!pb)return;
   const A0=polar(R*.78,pa.am,TOP+.3),B0=polar(R*.78,pb.am,TOP+.3),mid=A0.clone().lerp(B0,.5);mid.y=4.2;mid.multiplyScalar(1);
   const tube=new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(A0,mid,B0),48,.06,8,false),new T.MeshBasicMaterial({color:0xD93A36,transparent:true,opacity:.8}));scene.add(tube);confl.push(tube);
   const card=new T.Mesh(new T.BoxGeometry(.7,1.05,.04),new T.MeshStandardMaterial({color:0xD93A36,emissive:0x5a0f0d,emissiveIntensity:.5}));const ap=new T.Vector3(.25*A0.x+.5*mid.x+.25*B0.x,.25*A0.y+.5*mid.y+.25*B0.y+.6,.25*A0.z+.5*mid.z+.25*B0.z);card.position.copy(ap);card.userData.spin=1;card.castShadow=true;scene.add(card);confl.push(card)})}

 /* ---------- finale ---------- */
 function finale(){if(!ok)return;overview();const n=420,geo=new T.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3),vel=[];
  const cols=STAGES.map(s=>new T.Color(s.c));for(let i=0;i<n;i++){pos[i*3]=0;pos[i*3+1]=TOP+HUBH+.3;pos[i*3+2]=0;const a=Math.random()*Math.PI*2,sp=2+Math.random()*7;vel.push([Math.cos(a)*sp,6+Math.random()*9,Math.sin(a)*sp]);const c=cols[i%8];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',new T.BufferAttribute(col,3));const pts=new T.Points(geo,new T.PointsMaterial({size:.32,vertexColors:true,transparent:true,opacity:1}));scene.add(pts);
  anims.push({t:0,dur:3.2,f:(p,dt)=>{for(let i=0;i<n;i++){vel[i][1]-=14*dt;pos[i*3]+=vel[i][0]*dt;pos[i*3+1]=Math.max(TOP,pos[i*3+1]+vel[i][1]*dt);pos[i*3+2]+=vel[i][2]*dt}geo.attributes.position.needsUpdate=true;pts.material.opacity=1-p*p},end:()=>disposeMesh(pts)})}

 /* ---------- loop ---------- */
 function resize(){if(!host||!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(!userCam&&mode==='hero')camTo.dist=fitDist()}
 function loop(){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
 function frame(now){if(!host||!host.isConnected||document.hidden||!host.getClientRects().length||(mode==='play'&&ui.boardMode==='2d')){raf=0;return}
  const dt=Math.min(.05,(now-(lastT||now))/1000);lastT=now;updCam(dt);
  for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t+=dt;if(a.t<0)continue;const p=Math.min(1,a.t/a.dur);a.f(p,dt);if(p>=1){anims.splice(i,1);a.end&&a.end()}}
  if(pawnAnim){const a=pawnAnim;a.t+=dt;const p=Math.min(1,a.t/a.dur);pawn.position.lerpVectors(a.p0,a.p1,p);pawn.position.y=TOP+Math.sin(Math.PI*p)*.9;if(p>=1){pawnAnim=null;a.end()}}
  const tt=now/1000;petals.forEach(p=>{if(p.state==='wait')p.mat.opacity=.12+.06*Math.sin(tt*1.6+p.phase)});
  if(curMesh)curMesh.material.opacity=mode==='play'?(timerMode==='over'?.28+.18*Math.sin(tt*9):.14+.1*Math.sin(tt*3)):0;
  if(curMesh&&mode==='play')curMesh.material.color.set(timerMode==='over'?0xD93A36:timerMode==='warn'?0xE0A23A:(slotOf[pawnSlot]?slotOf[pawnSlot].q.s.ci:0xD9A63A));
  confl.forEach(m=>{if(m.userData.spin){m.rotation.y+=dt*1.6;m.position.y+=Math.sin(tt*2)*.003}else m.material.opacity=.45+.35*Math.sin(tt*4)});
  renderer.render(scene,camera);raf=requestAnimationFrame(frame)}
 function mount(el,m){if(!ok){el.innerHTML='<div class="no3d">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز.<br>يمكنك متابعة اللعب من لوحة البطاقات.</div>';return}
  if(!renderer&&!init()){mount(el,m);return}
  host=el;mode=m;if(renderer.domElement.parentNode!==el)el.appendChild(renderer.domElement);
  tipEl=el.querySelector('.tip3d');resize();
  if(!el._ro){el._ro=new ResizeObserver(()=>resize());el._ro.observe(el)}
  if(m==='hero'){userCam=false;camTo={az:cam.az,el:.92,dist:fitDist(),tx:0,tz:0};if(!lastT)Object.assign(cam,camTo,{az:Math.PI/2+.5})}
  lastT=0;loop()}
 return{get ok(){return ok},init,mount,sync,focus,overview,finale,set onPick(f){api.onPick=f},setTimer(m){timerMode=m},redraw:()=>{if(ok&&boardCanvas)drawBoard()}}
})();

/* icons formerly injected by aichat.js / admin2.js */
Object.assign(ICONS,{bot:'<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',eraser:'<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>','clock-3':'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>','arrow-up':'<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>','arrow-down':'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>','eye-off':'<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'});
/* ---------- settings applied live ---------- */
function applySettingsLive(){applyFeatClasses();const d=cmsS().design||{};if(d.timer)DEF_TIMER=+d.timer;bump()}
/* ---------- re-render hooks: every state change bumps the version React subscribes to ---------- */
{const W=(f)=>function(...a){const r=f.apply(this,a);if(r&&typeof r.then==='function')return r.then(v=>{bump();return v});bump();return r};
 patch=W(patch);onSnap=W(onSnap);openSession=W(openSession);closeSession=W(closeSession);saveProfile=W(saveProfile);loadProfile=W(loadProfile);createSession=W(createSession);afterOpen=W(afterOpen)}
onSync(()=>bump());
/* ---------- boot: resolve runtime capabilities, content, profile and subscriptions ---------- */
let capsResolve;const capsP=new Promise(r=>capsResolve=r);
{const _o=openSession,_c=createSession;openSession=async(...a)=>{await capsP;return _o(...a)};createSession=async(...a)=>{await capsP;return _c(...a)}}
async function bootEngine(){const has=!!(window.claude&&window.claude.use);const use=n=>has?window.claude.use(n).catch(()=>null):Promise.resolve(null);
 const [db,user,dl,room,sample]=await Promise.all(['db','user','downloads','room','sample'].map(use));
 CAP={db,user,dl,room,sample};LOCAL=!db;
 if(user){try{ME.id=await user.id()}catch(e){}}
 if(!ME.id){ME.id=LS.get('bm3:me')||('L'+Math.random().toString(36).slice(2,10));LS.set('bm3:me',ME.id)}
 if(user){try{IS_ADMIN=!!(await user.canEdit())}catch(e){}try{IS_OWNER=!!(await user.isOwner())}catch(e){}}
 CAP.sample=wrapSample(CAP.sample);await cmsLoad();await loadProfile();await loadBiz();READY=true;capsResolve();bump()}
/* test/debug setter for module-level state */
function setVar(k,v){switch(k){case'IS_ADMIN':IS_ADMIN=v;break;case'IS_OWNER':IS_OWNER=v;break;case'MY_SUB':MY_SUB=v;break;case'MY_REQ':MY_REQ=v;break;case'MY_BLOCK':MY_BLOCK=v;break;case'PLANS':PLANS=v;break;case'PROFILE':PROFILE=v;break;case'CONS':CONS=v;break;case'RO':RO=v;break;case'CAP':CAP=v;break;case'LOCAL':LOCAL=v;break;case'CMS':CMS=v;break;default:throw new Error('setVar: '+k)}bump()}

export {$,$$,ADM_SECS,AI_FEATS,AI_KEYS,AK,ALLQ,AR,AXMETA,BK_KIND,BK_SEEN,BK_ST,BUS,Board,CAP,CARDMAP,CARD_FIELDS,CL,CM,CMS,CMS_KEY,CODE,CONFLICTS,CONS,CONS_ROLE,CSPEC,DAY,DAYS,DEF_TIMER,DEMO,DG,DOCSECS,DOCST,DPLAT,FEATS,FLAG_DEF,ICONS,IK_SECS,INTAKE,INTAKE_SECS,IS_ADMIN,IS_OWNER,LOCAL,LOGO,LS,ME,MY_BLOCK,MY_REQ,MY_STAFF,MY_SUB,N,N_Q,PAL,PEERS,PERIODS,PLANS,PRISTINE,PROFILE,Q,READY,RO,ROLES,ROLE_DEF,ROOM,S,SAVE_ST,SND,SPECIAL,SPECIAL0,STAGES,SUBS,SUB_ST,TIERS,TRACKS,TST,UNSUB,VERSION,aDel,aGet,aList,aSet,activeConflicts,admLocal,afterOpen,ago,ansSummary,ansTitle,applyFeatClasses,applyGame,applyLessons,applySettingsLive,approved,art,audit,blank,bootEngine,bump,canSec,capsP,clone,closeSession,cmsA,cmsG,cmsL,cmsLoad,cmsPut,cmsS,cmsSave,colorOf,compList,compName,confActive,confOf,couponCheck,createSession,cspecT,cur,deepFilled,deepMerge,defLine,digitalDone,digitalParts,doubtOn,emit,enforceCall,ensureConsProfile,esc,face,featOn,feedItems,fget,fillText,fixedName,flag,flush,fmt,fmtDate,fmtShort,fmtWhen,gClone,getVersion,has,hrefOf,icon,ikCount,ikDone,ikSecDone,ikVal,inflight,initial,isConsMember,isEmpty,joinRoom,listeners,loadBiz,loadConsultants,loadProfile,localSessions,logEv,memberName,money,myBookings,myCons,myEnt,myPlan,mySessionsThisMonth,newCode,newId,normCode,notify,on,onSnap,onSync,onlinePeople,openSession,optT,patch,pendingPatch,placed,placedCount,planById,platOn,plist,projIndex,ptimer,qcode,qlabel,rememberRecent,reqMissing,resolved,reviewItems,reviewMax,saveProfile,setHand,setSave,setUI,setVar,slotsFor,stageAvgConf,stageCount,stageDone,stageOf,stageTime,subLive,subscribe,timeOf,tmState,ui,ui_bk,whoName,wrapSample};
