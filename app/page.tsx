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
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  // Am izolat functia de incarcare pentru a fi refolosita usor
  const fetchDocumente = useCallback(async () => {
    console.log("Se incearca incarcarea datelor...");
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('nr_inregistrare', { ascending: false });
      
      if (error) {
        console.error("Eroare Supabase la citire:", error.message);
      } else {
        setDocumente(data || []);
      }
    } catch (err) {
      console.error("Eroare neasteptata la incarcare:", err);
    }
  }, []);

  useEffect(() => {
    fetchDocumente();
  }, [fetchDocumente]);

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Completati toate campurile!");
      return;
    }
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

      if (error) throw error;

      if (data && data[0]) {
        setNumarGenerat(data[0].nr_inregistrare);
        
        // Reincarcam imediat lista din baza de date
        await fetchDocumente();

        // Inchidem automat dupa 1.5 secunde conform cerintei
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ ...formData, expeditor: '', continut: '' });
        }, 1500);
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-100 italic">LT</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">REGISTRATURA ELECTRONICĂ</h1>
              <p className="text-xs font-bold text-indigo-500 tracking-[0.2em] uppercase">Liceul Teoretic Teiuș</p>
            </div>
          </div>
          <div className="bg-slate-100 px-5 py-2 rounded-xl text-sm font-black text-slate-500 border border-slate-200 uppercase">An 2026</div>
        </header>

        {/* Butoane Actiuni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 shadow-sm transition-all text-left group">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Icons.Plus size={28} /></div>
            <h3 className="font-black text-lg uppercase tracking-tight">Document Intrare</h3>
            <p className="text-sm text-slate-400 font-medium italic">Primite în instituție</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 shadow-sm transition-all text-left group">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Icons.Plus size={28} /></div>
            <h3 className="font-black text-lg uppercase tracking-tight">Document Ieșire</h3>
            <p className="text-sm text-slate-400 font-medium italic">Trimise din instituție</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-orange-500 shadow-sm transition-all text-left group">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Icons.Hash size={28} /></div>
            <h3 className="font-black text-lg uppercase tracking-tight">Rezervă Număr</h3>
            <p className="text-sm text-slate-400 font-medium italic">Blocare numere registru</p>
          </button>
        </div>

        {/* Lista Documente (Tabelul) */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-black text-slate-800 flex items-center gap-3 text-xl uppercase tracking-tighter">
              <Icons.List className="text-indigo-600" /> Registru General de Evidență
            </h2>
            <button onClick={fetchDocumente} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Icons.RefreshCw size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.1em] text-slate-400 font-black border-b bg-slate-50/30">
                  <th className="px-8 py-5">Nr. Înreg.</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Tip</th>
                  <th className="px-8 py-5">Expeditor / Destinatar</th>
                  <th className="px-8 py-5">Descriere Conținut</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 font-medium">
                {documente.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center text-slate-400 italic font-semibold uppercase tracking-widest text-xs">
                      Nu există date înregistrate. Verificați conexiunea Supabase.
                    </td>
                  </tr>
                ) : (
                  documente.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5 font-black text-indigo-600 text-lg italic tracking-tighter">#{doc.nr_inregistrare}</td>
                      <td className="px-8 py-5 text-slate-500">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${doc.tip_document === 'intrare' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {doc.tip_document}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-800 uppercase group-hover:text-indigo-600 transition-colors">{doc.expeditor_destinatar}</td>
                      <td className="px-8 py-5 text-slate-400 italic max-w-xs truncate">{doc.continut_pe_scurt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formular Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative border border-white">
            {!numarGenerat && (
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"><Icons.X size={28} /></button>
            )}

            {numarGenerat ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-inner">
                  <Icons.CheckCircle size={56} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Înregistrat!</h2>
                <div className="text-7xl font-black text-indigo-600 mt-6 tracking-tighter italic">#{numarGenerat}</div>
                <p className="text-slate-400 mt-6 font-bold uppercase text-[10px] tracking-widest">Revenire automată în registru...</p>
              </div>
            ) : (
              <div className="space-y-7">
                <div className="mb-2">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Nou Document</h2>
                  <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em]">{tipDocument}</p>
                </div>
                
                <div className="space-y-4">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-slate-700" />
                  <input type="text" placeholder="Nume / Instituție" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300" />
                  <textarea placeholder="Descriere scurtă" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300" rows={3} />
                </div>

                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-xs">
                  {loading ? <Icons.Loader2 className="animate-spin" /> : <Icons.Save size={20} />}
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
