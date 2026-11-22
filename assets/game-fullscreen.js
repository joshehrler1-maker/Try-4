(() => {
  const stage = document.querySelector('[data-fullscreen-game]');
  if (!stage) return;

  const modal = stage.hasAttribute?.('data-fullscreen-modal');
  const isolated = [];
  function isolatePage(value) {
    if (!modal) return;
    if (!value) {
      for (const node of isolated.splice(0)) node.inert = false;
      return;
    }
    for (let node = stage; node && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && !sibling.inert) {
          sibling.inert = true;
          isolated.push(sibling);
        }
      }
    }
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-fullscreen-toggle';
  button.textContent = '⛶ Full screen';
  button.setAttribute('aria-pressed', 'false');
  const toolbar = document.createElement('div');
  toolbar.className = 'game-fullscreen-tools';
  toolbar.append(button);
  stage.prepend(toolbar);

  let expanded = false;
  let busy = false;
  const isNative = () => document.fullscreenElement === stage;
  function sync() {
    const active = expanded || isNative();
    button.textContent = active ? 'Exit full screen' : '⛶ Full screen';
    button.setAttribute('aria-pressed', String(active));
  }
  function setExpanded(value) {
    expanded = value;
    stage.classList.toggle('game-fullscreen-expanded', value);
    document.body.classList.toggle('game-fullscreen-lock', value);
    isolatePage(value);
    sync();
    button.focus({preventScroll: true});
  }

  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      if (expanded) setExpanded(false);
      else if (isNative()) await document.exitFullscreen();
      else if (stage.requestFullscreen) {
        try { await stage.requestFullscreen(); }
        catch { setExpanded(true); }
      } else setExpanded(true);
    } finally {
      busy = false;
      sync();
    }
  });
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('keydown', event => {
    if (!expanded || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    setExpanded(false);
  }, true);
  addEventListener('pagehide', () => { if (expanded) setExpanded(false); });
})();