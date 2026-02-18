'use client';

import React from 'react';
import { Plus, Hash, Calendar } from 'lucide-react';

export default function RegistraturaModern() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans antialiased text-slate-900">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-blue-600">LT</div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Registratura electronica</h1>
          <span className="bg-white border px-3 py-1 rounded-lg text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> 2026
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-10 text-white">
        <button className="bg-[#22c55e] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
          <Plus size={20} /> Adaugă document intrare
        </button>
        <button className="bg-[#007bff] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button className="bg-[#f39c12] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-24 text-center">
        <p className="text-slate-400 font-medium italic">
          În Registratura Generala nu există niciun document pentru anul 2026
        </p>
      </div>
    </div>
  );
}
