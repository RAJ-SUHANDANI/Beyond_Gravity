import fs from 'node:fs';
const categories=['performance','accessibility','best-practices','seo'];
console.log('# Beyond Gravity — actual Lighthouse audit');
console.log('');
console.log('Automated synthetic Lighthouse scores on the production Vercel URL. The page is assessed at first load, not after entering a chapter. Results vary by run, device and network. Scores are not subjective product-quality ratings.');
console.log('');
console.log('| Category | Desktop | Mobile |');
console.log('|---|---:|---:|');
const docs=process.argv.slice(2).map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
for(const key of categories)console.log('| '+key+' | '+docs.map(d=>Math.round((d.categories?.[key]?.score??0)*100)+'/100').join(' | ')+' |');
console.log('');
console.log('| Web Vital / lab metric | Desktop | Mobile |');
console.log('|---|---:|---:|');
for(const [key,name] of [['first-contentful-paint','FCP'],['largest-contentful-paint','LCP'],['speed-index','Speed Index'],['total-blocking-time','Total Blocking Time'],['cumulative-layout-shift','CLS']]){
 console.log('| '+name+' | '+docs.map(d=>d.audits?.[key]?.displayValue||'unavailable').join(' | ')+' |');
}
console.log('');
console.log('Report generated from: '+docs[0]?.finalDisplayedUrl+' and '+docs[1]?.finalDisplayedUrl);
