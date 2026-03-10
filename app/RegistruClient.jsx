'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruTeiusV3() {
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
    else alert("Acces refuzat! Verificați parola și departamentul.");
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
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg">LTT</div>
          <h2 className="text-2xl font-black text-blue-900 mb-6 uppercase">ACCES REGISTRATURĂ</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border outline-none" value={pass} onKeyDown={e => e.key === 'Enter' && handleLogin()} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all">Intră în Aplicație</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans">
      <div className="max-w-[1850px] mx-auto">
        
        {/* HEADER PERSONALIZAT */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-blue-100">
               {/* Logo-ul: am pus un fallback text în caz că imaginea e albă sau lipsește */}
               <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-white font-black">LTT</span>'}} />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-900 leading-tight uppercase">REGISTRATURA LICEULUI TEORETIC TEIUȘ</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                UTILIZATOR ACTIV: <span className="text-blue-600">{currentUser}</span> | <span className="text-slate-600 italic">Creat de ing. Lefter C.</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20}/></button>
        </header>

        {/* BUTOANE ACȚIUNE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-3">
                {activeTab === 'general' ? (
                    ['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                        <button key={t} onClick={() => { setFormType(t); setShowForm(true); setEditingId(null); }} className="bg-white px-8 py-4 rounded-2xl font-black text-xs border-2 border-transparent shadow-sm hover:border-blue-500 flex items-center gap-2 transition-all group">
                            <Plus size={18} className="text-blue-600 group-hover:scale-125 transition-transform"/> {t}
                        </button>
                    ))
                ) : (
                    <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
                        <Plus size={20}/> ADĂUGARE {activeTab === 'decizii' ? 'DECIZIE' : 'REGISTRU'}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border-2 border-white shadow-sm w-full md:w-[450px] focus-within:border-blue-200 transition-all">
                <Search size={20} className="text-slate-300"/>
                <input type="text" placeholder="Caută înregistrări..." className="bg-transparent outline-none font-bold text-slate-600 w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        {/* TABELE POPULATE CONFORM CERINȚELOR */}
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 border-b">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-6 py-5">Tip</th>
                    <th className="px-6 py-5">Nr. Înregistrare</th>
                    <th className="px-6 py-5">Data Inreg.</th>
                    <th className="px-6 py-5">Emitent</th>
                    <th className="px-6 py-5">Conținut</th>
                    <th className="px-6 py-5">Compartiment</th>
                    <th className="px-6 py-5">Creat De</th>
                    <th className="px-6 py-5">Destinatar</th>
                    <th className="px-6 py-5">Data Exped.</th>
                    <th className="px-6 py-5">Conex/Ind.</th>
                    <th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                ) : activeTab === 'decizii' ? (
                  <tr>
                    <th className="px-6 py-5">Tip Document</th>
                    <th className="px-6 py-5">Nr. Document</th>
                    <th className="px-6 py-5">Data</th>
                    <th className="px-6 py-5">Conținut</th>
                    <th className="px-6 py-5">Observații</th>
                    <th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-5">Nr. Registru</th>
                    <th className="px-6 py-5">Data Inceput</th>
                    <th className="px-6 py-5">Conținut</th>
                    <th className="px-6 py-5">Data Terminare</th>
                    <th className="px-6 py-5">Observații</th>
                    <th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="11" className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">Nu există date de afișat în acest registru</td></tr>
                ) : (
                  data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      {activeTab === 'general' ? (
                        <>
                          <td className="px-6 py-5"><span className={`px-2 py-1 rounded-md text-[9px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-emerald-500' : item.tip === 'IEȘIRE' ? 'bg-blue-500' : 'bg-orange-500'}`}>{item.tip}</span></td>
                          <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                          <td className="px-6 py-5 whitespace-nowrap">{item.creat_la}</td>
                          <td className="px-6 py-5 uppercase">{item.emitent}</td>
                          <td className="px-6 py-5 italic max-w-xs truncate">{item.continut}</td>
                          <td className="px-6 py-5 uppercase text-slate-400">{item.compartiment}</td>
                          <td className="px-6 py-5 text-[9px] text-slate-400">{item.creat_de}</td>
                          <td className="px-6 py-5 uppercase">{item.destinatar || '-'}</td>
                          <td className="px-6 py-5">{item.data_expedire || '-'}</td>
                          <td className="px-6 py-5 text-blue-400 font-mono">{item.conex_ind || '-'}/{item.indicativ_dosar || '-'}</td>
                        </>
                      ) : activeTab === 'decizii' ? (
                        <>
                          <td className="px-6 py-5 uppercase font-black text-slate-800">{item.tip_document}</td>
                          <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                          <td className="px-6 py-5">{item.data_emitere}</td>
                          <td className="px-6 py-5 italic">{item.continut}</td>
                          <td className="px-6 py-5 text-slate-400">{item.observatii || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-5 font-black text-slate-800">{item.numar_manual}</td>
                          <td className="px-6 py-5">{item.data_inceput}</td>
                          <td className="px-6 py-5 italic">{item.continut}</td>
                          <td className="px-6 py-5">{item.data_sfarsit || 'În curs'}</td>
                          <td className="px-6 py-5 text-slate-400">{item.observatii || '-'}</td>
                        </>
                      )}
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.creat_la || item.data_emitere || item.data_inceput}); setShowForm(true); }} className="p-2 text-slate-300 hover:text-blue-600 group-hover:scale-110 transition-transform"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULARE DEDICATE (DIFERITE PENTRU FIECARE REGISTRU) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-[1000px] shadow-2xl relative max-h-[92vh] overflow-y-auto border-[12px] border-slate-50">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    {activeTab === 'general' ? `REGISTRU ${formType}` : activeTab === 'decizii' ? 'DECIZIE / NOTĂ' : 'REGISTRU REGISTRE'}
                </h2>
                <p className="text-blue-600 font-bold text-xs mt-2 uppercase">Liceul Teoretic Teiuș - 2026</p>
              </div>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-3xl text-slate-400 hover:text-red-500 transition-colors"><X size={28}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* --- FORMULAR REGISTRU GENERAL --- */}
              {activeTab === 'general' && (
                <>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Data Inregistrare (Z-L-A)</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-lg outline-none focus:ring-4 ring-blue-50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Emitent (Proveniență)</label>
                        <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold uppercase outline-none focus:ring-4 ring-blue-50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Conținut Document</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continents: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold h-44 resize-none outline-none focus:ring-4 ring-blue-50 transition-all" placeholder="DESCRIEREA PE SCURT A DOCUMENTULUI..." />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Compartiment / Destinatar Intern</label>
                        <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold uppercase outline-none focus:ring-4 ring-blue-50 transition-all" placeholder="EX: SECRETARIAT, DIRECTOR..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Destinatar</label>
                            <input type="text" placeholder="NUME..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold uppercase outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Data Exped.</label>
                            <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                        </div>
                    </div>
                    <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-blue-100 grid grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-2 tracking-widest">Nr. Conex</label>
                            <input type="text" placeholder="EX: 12" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-xl border-none font-bold shadow-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-2 tracking-widest">Indicativ Dosar</label>
                            <input type="text" placeholder="EX: IV-C" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-xl border-none font-bold shadow-sm outline-none" />
                        </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- FORMULAR DECIZII/NOTE --- */}
              {activeTab === 'decizii' && (
                <>
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Tip Document</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['DECIZIE', 'NOTA DE SERVICIU'].map(t => (
                                <button key={t} onClick={() => setForm({...form, tip_document_spec: t})} className={`p-4 rounded-xl font-black text-[10px] border-2 transition-all ${form.tip_document_spec === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Data Emitere</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-4 ring-blue-50" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Conținut / Obiectul Deciziei</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continents: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold h-44 resize-none outline-none" placeholder="DESCRIEȚI CONȚINUTUL..." />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Observații</label>
                        <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none" placeholder="MENȚIUNI SUPLIMENTARE..." />
                    </div>
                  </div>
                </>
              )}

              {/* --- FORMULAR REGISTRUL REGISTRELOR --- */}
              {activeTab === 'registre' && (
                <>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Număr Registru (Identificator)</label>
                        <input type="text" placeholder="EX: R-01/2026" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-4 ring-blue-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Dată Începere</label>
                            <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Dată Terminare</label>
                            <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                        </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Denumire Registru / Conținut</label>
                        <textarea value={form.continut} onChange={e => setForm({...form, continents: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold h-44 resize-none outline-none" placeholder="EX: REGISTRU CORESPONDENȚĂ..." />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 ml-2 mb-2">Observații</label>
                        <input type="text" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-12 bg-blue-600 text-white p-7 rounded-[2.5rem] font-black text-xl uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-[0.97]">
              {loading ? 'SE SALVEAZĂ DATELE...' : 'SALVEAZĂ ÎNREGISTRAREA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
