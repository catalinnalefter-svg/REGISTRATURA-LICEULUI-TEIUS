'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [documente, setDocumente] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numarGenerat, setNumarGenerat] = useState(null);
  const [tip, setTip] = useState('intrare');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    compartiment: '',
    data_expediere: '',
    destinatar: '',
    nr_conex: '',
    indicativ: ''
  });

  const fetchDocs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
      if (error) throw error;
      setDocumente(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  // Funcție pentru deschiderea formularului de editare
  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document || 'intrare'); // Setăm tipul (intrare/iesire)
    setForm({
      data: doc.creat_la || '',
      emitent: doc.emitent || '',
      continut: doc.continut || '',
      compartiment: doc.compartiment || '',
      data_expediere: doc.data_expediere || '',
      destinatar: doc.destinatar || '',
      nr_conex: doc.nr_conex || '',
      indicativ: doc.indicativ_dosar || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
    try {
      const payload = {
        tip_document: tip,
        emitent: form.emitent.toUpperCase(),
        continut: form.continut,
        creat_la: form.data,
        compartiment: form.compartiment.toUpperCase(),
        data_expediere: form.data_expediere || null,
        destinatar: form.destinatar.toUpperCase(),
        nr_conex: form.nr_conex || null,
        indicativ_dosar: form.indicativ.toUpperCase(),
        anul: 2026
      };

      if (editingId) {
        const { error } = await supabase.from('documente').update(payload).eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { data, error } = await supabase.from('documente').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]) setNumarGenerat(data[0].numar_inregistrare);
      }
      
      fetchDocs();
      if (editingId) setShowForm(false);
      else setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceuteius2026') setIsAuth(true); else alert('Parolă incorectă!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md border border-slate-100">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">REGISTRU DIGITAL</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-100 rounded-2xl mt-6 outline-none text-center font-bold focus:ring-2 ring-blue-500" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl mt-4 font-black uppercase hover:bg-blue-700 transition-all">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="max-w-[1700px] mx-auto">
        <header className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center mb-8 px-10 border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-14 h-14" alt="Logo" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Sistem Gestiune • 2026</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500">Ieșire</button>
        </header>

        {/* Butoane principale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((type) => (
            <button key={type} onClick={() => { setTip(type); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all text-left flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${type === 'intrare' ? 'bg-emerald-500' : type === 'iesire' ? 'bg-blue-500' : 'bg-orange-500'}`}><Plus size={24} strokeWidth={3} /></div>
              <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{type}</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Creare înregistrare</p></div>
            </button>
          ))}
        </div>

        {/* Tabelul */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/30 border-b">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1300px]">
              <thead className="text-[9px] uppercase text-slate-400 font-black bg-slate-50/50 border-b">
                <tr>
                  <th className="px-8 py-4 w-24">Nr. Reg.</th>
                  <th className="px-8 py-4 w-32">Data</th>
                  <th className="px-8 py-4 w-52">Emitent</th>
                  <th className="px-8 py-4 w-80">Conținut</th>
                  <th className="px-8 py-4 w-36 text-center">Comp.</th>
                  <th className="px-8 py-4 w-28 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {documente.filter(d => d.numar_inregistrare?.toString().includes(search) || d.emitent?.toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-3 font-black text-blue-600">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-3 text-slate-400">{doc.creat_la}</td>
                    <td className="px-8 py-3">{doc.emitent}</td>
                    <td className="px-8 py-3 text-slate-500 italic truncate normal-case">{doc.continut}</td>
                    <td className="px-8 py-3 text-center">{doc.compartiment}</td>
                    <td className="px-8 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
                        <button onClick={async () => { if(confirm('Ștergeți?')) { await supabase.from('documente').delete().eq('id', doc.id); fetchDocs(); }}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAR */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-4xl shadow-2xl relative">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">ÎNREGISTRARE {tip}</h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Document tip: {tip}</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="bg-slate-50 p-3 rounded-2xl text-slate-300 hover:text-red-500"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {/* Coloana Stângă */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Data Document
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs mt-1 outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Emitent
                      <div className="flex gap-2 mb-2 mt-2">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTER"].map(e => (
                          <button key={e} type="button" onClick={() => setForm({...form, emitent: e})} className="text-[8px] px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black hover:bg-blue-100 uppercase">{e}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Scrie emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Conținut
                      <textarea value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs h-32 mt-1 outline-none focus:ring-2 ring-blue-500 resize-none" />
                    </label>
                  </div>

                  {/* Coloana Dreaptă */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Compartiment
                      <div className="flex gap-2 mb-2 mt-2">
                        {["SECRETARIAT", "CONTABILITATE", "APP"].map(v => (
                          <button 
                            key={v} 
                            type="button" 
                            onClick={() => setForm({...form, compartiment: v})} 
                            className={`text-[8px] px-3 py-1 rounded-lg font-black transition-all ${form.compartiment === v ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <input type="text" placeholder="Compartiment..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500" />
                    </label>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Data Expediere / Destinatar
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none" />
                        <input type="text" placeholder="Destinatar..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none" />
                      </div>
                    </label>
                    <div className="bg-blue-50/50 p-4 rounded-[2.5rem] border border-blue-100">
                      <span className="text-[9px] font-black uppercase text-blue-600 mb-2 block">Conexiune și Indicativ</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Nr. Conex" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-white border-none p-3 rounded-xl font-bold text-xs outline-none" />
                        <input type="text" placeholder="Indicativ" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-white border-none p-3 rounded-xl font-bold text-xs outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-xs mt-4 hover:bg-blue-700 disabled:bg-slate-300">
                  {loading ? 'Se salvează...' : 'Salvează Înregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-bounce">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"><Check size={48} strokeWidth={4} /></div>
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Număr Înregistrare Alocat</h2>
                <div className="text-[10rem] font-black text-blue-600 leading-none my-2 tracking-tighter">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
