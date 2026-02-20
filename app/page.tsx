'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, Edit3, Trash2, X, Check } from 'lucide-react';
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
  const optiuniDestinatar = ["ISJ ALBA", "MINISTERUL EDUCATIEI", "PRIMARIA TEIUS", "PERSONAL"];
  const optiuniCompartiment = ["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"];

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
    else alert("Parola incorecta!");
  };

  const handleSave = async () => {
    if (!formData.emitent || !formData.continut) {
      alert("Completati campurile obligatorii!");
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-10 rounded-3xl w-full max-w-md text-center border border-slate-700 shadow-2xl">
          <ShieldCheck className="mx-auto mb-6 text-blue-500" size={48} />
          <h2 className="text-2xl font-bold mb-6 text-white uppercase">Acces Registru</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-center text-white outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl uppercase hover:bg-blue-500">Intra</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-xl font-black uppercase">Registru Liceul Teius</h1>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-slate-400 uppercase">Iesire</button>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTipDocument(t); setIsEditing(false); setNumarGenerat(null); setShowForm(true); }} className="bg-white p-6 rounded-2xl shadow-sm text-left border border-white hover:border-blue-500 transition-all">
              <Plus className="text-blue-500 mb-2" size={24} />
              <h3 className="font-bold uppercase text-sm">{t}</h3>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
          <div className
