import { useState, useEffect } from "react";

const STORAGE_KEY = "financasApp_v2";

// Dados iniciais de exemplo
const dadosIniciais = {
  income: [{ id: Date.now(), name: "Salário", value: 5000 }],
  expense: [
    { id: Date.now() + 1, name: "Aluguel", value: 1500 },
    { id: Date.now() + 2, name: "Alimentação", value: 800 },
    { id: Date.now() + 3, name: "Internet", value: 120 },
  ],
};

// Tenta carregar dados salvos no navegador, senão usa os dados iniciais
function carregarDados() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {}
  return dadosIniciais;
}

export function useFinanceData() {
  const [income, setIncome] = useState(() => carregarDados().income);
  const [expense, setExpense] = useState(() => carregarDados().expense);

  // Salva no localStorage toda vez que income ou expense mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, expense }));
  }, [income, expense]);

  // ── Funções de renda ──────────────────────────────────────────────────────

  function addIncome() {
    setIncome((prev) => [...prev, { id: Date.now(), name: "", value: 0 }]);
  }

  function updateIncome(id, field, value) {
    setIncome((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function deleteIncome(id) {
    setIncome((prev) => prev.filter((row) => row.id !== id));
  }

  // ── Funções de despesa ────────────────────────────────────────────────────

  function addExpense() {
    setExpense((prev) => [...prev, { id: Date.now(), name: "", value: 0 }]);
  }

  function updateExpense(id, field, value) {
    setExpense((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function deleteExpense(id) {
    setExpense((prev) => prev.filter((row) => row.id !== id));
  }

  // ── Valores calculados ────────────────────────────────────────────────────

  const totalIncome = income.reduce((soma, row) => soma + row.value, 0);
  const totalExpense = expense.reduce((soma, row) => soma + row.value, 0);
  const balance = totalIncome - totalExpense;
  const pct = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  return {
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
  };
}
