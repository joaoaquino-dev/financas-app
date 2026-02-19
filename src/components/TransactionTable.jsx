import { applyBRLMask, parseBRLMask, formatBRL } from '../utils/currency'

// Tabela editável reutilizável — usada para renda e despesas
export default function TransactionTable({ title, accent, rows, total, onAdd, onUpdate, onDelete }) {
  const dotColor = accent === 'blue' ? 'bg-blue-600' : 'bg-red-500'

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${dotColor}`} />
          {title}
        </h2>
        <span className="text-xs font-bold font-mono text-gray-500">
          {formatBRL(total)}
        </span>
      </div>

      {/* Tabela */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-[55%]">Item</th>
            <th className="text-left px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-[35%]">Valor</th>
            <th className="w-[10%]" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-gray-400 text-xs italic py-6">
                Nenhum item ainda. Clique em + Adicionar.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <Row key={row.id} row={row} onUpdate={onUpdate} onDelete={onDelete} />
            ))
          )}
        </tbody>
      </table>

      {/* Botão de adicionar */}
      <div className="px-5 py-3 border-t border-dashed border-gray-200 bg-gray-50">
        <button
          onClick={onAdd}
          className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-1.5 hover:bg-blue-100 transition-all duration-150 hover:-translate-y-px"
        >
          + Adicionar
        </button>
      </div>
    </div>
  )
}

function Row({ row, onUpdate, onDelete }) {
  // Aplica a máscara enquanto o usuário digita
  function handleValueInput(e) {
    e.target.value = applyBRLMask(e.target.value)
  }

  // Quando sai do campo, salva o número no estado
  function handleValueBlur(e) {
    const numero = parseBRLMask(e.target.value)
    onUpdate(row.id, 'value', numero)
    e.target.value = numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-2">
        <input
          type="text"
          defaultValue={row.name}
          placeholder="Descrição"
          onBlur={e => onUpdate(row.id, 'name', e.target.value)}
          className="w-full bg-transparent outline-none focus:bg-blue-50 focus:text-blue-700 px-1.5 py-1 rounded-md transition-colors text-gray-800 placeholder-gray-300"
        />
      </td>
      <td className="px-5 py-2">
        <input
          type="text"
          inputMode="numeric"
          defaultValue={row.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          placeholder="0,00"
          onInput={handleValueInput}
          onBlur={handleValueBlur}
          className="w-full text-right font-mono bg-transparent outline-none focus:bg-blue-50 focus:text-blue-700 px-1.5 py-1 rounded-md transition-colors text-gray-700 placeholder-gray-300 text-xs"
        />
      </td>
      <td className="pr-3 text-right">
        <button
          onClick={() => onDelete(row.id)}
          title="Remover"
          className="text-gray-300 hover:text-red-500 hover:bg-red-50 px-1.5 py-1 rounded-md transition-all text-base leading-none"
        >
          ×
        </button>
      </td>
    </tr>
  )
}
