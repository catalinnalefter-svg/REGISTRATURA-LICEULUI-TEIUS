'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Hash, Calendar, X, Save } from 'lucide-react';

export default function RegistraturaCompleta() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  
  // State pentru datele formularului
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0], // Data de azi implicită
    expeditor: '',
    continut: '',
    anul: 2026
  });

  const deschideFormular = (tip: string) => {
    setTipDocument(tip);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans antialiased text-slate-900">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-blue-600 text-xl">LT</div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Registratura electronica</h1>
          <span className="bg-white border px-3 py-1 rounded-lg text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> 2026
          </span>
        </div>
      </header>

      {/* Butoanele principale */}
      <div className="flex flex-wrap gap-3 mb-10 text-white font-bold">
        <button onClick={() => deschideFormular('intrare')} className="bg-[#22c55e] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110">
          <Plus size={20} /> Adaugă document intrare
        </button>
        <button onClick={() => deschideFormular('iesire')} className="bg-[#007bff] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button onClick={() => deschideFormular('rezervat')} className="bg-[#f39c12] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      {/* Formularul Complet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative border border-white/20">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <div className={`p-2 rounded-lg ${tipDocument === 'intrare' ? 'bg-green-100 text-green-600' : tipDocument === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {tipDocument === 'rezervat' ? <Hash size={20} /> : <Plus size={20} />}
              </div>
              Nou document: {tipDocument.toUpperCase()}
            </h2>

            <div className="space-y-5">
              {/* Camp Selectare Data */}
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-600">Data Înregistrării</label>
                <input 
                  type="date" 
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-600">
                  {tipDocument === 'intrare' ? 'Expeditor' : 'Destinatar'}
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Introduceți numele..." 
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-600">Conținut pe scurt</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  rows={3} 
                  placeholder="Descrieți documentul..."
                ></textarea>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-4 italic">
                  * Numărul de înregistrare va fi generat automat de sistem după salvare.
                </p>
                <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl">
                  <Save size={20} /> Salvează în Registru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabelul de afisare (momentan gol) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-24 text-center">
        <p className="text-slate-400 font-medium italic">
          În Registratura Generala nu există niciun document pentru anul 2026
        </p>
      </div>
    </div>
  );
}
