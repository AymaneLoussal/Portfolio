import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('assets/fonts',{recursive:true});
const url='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error(response.status);
let css=await response.text();
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(let i=0;i<urls.length;i++){
  const asset=await fetch(urls[i],{signal:AbortSignal.timeout(20000)});if(!asset.ok)throw new Error(asset.status);
  const extension=new URL(urls[i]).pathname.split('.').pop();const name=`font-${i}.${extension}`;
  await writeFile(`assets/fonts/${name}`,Buffer.from(await asset.arrayBuffer()));css=css.replaceAll(urls[i],name);
}
await writeFile('assets/fonts/fonts.css',css);
console.log(`Saved ${urls.length} font files for offline use.`);
for(const [name,url] of Object.entries({
  'Hanken-Grotesk-OFL.txt':'https://raw.githubusercontent.com/google/fonts/main/ofl/hankengrotesk/OFL.txt',
  'JetBrains-Mono-OFL.txt':'https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt',
  'Three-MIT.txt':'https://raw.githubusercontent.com/mrdoob/three.js/r128/LICENSE'
})){
  const license=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!license.ok)throw new Error(`${name}: ${license.status}`);
  await writeFile(`assets/${name}`,await license.text());
}
