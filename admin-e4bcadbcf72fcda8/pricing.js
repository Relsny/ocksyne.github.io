(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DCASPricing = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function composer(data, ids) {
    const sum = ids.reduce((total, id) => total + data.modules[id].price, 0);
    const count = ids.length;
    const libre = count >= data.libreMin;
    const total = libre ? Math.ceil(sum * (1 - data.libreDisc)) : sum;
    const discount = Math.round((sum - total) * 100) / 100;
    return { sum, count, libre, total, discount };
  }

  function cheaperPack(data, ids, total) {
    return data.packs
      .filter((pack) => ids.every((id) => pack.modules.includes(id)) && pack.price < total)
      .sort((a, b) => a.price - b.price)[0] || null;
  }

  function oddFive(data) {
    const ids = Object.keys(data.modules).sort((a, b) => data.modules[a].price - data.modules[b].price || a.localeCompare(b));
    const base = ids.slice(0, 4);
    const baseSum = base.reduce((total, id) => total + data.modules[id].price, 0);
    const extra = ids.slice(4).find((id) => (baseSum + data.modules[id].price) % 2 === 1);
    return extra ? [...base, extra] : null;
  }

  function cases(data) {
    const rows = [];
    const ids = Object.keys(data.modules);
    const pushComposer = (kind, label, selected) => {
      rows.push({ kind, label, ids: selected, ...composer(data, selected) });
    };
    pushComposer('vide', 'Sélection vide', []);
    for (const id of ids) pushComposer('module', data.modules[id].name, [id]);
    const sorted = [...ids].sort((a, b) => data.modules[a].price - data.modules[b].price || a.localeCompare(b));
    pushComposer('seuil', '4 modules les moins chers — sous le seuil', sorted.slice(0, 4));
    pushComposer('seuil', '5 modules les moins chers — Pack Libre', sorted.slice(0, 5));
    const odd = oddFive(data);
    if (odd) pushComposer('ceil', '5 modules, somme impaire — Math.ceil', odd);
    pushComposer('tout', `Les ${ids.length} modules cochés`, ids);
    for (const pack of [...data.packs, ...data.tpacks]) {
      const quoted = composer(data, pack.modules);
      rows.push({
        kind: 'pack',
        label: pack.name,
        ids: pack.modules,
        ...quoted,
        packPrice: pack.price,
        shown: pack.price,
      });
    }
    return rows;
  }

  return { composer, cheaperPack, cases };
}));
