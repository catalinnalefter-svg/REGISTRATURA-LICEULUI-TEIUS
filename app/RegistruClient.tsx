'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, Edit3, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [documente, setDocumente] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [tip, setTip] = useState('intrare');
  const [search, setSearch] = useState('');

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
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });
      if (error) throw error;
      if (data) setDocumente(data);
    } catch (err: any) {
      console.error("Eroare la incarcare:", err.message);
    }
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleExport = () => {
    const header = `<tr><th>Nr. Inreg.</th><th>Data</th><th>Emitent</th><th>Continut</th><th>Compartiment</th><th>Data Expediere</th><th>Destinatar</th><th>Nr. Conex</th><th>Indicativ Dosar</th></tr>`;
    const rows = documente.map(d => `
      <tr>
        <td>${d.numar_inregistrare}</td>
        <td>${d.creat_la}</td>
        <td>${d.emitent || ''}</td>
        <td>${d.continut || ''}</td>
        <td>${d.compartiment || ''}</td>
        <td>${d.data_expediere || ''}</td>
        <td>${d.destinatar || ''}</td>
        <td>${d.nr_conex || ''}</td>
        <td>${d.indicativ_dosar || ''}</td>
      </tr>`).join('');
    
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">${header}${rows}</table></body></html>`;
    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(template)));
    link.download = `Registru_Liceu_Teius_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Eroare: Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.from('documente').insert([{
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
      }]).select();
      
      if (error) {
        alert("Eroare Baza de Date: " + error.message);
        console.error(error);
      } else if (data && data[0]) {
        setNumarGenerat(data[0].numar_inregistrare);
        await fetchDocs();
        setTimeout(() => { 
          setShowForm(false); 
          setNumarGenerat(null); 
          setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''}); 
        }, 3000);
      }
    } catch (err: any) {
      alert("Eroare neprevăzută: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <ShieldCheck className="mx-auto mb-6" size={50} />
          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Acces Registru</h2>
          <input type="password" placeholder="Introdu Parola" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center mb-6 outline-none focus:border-blue-500 transition-all font-bold" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button onClick={() => pass === 'liceuteius2026' ? setIsAuth(true) : alert('Parolă incorectă!')} className="w-full bg-blue-600 font-bold py-5 rounded-2xl uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg">Autentificare</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200"><BookOpen size={30} /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-slate-800 tracking-tighter">Registru <span className="text-blue-600">Liceul Teiuș</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Platformă Gestiune • 2026</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={handleExport} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"><FileSpreadsheet size={16} /> Export Excel</button>
            <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 px-8 py-4 bg-white border border-slate-200 rounded-2xl uppercase hover:text-red-500 transition-all shadow-sm">Ieșire</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((
