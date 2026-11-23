/* Battle effects use resolved combat events and a per-device display preference. */
(() => {
  'use strict';
  const key='pawtopia-battle-effects';
  const reduced=()=>Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const inputs=[...document.querySelectorAll('[data-battle-effects]')];
  let value='standard';
  try { value=localStorage.getItem(key)||value; } catch {}
  function apply(next) {
    value=next==='low'?'low':'standard';
    document.documentElement.dataset.battleEffects=value;
    for (const input of inputs) input.value=value;
  }
  for (const input of inputs) input.addEventListener('change',()=>{
    apply(input.value);
    try { localStorage.setItem(key,value); } catch {}
  });
  apply(value);
  const low=()=>value==='low'||reduced();
  const compact=()=>Boolean(window.matchMedia?.('(max-width: 620px)')?.matches);
  const technique=style=>['rush','pounce','feint','lance','prism'].includes(style)?'rush':
    ['maul','whirl','thunder','shield'].includes(style)?'sweep':'cast';
  window.PawtopiaBattleEffects=Object.freeze({low,compact,technique});
})();
