import { readFile, writeFile, mkdir } from 'node:fs/promises';
const original = await readFile('backup/index.original.html', 'utf8');
const images = [...original.matchAll(/<img[^>]+src="(https:[^"]+)"/g)].map(m => m[1]);
await mkdir('assets', {recursive: true});
const names = ['portrait', 'modeling-01', 'modeling-02', 'modeling-03', 'modeling-04', 'football', 'parkour'];
const manifest = [];
await Promise.all(images.map(async (url, i) => {
  const path = `assets/${names[i]}.jpg`;
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
    manifest[i] = {name: names[i], src: path, original: url};
    console.log(`Saved ${path}`);
  } catch (error) {
    manifest[i] = {name: names[i], src: url, original: url};
    console.log(`${names[i]}: ${error.message}; retained original URL`);
  }
}));
await writeFile('assets/manifest.json', JSON.stringify(manifest, null, 2));
const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
if (!response.ok) throw new Error(`Three.js: ${response.status}`);
await writeFile('assets/three.min.js', await response.text());
console.log('Saved local Three.js dependency');
