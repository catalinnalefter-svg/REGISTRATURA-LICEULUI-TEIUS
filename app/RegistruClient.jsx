'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Edit2, LogOut, Download, Plus, CheckCircle2, Book } from 'lucide-react';
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
  const [decizieType, setDecizieType] = useState('DECIZIE');
  const [editingId, setEditingId] = useState(null);
  const [allocatedNumber, setAllocatedNumber] = useState(null);

  const listaCompartimente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII", "RESURSE UMANE"];

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '', continut: '', destinatar: '', 
    data_expediere: '', conex: '', indicativ_dosar: '', 
    compartiment: '', observatii: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    let tableName = 'documente';
    if (activeTab === 'decizii') tableName = 'registrul_deciziilor';
    if (activeTab === 'registre') tableName = 'registru_registre'; // Tabel nou in DB

    const { data: result, error } = await supabase
      .from(tableName)
      .select('*')
      .order('numar_inregistrare', { ascending: false });
    
    if (!error) setData(result || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (!currentUser) { alert("Alegeți un compartiment!"); return; }
    if (pass === 'liceulteius2026') setIsAuth(true);
    else alert("Parolă incorectă!");
  };

  const handleSave = async () => {
    setLoading(true);
    const isGeneral = activeTab === 'general';
    const tableName = isGeneral ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registru_registre');
    
    // Corecție eroare: Mapăm 'data' către 'created_at' dacă 'creat_la' lipsește în schema DB
    const payload = isGeneral ? {
      tip: formType,
      creat_la: form.data,
      emitent: form.emitent.toUpperCase(),
      continut: form.continut.toUpperCase(),
      destinatar: form.destinatar.toUpperCase(),
      compartiment: form.compartiment.toUpperCase(),
      creat_de: currentUser,
      data_expediere: form.data_expediere || null,
      conex_ind: form.conex,
      indicativ_dosar: form.indicativ_dosar
    } : {
      tip: activeTab === 'decizii' ? decizieType : 'REGISTRU',
      created_at: form.data, // Schimbat din creat_la pentru a evita eroarea din schema cache
      continut: form.continut.toUpperCase(),
      observatii: form.observatii.toUpperCase(),
      creat_de: currentUser
    };

    const { data: savedData, error } = editingId 
        ? await supabase.from(tableName).update(payload).eq('id', editingId).select() 
        : await supabase.from(tableName).insert([payload]).select();

    if (error) {
      alert("Eroare: " + error.message);
    } else {
      if (!editingId && savedData?.[0]) setAllocatedNumber(savedData[0].numar_inregistrare);
      setShowForm(false);
      setEditingId(null);
      setForm({ data: new Date().toISOString().split('T')[0], emitent: '', continut: '', destinatar: '', data_expediere: '', conex: '', indicativ_dosar: '', compartiment: '', observatii: '' });
      fetchData();
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border-t-8 border-blue-600">
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Acces Registre</h2>
          <p className="text-blue-600 font-bold mb-8 text-sm uppercase">Liceul Teoretic Teiuș</p>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border-2 border-slate-100 outline-none focus:border-blue-500" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege compartimentul...</option>
            {listaCompartimente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parolă" className="w-full p-4 bg-slate-50 rounded-2xl mb-6 text-center font-bold border-2 border-slate-100 outline-none focus:border-blue-500" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800">
      <div className="max-w-[98%] mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
              <img src="/liceul_teoretic_teius.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Registratură Liceul Teoretic Teiuș</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Sesiune: {currentUser}</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500"><LogOut size={20}/></button>
        </header>

        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'general' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru General</button>
            <button onClick={() => setActiveTab('decizii')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'decizii' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Decizii / Note</button>
            <button onClick={() => setActiveTab('registre')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'registre' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru Registre</button>
        </div>

        {/* Buton adaugare pentru sectiunile noi */}
        {activeTab !== 'general' && (
          <div className="mb-10">
            <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-xl transition-all w-full md:w-1/3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 bg-blue-600"><Plus size={24} strokeWidth={3}/></div>
              <h3 className="font-black text-2xl text-slate-800 mb-1">{activeTab === 'decizii' ? 'Adaugă Decizie/Notă' : 'Adaugă Registru'}</h3>
            </button>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <button key={t} onClick={() => { setFormType(t); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-xl transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${t==='INTRARE'?'bg-emerald-500':t==='IESIRE'?'bg-blue-500':'bg-orange-500'}`}><Plus size={24} strokeWidth={3}/></div>
                <h3 className="font-black text-2xl text-slate-800 mb-1 uppercase">{t}</h3>
              </button>
            ))}
          </div>
        )}

        {/* Tabel Date */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl w-96 border border-slate-100">
                <Search size={18} className="text-slate-300"/>
                <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-4 py-5">Tip</th><th className="px-4 py-5">Nr. Înregistrare</th>
                    <th className="px-4 py-5">Data Inreg.</th><th className="px-4 py-5">Emitent</th>
                    <th className="px-4 py-5">Conținut</th><th className="px-4 py-5">Compartiment</th>
                    <th className="px-4 py-5">Creat De</th><th className="px-4 py-5">Destinatar</th>
                    <th className="px-4 py-5">Data Exped.</th><th className="px-4 py-5">Conex/Ind.</th>
                    <th className="px-4 py-5 text-right">Editare</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-5">Tip</th><th className="px-4 py-5">Nr. Document</th>
                    <th className="px-4 py-5">Data</th><th className="px-4 py-5">Conținut</th>
                    <th className="px-4 py-5">Observații</th><th className="px-4 py-5 text-right">Editare</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-4 py-4"><span className={`px-3 py-1.5 rounded-xl text-[9px] font-black text-white ${item.tip==='INTRARE'?'bg-emerald-500':'bg-blue-500'}`}>{item.tip}</span></td>
                        <td className="px-4 py-4 text-blue-600 font-black">{item.numar_inregistrare}</td>
                        <td className="px-4 py-4">{item.creat_la}</td>
                        <td className="px-4 py-4 uppercase truncate max-w-[120px]">{item.emitent}</td>
                        <td className="px-4 py-4 uppercase truncate max-w-[200px]">{item.continut}</td>
                        <td className="px-4 py-4 uppercase">{item.compartiment}</td>
                        <td className="px-4 py-4 text-slate-400">{item.creat_de}</td>
                        <td className="px-4 py-4 uppercase">{item.destinatar}</td>
                        <td className="px-4 py-4">{item.data_expediere || '-'}</td>
                        <td className="px-4 py-4">{item.conex_ind || ''}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4"><span className="px-3 py-1.5 rounded-xl text-[9px] font-black bg-slate-100 text-slate-600">{item.tip}</span></td>
                        <td className="px-4 py-4 text-blue-600 font-black">{item.numar_inregistrare}</td>
                        <td className="px-4 py-4">{item.created_at?.split('T')[0] || item.creat_la}</td>
                        <td className="px-4 py-4 uppercase">{item.continut}</td>
                        <td className="px-4 py-4 uppercase">{item.observatii}</td>
                      </>
                    )}
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formular Modal - Restaurat vizual conform imaginii */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 text-slate-900">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-5xl shadow-2xl relative border-[12px] border-slate-50">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><X size={32}/></button>
            <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tighter">
              {activeTab === 'general' ? 'Date Registru' : activeTab === 'decizii' ? 'Date Decizie / Notă' : 'Date Registru Registre'}
            </h2>
            
            {activeTab === 'general' ? (
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex gap-3 mb-4">
                    {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
                      <button key={t} onClick={() => setFormType(t)} className={`px-6 py-2 rounded-xl font-black text-[10px] ${formType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Data Document (Z-L-A)</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Emitent</label>
                    <div className="flex gap-2 mb-2">
                       {['DIN OFICIU', 'ISJ ALBA', 'MINISTERUL EDUCAȚIEI'].map(e => (
                         <button key={e} onClick={() => setForm({...form, emitent: e})} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">{e}</button>
                       ))}
                    </div>
                    <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Conținut / Descriere</label>
                    <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 font-bold h-40 resize-none uppercase" placeholder="DETALII DESPRE DOCUMENT..." />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Compartiment</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                       {['SECRETARIAT', 'CONTABILITATE', 'APP', 'ALTELE'].map(c => (
                         <button key={c} onClick={() => setForm({...form, compartiment: c})} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-[9px] font-black uppercase">{c}</button>
                       ))}
                    </div>
                    <input type="text" placeholder="SCRIE COMPARTIMENT..." value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Data Expediere</label>
                       <input type="date" value={form.data_expediere} onChange={e => setForm({...form, data_expediere: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-black" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Destinatar</label>
                       <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-black uppercase" />
                     </div>
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-4 text-center">Legături Document (Conex/Dosar)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="NR. CONEX" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="p-4 bg-white rounded-xl font-black text-center" />
                      <input type="text" placeholder="INDICATIV DOSAR" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="p-4 bg-white rounded-xl font-black text-center" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-3">
                  {(activeTab === 'decizii' ? ['DECIZIE', 'NOTĂ DE SERVICIU'] : ['REGISTRU']).map(t => (
                    <button key={t} onClick={() => setDecizieType(t)} className={`px-8 py-2 rounded-xl font-black text-[10px] ${decizieType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100" />
                  <textarea placeholder="CONȚINUT..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 h-32 uppercase" />
                  <textarea placeholder="OBSERVAȚII..." value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 h-32 uppercase col-span-2" />
                </div>
              </div>
            )}
            
            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black text-lg uppercase shadow-xl mt-10 transition-all">
              {loading ? 'SALVARE...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}

      {allocatedNumber && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 text-slate-900">
           <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg text-center border-[12px] border-emerald-50">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
              <h2 className="text-xl font-black text-slate-800 uppercase mb-4">Înregistrare Reușită!</h2>
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border-2 border-slate-100"><span className="text-6xl font-black text-blue-600">#{allocatedNumber}</span></div>
              <button onClick={() => setAllocatedNumber(null)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase">Închide</button>
           </div>
        </div>
      )}
    </div>
  );
}
