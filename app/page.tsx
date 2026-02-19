'use client';

import React, { useState, useEffect } from 'react';
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

  // Funcție pentru a încărca lista de documente din Supabase
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
      console.error("Eroare la preluarea datelor:", err);
    }
  };

  // Se execută la încărcarea paginii
  useEffect(() => {
    fetchDocumente();
  }, []);

  const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Te rugăm să completezi toate câmpurile!");
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
        fetchDocumente(); // Reîmprospătăm lista imediat după salvare
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans antialiased text-slate-900">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-200">LT</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Registratura Liceului Teiuș</h1>
            <p className="text-xs text-slate-500 font-medium">Sistem Electronic de Gestiune</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600">
          <Calendar size={16} className="text-blue-500" /> An Școlar 2026
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Secțiunea de Acțiuni (Butoane) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => { setTipDocument('intrare'); setShowForm(true); setNumarGenerat(null); }}
            className="group bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-green-500 shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="font-bold text-lg">Document Intrare</h3>
            <p className="text-sm text-slate-500 mb-4">Înregistrează documente primite</p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">Adaugă acum <ArrowRight size={16} /></div>
          </button>

          <button 
            onClick={() => { setTipDocument('iesire'); setShowForm(true); setNumarGenerat(null); }}
            className="group bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-500 shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="font-bold text-lg">Document Ieșire</h3>
            <p className="text-sm text-slate-500 mb-4">Înregistrează documente trimise</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">Adaugă acum <ArrowRight size={16} /></div>
          </button>

          <button 
            onClick={() => { setTipDocument('rezervat'); setShowForm(true); setNumarGenerat(null); }}
            className="group bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-orange-500 shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Hash size={24} />
            </div>
            <h3 className="font-bold text-lg">Rezervă Numere</h3>
            <p className="text-sm text-slate-500 mb-4">Blochează numere în registru</p>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">Rezervă acum <ArrowRight size={16} /></div>
          </button>
        </div>

        {/* Tabelul cu Documente (Lista) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-bold text-slate-800 flex items-center gap-3 text-xl">
              <FileText className="text-blue-600" /> Registru General
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-black border-b bg-slate-50/50">
                  <th className="px-8 py-5">Nr. Înregistrare</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Tip</th>
                  <th className="px-8 py-5">Expeditor / Destinatar</th>
                  <th className="px-8 py-5">Descriere Conținut</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documente.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      Nu există înregistrări în sistem pentru anul 2026.
                    </td>
                  </tr>
                ) : (
                  documente.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5 font-black text-blue-600">#{doc.nr_inregistrare}</td>
                      <td className="px-8 py-5 text-slate-600 font-medium">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${doc.tip_document === 'intrare' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {doc.tip_document}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-800 uppercase">{doc.expeditor_destinatar}</td>
                      <td className="px-8 py-5 text-slate-500 max-w-xs truncate">{doc.continut_pe_scurt}</td>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md relative shadow-2xl border border-white">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={28} />
            </button>

            {numarGenerat ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                  <CheckCircle size={56} />
                </div>
                <h2 className="text-3xl font-black text-slate-800">Succes!</h2>
                <p className="text-slate-500 mt-3 font-medium text-lg">Documentul a primit:</p>
                <div className="text-6xl font-black text-blue-600 mt-4 tracking-tighter">Nr. {numarGenerat}</div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="mt-12 w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  Închide și revino la registru
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nou Document</h2>
                  <p className="text-slate-400 font-bold text-sm">Tip: {tipDocument}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Data Înregistrării</label>
                    <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Expeditor / Destinatar</label>
                    <input type="text" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-medium" placeholder="Ex: Ministerul Educației" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Conținut pe scurt</label>
                    <textarea value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-medium" rows={3} placeholder="Descriere scurtă..."></textarea>
                  </div>
                </div>

                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:bg-black disabled:bg-slate-300 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={22} />}
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
