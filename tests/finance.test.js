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
