import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useFinanceData } from './hooks/useFinanceData';
import { monthKey, normalizeData, shiftMonth, dueStatus } from './utils/finance';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import Auth from './components/Auth';
import MonthReview from './components/MonthReview';

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => { setSession(data.session); setAuthError(error ? 'Não foi possível restaurar a sessão. Entre novamente.' : ''); setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(next); setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!ready) return <p className="p-8 text-center">Carregando…</p>;
  if (recovery) return <Auth recovery onRecovered={() => setRecovery(false)} />;
  if (!session) return <>{authError && <p role="alert">{authError}</p>}<Auth onRecoveryRequested={() => setRecovery(true)} /></>;
  return <Finance key={session.user.id} user={session.user} />;
}
function Finance({ user }) {
  const [month, setMonth] = useState(() => monthKey());
  const f = useFinanceData(user.id, month);
  const [notice, setNotice] = useState('');
  const [review, setReview] = useState(false);
  const [legacy, setLegacy] = useState(() => { try { const raw = localStorage.getItem('financasApp_v2'); return raw ? normalizeData(JSON.parse(raw)) : null; } catch { return null; } });
  const discard = () => !f.dirty || window.confirm('Há alterações não salvas. Deseja descartá-las?');
  const isEmpty = !f.income.length && !f.expense.length;
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ month, ...f.data }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `financas-${month}.json`; a.click(); URL.revokeObjectURL(url);
  }
  async function importFile(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 2e6) throw new Error('Arquivo muito grande.');
      const next = normalizeData(JSON.parse(await file.text()));
      if (isEmpty || window.confirm('Substituir os itens deste mês pelo arquivo? Você ainda precisará salvar.')) { f.change(next); setNotice('Arquivo importado. Confira os valores e clique em Salvar alterações.'); }
    } catch (err) { setNotice(err.message || 'Arquivo inválido.'); }
  }
  return <div className="min-h-screen bg-slate-50">
    <header className="bg-white border-b"><div className="max-w-5xl mx-auto px-4 py-4 flex justify-between gap-3 items-center">
      <h1 className="font-bold text-lg"><span className="bg-blue-600 text-white rounded-lg p-2 mr-2 text-sm">R$</span>Finanças</h1>
      <div className="flex gap-3 items-center min-w-0"><span className="text-xs text-gray-500 truncate hidden sm:block max-w-56">{user.email}</span><button className="btn-secondary" disabled={f.busy} onClick={async () => { if (discard()) { const { error } = await supabase.auth.signOut(); if (error) setNotice('Não foi possível sair. Tente novamente.'); } }}>Sair</button></div>
    </div></header>
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold">Planejamento mensal</h2><p className="text-sm text-gray-500 mt-1">Suas contas, parcelas e rendas, um mês de cada vez.</p></div>
        <label className="text-sm font-medium">Mês de pagamento<input aria-label="Mês de pagamento" type="month" required value={month} disabled={f.busy} onChange={e => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value) && discard()) { setMonth(e.target.value); setNotice(''); } }} className="field mt-1" /></label>
      </div>
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-20 shadow-sm">
        <p role="status" className={`text-sm ${f.dirty ? 'text-amber-700' : 'text-emerald-700'}`}>{f.busy ? 'Conectando…' : f.dirty ? 'Alterações ainda não salvas' : f.loaded ? 'Salvo na nuvem' : 'Falha na conexão'}</p>
        <div className="flex flex-wrap gap-2"><button className="btn-secondary" disabled={f.busy} onClick={() => { if (discard()) f.load(); }}>Atualizar</button><button className="btn-primary" disabled={f.busy || !f.dirty || !f.loaded} onClick={f.save}>{f.busy ? 'Aguarde…' : 'Salvar alterações'}</button></div>
      </div>
      {f.error && <p role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">{f.error}</p>}
      {notice && <p role="status" className="bg-blue-50 p-3 rounded-lg text-sm">{notice}<button aria-label="Fechar aviso" className="float-right px-2" onClick={() => setNotice('')}>×</button></p>}
      {legacy && f.loaded && <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-3"><p><strong>Encontramos seus dados antigos neste navegador.</strong> Escolha o mês de pagamento acima e importe para não precisar redigitar.</p><div className="flex gap-2 flex-wrap"><button className="btn-secondary" disabled={f.busy} onClick={() => { if (isEmpty || window.confirm('Substituir os itens deste mês pelos dados antigos?')) { f.change(legacy); setLegacy(null); setNotice('Dados antigos carregados. Confira e clique em Salvar alterações. O original foi preservado no navegador.'); } }}>Importar dados antigos para este mês</button><button onClick={() => setLegacy(null)}>Agora não</button></div></div>}
      {f.loaded && <>
      <SummaryCards {...f} />
      {f.expense.some(row => dueStatus(row, month)) && <p className="text-sm text-rose-800 bg-rose-50 p-3 rounded-xl">Há contas vencidas ou vencendo hoje. Use o filtro em Contas e cartões para conferir.</p>}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap justify-between items-center gap-3"><div><h3 className="font-semibold text-sm">Deixe o próximo mês encaminhado</h3><p className="text-xs text-slate-500 mt-1">Reaproveite contas, avance as parcelas e revise tudo antes de criar.</p></div><button className="btn-primary" disabled={f.busy || f.dirty || isEmpty} onClick={() => setReview(true)}>Preparar próximo mês</button>{f.dirty && <p className="text-xs text-amber-700 w-full">Salve as alterações deste mês para preparar o próximo.</p>}</div>
      <fieldset disabled={f.busy} className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {['income', 'expense'].map(kind => <TransactionTable key={`${month}-${kind}`} kind={kind} month={month} rows={f[kind]} total={kind === 'income' ? f.totalIncome : f.totalExpense} onAdd={() => f.add(kind)} onUpdate={(id, patch) => f.update(kind, id, patch)} onDelete={id => f.remove(kind, id)} />)}
      </fieldset>
      {isEmpty && <p className="text-sm text-slate-500">Já tem um mês preenchido? Abra esse mês no seletor e use “Preparar próximo mês”. Ou cadastre suas contas abaixo de cada seção.</p>}
      <div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={exportData}>Exportar backup</button><label className={`btn-secondary cursor-pointer ${f.busy ? 'opacity-50' : ''}`}>Importar backup<input disabled={f.busy} className="sr-only" type="file" accept="application/json,.json" onChange={importFile} /></label></div>
      <p className="text-xs text-slate-500 leading-relaxed">Selecione o mês em que vai pagar as contas. Em “Repetição e vencimento”, escolha se cada despesa é fixa, variável, parcelada ou um cartão. Marque rendas recebidas e contas pagas. Depois de editar, salve. Os outros dispositivos atualizam ao voltar à aba e a cada 30 segundos, sem edições pendentes.</p>
      {review && <MonthReview source={f.data} sourceMonth={month} targetMonth={shiftMonth(month, 1)} busy={f.busy} error={f.error} onClose={() => setReview(false)} onCreate={async draft => { const next = shiftMonth(month, 1); if (await f.createMonth(next, draft)) { setReview(false); setMonth(next); setNotice('Mês criado e salvo. As contas do mês anterior foram preservadas.'); } }} />}
      </>}
    </main>
  </div>;
}
