'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Edit2, LogOut, Download, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruTeius() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('general'); 
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('INTRARE');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '', continut: '', destinatar: '', 
    data_expediere: '', conex: '', indicativ_dosar: '', 
    compartiment: '', observatii: '', tip_document_spec: 'DECIZIE',
    numar_manual: '', data_final: ''
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (pass === 'liceulteius2026') setIsAuth(true);
    else alert("Parolă incorectă!");
  };

  const exportToCSV = () => {
    let headers = activeTab === 'general' 
      ? ['Tip', 'Nr', 'Data', 'Emitent', 'Continut', 'Compartiment'] 
      : ['Identificator', 'Data', 'Continut', 'Observatii'];
    const rows = data.map(i => activeTab === 'general' 
      ? [i.tip, i.numar_inregistrare, i.creat_la, i.emitent, i.continut, i.compartiment]
      : [i.numar_inregistrare || i.numar_manual, i.data_emitere || i.data_inceput, i.continut, i.observatii]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `export_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleSave = async () => {
    setLoading(true);
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    let payload = { continut: form.continut, creat_de: currentUser };

    if (activeTab === 'general') {
        Object.assign(payload, {
            tip: formType, creat_la: form.data, emitent: form.emitent,
            destinatar: form.destinatar, compartiment: form.compartiment,
            indicativ_dosar: form.indicativ_dosar, conex_ind: form.conex,
            data_expediere: form.data_expediere || null
        });
    }

    const { error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId) 
        : await supabase.from(table).insert([payload]);

    if (error) alert("Eroare: " + error.message);
    else { setShowForm(false); fetchData(); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border-t-8 border-blue-600">
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Acces Registre</h2>
          <p className="text-blue-600 font-bold mb-8 text-sm">LICEUL TEORETIC TEIUȘ</p>
          <input 
            type="password" 
            placeholder="Introduceți parola" 
            className="w-full p-4 bg-slate-50 rounded-2xl mb-6 text-center font-bold border-2 border-slate-100 outline-none focus:border-blue-500 transition-all" 
            value={pass} 
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER - SIGLA SI SEMNATURA */}
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src="/liceul_teoretic_teius.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Registratură Liceul Teoretic Teiuș</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Realizat de ing. Lefter C.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={exportToCSV} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-md shadow-emerald-100">
                <Download size={18}/> Export Excel
            </button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={20}/></button>
          </div>
        </header>

        {/* TABURI */}
        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'general' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru General</button>
            <button onClick={() => setActiveTab('decizii')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'decizii' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Decizii / Note</button>
            <button onClick={() => setActiveTab('registre')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'registre' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru Registre</button>
        </div>

        {/* DASHBOARD CARDURI (Doar pentru General) */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <button key={t} onClick={() => { setFormType(t); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-xl transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${t==='INTRARE'?'bg-emerald-500':t==='IESIRE'?'bg-blue-500':'bg-orange-500'}`}><Plus size={24} strokeWidth={3}/></div>
                <h3 className="font-black text-2xl text-slate-800 mb-1">{t}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Nouă înregistrare</p>
              </button>
            ))}
          </div>
        )}

        {/* TABEL */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl w-96 border border-slate-100">
                <Search size={18} className="text-slate-300"/>
                <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">Identificator</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Conținut</th>
                <th className="px-8 py-5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
              {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 text-blue-600">#{item.numar_inregistrare || item.numar_manual}</td>
                  <td className="px-8 py-5 text-slate-400">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                  <td className="px-8 py-5 max-w-xs truncate uppercase">{item.continut}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULAR MODAL PENTRU REGISTRU GENERAL */}
      {showForm && activeTab === 'general' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-5xl shadow-2xl relative border-[12px] border-slate-50">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={32} strokeWidth={3}/></button>
            
            <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Date Registru</h2>

            <div className="flex gap-3 mb-8">
              {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
                <button key={t} onClick={() => setFormType(t)} className={`px-8 py-2 rounded-full font-black text-[10px] uppercase transition-all ${formType === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-12 text-slate-900">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Data Document (Z-L-A)</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-50 outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Emitent</label>
                  <div className="flex gap-2 mb-3">
                     {['DIN OFICIU', 'ISJ ALBA', 'MINISTERUL EDUCAȚIEI'].map(e => (
                       <button key={e} onClick={() => setForm({...form, emitent: e})} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white border border-blue-100 uppercase">{e}</button>
                     ))}
                  </div>
                  <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-50 outline-none focus:border-blue-500 text-sm uppercase" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Conținut / Descriere</label>
                  <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value.toUpperCase()})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-50 font-bold h-48 resize-none outline-none focus:border-blue-500 text-sm" placeholder="DETALII..." />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Compartiment</label>
                  <div className="flex gap-2 mb-3">
                     {['SECRETARIAT', 'CONTABILITATE', 'APP', 'ALTELE'].map(c => (
                       <button key={c} onClick={() => setForm({...form, compartiment: c})} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-[9px] font-black hover:bg-orange-600 hover:text-white border border-orange-100 uppercase">{c}</button>
                     ))}
                  </div>
                  <input type="text" placeholder="SCRIE COMPARTIMENT..." value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-50 outline-none focus:border-blue-500 text-sm uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Data Expediere</label>
                      <input type="date" value={form.data_expediere} onChange={e => setForm({...form, data_expediere: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-50 font-black text-sm outline-none" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Destinatar</label>
                      <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-50 font-black text-sm outline-none uppercase" />
                   </div>
                </div>
                <div className="p-8 bg-blue-50/40 rounded-[3rem] border-2 border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-6 text-slate-900">Legături Document (Conex/Dosar)</p>
                    <div className="grid grid-cols-2 gap-6">
                      <input type="text" placeholder="NR. CONEX" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-black text-sm outline-none shadow-sm" />
                      <input type="text" placeholder="IND. DOSAR" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-black text-sm outline-none shadow-sm" />
                    </div>
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black text-lg uppercase shadow-xl shadow-blue-200 mt-10 transition-all">{loading ? 'SALVARE...' : 'Salvează în Registru'}</button>
          </div>
        </div>
      )}

      {/* FORMULAR SIMPLU PENTRU CELELALTE REGISTRE (Pentru a evita erori pana le facem pe rand) */}
      {showForm && activeTab !== 'general' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 text-slate-900">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl relative border-[12px] border-slate-50">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><X size={32}/></button>
            <h2 className="text-2xl font-black mb-6 uppercase italic">Gestiune {activeTab}</h2>
            <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 rounded-2xl mb-4 border-2 border-slate-50 h-32 outline-none font-bold text-sm" placeholder="CONȚINUT..." />
            <button onClick={handleSave} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest">{loading ? '...' : 'Confirmă'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
