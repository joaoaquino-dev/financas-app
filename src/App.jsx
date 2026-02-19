import { useFinanceData } from "./hooks/useFinanceData";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";

export default function App() {
  const {
    income,
    expense,
    totalIncome,
    totalExpense,
    balance,
    pct,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useFinanceData();

  const mesAtual = new Date()
    .toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-base">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              R$
            </div>
            Finanças
          </div>
          <span className="text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            {mesAtual}
          </span>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Cards de resumo */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Resumo do Mês
          </p>
          <SummaryCards
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            pct={pct}
            incomeCount={income.length}
            expenseCount={expense.length}
          />
        </section>

        {/* Tabelas */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Lançamentos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TransactionTable
              title="Renda Mensal"
              accent="blue"
              rows={income}
              total={totalIncome}
              onAdd={addIncome}
              onUpdate={updateIncome}
              onDelete={deleteIncome}
            />
            <TransactionTable
              title="Despesas Mensais"
              accent="red"
              rows={expense}
              total={totalExpense}
              onAdd={addExpense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
