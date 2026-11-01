import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ recovery = false, onRecovered, onRecoveryRequested }) {
  const [mode, setMode] = useState(recovery ? 'password' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      let result;
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
      if (mode === 'login') result = await supabase.auth.signInWithPassword({ email, password });
      if (mode === 'signup') result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
      if (mode === 'reset') result = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (mode === 'password') result = await supabase.auth.updateUser({ password });
      if (mode === 'verify') {
        const url = new URL(link.trim());
        const token_hash = url.searchParams.get('token') || url.searchParams.get('token_hash');
        const type = url.searchParams.get('type');
        if (url.origin !== 'https://liajnsmwmnodczdwtnhk.supabase.co' || !token_hash || !['signup', 'email', 'recovery', 'magiclink'].includes(type)) throw new Error('Link inválido. Copie o endereço do botão no e-mail recebido.');
        result = await supabase.auth.verifyOtp({ token_hash, type });
        if (!result.error && type === 'recovery') setMode('password');
      }
      if (result.error) throw result.error;
      if (mode === 'signup' || mode === 'reset') {
        setMessage('Confira seu e-mail e o spam. Copie o endereço do botão recebido (sem abrir) e cole abaixo para continuar.');
        setMode('verify');
      }
      if (mode === 'password') onRecovered?.();
    } catch (err) {
      setMessage(err.message?.includes('Invalid login') ? 'E-mail ou senha incorretos.' : err.message?.includes('rate limit') ? 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' : err.message || 'Não foi possível conectar. Tente novamente.');
    } finally { setBusy(false); }
  }
  return <main className="max-w-md mx-auto px-5 py-16">
    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
      <div className="text-blue-600 font-bold">R$ · Finanças</div>
      <h1 className="text-2xl font-bold">Seu próximo mês, organizado.</h1>
      <p className="text-sm text-gray-500">Planeje suas contas e acompanhe as faturas em qualquer dispositivo.</p>
      <form onSubmit={submit} className="space-y-4">
        {!['verify', 'password'].includes(mode) && <label className="block text-sm">E-mail<input required autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="field mt-1" /></label>}
        {['login', 'signup', 'password'].includes(mode) && <label className="block text-sm">{mode === 'password' ? 'Nova senha' : 'Senha'}<input required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" value={password} onChange={e => setPassword(e.target.value)} className="field mt-1" /></label>}
        {mode === 'verify' && <label className="block text-sm">Link recebido no e-mail<input required type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="Cole o endereço do botão do e-mail" className="field mt-1" /></label>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Aguarde…' : ({ login: 'Entrar', signup: 'Criar conta', reset: 'Enviar recuperação', verify: 'Confirmar e continuar', password: 'Salvar nova senha' })[mode]}</button>
      </form>
      {message && <p role="status" className="text-sm bg-blue-50 p-3 rounded-lg break-words">{message}</p>}
      {!recovery && <div className="flex flex-wrap gap-3 text-sm text-blue-700">
        <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Já tenho conta' : 'Criar conta'}</button>
        <button onClick={() => setMode('login')}>Entrar</button>
        <button onClick={() => setMode('reset')}>Esqueci a senha</button>
        <button onClick={() => setMode('verify')}>Já recebi o link</button>
      </div>}
    </div>
  </main>;
}
