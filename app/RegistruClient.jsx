'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Plus, Search, X, Check, Edit3 } from 'lucide-react'; 
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

  const formatRoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}-${m}-${y}`;
    } catch { return dateStr; }
  };

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
        // Lăsăm baza de date să genereze automat numar_inregistrare pentru a evita eroarea
        const { data, error } = await supabase.from('documente').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]) setNumarGenerat(data[0].numar_inregistrare);
      }
      
      fetchDocs();
      if (editingId) setShowForm(false);
      else setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelCompatibil = () => {
    const headers = ["Nr. Inreg", "Data", "Tip", "Emitent", "Continut", "Compartiment", "Destinatar", "Data Expediere", "Nr. Conex", "Indicativ"];
    const rows = documente.map(d => [
      d.numar_inregistrare, formatRoDate(d.creat_la), d.tip_document, d.emitent, 
      `"${d.continut?.replace(/"/g, '""')}"`, d.compartiment, d.destinatar, formatRoDate(d.data_expediere), d.nr_conex, d.indicativ_dosar
    ]);

    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Registru_Teius_2026.csv`;
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceulteius2026') setIsAuth(true); else alert('Parolă incorectă!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">ACCES REGISTRU</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-1
