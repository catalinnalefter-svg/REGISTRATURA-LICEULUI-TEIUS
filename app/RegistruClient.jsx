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
    } catch (err) { alert("Eroare Bază de Date: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tighter text-center">Acces Registratură L.T. Teiuș</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border" value={pass} onKeyDown={e => e.key === 'Enter' && handleLogin()} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase">Intră în Aplicație</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1800px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">LTT</div>
            <div>
              <h1 className="text-xl font-black text-blue-900 leading-tight uppercase">Registratură Liceul Teoretic Teiuș</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilizator: {currentUser} | <span className="text-blue-600">Realizat de ing. Lefter C.</span></p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"><LogOut size={20}/></button>
        </header>

        {/* SECȚIUNE CAUTARE ȘI BUTOANE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-2 flex-wrap">
                {activeTab === 'general' ? (
                    ['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                        <button key={t} onClick={() => { setFormType(t); setShowForm(true); }} className="bg-white px-6 py-4 rounded-2xl font-black text-xs border shadow-sm hover:border-blue-500 flex items-center gap-2 transition-all">
                            <Plus size={16} className="text-blue-600"/> {t}
                        </button>
                    ))
                ) : (
                    <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg">
                        <Plus size={18}/> Adaugă în {activeTab === 'decizii' ? 'Decizii' : 'Registre'}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border shadow-sm w-full md:w-96 focus-within:ring-2 ring-blue-100">
                <Search size={18} className="text-slate-300"/>
                <input type="text" placeholder="Caută în tabel..." className="bg-transparent outline-none font-bold text-slate-600 w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        {/* TABELE POPULATE CU COLOANELE CERUTE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-6 py-4">Tip</th>
                    <th className="px-6 py-4">Nr. Înreg.</th>
                    <th className="px-6 py-4">Data Inreg.</th>
                    <th className="px-6 py-4">Emitent</th>
                    <th className="px-6 py-4">Conținut</th>
                    <th className="px-6 py-4">Compartiment</th>
                    <th className="px-6 py-4">Creat De</th>
                    <th className="px-6 py-4">Destinatar</th>
                    <th className="px-6 py-4">Data Exped.</th>
                    <th className="px-6 py-4">Conex/Ind.</th>
                    <th className="px-6 py-4 text-center">Edit</th>
                  </tr>
                ) : activeTab === 'decizii' ? (
                  <tr>
                    <th className="px-6 py-4">Tip Document</th>
                    <th className="px-6 py-4">Nr. Document</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Conținut</th>
                    <th className="px-6 py-4">Observații</th>
                    <th className="px-6 py-4 text-center">Edit</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">Nr. Registru</th>
                    <th className="px-6 py-4">Data Inceput</th>
                    <th className="px-6 py-4">Conținut</th>
                    <th className="px-6 py-4">Data Terminare</th>
                    <th className="px-6 py-4">Observații</th>
                    <th className="px-6 py-4 text-center">Edit</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[9px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-emerald-500' : item.tip === 'IEȘIRE' ? 'bg-blue-500' : 'bg-orange-500'}`}>{item.tip}</span></td>
                        <td className="px-6 py-4 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.creat_la}</td>
                        <td className="px-6 py-4 uppercase">{item.emitent}</td>
                        <td className="px-6 py-4 italic max-w-xs truncate">{item.continut}</td>
                        <td className="px-6 py-4 uppercase">{item.compartiment}</td>
                        <td className="px-6 py-4 text-[9px] text-slate-400">{item.creat_de}</td>
                        <td className="px-6 py-4 uppercase">{item.destinatar || '-'}</td>
                        <td className="px-6 py-4">{item.data_expedire || '-'}</td>
                        <td className="px-6 py-4 text-blue-400">{item.conex_ind || '-'}/{item.indicativ_dosar || '-'}</td>
                      </>
                    ) : activeTab === 'decizii' ? (
                      <>
                        <td className="px-6 py-4 uppercase font-black">{item.tip_document}</td>
                        <td className="px-6 py-4 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.data_emitere}</td>
                        <td className="px-6 py-4 italic">{item.continut}</td>
                        <td className="px-6 py-4 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-black">{item.numar_manual}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.data_inceput}</td>
                        <td className="px-6 py-4 italic">{item.continut}</td>
                        <td className="px-6 py-4">{item.data_sfarsit || 'Deschis'}</td>
                        <td className="px-6 py-4 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.creat_la || item.data_emitere || item.data_inceput}); setShowForm(true); }} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULARE DEDICATE (DESIGN CONFORM POZE) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-[950px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-8 border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 uppercase">
                {activeTab === 'general' ? `DATE REGISTRU ${formType}` : activeTab === 'decizii' ? 'DECIZIE / NOTĂ' : 'REGISTRU REGISTRE'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FORMULAR REGISTRU GENERAL */}
              {activeTab === 'general' && (
                <>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Data Document (Z-L-A)</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold focus:ring-2 ring-blue-100 outline-none" />
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Emitent (Proveniență)</label>
                    <input type="text" placeholder="EX: ISJ ALBA, MINISTERUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase outline-none" />
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Conținut Document</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold h-40 resize-none outline-none" placeholder="DESCRIEREA DOCUMENTULUI..." />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Compartiment Destinatar</label>
                    <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase outline-none" placeholder="EX: SECRETARIAT, CONTABILITATE..." />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Destinatar</label>
                            <input type="text" placeholder="NUME..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold uppercase outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Data Exped.</label>
                            <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold outline-none" />
                        </div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 grid grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-2">Nr. Conex</label>
                            <input type="text" placeholder="EX: 12" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-xl border-none font-bold shadow-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-2">Indicativ Dosar</label>
                            <input type="text" placeholder="EX: IV-C" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-xl border-none font-bold shadow-sm outline-none" />
                        </div>
                    </div>
                  </div>
                </>
              )}

              {/* FORMULAR DECIZII (CONFORM POZA) */}
              {activeTab === 'decizii' && (
                <>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Tip Document</label>
                        <select value={form.tip_document_spec} onChange={e => setForm({...form, tip_document_spec: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-black text-lg outline-none">
                            <option value="DECIZIE">DECIZIE</option>
                            <option value="NOTA DE SERVICIU">NOTĂ DE SERVICIU</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Data Emitere</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold outline-none" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Conținut</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold h-40 resize-none outline-none" placeholder="DESCRIERE DECIZIE..." />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Observații</label>
                        <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold outline-none" placeholder="ALTE MENTIUNI..." />
                    </div>
                  </div>
                </>
              )}

              {/* FORMULAR REGISTRE (CONFORM POZA) */}
              {activeTab === 'registre' && (
                <>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Număr Registru (Manual)</label>
                    <input type="text" placeholder="EX: 01/2026" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Dată Începere</label>
                            <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Dată Terminare</label>
                            <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" />
                        </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Denumire/Conținut Registru</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold h-32 resize-none outline-none" placeholder="EX: REGISTRU CORESPONDENTA..." />
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-2">Observații</label>
                    <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border font-bold outline-none" />
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSave} className="w-full mt-10 bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xl uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98]">
              {loading ? 'Se salvează în baza de date...' : 'Finalizează Înregistrarea'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
