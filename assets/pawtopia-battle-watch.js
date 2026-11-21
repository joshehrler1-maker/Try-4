/* Original local-only Pawtopia Watch Battle tactics.
   Plays one current solo match using already-unlocked moves.
   Never starts another match, accesses payments, or modifies saved data. */
(() => {
  'use strict';
  function chooseMove(view,moves) {
    if(!view || !Array.isArray(moves) || view.match?.finished)return null;
    const available=new Map(moves.filter(move=>
      move && move.unlocked && move.ready &&
      ['swipe','guard','signature','ultimate'].includes(move.id)
    ).map(move=>[move.id,move]));
    if(!available.size)return null;
    const round=Number.isSafeInteger(view.match?.round)?view.match.round:1;
    const hp=Number.isFinite(view.petHp)?view.petHp:0;
    const max=Number.isFinite(view.petMaxHp)&&view.petMaxHp>0?view.petMaxHp:1;
    // Guard sparingly so the fight still advances and cannot get stuck.
    if(hp/max<=.35 && round%4===0 && available.has('guard') && !view.match?.guard)
      return 'guard';
    if(available.has('ultimate'))return 'ultimate';
    if(available.has('signature'))return 'signature';
    if(available.has('swipe'))return 'swipe';
    return available.has('guard') && round%5===0?'guard':null;
  }
  const speeds=Object.freeze([1,1.5,2]);
  function speed(value) {
    const parsed=Number(value);
    return speeds.includes(parsed)?parsed:1;
  }
  window.PawtopiaBattleWatch=Object.freeze({chooseMove,speed,speeds,maxTurns:75});
})();