'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Download, FileText, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruClient() {
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
  const [lastRegNumber, setLastRegNumber] = useState(null);

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

  // Departamentele solicitate
  const departamente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII"];

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    // Am adăugat select('*') pentru a popula tabelele cu toate datele
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  // Funcție pentru intrare cu tasta Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const handleLogin = () => {
    if (pass === 'liceulteius2026' && currentUser) {
      setIsAuth(true);
    } else {
      alert("Parolă incorectă sau departament neselectat!");
    }
  };

  const handleSave = async () => {
    if (!form.continut) return alert('Introduceți conținutul!');
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
        // Aliniere cu formularul din poza solicitată
        payload = { 
          ...payload, 
          tip: formType, 
          creat_la: form.data, 
          emitent: (form.emitent || '').toUpperCase(), 
          destinatar: (form.destinatar || '').toUpperCase(), 
          data_expedire: form.data_exped || null, 
          conex_ind: form.conex, 
          indicativ_dosar: form.indicativ_dosar, 
          compartiment: form.compartiment 
        };
      } else if (activeTab === 'decizii') {
        // Rezolvă eroarea check constraint prin formatare corectă
        payload = { 
          ...payload, 
          tip_document: form.tip_document_spec.toUpperCase(), 
          data_emitere: form.data 
        };
      } else if (activeTab === 'registre') {
        // Rezolvă eroarea 'numar_manual' missing
        // Notă: Dacă eroarea persistă, trebuie creată coloana în Supabase
        payload = { 
          ...payload, 
          numar_manual: form.numar_manual,
          data_inceput: form.data, 
          data_sfarsit: form.data_final || null 
        };
      }

      const { data: saved, error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).select()
        : await supabase.from(table).insert([payload]).select();

      if (error) throw error;
      if (!editingId && saved && saved[0]) setLastRegNumber(activeTab === 'registre' ? saved[0].numar_manual : saved[0].numar_inregistrare);
      
      fetchData();
      setShowForm(false);
    } catch (err) { alert("Eroare: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6" onKeyDown={handleKeyDown}>
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <img src="/liceul_teius_logo.png" className="w-24 h-24 mx-auto mb-6 object-contain" alt="Logo" onError={(e) => e.target.src='https://via.placeholder.com/100?text=LOGO'} />
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg hover:bg-blue-700 transition-all">Intră în Sistem (Enter)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] p-4 md:p-8 font-sans">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER ACTUALIZAT */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase leading-none">REGISTRATURA <span className="text-blue-600">LICEULUI TEORETIC TEIUȘ</span></h1>
              <div className="flex gap-4 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UTILIZATOR: <span className="text-blue-600">{currentUser}</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l pl-4">Creat de: <span className="text-slate-600">ing. Lefter C.</span></p>
              </div>
            </div>
          </div>
          
          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl my-4 md:my-0">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}>
                {tab === 'decizii' ? 'DECIZII / NOTE' : tab === 'registre' ? 'REGISTRU REGISTRE' : 'REGISTRU GENERAL'}
              </button>
            ))}
          </nav>

          <button onClick={() => window.location.reload()} className="bg-red-50 text-red-500 px-5 py-3 rounded-2xl font-black text-[10px] uppercase">Ieșire</button>
        </header>

        {/* TABEL POPULAT DIN DATABASE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
             <div className="flex items-center gap-4 flex-1">
                <Search className="text-slate-300" size={20}/>
                <input type="text" placeholder="Caută înregistrări..." className="w-full outline-none font-bold text-slate-500" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Plus size={18}/> Adaugă Nou</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr>
                    <th className="px-6 py-5">Nr. Inreg</th>
                    <th className="px-6 py-5">Data</th>
                    <th className="px-6 py-5">Continut</th>
                    <th className="px-6 py-5">Emitent / Tip</th>
                    <th className="px-6 py-5 text-center">Actiuni</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-600">
                {data.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-400">Nu există date înregistrate.</td></tr>
                ) : (
                  data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50/50">
                      <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare || item.numar_manual}</td>
                      <td className="px-6 py-5">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                      <td className="px-6 py-5 italic max-w-md truncate">{item.continut}</td>
                      <td className="px-6 py-5 uppercase">{item.emitent || item.tip_document || 'REGISTRU'}</td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULARUL DIN POZA 3 (REGISTRU GENERAL) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-[950px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-4 border-blue-50">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">DATE REGISTRU</h2>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500"><X size={28}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Data Document (Z-L-A)</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Emitent</label>
                  <div className="flex gap-2 mb-2">
                    {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(e => (
                        <button key={e} onClick={() => setForm({...form, emitent: e})} className="text-[9px] font-black p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white">{e}</button>
                    ))}
                  </div>
                  <input type="text" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" placeholder="SCRIE EMITENTUL..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Conținut / Descriere</label>
                  <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none h-40 resize-none" placeholder="DETALII DESPRE DOCUMENT..." />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Compartiment</label>
                  <div className="flex gap-2 mb-2">
                    {["SECRETARIAT", "CONTABILITATE", "APP"].map(c => (
                        <button key={c} onClick={() => setForm({...form, compartment: c})} className="text-[9px] font-black p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">{c}</button>
                    ))}
                  </div>
                  <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" placeholder="SCRIE COMPARTIMENT..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Data Expediere</label>
                        <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Destinatar</label>
                        <input type="text" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" placeholder="CĂTRE..." />
                    </div>
                </div>
                <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-4 text-center">Legături Document (Conex/Dosar)</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="NR. CONEX" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-xl font-bold border outline-none" />
                        <input type="text" placeholder="INDICATIV DOSAR" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-xl font-bold border outline-none" />
                    </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-8 bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xl uppercase shadow-xl hover:bg-blue-700 active:scale-[0.97] transition-all">
              {loading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ ÎN REGISTRU'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
