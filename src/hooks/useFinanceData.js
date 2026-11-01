import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { emptyMonth, normalizeData, newRow, totals } from '../utils/finance';

export function useFinanceData(userId, month) {
  const [data, setData] = useState(emptyMonth);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const editVersion = useRef(0);
  const activeMonth = useRef(month); activeMonth.current = month;
  const generation = useRef(0);
  const load = useCallback(async (quiet = false) => {
    const gen = ++generation.current;
    if (!quiet) { setBusy(true); setLoaded(false); }
    const { data: row, error: err } = await supabase.from('finance_months').select('data,revision').eq('user_id', userId).eq('month', month).maybeSingle();
    if (gen !== generation.current) return;
    if (err) setError('Não foi possível carregar os dados. Verifique sua conexão e tente atualizar.');
    else { let next; try { next = row ? normalizeData(row.data, { regenerateIds: false }) : emptyMonth(); } catch { setError('Os dados recebidos são inválidos. Exporte um backup antes de alterar.'); setBusy(false); return; } setData(next); setRevision(row?.revision || 0); setDirty(false); setError(''); setLoaded(true); }
    setBusy(false);
  }, [userId, month]);
  useEffect(() => { load(); return () => { generation.current++; }; }, [load]);
  useEffect(() => {
    if (dirty || busy || saving || !loaded) return;
    const refresh = () => { if (document.visibilityState === 'visible') load(true); };
    window.addEventListener('focus', refresh);
    const timer = setInterval(refresh, 30000);
    return () => { window.removeEventListener('focus', refresh); clearInterval(timer); };
  }, [dirty, busy, saving, loaded, load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function change(next) { editVersion.current++; generation.current++; setData(next); setDirty(true); setError(''); }
  function add(kind) { change({ ...data, [kind]: [...data[kind], newRow(kind)] }); }
  function update(kind, id, patch) { change({ ...data, [kind]: data[kind].map(row => row.id === id ? { ...row, ...patch } : row) }); }
  function remove(kind, id) { change({ ...data, [kind]: data[kind].filter(row => row.id !== id) }); }
  async function save() {
    if (savingRef.current || busy || !loaded) return false;
    if (!dirty) return true;
    savingRef.current = true; setSaving(true); setError('');
    const version = editVersion.current;
    try {
      const canonical = normalizeData(data, { regenerateIds: false });
      const { data: nextRevision, error: err } = await supabase.rpc('save_finance_month', { p_month: month, p_data: canonical, p_revision: revision });
      if (err) throw err;
      if (activeMonth.current !== month) return false;
      setRevision(nextRevision);
      if (editVersion.current === version) { setData(canonical); setDirty(false); }
      return editVersion.current === version;
    } catch (err) {
      setError(err.message?.includes('CONFLICT') ? 'Este mês mudou em outro dispositivo. Exporte suas alterações antes de recarregar e conferir os valores.' : err instanceof Error ? err.message : 'Não foi possível salvar. Suas alterações continuam na tela. Verifique a conexão e tente novamente.');
      return false;
    } finally { savingRef.current = false; setSaving(false); }
  }
  useEffect(() => {
    if (!dirty || busy || saving || !loaded || error) return;
    const timer = setTimeout(() => { save(); }, 900);
    return () => clearTimeout(timer);
  }, [data, dirty, busy, saving, loaded, error, month, revision]);
  async function createMonth(targetMonth, draft) {
    setBusy(true); setError('');
    try {
      const canonical = normalizeData(draft, { regenerateIds: false });
      const { error: err } = await supabase.rpc('save_finance_month', { p_month: targetMonth, p_data: canonical, p_revision: 0 });
      if (err) throw err;
      return true;
    } catch (err) {
      setError(err.message?.includes('CONFLICT') ? 'Esse mês já existe. Nada foi substituído. Feche a revisão e abra o mês pelo seletor.' : err.message || 'Não foi possível criar o mês. Tente novamente.');
      return false;
    } finally { setBusy(false); }
  }
  return { ...data, data, busy, saving, dirty, error, loaded, load, save, change, add, update, remove, createMonth, ...totals(data) };
}
