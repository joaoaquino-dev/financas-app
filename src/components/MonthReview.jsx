import { useEffect, useRef, useState } from 'react';
import { monthLabel, newRow, prepareNextMonth, totals } from '../utils/finance';
import { formatBRL } from '../utils/currency';
import TransactionTable from './TransactionTable';

export default function MonthReview({ source, sourceMonth, targetMonth, onClose, onCreate, busy, error }) {
  const dialog = useRef(null);
  const [draft, setDraft] = useState(() => prepareNextMonth(source));
  const summary = totals(draft);
  const ended = source.expense.filter(
    row => row.type === 'once' || (row.type === 'installment' && row.installment.current === row.installment.total)
  );
  const endedParcels = source.expense.flatMap(
    row => (row.type === 'card' ? row.installments.filter(p => p.current === p.total) : [])
  );

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = before;
    };
  }, []);

  const update = (kind, id, patch) =>
    setDraft(prev => ({
      ...prev,
      [kind]: prev[kind].map(row => (row.id === id ? { ...row, ...patch } : row)),
    }));

  return (
    <dialog
      ref={dialog}
      aria-labelledby="review-title"
      onCancel={event => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="rounded-3xl p-0 w-[calc(100%-1.5rem)] max-w-5xl max-h-[92dvh] bg-[#f4f7f5] border border-slate-200/90 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-xs overflow-hidden"
    >
      <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[92dvh]">
        {/* Cabeçalho */}
        <div className="flex justify-between gap-3 items-start border-b border-slate-200/80 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006437]">
              Revisar antes de criar
            </p>
            <h2 id="review-title" className="text-xl sm:text-2xl font-extrabold text-[#003e22] mt-0.5">
              Preparar {monthLabel(targetMonth)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Base: {monthLabel(sourceMonth)}. Ajuste valores e remova o que não continua. O mês atual permanecerá intacto.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar revisão"
            disabled={busy}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-base transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Card informativo */}
        <div className="bg-[#f0f7f3] border border-[#bde1cc] rounded-2xl p-4 text-xs sm:text-sm text-[#00502c] space-y-1.5 leading-relaxed">
          <p>
            Contas fixas e variáveis repetem o valor como previsão. Rendas usam o último valor recebido real.
          </p>
          <p>
            Cartões trazem somente as parcelas vigentes. Compras avulsas não se repetem.
          </p>
        </div>

        {!!(ended.length + endedParcels.length) && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
            <strong>Não continuarão (finalizados):</strong>{' '}
            {[...ended, ...endedParcels].map(row => row.name || 'Sem descrição').join(', ')}.
          </div>
        )}

        {/* Resumo do Próximo Mês */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Rendas previstas', summary.totalIncome, 'text-[#006437]'],
            ['Despesas previstas', summary.totalExpense, 'text-rose-700'],
            ['Saldo previsto', summary.balance, summary.balance < 0 ? 'text-rose-600' : 'text-[#006437]'],
          ].map(([label, value, colorClass]) => (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs" key={label}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <strong className={`text-xl font-bold tabular-nums block mt-1 ${colorClass}`}>
                {formatBRL(value)}
              </strong>
            </div>
          ))}
        </div>

        {/* Tabelas de revisão */}
        <fieldset disabled={busy} className="grid grid-cols-1 gap-4 min-w-0">
          {['income', 'expense'].map(kind => (
            <TransactionTable
              key={kind}
              reviewing
              kind={kind}
              rows={draft[kind]}
              month={targetMonth}
              total={kind === 'income' ? summary.totalIncome : summary.totalExpense}
              onAdd={() => setDraft(prev => ({ ...prev, [kind]: [...prev[kind], newRow(kind)] }))}
              onUpdate={(id, patch) => update(kind, id, patch)}
              onDelete={id => setDraft(prev => ({ ...prev, [kind]: prev[kind].filter(row => row.id !== id) }))}
            />
          ))}
        </fieldset>

        {error && (
          <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs sm:text-sm">
            {error}
          </p>
        )}

        {/* Rodapé Fixo */}
        <div className="sticky bottom-0 bg-[#f4f7f5] border-t border-slate-200/80 pt-3 pb-1 flex flex-wrap gap-2.5 justify-end">
          <button
            type="button"
            disabled={busy}
            className="btn-secondary text-xs sm:text-sm py-2.5 px-4 font-semibold"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            className="btn-primary text-xs sm:text-sm py-2.5 px-5 font-bold shadow-sm"
            onClick={() => onCreate(draft)}
          >
            {busy ? 'Criando…' : 'Confirmar e criar mês'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
