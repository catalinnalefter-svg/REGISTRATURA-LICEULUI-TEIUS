'use client';

import React, { useState } from 'react';
import { Plus, Hash, Calendar, X, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Importul corect

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Inserăm în tabelul documente
      const { data, error } = await supabase
        .from('documente')
        .insert([{ 
          tip_document: tipDocument, 
          expeditor_destinatar: formData.expeditor, 
          continut_pe_scurt: formData.continut,
          data_inregistrare: formData.data,
          anul: 2026
        }])
        .select('nr_inregistrare');

      if (error) throw error;

      if (data && data[0]) {
        setNumarGenerat(data[0].nr_inregistrare); // Afișăm numărul generat automat
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + (err.message || 'Verifică setările Vercel'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans antialiased">
      {/* Header-ul aplicației */}
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-blue-600 text-xl">LT</div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Registratura electronica</h1>
          <span className="bg-white border px-3 py-1 rounded-lg text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> 2026
          </span>
        </div>
      </header>

      {/* Butoanele principale - acum protejate */}
      <div className="flex flex-wrap gap-3 mb-10 text-white font-bold">
        <button 
          onClick={() => { setTipDocument('intrare'); setShowForm(true); setNumarGenerat(null); }}
          className="bg-[#22c55e] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all active:scale-95"
        >
          <Plus size={20} /> Adaugă document intrare
        </button>
        
        <button 
          onClick={() => { setTipDocument('iesire'); setShowForm(true); setNumarGenerat(null); }}
          className="bg-[#007bff] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all active:scale-95"
        >
          <Plus size={20} /> Adaugă document ieșire
        </button>

        <button 
          onClick={() => { setTipDocument('rezervat'); setShowForm(true); setNumarGenerat(null); }}
          className="bg-[#f39c12] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all active:scale-95"
        >
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      {/* Formularul Pop-up */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl border border-white/20">
            <button onClick={() => { setShowForm(false); setNumarGenerat(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>

            {numarGenerat ? (
              <div className="text-center py-6">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Salvat cu succes!</h2>
                <p className="text-slate-500 mt-2 font-medium">Numărul alocat este:</p>
                <div className="text-5xl font-black text-blue-600 mt-4">Nr. {numarGenerat}</div>
                <button onClick={() => { setShowForm(false); setNumarGenerat(null); }} className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Închide</button>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-slate-800">Nou document: {tipDocument.toUpperCase()}</h2>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Data Înregistrării</label>
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Expeditor / Destinatar</label>
                  <input type="text" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3" placeholder="Nume..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Conținut pe scurt</label>
                  <textarea value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3" rows={3} placeholder="Descriere..."></textarea>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-black disabled:bg-slate-400 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  {loading ? 'Se salvează...' : 'Salvează în Registru'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mesajul de fundal */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-24 text-center">
        <p className="text-slate-400 font-medium italic">
          În Registratura Generala nu există niciun document pentru anul 2026
        </p>
      </div>
    </div>
  );
}
