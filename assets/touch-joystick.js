window.bindTouchJoystick = function (base, onChange, options = {}) {
  const knob = base.querySelector('span');
  let pointer = null;
  let direction = '';
  let timer;
  const deadZone = options.deadZone ?? 11;
  let bounds;
  function change(next) {
    if (next === direction) return;
    direction = next;
    clearInterval(timer);
    onChange(next);
    if (next && options.repeat) timer = setInterval(() => onChange(next), options.repeat);
  }
  function reset() {
    const previous = pointer;
    pointer = null;
    if (previous !== null && base.hasPointerCapture?.(previous)) base.releasePointerCapture(previous);
    knob.style.transform = '';
    change('');
  }
  function move(event) {
    if (event.pointerId !== pointer) return;
    const box = options.cacheBounds ? bounds : base.getBoundingClientRect();
    const x = options.vertical ? 0 : event.clientX - box.left - box.width / 2;
    const y = options.horizontal ? 0 : event.clientY - box.top - box.height / 2;
    const distance = Math.hypot(x, y);
    const scale = Math.min(1, box.width * .27 / (distance || 1));
    knob.style.transform = 'translate(' + x * scale + 'px,' + y * scale + 'px)';
    const threshold = direction ? deadZone * .65 : deadZone;
    if(options.diagonal && distance>=threshold && Math.min(Math.abs(x),Math.abs(y))>=distance*.38){
      change((x<0?'left':'right')+' '+(y<0?'up':'down'));
      return;
    }
    change(distance < threshold ? '' : Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down'));
  }
  base.addEventListener('pointerdown', event => {
    if (pointer !== null || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    if (options.cacheBounds) bounds = base.getBoundingClientRect();
    base.setPointerCapture(pointer);
    move(event);
  });
  base.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    base.addEventListener(type, event => { if (event.pointerId === pointer) reset(); });
  }
  addEventListener('blur', reset);
  if (options.cacheBounds) {
    addEventListener('resize', reset);
    addEventListener('scroll', () => {
      if (pointer !== null) bounds = base.getBoundingClientRect();
    }, {capture: true, passive: true});
  }
  return reset;
};

window.bindTileJoystick = function (stick, board, columns, selectButton) {
  let index = 0;
  function highlight() {
    for (const [i, tile] of Array.from(board.children).entries()) {
      tile.classList.toggle('joystick-selected', i === index);
    }
  }
  window.bindTouchJoystick(stick, direction => {
    const count = board.children.length;
    if (!direction || !count) return;
    index = Math.min(index, count - 1);
    const width = columns();
    const next = index + ({left:-1,right:1,up:-width,down:width})[direction];
    const horizontal = direction === 'left' || direction === 'right';
    if (next >= 0 && next < count && (!horizontal || Math.floor(next / width) === Math.floor(index / width))) index = next;
    highlight();
  }, {repeat: 190});
  selectButton.addEventListener('click', () => board.children[index]?.click());
  new MutationObserver(() => {
    index = Math.min(index, Math.max(0, board.children.length - 1));
    highlight();
  }).observe(board, {childList:true});
  highlight();
};
