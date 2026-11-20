/* Original, offline-only pet bonding. Stores per-cat memories in the existing Pawtopia local save. */
(() => {
  'use strict';
  const activities = Object.freeze({
    brush: { label: 'Brushed fur', symbol: '🪮' },
    story: { label: 'Read a story', symbol: '📖' },
    explore: { label: 'Explored the cottage', symbol: '🐾' }
  });
  const personalities = Object.freeze([
    { name: 'Gentle', favorite: 'brush', description: 'Loves quiet care and a gentle brushing.' },
    { name: 'Curious', favorite: 'explore', description: 'Always eager to discover something new.' },
    { name: 'Dreamer', favorite: 'story', description: 'Enjoys a cozy story and a calm afternoon.' },
    { name: 'Playful', favorite: 'explore', description: 'Loves an adventure around the cottage.' }
  ]);
  const levels = Object.freeze([
    { points: 0, title: 'New Friend', memory: 'First hello' },
    { points: 6, title: 'Paw Pal', memory: 'Paw Pal' },
    { points: 18, title: 'Best Buddy', memory: 'Best Buddy' },
    { points: 40, title: 'Forever Friend', memory: 'Forever Friend' }
  ]);
  const validScore = value => Number.isSafeInteger(value) ? Math.max(0, Math.min(100, value)) : 0;
  function personality(cat) {
    const seed = String(cat?.breed || 'Cat') + '|' + String(cat?.name || '');
    let hash = 0;
    for (const char of seed) hash = (hash + char.codePointAt(0)) % 1009;
    return personalities[hash % personalities.length];
  }
  function activityLog(cat, day) {
    const current = cat?.bondCare;
    return current && current.day === day && Array.isArray(current.done)
      ? current.done.filter(action => Object.hasOwn(activities, action))
      : [];
  }
  function read(cat, day) {
    const temperament = personality(cat);
    const points = validScore(cat?.bondPoints);
    const level = levels.filter(entry => points >= entry.points).at(-1);
    const done = activityLog(cat, day);
    const memories = Array.isArray(cat?.bondMemories) ? cat.bondMemories
      .filter(entry => entry && Object.hasOwn(activities, entry.activity) && typeof entry.day === 'string')
      .slice(-8).reverse() : [];
    return {
      temperament, points, title: level.title,
      badges: levels.filter(entry => points >= entry.points).map(entry => entry.memory),
      done, memories, available: Object.keys(activities).filter(action => !done.includes(action))
    };
  }
  function perform(cat, action, day) {
    if (!cat || typeof cat !== 'object') return { ok: false, message: 'Adopt a cat first.' };
    if (!Object.hasOwn(activities, action) || typeof day !== 'string' || !day) {
      return { ok: false, message: 'This activity is unavailable.' };
    }
    if (activityLog(cat, day).includes(action)) {
      return { ok: false, message: 'You already enjoyed that activity together today.' };
    }
    const before = read(cat, day);
    const gain = before.temperament.favorite === action ? 2 : 1;
    const points = Math.min(100, before.points + gain);
    const done = [...before.done, action];
    cat.bondPoints = points;
    cat.bondCare = { day, done };
    const oldMemories = Array.isArray(cat.bondMemories) ? cat.bondMemories : [];
    cat.bondMemories = [...oldMemories, { day, activity: action }].slice(-8);
    const after = read(cat, day);
    const milestone = after.title !== before.title ? ' New friendship milestone: ' + after.title + '!' : '';
    const name = String(cat.name || 'Your cat').slice(0, 24);
    return { ok: true, message: name + ': ' + activities[action].label.toLowerCase() + '. Friendship +' + gain + '!' + milestone };
  }
  window.PawtopiaPetBond = Object.freeze({ activities, personality, read, perform });
})();