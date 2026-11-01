import { useState } from 'react';
import { applyBRLMask, parseBRLMask, formatBRL } from '../utils/currency';

export default function TransactionTable({ title, accent, rows, total, onAdd, onUpdate, onDelete }) {
  return <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="flex flex-wrap gap-2 items-center justify-between px-4 py-4 border-b bg-gray-50">
      <h2 className="font-semibold flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${accent === 'blue' ? 'bg-blue-600' : 'bg-red-500'}`} />{title}</h2>
      <span className="text-sm font-semibold tabular-nums">{formatBRL(total)}</span>
    </div>
    <div className="px-4 py-2 flex justify-between text-xs text-gray-500"><span>Descrição</span><span>Total previsto (R$)</span></div>
    {!rows.length && <p className="px-4 py-8 text-sm text-gray-400 text-center">Nenhum item neste mês.</p>}
    {rows.map(row => <Row key={row.id} row={row} expense={accent === 'red'} onUpdate={onUpdate} onDelete={onDelete} />)}
    <div className="p-3 border-t bg-gray-50"><button className="btn-secondary" onClick={onAdd}>+ Adicionar {accent === 'red' ? 'despesa' : 'renda'}</button></div>
  </section>;
}
function Row({ row, expense, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  return <div className="border-t border-gray-100 p-3">
    <div className="flex items-center gap-2">
      <input aria-label="Descrição" maxLength={120} value={row.name} placeholder="Descrição" onChange={e => onUpdate(row.id, 'name', e.target.value)} className="min-w-0 w-full rounded-md p-2 bg-transparent focus:bg-blue-50" />
      <input aria-label={`Valor de ${row.name || 'item'}`} inputMode="decimal" value={row.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} onFocus={e => e.target.select()} onChange={e => { const value = parseBRLMask(applyBRLMask(e.target.value)); if (value <= 999999999) onUpdate(row.id, 'value', value); }} className="w-28 shrink-0 rounded-md p-2 text-right tabular-nums bg-gray-50 focus:bg-blue-50" />
      <button aria-label={`Remover ${row.name || 'item'}`} onClick={() => { if (window.confirm(`Remover ${row.name || 'este item'}?`)) onDelete(row.id); }} className="text-gray-400 hover:text-red-600 text-xl w-8 shrink-0 min-h-10">×</button>
    </div>
    {expense && <button className="text-xs text-blue-700 px-2 py-1" onClick={() => setAdding(!adding)}>{adding ? 'Cancelar' : '+ Somar compra'}</button>}
    {adding && <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); const increment = parseBRLMask(amount); if (increment > 0 && row.value + increment <= 999999999) { onUpdate(row.id, 'value', Math.round((row.value + increment) * 100) / 100); setAdding(false); setAmount(''); } }}>
      <input aria-label="Valor da compra" autoFocus inputMode="decimal" placeholder="Valor da compra" value={amount} onChange={e => setAmount(applyBRLMask(e.target.value))} className="field min-w-0" />
      <button className="btn-secondary" type="submit">Somar</button>
    </form>}
  </div>;
}
