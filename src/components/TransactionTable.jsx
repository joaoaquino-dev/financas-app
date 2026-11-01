import { useState } from 'react';
import { formatBRL } from '../utils/currency';
import { EXPENSE_TYPES, dueDate, dueStatus, effectiveIncome, installmentTotal, money } from '../utils/finance';
import MoneyInput from './MoneyInput';

export default function TransactionTable({ kind, rows, total, month, onAdd, onUpdate, onDelete, reviewing = false }) {
  const income = kind === 'income';
  const [filter, setFilter] = useState('all');
  const shown = rows.filter(row => filter === 'all' || (filter === 'done' ? (income ? row.received : row.paid) : filter === 'late' ? !!dueStatus(row, month) : !(income ? row.received : row.paid)));
  return <section className="soma-transactions bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 self-start">
    <div className="px-4 py-4 border-b bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
      <h2 className="font-semibold flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${income ? 'bg-blue-600' : 'bg-rose-500'}`} />{income ? 'Rendas' : 'Contas e cartões'}</h2>
      <span className="text-sm font-semibold tabular-nums">{formatBRL(total)}</span>
    </div>
    {!reviewing && rows.length > 0 && <div className="px-4 py-2 border-b"><label className="flex items-center justify-between gap-2 text-xs text-slate-500">Mostrar<select aria-label={`Filtrar ${income ? 'rendas' : 'despesas'}`} value={filter} onChange={e => setFilter(e.target.value)} className="bg-white border rounded-lg p-2 text-sm text-slate-700">
      <option value="all">Todas ({rows.length})</option><option value="pending">{income ? 'A receber' : 'A pagar'}</option><option value="done">{income ? 'Recebidas' : 'Pagas'}</option><option value="late">{income ? 'Previstas até hoje' : 'Vencidas ou vencendo hoje'}</option>
    </select></label></div>}
    {!shown.length && <p className="px-4 py-8 text-sm text-slate-400 text-center">{rows.length ? 'Nenhum item com esse filtro.' : 'Adicione seu primeiro item.'}</p>}
    {shown.map(row => <Row key={row.id} row={row} income={income} month={month} onUpdate={patch => onUpdate(row.id, patch)} onDelete={() => onDelete(row.id)} reviewing={reviewing} />)}
    <div className="p-3 border-t bg-slate-50"><button type="button" className="btn-secondary w-full" onClick={() => { setFilter('all'); onAdd(); }}>+ Adicionar {income ? 'renda' : 'despesa'}</button></div>
  </section>;
}
function Row({ row, income, month, onUpdate, onDelete, reviewing }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState(0);
  const date = dueDate(month, row.dueDay);
  const status = dueStatus(row, month);
  const done = income ? row.received : row.paid;
  const parcels = row.type === 'card' ? installmentTotal(row) : 0;
  function setType(type) {
    if (row.type === 'card' && row.installments.length && type !== 'card' && !window.confirm('Mudar o tipo remove o detalhamento das parcelas deste cartão. O total informado será mantido. Continuar?')) return;
    onUpdate({ type, installments: type === 'card' ? row.installments : [], ...(type === 'installment' ? { installment: row.installment || { current: 1, total: 1 } } : {}) });
  }
  return <article className="soma-row">
    <div className="soma-row-heading flex items-start gap-2">
      <div className="flex-1 min-w-0"><input aria-label="Descrição" maxLength={120} value={row.name} placeholder={income ? 'Ex.: Salário vigilante' : 'Ex.: Casa ou cartão'} onChange={e => onUpdate({ name: e.target.value })} className="soma-row-name w-full min-w-0 rounded-lg py-2 text-base font-medium focus:bg-blue-50" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          <span>{income ? (row.recurring ? 'Recorrente · valor ajustável' : 'Só neste mês') : EXPENSE_TYPES[row.type]}</span>
          {!income && row.type === 'installment' && <span>{row.installment.current}/{row.installment.total}</span>}
          {date && <span>{income ? 'Receber' : 'Vence'} {date.slice(8)}/{date.slice(5, 7)}</span>}
          {status && <span className="text-rose-700 font-semibold">{income ? (status === 'Atrasado' ? 'Recebimento pendente' : 'Previsto para hoje') : status}</span>}
        </div>
      </div>
      <button type="button" aria-label={`Remover ${row.name || 'item'}`} onClick={() => { if (window.confirm(`Remover ${row.name || 'este item'} deste mês?`)) onDelete(); }} className="text-slate-400 hover:text-red-600 text-xl w-11 h-11 shrink-0 rounded-lg">×</button>
    </div>
    <div className="soma-row-values flex flex-wrap gap-3 items-end">
      <label className="flex-1 min-w-[120px] text-xs text-slate-500">{income ? 'Previsão (R$)' : row.type === 'card' ? 'Fatura total (R$)' : 'Valor do mês (R$)'}<MoneyInput label={`Valor de ${row.name || 'item'}`} value={row.value} onChange={value => onUpdate({ value })} className="mt-1" /></label>
      {!reviewing && <label className={`flex items-center gap-2 text-sm min-h-11 px-3 rounded-lg border cursor-pointer ${done ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'text-slate-600 border-slate-200'}`}><input type="checkbox" checked={!!done} onChange={e => onUpdate(income ? { received: e.target.checked, actual: e.target.checked ? row.actual ?? row.value : null } : { paid: e.target.checked })} className="w-4 h-4 accent-emerald-600" />{income ? 'Recebido' : 'Pago'}</label>}
    </div>
    {income && row.received && !reviewing && <div className="bg-emerald-50 rounded-lg p-3"><label className="text-xs text-emerald-800">Valor recebido de verdade (R$)<MoneyInput label={`Recebido de ${row.name || 'renda'}`} value={row.actual ?? row.value} onChange={actual => onUpdate({ actual })} className="mt-1" /></label><p className="text-xs text-emerald-800 mt-2">O resumo considera {formatBRL(effectiveIncome(row))}. A previsão fica guardada.</p></div>}
    {!income && row.type === 'card' && <div className="text-xs px-1 text-slate-500"><span>Parcelas incluídas: {formatBRL(parcels)}</span>{row.value < parcels ? <p role="alert" className="text-amber-800 mt-1">O total da fatura está menor que as parcelas cadastradas. Confira antes de salvar.</p> : <span> · Outras compras: {formatBRL(money(row.value - parcels))}</span>}</div>}
    {!income && row.type === 'card' && <div>
      <button type="button" className="text-sm text-blue-700 min-h-11 px-1" onClick={() => setAdding(!adding)}>{adding ? 'Cancelar soma' : '+ Somar compra'}</button>
      {adding && <form className="flex gap-2 items-end mt-1" onSubmit={e => { e.preventDefault(); if (amount > 0 && row.value + amount <= 999999999) { onUpdate({ value: money(row.value + amount) }); setAdding(false); setAmount(0); } }}><label className="text-xs text-slate-500 flex-1 min-w-0">Valor da compra<MoneyInput autoFocus label="Valor da compra" value={amount} onChange={setAmount} /></label><button className="btn-secondary" disabled={!amount} type="submit">Somar</button></form>}
    </div>}
    <details className="soma-row-details">
      <summary className="cursor-pointer text-sm text-slate-600">{row.type === 'card' && !income ? `Configurar e ver parcelas (${row.installments.length})` : 'Repetição e vencimento'}</summary>
      <div className="soma-row-settings space-y-4">
        {income ? <label className="flex gap-2 items-center text-sm min-h-11"><input type="checkbox" checked={row.recurring} onChange={e => onUpdate({ recurring: e.target.checked })} />Repetir esta renda no próximo mês</label> : <label className="block text-xs text-slate-500">Como esta despesa continua?<select value={row.type} onChange={e => setType(e.target.value)} className="field mt-1">{Object.entries(EXPENSE_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
        <label className="block text-xs text-slate-500">{income ? 'Dia previsto de recebimento' : 'Dia do vencimento'} (opcional)<input aria-label={`Dia de ${row.name || 'item'}`} type="number" min="1" max="31" inputMode="numeric" value={row.dueDay ?? ''} onChange={e => onUpdate({ dueDay: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Ex.: 10" className="field mt-1" /></label>
        {!income && row.type === 'installment' && <><ParcelFields value={row.installment} onChange={installment => onUpdate({ installment })} /><p className="text-xs text-slate-500">Informe a parcela do mês selecionado. O valor acima é de uma parcela, não da compra inteira.</p></>}
        {!income && row.type === 'card' && <CardInstallments row={row} onUpdate={onUpdate} />}
        {!income && row.type === 'variable' && <p className="text-xs text-slate-500">O valor deste mês será sugerido como previsão para o próximo.</p>}
      </div>
    </details>
  </article>;
}
function ParcelFields({ value, onChange }) {
  return <div className="grid grid-cols-2 gap-2">{[['current', 'Parcela neste mês'], ['total', 'Total de parcelas']].map(([key, label]) => <label key={key} className="text-xs text-slate-500">{label}<input aria-label={label} type="number" inputMode="numeric" min="1" max="600" value={value[key]} onChange={e => onChange({ ...value, [key]: Number(e.target.value) })} className="field mt-1" /></label>)}</div>;
}
function CardInstallments({ row, onUpdate }) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [includeInTotal, setIncludeInTotal] = useState(false);
  function add(event) {
    event.preventDefault();
    if (!draft.name.trim() || draft.value <= 0 || !Number.isInteger(draft.current) || !Number.isInteger(draft.total) || draft.current < 1 || draft.total < draft.current || draft.total > 600 || (includeInTotal && row.value + draft.value > 999999999)) { setError('Preencha descrição, valor e uma parcela atual entre 1 e o total (máximo 600).'); return; }
    const updated = { ...draft, name: draft.name.trim(), id: draft.id || crypto.randomUUID() };
    onUpdate({ installments: draft.id ? row.installments.map(p => p.id === draft.id ? updated : p) : [...row.installments, updated], ...(!draft.id && includeInTotal ? { value: money(row.value + draft.value) } : {}) });
    setDraft(null); setError('');
  }
  return <div className="space-y-3 border-t pt-3">
    <p className="text-xs text-slate-500">As parcelas abaixo já fazem parte do total informado. No próximo mês, só as que continuam serão levadas para a fatura. Não cadastre a mesma parcela também como despesa separada.</p>
    {row.installments.map(p => <div key={p.id} className="flex justify-between gap-2 items-center bg-white rounded-lg p-2 border"><div className="min-w-0"><p className="text-sm break-words">{p.name}</p><p className="text-xs text-slate-500">{p.current}/{p.total} · {formatBRL(p.value)}{p.current === p.total ? ' · última parcela' : ''}</p></div><div className="flex shrink-0"><button type="button" aria-label={`Editar parcela ${p.name}`} className="text-blue-700 text-xs min-h-11 px-2" onClick={() => { setDraft({ ...p }); setIncludeInTotal(false); setError(''); }}>Editar</button><button type="button" aria-label={`Remover parcela ${p.name}`} className="text-rose-700 min-w-11 min-h-11" onClick={() => { if (window.confirm('Remover este detalhamento? O total da fatura não será alterado.')) onUpdate({ installments: row.installments.filter(item => item.id !== p.id) }); }}>×</button></div></div>)}
    {!draft ? <button type="button" className="btn-secondary w-full" onClick={() => { setDraft({ name: '', value: 0, current: 1, total: 2 }); setIncludeInTotal(false); }}>+ Cadastrar compra parcelada</button> : <form onSubmit={add} className="space-y-3 border rounded-lg p-3 bg-white">
      <label className="block text-xs text-slate-500">Compra<input autoFocus required aria-label="Descrição da compra parcelada" maxLength={120} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="field mt-1" placeholder="Ex.: Máquina de lavar" /></label>
      <label className="block text-xs text-slate-500">Valor de cada parcela (R$)<MoneyInput label="Valor de cada parcela" value={draft.value} onChange={value => setDraft({ ...draft, value })} className="mt-1" /></label>
      <ParcelFields value={draft} onChange={setDraft} />
      {!draft.id && <label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={includeInTotal} onChange={e => setIncludeInTotal(e.target.checked)} className="mt-1" />Somar esta parcela à fatura atual (marque só se ela ainda não estiver incluída).</label>}
      {draft.id && <p className="text-xs text-slate-500">Editar o detalhamento não altera o total da fatura atual. Ajuste o total acima se necessário.</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2"><button type="submit" className="btn-primary">{draft.id ? 'Atualizar parcela' : 'Adicionar parcela'}</button><button type="button" className="btn-secondary" onClick={() => { setDraft(null); setError(''); }}>Cancelar</button></div>
    </form>}
  </div>;
}
