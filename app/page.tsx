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
    if (passwordInput === 'liceuteius2026') {
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
      } else {
        setShowForm(false);
        setIsEditing(false);
      }
      setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Icons.ShieldCheck className="text-white" size={40} />
            </div>
            <h2 className="text-white text-3xl font-black mb-10 uppercase tracking-tighter">Acces Registru</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Introdu parola" 
                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center outline-none focus:border-blue-500 text-white font-bold"
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl uppercase text-xs tracking-[0.2em] hover:bg-blue-500 transition-all">Autentificare</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          <header className="flex flex-col lg:flex-row items-center justify-between mb-12 bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-sm border border-white gap-8">
            <div className="flex items-center gap-6 text-left w-full">
              <div className="w-20 h-20 bg-blue-600 rounded-[2.2rem] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
                <Icons.School size={40} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-800 tracking-tighter">Registru <span className="text-blue-600">Digital</span></h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Liceul Teoretic Teiuș</p>
              </div>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-xs font-black text-slate-400 hover:text-red-500 px-8 py-4 bg-slate-100/50 rounded-2xl transition-all uppercase shrink-0">Ieșire</button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {['intrare', 'iesire', 'rezervat'].map((t) => (
              <button key={t} onClick={() => { setTipDocument(t); setIsEditing(false); setNumarGenerat(null); setShowForm(true); }} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-white text-left group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${t === 'intrare' ? 'bg-emerald-500 text-white' : t === 'iesire' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                  <Icons.Plus size={24} />
                </div>
                <h3 className="font-black text-2xl text-slate-800 mb-1 uppercase tracking-tight">{t}</h3>
                <p className="text-slate-400 text-sm font-medium">Înregistrare nouă</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[4rem] shadow-xl border border-white overflow-hidden">
            <div className="p-10 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
              <button onClick={() => {
                const content = "\uFEFFNr;Data;Tip;Emitent;Continut\n" + documente.map(d => `${d.numar_inregistrare};${d.creat_la};${d.tip_document};${d.emitent};${d.continut}`).join("\n");
                const link = document.createElement("a");
                link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
                link.download = `registru_2026.csv`;
                link.click();
              }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all shadow-lg">Export CSV</button>
              <div className="relative w-full md:w-80">
                <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Caută..." className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none font-bold text-slate-900 focus:border-blue-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed min-w-[900px]">
                <thead className="text-[11px] uppercase text-slate-400 font-black bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-8 w-24">Nr</th>
                    <th className="px-10 py-8 w-40">Data</th>
                    <th className="px-10 py-8 w-32">Tip</th>
                    <th className="px-10 py-8 w-60">Corespondent</th>
                    <th className="px-10 py-8">Conținut</th>
                    <th className="px-10 py-8 w-32 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {documente.filter(d => (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.numar_inregistrare?.toString() || "").includes(searchTerm)).map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-10 py-8 font-black text-blue-600 text-lg italic">#{doc.numar_inregistrare}</td>
                      <td className="px-10 py-8 text-slate-500 font-bold">{doc.creat_la}</td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${doc.tip_document === 'intrare' ? 'bg-emerald-50 text-emerald-600' : doc.tip_document === 'iesire' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{doc.tip_document}</span>
                      </td>
                      <td className="px-10 py-8 font-black uppercase text-slate-700 truncate">{doc.emitent}</td>
                      <td className="px-10 py-8 text-slate-400 italic truncate font-medium">{doc.continut}</td>
                      <td className="px-10 py-8 text-center flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                          setEditId(doc.id); setTipDocument(doc.tip_document);
                          setFormData({ data: doc.creat_la, expeditor: doc.emitent, continut: doc.continut });
                          setIsEditing(true); setShowForm(true);
                        }} className="text-blue-500"><Icons.Edit3 size={18} /></button>
                        <button onClick={async () => { if(confirm('Ștergi?')) { await supabase.from('documente').delete().eq('id', doc.id); fetchDocumente(); } }} className="text-red-400"><Icons.Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white">
            {!numarGenerat ? (
              <div className="space-y-8">
                <button onClick={() => { setShowForm(false); setIsEditing(false); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600"><Icons.X size={32} /></button>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Înregistrare</h2>
                <div className="space-y-5">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold outline-none text-slate-900 focus:border-blue-500" />
                  <input type="text" placeholder="Emitent / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none font-bold text-slate-900 focus:border-blue-500" />
                  <textarea placeholder="Descriere document..." value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none font-bold text-slate-900 focus:border-blue-500 min-h-[120px]" />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? 'Procesare...' : 'Salvează'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200">
                  <Icons.Check size={50} strokeWidth={4} />
                </div>
                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">Număr Generat</h2>
                <div className="text-[10rem] font-black text-blue-600 leading-none tracking-tighter">
                  {numarGenerat}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
