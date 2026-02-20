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
  const [searchTerm, setSearchTerm] = useState(''); // Stare pentru căutare
  
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
        .order('nr_inregistrare', { ascending: false });
      
      if (!error && data) {
        setDocumente(data);
      }
    } catch (err) {
      console.error("Eroare la incarcare:", err);
    }
  }, []);

  useEffect(() => {
    fetchDocumente();
  }, [fetchDocumente]);

  // Logica de filtrare a documentelor în funcție de ce scrii în bara de căutare
  const documenteFiltrate = documente.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.expeditor_destinatar?.toLowerCase().includes(term) ||
      doc.continut_pe_scurt?.toLowerCase().includes(term) ||
      doc.nr_inregistrare?.toString().includes(term)
    );
  });

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
        await fetchDocumente();
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
        }, 1500);
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">LT</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Registratura Liceului Teiuș</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">An 2026</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Intrare</h3>
            <p className="text-sm text-slate-400">Documente primite</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Ieșire</h3>
            <p className="text-sm text-slate-400">Documente trimise</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-orange-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Hash size={24} /></div>
            <h3 className="font-bold text-lg">Rezervă</h3>
            <p className="text-sm text-slate-400">Blochează numere</p>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-sm tracking-wider">
              <Icons.List className="text-indigo-600" size={18} /> Registru General
            </h2>
            
            {/* BARA DE CĂUTARE */}
            <div className="relative w-full md:w-64">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Caută în registru..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b bg-slate-50/30">
                  <th className="px-6 py-4">Nr. Inreg.</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Expeditor / Destinatar</th>
                  <th className="px-6 py-4">Continut</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documenteFiltrate.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                      {searchTerm ? "Nicio potrivire găsită." : "Nu există date înregistrate."}
                    </td>
                  </tr>
                ) : (
                  documenteFiltrate.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600">#{doc.nr_inregistrare}</td>
                      <td className="px-6 py-4">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                      <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-tighter">
                        <span className={doc.tip_document === 'intrare' ? 'text-emerald-600' : 'text-blue-600'}>{doc.tip_document}</span>
                      </td>
                      <td className="px-6 py-4 font-bold uppercase">{doc.expeditor_destinatar}</td>
                      <td className="px-6 py-4 text-slate-500 italic">{doc.continut_pe_scurt}</td>
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
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative border border-white">
            {!numarGenerat && (
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icons.X size={24} /></button>
            )}

            {numarGenerat ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold">Salvat!</h2>
                <div className="text-6xl font-black text-indigo-600 mt-4 tracking-tighter italic">#{numarGenerat}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-tighter">Nou {tipDocument}</h2>
                <div className="space-y-4">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500 font-bold" />
                  <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" />
                  <textarea placeholder="Continut pe scurt" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
                  {loading ? 'Se salvează...' : 'Finalizează'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}'use client';

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
  const [searchTerm, setSearchTerm] = useState(''); // Stare pentru căutare
  
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
        .order('nr_inregistrare', { ascending: false });
      
      if (!error && data) {
        setDocumente(data);
      }
    } catch (err) {
      console.error("Eroare la incarcare:", err);
    }
  }, []);

  useEffect(() => {
    fetchDocumente();
  }, [fetchDocumente]);

  // Logica de filtrare a documentelor în funcție de ce scrii în bara de căutare
  const documenteFiltrate = documente.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.expeditor_destinatar?.toLowerCase().includes(term) ||
      doc.continut_pe_scurt?.toLowerCase().includes(term) ||
      doc.nr_inregistrare?.toString().includes(term)
    );
  });

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
        await fetchDocumente();
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
        }, 1500);
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">LT</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Registratura Liceului Teiuș</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">An 2026</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button onClick={() => { setTipDocument('intrare'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Intrare</h3>
            <p className="text-sm text-slate-400">Documente primite</p>
          </button>
          <button onClick={() => { setTipDocument('iesire'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Plus size={24} /></div>
            <h3 className="font-bold text-lg">Ieșire</h3>
            <p className="text-sm text-slate-400">Documente trimise</p>
          </button>
          <button onClick={() => { setTipDocument('rezervat'); setShowForm(true); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-orange-500 shadow-sm transition-all text-left group">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icons.Hash size={24} /></div>
            <h3 className="font-bold text-lg">Rezervă</h3>
            <p className="text-sm text-slate-400">Blochează numere</p>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-sm tracking-wider">
              <Icons.List className="text-indigo-600" size={18} /> Registru General
            </h2>
            
            {/* BARA DE CĂUTARE */}
            <div className="relative w-full md:w-64">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Caută în registru..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b bg-slate-50/30">
                  <th className="px-6 py-4">Nr. Inreg.</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Expeditor / Destinatar</th>
                  <th className="px-6 py-4">Continut</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {documenteFiltrate.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                      {searchTerm ? "Nicio potrivire găsită." : "Nu există date înregistrate."}
                    </td>
                  </tr>
                ) : (
                  documenteFiltrate.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600">#{doc.nr_inregistrare}</td>
                      <td className="px-6 py-4">{new Date(doc.data_inregistrare).toLocaleDateString('ro-RO')}</td>
                      <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-tighter">
                        <span className={doc.tip_document === 'intrare' ? 'text-emerald-600' : 'text-blue-600'}>{doc.tip_document}</span>
                      </td>
                      <td className="px-6 py-4 font-bold uppercase">{doc.expeditor_destinatar}</td>
                      <td className="px-6 py-4 text-slate-500 italic">{doc.continut_pe_scurt}</td>
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
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative border border-white">
            {!numarGenerat && (
              <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icons.X size={24} /></button>
            )}

            {numarGenerat ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold">Salvat!</h2>
                <div className="text-6xl font-black text-indigo-600 mt-4 tracking-tighter italic">#{numarGenerat}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-tighter">Nou {tipDocument}</h2>
                <div className="space-y-4">
                  <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500 font-bold" />
                  <input type="text" placeholder="Expeditor / Destinatar" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" />
                  <textarea placeholder="Continut pe scurt" value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500" rows={3} />
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
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
