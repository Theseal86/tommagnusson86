const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
});

export function formatSek(value) {
  return sekFormatter.format(value);
}

function assertPlainString(value, field, maxLength = 140) {
  if (typeof value !== 'string') {
    throw new Error(`${field} måste vara text.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new Error(`${field} måste innehålla 1–${maxLength} tecken.`);
  }
  return trimmed;
}

function uniqueStrings(value, field) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`${field} måste vara en lista.`);
  const normalized = value.map((entry) => assertPlainString(entry, field, 80));
  return [...new Set(normalized)];
}

function normalizeLookup(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('sv-SE')
    .replace(/[.,;:!?()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ingredientAliasTargets = new Map([
  ['löken', 'lök'],
  ['gul lök', 'lök'],
  ['champinjon', 'champinjoner'],
  ['svamp', 'champinjoner'],
  ['tomaten', 'tomat'],
  ['paprikan', 'paprika'],
  ['oliv', 'oliver'],
  ['kronärtskockor', 'kronärtskocka'],
  ['räka', 'räkor'],
  ['mussla', 'musslor'],
  ['osten', 'ost'],
  ['skinkan', 'skinka'],
  ['ananasen', 'ananas'],
  ['kebabköttet', 'kebabkött'],
  ['köttfärsen', 'köttfärs'],
  ['feferonin', 'feferoni'],
  ['kebabsåsen', 'kebabsås'],
  ['tomatsåsen', 'tomatsås'],
  ['isbergssalladen', 'isbergssallad'],
  ['sallad', 'isbergssallad'],
  ['jalapeno', 'jalapeño'],
]);

function resolveRemovedIngredients(menuItem, rawValues, field) {
  const requested = uniqueStrings(rawValues, field);
  const removable = menuItem.removableIngredients ?? menuItem.ingredients ?? [];
  const canonicalByLookup = new Map(removable.map((ingredient) => [normalizeLookup(ingredient), ingredient]));

  for (const [alias, target] of ingredientAliasTargets.entries()) {
    const targetCanonical = canonicalByLookup.get(normalizeLookup(target));
    if (targetCanonical) canonicalByLookup.set(normalizeLookup(alias), targetCanonical);
  }

  return requested.map((ingredient) => {
    const cleaned = normalizeLookup(ingredient)
      .replace(/^(utan|ingen|inget|ta bort)\s+/, '')
      .trim();
    const canonical = canonicalByLookup.get(cleaned);
    if (!canonical) throw new Error(`${ingredient} kan inte tas bort från ${menuItem.name}.`);
    return canonical;
  }).filter((value, index, values) => values.indexOf(value) === index);
}

function buildExtraLookup(menu) {
  const lookup = new Map();
  for (const extra of menu.extras) {
    const labels = [extra.id, extra.name, ...(Array.isArray(extra.aliases) ? extra.aliases : [])];
    for (const label of labels) {
      const normalized = normalizeLookup(label);
      if (normalized) lookup.set(normalized, extra);
    }
  }
  return lookup;
}

function resolveExtras(menu, menuItem, rawValues, field) {
  const requested = uniqueStrings(rawValues, field);
  const allowedExtras = new Set(menuItem.allowedExtras ?? []);
  const extraLookup = buildExtraLookup(menu);

  return requested.map((rawExtra) => {
    const lookupValue = normalizeLookup(rawExtra)
      .replace(/^(lägg till|lagg till|med|extra)\s+/, '')
      .trim();
    const extra = extraLookup.get(normalizeLookup(rawExtra)) || extraLookup.get(lookupValue);
    if (!extra || extra.available === false || !allowedExtras.has(extra.id)) {
      throw new Error(`Tillvalet ${rawExtra} är inte tillåtet för ${menuItem.name}.`);
    }
    return { id: extra.id, name: extra.name, priceSek: extra.priceSek };
  }).filter((extra, index, values) => values.findIndex((candidate) => candidate.id === extra.id) === index);
}

export function validateAndQuote(menu, rawItems) {
  if (!menu || !Array.isArray(menu.items) || !Array.isArray(menu.extras)) {
    throw new Error('Menyn är felkonfigurerad.');
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Beställningen måste innehålla minst en produkt.');
  }
  if (rawItems.length > 30) {
    throw new Error('Beställningen är för stor för den automatiska receptionisten.');
  }

  const itemById = new Map(menu.items.map((item) => [item.id, item]));

  const quotedItems = rawItems.map((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      throw new Error(`Rad ${index + 1} är ogiltig.`);
    }

    const menuItemId = assertPlainString(rawItem.menuItemId, `menuItemId på rad ${index + 1}`, 80);
    const menuItem = itemById.get(menuItemId);
    if (!menuItem || menuItem.available === false) {
      throw new Error(`Produkten ${menuItemId} finns inte eller är inte tillgänglig.`);
    }

    const quantity = Number(rawItem.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error(`Antalet på rad ${index + 1} måste vara mellan 1 och 20.`);
    }

    const removeIngredients = resolveRemovedIngredients(
      menuItem,
      rawItem.removeIngredients,
      `removeIngredients på rad ${index + 1}`,
    );

    const extras = resolveExtras(
      menu,
      menuItem,
      rawItem.extraIds,
      `extraIds på rad ${index + 1}`,
    );

    let notes = '';
    if (rawItem.notes != null && rawItem.notes !== '') {
      notes = assertPlainString(rawItem.notes, `Anteckning på rad ${index + 1}`, 120);
    }

    const unitPriceSek = menuItem.priceSek + extras.reduce((sum, extra) => sum + extra.priceSek, 0);
    const lineTotalSek = unitPriceSek * quantity;

    return {
      menuItemId,
      name: menuItem.name,
      quantity,
      removeIngredients,
      extras,
      notes,
      unitPriceSek,
      unitPriceFormatted: formatSek(unitPriceSek),
      lineTotalSek,
      lineTotalFormatted: formatSek(lineTotalSek),
      allergens: menuItem.allergens ?? [],
    };
  });

  const totalSek = quotedItems.reduce((sum, item) => sum + item.lineTotalSek, 0);
  const summaryLines = quotedItems.map((item) => {
    const changes = [];
    if (item.removeIngredients.length) changes.push(`utan ${item.removeIngredients.join(', ')}`);
    if (item.extras.length) changes.push(`med ${item.extras.map((extra) => extra.name).join(', ')}`);
    if (item.notes) changes.push(item.notes);
    return `${item.quantity} × ${item.name}${changes.length ? ` (${changes.join('; ')})` : ''}`;
  });

  return {
    items: quotedItems,
    totalSek,
    totalFormatted: formatSek(totalSek),
    summaryLines,
  };
}

export function sanitizeCustomerName(value) {
  return assertPlainString(value, 'Kundnamn', 60);
}

export function sanitizeOptionalPhone(value) {
  if (value == null || value === '') return '';
  const phone = assertPlainString(value, 'Telefonnummer', 30);
  if (!/^[+()\d\s-]{5,30}$/.test(phone)) {
    throw new Error('Telefonnumret har ett ogiltigt format.');
  }
  return phone;
}
