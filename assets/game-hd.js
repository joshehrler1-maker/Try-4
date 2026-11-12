(() => {
  const canvas = document.querySelector('canvas[data-hd]');
  if (!canvas) return;
  const width = Number(canvas.getAttribute('width'));
  const height = Number(canvas.getAttribute('height'));
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  function resize() {
    const displayWidth = canvas.clientWidth;
    if (!displayWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const maxWidth = Math.min(1920, Math.round(1080 * width / height));
    const targetWidth = Math.min(maxWidth, Math.max(width, Math.round(displayWidth * dpr)));
    const targetHeight = Math.round(targetWidth * height / width);
    if (canvas.width === targetWidth && canvas.height === targetHeight) return;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.setTransform(targetWidth / width, 0, 0, targetHeight / height, 0, 0);
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);
})();