// Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
const listeners = new Map();

function on(event, handler) {
  const list = listeners.get(event) || [];
  list.push(handler);
  listeners.set(event, list);
}

function emit(event, payload) {
  for (const handler of listeners.get(event) || []) handler(payload);
}

module.exports = { on, emit };
