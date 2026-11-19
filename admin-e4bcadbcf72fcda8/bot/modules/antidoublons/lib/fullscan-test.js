// Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
const { planFullScan } = require('../fullscan');
const { defaultSources } = require('./normalizer');

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

console.log('FULLSCAN TEST OK');
