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

  useEffect(() => {
    if (lastRegNumber) {
      const timer = setTimeout(() => setLastRegNumber(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastRegNumber]);

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleOpenNew = (type) => {
    setFormType(type || 'INTRARE');
    setEditingId(null);
    setForm({ ...initialFormState, compartiment: currentUser });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.continut) return alert('Introduceți conținutul!');
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { continut: form.continut, creat_de: currentUser, anul: 2026 };

      if (activeTab === 'general') {
        payload = { ...payload, tip: formType, creat_la: form.data, emitent: (form.emitent || '').toUpperCase(), destinatar: (form.destinatar || '').toUpperCase(), data_expedire: form.data_exped || null, conex_ind: form.conex, indicativ_dosar: form.indicativ_dosar, compartiment: form.compartiment };
      } else if (activeTab === 'decizii') {
        payload = { ...payload, tip_document: form.tip_document_spec, data_emitere: form.data, observatii: form.observatii };
      } else {
        payload = { ...payload, numar_manual: form.numar_manual, data_inceput: form.data, data_sfarsit: form.data_final || null, observatii: form.observatii };
      }

      const { data: saved, error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).select()
        : await supabase.from(table).insert([payload]).select();

      if (error) throw error;
      if (!editingId && saved) setLastRegNumber(activeTab === 'registre' ? saved[0].numar_manual : saved[0].numar_inregistrare);
      
      fetchData();
      setShowForm(false);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center border border-white">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-widest">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            <option value="SECRETARIAT">SECRETARIAT</option>
            <option value="CONTABILITATE">CONTABILITATE</option>
            <option value="ADMINISTRATIV">ADMINISTRATIV</option>
            <option value="DIRECTOR">DIRECTOR</option>
            <option value="ACHIZIȚII">ACHIZIȚII</option>
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'liceulteius2026' && currentUser) setIsAuth(true); }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all">Intră în Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul_teius_logo.png" className="w-16 h-16 object-contain" alt="LOGO LICEU" />
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase leading-none">REGISTRATURA <span className="text-blue-600">LICEULUI TEORETIC TEIUȘ</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creat de ing. Lefter C. | UTILIZATOR: <span className="text-blue-600 font-black">{currentUser}</span></p>
            </div>
          </div>
          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>
                {tab === 'decizii' ? 'DECIZII / NOTE' : tab === 'registre' ? 'REGISTRU REGISTRE' : 'REGISTRU GENERAL'}
              </button>
            ))}
          </nav>
          <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500">Ieșire</button>
        </header>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {activeTab === 'general' ? (
            ['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <div key={t} onClick={() => handleOpenNew(t)} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-md cursor-pointer group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 ${t === 'INTRARE' ? 'bg-[#10b981]' : t === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}><Plus size={28}/></div>
                <h2 className="text-4xl font-black uppercase text-[#0f172a]">{t}</h2>
              </div>
            ))
          ) : (
            <div onClick={() => handleOpenNew()} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-md cursor-pointer group col-span-3 flex items-center gap-8">
              <div className="bg-blue-600 w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-xl"><Plus size={36}/></div>
              <h2 className="text-4xl font-black uppercase text-[#0f172a]">ADĂUGARE ÎN {activeTab === 'decizii' ? 'DECIZII / NOTE' : 'REGISTRU REGISTRE'}</h2>
            </div>
          )}
        </div>

        {/* TABEL DINAMIC */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4">
             <Search className="text-slate-300" size={22}/>
             <input type="text" placeholder="Căutare rapidă..." className="w-full outline-none font-bold text-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-6 py-6">Tip</th><th className="px-6 py-6">Nr. Înregistrare</th><th className="px-6 py-6">Data Inreg.</th><th className="px-6 py-6">Emitent</th><th className="px-6 py-6">Conținut</th><th className="px-6 py-6">Compartiment</th><th className="px-6 py-6">Creat De</th><th className="px-6 py-6">Destinatar</th><th className="px-6 py-6">Data Exped.</th><th className="px-6 py-6">Conex/Ind.</th><th className="px-6 py-6 text-center">Editare</th>
                  </tr>
                ) : activeTab === 'decizii' ? (
                  <tr>
                    <th className="px-6 py-6">Tip</th><th className="px-6 py-6">Nr. Document</th><th className="px-6 py-6">Data</th><th className="px-6 py-6">Conținut</th><th className="px-6 py-6">Observații</th><th className="px-6 py-6 text-center">Editare</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-6">Nr. Registru</th><th className="px-6 py-6">Data Început</th><th className="px-6 py-6">Conținut</th><th className="px-6 py-6">Data Terminare</th><th className="px-6 py-6">Observații</th><th className="px-6 py-6 text-center">Editare</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-6 py-6"><span className={`px-4 py-1.5 rounded-lg text-[9px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>{item.tip}</span></td>
                        <td className="px-6 py-6 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-6 text-slate-500">{item.creat_la}</td>
                        <td className="px-6 py-6 uppercase">{item.emitent}</td>
                        <td className="px-6 py-6 italic truncate max-w-[200px]">{item.continut}</td>
                        <td className="px-6 py-6 uppercase">{item.compartiment}</td>
                        <td className="px-6 py-6 text-slate-400">{item.creat_de}</td>
                        <td className="px-6 py-6 uppercase">{item.destinatar}</td>
                        <td className="px-6 py-6 text-slate-400">{item.data_expedire || '-'}</td>
                        <td className="px-6 py-6">{item.conex_ind || '-'}</td>
                      </>
                    ) : activeTab === 'decizii' ? (
                      <>
                        <td className="px-6 py-6 uppercase">{item.tip_document}</td>
                        <td className="px-6 py-6 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-6 text-slate-500">{item.data_emitere}</td>
                        <td className="px-6 py-6 italic">{item.continut}</td>
                        <td className="px-6 py-6 text-slate-400">{item.observatii}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-6 text-blue-600 font-black">{item.numar_manual}</td>
                        <td className="px-6 py-6 text-slate-500">{item.data_inceput}</td>
                        <td className="px-6 py-6 italic">{item.continut}</td>
                        <td className="px-6 py-6 text-slate-500">{item.data_sfarsit || 'În curs'}</td>
                        <td className="px-6 py-6 text-slate-400">{item.observatii}</td>
                      </>
                    )}
                    <td className="px-6 py-6 text-center">
                      <button onClick={() => { setEditingId(item.id); setForm(item); setShowForm(true); }} className="text-slate-200 hover:text-blue-500"><Edit2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-[1000px] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter">
                {activeTab === 'general' ? 'DATE REGISTRU GENERAL' : activeTab === 'decizii' ? 'DATE DECIZII / NOTE' : 'DATE REGISTRU NOU'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-[#f1f5f9] p-5 rounded-[2rem] text-slate-400 hover:text-red-500"><X size={36}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* STÂNGA */}
              <div className="space-y-6">
                {activeTab === 'decizii' && (
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Tip Document</label>
                    <div className="flex gap-2">
                      {['DECIZIE', 'NOTA DE SERVICIU'].map(t => (
                        <button key={t} onClick={() => setForm({...form, tip_document_spec: t})} className={`px-6 py-3 rounded-2xl font-black text-[10px] ${form.tip_document_spec === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Nr. Registru (Manual)</label>
                    <input type="text" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-xl outline-none" placeholder="Ex: 12/2026" />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Data</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-xl outline-none" />
                </div>
                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Data Terminare</label>
                    <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-xl outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Conținut</label>
                  <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-xl outline-none h-40 resize-none" placeholder="Descrie documentul..." />
                </div>
              </div>

              {/* DREAPTA (DOAR PT GENERAL) */}
              <div className="space-y-6">
                {activeTab === 'general' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Compartiment</label>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {['SECRETARIAT', 'CONTABILITATE', 'APP', 'ALTELE'].map(c => (
                          <button key={c} onClick={() => setForm({...form, compartiment: c})} className={`px-4 py-2 rounded-xl font-black text-[9px] ${form.compartiment === c ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}>{c}</button>
                        ))}
                      </div>
                      <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none uppercase" />
                    </div>
                    <input type="text" placeholder="EMITENT" className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none uppercase" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                    <input type="text" placeholder="DESTINATAR" className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none uppercase" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="CONEX" className="p-5 bg-[#f8fafc] rounded-2xl font-black outline-none" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} />
                      <input type="text" placeholder="DOSAR" className="p-5 bg-[#f8fafc] rounded-2xl font-black outline-none" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Observații</label>
                    <textarea value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-xl outline-none h-64 resize-none" placeholder="Mențiuni suplimentare..." />
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-[#3b82f6] text-white p-10 rounded-[2.5rem] font-black text-3xl uppercase shadow-2xl">
              {loading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ'}
            </button>
          </div>
        </div>
      )}

      {/* FIȘĂ NUMĂR SUCCES */}
      {lastRegNumber && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl max-w-lg w-full">
            <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-8"><FileText size={48} /></div>
            <h3 className="text-slate-400 font-black uppercase text-[12px] mb-4">Înregistrare Reușită</h3>
            <p className="text-slate-900 font-black text-8xl mb-6 tracking-tighter">#{lastRegNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
