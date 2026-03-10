'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Check, LogOut, FileText, ClipboardList, BookOpen, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('SECRETARIAT');
  const [activeTab, setActiveTab] = useState('general'); // general, decizii, registre
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch date în funcție de registrul selectat
  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result } = await supabase.from(table).select('*').order('numar_inregistrare', { ascending: false });
    setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tighter">Acces Registratură</h2>
          <input type="password" placeholder="Introdu parola..." className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border border-slate-100 outline-none focus:border-blue-500" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'liceulteius2026') setIsAuth(true); }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER - Design conform imaginii tale */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <img src="/liceul teoretic teius.png" className="w-12 h-12" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">
                REGISTRATURA <span className="text-blue-500 text-lg">LICEULUI TEORETIC TEIUȘ</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                <Check size={12} className="text-blue-500"/> Creat de ing. Lefter C. | UTILIZATOR ACTIV: {currentUser}
              </p>
            </div>
          </div>

          {/* Navigare Registre - Butoane stilate */}
          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mt-4 md:mt-0">
            <button onClick={() => setActiveTab('general')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>General</button>
            <button onClick={() => setActiveTab('decizii')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'decizii' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>Decizii</button>
            <button onClick={() => setActiveTab('registre')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'registre' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>Registre</button>
          </nav>

          <div className="flex gap-2">
            <button className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-[#059669] shadow-sm transition-all"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-4 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-500 transition-all">Ieșire</button>
          </div>
        </header>

        {/* CARDURILE DE CREARE - Design original conform imaginii */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
            <div className="bg-[#10b981] w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform"><Plus size={24} strokeWidth={3}/></div>
            <h2 className="text-3xl font-black uppercase text-[#0f172a]">Intrare</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
            <div className="bg-[#3b82f6] w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform"><Plus size={24} strokeWidth={3}/></div>
            <h2 className="text-3xl font-black uppercase text-[#0f172a]">Ieșire</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
            <div className="bg-[#f97316] w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform"><Plus size={24} strokeWidth={3}/></div>
            <h2 className="text-3xl font-black uppercase text-[#0f172a]">Rezervat</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
          </div>
        </div>

        {/* TABEL - Design original conform imaginii */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-white">
            <div className="bg-slate-50 p-4 rounded-3xl flex-1 flex items-center gap-3 border border-slate-100">
              <Search className="text-slate-300" size={20}/>
              <input type="text" placeholder="Caută după nr, emitent sau conținut..." className="bg-transparent w-full outline-none font-bold text-slate-600 placeholder:text-slate-300 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">Tip</th>
                  <th className="px-8 py-5">Nr. Înregistrare</th>
                  <th className="px-8 py-5">Data Inreg.</th>
                  <th className="px-8 py-5">Emitent</th>
                  <th className="px-8 py-5">Conținut</th>
                  <th className="px-8 py-5">Compartiment</th>
                  <th className="px-8 py-5">Creat de</th>
                  <th className="px-8 py-5 text-center">Editare</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase text-white ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>
                        {item.tip || 'INTRARE'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-blue-600 font-black text-sm">#{item.numar_inregistrare}</td>
                    <td className="px-8 py-6 text-slate-500">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                    <td className="px-8 py-6 uppercase">{item.emitent || '-'}</td>
                    <td className="px-8 py-6 italic font-medium max-w-xs">{item.continut}</td>
                    <td className="px-8 py-6">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] text-slate-500 uppercase font-black">{item.compartiment || 'SECRETARIAT'}</span>
                    </td>
                    <td className="px-8 py-6 text-slate-400 uppercase text-[10px]">{item.creat_de || 'SECRETARIAT'}</td>
                    <td className="px-8 py-6 text-center">
                      <button className="text-slate-200 hover:text-blue-500 transition-colors"><Plus size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
