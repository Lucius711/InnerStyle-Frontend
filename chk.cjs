const { transformSync } = require('esbuild');
const { readFileSync } = require('fs');
const files = [
  'src/components/three/ModelEditor.jsx',
  'src/components/studio/TaskCard.jsx',
  'src/components/studio/ResultPanel.jsx',
  'src/lib/api.js',
];
let ok = true;
for (const f of files) {
  try {
    transformSync(readFileSync(f, 'utf8'), { loader: f.endsWith('.js') ? 'js' : 'jsx' });
    console.log('OK   ' + f);
  } catch (e) {
    ok = false;
    const errs = e.errors ? e.errors.map(x => `  ${x.location && x.location.line}:${x.location && x.location.column} ${x.text}`).join('\n') : e.message;
    console.log('FAIL ' + f + '\n' + errs);
  }
}
process.exit(ok ? 0 : 1);
