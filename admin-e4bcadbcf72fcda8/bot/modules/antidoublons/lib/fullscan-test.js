// Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
const { planFullScan, runFullScan } = require('../fullscan');
const { defaultSources } = require('./normalizer');
const { fileHashes, clearFileHashCache } = require('../scan');
const history = require('./history');
const database = require('../full/database');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const rules = {
  text: true,
  links: true,
  images: true,
  imageMode: 'exact',
  sources: defaultSources(),
  domains: [],
  ignoredUsers: ['9'],
  ignoredChannels: ['skip'],
};

const text = planFullScan([
  { id: '3', createdAt: 300, channelId: '1', authorId: '1', content: 'bonjour les amis' },
  { id: '1', createdAt: 100, channelId: '1', authorId: '1', content: 'bonjour les amis' },
  { id: '2', createdAt: 200, channelId: '1', authorId: '1', content: 'bonjour les amis' },
  { id: '4', createdAt: 400, channelId: '1', authorId: '9', content: 'bonjour les amis' },
  { id: '5', createdAt: 150, channelId: 'skip', authorId: '1', content: 'bonjour les amis' },
], rules);
assert(text.keep.map((item) => item.id).join() === '1', `gardé ${text.keep.map((item) => item.id)}`);
assert(text.remove.map((item) => item.id).join() === '2,3', `supprimé ${text.remove.map((item) => item.id)}`);

const links = planFullScan([
  { id: '20', createdAt: 20, channelId: '1', authorId: '1', content: 'https://youtube.com/watch?v=abc12345678' },
  { id: '10', createdAt: 10, channelId: '1', authorId: '1', content: 'https://youtu.be/abc12345678' },
], rules);
assert(links.keep[0].id === '10' && links.remove[0].id === '20', 'le lien le plus ancien reste');

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const recent = NOW - 2 * DAY;
const old = NOW - 20 * DAY;
const older = NOW - 30 * DAY;

function makeMessage({ id, createdAt, content, channel, authorId = 'u1' }) {
  return {
    id: String(id),
    createdTimestamp: createdAt,
    content,
    author: { id: authorId, username: 'alice', bot: false },
    member: { displayName: 'Alice' },
    attachments: { values: () => [] },
    channel,
    channelId: channel.id,
  };
}

function makeChannel(id, name, specs) {
  const channel = {
    id,
    name,
    isTextBased: () => true,
    fetches: [],
    bulkDeletes: [],
    singles: [],
  };
  const messages = specs.map((spec) => makeMessage({ ...spec, channel }));
  const sorted = [...messages].sort((a, b) => a.createdTimestamp - b.createdTimestamp || a.id.localeCompare(b.id));
  channel.messages = {
    async fetch({ limit = 100, after } = {}) {
      channel.fetches.push({ limit, after });
      const afterId = after && after !== '0' ? after : null;
      const next = afterId ? sorted.filter((message) => BigInt(message.id) > BigInt(afterId)) : sorted;
      const slice = next.slice(0, limit);
      const map = new Map(slice.map((message) => [message.id, message]));
      return map;
    },
    async delete(id) {
      channel.singles.push(String(id));
    },
  };
  channel.bulkDelete = async (ids, filterOld) => {
    if (ids.length < 2 || ids.length > 100) throw new Error(`bulkDelete attend 2 à 100 ids, reçu ${ids.length}`);
    if (filterOld !== true) throw new Error('filterOld doit être true');
    channel.bulkDeletes.push(ids.map(String));
    return new Map(ids.map((id) => [String(id), { id: String(id) }]));
  };
  return channel;
}

const chronological = [];
chronological.push({ channel: 'C', content: 'alpha', createdAt: older });
chronological.push({ channel: 'A', content: 'beta', createdAt: old });
chronological.push({ channel: 'C', content: 'beta', createdAt: old + 1000 });
for (let index = 0; index < 150; index += 1) {
  chronological.push({ channel: 'A', content: `unique-A-${index}`, createdAt: recent + index });
}
for (let index = 0; index < 12; index += 1) {
  chronological.push({ channel: 'A', content: 'alpha', createdAt: recent + 1000 + index });
}
for (let index = 0; index < 8; index += 1) {
  chronological.push({ channel: 'B', content: 'alpha', createdAt: recent + 2000 + index });
}
for (let index = 0; index < 5; index += 1) {
  chronological.push({ channel: 'B', content: 'beta', createdAt: recent + 3000 + index });
}

const byChannel = { A: [], B: [], C: [] };
chronological.forEach((item, index) => {
  const id = String(index + 1);
  byChannel[item.channel].push({ id, createdAt: item.createdAt, content: item.content });
});

const channelA = makeChannel('A', 'general', byChannel.A);
const channelB = makeChannel('B', 'media', byChannel.B);
const channelC = makeChannel('C', 'archives', byChannel.C);
assert(byChannel.A.length > 150, `salon A trop petit: ${byChannel.A.length}`);

const cache = new Map([
  ['A', channelA],
  ['B', channelB],
  ['C', channelC],
]);
const guild = {
  id: 'guild-1',
  channels: {
    cache: {
      get: (id) => cache.get(id),
      values: () => cache.values(),
    },
    fetch: async (id) => cache.get(id) || null,
  },
};

const recorded = [];
const originalRecord = history.record;
history.record = (guildId, data) => {
  recorded.push({ guildId, ...data });
  return data;
};

const addedLinks = [];
const originalReset = database.resetDatabase;
const originalAdd = database.addLink;
database.resetDatabase = () => true;
database.addLink = (data) => {
  addedLinks.push(data);
  return true;
};

const progress = { logs: [], stopped: false };
const started = Date.now();

(async () => {
  try {
    const result = await runFullScan({
      guild,
      config: {
        channelIds: ['A', 'B', 'C'],
        categoryIds: [],
        rules: { text: true, links: false, images: false, ignoredUsers: [], ignoredChannels: [] },
      },
      progress,
      stop: () => false,
    });

    const elapsed = Date.now() - started;
    assert(result.hashes['text:alpha']?.messageId === '1', `alpha gardé ${result.hashes['text:alpha']?.messageId}`);
    assert(result.hashes['text:alpha']?.channelId === 'C', 'alpha le plus ancien est dans C');
    assert(result.hashes['text:beta']?.messageId === '2', `beta gardé ${result.hashes['text:beta']?.messageId}`);
    assert(result.hashes['text:beta']?.channelId === 'A', 'beta le plus ancien est dans A');

    const recentAlphaA = 12;
    const recentAlphaB = 8;
    const recentBetaB = 5;
    const oldBetaC = 1;
    const expectedFound = recentAlphaA + recentAlphaB + recentBetaB + oldBetaC;
    assert(progress.found === expectedFound, `found=${progress.found} attendu ${expectedFound}`);
    assert(progress.deleted === expectedFound, `deleted=${progress.deleted} attendu ${expectedFound}`);
    assert(progress.errors === 0, `errors=${progress.errors}`);
    assert(progress.scanned === chronological.length, `scanned=${progress.scanned}`);
    assert(progress.percent === 100, `percent=${progress.percent}`);

    assert(channelA.bulkDeletes.length === 1, `bulk A=${channelA.bulkDeletes.length}`);
    assert(channelA.bulkDeletes[0].length === 12, `bulk A size ${channelA.bulkDeletes[0].length}`);
    assert(channelA.singles.length === 0, `single A=${channelA.singles.length}`);
    assert(channelB.bulkDeletes.length === 1, `bulk B=${channelB.bulkDeletes.length}`);
    assert(channelB.bulkDeletes[0].length === 13, `bulk B size ${channelB.bulkDeletes[0].length}`);
    assert(channelC.bulkDeletes.length === 0, 'pas de bulk sur les messages de plus de 14 jours');
    assert(channelC.singles.length === 1, `single C=${channelC.singles.length}`);
    assert(channelC.singles[0] === '3', `vieux beta C ${channelC.singles[0]}`);

    const deletedIds = new Set([
      ...channelA.bulkDeletes.flat(),
      ...channelB.bulkDeletes.flat(),
      ...channelC.singles,
    ]);
    assert(!deletedIds.has('1'), 'le plus ancien alpha a été supprimé');
    assert(!deletedIds.has('2'), 'le plus ancien beta a été supprimé');
    assert(deletedIds.has('3'), 'le vieux doublon beta de C n’a pas été retiré');

    const historyDeleted = recorded.filter((item) => item.status === 'deleted');
    assert(historyDeleted.length === expectedFound, `historique ${historyDeleted.length}`);
    assert(historyDeleted.every((item) => item.guildId === 'guild-1' && item.source === 'analyse'), 'historique incomplet');
    assert(Array.isArray(addedLinks), 'addLink n\’a pas été appelé correctement');

    const fetches = channelA.fetches.length + channelB.fetches.length + channelC.fetches.length;
    const bulkCalls = channelA.bulkDeletes.length + channelB.bulkDeletes.length + channelC.bulkDeletes.length;
    const singleCalls = channelA.singles.length + channelB.singles.length + channelC.singles.length;
    const newApiCalls = fetches + bulkCalls + singleCalls;
    const oldDeletes = expectedFound;
    const oldFetches = fetches; // même pagination, mais en série
    const oldApiCalls = oldFetches + oldDeletes;
    const savedCalls = oldApiCalls - newApiCalls;
    console.log(`FULLSCAN SPEED: ${oldApiCalls} appels API (ancienne méthode) -> ${newApiCalls} (nouvelle) ; ${savedCalls} appels en moins (${fetches} lectures, ${bulkCalls} bulkDelete, ${singleCalls} suppressions unitaires) ; simulation en ${elapsed} ms`);
    assert(newApiCalls < oldApiCalls, 'pas de gain d’appels API');
    assert(bulkCalls >= 1, 'bulkDelete n’a pas été utilisé');

    // Cache Exact : la même URL n’est pas retéléchargée.
    clearFileHashCache();
    let downloads = 0;
    const originalFetch = global.fetch;
    global.fetch = async (url) => {
      downloads += 1;
      return { ok: true, arrayBuffer: async () => Buffer.from(`bytes:${url}`) };
    };
    const attachment = {
      contentType: 'image/png',
      name: 'photo.png',
      size: 12,
      id: 'att-1',
      url: 'https://cdn.discordapp.com/attachments/1/2/photo.png?ex=aaa',
    };
    const msg = {
      attachments: {
        values: () => [attachment],
      },
    };
    const first = await fileHashes(msg, { visual: false });
    const second = await fileHashes(msg, { visual: false });
    global.fetch = originalFetch;
    assert(downloads === 1, `téléchargements ${downloads}, attendu 1`);
    assert(first.hashes[0] && first.hashes[0] === second.hashes[0], 'empreinte cache différente');

    const meta = {
      attachments: {
        values: () => [{
          contentType: 'image/png',
          name: 'photo.png',
          size: 99,
          contentHash: 'abc123',
          url: 'https://cdn.discordapp.com/attachments/9/9/other.png',
        }],
      },
    };
    let extraDownloads = 0;
    global.fetch = async () => {
      extraDownloads += 1;
      return { ok: true, arrayBuffer: async () => Buffer.from('nope') };
    };
    const signed = await fileHashes(meta, { visual: false });
    global.fetch = originalFetch;
    assert(extraDownloads === 0, 'le hash Discord aurait dû éviter le téléchargement');
    assert(signed.hashes[0] === 'discord:99:photo.png:abc123', signed.hashes[0]);

    console.log('FULLSCAN TEST OK');
  } finally {
    history.record = originalRecord;
    database.resetDatabase = originalReset;
    database.addLink = originalAdd;
  }
})().catch((error) => {
  history.record = originalRecord;
  database.resetDatabase = originalReset;
  database.addLink = originalAdd;
  console.error(error);
  process.exit(1);
});
