export const emptyMonth = () => ({ version: 2, income: [], expense: [] });
export const EXPENSE_TYPES = { fixed: 'Fixa', variable: 'Variável', installment: 'Parcelada', card: 'Cartão', once: 'Só neste mês' };
export const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export function shiftMonth(month, offset) {
  const [year, number] = month.split('-').map(Number);
  return monthKey(new Date(year, number - 1 + offset, 1));
}
export const previousMonth = month => shiftMonth(month, -1);
export function monthLabel(month) {
  const [year, number] = month.split('-').map(Number);
  return new Date(year, number - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
function amount(value) {
  if (!Number.isFinite(value) || value < 0 || value > 999999999) throw new Error('Informe um valor entre zero e R$ 999.999.999.');
  return money(value);
}
function parcel(raw) {
  if (!Number.isInteger(raw.current) || !Number.isInteger(raw.total) || raw.current < 1 || raw.total < raw.current || raw.total > 600) throw new Error('Confira as parcelas: a atual deve estar entre 1 e o total (máximo 600).');
  return { current: raw.current, total: raw.total };
}
export function normalizeData(raw, { regenerateIds = true } = {}) {
  if (!raw || !Array.isArray(raw.income) || !Array.isArray(raw.expense) || raw.income.length + raw.expense.length > 2000) throw new Error('Arquivo de finanças inválido.');
  const ids = new Set();
  const id = original => {
    const next = !regenerateIds && typeof original === 'string' && !ids.has(original) ? original : crypto.randomUUID();
    ids.add(next); return next;
  };
  const normalize = (rows, income) => rows.map(row => {
    if (!row || typeof row.name !== 'string') throw new Error('Descrição inválida.');
    const result = { id: id(row.id), name: row.name.slice(0, 120), value: amount(row.value), dueDay: row.dueDay == null || row.dueDay === '' ? null : Number(row.dueDay) };
    if (result.dueDay !== null && (!Number.isInteger(result.dueDay) || result.dueDay < 1 || result.dueDay > 31)) throw new Error('O dia deve estar entre 1 e 31.');
    if (income) return { ...result, recurring: row.recurring !== false, received: row.received === true, actual: row.received === true ? amount(row.actual ?? row.value) : null };
    const type = Object.hasOwn(EXPENSE_TYPES, row.type) ? row.type : 'variable';
    const installments = row.installments || [];
    if (!Array.isArray(installments) || installments.length > 600) throw new Error('Lista de parcelas inválida.');
    return { ...result, type, paid: row.paid === true,
      ...(type === 'installment' ? { installment: parcel(row.installment || { current: 1, total: 1 }) } : {}),
      installments: type === 'card' ? installments.map(p => {
        if (!p || typeof p.name !== 'string') throw new Error('Descrição de parcela inválida.');
        return { id: id(p.id), name: p.name.slice(0, 120), value: amount(p.value), ...parcel(p) };
      }) : [],
    };
  });
  return { version: 2, income: normalize(raw.income, true), expense: normalize(raw.expense, false) };
}
export function newRow(kind) {
  return { id: crypto.randomUUID(), name: '', value: 0, dueDay: null,
    ...(kind === 'income' ? { recurring: true, received: false, actual: null } : { type: 'variable', paid: false, installments: [] }) };
}
export const effectiveIncome = row => row.received ? row.actual ?? row.value : row.value;
export const installmentTotal = row => money((row.installments || []).reduce((sum, p) => sum + p.value, 0));
export function totals(data) {
  const totalIncome = money(data.income.reduce((sum, row) => sum + effectiveIncome(row), 0));
  const totalExpense = money(data.expense.reduce((sum, row) => sum + row.value, 0));
  return { totalIncome, totalExpense, balance: money(totalIncome - totalExpense), pct: totalIncome ? totalExpense / totalIncome * 100 : 0,
    toReceive: money(data.income.filter(row => !row.received).reduce((sum, row) => sum + row.value, 0)),
    toPay: money(data.expense.filter(row => !row.paid).reduce((sum, row) => sum + row.value, 0)),
    receivedTotal: money(data.income.filter(row => row.received).reduce((sum, row) => sum + effectiveIncome(row), 0)),
    paidTotal: money(data.expense.filter(row => row.paid).reduce((sum, row) => sum + row.value, 0)),
  };
}
export function dueDate(month, day) {
  if (!day) return null;
  const [year, number] = month.split('-').map(Number);
  const safeDay = Math.min(day, new Date(year, number, 0).getDate());
  return `${month}-${String(safeDay).padStart(2, '0')}`;
}
export function dueStatus(row, month, today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })) {
  const date = dueDate(month, row.dueDay);
  if (row.paid || row.received || !date) return null;
  return date < today ? 'Atrasado' : date === today ? 'Vence hoje' : null;
}
// Só parcelas ainda vigentes passam para a nova fatura; o total atual já as inclui.
export function prepareNextMonth(raw) {
  const source = normalizeData(raw, { regenerateIds: false });
  const income = source.income.filter(row => row.recurring).map(row => ({ ...row, id: crypto.randomUUID(), value: effectiveIncome(row), received: false, actual: null }));
  const expense = source.expense.flatMap(row => {
    if (row.type === 'once' || (row.type === 'installment' && row.installment.current >= row.installment.total)) return [];
    const next = { ...row, id: crypto.randomUUID(), paid: false };
    if (row.type === 'installment') next.installment = { ...row.installment, current: row.installment.current + 1 };
    if (row.type === 'card') {
      next.installments = row.installments.filter(p => p.current < p.total).map(p => ({ ...p, id: crypto.randomUUID(), current: p.current + 1 }));
      next.value = installmentTotal(next);
    }
    return [next];
  });
  return { version: 2, income, expense };
}

// Projection only: never creates or changes saved months.
export function forecastInstallments(data, month, count = 6) {
  const parcels = data.expense.flatMap(row => row.type === 'card' ? row.installments : row.type === 'installment' ? [{ ...row.installment, value: row.value, name: row.name }] : []);
  const current = money(parcels.reduce((sum, p) => sum + p.value, 0));
  return Array.from({ length: count }, (_, i) => {
    const offset = i + 1;
    const active = parcels.filter(p => p.current + offset <= p.total);
    const total = money(active.reduce((sum, p) => sum + p.value, 0));
    return { month: shiftMonth(month, offset), total, freed: money(current - total), ending: parcels.filter(p => p.current + offset === p.total).map(p => p.name) };
  });
}
