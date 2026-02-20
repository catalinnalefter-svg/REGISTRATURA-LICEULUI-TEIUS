'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3, ArrowRightLeft } from 'lucide-react';
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

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document || 'intrare');
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
      alert("Eroare la baza de date. Verifică dacă ai adăugat coloanele în Supabase!");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelCompatibil = () => {
    const headers = ["Nr. Inreg", "Data", "Tip", "Emitent", "Continut", "Compartiment", "Destinatar", "Data Expediere", "Nr. Conex", "Indicativ"];
    const rows = documente.map(d => [
      d.numar_inregistrare, d.creat_la, d.tip_document, d.emitent, 
      `"${d.continut?.replace(/"/g, '""')}"`, d.compartiment, d.destinatar, d.data_expediere, d.nr_conex, d.indicativ_dosar
    ]);
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Registru_2026.csv`;
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceuteius2026') setIsAuth(true); else alert('Parolă incorectă!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">ACCES REGISTRU</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mt-6 outline-none text-center font-bold" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl mt-4 font-black uppercase hover:bg-blue-700">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center mb-8 px-10">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-14 h-14" alt="Logo" />
            <h1 className="text-xl font-black uppercase tracking-tighter">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
          </div>
          <button onClick={exportToExcelCompatibil} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"><FileSpreadsheet size={16}/> Salvare Excel</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((type) => (
            <button key={type} onClick={() => { setTip(type); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all text-left flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${type === 'intrare' ? 'bg-emerald-500' : type === 'iesire' ? 'bg-blue-500' : 'bg-orange-500'}`}><Plus size={24} strokeWidth={3} /></div>
              <div><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{type}</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Adaugă nou</p></div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 ring-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1500px]">
              <thead className="text-[9px] uppercase text-slate-400 font-black bg-slate-50/50 border-b">
                <tr>
                  <th className="px-8 py-4 w-28">Tip</th>
                  <th className="px-8 py-4 w-24">Nr.</th>
                  <th className="px-8 py-4 w-32">Data</th>
                  <th className="px-8 py-4 w-48">Emitent</th>
                  <th className="px-8 py-4 w-64">Conținut</th>
                  <th className="px-8 py-4 w-32 text-center">Compartiment</th>
                  <th className="px-8 py-4 w-48">Destinatar</th>
                  <th className="px-8 py-4 w-32 text-center">Conex/Ind.</th>
                  <th className="px-8 py-4 w-28 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {documente.filter(d => d.numar_inregistrare?.toString().includes(search) || d.emitent?.toLowerCase().includes(search.toLowerCase()) || d.continut?.toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-8 py-3">
                      <span className={`px-3 py-1 rounded-lg text-[8px] text-white ${doc.tip_document === 'intrare' ? 'bg-emerald-500' : doc.tip_document === 'iesire' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="px-8 py-3 font-black text-blue-600">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-3 text-slate-400">{doc.creat_la}</td>
                    <td className="px-8 py-3 truncate">{doc.emitent}</td>
                    <td className="px-8 py-3 text-slate-500 italic truncate normal-case">{doc.continut}</td>
                    <td className="px-8 py-3 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg">{doc.compartiment || '-'}</span></td>
                    <td className="px-8 py-3 truncate">{doc.destinatar || '-'}</td>
                    <td className="px-8 py-3 text-center text-blue-600">{doc.nr_conex || '-'}/{doc.indicativ_dosar || '-'}</td>
                    <td className="px-8 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(doc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl"><Edit3 size={16} /></button>
                        <button onClick={async () => { if(confirm('Ștergeți?')) { await supabase.from('documente').delete().eq('id', doc.id); fetchDocs(); }}} className="p-2 text-red-500 hover:bg-red-100 rounded-xl"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-4xl shadow-2xl my-8 relative">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">MODIFICĂ / ADAUGĂ</h2>
                    {/* Selector de TIP în interiorul formularului */}
                    <div className="flex gap-2 mt-3">
                       {['intrare', 'iesire', 'rezervat'].map(t => (
                         <button key={t} onClick={() => setTip(t)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${tip === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="bg-slate-50 p-4 rounded-3xl text-slate-300 hover:text-red-500 transition-all"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Data Document
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs mt-1 outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Emitent
                      <div className="flex gap-2 mb-2 mt-2">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTER"].map(e => (
                          <button key={e} type="button" onClick={() => setForm({...form, emitent: e})} className="text-[8px] px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black uppercase hover:bg-blue-100">{e}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-blue-500" />
                    </label>
                    <label className="block text-[10px] font-black uppercase text-slate-400">Conținut pe scurt
                      <textarea value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs h-32 mt-1 outline-none focus:ring-2 ring-blue-500 resize-none" />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Compartiment
                      <div className="flex gap-2 mb-2 mt-2">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} type="button" onClick={() => setForm({...form, compartiment: v})} className={`text-[8px] px-3 py-1 rounded-lg font-black transition-all ${form.compartiment === v ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Specificați..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500" />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400">Data Expediere
                        <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-[10px] mt-1 outline-none" />
                      </label>
                      <label className="block text-[10px] font-black uppercase text-slate-400">Destinatar
                        <input type="text" placeholder="Către..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-[10px] mt-1 outline-none" />
                      </label>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 mt-4">
                      <span className="text-[9px] font-black uppercase text-blue-600 mb-2 block">Legături Document</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Nr. Conex" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-white border-none p-4 rounded-2xl font-bold text-xs shadow-sm outline-none" />
                        <input type="text" placeholder="Indicativ" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-white border-none p-4 rounded-2xl font-bold text-xs shadow-sm outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest text-xs mt-6 hover:bg-blue-700 shadow-xl transition-all disabled:bg-slate-300">
                  {loading ? 'Se salvează...' : 'Finalizează Inregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce"><Check size={48} strokeWidth={4} /></div>
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Număr Înregistrare Alocat</h2>
                <div className="text-[10rem] font-black text-blue-600 leading-none my-4 tracking-tighter">{numarGenerat}</div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Închiderea automată în 3 secunde...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
