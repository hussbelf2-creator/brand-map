// يحلّل ملف المحرّك: الأسماء المعرّفة في المستوى الأعلى، والمراجع غير المعرّفة (دوال واجهة قديمة مثلاً)
import fs from 'fs';import * as acorn from 'acorn';import * as walk from 'acorn-walk';
const src=fs.readFileSync(process.argv[2],'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
const top=new Set();
for(const n of ast.body){if(n.type==='FunctionDeclaration')top.add(n.id.name);if(n.type==='VariableDeclaration')n.declarations.forEach(d=>{if(d.id.type==='Identifier')top.add(d.id.name)});if(n.type==='ImportDeclaration')n.specifiers.forEach(s=>top.add(s.local.name))}
const globals=new Set(['window','document','localStorage','sessionStorage','console','Math','Date','JSON','Object','Array','String','Number','Boolean','Promise','Set','Map','WeakMap','Symbol','Error','RegExp','parseInt','parseFloat','isNaN','isFinite','setTimeout','clearTimeout','setInterval','clearInterval','requestAnimationFrame','cancelAnimationFrame','matchMedia','navigator','location','history','URL','Blob','File','FileReader','Image','HTMLCanvasElement','AudioContext','webkitAudioContext','OfflineAudioContext','performance','innerWidth','innerHeight','devicePixelRatio','getComputedStyle','encodeURIComponent','decodeURIComponent','btoa','atob','Uint8Array','Float32Array','Int16Array','ArrayBuffer','TextEncoder','TextDecoder','fetch','Infinity','NaN','undefined','globalThis','structuredClone','queueMicrotask','ResizeObserver','IntersectionObserver','createImageBitmap','OffscreenCanvas','alert','confirm','escape','unescape','arguments','Intl','Reflect','Proxy','BigInt','DOMParser','XMLSerializer','CustomEvent','Event','EventTarget','crypto','screen','scrollTo','scrollY','addEventListener','removeEventListener','dispatchEvent','self','top','parent','frames','name','status','event','Node','Element','HTMLElement','SVGElement','MutationObserver','PointerEvent','KeyboardEvent','MouseEvent','TouchEvent','WebGLRenderingContext','Audio']);
const undef=new Map();
walk.fullAncestor(ast,(node,state,anc)=>{if(node.type!=='Identifier')return;const p=anc[anc.length-2];
 if(p&&((p.type==='MemberExpression'&&p.property===node&&!p.computed)||(p.type==='Property'&&p.key===node&&!p.computed&&!p.shorthand)||(p.type==='MethodDefinition'&&p.key===node)))return;
 const nm=node.name;if(top.has(nm)||globals.has(nm))return;
 // locally declared? crude: check declarations in ancestors' scopes
 for(let i=anc.length-1;i>=0;i--){const a=anc[i];const ps=a.params||[];const chk=pp=>{if(!pp)return false;if(pp.type==='Identifier')return pp.name===nm;if(pp.type==='AssignmentPattern')return chk(pp.left);if(pp.type==='RestElement')return chk(pp.argument);if(pp.type==='ObjectPattern')return pp.properties.some(x=>chk(x.value||x.argument));if(pp.type==='ArrayPattern')return pp.elements.some(chk);return false};
  if(ps.some(chk))return;if(a.type==='CatchClause'&&a.param&&chk(a.param))return;
  const body=a.body&&Array.isArray(a.body)?a.body:(a.body&&a.body.body&&Array.isArray(a.body.body)?a.body.body:(a.type==='Program'?a.body:null));
  const stmts=a.type==='BlockStatement'||a.type==='Program'||a.type==='StaticBlock'?a.body:(a.type==='SwitchCase'?a.consequent:null);
  for(const s of [...(stmts||[]),...((a.type==='ForStatement'||a.type==='ForOfStatement'||a.type==='ForInStatement')?[a.init||a.left]:[])]){if(!s)continue;if(s.type==='VariableDeclaration'&&s.declarations.some(d=>chk(d.id)))return;if(s.type==='FunctionDeclaration'&&s.id&&s.id.name===nm)return;}
  if((a.type==='FunctionExpression'||a.type==='FunctionDeclaration')&&a.id&&a.id.name===nm)return;}
 undef.set(nm,(undef.get(nm)||0)+1)});
if(process.argv[3]==='--top')console.log([...top].sort().join(' '));
console.log('UNDEFINED:',[...undef.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+'×'+v).join(' '));
