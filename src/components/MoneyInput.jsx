import { applyBRLMask, parseBRLMask } from '../utils/currency';

export default function MoneyInput({ value, onChange, label, className = '', ...props }) {
  return <input {...props} aria-label={label} type="text" inputMode="numeric"
    value={value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    onFocus={event => event.target.select()}
    onChange={event => { const next = parseBRLMask(applyBRLMask(event.target.value)); if (next <= 999999999) onChange(next); }}
    className={`field text-right tabular-nums ${className}`} />;
}
