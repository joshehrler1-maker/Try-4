/* Try 4 optional gamepad bridge — maps controllers onto existing keyboard controls. */
(() => {
  'use strict';
  const page = location.pathname.split('/').pop();
  const arcade = page === '3d-games.html';
  const quest = page === 'super-paw-3d.html';
  if (!arcade && !quest) return;
  const pressed = new Set();
  const controlMap = arcade
    ? {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}
    : {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
  function fire(key,down) {
    const code = key === ' ' ? 'Space' : key;
    const event = new KeyboardEvent(down?'keydown':'keyup', {key,code,bubbles:true,cancelable:true});
    document.dispatchEvent(event);
  }
  function sync(target) {
    for(const key of Array.from(pressed)) if(!target.has(key)) {fire(key,false);pressed.delete(key)}
    for(const key of target) if(!pressed.has(key)) {fire(key,true);pressed.add(key)}
  }
  let lastButtons = new Set();
  function poll() {
    if (document.hidden) {sync(new Set());lastButtons.clear();requestAnimationFrame(poll);return;}
    const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    const pad = Array.from(pads || []).find(p => p && p.connected);
    const moves = new Set(), buttons = new Set();
    if (pad) {
      const x = pad.axes[0] || 0, y = pad.axes[1] || 0;
      if (x < -.35 || pad.buttons[14]?.pressed) moves.add(controlMap.left);
      if (x > .35 || pad.buttons[15]?.pressed) moves.add(controlMap.right);
      if (y < -.35 || pad.buttons[12]?.pressed) moves.add(controlMap.up);
      if (y > .35 || pad.buttons[13]?.pressed) moves.add(controlMap.down);
      if (pad.buttons[0]?.pressed) buttons.add('Space');
      if (quest && pad.buttons[1]?.pressed) buttons.add('KeyQ');
      if (quest && pad.buttons[2]?.pressed) buttons.add('KeyH');
    }
    sync(moves);
    // Single-shot actions: don't fire every animation frame.
    for (const b of buttons) if (!lastButtons.has(b)) {
      if (arcade && b === 'Space') document.getElementById('fire')?.click();
      else if (quest) document.getElementById(b==='Space'?'attack':b==='KeyQ'?'special':'heal')?.click();
    }
    lastButtons = buttons;
    requestAnimationFrame(poll);
  }
  window.addEventListener('blur', () => {sync(new Set());lastButtons.clear()});
  requestAnimationFrame(poll);
})();
