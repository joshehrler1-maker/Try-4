// Keep browser data, downloadable GLBs, and local draft models in sync.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const data=Object.fromEntries(['Whisker','Luna'].map(name=>[name,fs.readFileSync(path.join(root,'assets',name.toLowerCase()+'-master.glb')).toString('base64')]));
const runtime=fs.readFileSync(path.join(root,'assets/super-paw-rig-runtime.js'),'utf8');
fs.writeFileSync(path.join(root,'assets/super-paw-rig.js'),'/* Canonical poster-guided models, version 2. */\nconst MODEL_DATA='+JSON.stringify(data)+';\n'+runtime);
console.log('Packed the canonical GLB models and shared runtime. Run scripts/sync-hero-assets.mjs next.');
