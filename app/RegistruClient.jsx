'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, LogOut, Download } from 'lucide-react';
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

  const departamente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII"];

  const [form, setForm] = useState({
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
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (pass === 'liceulteius2026' && currentUser) setIsAuth(true);
    else alert("Acces refuzat!");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { continut: form.continut, creat_de: currentUser, anul: 2026, observatii: form.observatii };

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
      setEditingId(null);
    } catch (err) { alert("Eroare: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <img src="/liceul_teius_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4" onError={(e) => e.target.style.display='none'} />
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase">Liceul Teoretic Teiuș</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border" value={pass} onKeyDown={e => e.key === 'Enter' && handleLogin()} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase">Intră în aplicație</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border">
          <div className="flex items-center gap-4">
            <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" />
            <div>
              <h1 className="text-xl font-black text-blue-900 leading-tight uppercase">Registratură L.T. Teiuș</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilizator: {currentUser} | Creat de ing. Lefter C.</p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-3 bg-red-50 text-red-500 rounded-2xl"><LogOut size={20}/></button>
        </header>

        {/* SECȚIUNE BUTOANE CREARE */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
                {activeTab === 'general' ? (
                    ['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                        <button key={t} onClick={() => { setFormType(t); setShowForm(true); }} className="bg-white px-6 py-4 rounded-2xl font-black text-sm border shadow-sm hover:bg-blue-50 flex items-center gap-2">
                            <Plus size={18} className="text-blue-600"/> {t}
                        </button>
                    ))
                ) : (
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-2">
                        <Plus size={18}/> Adaugă în {activeTab === 'decizii' ? 'Decizii' : 'Registre'}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border shadow-sm w-96">
                <Search size={18} className="text-slate-400"/>
                <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        {/* TABEL DATE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
              {activeTab === 'general' ? (
                <tr><th className="px-6 py-4">Tip</th><th className="px-6 py-4">Nr. Inreg</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Emitent</th><th className="px-6 py-4">Continut</th><th className="px-6 py-4 text-right">Edit</th></tr>
              ) : activeTab === 'decizii' ? (
                <tr><th className="px-6 py-4">Tip</th><th className="px-6 py-4">Număr</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Conținut</th><th className="px-6 py-4 text-right">Edit</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Nr. Registru</th><th className="px-6 py-4">Dată Început</th><th className="px-6 py-4">Conținut</th><th className="px-6 py-4">Dată Sfârșit</th><th className="px-6 py-4 text-right">Edit</th></tr>
              )}
            </thead>
            <tbody className="divide-y text-xs font-bold text-slate-600">
              {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  {activeTab === 'general' ? (
                    <>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-[9px]">{item.tip}</span></td>
                      <td className="px-6 py-4 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                      <td className="px-6 py-4">{item.creat_la}</td>
                      <td className="px-6 py-4 uppercase">{item.emitent}</td>
                    </>
                  ) : activeTab === 'decizii' ? (
                    <>
                      <td className="px-6 py-4 uppercase">{item.tip_document}</td>
                      <td className="px-6 py-4 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                      <td className="px-6 py-4">{item.data_emitere}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-blue-600 font-black">{item.numar_manual}</td>
                      <td className="px-6 py-4">{item.data_inceput}</td>
                    </>
                  )}
                  <td className="px-6 py-4 italic truncate max-w-xs">{item.continut}</td>
                  {activeTab === 'registre' && <td className="px-6 py-4">{item.data_sfarsit || 'În curs'}</td>}
                  <td className="px-6 py-4 text-right"><button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULARE DEDICATE (DESIGN CONFORM POZE) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl relative border-8 border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 uppercase">
                {activeTab === 'general' ? `REGISTRU ${formType}` : activeTab === 'decizii' ? 'DECIZIE / NOTĂ' : 'REGISTRU NOU'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-3 rounded-xl"><X/></button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* FORMULAR REGISTRU GENERAL */}
              {activeTab === 'general' && (
                <>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Data Document</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Emitent</label>
                    <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Conținut</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold h-32" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Compartiment</label>
                    <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="DESTINATAR" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase" />
                        <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 grid grid-cols-2 gap-4">
                        <input type="text" placeholder="CONEX" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-xl border font-bold" />
                        <input type="text" placeholder="DOSAR" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-xl border font-bold" />
                    </div>
                  </div>
                </>
              )}

              {/* FORMULAR DECIZII/NOTE (CONFORM POZA) */}
              {activeTab === 'decizii' && (
                <>
                  <div className="space-y-4 col-span-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Tip Document</label>
                    <select value={form.tip_document_spec} onChange={e => setForm({...form, tip_document_spec: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-black">
                        <option value="DECIZIE">DECIZIE</option>
                        <option value="NOTA DE SERVICIU">NOTĂ DE SERVICIU</option>
                    </select>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Data Emitere</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                  </div>
                  <div className="space-y-4 col-span-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Conținut</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold h-32" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Observații</label>
                    <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                  </div>
                </>
              )}

              {/* FORMULAR REGISTRUL REGISTRELOR (CONFORM POZA) */}
              {activeTab === 'registre' && (
                <>
                  <div className="space-y-4 col-span-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Nr. Registru</label>
                    <input type="text" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Dată Început</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Dată Sfârșit</label>
                    <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                  </div>
                  <div className="space-y-4 col-span-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Conținut</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold h-32" />
                    <label className="block text-[10px] font-black uppercase text-slate-400">Observații</label>
                    <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" />
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSave} className="w-full mt-8 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase shadow-lg shadow-blue-100">
              {loading ? 'Se salvează...' : 'Salvează înregistrarea'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
