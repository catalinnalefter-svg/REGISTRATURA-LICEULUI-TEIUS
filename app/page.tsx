'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  // --- CONFIGURARE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const CORECT_PASSWORD = 'liceuteius2026'; 

  // --- STĂRI ---
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

  // --- LOGICĂ DATE ---
  const fetchDocumente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) {
      console.error("Eroare:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDocumente();
  }, [isAuthenticated, fetchDocumente]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORECT_PASSWORD) setIsAuthenticated(true);
    else alert("Parolă incorectă!");
  };

  const startEdit = (doc: any) => {
    setEditId(doc.id);
    setTipDocument(doc.tip_document);
    setFormData({
      data: doc.creat_la || new Date().toISOString().split('T')[0],
      expeditor: doc.emitent,
      continut: doc.continut
    });
    setIsEditing(true);
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
      alert('Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nr: any) => {
    if (confirm(`Ștergi definitiv înregistrarea #${nr}?`)) {
      const { error } = await supabase.from('documente').delete().eq('id', id);
      if (!error) fetchDocumente();
    }
  };

  const exportToCSV = () => {
    const headers = ["Nr. Inregistrare", "Data", "Tip", "Emitent", "Continut"];
    const rows = documente.map(doc => [
      `"${doc.numar_inregistrare}"`, `"${doc.creat_la}"`, `"${doc.tip_document}"`, `"${doc.emitent}"`, `"${doc.continut}"`
    ]);
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registru_liceu_teius_2026.csv`;
    link.click();
  };

  const documenteFiltrate = documente.filter(d => 
    (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.continut || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.numar_inregistrare?.toString() || "").includes(searchTerm)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8 ring-8 ring-slate-50">
            <Icons.School size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight uppercase">Acces Registru</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium italic">Liceul Teoretic Teiuș</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="Introduceți parola"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-center transition-all"
              value={
