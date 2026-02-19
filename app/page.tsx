'use client';

// Forțăm randarea pe client pentru a evita eroarea de prerender de pe Vercel
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  const fetchDocumente = async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('nr_inregistrare', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) {
      console.error("Eroare:", err);
    }
  };

  useEffect(() => {
    fetchDocumente();
  }, []);

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documente')
        .insert([{ 
          tip_document: tipDocument, 
          expeditor_destinatar: formData.expeditor, 
          continut_pe_scurt: formData.continut,
          data_inregistrare: formData.data,
          anul: 2026
        }])
        .select();

      if (!error && data?.[0]) {
        setNumarGenerat(data[0].nr_inregistrare);
        await fetchDocumente();
        // Închidere automată după 1.5 secunde conform cerinței
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ ...formData, expeditor: '', continut: '' });
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border">
          <div className="p-3 bg-blue-600 rounded-xl text-white font-bold">LT</div>
          <h1 className="text-2xl font-bold">Registratura Liceului Teiuș</h1>
        </header>

        {/* Butoane Acțiuni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-emerald-500 p-8 rounded-3xl shadow-lg hover:brightness-105 flex flex-col gap-2 transition-all">
            <Icons.PlusCircle size={32} />
            <span className="text-lg font-bold">Adaugă Intrare</span>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-blue-600 p-8 rounded-3xl shadow-lg hover:brightness-105 flex flex-col gap-2 transition-all">
            <Icons.Send size={32} />
            <span className="text-lg font-bold">Adaugă Ieșire</span>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-orange-500 p-8 rounded-3xl shadow-lg hover:brightness-105 flex flex-col gap-2 transition-all">
            <Icons.Lock size={32} />
            <span className="text-lg font-bold">Rezervă Număr</span>
          </button>
        </div>

        {/* Tabel Documente */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
          <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Icons.List size={20} /> Registru General 2026
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 text-[11px] uppercase text-slate-500 font-bold">
                  <th className="p-4">Nr. Inreg</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Tip</th>
                  <th className="p-4">Nume / Instituție</th>
                  <th className="p-4">Conținut</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {documente.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-4 font-black text-blue-600">#{doc.nr_inregistrare}</td>
                    <td className="p-4">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                    <td className="p-4 uppercase text-[10px] font-bold tracking-tighter">
                      <span className={doc.tip_document === 'intrare' ? 'text-emerald-600' : 'text-blue-600'}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="p-4 font-bold uppercase">{doc.expeditor_destinatar}</td>
                    <td className="p-4 text-slate-500 italic">{doc.continut_pe_scurt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Formular */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative">
            {!numarGenerat && <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><Icons.X size={24}/></button>}
            
            {numarGenerat ? (
              <div className="text-center py-6 animate-pulse">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Salvat cu succes!</h2>
                <div className="text-6xl font-black text-blue-600 mt-4">#{numarGenerat}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-tight">Înregistrare {tipDocument}</h2>
                <div className="space-y-4">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-blue-500" />
                  <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-blue-500" />
                  <textarea placeholder="Descriere conținut" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-blue-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
                  {loading ? 'Se salvează...' : 'Finalizează Înregistrarea'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
