'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const bondScript = read('assets/pawtopia-pet-bond.js');
const cottageScript = read('assets/companion-cottage.js');

class Element {
  constructor(id) {
    this.id = id;
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.textContent = '';
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
  }
  addEventListener(event, listener) { this.listeners[event] = listener; }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  focus() {}
}
const clone = value => JSON.parse(JSON.stringify(value));
const initial = () => ({
  coins: 15, food: 2, toy: false, companion: null, otherCompanions: [],
  townCollection: {}, capeEquipped: false, bedPlaced: false, lastBedRest: ''
});
function createCottage(seed = initial()) {
  const nodes = new Map();
  const element = id => {
    if (!nodes.has(id)) nodes.set(id, new Element(id));
    return nodes.get(id);
  };
  const buttons = ['brush', 'story', 'explore'].map(action => {
    const button = element('bond-' + action);
    button.dataset.petBond = action;
    button.textContent = action;
    return button;
  });
  const document = {
    getElementById: element,
    createElement: tag => new Element(tag),
    querySelectorAll: selector => {
      assert.equal(selector, '[data-pet-bond]');
      return buttons;
    }
  };
  let progress = clone(seed);
  let day = 'Fri Nov 20 2026';
  const save = {
    read: () => clone(progress),
    today: () => day,
    battleStats: cat => ({
      level: 1, strength: 2, defence: 2, movement: 2, endurance: 2,
      intelligence: 2, ...cat?.stats
    }),
    maxHealth: stats => 8 + stats.endurance * 2,
    update: async change => {
      const next = clone(progress);
      const message = change(next);
      if (message) progress = next;
      return message;
    }
  };
  const window = { PawtopiaSave: save };
  class FakeFormData {
    get(key) { return key === 'breed' ? 'Maine Coon' : null; }
  }
  const context = {
    window, document, addEventListener() {}, Date, FormData: FakeFormData,
    Object, String, Number, Math, Array, Boolean
  };
  vm.runInNewContext(bondScript, context, {filename: 'pawtopia-pet-bond.js'});
  vm.runInNewContext(cottageScript, context, {filename: 'companion-cottage.js'});
  const adopt = async name => {
    element('cat-name').value = name;
    await element('adopt').listeners.submit({
      preventDefault() {},
      currentTarget: {}
    });
    // The DOM submit listener starts an async save without returning its promise.
    // Wait through its microtask-render turn before asserting visual state.
    await new Promise(resolve => setImmediate(resolve));
  };
  return { element, buttons, adopt, get: () => clone(progress), setDay: value => { day = value; } };
}

test('adoption shows care, collection and the private friendship journal', async () => {
  const page = createCottage();
  assert.equal(page.element('care').hidden, true);
  assert.equal(page.element('pet-bond-panel').hidden, true);
  assert.equal(page.element('pet-album-count').textContent, '0 of 4 companions adopted');

  await page.adopt('Mochi');
  assert.equal(page.get().companion.name, 'Mochi');
  assert.equal(page.element('care').hidden, false);
  assert.equal(page.element('pet-bond-panel').hidden, false);
  assert.equal(page.element('pet-album-count').textContent, '1 of 4 companions adopted');
  assert.equal(page.element('pet-album-cards').children.length, 1);
  assert.equal(page.element('pet-bond-title').textContent, 'New Friend');
  assert.equal(page.element('pet-bond-value').textContent, '0/100 friendship');
});

test('pet activities preserve save data, update journal and cannot be farmed twice', async () => {
  const page = createCottage();
  await page.adopt('Mochi');
  await page.buttons[0].listeners.click();
  const afterFirst = page.get();
  assert.ok(afterFirst.companion.bondPoints >= 1);
  assert.equal(page.buttons[0].disabled, true);
  assert.equal(page.element('pet-bond-memories').children.length, 1);
  assert.match(
    page.element('pet-album-cards').children[0].children[1].children[3].textContent,
    /Last memory: Brushed fur/
  );
  await page.buttons[0].listeners.click();
  assert.deepEqual(page.get(), afterFirst, 'Repeated daily action must not mutate stored data');
  assert.equal(page.get().coins, 15);
  assert.equal(page.get().food, 2);
});

test('switching cats keeps their personality, friendship and journal independent', async () => {
  const page = createCottage();
  await page.adopt('Mochi');
  await page.buttons[0].listeners.click();
  const originalPoints = page.get().companion.bondPoints;
  await page.adopt('Snowflake');
  assert.equal(page.get().otherCompanions.length, 1);
  page.element('active-cat').value = '1';
  await page.element('active-cat').listeners.change();
  // The change handler also starts an async save without returning the promise.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.get().companion.name, 'Snowflake');
  assert.equal(page.get().companion.bondPoints || 0, 0);
  assert.equal(page.get().otherCompanions[0].bondPoints, originalPoints);
  assert.equal(
    page.element('pet-album-cards').children[0].children[1].children[0].textContent,
    'Snowflake · Active'
  );
  await page.buttons[1].listeners.click();
  assert.ok(page.get().companion.bondPoints >= 1);
  assert.equal(page.get().otherCompanions[0].bondPoints, originalPoints);
});

test('four-cat capacity is enforced; next day refreshes free activities', async () => {
  const page = createCottage();
  for(const name of ['Mochi', 'Snowflake', 'Cloud', 'Star']) await page.adopt(name);
  assert.equal(page.element('pet-album-cards').children.length, 4);
  assert.equal(page.element('adopt').hidden, true);
  await page.adopt('Fifth');
  assert.equal(page.get().otherCompanions.length, 3);
  assert.equal(page.element('pet-album-cards').children.length, 4);
  await page.buttons[0].listeners.click();
  assert.equal(page.buttons[0].disabled, true);
  page.setDay('Sat Nov 21 2026');
  // Pageshow causes a fresh render, as it does when returning to the cottage.
  const source = read('assets/companion-cottage.js');
  assert.match(source, /addEventListener\('pageshow', render\)/);
  const apiWindow = {};
  vm.runInNewContext(bondScript, {window:apiWindow, Date, Object, Array, Number, String, Math});
  assert.equal(apiWindow.PawtopiaPetBond.read(page.get().companion, 'Sat Nov 21 2026').available.length, 3);
});
