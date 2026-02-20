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
      emitent: doc.emitent || '',
      continut: doc.continut || '',
      compartiment: doc.compartiment || '',
      data_expediere: doc.data_expediere || '',
      destinatar: doc.destinatar || '',
      nr_conex: doc.nr_conex || '',
      indicativ: doc.indicativ_dosar || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Ștergeți definitiv această înregistrare?')) {
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
    
    if (result.error) {
      alert("Eroare: " + result.error.message);
    } else {
      if (!editingId && result.data) setNumarGenerat(result.data[0].numar_inregistrare);
      fetchDocs();
      if (editingId) {
        setShowForm(false);
        setEditingId(null);
      } else {
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      }
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <ShieldCheck className="mx-auto mb-4 text-blue-400" size={50} />
          <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-tighter">Registru Digital</h2>
          <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest mb-8">Liceul Teoretic Teiuș</p>
          <input type="password" placeholder="Parola" autoFocus className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-white mb-4 outline-none font-bold focus:border-blue-500 transition-all" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-blue-500 transition-all">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-3 md:p-6 font-sans">
      <div className="max-w-[1800px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-4 bg-white p-5 rounded-[2rem] shadow-lg border border-white/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BookOpen size={24} /></div>
            <div>
              <h1 className="text-xl font-black uppercase text-slate-800 tracking-tighter leading-none">Registru <span className="text-blue-600">Intrări-Ieșiri</span></h1>
              <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mt-1">Liceul Teoretic Teiuș</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all"><FileSpreadsheet size={14} /> Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-500 p-2.5 rounded-xl hover:text-red-500 transition-all"><LogOut size={16} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTip(t); setEditingId(null); setShowForm(true); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t === 'intrare' ? 'bg-emerald-100 text-emerald-600' : t === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}><Plus size={18} /></div>
                <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Nou {t}</h3>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
