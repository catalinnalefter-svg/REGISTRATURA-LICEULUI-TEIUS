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

  // ECRANUL DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Icons.ShieldCheck className="text-white" size={40} />
          </div>
          <h2 className="text-white text-3xl font-black mb-2 tracking-tight uppercase">Securitate</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium">Liceul Teoretic Teiuș • 2026</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="Parola de acces" 
              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center outline-none focus:border-blue-500 text-white font-bold transition-all"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all">Autorizare</button>
          </form>
        </div>
      </div>
    );
  }

  // ECRANUL PRINCIPAL
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-12 bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-sm border border-white gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-[2.2rem] flex items-center justify-center text-white">
              <Icons.School size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4
