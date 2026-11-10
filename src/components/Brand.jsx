export default function Brand({ compact = false }) {
  return (
    <span className="soma-brand">
      <svg aria-hidden="true" viewBox="0 0 40 40" className="soma-mark">
        <rect width="40" height="40" rx="12" fill="#006437" />
        <path d="M20 10v20M10 20h20" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      <span>
        <span className="soma-wordmark text-[#003e22]">
          soma<span className="text-[#d4a017]">.</span>
        </span>
        {!compact && <span className="soma-tagline text-[#00502c]/70 font-medium">Controle financeiro pessoal</span>}
      </span>
    </span>
  );
}
