import test from 'node:test';
import assert from 'node:assert/strict';
import { previousMonth, normalizeData } from '../src/utils/finance.js';
import { applyBRLMask, parseBRLMask } from '../src/utils/currency.js';
test('mês anterior cruza o ano sem perder histórico', () => {
  assert.equal(previousMonth('2027-01'), '2026-12');
});
test('importação valida valores e não reutiliza IDs antigos', () => {
  const source = { income: [{ id: 1, name: 'Salário', value: 3900 }], expense: [{ id: 1, name: 'Cartão', value: 768.5 }] };
  const result = normalizeData(source);
  assert.equal(result.expense[0].value, 768.5);
  assert.notEqual(result.income[0].id, result.expense[0].id);
  assert.throws(() => normalizeData({ income: [], expense: [{ name: 'X', value: -1 }] }));
  assert.throws(() => normalizeData({ income: [] }));
});
test('máscara preserva os centavos da fatura', () => {
  assert.equal(applyBRLMask('76850'), '768,50');
  assert.equal(parseBRLMask('1.234,56'), 1234.56);
});

// Regras de planejamento: os totais atuais nunca são somados novamente às parcelas.
const { prepareNextMonth, totals, dueDate, dueStatus, newRow } = await import('../src/utils/finance.js');
const income = (patch = {}) => ({ ...newRow('income'), name: 'Salário', value: 3500, ...patch });
const expense = (patch = {}) => ({ ...newRow('expense'), name: 'Casa', value: 500, ...patch });
const parcel = (patch = {}) => ({ id: crypto.randomUUID(), name: 'Máquina', value: 239.04, current: 4, total: 10, ...patch });

test('salário variável considera recebido real, preserva previsão e sugere esse valor no próximo mês', () => {
  const source = { income: [income({ received: true, actual: 4030.27 })], expense: [] };
  assert.equal(totals(source).totalIncome, 4030.27);
  assert.equal(totals(source).toReceive, 0);
  const next = prepareNextMonth(source);
  assert.equal(next.income[0].value, 4030.27);
  assert.equal(next.income[0].actual, null);
  assert.equal(next.income[0].received, false);
  assert.equal(source.income[0].value, 3500);
  assert.equal(source.income[0].actual, 4030.27);
});
test('renda não recebida permanece previsão e renda pontual não se repete', () => {
  const source = { income: [income(), income({ recurring: false, value: 100 })], expense: [] };
  assert.equal(totals(source).toReceive, 3600);
  assert.equal(prepareNextMonth(source).income.length, 1);
  assert.equal(prepareNextMonth(source).income[0].value, 3500);
});
test('fatura atual já inclui parcelas e só parcelas restantes seguem para o próximo mês', () => {
  const source = { income: [], expense: [expense({ type: 'card', value: 800, paid: true, installments: [parcel(), parcel({ name: 'Última', value: 100, current: 3, total: 3 })] })] };
  const before = JSON.stringify(source);
  assert.equal(totals(source).totalExpense, 800);
  const next = prepareNextMonth(source);
  assert.equal(next.expense[0].value, 239.04);
  assert.equal(next.expense[0].installments.length, 1);
  assert.equal(next.expense[0].installments[0].current, 5);
  assert.equal(next.expense[0].paid, false);
  assert.equal(JSON.stringify(source), before);
});
test('cartão sem parcelas restantes começa zerado e é mantido para novas compras', () => {
  const next = prepareNextMonth({ income: [], expense: [expense({ type: 'card', value: 500, installments: [parcel({ current: 10 })] })] });
  assert.equal(next.expense.length, 1);
  assert.equal(next.expense[0].value, 0);
  assert.deepEqual(next.expense[0].installments, []);
});
test('fixas e variáveis repetem previsão; parcelas avançam e encerradas/pontuais não passam', () => {
  const source = { income: [], expense: [expense({ type: 'fixed', paid: true, dueDay: 31 }), expense({ type: 'variable', name: 'Gasolina', value: 450 }), expense({ type: 'installment', installment: { current: 2, total: 3 } }), expense({ type: 'installment', installment: { current: 3, total: 3 } }), expense({ type: 'once' })] };
  const next = prepareNextMonth(source);
  assert.equal(next.expense.length, 3);
  assert.equal(next.expense[0].dueDay, 31);
  assert.equal(next.expense[0].paid, false);
  assert.equal(next.expense[1].value, 450);
  assert.equal(next.expense[2].installment.current, 3);
  assert.notEqual(next.expense[0].id, source.expense[0].id);
});
test('vencimentos se adaptam a fevereiro, inclusive bissexto; pagamento remove atraso', () => {
  assert.equal(dueDate('2027-02', 31), '2027-02-28');
  assert.equal(dueDate('2028-02', 31), '2028-02-29');
  assert.equal(dueStatus(expense({ dueDay: 10 }), '2027-02', '2027-02-11'), 'Atrasado');
  assert.equal(dueStatus(expense({ dueDay: 10 }), '2027-02', '2027-02-10'), 'Vence hoje');
  assert.equal(dueStatus(expense({ dueDay: 10, paid: true }), '2027-02', '2027-02-11'), null);
});
test('total pendente é separado do total do mês sem alterar previsão', () => {
  const data = { income: [income({ received: true, actual: 3600 }), income({ value: 1000 })], expense: [expense({ paid: true }), expense({ value: 159 })] };
  const result = totals(data);
  assert.equal(result.totalIncome, 4600);
  assert.equal(result.totalExpense, 659);
  assert.equal(result.toPay, 159);
  assert.equal(result.toReceive, 1000);
  assert.equal(result.balance, 3941);
});
test('normalização preserva parcelas e recebimento no backup e continua aceitando dados antigos', () => {
  const data = { income: [income({ received: true, actual: 3600 })], expense: [expense({ type: 'card', value: 800, installments: [parcel()] })] };
  const canonical = normalizeData(data, { regenerateIds: false });
  assert.equal(canonical.expense[0].id, data.expense[0].id);
  assert.equal(canonical.expense[0].installments[0].current, 4);
  assert.equal(canonical.income[0].actual, 3600);
  const backup = normalizeData(JSON.parse(JSON.stringify(canonical)));
  assert.notEqual(backup.expense[0].id, canonical.expense[0].id);
  assert.equal(backup.expense[0].installments[0].current, 4);
  assert.equal(normalizeData({ income: [], expense: [{ id: 1, name: 'Antigo', value: 500 }] }).expense[0].type, 'variable');
});
test('parcela inconsistente e dia inválido são recusados antes de gravar', () => {
  assert.throws(() => normalizeData({ income: [], expense: [expense({ type: 'installment', installment: { current: 4, total: 3 } })] }), /parcelas/);
  assert.throws(() => normalizeData({ income: [income({ dueDay: 32 })], expense: [] }), /dia/);
});
