'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, FileSpreadsheet, Plus, Search, X, Check, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx'; // Pentru un export Excel curat

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
        setShowForm(false);
      } else {
        const { data, error } = await supabase.from('documente').insert([payload]).select();
        if (error) throw error;
        if (data) setNumarGenerat(data[0].numar_inregistrare);
        setTimeout(() => { setShowForm(false); setNumarGenerat(null); }, 3000);
      }
      
      fetchDocs();
      setForm({data: new Date().toISOString().split('T')[0], emitent:'', continut:'', compartiment:'', data_expediere:'', destinatar:'', nr_conex:'', indicativ:''});
    } catch (err) {
      alert("Eroare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(documente);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registru");
    XLSX.writeFile(wb, "Registru_Teius_2026.xlsx");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pass === 'liceuteius2026') setIsAuth(true); else alert('Greșit!'); }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-md">
          <img src="/liceul teoretic teius.png" className="w-24 h-24 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black uppercase">Registru Liceu</h2>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-100 rounded-2xl mt-6 outline-none text-center font-bold" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl mt-4 font-black uppercase hover:bg-blue-700 transition-all">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center mb-8 px-10 border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-14 h-14" alt="Logo" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">REGISTRATURA <span className="text-blue-600">LICEULUI TEIUȘ</span></h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Documente • 2026</p>
            </div>
          </div>
          <button onClick={exportToExcel} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600"><FileSpreadsheet size={16}/> Salvare Excel</button>
        </header>

        {/* Butoanele de tip (Intrare, Iesire, Rezervat) și Tabelul ramân la fel ca anterior */}
        {/* ... codul pentru butoane și tabel ... */}
        
        {/* MODAL FORMULAR UNIFICAT */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-4xl shadow-2xl relative">
              {!numarGenerat ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase">Înregistrare {tip}</h2>
                    <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500"><X size={32}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                      <label className="block font-black text-[10px] uppercase text-slate-400">Data Document
                        <input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl mt-1 font-bold outline-none border-none focus:ring-2 ring-blue-500"/>
                      </label>
                      <label className="block font-black text-[10px] uppercase text-slate-400">Emitent
                        <div className="flex gap-2 mt-2 mb-2">
                           {["DIN OFICIU", "ISJ ALBA", "MINISTER"].map(v => (
                             <button key={v} onClick={() => setForm({...form, emitent: v})} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[8px] font-black">{v}</button>
                           ))}
                        </div>
                        <input type="text" value={form.emitent} onChange={(e) => setForm({...form, emitent: e.target.value.toUpperCase()})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border-none focus:ring-2 ring-blue-500"/>
                      </label>
                      <label className="block font-black text-[10px] uppercase text-slate-400">Conținut
                        <textarea value={form.continut} onChange={(e) => setForm({...form, continut: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl mt-1 font-bold h-32 outline-none border-none focus:ring-2 ring-blue-500 resize-none"/>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="block font-black text-[10px] uppercase text-slate-400">Compartiment
                        <div className="flex gap-2 mt-2 mb-2">
                           {["SECRETARIAT", "CONTABILITATE", "APP"].map(v => (
                             <button key={v} onClick={() => setForm({...form, compartiment: v})} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[8px] font-black">{v}</button>
                           ))}
                        </div>
                        <input type="text" value={form.compartiment} onChange={(e) => setForm({...form, compartiment: e.target.value.toUpperCase()})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border-none focus:ring-2 ring-orange-500"/>
                      </label>
                      <label className="block font-black text-[10px] uppercase text-slate-400">Data Expediere
                        <input type="date" value={form.data_expediere} onChange={(e) => setForm({...form, data_expediere: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl mt-1 font-bold outline-none border-none focus:ring-2 ring-blue-500"/>
                      </label>
                      <label className="block font-black text-[10px] uppercase text-slate-400">Destinatar
                        <input type="text" value={form.destinatar} onChange={(e) => setForm({...form, destinatar: e.target.value.toUpperCase()})} className="w-full bg-slate-50 p-4 rounded-2xl mt-1 font-bold outline-none border-none focus:ring-2 ring-blue-500"/>
                      </label>
                      <div className="bg-blue-50/50 p-4 rounded-[2rem] border border-blue-100">
                        <span className="text-[9px] font-black uppercase text-blue-600 block mb-2 leading-tight">Nr. de înregistrare la care se conexează și indicativul dosarului</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Conex..." value={form.nr_conex} onChange={(e) => setForm({...form, nr_conex: e.target.value})} className="bg-white p-3 rounded-xl font-bold text-xs outline-none shadow-sm"/>
                          <input type="text" placeholder="Indicativ..." value={form.indicativ} onChange={(e) => setForm({...form, indicativ: e.target.value.toUpperCase()})} className="bg-white p-3 rounded-xl font-bold text-xs outline-none shadow-sm"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:bg-slate-300">
                    {loading ? 'Se salvează...' : 'Salvează Înregistrarea'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 animate-in zoom-in">
                  <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"><Check size={48} strokeWidth={4}/></div>
                  <h2 className="text-sm font-black uppercase text-slate-400">Număr Înregistrare Alocat</h2>
                  <div className="text-[10rem] font-black text-blue-600 leading-none my-4 tracking-tighter">{numarGenerat}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
