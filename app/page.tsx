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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Icons.School size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-8 uppercase">Acces Registru</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="Parolă"
              className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-center outline-none focus:border-indigo-500 font-bold"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 uppercase tracking-widest transition-all">Conectare</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icons.School size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Registru <span className="text-indigo-600">Teiuș</span></h1>
              <p className="text-slate-400 font-bold text-xs uppercase">Anul Scolar 2026</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all">IEȘIRE</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['intrare', 'iesire', 'rezervat'].map((tip) => (
            <button key={tip} onClick={() => { setTipDocument(tip); setIsEditing(false); setNumarGenerat(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm text-left hover:ring-2 ring-indigo-500 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tip === 'intrare' ? 'bg-emerald-100 text-emerald-600' : tip === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                <Icons.Plus size={20} />
              </div>
              <h3 className="font-bold text-lg capitalize">{tip}</h3>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută..." className="w-full pl-12 pr-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-400 font-black border-b bg-slate-50/30">
                <tr>
                  <th className="px-8 py-5">Nr</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Tip</th>
                  <th className="px-8 py-5">Emitent</th>
                  <th className="px-8 py-5">Conținut</th>
                  <th className="px-8 py-5 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documente.filter(d => (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-indigo-600">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-5">{doc.creat_la ? new Date(doc.creat_la).toLocaleDateString('ro-RO') : '---'}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${doc.tip_document === 'intrare' ? 'bg-emerald-100 text-emerald-700' : doc.tip_document === 'iesire' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{doc.tip_document}</span>
                    </td>
                    <td className="px-8 py-5 font-bold uppercase">{doc.emitent}</td>
                    <td className="px-8 py-5 text-slate-500 truncate max-w-xs">{doc.continut}</td>
                    <td className="px-8 py-5 text-center flex justify-center gap-2">
                      <button onClick={() => startEdit(doc)} className="text-slate-300 hover:text-indigo-600 p-2"><Icons.Edit3 size={18} /></button>
                      <button onClick={async () => { if(confirm('Ștergi?')) { await supabase.from('documente').delete().eq('id', doc.id); fetchDocumente(); } }} className="text-slate-300 hover:text-red-500 p-2"><Icons.Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            {!numarGenerat ? (
              <div className="space-y-6">
                <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300"><Icons.X size={28} /></button>
                <h2 className="text-2xl font-black uppercase">{isEditing ? 'Editează' : 'Nou'}</h2>
                <div className="flex gap-2">
                  {['intrare', 'iesire', 'rezervat'].map((t) => (
                    <button key={t} onClick={() => setTipDocument(t)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${tipDocument === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>{t}</button>
                  ))}
                </div>
                <div className="space-y-4">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border-2 p-4 rounded-2xl font-bold outline-none focus:border-indigo-500" />
                  <input type="text" placeholder="Emitent" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border-2 p-4 rounded-2xl outline-none focus:border-indigo-500" />
                  <textarea placeholder="Conținut" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border-2 p-4 rounded-2xl outline-none focus:border-indigo-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 uppercase tracking-widest text-sm disabled:bg-slate-300">
                  {loading ? '...' : isEditing ? 'Actualizează' : 'Înregistrează'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.CheckCircle size={44} /></div>
                <h2 className="text-2xl font-black uppercase">Număr Alocat</h2>
                <div className="text-8xl font-black text-indigo-600">#{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
