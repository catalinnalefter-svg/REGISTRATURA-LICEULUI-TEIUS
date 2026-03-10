'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Check, LogOut, X, Download, Calendar, ArrowRight } from 'lucide-react';
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
  const [formType, setFormType] = useState('INTRARE'); // INTRARE, IESIRE, REZERVAT

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    destinatar: '',
    data_exped: '',
    conex: '',
    indicativ_dosar: '',
    compartiment: '',
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
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { 
        continut: form.continut, 
        creat_de: 'ing. Lefter C.', 
        anul: 2026,
        compartiment: form.compartiment || currentUser
      };

      if (activeTab === 'general') {
        payload = { ...payload, tip: formType, creat_la: form.data, emitent: form.emitent.toUpperCase(), destinatar: form.destinatar.toUpperCase(), data_expedire: form.data_exped || null, conex_ind: form.conex, indicativ_dosar: form.indicativ_dosar };
      }

      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;
      
      fetchData();
      setShowForm(false);
      setForm({ ...form, emitent: '', continut: '', destinatar: '', conex: '', indicativ_dosar: '' });
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
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
                Creat de ing. Lefter C. | ACTIV: <span className="text-blue-600">{currentUser}</span>
              </p>
            </div>
          </div>

          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mt-4 md:mt-0">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>{tab}</button>
            ))}
          </nav>

          <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
        </header>

        {/* CARDURI ORIGINALE (Conform imaginii tale anterioare) */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[ {t: 'INTRARE', c: 'bg-[#3b82f6]'}, {t: 'IESIRE', c: 'bg-slate-100 text-slate-400'}, {t: 'REZERVAT', c: 'bg-slate-100 text-slate-400'} ].map(card => (
              <div key={card.t} onClick={() => { setFormType(card.t); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                <div className={`${card.t === 'INTRARE' ? 'bg-[#3b82f6]' : card.t === 'IESIRE' ? 'bg-blue-400' : 'bg-orange-500'} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}><Plus size={24} strokeWidth={3}/></div>
                <h2 className="text-3xl font-black uppercase text-[#0f172a]">{card.t}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
              </div>
            ))}
          </div>
        )}

        {/* TABEL CU CULORI DINAMICE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-white">
            <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-3 border border-slate-100 max-w-xl">
              <Search className="text-slate-300" size={20}/>
              <input type="text" placeholder="Caută după nr, emitent sau conținut..." className="bg-transparent w-full outline-none font-bold text-slate-600 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">Tip</th><th className="px-8 py-5">Nr. Înregistrare</th><th className="px-8 py-5">Data Inreg.</th>
                  <th className="px-8 py-5">Emitent</th><th className="px-8 py-5">Conținut</th><th className="px-8 py-5">Compartiment</th>
                  <th className="px-8 py-5">Creat De</th><th className="px-8 py-5">Conex/Ind.</th><th className="px-8 py-5 text-center">Editare</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase text-white ${item.tip === 'INTRARE' ? 'bg-[#3b82f6]' : item.tip === 'IESIRE' ? 'bg-blue-400' : 'bg-orange-500'}`}>{item.tip}</span>
                    </td>
                    <td className="px-8 py-6 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                    <td className="px-8 py-6 text-slate-500">{item.creat_la}</td>
                    <td className="px-8 py-6 uppercase">{item.emitent}</td>
                    <td className="px-8 py-6 italic font-medium">{item.continut}</td>
                    <td className="px-8 py-6"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] text-slate-500 uppercase">{item.compartiment}</span></td>
                    <td className="px-8 py-6 text-slate-400 uppercase text-[10px]">{item.creat_de}</td>
                    <td className="px-8 py-6 text-blue-400">{item.conex_ind || '-'} / {item.indicativ_dosar || '-'}</td>
                    <td className="px-8 py-6 text-center"><button className="text-slate-200 hover:text-blue-500"><Plus size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULARUL "DATE REGISTRU" - CONFORM IMAGINII */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-[950px] shadow-2xl relative animate-in zoom-in duration-300">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter mb-4">Date Registru</h2>
                <div className="flex gap-2">
                  {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
                    <button key={t} onClick={() => setFormType(t)} className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase transition-all ${formType === t ? 'bg-[#3b82f6] text-white shadow-lg' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="bg-[#f1f5f9] p-4 rounded-3xl text-slate-400 hover:text-red-500 transition-all"><X size={32}/></button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              {/* Stânga */}
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Data Document (Z-L-A)</label>
                  <div className="relative">
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-7 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none appearance-none cursor-pointer" />
                    <Calendar className="absolute right-8 top-7 text-slate-400" size={24}/>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Emitent</label>
                  <div className="flex gap-2 mb-4">
                    {['DIN OFICIU', 'ISJ ALBA', 'MINISTERUL EDUCAȚIEI'].map(e => (
                      <button key={e} onClick={() => setForm({...form, emitent: e})} className="px-5 py-3 bg-[#eff6ff] text-[#3b82f6] rounded-2xl font-black text-[10px] uppercase">{e}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="SCRIE EMITENTUL..." className="w-full p-7 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none placeholder:text-slate-300" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Conținut / Descriere</label>
                  <textarea placeholder="DETALII DESPRE DOCUMENT..." className="w-full p-7 bg-[#f8fafc] rounded-[3rem] font-black text-xl border-none outline-none h-48 resize-none placeholder:text-slate-300" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
                </div>
              </div>

              {/* Dreapta */}
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Compartiment</label>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['SECRETARIAT', 'CONTABILITATE', 'APP', 'ALTELE'].map(c => (
                      <button key={c} onClick={() => setForm({...form, compartiment: c})} className="px-5 py-3 bg-[#fff7ed] text-[#f97316] rounded-2xl font-black text-[10px] uppercase whitespace-nowrap">{c}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="SCRIE COMPARTIMENT..." className="w-full p-7 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none placeholder:text-slate-300 uppercase" value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Data Expediere</label>
                    <input type="date" className="w-full p-6 bg-[#f8fafc] rounded-2xl font-black text-lg border-none outline-none" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block tracking-wider">Destinatar</label>
                    <input type="text" placeholder="CĂTRE..." className="w-full p-6 bg-[#f8fafc] rounded-2xl font-black text-lg border-none outline-none placeholder:text-slate-300 uppercase" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                  </div>
                </div>

                {/* Secțiunea Legături Document (Caseta Albastră) */}
                <div className="bg-[#eff6ff] p-10 rounded-[3.5rem] border border-blue-100">
                  <h3 className="text-[#3b82f6] font-black uppercase text-[12px] text-center mb-8 tracking-widest">Legături Document (Conex/Dosar)</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black uppercase text-blue-400 block mb-2 ml-4">Nr. Conex</label>
                      <input type="text" placeholder="EX: 45" className="w-full p-6 bg-white rounded-3xl font-black text-xl border-none outline-none text-blue-900 placeholder:text-slate-200" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-blue-400 block mb-2 ml-4">Indicativ Dosar</label>
                      <input type="text" placeholder="EX: IV-C" className="w-full p-6 bg-white rounded-3xl font-black text-xl border-none outline-none text-blue-900 placeholder:text-slate-200" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buton Salvare */}
            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-[#3b82f6] text-white p-9 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-all">
              {loading ? 'SE SALVEAZĂ...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
