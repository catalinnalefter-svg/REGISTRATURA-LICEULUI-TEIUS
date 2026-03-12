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
    if (!form.data || (activeTab === 'general' && !form.emitent)) {
        alert("Vă rugăm să completați datele obligatorii.");
        return;
    }

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
    } else {
        console.error("Eroare la salvare:", error);
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border-[12px] border-slate-800">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Liceu Teiuș</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Registratură Digitală v2.0</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="PAROLĂ ACCES..." 
              value={pass}
              className="w-full p-6 bg-slate-100 rounded-2xl font-black outline-none border-4 border-transparent focus:border-blue-500 transition-all uppercase text-center text-xl tracking-widest"
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && pass === '1234') { setIsAuth(true); setCurrentUser('ADMIN'); }}}
            />
            <button 
              onClick={() => { if(pass === '1234') { setIsAuth(true); setCurrentUser('ADMIN'); } else { alert('Parolă incorectă!'); } }}
              className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
            >
              Conectare Sistem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      {/* HEADER STILIZAT */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">Registratură</h1>
          <div className="flex items-center gap-3 mt-3">
             <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded">LIVE</span>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Liceul Teoretic Teiuș • {currentUser}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-10 py-6 rounded-3xl font-black flex items-center gap-4 hover:scale-105 transition-all shadow-2xl uppercase italic tracking-tight">
            <Plus size={28} strokeWidth={3} /> Înregistrare Nouă
          </button>
          <button onClick={() => setIsAuth(false)} className="bg-white text-slate-900 p-6 rounded-3xl font-black border-4 border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-xl">
            <LogOut size={28} />
          </button>
        </div>
      </div>

      {/* TABS STILIZATE */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap gap-3">
        {[
          { id: 'general', label: 'Registru General' },
          { id: 'decizii', label: 'Decizii / Note' },
          { id: 'delegatii', label: 'Delegații' },
          { id: 'registre', label: 'Registru Registre' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-10 py-5 rounded-2xl font-black uppercase tracking-tighter transition-all text-sm ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border-2 border-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABEL CU DESIGNUL ORIGINAL */}
      <div className="max-w-7xl mx-auto bg-white rounded-[3.5rem] shadow-2xl border-[12px] border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b-4 border-slate-100">
                <th className="p-8 font-black uppercase text-[11px] tracking-widest text-slate-400">Nr. Crt</th>
                <th className="p-8 font-black uppercase text-[11px] tracking-widest text-slate-400">Informații Document</th>
                <th className="p-8 font-black uppercase text-[11px] tracking-widest text-slate-400">Proveniență / Destinație</th>
                <th className="p-8 font-black uppercase text-[11px] tracking-widest text-slate-400">Gestiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-8">
                    <span className="text-4xl font-black text-slate-200 group-hover:text-blue-600 transition-colors tracking-tighter italic">#{item.nr_crt}</span>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">{item.data}</p>
                  </td>
                  <td className="p-8">
                    <p className="font-black text-slate-800 uppercase leading-tight text-lg max-w-md mb-2">{item.continut}</p>
                    <div className="flex gap-2">
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded uppercase italic">{activeTab}</span>
                        {item.indicativ_dosar && <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded uppercase">{item.indicativ_dosar}</span>}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Emitent: <span className="text-slate-800">{item.emitent || '-'}</span></p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Destinatar: <span className="text-slate-800">{item.destinatar || '-'}</span></p>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="font-black text-slate-800 uppercase italic text-xs bg-slate-50 px-3 py-2 rounded-xl border-2 border-slate-100">{item.compartiment || '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REPARAT COMPLET SINTACTIC */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl p-12 shadow-2xl relative border-[16px] border-white max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowForm(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-all hover:rotate-90"><X size={40}/></button>
            
            <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
                  {activeTab === 'general' ? 'Date Registru' : activeTab === 'decizii' ? 'Date Decizie' : activeTab === 'delegatii' ? 'Date Delegație' : 'Date Registre'}
                </h2>
                <div className="h-2 w-20 bg-blue-600 mt-4 rounded-full"></div>
            </div>

            {activeTab === 'delegatii' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Titular Delegație</label>
                    <input type="text" placeholder="NUME ȘI PRENUME..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 uppercase focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Data Document</label>
                    <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Ruta / Scopul deplasării</label>
                  <input type="text" placeholder="EX: TEIUȘ - ALBA IULIA - TEIUȘ..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 uppercase focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
            ) : activeTab === 'general' ? (
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex gap-3 mb-4 bg-slate-50 p-2 rounded-[2rem]">
                    <button onClick={() => setFormType('INTRARE')} className={`flex-1 py-5 rounded-[1.5rem] font-black transition-all ${formType === 'INTRARE' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>INTRARE</button>
                    <button onClick={() => setFormType('IESIRE')} className={`flex-1 py-5 rounded-[1.5rem] font-black transition-all ${formType === 'IESIRE' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>IEȘIRE</button>
                  </div>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 outline-none focus:border-blue-500 transition-all" />
                  <input type="text" placeholder="EMITENT..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 uppercase outline-none focus:border-blue-500 transition-all" />
                  <input type="text" placeholder="DESTINATAR..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 uppercase outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-6">
                  <textarea placeholder="CONȚINUT PE SCURT..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 h-44 uppercase outline-none focus:border-blue-500 transition-all" />
                  <select value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 uppercase outline-none appearance-none">
                    {listaCompartimente.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 outline-none focus:border-blue-500 transition-all" />
                <textarea placeholder="CONȚINUT / DESCRIERE..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 h-44 uppercase outline-none focus:border-blue-500 transition-all" />
                <textarea placeholder="OBSERVAȚII..." value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] font-black border-4 border-slate-50 h-32 uppercase outline-none focus:border-blue-500 transition-all" />
              </div>
            )}

            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full bg-slate-900 text-white p-8 rounded-[2.5rem] font-black uppercase text-xl mt-10 shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4"
            >
              {loading ? 'Sincronizare...' : 'Finalizare Înregistrare'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUCCES ORIGINAL */}
      {allocatedNumber && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[4rem] p-16 w-full max-w-md text-center shadow-2xl border-[16px] border-emerald-50">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 size={50} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">Succes!</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">Numărul de înregistrare este:</p>
            <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-10 border-4 border-slate-100">
              <span className="text-7xl font-black text-blue-600 italic tracking-tighter">#{allocatedNumber}</span>
            </div>
            <button onClick={() => setAllocatedNumber(null)} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">Am înțeles</button>
          </div>
        </div>
      )}
    </div>
  );
}
