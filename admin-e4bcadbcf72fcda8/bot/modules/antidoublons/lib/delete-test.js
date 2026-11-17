// Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
const { deleteSilently } = require('../full/delete-message');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  const denied = {
    id: '111',
    channel: {
      name: 'bot-test-business',
      messages: { fetch: async () => denied },
    },
    async delete() {
      const error = new Error('Missing Permissions');
      error.code = 50013;
      throw error;
    },
  };
  const failed = await deleteSilently(denied, 'Message doublon');
  assert(failed === false, 'une permission manquante doit échouer');
  assert(deleteSilently.lastReason === 'Permission Gérer les messages manquante', deleteSilently.lastReason);
  assert(errors.some((line) => line.includes('PERMISSIONS')), 'l’échec doit être écrit dans le journal');

  let fetched = null;
  const allowed = {
    id: '222',
    channel: {
      name: 'ok',
      messages: { fetch: async (id) => { fetched = id; return allowed; } },
    },
    deleted: false,
    async delete() { this.deleted = true; },
  };
  const succeeded = await deleteSilently(allowed, 'Message doublon');
  console.error = original;
  assert(succeeded === true, 'la suppression doit réussir');
  assert(fetched === '222', 'le message doit être relu avant la suppression');
  assert(allowed.deleted === true, 'delete() doit être appelé');
  console.log('DELETE TEST OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
