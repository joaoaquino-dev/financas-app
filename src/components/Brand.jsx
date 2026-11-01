export default function Brand({ compact = false }) {
  return <span className="soma-brand">
    <svg aria-hidden="true" viewBox="0 0 40 40" className="soma-mark"><rect width="40" height="40" rx="12" fill="#9cdb72"/><path d="M20 10v20M10 20h20" stroke="#123c2d" strokeWidth="5" strokeLinecap="round"/></svg>
    <span><span className="soma-wordmark">soma<span className="soma-dot">.</span></span>{!compact && <span className="soma-tagline">Suas contas, mês a mês.</span>}</span>
  </span>;
}
