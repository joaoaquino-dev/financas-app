import { forecastInstallments, monthLabel } from '../utils/finance';
import { formatBRL } from '../utils/currency';

export default function Forecast({ data, month }) {
  const rows = forecastInstallments(data, month);
  const hasParcels = data.expense.some(
    row => row.type === 'installment' || (row.type === 'card' && row.installments.length)
  );

  return (
    <details className="group bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all">
      <summary className="px-4 py-3.5 cursor-pointer font-bold text-sm text-[#003e22] hover:bg-[#f0f7f3]/50 flex items-center justify-between transition-colors list-none">
        <div className="flex items-center gap-2">
          <span>Previsão de parcelas futuras</span>
          <span className="text-[11px] font-semibold text-[#006437] bg-[#f0f7f3] border border-[#bde1cc] px-2 py-0.5 rounded-full">
            Próximos 6 meses
          </span>
        </div>
        <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs font-mono">
          ▼
        </span>
      </summary>

      <div className="p-4 border-t border-slate-100 space-y-3.5">
        <p className="text-xs text-slate-500 leading-relaxed">
          Projeção baseada unicamente nas parcelas e faturas vigentes. Não inclui novas compras futuras nem altera nenhum mês salvo.
        </p>

        {!hasParcels ? (
          <p className="text-xs text-slate-400 py-2">
            Nenhuma compra parcelada cadastrada. Cadastre parcelas para acompanhar o alívio financeiro mês a mês.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="text-left py-2 px-1">Mês</th>
                  <th className="text-right py-2 px-2">Total em parcelas</th>
                  <th className="text-right py-2 px-1">Alívio vs mês atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <tr key={row.month} className="hover:bg-[#f0f7f3]/30 transition-colors">
                    <td className="py-2.5 px-1 capitalize font-medium text-slate-800">
                      {monthLabel(row.month)}
                      {row.ending.length > 0 && (
                        <span className="block text-[10px] text-[#006437] font-semibold normal-case mt-0.5">
                          Encerra: {row.ending.join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="text-right py-2.5 px-2 tabular-nums font-semibold text-slate-900">
                      {formatBRL(row.total)}
                    </td>
                    <td className="text-right py-2.5 px-1 tabular-nums font-bold text-[#006437]">
                      {row.freed > 0 ? `+${formatBRL(row.freed)}` : formatBRL(row.freed)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  );
}
