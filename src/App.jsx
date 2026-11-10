import Forecast from './components/Forecast';
import Brand from './components/Brand';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useFinanceData } from './hooks/useFinanceData';
import { monthKey, normalizeData, shiftMonth, dueStatus, newRow } from './utils/finance';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import Auth from './components/Auth';
import MonthReview from './components/MonthReview';
import QuickAddModal from './components/QuickAddModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      setSession(data.session);
      setAuthError(error ? 'Não foi possível restaurar a sessão. Entre novamente.' : '');
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(next);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return <p className="p-8 text-center text-slate-400">Carregando…</p>;
  if (recovery) return <Auth recovery onRecovered={() => setRecovery(false)} />;
  if (!session) {
    return (
      <>
        {authError && <p role="alert" className="p-4 text-center text-rose-700">{authError}</p>}
        <Auth onRecoveryRequested={() => setRecovery(true)} />
      </>
    );
  }
  return <Finance key={session.user.id} user={session.user} />;
}

function Finance({ user }) {
  const [month, setMonth] = useState(() => monthKey());
  const f = useFinanceData(user.id, month);
  const [notice, setNotice] = useState('');
  const [review, setReview] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [legacy, setLegacy] = useState(() => {
    try {
      const raw = localStorage.getItem('financasApp_v2');
      return raw ? normalizeData(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  });

  const discard = () => !f.dirty || window.confirm('Há alterações não salvas. Deseja descartá-las?');

  async function navigateMonth(next) {
    if (f.busy || f.saving || !/^\d{4}-(0[1-9]|1[0-2])$/.test(next)) return;
    if (f.dirty && !(await f.save())) return;
    setMonth(next);
    setNotice('');
  }

  const isEmpty = !f.income.length && !f.expense.length;

  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ month, ...f.data }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `soma-${month}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 2e6) throw new Error('Arquivo muito grande.');
      const next = normalizeData(JSON.parse(await file.text()));
      if (isEmpty || window.confirm('Substituir os itens deste mês pelo arquivo? O arquivo será salvo automaticamente.')) {
        f.change(next);
        setNotice('Arquivo importado com sucesso.');
      }
    } catch (err) {
      setNotice(err.message || 'Arquivo inválido.');
    }
  }

  function handleQuickAddRow(kind, { name, value, dueDay }) {
    const row = {
      ...newRow(kind),
      name,
      value,
      dueDay,
    };
    f.change({
      ...f.data,
      [kind]: [...f.data[kind], row],
    });
  }

  return (
    <div className="soma-app min-h-screen bg-[#f4f7f5] pb-24 sm:pb-12 text-[#002a17]">
      {/* Cabeçalho Alviverde Imponente (borda verde clássica) */}
      <header className="bg-white border-b border-slate-200/90 border-t-4 border-t-[#006437] sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between gap-3 items-center">
          <Brand />

          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Status Minimalista de Sincronização (Sem emojis/ícones gráficos) */}
            <CloudStatus f={f} onDiscardRefresh={() => { if (discard()) f.load(); }} />

            <span className="text-xs text-slate-400 truncate hidden sm:block max-w-44 font-mono">
              {user.email}
            </span>

            <button
              className="text-xs text-slate-500 hover:text-[#006437] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-[#f0f7f3] transition-colors"
              disabled={f.busy || f.saving}
              onClick={async () => {
                if (!f.saving && (!f.dirty || (await f.save()))) {
                  const { error } = await supabase.auth.signOut();
                  if (error) setNotice('Não foi possível sair. Tente novamente.');
                }
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Navegador de Mês */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#003e22]">
              Visão do Mês
            </h2>
            <p className="text-xs text-slate-500">Contas, parcelas e rendas organizadas.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f0f7f3] text-slate-600 disabled:opacity-40 transition-colors font-bold"
              aria-label="Mês anterior"
              disabled={f.busy || f.saving}
              onClick={() => navigateMonth(shiftMonth(month, -1))}
            >
              ‹
            </button>
            <input
              aria-label="Mês de pagamento"
              type="month"
              required
              value={month}
              disabled={f.busy || f.saving}
              onChange={e => navigateMonth(e.target.value)}
              className="border-0 bg-transparent text-xs sm:text-sm font-bold text-[#003e22] py-1 px-2 focus:ring-0 cursor-pointer"
            />
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f0f7f3] text-slate-600 disabled:opacity-40 transition-colors font-bold"
              aria-label="Próximo mês"
              disabled={f.busy || f.saving}
              onClick={() => navigateMonth(shiftMonth(month, 1))}
            >
              ›
            </button>
            {month !== monthKey() && (
              <button
                className="text-xs font-bold text-[#006437] hover:bg-[#f0f7f3] px-2.5 py-1 rounded-lg ml-1 transition-colors"
                disabled={f.busy || f.saving}
                onClick={() => navigateMonth(monthKey())}
              >
                Hoje
              </button>
            )}
          </div>
        </div>

        {/* Notificações e Erros */}
        {f.error && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm flex items-center justify-between gap-2">
            <span>{f.error}</span>
            {f.dirty && (
              <button
                className="btn-primary text-xs py-1 px-3 shrink-0"
                disabled={f.busy || f.saving}
                onClick={f.save}
              >
                Tentar salvar
              </button>
            )}
          </div>
        )}

        {notice && (
          <p role="status" className="bg-[#f0f7f3] text-[#00502c] border border-[#bde1cc] p-3 rounded-xl text-sm flex justify-between items-center">
            {notice}
            <button aria-label="Fechar aviso" className="px-2 font-bold text-slate-400 hover:text-slate-700" onClick={() => setNotice('')}>×</button>
          </p>
        )}

        {/* Importação de Dados Antigos */}
        {legacy && f.loaded && (
          <div className="bg-[#f0f7f3] border border-[#bde1cc] rounded-2xl p-4 text-sm space-y-2">
            <p><strong>Encontramos seus dados antigos neste navegador.</strong> Deseja importá-los para este mês?</p>
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn-secondary text-xs"
                disabled={f.busy}
                onClick={() => {
                  if (isEmpty || window.confirm('Substituir os itens deste mês pelos dados antigos?')) {
                    f.change(legacy);
                    setLegacy(null);
                    setNotice('Dados antigos carregados.');
                  }
                }}
              >
                Importar dados antigos
              </button>
              <button className="text-xs text-slate-500 hover:underline px-2" onClick={() => setLegacy(null)}>
                Agora não
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        {f.loaded && (
          <>
            <SummaryCards {...f} month={month} />

            {/* Alerta de contas com vencimento urgente */}
            {f.expense.some(row => dueStatus(row, month)) && (
              <div className="bg-rose-50/80 border border-rose-200/80 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-rose-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>Atenção: há contas vencidas ou vencendo hoje.</span>
              </div>
            )}

            {/* Card de Preparação do Próximo Mês */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-[#003e22]">Deixe o próximo mês encaminhado</h3>
                <p className="text-xs text-slate-400 mt-0.5">Avance parcelas vigentes e repita as despesas fixas.</p>
              </div>
              <button
                className="btn-primary text-xs py-2 px-4 rounded-xl font-bold"
                disabled={f.busy || f.saving || f.dirty || isEmpty}
                onClick={() => setReview(true)}
              >
                Preparar próximo mês
              </button>
              {f.dirty && <p className="text-xs text-amber-700 w-full">Aguarde a gravação automática para preparar o próximo.</p>}
            </div>

            {/* Listas de Rendas e Despesas */}
            <fieldset disabled={f.busy} className="grid grid-cols-1 gap-5">
              {['income', 'expense'].map(kind => (
                <TransactionTable
                  key={`${month}-${kind}`}
                  kind={kind}
                  month={month}
                  rows={f[kind]}
                  total={kind === 'income' ? f.totalIncome : f.totalExpense}
                  onAdd={() => f.add(kind)}
                  onUpdate={(id, patch) => f.update(kind, id, patch)}
                  onDelete={id => f.remove(kind, id)}
                />
              ))}
            </fieldset>

            {isEmpty && (
              <p className="text-sm text-slate-500 text-center py-4">
                Mês vazio. Adicione lançamentos acima ou use o botão <strong>+</strong> no celular.
              </p>
            )}

            <Forecast data={f.data} month={month} />

            {/* Ferramentas de Backup e Rodapé */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button className="btn-secondary text-xs" onClick={exportData}>Exportar backup</button>
              <label className={`btn-secondary text-xs cursor-pointer ${f.busy ? 'opacity-50' : ''}`}>
                Importar backup
                <input disabled={f.busy} className="sr-only" type="file" accept="application/json,.json" onChange={importFile} />
              </label>
            </div>

            <p className="soma-help text-xs text-slate-400 leading-relaxed pt-2">
              Selecione o mês em que vai pagar as contas. Em “⋯”, defina repetição e parcelamentos. Marque rendas recebidas e contas pagas. Alterações são sincronizadas automaticamente.
            </p>
          </>
        )}
      </main>

      {/* =========================================================
          BOTÃO FLUTUANTE (FAB) VERDE PALMEIRAS NO CELULAR
      ========================================================= */}
      <button
        type="button"
        aria-label="Adicionar lançamento rápido"
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-5 sm:hidden z-40 w-14 h-14 bg-[#006437] text-white rounded-full shadow-lg shadow-emerald-950/25 flex items-center justify-center text-3xl font-light hover:bg-[#00502c] active:scale-90 transition-transform"
      >
        +
      </button>

      {/* Modal / Sheet de Entrada Rápida */}
      {showQuickAdd && (
        <QuickAddModal
          onAddRow={handleQuickAddRow}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* Modal de Revisão do Próximo Mês */}
      {review && (
        <MonthReview
          source={f.data}
          sourceMonth={month}
          targetMonth={shiftMonth(month, 1)}
          busy={f.busy}
          error={f.error}
          onClose={() => setReview(false)}
          onCreate={async draft => {
            const next = shiftMonth(month, 1);
            if (await f.createMonth(next, draft)) {
              setReview(false);
              setMonth(next);
              setNotice('Próximo mês criado e salvo com sucesso!');
            }
          }}
        />
      )}
    </div>
  );
}

/* Indicador Minimalista Alviverde (sem ícones/desenhos) */
function CloudStatus({ f, onDiscardRefresh }) {
  if (f.saving) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        <span className="hidden sm:inline">Salvando…</span>
      </span>
    );
  }
  if (f.dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="hidden sm:inline">Pendente</span>
      </span>
    );
  }
  if (f.error) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span className="hidden sm:inline">Erro</span>
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span
        title="Dados sincronizados na nuvem"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-[#006437] bg-[#f0f7f3] border border-[#bde1cc]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#006437]" />
        <span className="hidden sm:inline">Sincronizado</span>
      </span>
      <button
        type="button"
        title="Recarregar dados da nuvem"
        disabled={f.busy || f.saving}
        onClick={onDiscardRefresh}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#006437] hover:bg-[#f0f7f3] transition-colors text-xs font-bold"
      >
        ↻
      </button>
    </div>
  );
}
