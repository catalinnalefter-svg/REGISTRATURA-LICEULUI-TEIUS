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
      setEditingId(null);
    } catch (err) { alert("Eroare: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg">LTT</div>
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Login Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border outline-none" value={pass} onKeyDown={e => e.key === 'Enter' && handleLogin()} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all">Intră în Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER EXACT CA IN POZA */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-7 rounded-[3rem] shadow-sm border border-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border shadow-inner">
               <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" onError={(e) => {e.target.src='https://via.placeholder.com/100?text=LTT'}} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-blue-900 leading-tight uppercase tracking-tighter">LICEUL TEORETIC TEIUȘ</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Utilizator: {currentUser} | <span className="text-blue-600">Realizat de ing. Lefter C.</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border shadow-inner">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-blue-600'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20}/></button>
        </header>

        {/* ZONA DE ACTIUNE: BUTOANE MARI PENTRU GENERAL */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div className="flex gap-4">
                {activeTab === 'general' ? (
                    ['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                        <button key={t} onClick={() => { setFormType(t); setShowForm(true); setEditingId(null); }} className="bg-white p-6 rounded-[2rem] font-black text-sm border-2 border-white shadow-sm hover:border-blue-500 flex items-center gap-4 transition-all group">
                            <div className={`p-3 rounded-xl ${t === 'INTRARE' ? 'bg-emerald-500' : t === 'IEȘIRE' ? 'bg-blue-500' : 'bg-orange-500'} text-white`}>
                                <Plus size={20} strokeWidth={3}/>
                            </div>
                            <span className="text-slate-700">{t}</span>
                        </button>
                    ))
                ) : (
                    <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center gap-3 shadow-xl hover:bg-blue-700 transition-all">
                        <Plus size={20} strokeWidth={3}/> Adaugă în {activeTab === 'decizii' ? 'Decizii' : 'Registre'}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border-2 border-white shadow-sm w-full md:w-[500px] focus-within:border-blue-100 transition-all">
                <Search size={22} className="text-slate-300"/>
                <input type="text" placeholder="Caută orice informație în tabel..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        {/* TABEL DATE CU TOATE COLOANELE CERUTE */}
        <div className="bg-white rounded-[3.5rem] shadow-sm overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-8 py-6">Tip</th>
                    <th className="px-8 py-6">Nr. Înregistrare</th>
                    <th className="px-8 py-6">Data Inreg.</th>
                    <th className="px-8 py-6">Emitent</th>
                    <th className="px-8 py-6">Conținut</th>
                    <th className="px-8 py-6">Compartiment</th>
                    <th className="px-8 py-6">Creat De</th>
                    <th className="px-8 py-6">Destinatar</th>
                    <th className="px-8 py-6">Data Exped.</th>
                    <th className="px-8 py-6">Conex/Ind.</th>
                    <th className="px-8 py-6 text-center">Edit</th>
                  </tr>
                ) : activeTab === 'decizii' ? (
                  <tr>
                    <th className="px-8 py-6">Tip Document</th>
                    <th className="px-8 py-6">Nr. Document</th>
                    <th className="px-8 py-6">Data</th>
                    <th className="px-8 py-6">Conținut</th>
                    <th className="px-8 py-6">Observații</th>
                    <th className="px-8 py-6 text-center">Edit</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-8 py-6">Nr. Registru</th>
                    <th className="px-8 py-6">Data Inceput</th>
                    <th className="px-8 py-6">Conținut</th>
                    <th className="px-8 py-6">Data Terminare</th>
                    <th className="px-8 py-6">Observații</th>
                    <th className="px-8 py-6 text-center">Edit</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[9px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-emerald-500' : item.tip === 'IEȘIRE' ? 'bg-blue-500' : 'bg-orange-500'}`}>{item.tip}</span></td>
                        <td className="px-8 py-5 text-blue-600 font-black tracking-tighter text-sm">#{item.numar_inregistrare}</td>
                        <td className="px-8 py-5 whitespace-nowrap text-slate-400">{item.creat_la}</td>
                        <td className="px-8 py-5 uppercase font-black">{item.emitent}</td>
                        <td className="px-8 py-5 italic max-w-xs truncate">{item.continut}</td>
                        <td className="px-8 py-5 uppercase text-slate-400">{item.compartiment}</td>
                        <td className="px-8 py-5 text-[9px] text-blue-400 font-black">{item.creat_de}</td>
                        <td className="px-8 py-5 uppercase">{item.destinatar || '-'}</td>
                        <td className="px-8 py-5">{item.data_expedire || '-'}</td>
                        <td className="px-8 py-5 text-slate-400 font-mono">{item.conex_ind || '-'}/{item.indicativ_dosar || '-'}</td>
                      </>
                    ) : activeTab === 'decizii' ? (
                      <>
                        <td className="px-8 py-5 uppercase font-black text-slate-800">{item.tip_document}</td>
                        <td className="px-8 py-5 text-blue-600 font-black text-sm">#{item.numar_inregistrare}</td>
                        <td className="px-8 py-5 text-slate-400">{item.data_emitere}</td>
                        <td className="px-8 py-5 italic">{item.continut}</td>
                        <td className="px-8 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5 font-black text-slate-800 text-sm">{item.numar_manual}</td>
                        <td className="px-8 py-5 text-slate-400">{item.data_inceput}</td>
                        <td className="px-8 py-5 italic">{item.continut}</td>
                        <td className="px-8 py-5">{item.data_sfarsit || 'Deschis'}</td>
                        <td className="px-8 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    )}
                    <td className="px-8 py-5 text-center">
                      <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.creat_la || item.data_emitere || item.data_inceput}); setShowForm(true); }} className="p-3 text-slate-200 hover:text-blue-600 transition-transform"><Edit2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR MODAL CONFORM POZELOR (DEDICAT PE TAB) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 w-full max-w-[1050px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-[15px] border-slate-50">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    {activeTab === 'general' ? `DATE REGISTRU ${formType}` : activeTab === 'decizii' ? 'DATE DECIZIE / NOTĂ' : 'DATE REGISTRU REGISTRE'}
                </h2>
                <div className="h-1.5 w-32 bg-blue-600 rounded-full mt-4"></div>
              </div>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-5 rounded-3xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><X size={32}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* --- FORMULAR REGISTRU GENERAL --- */}
              {activeTab === 'general' && (
                <>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Data Inregistrare (Z-L-A)</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-bold text-lg outline-none focus:ring-4 ring-blue-50 transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Emitent (Proveniență)</label>
                        <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black uppercase outline-none focus:ring-4 ring-blue-50 transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Conținut / Scurtă descriere</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[2rem] border-none font-bold h-52 resize-none outline-none focus:ring-4 ring-blue-50 transition-all shadow-inner" placeholder="DETALII DOCUMENT..." />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Compartiment Destinatar</label>
                        <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-black uppercase outline-none focus:ring-4 ring-blue-50 transition-all shadow-inner" placeholder="EX: SECRETARIAT, DIRECTOR..." />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Destinatar</label>
                            <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-bold uppercase outline-none shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Data Exped.</label>
                            <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[1.5rem] border-none font-bold outline-none shadow-inner" />
                        </div>
                    </div>
                    <div className="p-10 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100 grid grid-cols-2 gap-8 mt-4 shadow-sm">
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-3 ml-3 tracking-widest">Nr. Conex</label>
                            <input type="text" placeholder="EX: 4" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-5 bg-white rounded-2xl border-none font-black shadow-sm outline-none focus:ring-4 ring-blue-100" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-3 ml-3 tracking-widest">Indicativ Dosar</label>
                            <input type="text" placeholder="EX: IV-C" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-5 bg-white rounded-2xl border-none font-black shadow-sm outline-none focus:ring-4 ring-blue-100" />
                        </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- FORMULAR DECIZII --- */}
              {activeTab === 'decizii' && (
                <>
                  <div className="space-y-10">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-4">Alege Tipul Documentului</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['DECIZIE', 'NOTA DE SERVICIU'].map(t => (
                                <button key={t} onClick={() => setForm({...form, tip_document_spec: t})} className={`p-5 rounded-2xl font-black text-xs border-2 transition-all ${form.tip_document_spec === t ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Data Emitere</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-none font-bold outline-none focus:ring-4 ring-blue-50 shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Conținut / Obiectiv</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-none font-bold h-56 resize-none outline-none shadow-inner" placeholder="DESCRIERE..." />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Observații</label>
                        <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" />
                    </div>
                  </div>
                </>
              )}

              {/* --- FORMULAR REGISTRE --- */}
              {activeTab === 'registre' && (
                <>
                  <div className="space-y-10">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Număr Registru (Anual)</label>
                        <input type="text" placeholder="EX: 01/2026" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-none font-black text-xl outline-none shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Dată Deschidere</label>
                            <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Dată Închidere</label>
                            <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" />
                        </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Denumire Registru</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-none font-bold h-56 resize-none outline-none shadow-inner" placeholder="EX: REGISTRU DE PROCESE VERBALE..." />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 ml-3 mb-3">Observații</label>
                        <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-14 bg-blue-600 text-white p-8 rounded-[3rem] font-black text-2xl uppercase shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.96]">
              {loading ? 'SE SALVEAZĂ ÎN BAZA DE DATE...' : 'FINALIZEAZĂ ȘI SALVEAZĂ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
