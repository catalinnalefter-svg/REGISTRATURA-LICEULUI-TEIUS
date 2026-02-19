'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Hash, Calendar, X, Save, CheckCircle, Loader2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]); // Aici vom păstra lista
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  // Funcția care aduce toate documentele din baza de date
  const fetchDocumente = async () => {
    try {
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('nr_inregistrare', { ascending: false });
      
      if (!error && data) {
        setDocumente(data);
      }
    } catch (err) {
      console.error("Eroare la încărcarea datelor:", err);
    }
  };

  // Încărcăm lista de documente când se deschide pagina
  useEffect(() => {
    fetchDocumente();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Trimitem datele către tabelul 'documente'
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
        setNumarGenerat(data[0].nr_inregistrare); // Arătăm numărul generat
        fetchDocumente(); // Actualizăm tabelul imediat
      }
    } catch (err: any) {
      alert('Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans antialiased">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-blue-600 text-xl">LT</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">Registratura Liceului Teiuș</h1>
      </header>

      {/* SECȚIUNE BUTOANE */}
      <div className="flex flex-wrap gap-3 mb-10 text-white font-bold">
        <button 
          onClick={() => { setTipDocument('intrare'); setShowForm(true); setNumarGenerat(null); }}
          className="bg-[#22c55e] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110"
        >
          <Plus size={20} /> Adaugă intrare
        </button>
        <button 
          onClick={() => { setTipDocument('iesire'); setShowForm(true); setNumarGenerat(null); }}
          className="bg-[#007bff] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110"
        >
          <Plus size={20} /> Adaugă ieșire
        </button>
      </div>

      {/* TABELUL CU TOATE DOCUMENTELE (LISTA) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg italic">
            <FileText size={20} className="text-blue-600" /> Registrul de evidență 2026
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-slate-400 font-bold border-b bg-slate-50">
                <th className="p-4">Nr.</th>
                <th className="p-4">Data</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Expeditor/Destinatar</th>
                <th className="p-4">Conținut</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {documente.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">Nu există documente în registru.</td>
                </tr>
              ) : (
                documente.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-blue-600">Nr. {doc.nr_inregistrare}</td>
                    <td className="p-4 font-medium">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${doc.tip_document === 'intrare' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{doc.expeditor_destinatar}</td>
                    <td className="p-4 text-slate-500">{doc.continut_pe_scurt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORMULAR */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>

            {numarGenerat ? (
              <div className="text-center py-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold">Document Înregistrat!</h2>
                <div className="text-5xl font-black text-blue-600 mt-4">Nr. {numarGenerat}</div>
                <button onClick={() => setShowForm(false)} className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Închide</button>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Adăugare: {tipDocument.toUpperCase()}</h2>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Data</label>
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Numele</label>
                  <input type="text" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border p-3 rounded-xl" placeholder="Expeditor / Destinatar..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Detalii</label>
                  <textarea value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border p-3 rounded-xl" rows={3} placeholder="Descrierea documentului..."></textarea>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  {loading ? 'Se salvează...' : 'Salvează în Registru'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
