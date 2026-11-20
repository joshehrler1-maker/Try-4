/* Original offline-only Scout's Trail puzzles; no paid services or outside tracking. */
(() => {
  'use strict';
  const areas = Object.freeze([
    {
      id: 'meadow', name: 'Sunleaf Meadow', emoji: '🌻',
      stamp: 'Sunleaf Scout', accessory: { id: 'sunleaf', name: 'Sunleaf Ribbon', icon: '🌻' },
      riddles: [
        { clue: 'I flutter between flowers, carrying pollen on my wings. Find me!', choices: ['Butterfly', 'Clock', 'Pebble'], answer: 'Butterfly' },
        { clue: 'My golden face follows the sun all day. Which friend am I?', choices: ['Snowflake', 'Sunflower', 'Seashell'], answer: 'Sunflower' },
        { clue: 'I carry dew in the morning and rustle in the breeze.', choices: ['Leaf', 'Gear', 'Lantern'], answer: 'Leaf' }
      ]
    },
    {
      id: 'grotto', name: 'Starlight Grotto', emoji: '💎',
      stamp: 'Starlight Scout', accessory: { id: 'starlight', name: 'Starlight Charm', icon: '💜' },
      riddles: [
        { clue: 'Deep underground, I sparkle when lantern light reaches me.', choices: ['Ribbon', 'Crystal', 'Mushroom'], answer: 'Crystal' },
        { clue: 'My reflection dances on the dark pool. What shines above?', choices: ['Moon', 'Compass', 'Boot'], answer: 'Moon' },
        { clue: 'I glow softly beside the hidden path but am not a lantern.', choices: ['Glowcap', 'Bell', 'Shell'], answer: 'Glowcap' }
      ]
    },
    {
      id: 'garden', name: 'Clockwork Garden', emoji: '⚙️',
      stamp: 'Clockwork Scout', accessory: { id: 'clockwork', name: 'Clockwork Bow', icon: '🎀' },
      riddles: [
        { clue: 'I have teeth but never bite, and help the fountain turn.', choices: ['Gear', 'Feather', 'Acorn'], answer: 'Gear' },
        { clue: 'I point the way, even when the garden paths twist.', choices: ['Shell', 'Compass', 'Teacup'], answer: 'Compass' },
        { clue: 'I ring softly when the tiny workshop doors open.', choices: ['Berry', 'Bell', 'Leaf'], answer: 'Bell' }
      ]
    },
    {
      id: 'frost', name: 'Frostbell Pass', emoji: '❄️',
      stamp: 'Frostbell Scout', accessory: { id: 'frostbell', name: 'Frostbell Scarf', icon: '🧣' },
      riddles: [
        { clue: 'I leave tiny marks in fresh snow when our cat friends visit.', choices: ['Pawprints', 'Key', 'Gear'], answer: 'Pawprints' },
        { clue: 'No two of my delicate shapes are exactly alike.', choices: ['Map', 'Snowflake', 'Lantern'], answer: 'Snowflake' },
        { clue: 'I hang from a chilly ledge and sparkle in the morning.', choices: ['Icicle', 'Petal', 'Feather'], answer: 'Icicle' }
      ]
    }
  ]);
  const byId = Object.freeze(Object.fromEntries(areas.map(area => [area.id, area])));
  function validList(value) { return Array.isArray(value) ? value : []; }
  function clueFor(area, day) {
    const seed = String(day || '') + ':' + area.id;
    let hash = 0;
    for (const letter of seed) hash = (hash * 31 + letter.codePointAt(0)) >>> 0;
    return area.riddles[hash % area.riddles.length];
  }
  function read(progress, day) {
    const done = progress?.scoutDay === day
      ? validList(progress.scoutCompleted).filter(id => Object.hasOwn(byId, id))
      : [];
    const stamps = validList(progress?.companion?.scoutStamps).filter(id => Object.hasOwn(byId, id));
    const journal = validList(progress?.scoutJournal)
      .filter(entry => entry && Object.hasOwn(byId, entry.area) && typeof entry.day === 'string')
      .slice(-12).reverse();
    return { day, hasCompanion: Boolean(progress?.companion),
      companion: progress?.companion?.name || 'Your companion',
      completed: done, stamps, journal,
      areas: areas.map(area => ({
        id: area.id, name: area.name, emoji: area.emoji,
        stamp: area.stamp, accessory: area.accessory,
        riddle: clueFor(area, day), completed: done.includes(area.id),
        stamped: stamps.includes(area.id)
      }))
    };
  }
  function solve(progress, areaId, answer, day) {
    if (!Object.hasOwn(byId, areaId) || typeof day !== 'string' || !day) return { ok: false, message: 'That trail is unavailable.' };
    const area = byId[areaId];
    const pet = progress?.companion;
    if (!pet || typeof pet !== 'object') return { ok: false, message: 'Adopt a cat in Companion Cottage before setting off.' };
    const current = read(progress, day);
    if (current.completed.includes(areaId)) return { ok: false, message: 'That trail has already been explored today. More clues arrive tomorrow!' };
    const riddle = clueFor(area, day);
    if (!riddle.choices.includes(answer)) return { ok: false, message: 'Choose one of the three trail clues.' };
    if (answer !== riddle.answer) return { ok: false, message: 'Not quite! Read the clue again and try another discovery.' };
    // One reward per area and local day across this browser, regardless of cat switches.
    progress.scoutDay = day;
    progress.scoutCompleted = [...new Set([...current.completed, areaId])];
    const previousStamps = validList(pet.scoutStamps).filter(id => Object.hasOwn(byId, id));
    const newStamp = !previousStamps.includes(areaId);
    pet.scoutStamps = [...new Set([...previousStamps, areaId])];
    progress.scoutJournal = [...validList(progress.scoutJournal), {
      area: areaId, day, cat: String(pet.name || 'Companion').slice(0, 24)
    }].slice(-12);
    pet.bondPoints = Math.min(100, Math.max(0, Number.isSafeInteger(pet.bondPoints) ? pet.bondPoints : 0) + 1);
    const coins = Number.isSafeInteger(progress.coins) && progress.coins >= 0 ? progress.coins : 0;
    progress.coins = Math.min(Number.MAX_SAFE_INTEGER, coins + 2);
    const title = newStamp ? ' You unlocked the ' + area.accessory.name + ' for this cat!' : '';
    return { ok: true, message: 'Trail solved! ' + pet.name + ' found the ' + area.stamp +
      '. Friendship +1 and 2 free Paw Coins.' + title, area: areaId };
  }
  function equip(progress, accessoryId) {
    const pet = progress?.companion;
    if (!pet) return { ok: false, message: 'Adopt a cat before choosing an accessory.' };
    if (accessoryId === 'none') {
      pet.scoutAccessory = '';
      return { ok: true, message: 'Your companion is wearing their everyday look.' };
    }
    const area = areas.find(entry => entry.accessory.id === accessoryId);
    if (!area || !validList(pet.scoutStamps).includes(area.id)) {
      return { ok: false, message: 'Explore this area with your cat to unlock the accessory first.' };
    }
    pet.scoutAccessory = accessoryId;
    return { ok: true, message: pet.name + ' is wearing the ' + area.accessory.name + '!' };
  }
  function accessoryFor(cat) {
    const area = areas.find(entry => entry.accessory.id === cat?.scoutAccessory &&
      validList(cat?.scoutStamps).includes(entry.id));
    return area?.accessory || null;
  }
  window.PawtopiaScout = Object.freeze({ areas, read, solve, equip, accessoryFor });
})();
