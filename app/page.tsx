'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ expeditor: '', continut: '' });

  const fetchDocumente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('creat_la', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchDocumente(); }, [fetchDocumente]);

  const handleDelete = async (id: string, nr: any) => {
    if (!id) return alert("Eroare: ID invalid.");
    if (confirm(`Ștergi înregistrarea #${nr || ''}?`)) {
      const { error } = await supabase.from('documente').delete().eq('id', id);
      if (error) alert("Eroare: " + error.message);
      else fetchDocumente();
    }
  };

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) return alert("Completați toate câmpurile!");
    setLoading(true);
    try {
      // Încercăm să salvăm folosind structura vizibilă în baza ta de date
      const { data, error } = await supabase
        .from('documente')
        .insert([{ 
          tip_document: tipDocument, 
          emitent: formData.expeditor, 
          continut_pe_scurt: formData.continut,
          anul: 2026
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setNumarGenerat(data[0].numar_inregistrare);
        fetchDocumente();
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ expeditor: '', continut: '' });
        }, 2000);
      }
    } catch (err: any) {
      alert('Atenție: ' + err.message + '\n\nVerifică dacă numele coloanei în Supabase este exact "emitent".');
    } finally {
      setLoading(false);
    }
  };

  const documenteFiltrate = documente.filter(doc => 
    (doc.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.continut_pe_scurt || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">LT</div>
            <h1 className="text-xl font-bold text-slate-800">Registratura Liceului Teiuș</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">An 2026</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['intrare', 'iesire', 'rezervat'].map((tip) => (
            <button key={tip} onClick={() => { setTipDocument(tip); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 shadow-sm transition-all text-left group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
              <h3 className="font-bold text-lg capitalize">{tip}</h3>
              <p className="text-sm text-slate-400">Adaugă înregistrare</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center gap-4 bg-slate-50/50">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest"><Icons.List size={16} /> Registru</h2>
            <div className="relative w-full md:w-64">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b">
                  <th className="px-6 py-4">Nr.</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Emitent</th>
                  <th className="px-6 py-4">Continut</th>
                  <th className="px-6 py-4 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {documenteFiltrate.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-indigo-600">{doc.numar_inregistrare ? `#${doc.numar_inregistrare}` : '---'}</td>
                    <td className="px-6 py-4">{doc.creat_la ? new Date(doc.creat_la).toLocaleDateString('ro-RO') : '---'}</td>
                    <td className="px-6 py-4 capitalize font-medium">{doc.tip_document}</td>
                    <td className="px-6 py-4 font-bold">{doc.emitent || '---'}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{doc.continut_pe_scurt}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(doc.id, doc.numar_inregistrare)} className="text-slate-300 hover:text-red-500 p-2"><Icons.Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            {!numarGenerat && <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icons.X size={24} /></button>}
            {numarGenerat ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold">Succes!</h2>
                <div className="text-6xl font-black text-indigo-600 mt-4 italic">#{numarGenerat}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-tighter text-indigo-600">Nouă {tipDocument}</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500" />
                  <textarea placeholder="Conținut scurt" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50">
                  {loading ? 'Se salvează...' : 'Finalizează'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
