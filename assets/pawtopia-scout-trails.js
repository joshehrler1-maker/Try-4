/* Scout's Trail view: all discovery content is local and family-friendly. */
(() => {
  'use strict';
  const save = window.PawtopiaSave;
  const scout = window.PawtopiaScout;
  const el = id => document.getElementById(id);
  if (!save || !scout || !el('trail-cards')) return;

  function render(message = '') {
    const progress = save.read();
    const state = scout.read(progress, save.today());
    el('scout-cat').textContent = state.hasCompanion ? state.companion : 'Adopt a cat to begin';
    el('scout-coins').textContent = String(Number.isSafeInteger(progress.coins) && progress.coins >= 0 ? progress.coins : 0);
    el('scout-progress').textContent = state.completed.length + ' of ' + state.areas.length;
    el('scout-stamps').textContent = state.stamps.length + ' of ' + state.areas.length;
    if (message) el('scout-message').textContent = message;
    else el('scout-message').textContent = !state.hasCompanion
      ? 'No cat yet? Visit Companion Cottage to adopt a friend first.'
      : state.completed.length === state.areas.length
        ? 'Amazing exploring! All four trails are complete today. New clues arrive tomorrow.'
        : state.companion + ' is ready to discover something new!';
    for (const area of state.areas) {
      const clue = el('clue-' + area.id);
      const answers = el('answers-' + area.id);
      const status = el('state-' + area.id);
      clue.textContent = area.completed ? 'Mystery solved! Visit again tomorrow for a fresh clue.' : area.riddle.clue;
      const buttons = area.riddle.choices.map(choice => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = choice;
        button.dataset.trailArea = area.id;
        button.dataset.trailAnswer = choice;
        button.disabled = !state.hasCompanion || area.completed;
        return button;
      });
      answers.replaceChildren(...buttons);
      status.textContent = area.completed ? '✓ Explored today' : !state.hasCompanion ? 'Adopt a cat to unlock this trail' :
        area.stamped ? 'Ready · Stamp already discovered' : 'Ready · New stamp to find';
    }
    const keepsakes = state.areas.map(area => {
      const li = document.createElement('li');
      li.textContent = (area.stamped ? '✅ ' : '🔒 ') + area.emoji + ' ' + area.stamp + ' · ' +
        (area.stamped ? area.accessory.name + ' unlocked' : 'Explore to unlock ' + area.accessory.name);
      return li;
    });
    el('scout-keepsakes').replaceChildren(...keepsakes);
    const journal = state.journal.map(entry => {
      const li = document.createElement('li');
      const area = scout.areas.find(item => item.id === entry.area);
      li.textContent = entry.day + ' · ' + entry.cat + ' found ' + area.stamp;
      return li;
    });
    if (!journal.length) {
      const li = document.createElement('li');
      li.textContent = 'Your first trail memory is waiting.';
      journal.push(li);
    }
    el('scout-journal').replaceChildren(...journal);
  }

  async function explore(areaId, answer) {
    const message = await save.update(progress => scout.solve(progress, areaId, answer, save.today()).message);
    render(message);
  }
  el('trail-cards').addEventListener('click', event => {
    const button = event.target.closest('button[data-trail-area]');
    if (!button || button.disabled) return;
    // Disable during the async save to prevent double clicks on slower devices.
    button.disabled = true;
    explore(button.dataset.trailArea, button.dataset.trailAnswer);
  });
  window.addEventListener('pageshow', () => render());
  window.addEventListener('storage', () => render());
  render();
})();
