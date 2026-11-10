import { useState } from 'react';
import { formatBRL } from '../utils/currency';
import { EXPENSE_TYPES, dueDate, dueStatus, effectiveIncome, installmentTotal, money } from '../utils/finance';
import MoneyInput from './MoneyInput';

export default function TransactionTable({ kind, rows, total, month, onAdd, onUpdate, onDelete, reviewing = false }) {
  const income = kind === 'income';
  const [filter, setFilter] = useState('all');

  const shown = rows.filter(row => {
    if (filter === 'all') return true;
    if (filter === 'done') return income ? row.received : row.paid;
    if (filter === 'late') return !!dueStatus(row, month);
    return !(income ? row.received : row.paid);
  });

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs self-start">
      {/* Cabeçalho da Seção */}
      <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap gap-2 items-center justify-between">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
          <span className={`w-2.5 h-2.5 rounded-full ${income ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {income ? 'Rendas e Entradas' : 'Contas e Cartões'}
          <span className="text-xs font-normal text-slate-400">({rows.length})</span>
        </h2>
        <span className="text-sm font-bold tabular-nums text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
          {formatBRL(total)}
        </span>
      </div>

      {/* Seletor de Filtro */}
      {!reviewing && rows.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Filtrar:</span>
          <select
            aria-label={`Filtrar ${income ? 'rendas' : 'despesas'}`}
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:bg-white"
          >
            <option value="all">Todas ({rows.length})</option>
            <option value="pending">{income ? 'A receber' : 'A pagar'}</option>
            <option value="done">{income ? 'Recebidas' : 'Pagas'}</option>
            <option value="late">{income ? 'Previstas até hoje' : 'Vencidas ou vencendo hoje'}</option>
          </select>
        </div>
      )}

      {/* Lista Vazia */}
      {!shown.length && (
        <div className="p-8 text-center text-slate-400 text-sm">
          {rows.length ? 'Nenhum item com este filtro.' : 'Nenhum lançamento adicionado neste mês.'}
        </div>
      )}

      {/* Linhas */}
      <div className="divide-y divide-slate-100">
        {shown.map(row => (
          <Row
            key={row.id}
            row={row}
            income={income}
            month={month}
            onUpdate={patch => onUpdate(row.id, patch)}
            onDelete={() => onDelete(row.id)}
            reviewing={reviewing}
          />
        ))}
      </div>

      {/* Botão Inferior de Adicionar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          className="btn-secondary w-full flex items-center justify-center gap-1.5 font-medium hover:border-slate-300 transition-colors"
          onClick={() => {
            setFilter('all');
            onAdd();
          }}
        >
          <span className="text-base leading-none font-bold text-emerald-700">+</span> Adicionar {income ? 'renda' : 'despesa'}
        </button>
      </div>
    </section>
  );
}

function Row({ row, income, month, onUpdate, onDelete, reviewing }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const done = income ? row.received : row.paid;
  const status = dueStatus(row, month);
  const date = dueDate(month, row.dueDay);

  return (
    <article
      className={`p-3 sm:px-4 sm:py-3.5 transition-all duration-200 ${
        done ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Checkbox moderno com micro-interação */}
        {!reviewing && (
          <button
            type="button"
            role="checkbox"
            aria-checked={!!done}
            aria-label={income ? 'Marcar renda como recebida' : 'Marcar despesa como paga'}
            onClick={() => {
              if (income) {
                const nextReceived = !row.received;
                onUpdate({ received: nextReceived, actual: nextReceived ? row.actual ?? row.value : null });
              } else {
                onUpdate({ paid: !row.paid });
              }
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ${
              done
                ? 'bg-[#14613e] border-[#14613e] text-white shadow-xs'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            {done && (
              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}

        {/* Nome do item e Badges com bolinhas coloridas */}
        <div className="flex-1 min-w-0">
          <input
            aria-label="Descrição"
            maxLength={120}
            value={row.name}
            placeholder={income ? 'Ex.: Salário' : 'Ex.: Conta de luz ou Cartão'}
            onChange={e => onUpdate({ name: e.target.value })}
            className={`w-full min-w-0 bg-transparent py-0.5 text-sm sm:text-base font-medium rounded outline-none transition-all ${
              done ? 'line-through text-slate-400 decoration-slate-300' : 'text-slate-800'
            } focus:bg-emerald-50/60 px-1`}
          />

          {/* Badges / Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 px-1">
            {/* Status de Vencimento / Pagamento */}
            {status === 'Atrasado' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Vencida
              </span>
            ) : status === 'Vence hoje' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Vence hoje
              </span>
            ) : done ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {income ? 'Recebido' : 'Pago'}
              </span>
            ) : null}

            {/* Tipo */}
            <span className="inline-flex items-center text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {income ? (row.recurring ? 'Recorrente' : 'Só neste mês') : EXPENSE_TYPES[row.type]}
            </span>

            {/* Parcela X/Y */}
            {!income && row.type === 'installment' && row.installment && (
              <span className="inline-flex items-center text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                {row.installment.current}/{row.installment.total}
              </span>
            )}

            {/* Dia do Vencimento */}
            {date && !done && (
              <span className="text-[11px] text-slate-400">
                {income ? 'previsto dia' : 'vence dia'} {date.slice(8)}
              </span>
            )}
          </div>
        </div>

        {/* Input de Valor */}
        <div className="w-24 sm:w-32 shrink-0">
          <MoneyInput
            label={`Valor de ${row.name || 'item'}`}
            value={row.value}
            onChange={value => onUpdate({ value })}
            className={`transition-opacity ${done ? 'opacity-60' : ''}`}
          />
        </div>

        {/* Botão de abrir Drawer / Bottom Sheet */}
        <button
          type="button"
          aria-label={`Detalhes de ${row.name || 'item'}`}
          onClick={() => setShowDrawer(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 text-base"
        >
          ⋯
        </button>

        {/* Botão de Excluir Rápido */}
        <button
          type="button"
          aria-label={`Remover ${row.name || 'item'}`}
          onClick={() => {
            if (window.confirm(`Remover ${row.name || 'este item'} deste mês?`)) {
              onDelete();
            }
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Se for renda e já foi recebida, exibe campo do recebido real */}
      {income && row.received && !reviewing && (
        <div className="mt-2.5 ml-8 sm:ml-9 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-emerald-900">Valor recebido real (R$)</p>
            <p className="text-[11px] text-emerald-700">Previsão original mantida: {formatBRL(row.value)}</p>
          </div>
          <div className="w-32">
            <MoneyInput
              label={`Recebido real de ${row.name}`}
              value={row.actual ?? row.value}
              onChange={actual => onUpdate({ actual })}
              className="bg-white text-right"
            />
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal para edição detalhada no celular */}
      {showDrawer && (
        <DrawerModal
          row={row}
          income={income}
          onClose={() => setShowDrawer(false)}
          onUpdate={onUpdate}
          onDelete={() => {
            setShowDrawer(false);
            onDelete();
          }}
        />
      )}
    </article>
  );
}

function DrawerModal({ row, income, onClose, onUpdate, onDelete }) {
  const [addingParcel, setAddingParcel] = useState(false);
  const [parcelAmount, setParcelAmount] = useState(0);

  function setType(type) {
    if (
      row.type === 'card' &&
      row.installments.length &&
      type !== 'card' &&
      !window.confirm('Mudar o tipo remove o detalhamento das parcelas deste cartão. O total será mantido. Continuar?')
    ) return;

    onUpdate({
      type,
      installments: type === 'card' ? row.installments : [],
      ...(type === 'installment' ? { installment: row.installment || { current: 1, total: 1 } } : {})
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop com blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Conteúdo da Gaveta */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
        {/* Barra de puxar mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Configurações: {row.name || 'Sem nome'}
            </h3>
            <p className="text-xs text-slate-400">Repetição, vencimento e compras parceladas</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Tipo e Recorrência */}
          {income ? (
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={row.recurring}
                onChange={e => onUpdate({ recurring: e.target.checked })}
                className="w-4 h-4 accent-[#14613e] rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                Repetir esta renda automaticamente no próximo mês
              </span>
            </label>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Como esta despesa continua?</label>
              <select
                value={row.type}
                onChange={e => setType(e.target.value)}
                className="field bg-slate-50 border border-slate-200 text-sm rounded-xl"
              >
                {Object.entries(EXPENSE_TYPES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dia de Vencimento */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {income ? 'Dia do recebimento' : 'Dia do vencimento'} (opcional)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              inputMode="numeric"
              value={row.dueDay ?? ''}
              onChange={e => onUpdate({ dueDay: e.target.value === '' ? null : Number(e.target.value) })}
              placeholder="Ex.: 10"
              className="field bg-slate-50 border border-slate-200 text-sm rounded-xl"
            />
          </div>

          {/* Parcelamento de despesa única */}
          {!income && row.type === 'installment' && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-slate-700">Controle de parcelas</p>
              <ParcelFields
                value={row.installment || { current: 1, total: 1 }}
                onChange={installment => onUpdate({ installment })}
              />
              <p className="text-[11px] text-slate-500">
                O valor principal acima é de uma parcela deste mês, e não da compra inteira.
              </p>
            </div>
          )}

          {/* Detalhamento de Cartão de Crédito */}
          {!income && row.type === 'card' && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Compras no cartão</span>
                <span className="text-xs text-slate-500">
                  Parcelas: {formatBRL(installmentTotal(row))}
                </span>
              </div>

              {/* Botão de Somar Compra na Fatura */}
              <div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#14613e] hover:underline"
                  onClick={() => setAddingParcel(!addingParcel)}
                >
                  {addingParcel ? 'Cancelar soma' : '+ Somar compra avulsa na fatura'}
                </button>
                {addingParcel && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (parcelAmount > 0 && row.value + parcelAmount <= 999999999) {
                        onUpdate({ value: money(row.value + parcelAmount) });
                        setAddingParcel(false);
                        setParcelAmount(0);
                      }
                    }}
                    className="flex gap-2 items-center mt-2"
                  >
                    <MoneyInput
                      autoFocus
                      label="Valor da compra"
                      value={parcelAmount}
                      onChange={setParcelAmount}
                      className="text-sm bg-white"
                    />
                    <button type="submit" className="btn-primary text-xs py-2 px-3">
                      Somar
                    </button>
                  </form>
                )}
              </div>

              <CardInstallments row={row} onUpdate={onUpdate} />
            </div>
          )}

          {!income && row.type === 'variable' && (
            <p className="text-xs text-slate-500">O valor deste mês será sugerido como previsão para o próximo.</p>
          )}
        </div>

        {/* Rodapé da Gaveta */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remover "${row.name || 'este item'}" deste mês?`)) {
                onDelete();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium py-2 px-3 rounded-lg hover:bg-rose-50"
          >
            Excluir lançamento
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-2 px-5 text-sm"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

function ParcelFields({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs text-slate-500">
        Parcela atual
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max="600"
          value={value.current}
          onChange={e => onChange({ ...value, current: Number(e.target.value) })}
          className="field mt-1 text-sm bg-white"
        />
      </label>
      <label className="text-xs text-slate-500">
        Total de parcelas
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max="600"
          value={value.total}
          onChange={e => onChange({ ...value, total: Number(e.target.value) })}
          className="field mt-1 text-sm bg-white"
        />
      </label>
    </div>
  );
}

function CardInstallments({ row, onUpdate }) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [includeInTotal, setIncludeInTotal] = useState(false);

  function add(e) {
    e.preventDefault();
    if (
      !draft.name.trim() ||
      draft.value <= 0 ||
      !Number.isInteger(draft.current) ||
      !Number.isInteger(draft.total) ||
      draft.current < 1 ||
      draft.total < draft.current ||
      draft.total > 600 ||
      (includeInTotal && row.value + draft.value > 999999999)
    ) {
      setError('Preencha a descrição, valor e parcelas válidas (máximo 600).');
      return;
    }
    const updated = { ...draft, name: draft.name.trim(), id: draft.id || crypto.randomUUID() };
    onUpdate({
      installments: draft.id
        ? row.installments.map(p => (p.id === draft.id ? updated : p))
        : [...row.installments, updated],
      ...(!draft.id && includeInTotal ? { value: money(row.value + draft.value) } : {})
    });
    setDraft(null);
    setError('');
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">
        As parcelas cadastradas abaixo já compõem o valor total da fatura.
      </p>

      {row.installments.map(p => (
        <div key={p.id} className="flex justify-between items-center bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 break-words">{p.name}</p>
            <p className="text-[11px] text-slate-500">
              {p.current}/{p.total} · {formatBRL(p.value)}
              {p.current === p.total ? ' · última' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className="text-xs text-[#14613e] px-2 py-1 hover:underline"
              onClick={() => {
                setDraft({ ...p });
                setIncludeInTotal(false);
                setError('');
              }}
            >
              Editar
            </button>
            <button
              type="button"
              className="text-slate-400 hover:text-rose-600 px-2 py-1 text-sm"
              onClick={() => {
                if (window.confirm('Remover este detalhamento? O total da fatura não será alterado.')) {
                  onUpdate({ installments: row.installments.filter(item => item.id !== p.id) });
                }
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {!draft ? (
        <button
          type="button"
          onClick={() => {
            setDraft({ name: '', value: 0, current: 1, total: 2 });
            setIncludeInTotal(false);
            setError('');
          }}
          className="w-full py-2 text-xs text-[#14613e] font-semibold border border-dashed border-[#14613e]/30 rounded-xl hover:bg-emerald-50/50"
        >
          + Cadastrar compra parcelada neste cartão
        </button>
      ) : (
        <form onSubmit={add} className="p-3 border rounded-xl bg-slate-50 space-y-3">
          <input
            autoFocus
            required
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex.: Máquina de lavar"
            className="field text-sm bg-white"
          />
          <MoneyInput
            label="Valor de cada parcela"
            value={draft.value}
            onChange={value => setDraft({ ...draft, value })}
            className="bg-white text-sm"
          />
          <ParcelFields value={draft} onChange={setDraft} />
          {!draft.id && (
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={includeInTotal}
                onChange={e => setIncludeInTotal(e.target.checked)}
              />
              Somar esta parcela à fatura atual
            </label>
          )}
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-1.5 px-3">
              {draft.id ? 'Atualizar parcela' : 'Adicionar parcela'}
            </button>
            <button type="button" onClick={() => { setDraft(null); setError(''); }} className="btn-secondary text-xs py-1.5 px-3">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
