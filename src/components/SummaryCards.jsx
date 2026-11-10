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
      {/* Widget Motivacional: Disponível para gastar hoje */}
      {dailyAllowance && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#14613e] to-[#123c2d] text-white rounded-2xl p-4 sm:p-5 shadow-sm shadow-emerald-950/10">
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-100 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full">
                <span>✨</span> Ritmo diário recomendado
              </span>
              <h3 className="text-xs sm:text-sm font-medium text-emerald-100">
                Disponível para gastar hoje:
              </h3>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {formatBRL(dailyAllowance.dailyValue)}
                <span className="text-xs sm:text-sm font-normal text-emerald-200 ml-1">/ dia</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-medium text-emerald-100">
                {dailyAllowance.isCurrentMonth
                  ? `Restam ${dailyAllowance.daysLeft} dias neste mês`
                  : 'Média diária para o mês selecionado'}
              </p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                {balance >= 0
                  ? 'Mantenha esse teto para fechar no azul'
                  : 'Gastos superando as entradas neste mês'}
              </p>
            </div>
          </div>
          {/* Decoração sutil de fundo */}
          <div className="absolute -right-8 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      )}

      {/* Grid com os 4 Cards Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ModernCard
          label="Rendas do mês"
          sub="recebidas + previstas"
          value={formatBRL(totalIncome)}
          icon="income"
          accent="text-emerald-700"
        />
        <ModernCard
          label="Despesas do mês"
          sub="pagas + pendentes"
          value={formatBRL(totalExpense)}
          icon="expense"
          accent="text-rose-700"
        />
        <ModernCard
          label="Saldo previsto"
          sub="não é o saldo bancário"
          value={formatBRL(balance)}
          icon="balance"
          accent={balance < 0 ? 'text-rose-600' : 'text-emerald-700'}
          highlight
        />

        {/* Card de Comprometimento com Barra de Progresso */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Comprometido
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${progressConfig.badgeBg} ${progressConfig.textColor}`}>
                {progressConfig.label}
              </span>
            </div>
            <p className={`text-base sm:text-2xl font-bold tabular-nums ${progressConfig.textColor}`}>
              {pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
            </p>
          </div>

          {/* Barra de Progresso Visual Elegante */}
          <div className="mt-2.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressConfig.barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {pct > 100 ? 'Orçamento estourado' : 'das rendas consideradas'}
            </p>
          </div>
        </div>
      </div>

      {/* Mini-cards horizontais: Falta Receber vs Falta Pagar */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
              ↓
            </span>
            <div>
              <p className="text-xs text-emerald-900 font-medium">Ainda a receber</p>
              <p className="text-sm font-bold text-emerald-950 tabular-nums">{formatBRL(toReceive)}</p>
            </div>
          </div>
          <span className="text-xs text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/50">
            Recebido: <strong>{formatBRL(receivedTotal)}</strong>
          </span>
        </div>

        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
              ↑
            </span>
            <div>
              <p className="text-xs text-amber-900 font-medium">Ainda a pagar</p>
              <p className="text-sm font-bold text-amber-950 tabular-nums">{formatBRL(toPay)}</p>
            </div>
          </div>
          <span className="text-xs text-amber-800 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200/50">
            Pago: <strong>{formatBRL(paidTotal)}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

function ModernCard({ label, sub, value, accent, icon, highlight = false }) {
  return (
    <div
      className={`bg-white border rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm ${
        highlight
          ? 'border-emerald-600/30 ring-1 ring-emerald-600/10'
          : 'border-slate-200/80'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {label}
          </p>
          <CardIcon type={icon} />
        </div>
        <p className={`text-base sm:text-2xl font-bold tabular-nums break-words ${accent}`}>
          {value}
        </p>
      </div>
      <p className="text-[11px] text-slate-400 mt-1.5">{sub}</p>
    </div>
  );
}

function CardIcon({ type }) {
  if (type === 'income') {
    return (
      <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
        ↗
      </span>
    );
  }
  if (type === 'expense') {
    return (
      <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">
        ↘
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
      =
    </span>
  );
}

function getProgressTheme(pct) {
  if (pct > 100) {
    return {
      barColor: 'bg-rose-500',
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-100',
      label: 'Crítico',
    };
  }
  if (pct >= 80) {
    return {
      barColor: 'bg-amber-500',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      label: 'Atenção',
    };
  }
  return {
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
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
