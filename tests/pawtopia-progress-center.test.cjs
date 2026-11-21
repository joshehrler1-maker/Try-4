const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'assets/pawtopia-save.js'),'utf8');
function harness(){
  const stored=new Map();
  const context={window:{},navigator:{},localStorage:{
    getItem:key=>stored.get(key)||null,
    setItem:(key,value)=>stored.set(key,value)
  },Date,JSON,Math,Number,Object,Array,Set,String};
  vm.createContext(context);
  vm.runInContext(script,context);
  return {save:context.window.PawtopiaSave,stored};
}
function cat(){
 return {name:'Pippin',breed:'Maine Coon',fullness:35,happiness:30,stats:{level:1,strength:2,defence:2,movement:2,endurance:2,intelligence:2},battle:{wins:0}};
}
async function adopt(save){
 await save.update(p=>{p.companion=cat();return 'Adopted';},{track:false});
}
test('daily and weekly quests begin empty and recognize care without repeated no-ops',async()=>{
 const {save}=harness();await adopt(save);
 assert.equal(save.questJournal().daily.care,0);
 await save.update(p=>{p.companion.fullness+=10;return 'Fed';});
 assert.equal(save.questJournal().daily.care,1);
 assert.equal(save.questJournal().weekly.care,1);
 await save.update(p=>'No changes');
 assert.equal(save.questJournal().daily.care,1);
});
test('battle victories, first-party game milestones and scout milestones count; guest launches do not',async()=>{
 const {save}=harness();await adopt(save);
 const today=new Date().toISOString().slice(0,10);
 await save.update(p=>{p.companion.battle.wins=1;return 'Victory';});
 assert.equal(save.questJournal().daily.battle,1);
 await save.update(p=>{p.petUpgrades={day:today,keys:[today+'|mini|crystal|score-1',today+'|guest-launch|guest-1|launch',today+'|scout|meadow|solved']};return 'Milestones';});
 assert.equal(save.questJournal().daily.game,1);
 assert.equal(save.questJournal().daily.scout,1);
 await save.update(p=>{p.petUpgrades.keys.push(today+'|guest3d-launch|guest-2|launch');return 'Guest';});
 assert.equal(save.questJournal().daily.game,1);
});
test('claims require adoption and completion, award coins once and survive export/restore',async()=>{
 const {save}=harness();
 let result=await save.claimQuest('daily','care');
 assert.equal(result.ok,false);
 await adopt(save);
 result=await save.claimQuest('daily','care');
 assert.equal(result.ok,false);
 await save.update(p=>{p.companion.fullness+=12;return 'Feed';});
 await save.update(p=>{p.companion.happiness+=10;return 'Play';});
 result=await save.claimQuest('daily','care');
 assert.equal(result.ok,true);
 assert.equal(save.read().coins,5);
 result=await save.claimQuest('daily','care');
 assert.equal(result.ok,false);
 assert.equal(save.read().coins,5);
 const backup=save.exportBackup();
 assert.equal(backup.format,'pawtopia-progress-backup');
 const second=harness();const restored=await second.save.restoreBackup(JSON.parse(JSON.stringify(backup)));
 assert.equal(restored.ok,true);
 assert.equal(second.save.read().coins,5);
 assert.equal(second.save.read().companion.name,'Pippin');
 assert.equal(second.save.questJournal().daily.care,2);
 assert.equal(second.save.questJournal().claimedDaily.includes('care'),true);
});
test('backup validation rejects corrupt data and unsafe nested keys',async()=>{
 const {save}=harness();await adopt(save);
 const before=JSON.stringify(save.read());
 await assert.rejects(save.restoreBackup({format:'not-a-backup',version:1,progress:{}}));
 const snapshot=save.exportBackup();
 snapshot.progress.coins=-100;
 await assert.rejects(save.restoreBackup(snapshot));
 const attack=save.exportBackup();
 attack.progress.townCollection=JSON.parse('{"__proto__":{"admin":true}}');
 await assert.rejects(save.restoreBackup(attack));
 assert.equal(JSON.stringify(save.read()),before);
});
test('player page and major Pawtopia destinations link to the same quest and backup center',()=>{
 const expected=['index.html','pawtopia-companions.html','pawtopia-battle-arena.html','pawtopia-arcade.html','pawtopia-town.html','pawtopia-scout-trails.html'];
 for(const file of expected)assert.ok(fs.readFileSync(path.join(root,file),'utf8').includes('pawtopia-progress.html'),file+' missing quest center link');
 for(const file of ['assets/pawtopia-progress-center.css','assets/pawtopia-progress-center.js'])
 assert.ok(fs.existsSync(path.join(root,file)),file+' missing');
});