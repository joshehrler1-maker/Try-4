// Rebuild local game drafts from the canonical live source and shared hero model.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
let game=read('super-paw-3d.html');
const rig=read('assets/super-paw-rig.js');
const poster='data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/whisker-luna-master.webp')).toString('base64');
game=game.replace(/<script src="assets\/super-paw-rig\.js(?:\?[^"]*)?"><\/script>/,'<script>'+rig+'</script>');
game=game.replace('src="assets/whisker-luna-master.webp"','data-master-poster="true"');
game=game.replaceAll("'assets/whisker-luna-master.webp'",'window.SuperPawMasterPoster');
const posterBootstrap='<script>window.SuperPawMasterPoster='+JSON.stringify(poster)+';document.querySelectorAll("[data-master-poster]").forEach(image=>image.src=window.SuperPawMasterPoster);</script>';
game=game.replace('<script>\n(()=>',posterBootstrap+'<script>\n(()=>');
// The draft carries both characters and the poster; site navigation remains a site feature.
game=game.replace(/<script src="(?:cross-platform\.js|app\.js)"[^>]*><\/script>/g,'').replace('<link rel="stylesheet" href="cross-platform.css">','').replace('<link rel="manifest" href="manifest.webmanifest">','');
let core=read('core.js');
const start=core.indexOf("if(j.type==='game')return [artifact(");
const end=core.indexOf("\n fail('Unsupported generator.');",start);
if(start<0||end<0)throw Error('Canonical game generator markers missing');
core=core.slice(0,start)+"if(j.type==='game')return [artifact('super-paw-3d-quest.html','text/html',"+JSON.stringify(game)+")];"+core.slice(end);
core=core.replace('Whisker and Luna are cats. Both retain their approved costumes and utility belts. No dogs.','Whisker and Luna remain cats. Use assets/heroes-master.json and the approved poster: Whisker has orange tabby fur, green eyes and red/navy/gold armor; Luna has silver fur, violet eyes and purple/silver/cyan armor. Preserve their emblems, hair, utility belts and voice assignments. Villain continuity follows story-bible.json.');
fs.writeFileSync(path.join(root,'core.js'),core);
console.log('Updated game drafts to embed the same shared hero geometry, pose rig and poster.');
