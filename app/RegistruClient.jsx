'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Edit2, LogOut, Download, Plus, CheckCircle2 } from 'lucide-react';
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
  const [allocatedNumber, setAllocatedNumber] = useState(null);

  const listaCompartimente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII", "RESURSE UMANE"];

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    destinatar: '',
    continut: '',
    compartiment: 'SECRETARIAT',
    indicativ_dosar: '',
    observatii: '',
    nr_manual: ''
  });

  const fetchData = useCallback(async () => {
    let table = 'registru_general';
    if (activeTab === 'decizii') table = 'registru_decizii';
    if (activeTab === 'registre') table = 'registru_registre';
    if (activeTab === 'delegatii') table = 'registru_delegatii';

    const { data: records, error } = await supabase
      .from(table)
      .select('*')
      .order('nr_crt', { ascending: false });

    if (!error) setData(records);
  }, [activeTab]);

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth, fetchData]);

  const handleSave = async () => {
    setLoading(true);
    let table = 'registru_general';
    if (activeTab === 'decizii') table = 'registru_decizii';
    if (activeTab === 'registre') table = 'registru_registre';
    if (activeTab === 'delegatii') table = 'registru_delegatii';

    const payload = {
      ...form,
      tip_document: activeTab === 'general' ? formType : activeTab.toUpperCase(),
      creat_de: currentUser
    };

    const { data: newRecord, error } = await supabase
      .from(table)
      .insert([payload])
      .select();

    if (!error && newRecord) {
      setAllocatedNumber(newRecord[0].nr_crt);
      setShowForm(false);
      fetchData();
      setForm({
        data: new Date().toISOString().split('T')[0],
        emitent: '',
        destinatar: '',
        continut: '',
        compartiment: 'SECRETARIAT',
        indicativ_dosar: '',
        observatii: '',
        nr_manual: ''
      });
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-[12px] border-slate-800">
          <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter italic">Registratură<br/>Liceu Teiuș</h1>
          <input 
            type="password" 
            placeholder="PAROLĂ ACCES..." 
            className="w-full p-6 bg-slate-100 rounded-2xl mb-4 font-black outline-none border-4 border-transparent focus:border-blue-500 transition-all uppercase"
            onChange={(e) => setPass(e.target.value)}
          />
          <button 
            onClick={() => { if(pass === '1234') { setIsAuth(true); setCurrentUser('ADMIN'); }}}
            className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg"
          >
            Autentificare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-900">Registratură Digitală</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2 ml-1">Liceul Teoretic Teiuș • Sistem Gestiune Documente</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl uppercase italic">
            <Plus size={24} strokeWidth={3} /> Înregistrare Nouă
          </button>
          <button onClick={() => setIsAuth(false)} className="bg-white text-slate-900 p-5 rounded-2xl font-black border-2 border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-wrap gap-2">
        {[
          { id: 'general', label: 'Registru General' },
          { id: 'decizii', label: 'Decizii / Note' },
          { id: 'delegatii', label: 'Delegații' },
          { id: 'registre', label: 'Registru Registre' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABEL */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Nr. Crt</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Data</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Detalii</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Emitent/Destinatar</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Compartiment</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-black text-blue-600 text-xl">#{item.nr_crt}</td>
                  <td className="p-6 font-bold text-slate-500">{item.data}</td>
                  <td className="p-6">
                    <p className="font-black text-slate-800 uppercase leading-tight max-w-md">{item.continut}</p>
                    {item.tip_document && <span className="inline-block mt-2 text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{item.tip_document}</span>}
                  </td>
                  <td className="p-6">
                    <div className="text-xs font-black text-slate-400 uppercase">De la: {item.emitent || '-'}</div>
                    <div className="text-xs font-black text-slate-400 uppercase">Către: {item.destinatar || '-'}</div>
                  </td>
                  <td className="p-6 font-black text-slate-800 uppercase italic text-sm">{item.compartiment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORMULAR */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl relative border-[12px] border-white max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={32}/></button>
            
            <h2 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tighter italic">
              {activeTab === 'general' ? 'Înregistrare Nouă' : 
               activeTab === 'decizii' ? 'Decizie / Notă Nouă' : 
               activeTab === 'delegatii' ? 'Delegație Nouă' : 'Registru Nou'}
            </h2>

            {activeTab === 'delegatii' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Nume și Prenume</label>
                    <input type="text" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" placeholder="NUME..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Data</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Ruta / Destinația</label>
                  <input type="text" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" placeholder="EX: TEIUȘ - ALBA IULIA" />
                </div>
              </div>
            ) : activeTab === 'general' ? (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <button onClick={() => setFormType('INTRARE')} className={`flex-1 p-4 rounded-xl font-black ${formType === 'INTRARE' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>INTRARE</button>
                    <button onClick={() => setFormType('IESIRE')} className={`flex-1 p-4 rounded-xl font-black ${formType === 'IESIRE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>IEȘIRE</button>
                  </div>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100" />
                  <input type="text" placeholder="EMITENT..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" />
                  <input type="text" placeholder="DESTINATAR..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase" />
                </div>
                <div className="space-y-6">
                  <textarea placeholder="CONȚINUT PE SCURT..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 h-32 uppercase" />
                  <select value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 uppercase">
                    {listaCompartimente.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100" />
                <textarea placeholder="DESCRIERE..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 h-32 uppercase" />
                <textarea placeholder="OBSERVAȚII..." value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 h-32 uppercase" />
              </div>
            )}

            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black uppercase text-xl mt-8 shadow-xl hover:bg-blue-700 transition-all">
              {loading ? 'SE SALVEAZĂ...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}

      {/* SUCCES MODAL */}
      {allocatedNumber && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h2 className="text-xl font-black text-slate-800 uppercase mb-4">Înregistrare Reușită!</h2>
            <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border-2 border-slate-100">
              <span className="text-5xl font-black text-blue-600">#{allocatedNumber}</span>
            </div>
            <button onClick={() => setAllocatedNumber(null)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase">Închide</button>
          </div>
        </div>
      )}
    </div>
  );
}
