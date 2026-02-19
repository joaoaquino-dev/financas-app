import { formatBRL } from "../utils/currency";

export default function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  pct,
  incomeCount,
  expenseCount,
}) {
  const balanceColor = balance >= 0 ? "text-emerald-700" : "text-red-600";

  const pctColor =
    pct > 100
      ? "text-red-600"
      : pct > 80
        ? "text-amber-600"
        : "text-emerald-700";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Renda Total"
        sub={`${incomeCount} fonte${incomeCount !== 1 ? "s" : ""}`}
      >
        <span className="text-gray-900">{formatBRL(totalIncome)}</span>
      </Card>

      <Card
        label="Despesas Totais"
        sub={`${expenseCount} iten${expenseCount !== 1 ? "s" : ""}`}
      >
        <span className="text-gray-900">{formatBRL(totalExpense)}</span>
      </Card>

      <Card label="Saldo Final" sub="disponível">
        <span className={balanceColor}>{formatBRL(balance)}</span>
      </Card>

      <Card label="Comprometido" sub="da renda total">
        <span className={pctColor}>{pct.toFixed(1)}%</span>
      </Card>
    </div>
  );
}

function Card({ label, sub, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-xl font-bold font-mono leading-tight">{children}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
