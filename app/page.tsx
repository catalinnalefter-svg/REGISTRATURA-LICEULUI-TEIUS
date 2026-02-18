'use client';

import React, { useState } from 'react';
import { Plus, Hash, Calendar, X, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  const handleSave = async () => {
    // Inserăm datele și cerem numărul generat înapoi
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

    if (error) {
      alert('Eroare: ' + error.message);
    } else if (data && data[0]) {
      // Afișăm numărul generat automat
      setNumarGenerat(data[0].nr_inregistrare);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      {/* Antetul și butoanele tale colorate */}
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => { setShowForm(false); setNumarGenerat(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>

            {numarGenerat ? (
              // ECRANUL CARE ARATĂ NUMĂRUL DUPĂ SALVARE
              <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Salvat cu succes!</h2>
                <p className="text-slate-500 mt-2 font-medium">Numărul de înregistrare alocat este:</p>
                <div className="text-5xl font-black text-blue-600 mt-4 tracking-tight">
                  Nr. {numarGenerat}
                </div>
                <button 
                  onClick={() => { setShowForm(false); setNumarGenerat(null); }}
                  className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all"
                >
                  Gata, închide
                </button>
              </div>
            ) : (
              // FORMULARUL TĂU ACTUAL
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="text-blue-600" /> Nou document: {tipDocument.toUpperCase()}
                </h2>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Data</label>
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Expeditor / Destinatar</label>
                  <input type="text" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3" placeholder="Nume..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Conținut pe scurt</label>
                  <textarea value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3" rows={3} placeholder="Descriere..."></textarea>
                </div>
                <button onClick={handleSave} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all">
                  <Save size={20} /> Salvează în Registru
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
