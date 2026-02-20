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
    const { data } = await supabase.from('documente').select('*').order('numar_inregistrare', { ascending: false });
    if (data) setDocumente(data);
  }, []);

  useEffect(() => { if (isAuth) fetchDocs(); }, [isAuth, fetchDocs]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pass === 'liceuteius2026') setIsAuth(true);
    else alert('Parolă incorectă!');
  };

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setTip(doc.tip_document);
    setForm({
      data: doc.creat_la,
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

  const handleDelete = async (id) => {
    if (confirm('Ștergeți definitiv această înregistrare?')) {
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

    let result;
    if (editingId) {
      result = await supabase.from('documente').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('documente').insert([payload]).select();
    }
    
    if (result.error) {
      alert("Eroare: " + result.error.message);
    } else {
      if (!editingId && result.data) setNumarGenerat(result.data[0].numar_inregistrare);
      fetchDocs();
      if (editingId) {
        setShowForm(false);
        setEditingId(null);
      } else {
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      }
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] w-full max-w-md text-center border border-white/20 shadow-2xl">
          <ShieldCheck className="mx-auto mb-4 text-blue-400" size={50} />
          <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-tighter">Registru Digital</h2>
          <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest mb-8">Liceul Teoretic Teiuș</p>
          <input type="password" placeholder="Parola" autoFocus className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-white mb-4 outline-none font-bold focus:border-blue-500 transition-all" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-blue-500 transition-all">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 p-3 md:p-6 font-sans">
      <div className="max-w-[1800px] mx-auto">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-4 bg-white p-5 rounded-[2rem] shadow-lg border border-white/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BookOpen size={24} /></div>
            <div>
              <h1 className="text-xl font-black uppercase text-slate-800 tracking-tighter leading-none">Registru <span className="text-blue-600">Intrări-Ieșiri</span></h1>
              <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mt-1">Liceul Teoretic Teiuș</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all"><FileSpreadsheet size={14} /> Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-500 p-2.5 rounded-xl hover:text-red-500 transition-all"><LogOut size={16} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {['intrare', 'iesire', 'rezervat'].map((t) => (
            <button key={t} onClick={() => { setTip(t); setEditingId(null); setShowForm(true); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t === 'intrare' ? 'bg-emerald-100 text-emerald-600' : t === 'iesire' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}><Plus size={18} /></div>
                <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Nou {t}</h3>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
          <div className="p-4 bg-slate-50 border-b">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Caută..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500 transition-all" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[1500px]">
              <thead className="text-[8px] uppercase text-slate-400 font-black bg-slate-50 border-b">
                <tr>
                  <th className="px-5 py-3 w-24 text-blue-600">Nr.</th>
                  <th className="px-5 py-3 w-28">Data</th>
                  <th className="px-5 py-3 w-48">Emitent</th>
                  <th className="px-5 py-3 w-80">Conținut</th>
                  <th className="px-5 py-3 w-32 text-center">Comp.</th>
                  <th className="px-5 py-3 w-28 text-center">Exped.</th>
                  <th className="px-5 py-3 w-48">Destinatar</th>
                  <th className="px-5 py-3 w-24 text-center">Conex</th>
                  <th className="px-5 py-3 w-28 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="text-[10px] divide-y divide-slate-100 uppercase font-bold">
                {documente.filter(d => (d.emitent || '').toLowerCase().includes(search.toLowerCase()) || (d.continut || '').toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition-all group">
                    <td className="px-5 py-2.5 font-black text-blue-600">#{doc.numar_inregistrare}</td>
                    <td className="px-5 py-2.5 text-slate-400">{doc.creat_la}</td>
                    <td className="px-5 py-2.5 text-slate-700 truncate">{doc.emitent}</td>
                    <td className="px-5 py-2.5 text-slate-500 normal-case italic truncate">{doc.continut}</td>
                    <td className="px-5 py-2.5 text-center"><span className="bg-slate-100 px-2 py-0.5 rounded text-[8px]">{doc.compartiment || '-'}</span></td>
                    <td className="px-5 py-2.5 text-center text-slate-400">{doc.data_expediere || '-'}</td>
                    <td className="px-5 py-2.5 text-slate-700 truncate">{doc.destinatar || '-'}</td>
                    <td className="px-5 py-2.5 text-center text-blue-600">{doc.nr_conex || '-'}</td>
                    <td className="px-5 py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleEdit(doc)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
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
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {!numarGenerat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h2 className="text-xl font-black uppercase text-slate-800">{editingId ? 'Editare' : 'Nou'} {tip}</h2>
                  <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Data</span>
                      <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none focus:border-blue-500" />
                    </label>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Emitent</span>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(v => (
                          <button key={v} onClick={() => setForm({...form, emitent: v})} className="text-[7px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black hover:bg-blue-600 hover:text-white transition-all">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Scrie emitent..." value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none" />
                    </div>
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Conținut</span>
                      <textarea placeholder="Descriere document..." value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl font-bold text-xs h-24 outline-none" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Compartiment</span>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(v => (
                          <button key={v} onClick={() => setForm({...form, compartiment: v})} className="text-[7px] bg-amber-50 text-amber-600 px-2 py-1 rounded font-black hover:bg-amber-600 hover:text-white transition-all">{v}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="Ex: SECRETARIAT" value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none" />
                    </div>
                    <label className="block">
                      <span className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Data Expediere / Destinatar</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none" />
                        <input type="text" placeholder="Destinatar..." value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none" />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label><span className="text-[9px] font-black uppercase text-blue-600 mb-1 block">Nr. Conex</span><input type="text" value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="w-full bg-blue-50 border border-blue-100 p-3 rounded-xl font-bold text-xs outline-none" /></label>
                      <label><span className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Indicativ</span><input type="text" value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border p-3 rounded-xl font-bold text-xs outline-none" /></label>
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs mt-4 hover:bg-blue-700 transition-all">
                  {loading ? 'Salvare...' : editingId ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce"><Check size={40} /></div>
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Nr. Înregistrare</h2>
                <div className="text-[8rem] font-black text-blue-600 leading-none my-2">{numarGenerat}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
