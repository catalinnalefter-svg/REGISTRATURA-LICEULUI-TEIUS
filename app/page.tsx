'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [tipDocument, setTipDocument] = useState('intrare');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  const fetchDocumente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDocumente();
  }, [isAuthenticated, fetchDocumente]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'liceuteius2026') setIsAuthenticated(true);
    else alert("Parolă incorectă!");
  };

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Completați toate câmpurile!");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && editId) {
        await supabase.from('documente').update({
          tip_document: tipDocument,
          emitent: formData.expeditor,
          continut: formData.continut,
          creat_la: formData.data
        }).eq('id', editId);
      } else {
        const { data } = await supabase.from('documente').insert([{ 
          tip_document: tipDocument, emitent: formData.expeditor, 
          continut: formData.continut, creat_la: formData.data, anul: 2026
        }]).select();
        if (data?.[0]) setNumarGenerat(data[0].numar_inregistrare);
      }
      await fetchDocumente();
      if (!isEditing) {
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 2500);
      } else { setShowForm(false); setIsEditing(false); }
      setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Icons.ShieldCheck className="text-white" size={40} />
          </div>
          <h2 className="text-white text-3xl font-black mb-2 tracking-tight uppercase">Securitate</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium">Liceul Teoretic Teiuș • 2026</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="Parola de acces" 
              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center outline-none focus:border-blue-500 text-white font-bold transition-all placeholder:text-slate-600"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-blue-900/20">Autorizare</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 md:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-12 bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
              <Icons.School size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-800">Registru <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Liceul Teoretic Teiuș • Sesiune Activă</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="group flex items-center gap-3 text-xs font-black text-slate-400 hover:text-red-500 transition-all px-8 py-4 bg-slate-100/50 rounded-2xl border border-transparent hover:border-red-100">
            <Icons.Power size={18} className="group-hover:rotate-90 transition-transform" /> IEȘIRE SISTEM
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { id: 'intrare', color: 'emerald', label: 'Intrare', icon: <Icons.ArrowDownLeft /> },
            { id: 'iesire', color: 'blue', label: 'Ieșire', icon: <Icons.ArrowUpRight /> },
            { id: 'rezervat', color: 'amber', label: 'Rezervare', icon: <Icons.Hash /> }
          ].map((t) => (
            <button key={t.id} onClick={() => { setTipDocument(t.id); setIsEditing(false); setNumarGenerat(null); setShowForm(true); }} 
              className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group border border-white relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${t.color}-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-lg shadow-${t.color}-100 ${t.id === 'intrare' ? 'bg-emerald-500 text-white' : t.id === 'iesire' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                {t.icon}
              </div>
              <h3 className="font-black text-2xl text-slate-800 mb-1">{t.label}</h3>
              <p className="text-slate-400 text-sm font-medium">Click pentru înregistrare nouă</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="p-10 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <button onClick={() => {
                  const content = "\uFEFFNr;Data;Tip;Emitent;Continut\n" + documente.map(d => `${d.numar_inregistrare};${d.creat_la};${d.tip_document};${d.emitent};${d.continut}`).join("\n");
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
                  link.download = `registru_2026.csv`;
                  link.click();
                }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200 uppercase">
                  <Icons.Download size={16} /> Export Document
                </button>
             </div>
             <div className="relative w-full md:w-80">
                <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Căutare rapidă..." className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead className="text-[11px] uppercase text-slate-400 font-black bg-slate-50/50 tracking-[0.15em]">
                <tr>
                  <th className="px-10 py-8 w-24">Nr</th>
                  <th className="px-10 py-8 w-40">Calendar</th>
                  <th className="px-10 py-8 w-32">Tip</th>
                  <th className="px-10 py-8 w-60">Corespondent</th>
                  <th className="px-10 py-8">Rezumat Conținut</th>
                  <th className="px-10 py-8 w-32 text-center">Opțiuni</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documente.filter(d => (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.numar_inregistrare?.toString() || "").includes(searchTerm)).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-8 font-black text-blue-600 text-lg italic">#{doc.numar_inregistrare}</td>
                    <td className="px-10 py-8 text-slate-500 font-bold">{doc.creat_la}</td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${doc.tip_document === 'intrare' ? 'bg-emerald-50 text-emerald-600' : doc.tip_document === 'iesire' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{doc.tip_document}</span>
                    </td>
                    <td className="px-10 py-8 font-black uppercase text-slate-700 truncate">{doc.emitent}</td>
                    <td className="px-10 py-8 text-slate-400 italic truncate">{doc.continut}</td>
                    <td className="px-10 py-8 text-center flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setEditId(doc.id); setTipDocument(doc.tip_document);
                        setFormData({ data: doc.creat_la, expeditor: doc.emitent, continut: doc.continut });
                        setIsEditing(true); setShowForm(true);
                      }} className="text-blue-500 hover:scale-125 transition-transform"><Icons.Edit3 size={18} /></button>
                      <button onClick={async () => { if(confirm('Elimini înregistrarea?')) { await supabase.from('documente').delete().eq('id', doc.id); fetchDocumente(); } }} className="text-red-400 hover:scale-125 transition-transform"><Icons.Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative border border-white">
            {!numarGenerat ? (
              <div className="space-y-8">
                <button onClick={() => { setShowForm(false); setIsEditing(false); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors"><Icons.X size={32} /></button>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">{isEditing ? 'Modificare' : 'Înregistrare'}</h2>
                  <p className="text-
