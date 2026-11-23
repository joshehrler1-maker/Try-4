/* Read and prepare the same pet and loadout used by the Battle Arena. */
(() => {
  'use strict';
  const save=window.PawtopiaSave,engine=window.PawtopiaBattleEngine,market=window.PawtopiaItems,art=window.PawtopiaItemArt;
  const $=id=>document.getElementById(id);
  if(!save||!engine||!market||!$('equipment-pet'))return;
  const slots={weapon:'Weapon',armor:'Armor',relic:'Relic',wearable:'Wearable'};
  const names={strength:'Strength',defence:'Defence',movement:'Movement',endurance:'Endurance',intelligence:'Intelligence'};
  const stats={health:'Max HP',swipe:'Paw Swipe',signature:'Signature',ultimate:'Ultimate',guard:'Guard block',initiative:'Opening initiative'};
  const modifiers={
    firstSwipe:'First Paw Swipe damage',pierce:'Enemy guard pierced',thirdHit:'Every third round damage',signature:'Signature damage',
    ultimate:'Ultimate damage',lowHp:'Damage below half HP',firstBlock:'First hit blocked',heavyBlock:'Heavy damage blocked',critBlock:'Critical damage blocked',
    guard:'Guard Curl block',guardHeal:'HP restored by Guard Curl',initiative:'Opening initiative',health:'Max HP',winCoin:'Paw Coins per win',
    firstSlow:'Slow on first special',styleHealth:'Max HP from wearable',styleGuard:'First hit blocked by wearable',styleSpeed:'Opening initiative from wearable',
    marketOpening:'First attack damage',marketSignature:'Signature damage from weapon',marketFinisher:'Ultimate damage from weapon',marketHealth:'Max HP from armor',
    marketHeavy:'Heavy damage blocked by armor',marketCurl:'Guard Curl block from armor',marketSpeed:'Opening initiative from relic',
    marketMend:'HP restored by the first Guard Curl',marketReward:'Bonus Paw Coins per win',armoryFollowup:'Swipe damage after guarding',
    armoryBreak:'Extra damage against a guarded foe',armoryCritical:'Extra critical damage',armoryRecovery:'HP restored after first hit',
    armoryOpening:'Damage blocked in rounds 1–2',armoryRepeat:'Damage blocked below half HP',armorySecond:'Initiative after round 1',
    armoryVigor:'HP restored on ultimate',armoryRiposte:'Guard counter damage'
  };
  const petSelect=$('equipment-pet'),filter=$('equipment-filter'),search=$('equipment-search');
  const status=$('equipment-status');
  const query=new URLSearchParams(window.location.search);
  const pageSize=12;
  let selected=Number(query.get('pet'))||0,page=0,compared=null,busy=false;
  selected=Number.isInteger(selected)?Math.max(0,Math.min(5,selected)):0;
  const format=new Intl.NumberFormat(undefined,{maximumFractionDigits:2});
  const number=value=>format.format(value);
  function add(parent,tag,value='',className=''){
    const element=document.createElement(tag);
    element.textContent=value;
    if(className)element.className=className;
    parent.append(element);
    return element;
  }
  function button(parent,label,run,disabled=false){
    const element=add(parent,'button',label);
    element.type='button';
    element.disabled=disabled;
    element.addEventListener('click',run);
    return element;
  }
  function picture(parent,item){
    if(item)art?.mount(add(parent,'span','','item-mini-portrait'),item);
    else add(parent,'span','','item-mini-portrait').setAttribute('aria-hidden','true');
  }
  function heading(panel,label){
    panel.replaceChildren();
    return add(panel,'h2',label);
  }
  function detail(parent,label,value){
    const row=add(parent,'div');
    add(row,'dt',label);
    add(row,'dd',value);
  }
  function gearValue(value){return Number(value)||0;}
  function delta(value){return value>0?'+'+number(value):value<0?'−'+number(-value):'0';}
  function makeTable(parent,headers){
    const table=add(parent,'table','','equip-table');
    const top=add(add(table,'thead'),'tr');
    headers.forEach(label=>add(top,'th',label).scope='col');
    return add(table,'tbody');
  }
  function statRows(body,from,to){
    for(const [key,label] of Object.entries(stats)){
      const row=add(body,'tr');
      add(row,'th',label).scope='row';
      add(row,'td',number(from[key]));
      add(row,'td',number(to[key]));
      const diff=to[key]-from[key];
      add(row,'td',delta(diff),diff>0?'equip-delta-up':diff<0?'equip-delta-down':'');
    }
  }
  function gearRows(parent,from,to){
    const keys=[...new Set([...Object.keys(from),...Object.keys(to)])]
      .filter(key=>gearValue(from[key])!==gearValue(to[key]));
    if(!keys.length)return;
    add(parent,'h3','Gear effects');
    const list=add(parent,'ul');
    for(const key of keys){
      const before=gearValue(from[key]),after=gearValue(to[key]);
      const change=key==='firstSlow'?(after?'Enabled':'Removed'):
        before?number(before)+' → '+number(after):'+'+number(after);
      add(list,'li',(modifiers[key]||key)+' · '+change);
    }
  }
  function paintProfile(cat,progress){
    const panel=$('equipment-profile');
    panel.replaceChildren();
    const hero=add(panel,'div','','equip-profile');
    const portrait=add(hero,'span','','equip-portrait');
    portrait.setAttribute('aria-hidden','true');
    const kit=window.PawtopiaBattleData.kitFor(cat.breed);
    if(kit?.sprite){
      portrait.style.backgroundImage='url("'+kit.sprite.src+'")';
      portrait.style.backgroundSize=kit.sprite.backgroundSize;
      portrait.style.backgroundPosition=kit.sprite.backgroundPosition;
    }
    const intro=add(hero,'div');
    add(intro,'h2',cat.name);
    add(intro,'p',cat.breed);
    const profile=engine.profile(cat);
    const list=add(panel,'dl','','equip-stat-list');
    detail(list,'Level',number(profile.level));
    detail(list,'Battle XP',profile.level>=200?'Max level':number(profile.xp)+' / '+number(profile.nextXp));
    detail(list,'Battle record',profile.wins+' wins · '+profile.losses+' losses');
    detail(list,'Best challenger tier',String(profile.bestRank||'—'));
    for(const [key,label] of Object.entries(names))detail(list,label,number(engine.training(cat)[key]));
    for(const [key,label] of Object.entries({fullness:'Fullness',happiness:'Happiness',bondPoints:'Friendship'})){
      if(Number.isFinite(cat[key]))detail(list,label,number(cat[key])+' / 100');
    }
    if(profile.trophies.length)add(panel,'p','Trophies · '+profile.trophies.join(' · '),'mini');
    add(panel,'p',engine.moveList(cat).map(move=>move.name+(move.unlocked?'':' (Lv '+move.level+')')).join(' · '),'mini');
    const active=engine.matchInfo(progress);
    if(active?.cat===cat&&!active.match.finished){
      add(panel,'p','Current match · '+active.petHp+' / '+active.petMaxHp+' HP. Equipment changes apply to your next match.','mini');
    }
  }
  function ownerOf(progress,cat,item){
    if(!item.slot)return null;
    return [progress.companion,...(Array.isArray(progress.otherCompanions)?progress.otherCompanions:[])]
      .find(other=>other&&other!==cat&&other.catalogGear?.[item.slot]===item.id);
  }
  async function equip(item,cat){
    if(busy||!cat)return;
    busy=true;
    const index=selected,id=cat.battleId;
    status.textContent=await save.update(progress=>{
      const pets=engine.fighters(progress);
      const current=id?pets.find(pet=>pet.battleId===id):pets[index];
      if(!current||(!id&&(current.name!==cat.name||current.breed!==cat.breed)))
        return 'The selected pet changed. Choose the pet again.';
      return market.equip(progress,item.id,current);
    });
    busy=false;
    compared=null;
    render();
  }
  function paintSlots(cat,progress){
    const panel=$('equipment-slots');
    heading(panel,'Equipped gear');
    for(const [slot,label] of Object.entries(slots)){
      const item=market.worn(progress,cat,slot);
      const row=add(panel,'div','','equip-slot');
      picture(row,item);
      const content=add(row,'div');
      add(content,'p',label+' · '+(item?.name||'Empty'),'equip-name');
      if(item){
        add(content,'p',item.description,'mini');
        button(content,'Unequip',()=>equip(item,cat),busy).setAttribute('aria-label','Unequip '+item.name);
      }
    }
  }
  function paintComparison(cat,progress,item){
    const panel=$('equipment-compare');
    panel.hidden=!cat||!item?.slot;
    if(panel.hidden){panel.replaceChildren();return;}
    const title=heading(panel,'Compare '+item.name);
    title.tabIndex=-1;
    picture(panel,item);
    const current=market.worn(progress,cat,item.slot);
    add(panel,'p','Replaces '+(current?.name||'nothing in the '+slots[item.slot].toLowerCase()+' slot')+'.','mini');
    const owner=ownerOf(progress,cat,item);
    if(owner)add(panel,'p','Equipped by '+owner.name+'. Unequip it from that pet first.','mini');
    const projected={...cat,catalogGear:{...cat.catalogGear,[item.slot]:item.id}};
    const before=market.arena(progress,cat),after=market.arena(progress,projected);
    statRows(makeTable(panel,['Stat','Now','With gear','Change']),engine.loadoutProfile(cat,before),engine.loadoutProfile(cat,after));
    gearRows(panel,before,after);
    button(panel,'Equip '+item.name,()=>equip(item,cat),Boolean(owner)||busy||current?.id===item.id);
  }
  function inventory(progress){
    const owned=market.items.filter(item=>market.stock(progress,item.id)>0)
      .map(item=>({item,quantity:market.stock(progress,item.id)}));
    const basics=[['Cottage Snack','food',progress.food],['Crystal Shard','shards',progress.shards],['Crystal Toy','toy',progress.toy?1:0]];
    for(const [name,key,amount] of basics){
      if(amount>0)owned.push({item:{...(art?.staple(name,key)||{id:key,name}),category:'Town supply'},quantity:amount});
    }
    for(const [name,amount] of Object.entries(progress.townCollection||{})){
      if(Number.isFinite(amount)&&amount>0)
        owned.push({item:{...(art?.staple(name)||{id:name,name}),category:'Town collectible'},quantity:amount});
    }
    return owned.sort((a,b)=>Number(Boolean(b.item.slot))-Number(Boolean(a.item.slot))||a.item.name.localeCompare(b.item.name));
  }
  function paintInventory(cat,progress){
    const counter=$('equipment-balances');
    counter.textContent=number(progress.coins||0)+' Paw Coins';
    const all=inventory(progress);
    const chosen=filter.value,term=search.value.trim().toLowerCase();
    const results=all.filter(({item})=>(!chosen||(chosen==='gear'?item.slot:!item.slot))&&item.name.toLowerCase().includes(term));
    const pageCount=Math.max(1,Math.ceil(results.length/pageSize));
    page=Math.min(page,pageCount-1);
    $('equipment-count').textContent=results.length+' of '+all.length+' owned entries';
    $('equipment-page').textContent='Page '+(page+1)+' of '+pageCount;
    $('equipment-prev').disabled=page===0;
    $('equipment-next').disabled=page>=pageCount-1;
    const list=$('equipment-owned');list.replaceChildren();
    if(!results.length)add(list,'li',all.length?'No owned items match your search.':'Your inventory is empty.','mini');
    for(const {item,quantity} of results.slice(page*pageSize,(page+1)*pageSize)){
      const row=add(list,'li','','equip-item');
      picture(row,item);
      const content=add(row,'div');
      add(content,'p',item.name,'equip-name');
      const current=cat&&item.slot&&market.worn(progress,cat,item.slot)?.id===item.id;
      const owner=ownerOf(progress,cat,item);
      add(content,'p',[item.category,item.tier&&item.tier+' tier','Owned '+number(quantity),current?'Equipped':owner?'Equipped by '+owner.name:''].filter(Boolean).join(' · '),'mini');
      if(item.description)add(content,'p',item.description,'mini');
      if(cat&&item.slot&&!current)button(content,'Compare',()=>{
        compared=item.id;
        paintComparison(cat,progress,item);
        const panel=$('equipment-compare');
        panel.querySelector('h2')?.focus();
      }).setAttribute('aria-label','Compare '+item.name);
    }
  }
  function render(){
    const progress=save.read(),pets=engine.fighters(progress);
    selected=Math.min(selected,Math.max(0,pets.length-1));
    const cat=pets[selected];
    petSelect.replaceChildren();
    for(const [i,pet] of pets.entries()){
      const option=add(petSelect,'option',pet.name+' · '+pet.breed);
      option.value=String(i);
    }
    if(!cat)add(petSelect,'option','No adopted pet');
    petSelect.disabled=!cat||busy;
    petSelect.value=cat?String(selected):'';
    $('equipment-return').href='pawtopia-battle-arena.html'+(cat?'?pet='+selected:'')+
      (query.get('mode')==='duel'?'#arena-duels':'');
    $('equipment-empty').hidden=Boolean(cat);
    $('equipment-pet-panels').hidden=!cat;
    if(cat){
      paintProfile(cat,progress);
      const panel=$('equipment-stats');
      heading(panel,'Battle stats with gear');
      add(panel,'p','Attack power is shown before opponent defence and conditional bonuses.','mini');
      const gear=market.arena(progress,cat);
      statRows(makeTable(panel,['Stat','Base','Equipped','Change']),engine.loadoutProfile(cat),engine.loadoutProfile(cat,gear));
      gearRows(panel,{},gear);
      paintSlots(cat,progress);
    }
    paintComparison(cat,progress,compared&&market.stock(progress,compared)?market.byId.get(compared):null);
    paintInventory(cat,progress);
  }
  petSelect.addEventListener('change',()=>{
    const index=Number(petSelect.value);
    if(!Number.isInteger(index)||busy)return;
    selected=index;compared=null;status.textContent='';render();
  });
  for(const [element,event] of [[search,'input'],[filter,'change']])
    element.addEventListener(event,()=>{page=0;render();});
  $('equipment-prev').addEventListener('click',()=>{page--;render();});
  $('equipment-next').addEventListener('click',()=>{page++;render();});
  for(const event of ['storage','pageshow','pawtopia-save-changed'])
    window.addEventListener(event,()=>{if(!busy)render();});
  render();
})();
