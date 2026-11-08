// فحص ملفات المكوّنات: صحة الصياغة، وجود كل اسم مستورد، وعدم استخدام أسماء غير معرّفة
// الاستخدام: node scripts/check.mjs src/features/play   (مجلد أو ملفات)
import fs from 'fs'; import path from 'path'; import { transformSync } from 'esbuild'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = []; for (const a of process.argv.slice(2)) { const p = path.resolve(a); if (fs.statSync(p).isDirectory()) { (function rec(d) { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); if (fs.statSync(q).isDirectory()) rec(q); else if (/\.(jsx?|mjs)$/.test(f)) files.push(q); } })(p); } else files.push(p); }
const exportsOf = (file) => { try { const code = transformSync(fs.readFileSync(file, 'utf8'), { loader: file.endsWith('x') ? 'jsx' : 'js', jsx: 'automatic', format: 'esm' }).code; const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' }); const out = new Set(); for (const n of ast.body) { if (n.type === 'ExportNamedDeclaration') { if (n.declaration) { if (n.declaration.id) out.add(n.declaration.id.name); (n.declaration.declarations || []).forEach((d) => out.add(d.id.name)); } (n.specifiers || []).forEach((s) => out.add(s.exported.name)); } if (n.type === 'ExportDefaultDeclaration') out.add('default'); } return out; } catch (e) { return null; } };
const G = new Set('window document localStorage sessionStorage console Math Date JSON Object Array String Number Boolean Promise Set Map WeakMap Symbol Error RegExp parseInt parseFloat isNaN isFinite setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame matchMedia navigator location history URL Blob File FileReader Image performance innerWidth innerHeight devicePixelRatio getComputedStyle encodeURIComponent decodeURIComponent btoa atob Uint8Array Float32Array ArrayBuffer TextEncoder TextDecoder fetch Infinity NaN undefined globalThis structuredClone queueMicrotask ResizeObserver IntersectionObserver createImageBitmap OffscreenCanvas alert confirm prompt Intl Reflect Proxy DOMParser CustomEvent Event crypto scrollTo scrollY addEventListener removeEventListener HTMLElement Node AbortController FormData'.split(' '));
let bad = 0;
for (const f of files) {
  const rel = path.relative(root, f); let code;
  try { code = transformSync(fs.readFileSync(f, 'utf8'), { loader: f.endsWith('x') ? 'jsx' : 'js', jsx: 'automatic', format: 'esm' }).code; } catch (e) { console.log('✗', rel, 'SYNTAX', e.message.split('\n').slice(0, 3).join(' | ')); bad++; continue; }
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  const top = new Set(); const probs = [];
  for (const n of ast.body) {
    if (n.type === 'ImportDeclaration') {
      n.specifiers.forEach((s) => top.add(s.local.name));
      const src = n.source.value; if (!src.startsWith('.')) continue;
      let t = path.resolve(path.dirname(f), src); if (!fs.existsSync(t)) { probs.push('missing file ' + src + ' (pending from another module?)'); continue; }
      const ex = exportsOf(t); if (!ex) continue;
      n.specifiers.forEach((s) => { const nm = s.type === 'ImportDefaultSpecifier' ? 'default' : s.type === 'ImportNamespaceSpecifier' ? null : s.imported.name; if (nm && !ex.has(nm)) probs.push(`"${nm}" is not exported by ${src}`); });
    }
    const d = n.type === 'ExportNamedDeclaration' || n.type === 'ExportDefaultDeclaration' ? n.declaration : n;
    if (!d) continue; if (d.type === 'FunctionDeclaration' && d.id) top.add(d.id.name); if (d.type === 'ClassDeclaration' && d.id) top.add(d.id.name); if (d.type === 'VariableDeclaration') d.declarations.forEach((x) => { const add = (p) => { if (!p) return; if (p.type === 'Identifier') top.add(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach((q) => add(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach(add); else if (p.type === 'AssignmentPattern') add(p.left); else if (p.type === 'RestElement') add(p.argument); }; add(x.id); });
  }
  const undef = new Map();
  walk.fullAncestor(ast, (node, state, anc) => {
    if (node.type !== 'Identifier') return; const p = anc[anc.length - 2];
    if (p && ((p.type === 'MemberExpression' && p.property === node && !p.computed) || (p.type === 'Property' && p.key === node && !p.computed && !p.shorthand) || (p.type === 'MethodDefinition' && p.key === node) || (p.type === 'LabeledStatement') || (p.type === 'BreakStatement') || (p.type === 'ContinueStatement'))) return;
    const nm = node.name; if (top.has(nm) || G.has(nm)) return;
    const chk = (pp) => { if (!pp) return false; if (pp.type === 'Identifier') return pp.name === nm; if (pp.type === 'AssignmentPattern') return chk(pp.left); if (pp.type === 'RestElement') return chk(pp.argument); if (pp.type === 'ObjectPattern') return pp.properties.some((x) => chk(x.value || x.argument)); if (pp.type === 'ArrayPattern') return pp.elements.some(chk); return false; };
    for (let i = anc.length - 1; i >= 0; i--) { const a = anc[i];
      if ((a.params || []).some(chk)) return; if (a.type === 'CatchClause' && chk(a.param)) return;
      if ((a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration' || a.type === 'ClassExpression') && a.id && a.id.name === nm) return;
      const stm = a.type === 'BlockStatement' || a.type === 'Program' || a.type === 'StaticBlock' ? a.body : a.type === 'SwitchCase' ? a.consequent : null;
      const extra = (a.type === 'ForStatement' ? [a.init] : (a.type === 'ForOfStatement' || a.type === 'ForInStatement') ? [a.left] : []);
      for (const s of [...(stm || []), ...extra]) { if (!s) continue; if (s.type === 'VariableDeclaration' && s.declarations.some((d) => chk(d.id))) return; if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id && s.id.name === nm) return; }
      if (a.type === 'SwitchStatement') for (const c of a.cases) for (const s of c.consequent) if (s.type === 'VariableDeclaration' && s.declarations.some((d) => chk(d.id))) return;
    }
    undef.set(nm, (undef.get(nm) || 0) + 1);
  });
  if (undef.size) probs.push('undefined: ' + [...undef.keys()].join(', '));
  if (probs.length) { bad++; console.log('✗', rel); probs.forEach((p) => console.log('   -', p)); } else console.log('✓', rel);
}
process.exit(bad ? 1 : 0);
