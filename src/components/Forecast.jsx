import { forecastInstallments, monthLabel } from '../utils/finance';
import { formatBRL } from '../utils/currency';
export default function Forecast({ data, month }) {
  const rows = forecastInstallments(data, month);
  const hasParcels = data.expense.some(row => row.type === 'installment' || (row.type === 'card' && row.installments.length));
  return <details className="soma-forecast"><summary>Previsão de parcelas <span>Próximos 6 meses</span></summary>
    <div className="p-3 space-y-3"><p className="text-sm text-slate-600">Somente parcelas cadastradas. Não inclui contas fixas, novas compras ou meses já planejados. Nenhum mês será criado.</p>
    {!hasParcels ? <p className="text-sm">Cadastre parcelas em uma despesa parcelada ou nos detalhes do cartão para ver quando elas terminam.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Mês</th><th>Parcelas previstas</th><th>Menos que neste mês</th></tr></thead><tbody>{rows.map(row => <tr key={row.month}><td className="capitalize">{monthLabel(row.month)}{row.ending.length > 0 && <small className="block normal-case">Última parcela: {row.ending.join(', ')}</small>}</td><td>{formatBRL(row.total)}</td><td>{formatBRL(row.freed)}</td></tr>)}</tbody></table></div>}</div>
  </details>;
}
