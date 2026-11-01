export const emptyMonth = () => ({ income: [], expense: [] });
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export function previousMonth(month) {
  const [year, number] = month.split('-').map(Number);
  return monthKey(new Date(year, number - 2, 1));
}
export function normalizeData(raw) {
  if (!raw || !Array.isArray(raw.income) || !Array.isArray(raw.expense)) throw new Error('Arquivo de finanças inválido.');
  const normalize = rows => rows.map(row => {
    if (typeof row.name !== 'string' || !Number.isFinite(row.value) || row.value < 0 || row.value > 999999999) throw new Error('Nome ou valor inválido no arquivo.');
    return { id: crypto.randomUUID(), name: row.name.slice(0, 120), value: Math.round(row.value * 100) / 100 };
  });
  return { income: normalize(raw.income), expense: normalize(raw.expense) };
}
