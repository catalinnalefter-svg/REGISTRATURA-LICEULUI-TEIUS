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
          <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight uppercase">Acces Registru</h1>
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
                Registru <span className="text-indigo-600">Intrare-Ieșire</span>
              </h1>
              <p className="text-slate-400 font-bold flex items-center gap-2 text-sm tracking-wide">
                <Icons.MapPin size={14} className="text-indigo-400" /> LICEUL TEORETIC TEIUȘ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right mr-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status Sistem</p>
              <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> ACTIV / 2026
              </p>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
              <Icons.LogOut size={16} /> IEȘIRE
            </button>
          </div>
        </header>

        {/* BUTOANE ACȚIUNI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus /></div>
            <h3 className="font-bold text-lg">Intrare</h3>
            <p className="text-sm text-slate-400">Documente primite</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus /></div>
            <h3 className="font-bold text-lg">Ieșire</h3>
            <p className="text-sm text-slate-400">Documente trimise</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-orange-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Hash /></div>
            <h3 className="font-bold text-lg">Rezervă</h3>
            <p className="text-sm text-slate-400">Blocare număr</p>
          </button>
        </div>

        {/* TABEL REGISTRU */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="font-black text-slate-700 flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
              <Icons.List size={16} className="text-indigo-600" /> Jurnal Înregistrări
            </h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={exportToCSV} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <Icons.Download size={14} /> EXPORT EXCEL
              </button>
              <div className="relative flex-1 md:w-64">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Caută în registru..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 ring-indigo-50/50 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-400 font-black border-b bg-slate-50/30 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Nr. Crt</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Tip</th>
                  <th className="px-8 py-5">Emitent/Destinatar</th>
                  <th className="px-8 py-5">Conținut Document</th>
                  <th className="px-8 py-5 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documenteFiltrate.map((doc) => (
                  <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 font-black text-indigo-600 text-lg italic">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-5 font-medium text-slate-600">{doc.creat_la ? new Date(doc.creat_la).toLocaleDateString('ro-RO') : '---'}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        doc.tip_document === 'intrare' ? 'bg-emerald-100 text-emerald-700' : 
                        doc.tip_document === 'iesire' ? 'bg-blue-100 text-blue-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold uppercase text-slate-800">{doc.emitent}</td>
                    <td className="px-8 py-5 text-slate-500 leading-relaxed max-w-xs truncate">{doc.continut}</td>
                    <td className="px-8 py-5 text-center">
                      <button onClick={() => handleDelete(doc.id, doc.numar_inregistrare)} className="text-slate-200 hover:text-red-500 p-2 transition-all transform hover:scale-120">
                        <Icons.Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAR */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative border border-white/20">
            {!numarGenerat ? (
              <div className="space-y-6">
                <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"><Icons.X size={28} /></button>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Înregistrare Nouă</h2>
                  <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Tip: {tipDocument}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data Înscrierii</label>
                    <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <input type="text" placeholder="Emitent (Cine trimite?)" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium" />
                  <textarea placeholder="Descriere scurtă document..." value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:bg-slate-300 uppercase tracking-widest text-sm">
                  {loading ? 'Se procesează...' : 'Alocă Număr Înregistrare'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Icons.CheckCircle size={56} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Alocat cu succes!</h2>
                <p className="text-slate-400 text-sm mb-6">Numărul oficial este:</p>
                <div className="text-8xl font-black text-indigo-600 mb-2 drop-shadow-sm tracking-tighter">#{numarGenerat}</div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">Registrul 2026</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
