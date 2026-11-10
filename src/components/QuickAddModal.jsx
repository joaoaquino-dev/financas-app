import { useState } from 'react';
import MoneyInput from './MoneyInput';

export default function QuickAddModal({ onAddRow, onClose }) {
  const [kind, setKind] = useState('expense');
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [dueDay, setDueDay] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRow(kind, {
      name: name.trim(),
      value,
      dueDay: dueDay !== '' ? Math.min(31, Math.max(1, Number(dueDay))) : null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Sheet / Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Lançamento Rápido</h3>
            <p className="text-xs text-slate-400">Adicione em segundos sem rolar a tela</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Alternador Renda vs Despesa */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setKind('expense')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              kind === 'expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Despesa / Conta
          </button>
          <button
            type="button"
            onClick={() => setKind('income')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              kind === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Renda / Entrada
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
            <input
              autoFocus
              required
              maxLength={120}
              placeholder={kind === 'expense' ? 'Ex.: Supermercado, Almoço, Farmácia' : 'Ex.: Salário, Pix recebido, Freelance'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="field rounded-xl text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Valor (R$)</label>
              <MoneyInput
                label="Valor"
                value={value}
                onChange={setValue}
                className="text-left font-bold text-base bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dia (opcional)</label>
              <input
                type="number"
                min="1"
                max="31"
                inputMode="numeric"
                placeholder="Ex.: 10"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                className="field rounded-xl text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full btn-primary py-3 rounded-xl font-semibold text-base shadow-sm active:scale-98 transition-transform mt-2 flex items-center justify-center gap-2"
          >
            <span>+</span> Adicionar {kind === 'expense' ? 'despesa' : 'renda'}
          </button>
        </form>
      </div>
    </div>
  );
}
