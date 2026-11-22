/* Shared presentation clock for Arena fighters. Combat results come from the engine. */
(() => {
  'use strict';
  const clamp = n => Math.max(0,Math.min(1,n));
  const ease = n => {const t=clamp(n);return t*t*(3-2*t);};
  const fraction = (value,start,end) => clamp((value-start)/(end-start));
  function profile(catArt,foe,isPet) {
    if(isPet){
      const tempo=(catArt?.choreography?.tempo||0)+(catArt?.fightingStyle?.tempo||0);
      const index=catArt?.uniq||0;
      return {tempo,reach:.44+(index%7)*.012,windup:.17+(index%5)*.013,
        recoil:.055+(index%4)*.01,step:.22+(index%6)*.013};
    }
    const size=clamp(((foe?.weight||185)-4.5)/180.5);
    const build=foe?.build||0;
    return {tempo:Math.round(-70+size*260),reach:.43+build*.007,
      windup:.13+size*.13,recoil:.09-size*.043,step:.14+size*.14};
  }
  function plan(event,visual,catArt,foe,skillDuration) {
    const isPet=event.who==='pet', actor=profile(catArt,foe,isPet);
    const guard=event.fx==='guard', skill=visual?.skill;
    const charge=event.name==='Gear Fang Charge'||event.name==='Rushing Charge';
    const action=guard?'guard':skill|| (charge?'charge':'swipe');
    const duration=guard?620+actor.tempo*.55:skill?(skillDuration||650)+480:
      (charge?1020:885)+actor.tempo;
    const contact=guard ? .42 : skill ? .64 : .58;
    const release=skill ? .37 : null;
    const approach=skill||guard?0:actor.windup;
    return {action,duration,contact,release,approach,actor,isPet,guard,skill,charge};
  }
  function sample(clip,progress,reach,steps) {
    const t=clamp(progress);
    const {action,contact,approach,actor,guard,skill,charge}=clip;
    if(guard||skill){
      const hitFrame=guard?2.7:3.2;
      const frame=t<=contact?hitFrame*fraction(t,0,contact):
        hitFrame+(5-hitFrame)*fraction(t,contact,.82);
      if(t>.82)return {pose:'recover',frame:5*fraction(t,.82,1),from:action,x:0};
      return {pose:action,frame,x:0};
    }
    const approachEnd=contact-.105;
    if(t<approach){
      return {pose:'guard',frame:1.4*ease(t/approach),x:-reach*.085*ease(t/approach)};
    }
    if(t<approachEnd){
      const travel=fraction(t,approach,approachEnd);
      const stride=travel*steps;
      return {pose:'approach',frame:travel===1?5:(stride-Math.floor(stride))*5,
        x:reach*(travel*1.085-.085)};
    }
    const hold=contact+.055;
    const recover=contact+.19;
    if(t<=recover){
      const frame=t<=contact?3*fraction(t,approachEnd,contact):3+2*fraction(t,hold,recover);
      return {pose:charge?'charge':'swipe',frame,x:reach*(1-.10*ease(fraction(t,hold,recover)))};
    }
    const back=fraction(t,recover,1),stride=back*Math.max(1,steps-1);
    return {pose:back>=1?'idle':'approach',frame:(1-(stride-Math.floor(stride)))*5,
      x:reach*.9*(1-back)};
  }
  window.PawtopiaBattleMotion=Object.freeze({profile,plan,sample});
})();
