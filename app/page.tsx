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
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDocumente();
  }, [isAuthenticated, fetchDocumente]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'liceuteius2026') setIsAuthenticated(true);
    else alert("Parolă incorectă!");
  };

  const startEdit = (doc: any) => {
    setEditId(doc.id);
    setTipDocument(doc.tip_document);
    setFormData({
      data: doc.creat_la || new Date().toISOString().split('T')[0],
      expeditor: doc.emitent || '',
      continut: doc.continut || ''
    });
    setIsEditing(true);
    setNumarGenerat(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Completați toate câmpurile!");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && editId) {
        const { error } = await supabase
          .from('documente')
          .update({
            tip_document: tipDocument,
            emitent: formData.expeditor,
            continut: formData.continut,
            creat_la: formData.data
          })
          .eq('id', editId);
        if (error) throw error;
        await fetchDocumente();
        setShowForm(false);
        setIsEditing(false);
      } else {
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
          }, 3000);
        }
      }
      setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Nr", "Data", "Tip", "Emitent", "Continut"];
    const rows = documente.map(d => [d.numar_inregistrare, d.creat_la, d.tip_document, d.emitent, d.continut]);
    const content = "\uFEFF" + headers.join(";") + "\n" + rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registru_2026.csv`;
    link.click();
  };

  const filtered = documente.filter(d => 
    (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.continut || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.numar_inregistrare?.toString() || "").includes(searchTerm)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icons.School className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-black mb-6 uppercase">Registru Teiuș</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="Parola" 
              className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-center outline-none focus:border-indigo-500 font-bold"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl uppercase text-xs tracking-widest">Conectare</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <Icons.School size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Registru <span className="text-indigo-600">Intrare-Ieșire</span></h1>
              <p className="text-slate-400 font-bold text-xs uppercase">Liceul Teoretic Teiuș • 2026</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-red-500 px-6 py-3 bg-red-50 rounded-xl">IEȘIRE</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
