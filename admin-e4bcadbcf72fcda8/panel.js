(function () {
  const BUILD = (document.currentScript && new URL(document.currentScript.src, location.href).searchParams.get('v')) || 'dev';
  function bust(url) {
    const target = new URL(url, location.href);
    target.searchParams.set('v', BUILD);
    return target.toString();
  }
  const $ = (selector, root = document) => root.querySelector(selector);
  const toast = (text) => {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('on'), 2800);
  };
  const euro = (value) => `${String(value).replace('.', ',')} €`;

  function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(code) {
    const re = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\[\s\S]|[^`])*`|'(?:\\.|[^'\n\\])*'|"(?:\\.|[^"\n\\])*"|\/(?![/*])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n])+\/[gimsuy]*|\b(?:const|let|var|function|return|if|else|await|async|new|throw|try|catch|finally|for|of|in|while|switch|case|break|continue|typeof|class|true|false|null)\b|\b\d+(?:\.\d+)?\b/g;
    let html = '';
    let last = 0;
    for (const match of code.matchAll(re)) {
      html += escapeHtml(code.slice(last, match.index));
      const token = match[0];
      const kind = token.startsWith('/*') || token.startsWith('//') ? 'com'
        : token.startsWith('/') || token.startsWith('"') || token.startsWith("'") || token.startsWith('`') ? 'str'
          : /^\d/.test(token) ? 'num' : 'kw';
      html += `<span class="${kind}">${escapeHtml(token)}</span>`;
      last = match.index + token.length;
    }
    return html + escapeHtml(code.slice(last));
  }

  function fileUrl(path) {
    return `bot/${path.split('/').map(encodeURIComponent).join('/')}`;
  }

  const cache = new Map();
  async function fetchText(path) {
    if (cache.has(path)) return cache.get(path);
    const response = await fetch(bust(fileUrl(path)));
    if (!response.ok) throw new Error(`${path} (${response.status})`);
    const text = await response.text();
    cache.set(path, text);
    return text;
  }

  function saveBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  }

  async function fetchBytes(url) {
    const response = await fetch(bust(url));
    if (!response.ok) throw new Error(`${url} (${response.status})`);
    return response.arrayBuffer();
  }

  function keptCodePath(path) {
    if (path.includes('METS TON TOKEN')) return false;
    if (path === 'enabled.json') return false;
    return true;
  }

  async function premiumZip(slugs, filename) {
    const names = Object.fromEntries(catalog.modules.map((mod) => [mod.id, mod.name]));
    const readmes = {};
    await Promise.all(slugs.map(async (slug) => {
      const readme = (manifest.modules[slug] || []).find((path) => path.endsWith('README.md'));
      if (readme) readmes[slug] = await fetchText(readme);
    }));
    const paths = manifest.base.filter(keptCodePath);
    slugs.forEach((slug) => paths.push(...(manifest.modules[slug] || [])));
    const codeFiles = await Promise.all(paths.map(async (path) => ({ path, text: await fetchText(path) })));
    const logoBytes = new Uint8Array(await fetchBytes('logo.png'));
    const entries = DCASPack.entries({ slugs, names, readmes, logoBytes, codeFiles });
    const zip = new JSZip();
    for (const entry of entries) {
      const mode = entry.unixPermissions != null ? entry.unixPermissions : (entry.exec ? 0o100755 : null);
      const options = mode == null ? {} : { unixPermissions: mode };
      zip.file(entry.path, entry.bytes || entry.text, options);
    }
    saveBlob(await zip.generateAsync({ type: 'blob', platform: 'UNIX' }), filename);
  }

  function parseSite(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const data = JSON.parse(doc.querySelector('#dcas-data').textContent);
    const modules = [...doc.querySelectorAll('article.mod')].map((article) => {
      const id = article.querySelector('[data-id]')?.dataset.id;
      return {
        id,
        name: article.querySelector('h3')?.textContent.trim() || data.modules[id].name,
        description: article.querySelector('.mod-desc')?.textContent.trim() || '',
        features: [...article.querySelectorAll('.mod-list li')].map((item) => item.textContent.trim()),
        price: data.modules[id].price,
      };
    });
    return { data, modules };
  }

  let manifest;
  let catalog;
  let siteData;
  const selected = new Set();
  let pickedPack = null;

  function packs() {
    return [...siteData.packs, ...siteData.tpacks];
  }

  function selectedIds() {
    return catalog.modules.map((mod) => mod.id).filter((id) => selected.has(id));
  }

  function activePack() {
    if (!pickedPack) return null;
    const pack = packs().find((item) => item.id === pickedPack);
    if (!pack) return null;
    const ids = selectedIds();
    const same = pack.modules.length === ids.length && pack.modules.every((id) => selected.has(id));
    return same ? pack : null;
  }

  function renderQuote() {
    const ids = selectedIds();
    const quoted = DCASPricing.composer(siteData, ids);
    const pack = activePack();
    const shown = pack ? pack.price : quoted.total;
    $('#quote').innerHTML = [
      ['Modules', String(quoted.count)],
      ['Somme', euro(quoted.sum)],
      ['Remise', quoted.libre ? `− ${euro(quoted.discount).replace(' €', '')} €` : '—'],
      [pack ? 'Prix du pack' : 'Prix compositeur', euro(shown)],
    ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('');
    if (pack) {
      $('#hint').textContent = `Prix affiché au client pour le ${pack.name} : ${euro(pack.price)}. Si ces ${quoted.count} modules étaient cochés un par un : ${euro(quoted.total)}.`;
    } else if (!ids.length) {
      $('#hint').textContent = `Coche des modules. Dès ${siteData.libreMin} modules : −50 % (Pack Libre).`;
    } else {
      const better = DCASPricing.cheaperPack(siteData, ids, quoted.total);
      if (better) $('#hint').textContent = `Le ${better.name} contient tout ça (et plus) pour ${euro(better.price)}.`;
      else if (!quoted.libre) $('#hint').textContent = `Encore ${siteData.libreMin - quoted.count} module${siteData.libreMin - quoted.count > 1 ? 's' : ''} pour le Pack Libre à −50 %.`;
      else $('#hint').textContent = 'Pack Libre activé : moitié prix, arrondi à l’euro supérieur.';
    }
    $('#download-bot').disabled = ids.length === 0;
  }

  function renderChecks() {
    $('#check-grid').innerHTML = catalog.modules.map((mod) => `
      <label class="${selected.has(mod.id) ? 'on' : ''}">
        <input type="checkbox" data-id="${mod.id}" ${selected.has(mod.id) ? 'checked' : ''}>
        <span>${mod.name}<br><small style="color:var(--dim)">${euro(mod.price)}</small></span>
      </label>`).join('');
    $('#check-grid').querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', () => {
        pickedPack = null;
        if (input.checked) selected.add(input.dataset.id);
        else selected.delete(input.dataset.id);
        renderChecks();
        renderQuote();
      });
    });
  }

  function renderPacks() {
    $('#pack-buttons').innerHTML = packs().map((pack) => `<button class="btn btn-ghost btn-sm" type="button" data-pack="${pack.id}">${pack.name} · ${euro(pack.price)}</button>`).join('');
    $('#pack-buttons').querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const pack = packs().find((item) => item.id === button.dataset.pack);
        selected.clear();
        pack.modules.forEach((id) => selected.add(id));
        pickedPack = pack.id;
        renderChecks();
        renderQuote();
        toast(`${pack.name} sélectionné`);
      });
    });
  }

  function renderCards() {
    const tree = DCASPack.TREE.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
    $('#module-grid').innerHTML = catalog.modules.map((mod) => `
      <article class="acard">
        <div class="card-top"><img src="logo.png" alt=""><div><div class="price-tag">${euro(mod.price)}</div><h3>${escapeHtml(mod.name)}</h3></div></div>
        <p>${escapeHtml(mod.description)}</p>
        <ul>${mod.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
        <ol class="layout">${tree}</ol>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-view="${mod.id}">Voir le code</button>
          <button class="btn btn-main btn-sm" type="button" data-zip="${mod.id}">Télécharger</button>
        </div>
      </article>`).join('');
    $('#module-grid').querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => openViewer(button.dataset.view));
    });
    $('#module-grid').querySelectorAll('[data-zip]').forEach((button) => {
      button.addEventListener('click', () => downloadModule(button.dataset.zip));
    });
  }

  function renderTests() {
    const rows = DCASPricing.cases(siteData);
    const head = '<tr><th>Cas</th><th>Détail</th><th>Somme</th><th>Remise</th><th>Prix compositeur</th><th>Prix du pack</th><th>Prix payé</th></tr>';
    const body = rows.map((row) => {
      const names = row.ids.map((id) => escapeHtml(siteData.modules[id].name)).join(', ');
      const paid = row.kind === 'pack' ? row.packPrice : row.total;
      return `<tr class="${row.kind === 'pack' ? 'pack' : ''}"><td>${escapeHtml(row.label)}</td><td>${row.count} · ${names || '—'}</td><td>${euro(row.sum)}</td><td>${row.libre ? euro(row.discount) : '—'}</td><td>${euro(row.total)}</td><td>${row.kind === 'pack' ? euro(row.packPrice) : '—'}</td><td>${euro(paid)}</td></tr>`;
    }).join('');
    $('#price-table').innerHTML = head + body;
  }

  let viewerPath = '';
  let viewerRaw = '';

  async function openViewer(slug) {
    const files = manifest.modules[slug];
    if (!files?.length) {
      toast('Fichiers introuvables');
      return;
    }
    const mod = catalog.modules.find((item) => item.id === slug);
    $('#viewer-title').textContent = mod?.name || slug;
    $('#viewer-tabs').innerHTML = files.map((path, index) => `<button class="btn btn-ghost btn-sm${index === 0 ? ' on' : ''}" type="button" data-file="${path}">${path.split('/').slice(2).join('/')}</button>`).join('');
    $('#viewer').showModal();
    const show = async (path) => {
      viewerPath = path;
      $('#viewer-tabs').querySelectorAll('button').forEach((button) => button.classList.toggle('on', button.dataset.file === path));
      try {
        viewerRaw = await fetchText(path);
      } catch (error) {
        viewerRaw = '';
        toast(error.message);
        return;
      }
      $('#viewer-code').innerHTML = path.endsWith('.js') ? highlight(viewerRaw) : escapeHtml(viewerRaw);
    };
    $('#viewer-tabs').querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => show(button.dataset.file));
    });
    await show(files[0]);
  }

  async function downloadModule(slug) {
    try {
      toast('Préparation du zip…');
      await premiumZip([slug], `dcas-${slug}.zip`);
    } catch (error) {
      toast(error.message);
    }
  }

  async function downloadBot() {
    const ids = selectedIds();
    if (!ids.length) {
      toast('Choisis au moins un module');
      return;
    }
    try {
      toast('Préparation du bot…');
      const pack = activePack();
      await premiumZip(ids, pack ? `dcas-bot-${pack.id}.zip` : 'dcas-bot.zip');
    } catch (error) {
      toast(error.message);
    }
  }

  $('#viewer-close').addEventListener('click', () => $('#viewer').close());
  $('#viewer-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(viewerRaw);
      toast('Code copié');
    } catch {
      const area = document.createElement('textarea');
      area.value = viewerRaw;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      toast('Code copié');
    }
  });
  $('#viewer').addEventListener('click', (event) => {
    if (event.target === $('#viewer')) $('#viewer').close();
  });
  $('#check-all').addEventListener('click', () => {
    pickedPack = null;
    catalog.modules.forEach((mod) => selected.add(mod.id));
    renderChecks();
    renderQuote();
  });
  $('#check-none').addEventListener('click', () => {
    pickedPack = null;
    selected.clear();
    renderChecks();
    renderQuote();
  });
  $('#download-bot').addEventListener('click', downloadBot);

  async function boot() {
    const [siteHtml, manifestJson] = await Promise.all([
      fetch(bust('../index.html')).then((response) => {
        if (!response.ok) throw new Error('page publique introuvable');
        return response.text();
      }),
      fetch(bust('manifest.json')).then((response) => {
        if (!response.ok) throw new Error('manifest introuvable');
        return response.json();
      }),
    ]);
    manifest = manifestJson;
    catalog = parseSite(siteHtml);
    siteData = catalog.data;
    if (catalog.modules.length !== Object.keys(siteData.modules).length) {
      throw new Error(`${catalog.modules.length} cartes pour ${Object.keys(siteData.modules).length} prix`);
    }
    renderCards();
    renderPacks();
    renderChecks();
    renderQuote();
    renderTests();
  }

  boot().catch((error) => {
    toast(error.message);
    $('#hint').textContent = `Impossible de charger le panneau : ${error.message}`;
  });
}());
