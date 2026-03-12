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
          <button onClick={() => setIsAuth(false)} className="bg-white text-slate-900 p-6 rounded-3xl font-black border-4 border-slate-100 hover:bg-red
