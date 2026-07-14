import en from './src/locales/en.js';
import vi from './src/locales/vi.js';
const flat = (o, p='') => Object.entries(o).flatMap(([k,v]) =>
  v && typeof v==='object' && !Array.isArray(v) ? flat(v, p+k+'.') : [p+k]);
const ek = new Set(flat(en.default||en)), vk = new Set(flat(vi.default||vi));
const onlyEn = [...ek].filter(k=>!vk.has(k));
const onlyVi = [...vk].filter(k=>!ek.has(k));
console.log('EN total:', ek.size, 'VI total:', vk.size);
console.log('Only in EN (missing from vi):', JSON.stringify(onlyEn, null, 0));
console.log('Only in VI (missing from en):', JSON.stringify(onlyVi, null, 0));
