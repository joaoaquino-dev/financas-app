import { formatBRL } from '../utils/currency';

export default function SummaryCards({ totalIncome, totalExpense, balance, pct, toReceive, toPay, receivedTotal, paidTotal }) {
  return <section aria-label="Resumo do mês" className="space-y-3">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card label="Rendas do mês" sub="recebidas + previstas" value={formatBRL(totalIncome)} />
      <Card label="Despesas do mês" sub="pagas + pendentes" value={formatBRL(totalExpense)} />
      <Card label="Saldo previsto" sub="não é o saldo bancário" value={formatBRL(balance)} color={balance < 0 ? 'text-rose-700' : 'text-emerald-700'} />
      <Card label="Comprometido" sub="das rendas consideradas" value={`${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} color={pct > 100 ? 'text-rose-700' : pct > 80 ? 'text-amber-700' : 'text-emerald-700'} />
    </div>
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm flex flex-wrap gap-2 justify-between"><span className="text-blue-900">Falta receber <strong>{formatBRL(toReceive)}</strong></span><span className="text-blue-800 text-xs self-center">Recebido: {formatBRL(receivedTotal)}</span></div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm flex flex-wrap gap-2 justify-between"><span className="text-amber-900">Falta pagar <strong>{formatBRL(toPay)}</strong></span><span className="text-amber-800 text-xs self-center">Pago: {formatBRL(paidTotal)}</span></div>
    </div>
  </section>;
}
function Card({ label, sub, value, color = 'text-slate-900' }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm min-w-0"><p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p><p className={`text-base sm:text-xl font-bold tabular-nums break-words ${color}`}>{value}</p><p className="text-[11px] text-slate-500 mt-1">{sub}</p></div>;
}
