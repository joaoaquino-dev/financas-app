import { useEffect, useRef, useState } from 'react';
import { monthLabel, newRow, prepareNextMonth, totals } from '../utils/finance';
import { formatBRL } from '../utils/currency';
import TransactionTable from './TransactionTable';

export default function MonthReview({ source, sourceMonth, targetMonth, onClose, onCreate, busy, error }) {
  const dialog = useRef(null);
  const [draft, setDraft] = useState(() => prepareNextMonth(source));
  const summary = totals(draft);
  const ended = source.expense.filter(row => row.type === 'once' || (row.type === 'installment' && row.installment.current === row.installment.total));
  const endedParcels = source.expense.flatMap(row => row.type === 'card' ? row.installments.filter(p => p.current === p.total) : []);
  useEffect(() => {
    const element = dialog.current; element.showModal();
    const before = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = before; };
  }, []);
  const update = (kind, id, patch) => setDraft(prev => ({ ...prev, [kind]: prev[kind].map(row => row.id === id ? { ...row, ...patch } : row) }));
  return <dialog ref={dialog} aria-labelledby="review-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="rounded-2xl p-0 w-[calc(100%-1rem)] max-w-5xl max-h-[92dvh] bg-slate-50 backdrop:bg-slate-900/50">
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex justify-between gap-3 items-start"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Revisar antes de criar</p><h2 id="review-title" className="text-xl font-bold mt-1">Preparar {monthLabel(targetMonth)}</h2></div><button type="button" aria-label="Fechar revisão" disabled={busy} onClick={onClose} className="btn-secondary">×</button></div>
      <p className="text-sm text-slate-600">Base: {monthLabel(sourceMonth)}. Confira valores e vencimentos; remova o que não vai continuar. O mês de origem permanece intacto.</p>
      <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-1"><p>Fixas e variáveis repetem o valor como previsão. Rendas usam o último valor recebido, quando houver.</p><p>Cartões começam só com as parcelas restantes. Compras avulsas não se repetem. Todos os itens começam pendentes.</p></div>
      {!!(ended.length + endedParcels.length) && <p className="text-xs text-slate-500">Não continuarão: {[...ended, ...endedParcels].map(row => row.name || 'Sem descrição').join(', ')}.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">{[['Rendas', summary.totalIncome], ['Despesas', summary.totalExpense], ['Saldo previsto', summary.balance]].map(([label, value]) => <div className="bg-white border rounded-xl p-3" key={label}><p className="text-slate-500">{label}</p><strong className="text-lg tabular-nums">{formatBRL(value)}</strong></div>)}</div>
      <fieldset disabled={busy} className="grid grid-cols-1 gap-4 min-w-0">{['income', 'expense'].map(kind => <TransactionTable key={kind} reviewing kind={kind} rows={draft[kind]} month={targetMonth} total={kind === 'income' ? summary.totalIncome : summary.totalExpense} onAdd={() => setDraft(prev => ({ ...prev, [kind]: [...prev[kind], newRow(kind)] }))} onUpdate={(id, patch) => update(kind, id, patch)} onDelete={id => setDraft(prev => ({ ...prev, [kind]: prev[kind].filter(row => row.id !== id) }))} />)}</fieldset>
      {error && <p role="alert" className="bg-red-50 text-red-800 rounded-lg p-3 text-sm">{error}</p>}
      <div className="sticky bottom-0 bg-slate-50 border-t pt-3 pb-1 flex flex-wrap gap-2 justify-end"><button disabled={busy} className="btn-secondary" onClick={onClose}>Cancelar</button><button disabled={busy} className="btn-primary" onClick={() => onCreate(draft)}>{busy ? 'Criando…' : 'Confirmar e criar mês'}</button></div>
    </div>
  </dialog>;
}
