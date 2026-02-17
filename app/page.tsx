'use client'
import { useState } from 'react'

export default function FormularRegistratura() {
  // State pentru a decide dacă e Intrare sau Ieșire
  const [tipFlux, setTipFlux] = useState<'intrare' | 'iesire'>('intrare');
  
  // State pentru alegerea numărului (Următorul vs Rezervat)
  const [sursaNumar, setSursaNumar] = useState<'automat' | 'rezervat'>('automat');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl border">
      <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">
        📥 Înregistrare Document Nou
      </h2>

      <form className="space-y-6 text-black">
        
        {/* --- SELECȚIE FLUX --- */}
        <div className="flex gap-4 p-2 bg-gray-100 rounded-lg">
          <button 
            type="button"
            onClick={() => setTipFlux('intrare')}
            className={`flex-1 py-2 rounded-md font-bold transition ${tipFlux === 'intrare' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
          >
            DOC. INTRARE
          </button>
          <button 
            type="button"
            onClick={() => setTipFlux('iesire')}
            className={`flex-1 py-2 rounded-md font-bold transition ${tipFlux === 'iesire' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
          >
            DOC. IEȘIRE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* --- CÂMPURI DINAMICE (INTRARE vs IEȘIRE) --- */}
          {tipFlux === 'intrare' ? (
            <>
              <div>
                <label className="block text-sm font-bold">Număr Extern (de la expeditor)</label>
                <input type="text" name="numar_extern" className="w-full border p-2 rounded" placeholder="Ex: 123/2026" />
              </div>
              <div>
                <label className="block text-sm font-bold">Data Externă</label>
                <input type="date" name="data_externa" className="w-full border p-2 rounded" />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-red-600">Data Expedierii (Obligatoriu pentru Ieșire) *</label>
              <input type="date" name="data_expediere" required className="w-full border-2 border-red-200 p-2 rounded" />
            </div>
          )}

          {/* --- CÂMPURI OBLIGATORII (COMUNE) --- */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold">Emitent *</label>
            <input 
              type="text" 
              name="emitent" 
              required 
              defaultValue={tipFlux === 'iesire' ? 'Liceul Teoretic Teiuș' : ''}
              readOnly={tipFlux === 'iesire'}
              className={`w-full border p-2 rounded ${tipFlux === 'iesire' ? 'bg-gray-100' : ''}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold">Conținut pe scurt *</label>
            <textarea name="continut" required rows={3} className="w-full border p-2 rounded"></textarea>
          </div>

          {/* --- SELECȚIE NUMĂR (CERINȚA 4) --- */}
          <div className="md:col-span-2 border-t pt-4">
            <label className="block text-sm font-bold mb-2">Alocare Număr Înregistrare:</label>
            <select 
              onChange={(e) => setSursaNumar(e.target.value as any)}
              className="w-full border p-2 rounded bg-yellow-50 font-semibold"
            >
              <option value="automat">Următorul număr disponibil (Automat)</option>
              <option value="rezervat">Folosește un număr rezervat anterior</option>
            </select>
          </div>

        </div>

        {/* --- ASIGNARE COMPARTIMENTE (CERINȚA 2) --- */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-bold mb-2">Compartimente Responsabile:</label>
          <div className="flex flex-wrap gap-4 text-sm">
            {['Secretariat', 'Contabilitate', 'Directorat', 'Administrativ'].map(comp => (
              <label key={comp} className="flex items-center gap-2">
                <input type="checkbox" name="compartimente" value={comp} /> {comp}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg uppercase">
          Salvează Documentul
        </button>
      </form>
    </div>
  )
}
