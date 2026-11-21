/* Cinematic combat presentation for Pawtopia: pure UI data, zero save writes.
   All 56 pet skill identifiers are tied to their approved breed asset registry. */
(() => {
  'use strict';
  const heroTitles=Object.freeze({
    swipe:'Paw Swipe',guard:'Guard Curl',
    signature:'Signature Skill',ultimate:'Ultimate Skill'
  });
  const symbols=Object.freeze({
    spark:'✦',frost:'❄',leaf:'❧',star:'★',
    water:'◈',wind:'➶',gear:'⚙',shadow:'✧'
  });
  const effects=Object.freeze({
    spark:'Radiant burst',frost:'Frost trail',leaf:'Vine spiral',
    star:'Starlight arc',water:'Crystal ripple',wind:'Wind rush',
    gear:'Clockwork flare',shadow:'Shadow echo'
  });
  function skillId(event,kit) {
    if(!event||event.who!=='pet'||!kit)return null;
    const name=String(event.name||'');
    if(name===heroTitles.swipe||name===heroTitles.guard)return null;
    if(name.includes(kit.ultimate)||name.endsWith(' Finale'))return 'ultimate';
    if(name.includes(kit.signature))return 'signature';
    return null;
  }
  function presentation(event,kit,foe) {
    if(!event)return Object.freeze({title:'',subtitle:'',side:'none',power:'normal',skill:null});
    const who=event.who==='pet'?'pet':event.who==='foe'?'foe':'system';
    const skill=skillId(event,kit);
    const type=kit?.theme?.type in effects?kit.theme.type:'spark';
    const title=String(event.name||'').slice(0,96);
    const detail=String(event.detail||'').slice(0,128);
    const power=skill==='ultimate'||event.fx==='victory'?'ultimate':
      skill==='signature'||event.damage>=25?'strong':'normal';
    const source=who==='pet'?'Your cat':who==='foe'?(foe?.name||'Challenger'):'Arena';
    const subtitle=who==='system'?(detail||'The match is over'):
      detail || (skill?effects[type]:' '+(event.damage>0?event.damage+' damage':'Defensive stance'));
    return Object.freeze({
      title,subtitle,side:who,power,skill,
      source:String(source).slice(0,64),
      symbol:skill?symbols[type]:event.fx==='guard'?'◈':'✦',
      color:who==='pet'&&/^#[0-9a-f]{6}$/i.test(kit?.theme?.color)?kit.theme.color:
        who==='foe'&&/^#[0-9a-f]{6}$/i.test(foe?.color)?foe.color:'#f4e2ae',
      skillAssetId:skill&&kit?.id?String(kit.id).slice(0,48):'',
      fx:skill?type:event.fx
    });
  }
  window.PawtopiaBattleCinematics=Object.freeze({skillId,presentation,symbols,effects});
})();