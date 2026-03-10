'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruTeius() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('general'); 
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('INTRARE'); //
  const [editingId, setEditingId] = useState(null);

  const departamente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII"];

  const [form, setForm] = useState({
    numar_manual: '',
    data: new Date().toISOString().split('T')[0],
    data_final: '',
    emitent: '',
    continut: '',
    destinatar: '',
    data_exped: '',
    conex: '',
    indicativ_dosar: '',
    compartiment: '',
    observatii: '',
    tip_document_spec: 'DECIZIE'
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (pass === 'liceulteius2026' && currentUser) setIsAuth(true);
    else alert("Acces refuzat!");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      
      // Mapare câmpuri pentru a evita erorile de tip "column not found"
      let payload = { 
        continut: form.continut, 
        creat_de: currentUser,
        anul: 2026,
        observatii: form.observatii
      };

      if (activeTab === 'general') {
        Object.assign(payload, {
          tip: formType,
          creat_la: form.data,
          emitent: form.emitent.toUpperCase(),
          destinatar: form.destinatar.toUpperCase(),
          data_expedire: form.data_exped || null,
          conex_ind: form.conex,
          indicativ_dosar: form.indicativ_dosar,
          compartiment: form.compartiment
        });
      } else if (activeTab === 'decizii') {
        // Fix pentru eroarea de check constraint
        Object.assign(payload, {
          tip_document: form.tip_document_spec.toUpperCase(),
          data_emitere: form.data
        });
      } else if (activeTab === 'registre') {
        // Fix pentru eroarea 'numar_manual' missing
        Object.assign(payload, {
          numar_manual: form.numar_manual,
          data_inceput: form.data,
          data_sfarsit: form.data_final || null
        });
      }

      const { error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId)
        : await supabase.from(table).insert([payload]);

      if (error) throw error;
      fetchData();
      setShowForm(false);
      setEditingId(null);
    } catch (err) { alert("Eroare Bază de Date: " + err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl">LTT</div>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {departamente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border" value={pass} onKeyDown={e => e.key === 'Enter' && handleLogin()} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase">Intră (Enter)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-4">
            {/* Soluție Logo: Container cu fundal contrastant dacă logo-ul e alb pe alb */}
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" onError={(e) => e.target.src='https://via.placeholder.com/100?text=LTT'} />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-900 leading-tight">LICEUL TEORETIC TEIUȘ</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilizator: {currentUser} | Creat de ing. Lefter C.</p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-3 bg-red-50 text-red-500 rounded-2xl"><LogOut size={20}/></button>
        </header>

        {/* Butoanele de creare restaurate */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { t: 'INTRARE', c: 'bg-emerald-500', bg: 'bg-emerald-50' },
              { t: 'IEȘIRE', c: 'bg-blue-500', bg: 'bg-blue-50' },
              { t: 'REZERVAT', c: 'bg-orange-500', bg: 'bg-orange-50' }
            ].map(b => (
              <button key={b.t} onClick={() => { setFormType(b.t); setShowForm(true); }} className={`${b.bg} p-8 rounded-[2.5rem] flex items-center gap-6 hover:scale-[1.02] transition-transform text-left`}>
                <div className={`${b.c} p-4 rounded-2xl text-white`}><Plus size={24} strokeWidth={3}/></div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{b.t}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creare înregistrare nouă</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tabelul de date populat */}
        <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-slate-100">
          <div className="p-8 border-b flex justify-between items-center">
            <div className="flex items-center gap-4 flex-1 max-w-md bg-slate-50 px-6 py-3 rounded-2xl">
              <Search size={18} className="text-slate-400"/>
              <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {activeTab !== 'general' && (
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-200">
                <Plus size={18}/> Adaugă {activeTab === 'decizii' ? 'Decizie' : 'Registru'}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                <tr>
                  <th className="px-8 py-5 text-left">Nr / Data</th>
                  <th className="px-8 py-5 text-left">Conținut</th>
                  <th className="px-8 py-5 text-left">Emitent / Compartiment</th>
                  <th className="px-8 py-5 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-blue-600 italic">#{item.numar_inregistrare || item.numar_manual}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{item.creat_la || item.data_emitere || item.data_inceput}</div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <div className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2 uppercase italic">{item.continut}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-400 uppercase">{item.emitent || item.tip_document || 'REGISTRU'}</div>
                      <div className="text-[10px] font-bold text-blue-400">{item.compartiment || '-'}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formular din Poza 17 (Registru General) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-[1000px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-[12px] border-slate-50">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">DATE REGISTRU</h2>
                {activeTab === 'general' && (
                  <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-xl inline-flex">
                    {['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                      <button key={t} onClick={() => setFormType(t)} className={`px-6 py-2 rounded-lg text-[10px] font-black ${formType === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Data Document (Z-L-A)</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none text-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Emitent</label>
                  <div className="flex gap-2 mb-3">
                    {["DIN OFICIU", "ISJ ALBA", "MINISTERUL EDUCAȚIEI"].map(e => (
                      <button key={e} onClick={() => setForm({...form, emitent: e})} className="text-[9px] font-black px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors">{e}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none uppercase" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Conținut / Descriere</label>
                  <textarea placeholder="DETALII DESPRE DOCUMENT..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl font-bold border-none outline-none h-48 resize-none" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Compartiment</label>
                  <div className="flex gap-2 mb-3">
                    {["SECRETARIAT", "CONTABILITATE", "APP", "ALTELE"].map(c => (
                      <button key={c} onClick={() => setForm({...form, compartiment: c})} className="text-[9px] font-black px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">{c}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="SCRIE COMPARTIMENT..." value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Data Expediere</label>
                    <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Destinatar</label>
                    <input type="text" placeholder="CĂTRE..." value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none uppercase" />
                  </div>
                </div>
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 mt-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-5 text-center tracking-widest">Legături Document (Conex/Dosar)</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black text-blue-400 uppercase mb-1 block ml-2">Nr. Conex</label>
                      <input type="text" placeholder="EX: 45" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-blue-400 uppercase mb-1 block ml-2">Indicativ Dosar</label>
                      <input type="text" placeholder="EX: IV-C" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-white rounded-xl font-bold border-none outline-none shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xl uppercase shadow-xl shadow-blue-200 active:scale-[0.98] transition-all">
              {loading ? 'Se salvează...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
