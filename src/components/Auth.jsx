import Brand from './Brand';
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
    event.preventDefault();
    setBusy(true);
    setMessage('');
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
        if (url.origin !== 'https://liajnsmwmnodczdwtnhk.supabase.co' || !token_hash || !['signup', 'email', 'recovery', 'magiclink'].includes(type)) {
          throw new Error('Link inválido. Copie o endereço do botão no e-mail recebido.');
        }
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
      setMessage(
        err.message?.includes('Invalid login')
          ? 'E-mail ou senha incorretos.'
          : err.message?.includes('rate limit')
          ? 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
          : err.message || 'Não foi possível conectar. Tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] flex items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-[#003e22]/5 border border-[#bde1cc]/80 p-7 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Detalhe Alviverde no topo */}
        <div className="h-1.5 w-full bg-[#006437] absolute top-0 inset-x-0" />

        <div className="pt-2">
          <Brand />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003e22] tracking-tight">
            Um mês de cada vez.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Contas, faturas e planos no mesmo lugar. Acesse no celular ou no computador.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!['verify', 'password'].includes(mode) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00502c] mb-1">
                E-mail
              </label>
              <input
                required
                autoComplete="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="field rounded-xl text-sm"
              />
            </div>
          )}

          {['login', 'signup', 'password'].includes(mode) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00502c] mb-1">
                {mode === 'password' ? 'Nova senha' : 'Senha'}
              </label>
              <input
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="field rounded-xl text-sm"
              />
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00502c] mb-1">
                Link recebido no e-mail
              </label>
              <input
                required
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="Cole o endereço recebido no e-mail"
                className="field rounded-xl text-sm"
              />
            </div>
          )}

          <button
            disabled={busy}
            className="btn-primary w-full py-3 rounded-xl font-bold text-sm tracking-wide shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60"
          >
            {busy
              ? 'Aguarde…'
              : ({
                  login: 'Entrar no Soma',
                  signup: 'Criar conta gratuita',
                  reset: 'Enviar recuperação',
                  verify: 'Confirmar e continuar',
                  password: 'Salvar nova senha',
                })[mode]}
          </button>
        </form>

        {message && (
          <p role="status" className="text-xs font-medium bg-[#f0f7f3] border border-[#bde1cc] text-[#00502c] p-3.5 rounded-xl break-words leading-relaxed">
            {message}
          </p>
        )}

        {!recovery && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              className="font-bold text-[#006437] hover:underline"
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Já tenho uma conta' : 'Criar nova conta'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-slate-500 hover:text-[#006437] transition-colors"
                onClick={() => setMode('reset')}
              >
                Esqueci a senha
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                className="text-slate-500 hover:text-[#006437] transition-colors"
                onClick={() => setMode('verify')}
              >
                Validar link
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
