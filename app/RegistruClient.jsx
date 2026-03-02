'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Plus, Search, X, Check, Edit3 } from 'lucide-react'; 
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
      const { data, error } = await supabase
        .from('documente')
        .select('*')
        .order('numar_inregistrare', { ascending: false });
      if (error) throw error;
      setDocumente(data || []);
    } catch (err) { 
      console.error("Eroare la încărcare:", err); 
    }
  }, []);

  useEffect(() => { 
    if (isAuth) fetchDocs(); 
  }, [isAuth, fetchDocs]);

  const formatRoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}-${m}-${y}`;
    } catch { return dateStr; }
  };

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
      else {
        setTimeout(() => { 
          setShowForm(false); 
          setNumarGenerat(null); 
        }, 3000);
      }
      
      setForm({
        data: new Date().toISOString().split('T')[0], 
        emitent: '', continut: '', compartiment: '', data_expediere: '', destinatar: '', nr_conex: '', indicativ: ''
      });
    } catch (err) {
      alert("Eroare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelCompatibil = () => {
    const headers = ["Nr. Inreg", "Data", "Tip", "Emitent", "Continut", "Compartiment", "Destinatar", "Data Expediere", "Nr. Conex", "Indicativ"];
    const rows = documente.map(d => [
      d.numar_inregistrare, formatRoDate(d.creat_la), d.tip_document, d.emitent, 
      `"${d.continut?.replace(/"/g, '""')}"`, d.compartiment, d.destinatar, formatRoDate(d.data_expediere), d.nr_conex, d.indicativ_dosar
    ]);
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Registru_Teius_2026.csv`;
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceulteius2026') setIsAuth(true); else alert('Parolă incorectă!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md border border-slate-100">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">ACCES REGISTRU</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-100 rounded-2xl mt-6 outline-none text-center font-bold text-lg focus:ring-2 ring-blue-500" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl mt-4 font-black uppercase hover:bg-blue-700 transition-all shadow-lg">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 text-slate-900">
      <div className="max-w-[1850px] mx-auto">
        <header className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center mb-8 px-10 border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-14 h-14" alt="Logo" />
            <h1 className="text-xl font-black uppercase tracking-tighter">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
          </div>
          <div className="flex gap-4">
             <button onClick={exportToExcelCompatibil} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"><FileSpreadsheet size={16}/> Export Excel</button>
             <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500">Ieșire</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((type) => (
            <button key={type} onClick={() => { setTip(type); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all text-left flex flex-col gap-4 group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${type === 'intrare' ? 'bg-emerald-500' : type === 'iesire' ? 'bg-blue-500' : 'bg-orange-500'}`}><Plus size={24} strokeWidth={3} /></div>
              <div><h3 className="text-2xl font-black text-slate-800 uppercase">{type}</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Creare înregistrare</p></div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/30 border-b flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Caută după nr, emitent sau conținut..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-500 shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1700px]">
              <thead className="text-[10px] uppercase text-slate-500 font-black bg-slate-50/50 border-b">
                <tr>
                  <th className="px-8 py-4 w-28 text-center">Tip</th>
                  <th className="px-8 py-4 w-36">Nr. Înregistrare</th>
                  <th className="px-8 py-4 w-32">Data Inreg.</th>
                  <th className="px-8 py-4 w-48">Emitent</th>
                  <th className="px-8 py-4 w-64">Conținut</th>
                  <th className="px-8 py-4 w-40 text-center">Compartiment</th>
                  <th className="px-8 py-4 w-48">Destinatar</th>
                  <th className="px-8 py-4 w-32 text-center">Data Exped.</th>
                  <th className="px-8 py-4 w-32 text-center">Conex/Ind.</th>
                  <th className="px-8 py-4 w-28 text-right">Editare</th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-slate-100 uppercase font-bold text-slate-700">
                {documente.filter(d => d.numar_inregistrare?.toString().includes(search) || d.emitent?.toLowerCase().includes(search.toLowerCase()) || d.continut?.toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] text-white font-black ${doc.tip_document === 'intrare' ? 'bg-emerald-500' : doc.tip_document === 'iesire' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                        {doc.tip_document}
                      </span>
                    </td>
                    <td className="px-8 py-3 font-black text-blue-700 text-sm">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-3 text-slate-500">{formatRoDate(doc.creat_la)}</td>
                    <td className="px-8 py-3 truncate">{doc.emitent}</td>
                    <td className="px-8 py-3 text-slate-600 normal-case italic truncate">{doc.continut}</td>
                    <td className="px-8 py-3 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg">{doc.compartiment || '-'}</span></td>
                    <td className="px-8 py-3 truncate">{doc.destinatar || '-'}</td>
                    <td className="px-8 py-3 text-center text-slate-500">{formatRoDate(doc.data_expediere)}</td>
                    <td className="px-8 py-3 text-center text-blue-700 font-black">{doc.nr_conex || '-'}/{doc.indicativ_dosar || '-'}</td>
                    <td className="px-8 py-3 text-right">
                      <button onClick={() => handleEdit(doc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto text-slate-900">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-4xl shadow-2xl relative my-8 border border-slate-200">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">DATE REGISTRU</h2>
                    <div className="flex gap-2 mt-3">
                       {['intrare', 'iesire', 'rezervat'].map(t => (
                         <button key={t} type="button" onClick={() => setTip(t)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${tip === t ? 'bg-blue-600 text-white scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{t}</button>
                       ))}
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"><X size={28} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                  <div className="space-y-5">
                    <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Data Document (Z-L-A)
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-lg mt-2 outline-none focus:ring-4 ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all" />
                    </label>
                    
                    <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Emitent
                      <div className="flex flex-wrap gap-2 mb-3 mt-3">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(e => (
                          <button key={e} type="button" onClick={() => setForm({...form, emitent: e})} className="text-[10px] px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black hover:bg-blue-600 hover:text-white uppercase transition-all border border-blue-100">{e}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-lg outline-none focus:ring-4 ring-blue-500/20 focus:border-blue-500 text-slate-900 uppercase" />
                    </label>

                    <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Conținut / Descriere
                      <textarea placeholder="DETALII DESPRE DOCUMENT..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-lg h-40 mt-2 outline-none focus:ring-4 ring-blue-500/20 focus:border-blue-500 text-slate-900 resize-none leading-relaxed" />
                    </label>
                  </div>

                  <div className="space-y-5">
                    <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Compartiment
                      <div className="flex flex-wrap gap-2 mb-3 mt-3">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} type="button" onClick={() => setForm({...form, compartiment: v})} className={`text-[10px] px-4 py-2 rounded-xl font-black transition-all border ${form.compartiment === v ? 'bg-orange-500 text-white border-orange-600 scale-105 shadow-md' : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-500 hover:text-white'}`}>{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="SCRIE COMPARTIMENT..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-lg outline-none focus:ring-4 ring-orange-500/20 focus:border-orange-500 text-slate-900 uppercase" />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Data Expediere
                        <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-base mt-2 outline-none text-slate-800" />
                      </label>
                      <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">Destinatar
                        <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-base mt-2 outline-none text-slate-900 uppercase" />
                      </label>
                    </div>

                    <div className="bg-blue-50/50 p-8 rounded-[3rem] border-2 border-blue-100 mt-4 shadow-inner">
                      <span className="text-xs font-black uppercase text-blue-700 mb-4 block leading-tight tracking-widest">Legături Document (Conex/Dosar)</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-blue-400 ml-2">NR. CONEX</span>
                          <input type="text" placeholder="EX: 45" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-white border-2 border-blue-50 p-4 rounded-2xl font-black text-lg outline-none shadow-sm focus:border-blue-500 text-blue-900" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-blue-400 ml-2">INDICATIV DOSAR</span>
                          <input type="text" placeholder="EX: IV-C" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-white border-2 border-blue-50 p-4 rounded-2xl font-black text-lg outline-none shadow-sm focus:border-blue-500 text-blue-900 uppercase" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-[0.2em] text-lg mt-6 hover:bg-blue-700 transition-all shadow-2xl disabled:bg-slate-300 hover:scale-[1.01] active:scale-[0.99]">
                  {loading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ ÎN REGISTRU'}
                </button>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce border-8 border-emerald-100"><Check size={64} strokeWidth={4} /></div>
                <h2 className="text-xl font-black uppercase text-slate-500 tracking-[0.3em]">Număr Alocat</h2>
                <div className="text-[12rem] font-black text-blue-600 leading-none my-4 tracking-tighter drop-shadow-xl">{numarGenerat}</div>
                <p className="text-slate-400 font-bold uppercase mt-4">Documentul a fost înregistrat cu succes!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
