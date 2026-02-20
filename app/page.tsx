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
    emitent: '',
    continut: '',
    compartiment: '',
    data_expediere: '',
    destinatar: '',
    nr_conex: '',
    indicativ_dosar: ''
  });

  const optiuniEmitent = ["DIN OFICIU", "MINISTERUL EDUCATIEI", "ISJ ALBA", "PRIMARIA TEIUS"];

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

  const exportToExcel = () => {
    const header = `<tr><th>Nr. Inregistrare</th><th>Data</th><th>Emitent</th><th>Continut</th><th>Compartiment</th><th>Data Expediere</th><th>Destinatar</th><th>Nr. Conex</th><th>Indicativ</th></tr>`;
    const rows = documente.map(d => `<tr><td>${d.numar_inregistrare}</td><td>${d.creat_la}</td><td>${d.emitent || ''}</td><td>${d.continut || ''}</td><td>${d.compartiment || ''}</td><td>${d.data_expediere || ''}</td><td>${d.destinatar || ''}</td><td>${d.nr_conex || ''}</td><td>${d.indicativ_dosar || ''}</td></tr>`).join('');
    const table = `<table>${header}${rows}</table>`;
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(template)));
    link.download = `registru_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!formData.emitent || !formData.continut) {
      alert("Completati Emitent si Continut!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        tip_document: tipDocument, emitent: formData.emitent, continut: formData.continut,
        creat_la: formData.data, compartiment: formData.compartiment, data_expediere: formData.data_expediere,
        destinatar: formData.destinatar, nr_conex: formData.nr_conex, indicativ_dosar: formData.indicativ_dosar, anul: 2026
      };
      if (isEditing && editId) {
        await supabase.from('documente').update(payload).eq('id', editId);
      } else {
        const { data } = await supabase.from('documente').insert([payload]).select();
        if (data?.[0]) setNumarGenerat(data[0].numar_inregistrare);
      }
      await fetchDocumente();
      if (!isEditing) {
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      } else { setShowForm(false); setIsEditing(false); }
      setFormData({ data: new Date().toISOString().split('T')[0], emitent: '', continut: '', compartiment: '', data_expediere: '', destinatar: '', nr_conex: '', indicativ_dosar: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white"><Icons.ShieldCheck size={40} /></div>
          <h2 className="text-white text-3xl font-black mb-10 uppercase tracking-tighter">Acces Registru</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Parola" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center outline-none text-white font-bold" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl uppercase text-xs tracking-widest">Autentificare</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white gap-6">
          <div className="flex items-center gap-6 w-full">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0"><Icons.BookOpen size={30} /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-slate-800 tracking-tighter">Registru <span className="text-blue-600">Liceul Teiuș</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest text-left">Gestiune Documente • 2026</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Icons.FileSpreadsheet size={16} /> Excel</button>
            <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-black text-slate-400 px-6 py-3 bg-slate-100 rounded-xl uppercase">Ieșire</button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTipDocument(t); setIsEditing(false); setNumarGenerat(null); setShowForm(true); }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white text-left group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${t === 'intrare' ? 'bg-emerald-500 text-white' : t === 'iesire' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}><Icons.Plus size={20} /></div>
              <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{t}</h3>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b">
            <div className="relative w-full max-w-md">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1400px]">
              <thead className="text-[10px] uppercase text-slate-400 font-black bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 w-32 text-blue-600">Nr. Înreg.</th>
                  <th className="px-6 py-4 w-28">Data</th>
                  <th className="px-6 py-4 w-48">Emitent</th>
                  <th className="px-6 py-4 w-64">Conținut pe scurt</th>
                  <th className="px-6 py-4 w-32">Compartiment</th>
                  <th className="px-6 py-4 w-28">Expediere</th>
                  <th className="px-6 py-4 w-40">Destinatar</th>
                  <th className="px-6 py-4 w-28 text-center">Nr. Conex</th>
                  <th className="px-6 py-4 w-28 text-center">Indicativ</th>
                  <th className="px-6 py-4 w-24 text-center">Opțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-slate-100">
                {documente.filter(d => (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.continut || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.numar_inregistrare?.toString() || "").includes(searchTerm)).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-6 py-4 font
