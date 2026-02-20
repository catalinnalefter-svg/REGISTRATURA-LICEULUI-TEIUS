'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3 } from 'lucide-react';
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
    } catch (err) {
      console.error("Eroare:", err.message);
    }
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pass === 'liceuteius2026') setIsAuth(true);
    else alert('Parolă incorectă!');
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
    setLoading(true);
    
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

    try {
      let result;
      if (editingId) {
        result = await supabase.from('documente').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('documente').insert([payload]).select();
      }
      
      if (result.error) throw result.error;

      if (!editingId && result.data) setNumarGenerat(result.data[0].numar_inregistrare);
      fetchDocs();
      if (editingId) setShowForm(false);
      else setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      
      setEditingId(null);
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare: " + err.message);
    }
    setLoading(false);
  };

  // Logica de căutare îmbunătățită (caută și după număr)
  const filteredDocs = documente.filter(doc => {
    const term = search.toLowerCase();
    return (
      (doc.numar_inregistrare?.toString() === term) ||
      (doc.emitent || '').toLowerCase().includes(term) ||
      (doc.continut || '').toLowerCase().includes(term)
    );
  });

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-900">
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl">
          <img src="/liceul teoretic teius.png" alt="Logo" className="w-24 h-24 mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter">REGISTRATURA LICEULUI</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-8">Acces Securizat 2026</p>
          <input type="password" placeholder="Parola" autoFocus className="w-full p-5 bg-slate-50 border rounded-2xl text-center mb-4 font-bold outline-none focus:border-blue-500" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase hover:bg-blue-700 transition-all">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-[1800px] mx-auto">
        <header className="bg-white p-6 rounded-[3.5rem] shadow-sm border border-white mb-8 flex justify-between items-center px-10">
          <div className="flex items-center gap-5">
            <img src="/liceul teoretic teius.png" alt="Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Documente • 2026</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { id: 'intrare', label: 'INTRARE', color: 'bg-emerald-500' },
            { id: 'iesire', label: 'IESIRE', color: 'bg-blue-500' },
            { id: 'rezervat', label: 'REZERVAT', color: 'bg-orange-500' }
          ].map((item) => (
            <button key={item.id} onClick={() => { setTip(item.id); setEditingId(null); setShowForm(true); }} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-white hover:shadow-xl transition-all text-left flex flex-col gap-4">
              <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}><Plus size={24} strokeWidth={3} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{item.label}</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase">Înregistrare nouă</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center flex-wrap gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută după nr. sau nume..." className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-bold outline-none focus:border-blue-500 shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => {}} className="bg-emerald-500 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100"><FileSpreadsheet size={16} /> Salvare Excel</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1400px]">
              <thead className="text-[10px] uppercase text-slate-400 font-black bg-slate-50/30 border-b">
                <tr>
                  <th className="px-10 py-5 w-24">Tip</th>
                  <th className="px-10 py-5 w-24 text-blue-600">Nr.</th>
                  <th className="px-10 py-5 w-32">Data</th>
                  <th className="px-10 py-5 w-52">Emitent</th>
                  <th className="px-10 py-5 w-80">Conținut</th>
                  <th className="px-10 py-5 w-32 text-center">Comp.</th>
                  <th className="px-10 py-5 w-52">Destinatar</th>
                  <th className="px-10 py-5 w-28 text-center text-blue-600">Conex</th>
                  <th className="px-10 py-5 w-28 text-right">Opțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-4">
                      <span className={`px-2 py-1 rounded-md text-[8px] ${doc.tip_document === 'iesire' ? 'bg-blue-100 text-blue-600' : doc.tip_document === 'rezervat' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {doc.tip_document || 'intrare'}
                      </span>
                    </td>
                    <td className="px-10 py-4 font-black text-blue-600 text-xs">#{doc.numar_inregistrare}</td>
                    <td className="px-10 py-4 text-slate-400">{doc.creat_la}</td>
                    <td className="px-10 py-4 text-slate-700 truncate">{doc.emitent}</td>
                    <td className="px-10 py-4 text-slate-500 normal-case italic truncate">{doc.continut}</td>
                    <td className="px-10 py-4 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[8px]">{doc.compartiment || '-'}</span></td>
                    <td className="px-10 py-4 text-slate-700 truncate">{doc.destinatar || '-'}</td>
                    <td className="px-10 py-4 text-center text-blue-600 font-black">{doc.nr_conex || '-'}</td>
                    <td className="px-10 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(doc.id); setTip(doc.tip_document); setForm({data: doc.creat_la, emitent: doc.emitent, continut: doc.continut, compartiment: doc.compartiment || '', data_expediere: doc.data_expediere || '', destinatar: doc.destinatar || '', nr_conex: doc.nr_conex || '', indicativ: doc.indicativ_dosar || ''}); setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
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

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-5xl shadow-2xl relative my-8">
            {!numarGenerat ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b pb-6">
                  <h2 className="text-3xl font-black uppercase text-slate-800 tracking-tighter">ÎNREGISTRARE {tip}</h2>
                  <button onClick={() => setShowForm(false)} className="bg-slate-50 p-4 rounded-3xl text-slate-300 hover:text-red-500 transition-all"><X size={28} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                  <div className="space-y-5">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data Document</span>
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-500 transition-all" />
                    </label>
                    <div className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Emitent</span>
                      <div className="flex gap-2 mb-3">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(e => (
                          <button key={e} onClick={() => setForm({...form, emitent: e})} className="text-[8px] px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black hover:bg-blue-100 transition-all uppercase">{e}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Scrie emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-500" />
                    </div>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Conținut pe scurt</span>
                      <textarea placeholder="Descriere..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border-none p-6 rounded-[2rem] font-bold text-xs h-40 outline-none focus:ring-2 ring-blue-500 resize-none" />
                    </label>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Compartiment</span>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} onClick={() => setForm({...form, compartiment: v})} className={`text-[8px] px-4 py-2 rounded-xl font-black transition-all uppercase ${form.compartiment === v ? 'bg-orange-500 text-white shadow-lg' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Compartiment..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-orange-500" />
                    </div>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data Expediere</span>
                      <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Destinatar</span>
                      <input type="text" placeholder="Către cine..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <div className="grid grid-cols-2 gap-5">
                      <label><span className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Nr. Conex</span><input type="text" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-blue-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-400" /></label>
                      <label><span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Indicativ</span><input type="text" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-5 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 ring-blue-500" /></label>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-[0.2em] text-xs mt-4 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:bg-slate-300">
                  {loading ? 'Se procesează...' : 'Salvează Înregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl"><Check size={48} strokeWidth={4} /></div>
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Număr Înregistrare Alocat</h2>
                <div className="text-[12rem] font-black text-blue-600 leading-none my-5 tracking-tighter">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
