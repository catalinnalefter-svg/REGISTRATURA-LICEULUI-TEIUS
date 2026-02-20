'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  // --- SECȚIUNE AUTENTIFICARE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const CORECT_PASSWORD = 'liceuteius2026'; 

  // --- STĂRI APLICAȚIE ---
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  // --- LOGICĂ DATE ---
  const fetchDocumente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) {
      console.error("Eroare la încărcare:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocumente();
    }
  }, [isAuthenticated, fetchDocumente]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORECT_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Parolă incorectă!");
    }
  };

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Completați toate câmpurile!");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documente')
        .insert([{ 
          tip_document: tipDocument, 
          emitent: formData.expeditor, 
          continut: formData.continut,
          creat_la: formData.data,
          anul: 2026
        }])
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setNumarGenerat(data[0].numar_inregistrare);
        await fetchDocumente();
        
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
          setLoading(false);
        }, 3000);
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nr: any) => {
    if (!id || id === "undefined") return;
    if (confirm(`Ștergi definitiv înregistrarea #${nr || ''}?`)) {
      const { error } = await supabase.from('documente').delete().eq('id', id);
      if (error) alert("Eroare la ștergere: " + error.message);
      else await fetchDocumente();
    }
  };

  const exportToCSV = () => {
    const headers = ["Nr. Inregistrare", "Data", "Tip", "Emitent", "Continut"];
    const rows = documente.map(doc => [
      `"${doc.numar_inregistrare}"`,
      `"${doc.creat_la}"`,
      `"${doc.tip_document}"`,
      `"${doc.emitent}"`,
      `"${doc.continut}"`
    ]);

    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registru_liceu_teius_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const documenteFiltrate = documente.filter(d => 
    (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.continut || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.numar_inregistrare?.toString() || "").includes(searchTerm)
  );

  // --- RENDER LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8 ring-8 ring-slate-50">
            <Icons.School size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">ACCES REGISTRU</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium italic">Liceul Teoretic Teiuș</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Introduceți parola"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold text-center transition-all"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">
              Conectare Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN UI ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER OFICIAL */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-slate-50">
              <Icons.School size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase">
                Registru <span className="text-indigo
