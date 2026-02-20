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
    destinatar: '',
    nr_conex: '',
    indicativ: ''
  });

  const fetchDocs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
      if (error) throw error;
      setDocumente(data || []);
    } catch (err) {
      console.error("Eroare la încărcare:", err.message);
    }
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pass === 'liceuteius2026') setIsAuth(true);
    else alert('Parolă incorectă!');
  };

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document || 'intrare');
    setForm({
      data: doc.creat_la || '',
      emitent: doc.emitent || '',
      continut: doc.continut || '',
      compartiment: doc.compartiment || '',
      destinatar: doc.destinatar || '',
      nr_conex: doc.nr_conex || '',
      indicativ: doc.indicativ_dosar || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
    const payload = {
      tip_document: tip,
      emitent: (form.emitent || '').toUpperCase(),
      continut: form.continut || '',
      creat_la: form.data,
      compartiment: (form.compartiment || '').toUpperCase(),
      destinatar: (form.destinatar || '').toUpperCase(),
      nr_conex: form.nr_conex || null,
      indicativ_dosar: (form.indicativ || '').toUpperCase(),
      anul: 2026
    };

    try {
      let result;
      if (editingId) {
        result = await supabase.from('documente').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('documente').insert([payload]).select();
      }
      
      if (result.error) throw result.error;

      if (!editingId && result.data) setNumarGenerat(result.data[0].numar_inregistrare);
      fetchDocs();
      
      if (editingId) {
        setShowForm(false);
        setEditingId(null);
      } else {
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      }

      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare: Asigură-te că ai adăugat coloanele în Supabase! " + err.message);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nr;Data;Tip;Emitent;Continut;Compartiment;Destinatar;Conex\n"
      + documente.map(d => `${d.numar_inregistrare};${d.creat_la};${d.tip_document};${d.emitent};${d.continut};${d.compartiment};${d.destinatar};${d.nr_conex}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Registru_Teius_2026.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-900">
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6"><BookOpen size={40} /></div>
          <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter">Registru Digital</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-8">Liceul Teoretic Teiuș</p>
          <input type="password" placeholder="Parola" autoFocus className="w-full p-5 bg-slate-50 border rounded-2xl text-center mb-4 font-bold focus:border-blue-500 outline-none transition-all" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-blue-700 transition-all">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-[1800px] mx-auto">
        <header className="bg-white p-6 rounded-[3rem] shadow-sm border border-white mb-8 flex justify-between items-center px-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><BookOpen size={24} /></div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Registru <span className="text-blue-600">Digital</span></h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest leading-none">Liceul Teoretic Teiuș • 2026</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[9px] uppercase hover:text-red-500 transition-all">Ieșire</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { id: 'intrare', label: 'INTRARE', color: 'bg-emerald-500' },
            { id: 'iesire', label: 'IESIRE', color: 'bg-blue-500' },
            { id: 'rezervat', label: 'REZERVAT', color: 'bg-orange-500' }
          ].map((item) => (
            <button key={item.id} onClick={() => { setTip(item.id); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all text-left flex flex-col gap-4 group">
              <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}><Plus size={24} strokeWidth={3} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{item.label}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Înregistrare nouă</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center flex-wrap gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none" onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={handleExport} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all"><FileSpreadsheet size={16} /> Salvare Date</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1400px]">
              <thead className="text-[9px] uppercase text-slate-400 font-black bg-slate-50/50 border-b">
                <tr>
                  <th className="px-8 py-4 w-24">Tip</th>
                  <th className="px-8 py-4 w-24 text-blue-600">Nr.</th>
                  <th className="px-8 py-4 w-32">Data</th>
                  <th className="px-8 py-4 w-52">Emitent</th>
                  <th className="px-8 py-4 w-80">Conținut</th>
                  <th className="px-8 py-4 w-36 text-center">Comp.</th>
                  <th className="px-8 py-4 w-52">Destinatar</th>
                  <th className="px-8 py-4 w-28 text-center">Conex</th>
                  <th className="px-8 py-4 w-28 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {documente.filter(d => (d.emitent || '').toLowerCase().includes(search.toLowerCase()) || (d.continut || '').toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-3">
                      <span className={`px-2 py-1 rounded-md text-[8px] ${doc.tip_document === 'iesire' ? 'bg-blue-100 text-blue-600' : doc.tip_document === 'rezervat' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {doc.tip_document || 'intrare'}
                      </span>
                    </td>
                    <td className="px-8 py-3 font-black text-blue-600 text-xs">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-3 text-slate-400">{doc.creat_la}</td>
                    <td className="px-8 py-3 text-slate-700 truncate">{doc.emitent}</td>
                    <td className="px-8 py-3 text-slate-500 normal-case italic truncate">{doc.continut}</td>
                    <td className="px-8 py-3 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[8px]">{doc.compartiment || '-'}</span></td>
                    <td className="px-8 py-3 text-slate-700 truncate">{doc.destinatar || '-'}</td>
                    <td className="px-8 py-3 text-center text-blue-600">{doc.nr_conex || '-'}</td>
                    <td className="px-8 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
                        <button onClick={async () => {if(confirm('Ștergeți?')) {await supabase.from('documente').delete().eq('id', doc.id); fetchDocs();}}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-4xl shadow-2xl relative my-8">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-slate-800">{editingId ? 'Editare' : 'Înregistrare'}</h2>
                    <div className="flex gap-2 mt-2">
                      {['intrare', 'iesire', 'rezervat'].map(t => (
                        <button key={t} onClick={() => setTip(t)} className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase transition-all ${tip === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="bg-slate-50 p-3 rounded-2xl text-slate-300 hover:text-red-500 transition-all"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Data Document</span>
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Emitent</span>
                      <input type="text" placeholder="Emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Conținut pe scurt</span>
                      <textarea placeholder="Descriere..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs h-32 outline-none resize-none focus:border-blue-500" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Compartiment</span>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} onClick={() => setForm({...form, compartiment: v})} className={`text-[8px] px-3 py-2 rounded-xl font-black transition-all ${form.compartiment === v ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Scrie compartimentul..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500" />
                    </div>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Destinatar</span>
                      <input type="text" placeholder="Către cine..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label><span className="text-[10px] font-black uppercase text-blue-600 mb-1 block">Nr. Conex</span><input type="text" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-blue-50 border border-blue-100 p-4 rounded-2xl font-bold text-xs outline-
