'use client';

import React, { useState } from 'react';
import { Plus, Hash, Calendar, X } from 'lucide-react';

export default function RegistraturaLiceu() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');

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

      {/* Butoanele colorate active */}
      <div className="flex flex-wrap gap-3 mb-10 text-white font-bold">
        <button 
          onClick={() => deschideFormular('intrare')}
          className="bg-[#22c55e] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <Plus size={20} /> Adaugă document intrare
        </button>
        <button 
          onClick={() => deschideFormular('iesire')}
          className="bg-[#007bff] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button 
          onClick={() => deschideFormular('rezervat')}
          className="bg-[#f39c12] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      {/* Formularul Pop-up (Modala) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-blue-600" /> Nou document: {tipDocument}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-600">Expeditor / Destinatar</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Ministerul Educatiei" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-600">Continut pe scurt</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Descriere scurta..."></textarea>
              </div>
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Salvează în Registru
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-24 text-center">
        <p className="text-slate-400 font-medium italic">
          În Registratura Generala nu există niciun document pentru anul 2026
        </p>
      </div>
    </div>
  );
}
