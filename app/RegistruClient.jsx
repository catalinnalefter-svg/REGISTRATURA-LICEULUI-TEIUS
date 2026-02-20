'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3 } from 'lucide-react';
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
    try {
      const { data, error } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
      if (error) throw error;
      setDocumente(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document || 'intrare');
    setForm({
      data: doc.creat_la || '',
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

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
    try {
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

      if (editingId) {
        const { error } = await supabase.from('documente').update(payload).eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { data, error } = await supabase.from('documente').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]) setNumarGenerat(data[0].numar_inregistrare);
      }
      
      fetchDocs();
      if (editingId) setShowForm(false);
      else setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare la salvare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelCompatibil = () => {
    const headers = ["Nr. Inreg", "Data", "Tip", "Emitent", "Continut", "Compartiment", "Destinatar", "Data Expediere", "Nr. Conex", "Indicativ"];
    const rows = documente.map(d => [
      d.numar_inregistrare, d.creat_la, d.tip_document, d.emitent, 
      `"${d.continut?.replace(/"/g, '""')}"`, d.compartiment, d.destinatar, d.data_expediere, d.nr_conex, d.indicativ_dosar
    ]);

    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Registru_2026_Export.csv`;
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceuteius2026') setIsAuth(true); else alert('Greșit!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">REGISTRU DIGITAL</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-100 rounded-2xl mt-6 outline-none text-center font-bold" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl mt-4 font-black uppercase hover:bg-blue-700">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center mb-8 px-10 border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-14 h-14" alt="Logo" />
            <h1 className="text-xl font-black uppercase tracking-tighter">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
          </div>
          <div className="flex gap-4">
             <button onClick={exportToExcelCompatibil} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"><FileSpreadsheet size={16}/> Salvare Excel</button>
             <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500">Ieșire</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-
