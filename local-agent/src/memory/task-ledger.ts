const ledger: Array<{ id: string; status: string; updatedAt: string }> = [];

export function recordTaskLedger(id: string, status: string) {
  ledger.push({ id, status, updatedAt: new Date().toISOString() });
  if (ledger.length > 500) ledger.splice(0, ledger.length - 500);
}

export function getTaskLedger() {
  return [...ledger];
}
