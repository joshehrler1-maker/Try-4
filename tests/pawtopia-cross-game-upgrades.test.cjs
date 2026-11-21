'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function world(fail=false){
  let raw=null;const window={};
  const localStorage={
    getItem:()=>raw,
    setItem:(key,val)=>{if(fail)throw Error('Save failed');raw=val;}
  };
  const ctx={window,localStorage,navigator:{},Date};
  vm.runInNewContext(read('assets/pawtopia-save.js'),ctx);
  vm.runInNewContext(read('assets/pawtopia-upgrade-points.js'),ctx);
  return {api:window.PawtopiaUpgradePoints,save:window.PawtopiaSave,
    load:obj=>{raw=JSON.stringify(obj)},raw:()=>raw};
}
const cat=(level=1)=>({name:'Mochi',breed:'Bengal',stats:{
  level,strength:2,defence:2,movement:2,endurance:2,intelligence:2
}});
test('25 real side-scroller checkpoints credit once per game and cap daily rewards',async()=>{
 const w=world();
 for(let i=0;i<25;i++){
   assert.equal((await w.api.claim('stage','game-'+i,'stage-1')).granted,1);
   assert.equal((await w.api.claim('stage','game-'+i,'stage-1')).granted,0);
 }
 assert.equal((await w.api.claim('clear','game-0','complete')).granted,3);
 assert.equal((await w.api.claim('stage','game-0','stage-2')).granted,1);
 assert.equal((await w.api.claim('stage','game-0','stage-3')).granted,1);
 assert.equal((await w.api.claim('clear','game-1','complete')).granted,0);
 assert.equal(w.api.state().balance,30);
 assert.equal(w.api.state().daily,30);
});
test('all six original mini modes and three 3D maze endings award distinct milestones',async()=>{
 const w=world();
 for(const g of ['courier','forge','beacons','lantern','crystal','defense'])
   for(const n of [1,3,6]){
     assert.equal((await w.api.claim('mini',g,'score-'+n)).granted,1);
     assert.equal((await w.api.claim('mini',g,'score-'+n)).granted,0);
   }
 for(let i=0;i<3;i++){
   assert.equal((await w.api.claim('3d-win','maze-'+i,'escape')).granted,3);
   assert.equal((await w.api.claim('3d-win','maze-'+i,'escape')).granted,0);
 }
 assert.equal((await w.api.claim('battle-win','foe-1','victory')).granted,2);
 assert.equal(w.api.state().balance,29);
});
test('four total guest launch bonuses, with no invented external game wins',async()=>{
 const w=world();
 for(const [kind,id] of [
  ['guest-launch','publisher-snake'],['guest3d-launch','race-one'],
  ['guest-launch','publisher-chess'],['guest3d-launch','race-two']
 ])assert.equal((await w.api.claim(kind,id,'launch')).granted,1);
 assert.equal((await w.api.claim('guest-launch','publisher-snake','launch')).granted,0);
 assert.equal((await w.api.claim('guest3d-launch','new-game','launch')).granted,0);
 assert.equal(w.api.state().guest,4);
 assert.equal(w.api.state().balance,4);
});
test('unapproved or malformed milestones do not credit anything',async()=>{
 const w=world();
 for(const args of [
  ['stage','game-25','stage-1'],['stage','game-1','stage-0'],
  ['mini','courier','score-99'],['3d-win','other','escape'],
  ['battle-win','foe-13','victory'],['bonus','none','complete'],
  ['guest-launch','../../evil','launch']
 ])assert.equal((await w.api.claim(...args)).granted,0);
 assert.equal(w.api.state().balance,0);
});
test('point training changes only the active pet and no Paw Coins or saved account fields',async()=>{
 const w=world();
 w.load({coins:23,bankCoins:44,food:3,companion:cat(),
   otherCompanions:[cat(4)],originalField:{preserve:true}});
 assert.equal((await w.api.claim('3d-win','maze-0','escape')).granted,3);
 assert.equal((await w.api.train('strength')).ok,false);
 assert.equal((await w.api.train('level')).ok,true);
 assert.equal((await w.api.train('strength')).ok,true);
 assert.equal(w.save.read().companion.stats.level,2);
 assert.equal(w.save.read().companion.stats.strength,3);
 assert.equal(w.api.state().balance,1);
 assert.equal(w.save.read().coins,23);
 assert.equal(w.save.read().bankCoins,44);
 assert.equal(w.save.read().food,3);
 assert.equal(w.save.read().otherCompanions[0].stats.level,4);
 assert.equal(w.save.read().originalField.preserve,true);
 w.load({companion:cat(200),petUpgrades:w.save.read().petUpgrades});
 assert.equal(w.api.canSpend(w.save.read(),'level'),false);
 assert.equal((await w.api.train('level')).ok,false);
});
test('storage failures cannot report fake upgrades',async()=>{
 const w=world(true);
 assert.equal((await w.api.claim('stage','game-0','stage-1')).granted,0);
 assert.equal(w.api.state().balance,0);
});
test('all local and publisher game families use the shared save and declared reward hooks',()=>{
 for(const file of ['pawtopia-companions.html','pawtopia-arcade.html','pawcade-side-scroll.html',
    '3d-games.html','guest-arcade.html','guest-3d-arcade.html','pawtopia-battle-arena.html']){
   const s=read(file);
   assert.ok(s.includes('assets/pawtopia-save.js'),file);
   assert.ok(s.includes('assets/pawtopia-upgrade-points.js'),file);
   assert.ok(s.indexOf('assets/pawtopia-save.js')<s.indexOf('assets/pawtopia-upgrade-points.js'),file);
 }
 for(const [file,expr] of [
  ['assets/pawcade-side-scroll-no-badges-v2.js',"claim('stage','game-'+index,'stage-'+stage)"],
  ['assets/pawcade-side-scroll-no-badges-v2.js',"claim('clear','game-'+index,'complete')"],
  ['3d-games.html',"claim('3d-win','maze-'+which,'escape')"],
  ['pawtopia-arcade.html',"claim('mini',mode,'score-'+target)"],
  ['assets/guest-arcade.js',"claim('guest-launch',id,'launch')"],
  ['assets/guest-3d-arcade.js',"claim('guest3d-launch',id,'launch')"],
  ['assets/pawtopia-battle-arena.js',"claim('battle-win',finished.foe.id,'victory')"]
 ])assert.ok(read(file).includes(expr),file);
 assert.ok(read('assets/companion-cottage.js').includes('upgrades.train(training.value)'));
 assert.ok(read('pawtopia-companions.html').includes('id="pet-upgrade-balance"'));
 assert.ok(read('sw.js').includes('assets/pawtopia-upgrade-points.js'));
 assert.ok(read('.github/workflows/verify.yml').includes('tests/pawtopia-cross-game-upgrades.test.cjs'));
 assert.equal(read('assets/pawtopia-upgrade-points.js').includes('fetch('),false);
});