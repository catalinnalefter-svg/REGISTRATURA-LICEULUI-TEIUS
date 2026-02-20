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
        .order('creat_la', { ascending: false });
      if (!error && data) setDocumente(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchDocumente(); }, [fetchDocumente]);

const handleSave = async () => {
  if (!formData.expeditor || !formData.continut) return alert("Completați câmpurile!");
  setLoading(true);
  
  try {
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
      // 1. Afișăm numărul generat
      setNumarGenerat(data[0].numar_inregistrare);
      
      // 2. Reîmprospătăm tabelul imediat
      await fetchDocumente();
      
      // 3. Resetăm formularul și ÎNCHIDEM fereastra după 3 secunde
      setTimeout(() => {
        setShowForm(false); // Aceasta închide modalul
        setNumarGenerat(null); // Resetăm numărul pentru următoarea utilizare
        setFormData({ 
          data: new Date().toISOString().split('T')[0], 
          expeditor: '', 
          continut: '' 
        });
      }, 3000); 
    }
  } catch (err: any) {
    alert('Eroare la salvare: ' + err.message);
    setLoading(false);
  }
};

 const handleDelete = async (id: any, nr: any) => {
  // Verificăm dacă ID-ul este valid (trebuie să fie un string de tip UUID)
  if (!id || typeof id !== 'string') {
    console.error("ID primit invalid:", id);
    alert("Eroare: Acest document nu are un identificator valid pentru a fi șters.");
    return;
  }
  
  const confirmare = confirm(`Ești sigur că vrei să ștergi înregistrarea #${nr || ''}?`);
  if (!confirmare) return;

  try {
    const { error } = await supabase
      .from('documente')
      .delete()
      .match({ id: id }); // Folosim .match pentru precizie

    if (error) throw error;

    // Actualizăm lista locală imediat
    setDocumente(prev => prev.filter(doc => doc.id !== id));
    alert("Înregistrare ștearsă cu succes!");
  } catch (err: any) {
    alert("Eroare la ștergere: " + err.message);
  }
};

  const documenteFiltrate = documente.filter(d => 
    (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.continut || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.numar_inregistrare?.toString() || "").includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">LT</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Registratura Liceului Teiuș</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">An 2026</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Intrare</h3>
            <p className="text-sm text-slate-400">Documente primite</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Ieșire</h3>
            <p className="text-sm text-slate-400">Documente trimise</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-orange-500 shadow-sm text-left group transition-all">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Hash size={24} /></div>
            <h3 className="font-bold text-lg">Rezervă</h3>
            <p className="text-sm text-slate-400">Blochează numere</p>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest"><Icons.List size={16} /> Registru General</h2>
            <div className="relative w-full md:w-64">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută în registru..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-400 font-bold border-b bg-slate-50/30">
                <tr>
                  <th className="px-6 py-4">Nr.</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Emitent</th>
                  <th className="px-6 py-4">Conținut</th>
                  <th className="px-6 py-4 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {documenteFiltrate.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">Nu s-au găsit înregistrări.</td></tr>
                ) : (
                  documenteFiltrate.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600">#{doc.numar_inregistrare || '---'}</td>
                      <td className="px-6 py-4">{doc.creat_la ? new Date(doc.creat_la).toLocaleDateString('ro-RO') : '---'}</td>
                      <td className={`px-6 py-4 uppercase text-[10px] font-bold ${doc.tip_document === 'intrare' ? 'text-emerald-600' : doc.tip_document === 'iesire' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {doc.tip_document}
                      </td>
                      <td className="px-6 py-4 font-bold uppercase">{doc.emitent || '---'}</td>
                      <td className="px-6 py-4 text-slate-500 italic">{doc.continut}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(doc.id, doc.numar_inregistrare)} className="text-slate-300 hover:text-red-500 p-2"><Icons.Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative">
            {!numarGenerat ? (
              <div className="space-y-6">
                <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icons.X size={24} /></button>
                <h2 className="text-xl font-bold uppercase text-indigo-900">Nou {tipDocument}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data Inregistrării</label>
                    <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" />
                  </div>
                  <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" />
                  <textarea placeholder="Continut pe scurt" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all">
                  {loading ? 'Se salvează...' : 'Finalizează Inregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold">Inregistrat cu succes!</h2>
                <div className="text-6xl font-black text-indigo-600 mt-4 italic tracking-tighter">#{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
