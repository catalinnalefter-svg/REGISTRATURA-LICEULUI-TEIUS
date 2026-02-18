'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LayoutDashboard, FileText, BookmarkCheck, Users, PlusCircle, Loader2 } from 'lucide-react';

// Inițializare client Supabase (Folosește variabilele tale de mediu)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistraturaDashboard() {
  const [rezervari, setRezervari] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a aduce datele din Supabase
  async function fetchDate() {
    setLoading(true);
    const { data, error } = await supabase
      .from('rezervari_numere')
      .select('*')
      .order('numar', { ascending: true });

    if (!error && data) {
      setRezervari(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDate();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Meniu Lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Liceul Teiuș</h1>
          <p className="text-xs text-slate-400 font-mono">Registratură v2.1</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 p-3 bg-blue-600 rounded-xl transition shadow-lg shadow-blue-900/20"><LayoutDashboard size={20}/> Dashboard</button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl text-slate-400 transition"><FileText size={20}/> Registru Documente</button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl text-slate-400 transition"><BookmarkCheck size={20}/> Numere Rezervate</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panou de Control</h2>
            <p className="text-slate-500 mt-1">Gestionare numere de înregistrare și documente.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm">
            <PlusCircle size={20}/> Înregistrare Nouă
          </button>
        </header>

        {/* Statistici Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition group">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Numere Disponibile</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-blue-600">{rezervari.filter(r => !r.utilizat).length}</h3>
              <span className="text-slate-400 text-sm font-medium">din {rezervari.length}</span>
            </div>
          </div>
          {/* Alte carduri... */}
        </div>

        {/* Tabelul cu Numere Rezervate */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Status Rezervări Curente</h3>
            <button onClick={fetchDate} className="text-blue-600 text-sm font-semibold hover:underline">Actualizează listă</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="p-6">Număr</th>
                  <th className="p-6">An</th>
                  <th className="p-6">Data Rezervării</th>
                  <th className="p-6 text-center">Stare</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td>
                  </tr>
                ) : (
                  rezervari.map((reg) => (
                    <tr key={reg.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-6 font-bold text-slate-900">{reg.numar}</td>
                      <td className="p-6">{reg.an}</td>
                      <td className="p-6 text-sm italic">{new Date(reg.creat_la).toLocaleDateString('ro-RO')}</td>
                      <td className="p-6 text-center">
                        {reg.utilizat ? (
                          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">UTILIZAT</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">DISPONIBIL</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
