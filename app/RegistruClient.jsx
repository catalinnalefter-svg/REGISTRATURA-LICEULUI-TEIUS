'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [documente, setDocumente] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numarGenerat, setNumarGenerat] = useState(null);
  const [tip, setTip] = useState('intrare');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    compartiment: '',
    data_expediere: '',
    destinatar: '',
    nr_conex: '',
    indicativ: ''
  });

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
    if (data) setDocumente(data);
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pass === 'liceuteius2026') setIsAuth(true);
    else alert('Parolă incorectă!');
  };

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document);
    setForm({
      data: doc.creat_la,
      emitent: doc.emitent,
      continut: doc.continut,
      compartiment: doc.compartiment || '',
      data_expediere: doc.data_expediere || '',
      destinatar: doc.destinatar || '',
      nr_conex: doc.nr_conex || '',
      indicativ: doc.indicativ_dosar || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur dorești să ștergi această înregistrare?')) {
      await supabase.from('documente').delete().eq('id', id);
      fetchDocs();
    }
  };

  const handleExport = () => {
    const header = `<tr><th>Nr. Inreg.</th><th>Data</th><th>Emitent</th><th>Continut</th><th>Compartiment</th><th>Data Expediere</th><th>Destinatar</th><th>Nr. Conex</th><th>Indicativ</th></tr>`;
    const rows = documente.map(d => `<tr><td>${d.numar_inregistrare}</td><td>${d.creat_la}</td><td>${d.emitent || ''}</td><td>${d.continut || ''}</td><td>${d.compartiment || ''}</td><td>${d.data_expediere || ''}</td><td>${d.destinatar || ''}</td><td>${d.nr_conex || ''}</td><td>${d.indicativ_dosar || ''}</td></tr>`).join('');
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">${header}${rows}</table></body></html>`;
    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(template)));
    link.download = `Registru_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
    const payload = {
      tip_document: tip,
      emitent: form.emitent.toUpperCase(),
      continut: form.continut,
      creat_la: form.data,
      compartiment: form.compartiment.toUpperCase(),
      data_expediere: form.data_expediere || null,
      destinatar: form.destinatar.toUpperCase(),
      nr_conex: form.nr_conex || null,
      indicativ_dosar: form.indicativ.toUpperCase(),
      anul: 2026
    };

    let result;
    if (editingId) {
      result = await supabase.from('documente').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('documente').insert([payload]).select();
    }
    
    if (result.error) alert("Eroare: " + result.error.message);
    else {
      if (!editingId && result.data) setNumarGenerat(result.data[0].numar_inregistrare);
      fetchDocs();
      if (editingId) setShowForm(false);
      else setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      
      setEditingId(null);
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3.5rem] w-full max-w-md text-center border border-white/20 shadow-2xl animate-in zoom-in duration-500">
          <ShieldCheck className="mx-auto mb-6 text-blue-400" size={60} />
          <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tighter">Registru Digital</h2>
          <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest mb-8">Liceul Teoretic Teiuș</p>
          <input type="password" placeholder="Parola de acces" autoFocus className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center text-white mb-6 outline-none font-bold focus:border-blue-500 transition-all" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-blue-500 transition-all">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-4 md:p-6 font-sans">
      <div className="max-w-[1750px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-6 bg-white p-6 rounded-[2.5rem] shadow-xl border border-white/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg"><BookOpen size={28} /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-tighter leading-none">Registru <span className="text-blue-600">Intrări-Ieșiri</span></h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Liceul Teoretic Teiuș • 2026</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"><FileSpreadsheet size={16} /> Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-500 p-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={18} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTip(t); setEditingId(null); setShowForm(true); }} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center justify-between">
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${t === 'intrare' ? 'bg-emerald-100 text-emerald-600' : t === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}><Plus size={20} /></div>
                <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Înregistrare {t}</h3>
              </div>
              <div className="text-slate-100 group-hover:text-slate-200 transition-colors"><Plus size={40} strokeWidth={4} /></div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1600px]">
              <thead className="text-[9px] uppercase text-slate-400 font-black bg-slate-50/80 border-b">
                <tr>
                  <th className="px-6 py-4 w-28 text-blue-600">Nr. Înreg.</th>
                  <th className="px-6 py-4 w-28">Data</th>
                  <th className="px-6 py-4 w-52">Emitent</th>
                  <th className="px-6 py-4 w-80">Conținut Document</th>
                  <th className="px-6 py-4 w-40 text-center">Compartiment</th>
                  <th className="px-6 py-4 w-32 text-center">Data Exped.</th>
                  <th className="px-6 py-4 w-52">Destinatar</th>
                  <th className="px-6 py-4 w-24 text-center">Conex</th>
                  <th className="px-6 py-4 w-32 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {documente.filter(d => 
                  (d.emitent || '').toLowerCase().includes(search.toLowerCase()) || 
                  (d.continut || '').toLowerCase().includes(search.toLowerCase())
                ).map((doc) => (
                  <tr
