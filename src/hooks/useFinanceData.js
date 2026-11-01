import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { emptyMonth, normalizeData, previousMonth } from '../utils/finance';

export function useFinanceData(userId, month) {
  const [data, setData] = useState(emptyMonth);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const generation = useRef(0);
  const load = useCallback(async (quiet = false) => {
    const gen = ++generation.current;
    if (!quiet) { setBusy(true); setLoaded(false); }
    const { data: row, error: err } = await supabase.from('finance_months').select('data,revision').eq('user_id', userId).eq('month', month).maybeSingle();
    if (gen !== generation.current) return;
    if (err) setError('Não foi possível carregar os dados. Verifique sua conexão e tente atualizar.');
    else { setData(row?.data || emptyMonth()); setRevision(row?.revision || 0); setDirty(false); setError(''); setLoaded(true); }
    setBusy(false);
  }, [userId, month]);
  useEffect(() => { load(); return () => { generation.current++; }; }, [load]);
  useEffect(() => {
    if (dirty || busy || !loaded) return;
    const refresh = () => { if (document.visibilityState === 'visible') load(true); };
    window.addEventListener('focus', refresh);
    const timer = setInterval(refresh, 30000);
    return () => { window.removeEventListener('focus', refresh); clearInterval(timer); };
  }, [dirty, busy, loaded, load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function change(next) { generation.current++; setData(next); setDirty(true); setError(''); }
  function add(kind) { change({ ...data, [kind]: [...data[kind], { id: crypto.randomUUID(), name: '', value: 0 }] }); }
  function update(kind, id, field, value) { change({ ...data, [kind]: data[kind].map(row => row.id === id ? { ...row, [field]: value } : row) }); }
  function remove(kind, id) { change({ ...data, [kind]: data[kind].filter(row => row.id !== id) }); }
  async function save() {
    setBusy(true); setError('');
    try {
      normalizeData(data);
      const { data: nextRevision, error: err } = await supabase.rpc('save_finance_month', { p_month: month, p_data: data, p_revision: revision });
      if (err) throw err;
      setRevision(nextRevision); setDirty(false);
    } catch (err) {
      setError(err.message?.includes('CONFLICT') ? 'Este mês mudou em outro dispositivo. Exporte suas alterações antes de recarregar e conferir os valores.' : 'Não foi possível salvar. Suas alterações continuam na tela. Verifique a conexão e tente novamente.');
    } finally { setBusy(false); }
  }
  async function copyPrevious() {
    setBusy(true);
    const { data: row, error: err } = await supabase.from('finance_months').select('data').eq('user_id', userId).eq('month', previousMonth(month)).maybeSingle();
    if (err) setError('Não foi possível copiar o mês anterior.');
    else if (!row) setError('O mês anterior ainda não tem dados salvos.');
    else change(normalizeData(row.data));
    setBusy(false);
  }
  const totalIncome = data.income.reduce((sum, row) => sum + row.value, 0);
  const totalExpense = data.expense.reduce((sum, row) => sum + row.value, 0);
  return { ...data, data, busy, dirty, error, loaded, load, save, change, add, update, remove, copyPrevious,
    totalIncome, totalExpense, balance: totalIncome - totalExpense, pct: totalIncome ? totalExpense / totalIncome * 100 : 0 };
}
