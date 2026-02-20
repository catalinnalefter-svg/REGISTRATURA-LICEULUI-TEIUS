'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, BookOpen, FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3, LogOut } from 'lucide-react';
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

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pass === 'liceuteius2026') setIsAuth(true);
    else alert('Parolă incorectă!');
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur dorești să ștergi această înregistrare?')) {
      await supabase.from('documente').delete().eq('id', id);
      fetchDocs();
    }
  };

  const handleExport = () => {
    const header = `<tr><th>Nr. Inreg.</th><th>Data</th><th>Emitent</th><th>Continut</th><th>Compartiment</th><th>Data Expediere</th><th>Destinatar</th><th>Nr. Conex</th><th>Indicativ</th></tr>`;
    const rows = documente.map(d => `<tr><td>${d.numar_inregistrare}</td><td>${d.creat_la}</td><td>${d.emitent || ''}</td><td>${d.continut || ''}</td><td>${d.compartiment || ''}</td><td>${d.data_expediere || ''}</td><td>${d.destinatar || ''}</td><td>${d.nr_conex || ''}</td><td>${d.indicativ_dosar || ''}</td></tr>`).join('');
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">${header}${rows}</table></body></html>`;
    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(template)));
    link.download = `Registru_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!form.emitent || !form.continut) return alert('Emitentul și Conținutul sunt obligatorii!');
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
    
    if (error) alert("Eroare Baza de Date: " + error.message);
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
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3.5rem] w-full max-w-md text-center border border-white/20 shadow-2xl animate-in zoom-in duration-500">
          <ShieldCheck className="mx-auto mb-6 text-blue-400" size={60} />
          <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tighter">Registru Digital</h2>
          <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest mb-8">Liceul Teoretic Teiuș</p>
          <input type="password" placeholder="Parola de acces" autoFocus className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-center text-white mb-6 outline-none font-bold focus:border-blue-500 focus:bg-white/10 transition-all" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">Autentificare</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-4 md:p-10 font-sans">
      <div className="max-w-[1650px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white p-8 rounded-[3rem] shadow-xl border border-white/50 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200"><BookOpen size={32} /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase text-slate-800 tracking-tighter leading-none">Registru <span className="text-blue-600">Intrări-Ieșiri</span></h1>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1">Liceul Teoretic Teiuș • 2026</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"><FileSpreadsheet size={18} /> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-500 p-4 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTip(t); setShowForm(true); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-2xl hover:-translate-y-1 transition-all group flex items-center justify-between">
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t === 'intrare' ? 'bg-emerald-100 text-emerald-600' : t === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}><Plus size={24} /></div>
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Înregistrare {t}</h3>
              </div>
              <div className="text-slate-100 group-hover:text-slate-200 transition-colors"><Plus size={60} strokeWidth={4} /></div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Caută după emitent, conținut sau număr..." className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-blue-500 shadow-inner transition-all" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1600px]">
              <thead className="text-[10px] uppercase text-slate-400 font-black bg-slate-50/80 border-b">
                <tr>
                  <th className="px-8 py-6 w-32 text-blue-600">Nr. Înreg.</th>
                  <th className="px-8 py-6 w-32">Data</th>
                  <th className="px-8 py-6 w-56">Emitent</th>
                  <th className="px-8 py-6 w-96">Conținut Document</th>
                  <th className="px-8 py-6 w-48 text-center">Compartiment</th>
                  <th className="px-8 py-6 w-36 text-center">Data Exped.</th>
                  <th className="px-8 py-6 w-56">Destinatar</th>
                  <th className="px-8 py-6 w-28 text-center">Conex</th>
                  <th className="px-8 py-6 w-40 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[12px] divide-y divide-slate-100 uppercase">
                {documente.filter(d => 
                  (d.emitent || '').toLowerCase().includes(search.toLowerCase()) || 
                  (d.continut || '').toLowerCase().includes(search.toLowerCase()) ||
                  d.numar_inregistrare.toString().includes(search)
                ).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-8 py-6 font-black text-blue-600 text-base">#{doc.numar_inregistrare}</td>
                    <td className="px-8 py-6 text-slate-400 font-bold">{doc.creat_la}</td>
                    <td className="px-8 py-6 font-black text-slate-700">{doc.emitent}</td>
                    <td className="px-8 py-6 text-slate-500 normal-case italic leading-relaxed">{doc.continut}</td>
                    <td className="px-8 py-6 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-[10px]">{doc.compartiment || '-'}</span></td>
                    <td className="px-8 py-6 text-center text-slate-400">{doc.data_expediere || '-'}</td>
                    <td className="px-8 py-6 font-bold text-slate-700">{doc.destinatar || '-'}</td>
                    <td className="px-8 py-6 text-center text-blue-600 font-black">{doc.nr_conex || '-'}</td>
                    <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(doc.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-5xl shadow-2xl relative border border-white max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            {!numarGenerat ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b pb-6">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Înregistrare {tip}</h2>
                    <p className="text-blue-600 text-[11px] font-black uppercase tracking-widest mt-1">Document Nou • 2026</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-3xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={24} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-6">
                    <label className="block group">
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 mb-2 block group-focus-within:text-blue-600 transition-colors">Data Document</span>
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </label>
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 block mb-3">Emitent</span>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(v => (
                          <button key={v} onClick={() => setForm({...form, emitent: v})} className="text-[9px] bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Numele emitentului..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </div>
                    <label className="block">
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 mb-2 block">Conținut pe scurt</span>
                      <textarea placeholder="Descrierea documentului..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all h-44 resize-none" />
                    </label>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 block mb-3">Compartiment</span>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} onClick={() => setForm({...form, compartment: v})} className="text-[9px] bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-black hover:bg-amber-600 hover:text-white transition-all">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Ex: SECRETARIAT" value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </div>
                    <label className="block">
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 mb-2 block">Data Expediere</span>
                      <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-black uppercase text-slate-400 ml-2 mb-2 block">Destinatar</span>
                      <input type="text" placeholder="Către cine se trimite..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label>
                        <span className="text-[11px] font-black uppercase text-blue-600 ml-2 mb-2 block">Nr. Conex</span>
                        <input type="text" placeholder="Nr. legătură" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-blue-50/50 border border-blue-100 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                      </label>
                      <label>
                        <span className="text-[11px] font-black uppercase text-slate-400 ml-2 mb-2 block">Indicativ Dosar</span>
                        <input type="text" placeholder="Cod" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
                      </label>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest text-xs mt-6 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-slate-200">
                  {loading ? 'Se procesează...' : 'Salvează Înregistrarea'}
                </button>
              </div>
            ) : (
              <div className="text-center py-20 animate-in zoom-in duration-300">
                <div className="w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200 animate-bounce"><Check size={56} strokeWidth={4} /></div>
                <h2 className="text-2xl font-black uppercase text-slate-400 tracking-widest">Număr Înregistrare Generat</h2>
                <div className="text-[12rem] font-black text-blue-600 leading-none tracking-tighter my-4">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
