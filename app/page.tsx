'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Hash, Download, Search, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistraturaElectronica() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      {/* Header cu Siglă și Titlu */}
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-slate-100">
          {/* Aici înlocuiești cu link-ul real către sigla liceului */}
          <img src="/logo-liceu.png" alt="Sigla Liceului" className="object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registratura electronica</h1>
          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Calendar size={14} /> 2026
          </span>
        </div>
      </header>

      {/* Butoane Acțiuni Principale */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all">
          <Plus size={20} /> Adaugă document intrare / intern
        </button>
        <button className="bg-[#007bff] hover:bg-[#0069d9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      {/* Bare de Filtrare */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 items-center">
          <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Registratura Generala</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Caută..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button className="bg-[#d4f4e2] text-[#198754] hover:bg-[#c3e6cb] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
          <Download size={16} /> Descarcă CSV
        </button>
      </div>

      {/* Tabelul Principal */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
              <th className="p-5">Nr. ÎNREG.</th>
              <th className="p-5">DATA ÎNREGISTRĂRII</th>
              <th className="p-5">EMITENT</th>
              <th className="p-5">CONȚINUT SCURT</th>
              <th className="p-5">COMPARTIMENTE</th>
              <th className="p-5">STARE</th>
              <th className="p-5">TIP</th>
              <th className="p-5">ACȚIUNI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="p-20 text-center text-slate-400 font-medium italic">
                În Registratura Generala nu există niciun document pentru anul 2026
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Paginație */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition"><ChevronLeft size={18}/></button>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition"><ChevronRight size={18}/></button>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50">Inapoi</button>
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50">Inainte</button>
        </div>
      </div>
    </div>
  );
}
