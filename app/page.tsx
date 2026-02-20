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
    const { data, error } = await supabase
      .from('documente')
      .select('*')
      .order('creat_la', { ascending: false });
    if (!error && data) setDocumente(data);
  }, []);

  useEffect(() => { fetchDocumente(); }, [fetchDocumente]);

const handleSave = async () => {
    if (!formData.expeditor || !formData.continut) {
      alert("Completati toate campurile!");
      return;
    }

    setLoading(true);
    try {
      // 1. Inserăm datele
      const { data, error } = await supabase
        .from('documente')
        .insert([{ 
          tip_document: tipDocument, 
          emitent: formData.expeditor, 
          continut: formData.continut,
          creat_la: formData.data,
          anul: 2026
        }])
        .select(); // IMPORTANT: Aceasta forțează Supabase să returneze rândul creat

      if (error) throw error;

      // 2. Verificăm dacă am primit datele înapoi
      if (data && data.length > 0) {
        const nrNou = data[0].numar_inregistrare;
        console.log("Numar primit de la server:", nrNou); // Verifică în consola browserului
        setNumarGenerat(nrNou); // Setăm numărul pentru a fi afișat în modal
        
        await fetchDocumente(); // Reîmprospătăm tabelul în spate
        
        // 3. Închidem modalul după 4 secunde (să aibă timp utilizatorul să vadă numărul)
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
        }, 4000);
      } else {
        alert("Documentul a fost salvat, dar serverul nu a returnat numărul. Reîmprospătați pagina.");
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

      if (error) throw error;
      if (data?.[0]) {
        setNumarGenerat(data[0].numar_inregistrare);
        await fetchDocumente();
        setTimeout(() => {
          setShowForm(false);
          setNumarGenerat(null);
          setFormData({ data: new Date().toISOString().split('T')[0], expeditor: '', continut: '' });
        }, 3000);
      }
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, nr: any) => {
    if (!id) return;
    if (confirm(`Ștergi înregistrarea #${nr || ''}?`)) {
      const { error } = await supabase.from('documente').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchDocumente();
    }
  };

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
          {/* BUTOANE COLORATE CONFORM DESIGNULUI */}
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

        {/* TABEL CU CĂUTARE */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center gap-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest"><Icons.List size={16} /> Registru</h2>
            <input type="text" placeholder="Caută..." className="px-4 py-2 border rounded-xl text-sm outline-none w-64 focus:ring-2 ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                {documente.filter(d => (d.emitent || "").toLowerCase().includes(searchTerm.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600">#{doc.numar_inregistrare || '---'}</td>
                    <td className="px-6 py-4">{new Date(doc.creat_la).toLocaleDateString('ro-RO')}</td>
                    <td className={`px-6 py-4 uppercase text-[10px] font-bold ${doc.tip_document === 'intrare' ? 'text-emerald-600' : 'text-blue-600'}`}>{doc.tip_document}</td>
                    <td className="px-6 py-4 font-bold uppercase">{doc.emitent}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{doc.continut}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(doc.id, doc.numar_inregistrare)} className="text-slate-300 hover:text-red-500 p-2"><Icons.Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR MODAL CU DATA */}
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
                <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all">{loading ? 'Se salvează...' : 'Finalizează'}</button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <Icons.CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold">Înregistrat!</h2>
                <div className="text-6xl font-black text-indigo-600 mt-4 italic tracking-tighter">#{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
