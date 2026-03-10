'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, LogOut } from 'lucide-react';
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

  const initialFormState = {
    numar_manual: '',
    data: new Date().toISOString().split('T')[0],
    data_final: '',
    emitent: '',
    continut: '',
    destinatar: '',
    data_exped: '',
    conex: '',
    indicativ_dosar: '',
    compartiment: '',
    observatii: '',
    tip_document_spec: 'DECIZIE'
  };

  const [form, setForm] = useState(initialFormState);

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleOpenForm = (type = 'INTRARE') => {
    setForm(initialFormState);
    setFormType(type);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { 
        continut: form.continut, 
        creat_de: currentUser, 
        anul: 2026, 
        observatii: form.observatii 
      };

      if (activeTab === 'general') {
        Object.assign(payload, {
          tip: formType,
          creat_la: form.data,
          emitent: (form.emitent || '').toUpperCase(),
          destinatar: (form.destinatar || '').toUpperCase(),
          data_expedire: form.data_exped || null,
          conex_ind: form.conex,
          indicativ_dosar: form.indicativ_dosar,
          compartiment: form.compartiment
        });
      } else if (activeTab === 'decizii') {
        Object.assign(payload, {
          tip_document: form.tip_document_spec,
          data_emitere: form.data
        });
      } else if (activeTab === 'registre') {
        Object.assign(payload, {
          numar_manual: form.numar_manual,
          data_inceput: form.data,
          data_sfarsit: form.data_final || null
        });
      }

      const { error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId)
        : await supabase.from(table).insert([payload]);

      if (error) throw error;
      fetchData();
      setShowForm(false);
    } catch (err) { alert("Eroare la salvare: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <h2 className="text-xl font-black text-blue-600 mb-6 uppercase">Liceul Teoretic Teiuș - Gestiune</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII"].map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => pass === 'liceulteius2026' ? setIsAuth(true) : alert("Parola incorectă")} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase">Autentificare</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-7 rounded-[3rem] shadow-sm border">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border shadow-inner">
               <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-blue-900 uppercase">LICEUL TEORETIC TEIUȘ</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Utilizator: {currentUser} | <span className="text-blue-600">Realizat de ing. Lefter C.</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20}/></button>
        </header>

        {/* CONTROALE PAGINĂ */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <div className="flex gap-4">
                {activeTab === 'general' ? (
                  <button onClick={() => handleOpenForm('INTRARE')} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center gap-3 shadow-lg">
                    <Plus size={20} strokeWidth={3}/> Adaugă Înregistrare Nouă
                  </button>
                ) : (
                  <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center gap-3 shadow-lg">
                    <Plus size={20} strokeWidth={3}/> Adaugă în {activeTab}
                  </button>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border-2 border-white shadow-sm w-full md:w-[500px]">
                <Search size={22} className="text-slate-300"/>
                <input type="text" placeholder="Caută orice informație..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        {/* TABEL PRINCIPAL */}
        <div className="bg-white rounded-[3.5rem] shadow-sm overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-8 py-6">Tip</th>
                    <th className="px-8 py-6">Nr. Înreg.</th>
                    <th className="px-8 py-6">Data</th>
                    <th className="px-8 py-6">Emitent</th>
                    <th className="px-8 py-6">Conținut</th>
                    <th className="px-8 py-6">Compartiment</th>
                    <th className="px-8 py-6">Destinatar</th>
                    <th className="px-8 py-6 text-center">Edit</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-8 py-6">Tip/Nr</th>
                    <th className="px-8 py-6">Data</th>
                    <th className="px-8 py-6">Conținut</th>
                    <th className="px-8 py-6">Observații</th>
                    <th className="px-8 py-6 text-center">Edit</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/20">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-8 py-5">
                          <span className={`px-2 py-1 rounded text-[9px] text-white ${item.tip === 'INTRARE' ? 'bg-emerald-500' : item.tip === 'IEȘIRE' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                            {item.tip}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-blue-600">#{item.numar_inregistrare}</td>
                        <td className="px-8 py-5">{item.creat_la}</td>
                        <td className="px-8 py-5 uppercase">{item.emitent}</td>
                        <td className="px-8 py-5 italic truncate max-w-xs">{item.continut}</td>
                        <td className="px-8 py-5">{item.compartiment}</td>
                        <td className="px-8 py-5">{item.destinatar || '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5 font-black uppercase">{item.tip_document || item.numar_manual}</td>
                        <td className="px-8 py-5">{item.data_emitere || item.data_inceput}</td>
                        <td className="px-8 py-5 italic">{item.continut}</td>
                        <td className="px-8 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    )}
                    <td className="px-8 py-5 text-center">
                      <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR MODAL STILIZAT EXACT CA IN POZA */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 md:p-16 w-full max-w-[1100px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-[15px] border-slate-50">
            
            <div className="flex justify-between items-start mb-12">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                {activeTab === 'general' ? 'Adăugare Înregistrare' : 'Adăugare Document'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-5 rounded-3xl text-slate-400 hover:text-red-500 transition-all"><X size={32}/></button>
            </div>

            {activeTab === 'general' && (
              <div className="flex gap-3 mb-12 bg-slate-100 p-2 rounded-[2.5rem] w-fit">
                {['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                  <button key={t} onClick={() => setFormType(t)} className={`px-12 py-4 rounded-[2rem] font-black text-xs transition-all ${formType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {activeTab === 'general' ? (
                <>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Data Înregistrare</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold text-lg outline-none focus:ring-4 ring-blue-50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Emitent (Proveniență)</label>
                        <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black uppercase outline-none focus:ring-4 ring-blue-50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Conținut Document</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[3rem] border-none font-bold h-52 resize-none outline-none focus:ring-4 ring-blue-50 transition-all" placeholder="DETALII..." />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Compartiment (Destinat)</label>
                        <input type="text" placeholder="DEPARTAMENT" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black uppercase outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Destinatar</label>
                            <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold uppercase outline-none" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-3 ml-2">Data Expedierii</label>
                            <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold outline-none" />
                        </div>
                    </div>
                    <div className="p-10 bg-blue-50/50 rounded-[3.5rem] border-2 border-blue-100 grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-3 ml-2">Nr. Conex</label>
                            <input type="text" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-5 bg-white rounded-2xl border-none font-black shadow-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-3 ml-2">Ind. Dosar</label>
                            <input type="text" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-5 bg-white rounded-2xl border-none font-black shadow-sm outline-none" />
                        </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ALTE FORMULARE (DECIZII/REGISTRE) */
                <div className="col-span-2 space-y-6">
                   <input type="text" placeholder="TITLU / NR" value={form.numar_manual || ''} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black outline-none" />
                   <textarea placeholder="CONȚINUT" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[3rem] border-none font-bold h-40 resize-none outline-none" />
                   <input type="text" placeholder="OBSERVAȚII" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold outline-none" />
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-16 bg-blue-600 text-white p-9 rounded-[3.5rem] font-black text-2xl uppercase shadow-2xl hover:bg-blue-700 transition-all">
              {loading ? 'Se salvează în baza de date...' : 'Finalizează și Salvează'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
