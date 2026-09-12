import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateAndQuote, sanitizeCustomerName, sanitizeOptionalPhone } from '../lib-order-engine.mjs';

const menu = JSON.parse(await readFile(new URL('../data/menu.json', import.meta.url), 'utf8'));

test('calculates server-owned price with extras', () => {
  const quote = validateAndQuote(menu, [
    {
      menuItemId: 'pizza_kebab',
      quantity: 2,
      removeIngredients: ['lök'],
      extraIds: ['extra_cheese'],
    },
    {
      menuItemId: 'drink_coke_33',
      quantity: 1,
      removeIngredients: [],
      extraIds: [],
    },
  ]);

  assert.equal(quote.totalSek, 325);
  assert.equal(quote.items[0].unitPriceSek, 150);
  assert.deepEqual(quote.items[0].removeIngredients, ['lök']);
  assert.equal(quote.totalFormatted.includes('325'), true);
});

test('rejects products not present in the menu', () => {
  assert.throws(() => validateAndQuote(menu, [
    {
      menuItemId: 'pizza_invented_by_model',
      quantity: 1,
      removeIngredients: [],
      extraIds: [],
    },
  ]), /finns inte/);
});

test('rejects impossible ingredient removals', () => {
  assert.throws(() => validateAndQuote(menu, [
    {
      menuItemId: 'pizza_vesuvio',
      quantity: 1,
      removeIngredients: ['kebabkött'],
      extraIds: [],
    },
  ]), /kan inte tas bort/);
});

test('rejects extras that are not allowed for the selected item', () => {
  assert.throws(() => validateAndQuote(menu, [
    {
      menuItemId: 'drink_coke_33',
      quantity: 1,
      removeIngredients: [],
      extraIds: ['extra_cheese'],
    },
  ]), /inte tillåtet/);
});

test('sanitizes customer details', () => {
  assert.equal(sanitizeCustomerName('  Demo  '), 'Demo');
  assert.equal(sanitizeOptionalPhone('+00 000-0000'), '+00 000-0000');
  assert.throws(() => sanitizeOptionalPhone('call-me@example.com'), /ogiltigt format/);
});

test('accepts natural Swedish removal aliases and stores canonical ingredient names', () => {
  const quote = validateAndQuote(menu, [
    {
      menuItemId: 'pizza_kebab',
      quantity: 1,
      removeIngredients: ['löken', 'kebabsåsen'],
      extraIds: [],
    },
  ]);

  assert.deepEqual(quote.items[0].removeIngredients, ['lök', 'kebabsås']);
  assert.equal(quote.totalSek, 135);
});

test('resolves spoken topping names to priced canonical extra IDs', () => {
  const quote = validateAndQuote(menu, [
    {
      menuItemId: 'pizza_vesuvio',
      quantity: 1,
      removeIngredients: [],
      extraIds: ['champinjoner', 'extra lök'],
    },
  ]);

  assert.deepEqual(quote.items[0].extras.map((extra) => extra.id), ['topping_mushrooms', 'topping_onion']);
  assert.equal(quote.totalSek, 135);
  assert.match(quote.summaryLines[0], /extra champinjoner/);
  assert.match(quote.summaryLines[0], /extra lök/);
});

test('supports replacements and separate variants of the same pizza', () => {
  const quote = validateAndQuote(menu, [
    {
      menuItemId: 'pizza_vesuvio',
      quantity: 1,
      removeIngredients: ['skinka'],
      extraIds: ['topping_kebab_meat'],
    },
    {
      menuItemId: 'pizza_vesuvio',
      quantity: 1,
      removeIngredients: [],
      extraIds: [],
    },
  ]);

  assert.equal(quote.items.length, 2);
  assert.deepEqual(quote.items[0].removeIngredients, ['skinka']);
  assert.equal(quote.items[0].extras[0].id, 'topping_kebab_meat');
  assert.equal(quote.totalSek, 250);
});
