'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, X, Check } from 'lucide-react';
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
    const { data } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
    if (data) setDocumente(data);
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleExport = () => {
    const header = `<tr><th>Nr. Inreg.</th><th>Data</th><th>Emitent</th><th>Continut</th><th>Compartiment</th><th>Data Expediere</th><th>Destinatar</th><th>Nr. Conex</th><th>Indicativ Dosar</th></tr>`;
    const rows = documente.map(d => `<tr><td>${d.numar_inregistrare}</td><td>${d.creat_la}</td><td>${d.emitent || ''}</td><td>${d.continut || ''}</td><td>${d.compartiment || ''}</td><td>${d.data_expediere || ''}</td><td>${d.destinatar || ''}</td><td>${d.nr_conex || ''}</td><td>${d.indicativ_dosar || ''}</td></tr>`).join('');
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">${header}${rows}</table></body></html>`;
    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(template)));
    link.download = `Registru_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul si Continutul sunt obligatorii!');
    setLoading(true);
    const { data, error } = await supabase.from('documente').insert([{
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
    }]).select();
    
    if (error) alert("Eroare: " + error.message);
    else if (data?.[0]) {
      setNumarGenerat(data[0].numar_inregistrare);
      fetchDocs();
      setTimeout(() => { 
        setShowForm(false); setNumarGenerat(null); 
        setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''}); 
      }, 3000);
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <ShieldCheck className="mx-auto mb-6 text-white" size={48} />
          <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-tighter">Acces Registru</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-center text-white mb-6 outline-none font-bold" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button onClick={() => pass === 'liceuteius2026' ? setIsAuth(true) : alert('Gresit')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl uppercase hover:bg-blue-500 transition-all">Intra</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto font-sans">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><BookOpen size={28} /></div>
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">Registru <span className="text-blue-600">Liceul Teiuș</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase">Gestiune Documente • 2026</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all"><FileSpreadsheet size={16} /> Excel</button>
            <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 px-6 py-3 bg-white border border-slate-200 rounded-xl uppercase">Iesire</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTip(t); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white text-left hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${t === 'intrare' ? 'bg-emerald-500' : t === 'iesire' ? 'bg-blue-500' : 'bg-amber-500'} text-white`}><Plus size={24} /></div>
              <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Înregistrare {t}</h3>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1500px]">
              <thead className="text-[10px] uppercase text-slate-400 font-black bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 w-32 text-blue-600">Nr. Înreg.</th>
                  <th className="px-6 py-4 w-32">Data</th>
                  <th className="px-6 py-4 w-48">Emitent</th>
                  <th className="px-6 py-4 w-96">Conținut</th>
                  <th className="px-6 py-4 w-40">Compartiment</th>
                  <th className="px-6 py-4 w-36">Expediere</th>
                  <th className="px-6 py-4 w-48">Destinatar</th>
                  <th className="px-6 py-4 w-28 text-center text-blue-500">Conex</th>
                  <th className="px-6 py-4 w-28 text-center">Indicativ</th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-slate-100 uppercase">
                {documente.filter(d => (d.emitent || '').toLowerCase().includes(search.toLowerCase()) || (d.continut || '').toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-black text-blue-600">#{doc.numar_inregistrare}</td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{doc.creat_la}</td>
                    <td className="px-6 py-4 font-black text-slate-700">{doc.emitent}</td>
                    <td className="px-6 py-4 text-slate-500 italic normal-case truncate">{doc.continut}</td>
                    <td className="px-6 py-4 font-bold text-slate-600">{doc.compartiment || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.data_expediere || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{doc.destinatar || '-'}</td>
                    <td className="px-6 py-4 text-center text-blue-600 font-black">{doc.nr_conex || '-'}</td>
                    <td className="px-6 py-4 text-center font-black text-slate-800">{doc.indicativ_dosar || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl relative border border-white max-h-[90vh] overflow-y-auto">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">Înregistrare {tip}</h2>
                  <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500"><X size={32} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Data Document</span>
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                    </label>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Emitent</span>
                      <div className="flex gap-2 mb-2">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCATIEI"].map(v => (
                          <button key={v} onClick={() => setForm({...form, emitent: v})} className="text-[8px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black hover:bg-blue-600 hover:text-white">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                    </div>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Conținut pe scurt</span>
                      <textarea placeholder="Descriere..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs h-32" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Compartiment</span>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} onClick={() => setForm({...form, compartiment: v})} className="text-[8px] bg-amber-50 text-amber-600 px-2 py-1 rounded font-black hover:bg-amber-600 hover:text-white">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Compartiment..." value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                    </div>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Data Expediere</span>
                      <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Destinatar</span>
                      <input type="text" placeholder="Destinatar..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label>
                        <span className="text-[10px] font-black uppercase text-blue-600 ml-1">Nr. Conex</span>
                        <input type="text" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-blue-50 border p-4 rounded-xl font-bold text-xs" />
                      </label>
                      <label>
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Indicativ</span>
                        <input type="text" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-xs" />
                      </label>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs mt-4 hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:bg-slate-200">
                  {loading ? 'Salvare...' : 'Finalizează Înregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-20 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 animate-bounce"><Check size={48} strokeWidth={3} /></div>
                <h2 className="text-xl font-black uppercase text-slate-400 tracking-widest">Număr Înregistrare</h2>
                <div className="text-[10rem] font-black text-blue-600 leading-none tracking-tighter my-2">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
