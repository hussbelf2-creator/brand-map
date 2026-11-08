// يضيف سطر التصدير لكل الأسماء المعرّفة في المستوى الأعلى من المحرّك
import fs from 'fs';import * as acorn from 'acorn';
const f=process.argv[2];let src=fs.readFileSync(f,'utf8');src=src.replace(/\nexport \{[^}]*\};\n?$/,'\n');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});const top=new Set();
for(const n of ast.body){if(n.type==='FunctionDeclaration')top.add(n.id.name);if(n.type==='VariableDeclaration')n.declarations.forEach(d=>{if(d.id.type==='Identifier')top.add(d.id.name)})}
['capsResolve','THREE'].forEach(x=>top.delete(x));
fs.writeFileSync(f,src.trimEnd()+'\n\nexport {'+[...top].sort().join(',')+'};\n');console.log(top.size,'exports');
