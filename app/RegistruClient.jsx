'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Check, LogOut, X, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('general'); 
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stări pentru Formular
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('INTRARE'); // INTRARE, IESIRE, REZERVAT

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    destinatar: '',
    data_exped: '',
    conex_ind: '',
    observatii: '',
    tip_decizie: 'DECIZIE',
    data_sfarsit: '',
    nr_manual: ''
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result } = await supabase.from(table).select('*').order('numar_inregistrare', { ascending: false });
    setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleSave = async () => {
    if (!form.continut) return alert('Conținutul este obligatoriu!');
    setLoading(true);
    try {
      let table = '';
      let payload = { continut: form.continut, creat_de: 'ing. Lefter C.', anul: 2026 };

      if (activeTab === 'general') {
        table = 'documente';
        payload = { 
            ...payload, 
            tip: formType, 
            creat_la: form.data, 
            emitent: form.emitent.toUpperCase(), 
            destinatar: form.destinatar.toUpperCase(),
            data_expedire: form.data_exped || null,
            conex_ind: form.conex_ind,
            compartiment: currentUser 
        };
      } else if (activeTab === 'decizii') {
        table = 'registrul_deciziilor';
        payload = { ...payload, tip_document: form.tip_decizie, data_emitere: form.data, observatii: form.observatii };
      } else if (activeTab === 'registre') {
        table = 'registrul_registrelor';
        payload = { ...payload, numar_inregistrare: parseInt(form.nr_manual), data_inceput: form.data, data_sfarsit: form.data_sfarsit || null, observatii: form.observatii };
      }

      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;
      
      fetchData();
      setShowForm(false);
      setForm({ data: new Date().toISOString().split('T')[0], emitent: '', continut: '', destinatar: '', data_exped: '', conex_ind: '', observatii: '', tip_decizie: 'DECIZIE', data_sfarsit: '', nr_manual: '' });
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center border border-white">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tighter">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold outline-none border border-slate-100" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            <option value="SECRETARIAT">SECRETARIAT</option>
            <option value="CONTABILITATE">CONTABILITATE</option>
            <option value="ADMINISTRATIV">ADMINISTRATIV</option>
            <option value="DIRECTOR">DIRECTOR</option>
            <option value="ACHIZIȚII">ACHIZIȚII</option>
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border border-slate-100 outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'liceulteius2026' && currentUser) setIsAuth(true); }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Intră în Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-12 h-12" alt="Logo" />
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">REGISTRATURA <span className="text-blue-500 text-lg">LICEULUI TEORETIC TEIUȘ</span></h1>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                Creat de ing. Lefter C. | UTILIZATOR ACTIV: <span className="text-blue-600 font-black">{currentUser}</span>
              </p>
            </div>
          </div>

          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mt-4 md:mt-0">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>{tab}</button>
            ))}
          </nav>

          <div className="flex gap-2">
            <button className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-[#059669] shadow-sm"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-4 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
          </div>
        </header>

        {/* CARDURILE DE CREARE (Doar pentru Registrul General) */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[ {t: 'INTRARE', c: 'bg-[#10b981]'}, {t: 'IESIRE', c: 'bg-[#3b82f6]'}, {t: 'REZERVAT', c: 'bg-[#f97316]'} ].map(card => (
              <div key={card.t} onClick={() => { setFormType(card.t); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                <div className={`${card.c} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}><Plus size={24} strokeWidth={3}/></div>
                <h2 className="text-3xl font-black uppercase text-[#0f172a]">{card.t}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
              </div>
            ))}
          </div>
        )}

        {/* BUTON ADĂUGARE PENTRU CELELALTE REGISTRE */}
        {activeTab !== 'general' && (
           <button onClick={() => setShowForm(true)} className="w-full mb-10 p-8 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] hover:border-blue-500 hover:text-blue-500 transition-all">
             Adaugă în {activeTab === 'decizii' ? 'Registrul de Decizii' : 'Registrul Registrelor'}
           </button>
        )}

        {/* TABEL CU COLOANELE CERUTE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-white">
            <div className="bg-slate-50 p-4 rounded-3xl flex-1 flex items-center gap-3 border border-slate-100">
              <Search className="text-slate-300" size={20}/>
              <input type="text" placeholder="Caută în tabel..." className="bg-transparent w-full outline-none font-bold text-slate-600 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                  {activeTab === 'general' ? (
                    <>
                      <th className="px-6 py-5">Tip</th><th className="px-6 py-5">Nr. Înreg.</th><th className="px-6 py-5">Data Inreg.</th>
                      <th className="px-6 py-5">Emitent</th><th className="px-6 py-5">Conținut</th><th className="px-6 py-5">Destinatar</th>
                      <th className="px-6 py-5">Data Exped.</th><th className="px-6 py-5">Compartiment</th><th className="px-6 py-5">Creat De</th>
                      <th className="px-6 py-5">Conex/Ind.</th><th className="px-6 py-5 text-center">Editare</th>
                    </>
                  ) : activeTab === 'decizii' ? (
                    <>
                      <th className="px-8 py-5">Tip Doc</th><th className="px-8 py-5">Nr. Doc</th><th className="px-8 py-5">Data Emitere</th>
                      <th className="px-8 py-5">Conținut</th><th className="px-8 py-5">Observații</th><th className="px-8 py-5 text-center">Editare</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5">Nr. Registru</th><th className="px-8 py-5">Data Începerii</th><th className="px-8 py-5">Conținut</th>
                      <th className="px-8 py-5">Data Terminare</th><th className="px-8 py-5">Observații</th><th className="px-8 py-5 text-center">Editare</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>{item.tip}</span>
                        </td>
                        <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-5 text-slate-500">{item.creat_la}</td>
                        <td className="px-6 py-5 uppercase">{item.emitent}</td>
                        <td className="px-6 py-5 italic max-w-xs">{item.continut}</td>
                        <td className="px-6 py-5 uppercase">{item.destinatar || '-'}</td>
                        <td className="px-6 py-5 text-slate-500">{item.data_expedire || '-'}</td>
                        <td className="px-6 py-5"><span className="bg-slate-100 px-2 py-1 rounded text-[9px] uppercase">{item.compartiment}</span></td>
                        <td className="px-6 py-5 text-slate-400 uppercase text-[9px]">{item.creat_de}</td>
                        <td className="px-6 py-5 text-slate-400">{item.conex_ind || '-'}</td>
                      </>
                    ) : activeTab === 'decizii' ? (
                      <>
                        <td className="px-8 py-5"><span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg">{item.tip_document}</span></td>
                        <td className="px-8 py-5 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-8 py-5">{item.data_emitere}</td>
                        <td className="px-8 py-5">{item.continut}</td>
                        <td className="px-8 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5 font-black text-emerald-600">Reg. #{item.numar_inregistrare}</td>
                        <td className="px-8 py-5">{item.data_inceput}</td>
                        <td className="px-8 py-5">{item.continut}</td>
                        <td className="px-8 py-5">{item.data_sfarsit || 'În curs'}</td>
                        <td className="px-8 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    )}
                    <td className="px-6 py-5 text-center"><button className="text-slate-200 hover:text-blue-500"><Plus size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAR COMPLETATE */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl relative border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter">Adăugare în {activeTab.toUpperCase()}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500"><X/></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {activeTab === 'general' && (
                <>
                  <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center font-black text-blue-600 uppercase text-xs tracking-widest">TIP: {formType}</div>
                  <input type="text" placeholder="Emitent" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 outline-none" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                  <input type="text" placeholder="Destinatar" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 outline-none" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                  <div className="flex flex-col"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1">Data Inreg.</label><input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                  <div className="flex flex-col"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1">Data Expedire</label><input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} /></div>
                  <input type="text" placeholder="Conex / Indici" className="col-span-2 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 outline-none" value={form.conex_ind} onChange={e => setForm({...form, conex_ind: e.target.value})} />
                </>
              )}

              {activeTab === 'decizii' && (
                <>
                  <select className="col-span-2 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" value={form.tip_decizie} onChange={e => setForm({...form, tip_decizie: e.target.value})}>
                    <option value="DECIZIE">DECIZIE</option>
                    <option value="NOTĂ DE SERVICIU">NOTĂ DE SERVICIU</option>
                  </select>
                  <div className="col-span-2 flex flex-col"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1">Data Emitere</label><input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                </>
              )}

              {activeTab === 'registre' && (
                <>
                  <input type="number" placeholder="Nr. Registru existent" className="col-span-2 p-4 bg-blue-50 text-blue-700 rounded-2xl font-black border border-blue-100 outline-none text-2xl text-center" value={form.nr_manual} onChange={e => setForm({...form, nr_manual: e.target.value})} />
                  <div className="flex flex-col"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1">Data Începerii</label><input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                  <div className="flex flex-col"><label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1">Data Încheierii</label><input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.data_sfarsit} onChange={e => setForm({...form, data_sfarsit: e.target.value})} /></div>
                </>
              )}

              <textarea placeholder="Conținut / Descriere" className="col-span-2 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 outline-none h-32" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
              
              {(activeTab === 'decizii' || activeTab === 'registre') && (
                <input type="text" placeholder="Observații" className="col-span-2 p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} />
              )}
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-6 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700">
              {loading ? 'Se salvează...' : 'Salvează înregistrarea'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
