'use client';

import React, { useState, useEffect } from 'react';
// Importăm icoanele individual pentru a evita eroarea de tip componentă
import { Plus, Hash, Calendar, X, Save, CheckCircle, Loader2, FileText, ArrowRight } from 'lucide-react';
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
      console.error("Eroare la incarcare:", err);
    }
  };

  useEffect(() => {
    fetchDocumente();
  }, []);

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Te rugam sa completezi toate campurile!");
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
        
        // ACTUALIZARE: Incarcam tabelul imediat
        await fetchDocumente();

        // ACTUALIZARE: Inchidem fereastra automat dupa 1.5 secunde
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ ...formData, expeditor: '', continut: '' });
        }, 1500);
      }
    } catch (err: any) {
      alert('Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">LT</div>
          <h1 className="text-xl font-bold tracking-tight">Registratura Liceului Teiuș</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Sectiune Butoane */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-6 rounded-3xl border-2 border-transparent hover:border-green-500 shadow-sm transition-all text-left">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3"><Plus size={20} /></div>
            <h3 className="font-bold">Document Intrare</h3>
            <p className="text-xs text-slate-500">Adauga un document nou primit</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-6 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-sm transition-all text-left">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3"><Plus size={20} /></div>
            <h3 className="font-bold">Document Ieșire</h3>
            <p className="text-xs text-slate-500">Inregistreaza un document trimis</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-6 rounded-3xl border-2 border-transparent hover:border-orange-500 shadow-sm transition-all text-left">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3"><Hash size={20} /></div>
            <h3 className="font-bold">Rezervă Numere</h3>
            <p className="text-xs text-slate-500">Blocheaza numere in registru</p>
          </button>
        </div>

        {/* Tabelul de documente */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800">Registru Documente 2026</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b bg-slate-50/50">
                  <th className="px-6 py-4">Nr.</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Expeditor / Destinatar</th>
                  <th className="px-6 py-4">Continut</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documente.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nu exista inregistrari.</td></tr>
                ) : (
                  documente.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600">#{doc.nr_inregistrare}</td>
                      <td className="px-6 py-4">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${doc.tip_document === 'intrare' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {doc.tip_document}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium uppercase">{doc.expeditor_destinatar}</td>
                      <td className="px-6 py-4 text-slate-500">{doc.continut_pe_scurt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Formular Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
            {!numarGenerat && (
               <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X /></button>
            )}

            {numarGenerat ? (
              <div className="text-center py-6 animate-in zoom-in">
                <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Salvat cu succes!</h2>
                <div className="text-5xl font-black text-blue-600 mt-4">Nr. {numarGenerat}</div>
                <p className="text-slate-400 mt-4">Se revine la registru...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold uppercase">Nou: {tipDocument}</h2>
                <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" />
                <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border p-3 rounded-xl" />
                <textarea placeholder="Continut pe scurt" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border p-3 rounded-xl" rows={3} />
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  {loading ? 'Se procesează...' : 'Finalizează Înregistrarea'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
