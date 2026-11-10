import { formatBRL } from '../utils/currency';

export default function SummaryCards({
  totalIncome = 0,
  totalExpense = 0,
  balance = 0,
  pct = 0,
  toReceive = 0,
  toPay = 0,
  receivedTotal = 0,
  paidTotal = 0,
  month = '',
}) {
  const dailyAllowance = calculateDailyAllowance(balance, month);
  const progressConfig = getProgressTheme(pct);

  return (
    <section aria-label="Resumo do mês" className="space-y-3.5">
      {/* Widget Motivacional Alviverde: Disponível para gastar hoje (100% tipográfico, sem ícones) */}
      {dailyAllowance && (
        <div className="bg-[#006437] text-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-l-[#d4a017]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-bold tracking-widest text-[#d4a017] uppercase">
                Ritmo diário disponível
              </span>
              <h3 className="text-xs sm:text-sm font-medium text-emerald-100">
                Disponível para gastar hoje:
              </h3>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-white">
                {formatBRL(dailyAllowance.dailyValue)}
                <span className="text-xs sm:text-sm font-normal text-emerald-200 ml-1.5">/ dia</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-white">
                {dailyAllowance.isCurrentMonth
                  ? `Restam ${dailyAllowance.daysLeft} dias neste mês`
                  : 'Média diária para o mês selecionado'}
              </p>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {balance >= 0
                  ? 'Dentro do planejamento previsto'
                  : 'Despesas superando as receitas'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid com os 4 Cards Principais (Sem ícones) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ModernCard
          label="Rendas do mês"
          sub="recebidas + previstas"
          value={formatBRL(totalIncome)}
          accent="text-[#006437]"
        />
        <ModernCard
          label="Despesas do mês"
          sub="pagas + pendentes"
          value={formatBRL(totalExpense)}
          accent="text-rose-700"
        />
        <ModernCard
          label="Saldo previsto"
          sub="rendas − despesas"
          value={formatBRL(balance)}
          accent={balance < 0 ? 'text-rose-600' : 'text-[#006437]'}
          highlight
        />

        {/* Card de Comprometimento com Barra de Progresso Alviverde */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-500 uppercase">
                Comprometido
              </p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${progressConfig.badgeBg} ${progressConfig.textColor}`}>
                {progressConfig.label}
              </span>
            </div>
            <p className={`text-base sm:text-2xl font-bold tabular-nums ${progressConfig.textColor}`}>
              {pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
            </p>
          </div>

          <div className="mt-2.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressConfig.barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {pct > 100 ? 'Orçamento estourado' : 'da renda considerada'}
            </p>
          </div>
        </div>
      </div>

      {/* Mini-cards horizontais: Falta Receber vs Falta Pagar (Sem ícones) */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-[#f0f7f3] border border-[#bde1cc] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs">
          <div>
            <p className="text-xs text-[#00502c] font-semibold uppercase tracking-wider">A receber</p>
            <p className="text-sm sm:text-base font-bold text-[#003e22] tabular-nums mt-0.5">{formatBRL(toReceive)}</p>
          </div>
          <span className="text-xs font-medium text-[#00502c] bg-white px-2.5 py-1 rounded-lg border border-[#bde1cc]/60">
            Recebido: <strong>{formatBRL(receivedTotal)}</strong>
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs">
          <div>
            <p className="text-xs text-amber-900 font-semibold uppercase tracking-wider">A pagar</p>
            <p className="text-sm sm:text-base font-bold text-amber-950 tabular-nums mt-0.5">{formatBRL(toPay)}</p>
          </div>
          <span className="text-xs font-medium text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200/60">
            Pago: <strong>{formatBRL(paidTotal)}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

function ModernCard({ label, sub, value, accent, highlight = false }) {
  return (
    <div
      className={`bg-white border rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between transition-all ${
        highlight
          ? 'border-[#006437]/40 ring-1 ring-[#006437]/15'
          : 'border-slate-200/90'
      }`}
    >
      <div>
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-500 uppercase mb-1.5">
          {label}
        </p>
        <p className={`text-base sm:text-2xl font-bold tabular-nums break-words ${accent}`}>
          {value}
        </p>
      </div>
      <p className="text-[11px] text-slate-400 mt-1.5">{sub}</p>
    </div>
  );
}

function getProgressTheme(pct) {
  if (pct > 100) {
    return {
      barColor: 'bg-rose-600',
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-100',
      label: 'Crítico',
    };
  }
  if (pct >= 80) {
    return {
      barColor: 'bg-[#d4a017]',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      label: 'Atenção',
    };
  }
  return {
    barColor: 'bg-[#006437]',
    textColor: 'text-[#006437]',
    badgeBg: 'bg-[#dcf0e4]',
    label: 'Saudável',
  };
}

function calculateDailyAllowance(balance, month) {
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, num] = month.split('-').map(Number);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === num;
  const daysInMonth = new Date(year, num, 0).getDate();
  const daysLeft = isCurrentMonth ? Math.max(1, daysInMonth - now.getDate() + 1) : daysInMonth;
  const dailyValue = balance > 0 ? balance / daysLeft : 0;
  return { dailyValue, daysLeft, isCurrentMonth };
}
