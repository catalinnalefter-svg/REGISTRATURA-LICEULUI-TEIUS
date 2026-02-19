'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Hash, Calendar, X, Save, CheckCircle, Loader2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Registratura() {
  const [showForm, setShowForm] = useState(false);
  const [tipDocument, setTipDocument] = useState('');
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [documente, setDocumente] = useState<any[]>([]); // Lista pentru tabel
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    expeditor: '',
    continut: '',
  });

  // Funcția care încarcă documentele din baza de date
  const fetchDocumente = async () => {
    const { data, error } = await supabase
      .from('documente')
      .select('*')
      .order('nr_inregistrare', { ascending: false });
    if (!error && data) setDocumente(data);
  };

  // Încărcăm datele la deschiderea paginii
  useEffect(() => {
    fetchDocumente();
  }, []);

  const handleSave = async () => {
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
        fetchDocumente(); // Reîmprospătăm lista imediat
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Registratura electronica 2026</h1>
      </header>

      {/* Butoane */}
      <div className="flex flex-wrap gap-3 mb-10 text-white font-bold">
        <button onClick={() => { setTipDocument('intrare'); setShowForm(true); setNumarGenerat(null); }} className="bg-[#22c55e] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <Plus size={20} /> Adaugă intrare
        </button>
        <button onClick={() => { setTipDocument('iesire'); setShowForm(true); setNumarGenerat(null); }} className="bg-[#007bff] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <Plus size={20} /> Adaugă ieșire
        </button>
      </div>

      {/* Tabelul cu documente - NOU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText size={18} className="text-blue-500" /> Registru Documente
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-slate-400 font-bold border-b">
                <th className="p-4">Nr. Reg.</th>
                <th className="p-4">Data</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Expeditor/Destinatar</th>
                <th className="p-4">Conținut</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {documente.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">Nu există documente înregistrate.</td>
                </tr>
              ) : (
                documente.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{doc.nr_inregistrare}</td>
                    <td className="p-4">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${doc.tip_document === 'intrare' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{doc.expeditor_destinatar}</td>
                    <td className="p-4 text-slate-500">{doc.continut_pe_scurt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formular */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400"><X /></button>
            {numarGenerat ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Salvat!</h2>
                <div className="text-5xl font-black text-blue-600 mt-4">Nr. {numarGenerat}</div>
                <button onClick={() => setShowForm(false)} className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Închide</button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Nou document: {tipDocument.toUpperCase()}</h2>
                <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" />
                <input type="text" placeholder="Nume" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border p-3 rounded-xl" />
                <textarea placeholder="Descriere" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border p-3 rounded-xl" rows={3} />
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Salvează
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
