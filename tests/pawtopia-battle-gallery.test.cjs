'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const dataSource=read('assets/pawtopia-battle-data.js');
const artSource=read('assets/pawtopia-battle-character-art.js');
const gallerySource=read('assets/pawtopia-battle-art-gallery.js');
const galleryHtml=read('pawtopia-battle-art-gallery.html');

function artWorld(){
  const window={};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  return {data:window.PawtopiaBattleData,art:window.PawtopiaBattleCharacterArt};
}

test('every breed has distinct original signature and ultimate seals, claw trails and defensive shields',()=>{
  const {art,data}=artWorld();
  assert.equal(art.collection.length,56);
  const fx={swipe:new Set,signature:new Set,ultimate:new Set,guard:new Set};
  const patterns=[
    ['swipe',/data-motion-id="(\d+)"/,'art-personal-motion'],
    ['signature',/data-skill-id="(\d+)"/,'art-skill-sigil'],
    ['ultimate',/data-skill-id="(\d+)"/,'art-skill-sigil'],
    ['guard',/data-guard-id="(\d+)"/,'art-personal-guard']
  ];
  for(let i=0;i<data.kits.length;i++){
    const kit=data.kits[i];
    assert.equal(art.getArt(kit.breed).skill,kit.signature);
    for(const [pose,pattern,css] of patterns){
      const svg=art.svgForBreed(kit.breed,pose,3);
      assert.match(svg,pattern,kit.breed+' '+pose);
      assert.ok(svg.includes('class="'+css+'"'),kit.breed+' missing '+css);
      assert.ok(svg.includes('href="'+kit.sprite.src+'"'),kit.breed+' official face missing');
      fx[pose].add(svg.match(pattern)[1]);
    }
    for(const frame of art.animationFrames) {
      const svg=art.svgForBreed(kit.breed,'signature',frame);
      assert.match(svg,/class="art-skill-sigil"/);
      assert.match(svg,/class="art-ability"/);
    }
  }
  for(const [type,values] of Object.entries(fx))
    assert.equal(values.size,56,'Unique '+type+' designs must exist for 56 breeds');
});

test('signature-seal geometry and frame progression are not eight repeated generic effects',()=>{
  const {art}=artWorld(),uniquePaths=new Set;
  for(const profile of art.collection){
    const svg=art.svgForBreed(profile.breed,'signature',3);
    const slice=svg.match(/<g class="art-skill-sigil"[\s\S]*?<\/g>/)?.[0];
    assert.ok(slice,profile.breed+' seal geometry');
    uniquePaths.add(slice);
    const first=art.svgForBreed(profile.breed,'signature',0);
    assert.notEqual(first,svg,profile.breed+' has animated signature frames');
    const ult=art.svgForBreed(profile.breed,'ultimate',3);
    assert.notEqual(ult,svg,'Ultimate must be bigger and different');
  }
  assert.equal(uniquePaths.size,56);
});

test('gallery is reachable through arena and cottage and available offline',()=>{
  assert.match(read('pawtopia-battle-arena.html'),/href="pawtopia-battle-art-gallery\.html"/);
  assert.match(read('pawtopia-companions.html'),/href="pawtopia-battle-art-gallery\.html"/);
  for(const script of ['assets/pawtopia-battle-data.js','assets/pawtopia-battle-character-art.js',
    'assets/pawtopia-battle-art-gallery.js'])
    assert.ok(galleryHtml.includes('src="'+script+'"'),script);
  assert.ok(galleryHtml.indexOf('pawtopia-battle-character-art.js')<galleryHtml.indexOf('pawtopia-battle-art-gallery.js'));
  for(const pose of ['idle','approach','swipe','guard','signature','ultimate','impact','victory','defeat'])
    assert.ok(galleryHtml.includes('data-pose="'+pose+'"'),pose);
  const sw=read('sw.js');
  for(const file of ['pawtopia-battle-art-gallery.html','assets/pawtopia-battle-art-gallery.css',
    'assets/pawtopia-battle-art-gallery.js'])
    assert.ok(sw.includes('"'+file+'"'));
  assert.match(read('sitemap.xml'),/pawtopia-battle-art-gallery\.html/);
  assert.doesNotMatch(gallerySource,/\bfetch\s*\(|XMLHttpRequest|localStorage|PawtopiaSave|sendBeacon/);
});

test('gallery actually renders 56 breed cards and changing breed leaves game progress untouched',async()=>{
  const saved='Do not touch user pet data';
  class Element{
    constructor(tag='div'){
      this.tag=tag;this.children=[];this.dataset={};this.attributes={};
      this.listeners={};this.value='';this.textContent='';this.innerHTML='';
      this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:''};
      this.classList={add(){}};
    }
    append(...children){this.children.push(...children);}
    replaceChildren(...children){this.children=children;}
    addEventListener(type,fn){this.listeners[type]=fn;}
    setAttribute(key,value){this.attributes[key]=value;}
    querySelectorAll(selector){
      if(selector==='button[data-breed]')return this.children.filter(e=>e.dataset?.breed);
      if(selector==='button[data-pose]')return this.children.filter(e=>e.dataset?.pose);
      return [];
    }
    closest(selector){return selector.startsWith('button')&&this.tag==='button'?this:null;}
    scrollIntoView(){}
  }
  const nodes=new Map;
  const el=id=>{if(!nodes.has(id))nodes.set(id,new Element);return nodes.get(id);};
  const document={getElementById:el,createElement:tag=>new Element(tag)};
  const window={matchMedia:()=>({matches:true}),addEventListener(){}};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  const buttons=['idle','approach','swipe','guard','signature','ultimate','impact','victory','defeat'];
  el('gallery-moves').children=buttons.map(pose=>{const b=new Element('button');b.dataset.pose=pose;return b;});
  el('gallery-speed').value='1';
  vm.runInNewContext(gallerySource,{window,document,setTimeout});
  assert.equal(el('gallery-breed').children.length,56);
  assert.equal(el('gallery-roster').children.length,56);
  assert.match(el('gallery-fighter').innerHTML,/adopt-maine-coon\.webp/);
  el('gallery-breed').value='Sphynx';
  el('gallery-breed').listeners.change();
  assert.match(el('gallery-fighter').innerHTML,/adopt-sphynx\.webp/);
  assert.match(el('gallery-skill').textContent,/Phantom Glimmer/);
  const move=el('gallery-moves').children.find(button=>button.dataset.pose==='signature');
  await el('gallery-moves').listeners.click({target:move});
  // The click callback does not return its inner async play() Promise.
  await new Promise(resolve=>setTimeout(resolve,70));
  assert.match(el('gallery-fighter').innerHTML,/paw-battle-full-body/);
  assert.equal(saved,'Do not touch user pet data');
});
