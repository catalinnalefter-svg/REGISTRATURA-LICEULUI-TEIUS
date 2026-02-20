'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, Edit3, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Componenta principala ramane extrem de simpla pentru a nu bloca parser-ul
export default function RegistraturaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pass, setPass] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 text-center">
          <ShieldCheck className="mx-auto mb-4 text-blue-500" size={40} />
          <h1 className="text-white font-bold mb-6">AUTENTIFICARE REGISTRU</h1>
          <input 
            type="password" 
            className="w-full p-3 mb-4 rounded bg-slate-700 text-white outline-none border border-slate-600"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Parola..."
          />
          <button 
            onClick={() => pass === 'liceuteius2026' ? setIsAuthenticated(true) : alert('Gresit')}
            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-500"
          >
            LOGARE
          </button>
        </div>
      </div>
    );
  }

  return <RegistruInterfata />;
}

// Interfata este mutata intr-o functie separata pentru a ajuta compilatorul Vercel
function RegistruInterfata() {
  const [documente, setDocumente] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numarGenerat, setNumarGenerat] = useState<number | null>(null);
  const [tip, setTip] = useState('intrare');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    compartiment: '',
    destinatar: '',
    indicativ: ''
  });

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
    if (data) setDocumente(data);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const save = async () => {
    if (!form.emitent || !form.continut) return alert('Completati datele!');
    setLoading(true);
    const { data } = await supabase.from('documente').insert([{
      tip_document: tip,
      emitent: form.emitent,
      continut: form.continut,
      creat_la: form.data,
      compartiment: form.compartiment,
      destinatar: form.destinatar,
      indicativ_dosar: form.indicativ,
      anul: 2026
    }]).select();
    
    if (data) {
      setNumarGenerat(data[0].numar_inregistrare);
      fetchDocs();
      setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-white">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600" />
            <h1 className="font-black uppercase tracking-tight">Registru Liceul Teius</h1>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-400">EXIT</button>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {['intrare', 'iesire', 'rezervat'].map(t => (
            <button key={t} onClick={() => { setTip(t); setShowForm(true); }} className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500 hover:bg-blue-50 transition-all">
              <Plus className="mb-2 text-blue-600" />
              <div className="font-bold uppercase text-sm">{t}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="p-4 border-b bg-slate-50 flex justify-between">
            <input 
              type="text" 
              placeholder="Cauta..." 
              className="p-2 border rounded text-sm w-64 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-4">Nr.</th>
                <th className="p-4">Data</th>
                <th className="p-4">Emitent</th>
                <th className="p-4">Continut</th>
                <th className="p-4">Compartiment</th>
                <th className="p-4">Destinatar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 uppercase">
              {documente.filter(d => (d.emitent || '').toLowerCase().includes(search.toLowerCase())).map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-blue-600">#{d.numar_inregistrare}</td>
                  <td className="p-4 text-slate-400">{d.creat_la}</td>
                  <td className="p-4 font-semibold">{d.emitent}</td>
                  <td className="p-4 normal-case italic text-slate-500">{d.continut}</td>
                  <td className="p-4">{d.compartiment}</td>
                  <td className="p-4">{d.destinatar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
            {!numarGenerat ? (
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h2 className="font-black uppercase text-blue-600">Inregistrare {tip}</h2>
                  <button onClick={() => setShowForm(false)}><X /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Data</label>
                    <input type="date" className="w-full p-2 border rounded" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
                    
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Emitent</label>
                    <div className="flex gap-1 mb-1">
                      {["ISJ ALBA", "MINISTER"].map(v => <button key={v} onClick={() => setForm({...form, emitent: v})} className="text-[8px] bg-slate-100 p-1 rounded font-bold">{v}</button>)}
                    </div>
                    <input type="text" className="w-full p-2 border rounded uppercase" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                    
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Continut</label>
                    <textarea className="w-full p-2 border rounded h-20" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Compartiment</label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                        <button key={v} onClick={() => setForm({...form, compartment: v})} className="text-[8px] bg-amber-50 text-amber-700 p-1 rounded font-bold border border-amber-200">{v}</button>
                      ))}
                    </div>
                    <input type="text" className="w-full p-2 border rounded uppercase" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} />
                    
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Destinatar</label>
                    <input type="text" className="w-full p-2 border rounded uppercase" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />

                    <label className="text-[10px] font-bold text-slate-400 uppercase">Indicativ Dosar</label>
                    <input type="text" className="w-full p-2 border rounded uppercase" value={form.indicativ} onChange={e => setForm({...form, indicativ: e.target.value})} />
                  </div>
                </div>
                <button 
                  disabled={loading}
                  onClick={save}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase mt-4 hover:bg-blue-700 transition-colors"
                >
                  {loading ? 'Se salveaza...' : 'Finalizeaza Inregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <Check className="mx-auto text-emerald-500 mb-4" size={48} />
                <div className="text-sm font-bold text-slate-400 uppercase">Numar Generat:</div>
                <div className="text-8xl font-black text-blue-600 my-2">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
