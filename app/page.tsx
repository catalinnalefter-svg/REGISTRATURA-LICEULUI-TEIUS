'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Hash, Download, Search, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistraturaLiceu() {
  const [documente, setDocumente] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocumente() {
      setLoading(true);
      // Preluăm datele din tabelul documente
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });

      if (!error && data) setDocumente(data);
      setLoading(false);
    }
    fetchDocumente();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans antialiased text-slate-900">
      {/* Header cu Siglă */}
      <header className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
          <img src="/logo-liceu.png" alt="Sigla" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Registratura electronica</h1>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 text-sm font-bold text-slate-500">
            <Calendar size={16} className="text-blue-500" /> 2026
          </div>
        </div>
      </header>

      {/* Butoane Acțiuni */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button className="bg-[#22c55e] hover:bg-[#1bb054] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95">
          <Plus size={20} /> Adaugă document intrare / intern
        </button>
        <button className="bg-[#007bff] hover:bg-[#006ee6] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button className="bg-[#f39c12] hover:bg-[#e69310] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      {/* Filtre și Căutare */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Registratura Generala</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Caută în registru..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-80 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <button className="bg-[#d4f4e2] text-[#198754] hover:bg-[#c3e6cb] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Download size={18} /> Descarcă CSV
        </button>
      </div>

      {/* Tabel Documente */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] uppercase font-black text-slate-400 border-b border-slate-100 tracking-widest">
                <th className="p-6">Nr. ÎNREG.</th>
                <th className="p-6">DATA ÎNREGISTRĂRII</th>
                <th className="p-6">EMITENT</th>
                <th className="p-6">CONȚINUT SCURT</th>
                <th className="p-6">COMPARTIMENTE</th>
                <th className="p-6 text-center">STARE</th>
                <th className="p-6">TIP</th>
                <th className="p-6">ACȚIUNI</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600 divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td>
                </tr>
              ) : documente.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <p className="text-slate-400 text-lg">În Registratura Generala nu există niciun document pentru anul 2026</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documente.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{doc.numar_inregistrare}</td>
                    <td className="p-6 text-slate-500">{new Date(doc.creat_la).toLocaleDateString('ro-RO')}</td>
                    <td className="p-6">{doc.emitent}</td>
                    <td className="p-6 max-w-xs truncate">{doc.continut}</td>
                    <td className="p-6 italic text-xs text-slate-400">Secretariat</td>
                    <td className="p-6 text-center">
                       <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-200">
                         Inregistrat
                       </span>
                    </td>
                    <td className="p-6 font-bold text-xs">INTRARE</td>
                    <td className="p-6 flex gap-2">
                       <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Search size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginație */}
      <footer className="flex justify-between items-center mt-8 px-2">
        <div className="flex gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 shadow-sm transition-all"><ChevronLeft size={20}/></button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 shadow-sm transition-all"><ChevronRight size={20}/></button>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest">Inapoi</button>
           <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest">Inainte</button>
        </div>
      </footer>
    </div>
  );
}
