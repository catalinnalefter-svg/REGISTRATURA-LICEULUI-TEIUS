'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, X, Check, UserCircle, 
  FileText, ClipboardList, BookOpen, LogOut 
} from 'lucide-react'; 
import { supabase } from '../lib/supabase';

export default function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('general'); 
  
  const [dataGeneral, setDataGeneral] = useState([]);
  const [dataDecizii, setDataDecizii] = useState([]);
  const [dataRegistre, setDataRegistre] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numarGenerat, setNumarGenerat] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    compartiment: '',
    observatii: '',
    tip_decizie: 'DECIZIE',
    data_sfarsit: '',
    nr_manual: '' 
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data } = await supabase.from(table).select('*').order('numar_inregistrare', { ascending: false });
    if (activeTab === 'general') setDataGeneral(data || []);
    if (activeTab === 'decizii') setDataDecizii(data || []);
    if (activeTab === 'registre') setDataRegistre(data || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleSave = async () => {
    if (!form.continut) return alert('Conținutul este obligatoriu!');
    setLoading(true);
    try {
      let table = '';
      let payload = { 
        continut: form.continut, 
        creat_de: 'ing. Lefter C.', 
        anul: 2026 
      };

      if (activeTab === 'general') {
        table = 'documente';
        payload = { ...payload, tip_document: 'intrare', emitent: form.emitent.toUpperCase(), creat_la: form.data, compartiment: (form.compartiment || '').toUpperCase() };
      } else if (activeTab === 'decizii') {
        table = 'registrul_deciziilor';
        payload = { ...payload, tip_document: form.tip_decizie, data_emitere: form.data, observatii: form.observatii };
      } else if (activeTab === 'registre') {
        table = 'registrul_registrelor';
        payload = { ...payload, numar_inregistrare: parseInt(form.nr_manual), data_inceput: form.data, data_sfarsit: form.data_sfarsit || null, observatii: form.observatii };
      }

      const { data, error } = await supabase.from(table).insert([payload]).select();
      if (error) throw error;
      
      setNumarGenerat(data[0].numar_inregistrare);
      await fetchData();
      setTimeout(() => { 
        setShowForm(false); 
        setNumarGenerat(null); 
        setForm({ data: new Date().toISOString().split('T')[0], emitent: '', continut: '', compartiment: '', observatii: '', tip_decizie: 'DECIZIE', data_sfarsit: '', nr_manual: '' }); 
      }, 3000);
    } catch (err) { alert("Eroare: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceulteius2026' && currentUser) setIsAuth(true); }} className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <h2 className="text-xl font-black uppercase mb-6 text-blue-600 tracking-tighter">Acces Registre 2026</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold outline-none border border-slate-100" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alegeți Departamentul</option>
            <option value="SECRETARIAT">SECRETARIAT</option>
            <option value="DIRECTOR">DIRECTOR</option>
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold outline-none border border-slate-100" value={pass} onChange={e => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Intră în Sistem</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="text-left border-l-4 border-blue-600 pl-4">
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                {activeTab === 'general' && "Registru General"}
                {activeTab === 'decizii' && "Decizii și Note"}
                {activeTab === 'registre' && "Registrul Registrelor"}
              </h1>
              <p className="text-blue-600 font-black text-[12px] uppercase tracking-[0.2em] mt-2">
                Creat de ing. Lefter C.
              </p>
            </div>
          </div>

          <nav className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {[{ id: 'general', label: 'General', icon: FileText, color: 'blue' }, 
              { id: 'decizii', label: 'Decizii', icon: ClipboardList, color: 'purple' }, 
              { id: 'registre', label: 'Registre', icon: BookOpen, color: 'emerald' }].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab.id ? `bg-${tab.color}-600 text-white shadow-lg` : 'text-slate-400 hover:bg-slate-50'}`}>
                <tab.icon size={14}/> {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUser}</span>
            <button onClick={() => window.location.reload()} className="text-slate-300 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
          </div>
        </header>

        <button onClick={() => setShowForm(true)} className={`w-full mb-8 p-10 rounded-[2.5rem] border-2 border-dashed transition-all group flex flex-col items-center
          ${activeTab === 'general' ? 'border-blue-100 hover:border-blue-500 hover:bg-blue-50/30' : 
            activeTab === 'decizii' ? 'border-purple-100 hover:border-purple-500 hover:bg-purple-50/30' : 
            'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/30'}`}>
           <Plus className={`mb-2 ${activeTab === 'general' ? 'text-blue-300 group-hover:text-blue-500' : activeTab === 'decizii' ? 'text-purple-300 group-hover:text-purple-500' : 'text-emerald-300 group-hover:text-emerald-500'}`} size={32}/>
           <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Adaugă în Registrul {activeTab}</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                <Search size={18} className="text-slate-300"/>
                <input type="text" placeholder={`Caută în registrul ${activeTab}...`} className="outline-none font-bold text-sm w-full bg-transparent" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="p-6">Nr. Inreg</th>
                        <th className="p-6">Data</th>
                        <th className="p-6">Conținut / Descriere</th>
                        <th className="p-6">Autor Proiect</th>
                      </tr>
                  </thead>
                  <tbody className="text-[11px] font-bold">
                      {(activeTab === 'general' ? dataGeneral : activeTab === 'decizii' ? dataDecizii : dataRegistre)
                      .filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase()))
                      .map(item => (
                          <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                              <td className={`p-6 font-black ${activeTab === 'general' ? 'text-blue-600' : activeTab === 'decizii' ? 'text-purple-600' : 'text-emerald-600'}`}>#{item.numar_inregistrare}</td>
                              <td className="p-6 text-slate-500">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                              <td className="p-6 max-w-md">{item.continut}</td>
                              <td className="p-6 text-slate-400 uppercase italic">{item.creat_de}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative border border-slate-100">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tighter">Nouă înregistrare: {activeTab}</h2>
                  <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500"><X/></button>
                </div>
                
                <div className="space-y-4">
                  {activeTab === 'registre' && (
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-inner">
                      <label className="text-[9px] font-black text-emerald-700 uppercase block mb-2 ml-1">Nr. Registru (Manual)</label>
                      <input type="number" placeholder="Scrieți numărul aici..." value={form.nr_manual} onChange={e => setForm({...form, nr_manual: e.target.value})} className="w-full bg-transparent font-black text-4xl outline-none text-emerald-900 placeholder:text-emerald-200" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Data Document</label>
                        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:border-blue-400 transition-all" />
                      </div>
                      
                      {activeTab === 'general' && (
                        <input type="text" placeholder="Emitent (ex: ISJ Alba)" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" />
                      )}
                      
                      <textarea placeholder="Descriere / Conținut document..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 h-32 resize-none" />
                      
                      {(activeTab === 'decizii' || activeTab === 'registre') && (
                        <input type="text" placeholder="Observații suplimentare" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100" />
                      )}
                  </div>
                </div>

                <button onClick={handleSave} disabled={loading} className={`w-full p-5 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all 
                  ${activeTab === 'general' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 
                    activeTab === 'decizii' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : 
                    'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}>
                  {loading ? 'Se procesează...' : 'Salvează în Registru'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-200"><Check size={48} strokeWidth={4}/></div>
                <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Înregistrare reușită</h3>
                <div className="text-8xl font-black text-slate-800 my-2 tracking-tighter">#{numarGenerat}</div>
                <p className="text-slate-500 font-bold text-sm">Validat de ing. Lefter C.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
