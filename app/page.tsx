import React from 'react';
import { LayoutDashboard, FileText, BookmarkCheck, Users, PlusCircle } from 'lucide-react';

export default function RegistraturaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Meniu Lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Liceul Teoretic Teiuș</h1>
          <p className="text-xs text-slate-400">Sistem Registratură v2.0</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg"><LayoutDashboard size={20}/> Dashboard</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg text-slate-300"><FileText size={20}/> Registru Documente</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg text-slate-300"><BookmarkCheck size={20}/> Numere Rezervate</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg text-slate-300"><Users size={20}/> Utilizatori</a>
        </nav>
      </aside>

      {/* Main Content - Zona Centrală */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bună ziua, Secretariat!</h2>
            <p className="text-slate-500">Iată situația documentelor de astăzi.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            <PlusCircle size={20}/> Înregistrare Nouă
          </button>
        </header>

        {/* Statistici Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Numere disponibile</p>
            <h3 className="text-3xl font-bold text-blue-600">20</h3> {/* Valoare din rezervari_numere */}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Documente Nerezolvate</p>
            <h3 className="text-3xl font-bold text-orange-500 text-center text-center">--</h3> 
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Înregistrări 2026</p>
            <h3 className="text-3xl font-bold text-slate-800">0</h3>
          </div>
        </div>

        {/* Tabelul de Documente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Ultimele Documente Înregistrate</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 border-b border-slate-100">
                <th className="p-4">Nr. Reg.</th>
                <th className="p-4">Emitent</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Data</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {/* Aceste rânduri vor fi populate din baza de date */}
              <tr className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 font-medium">1/2026</td>
                <td className="p-4">Primăria Teiuș</td>
                <td className="p-4">Intrare</td>
                <td className="p-4 text-sm">18.02.2026</td>
                <td className="p-4">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">ÎN LUCRU</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
