'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Check, X, Download, Calendar, Edit2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistruClient() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('general'); 
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('INTRARE');
  const [editingId, setEditingId] = useState(null);
  const [lastRegNumber, setLastRegNumber] = useState(null); // Pentru anunțul numărului

  const initialFormState = {
    data: new Date().toISOString().split('T')[0],
    emitent: '',
    continut: '',
    destinatar: '',
    data_exped: new Date().toISOString().split('T')[0], // Data curentă implicită
    conex: '',
    indicativ_dosar: '',
    compartiment: '',
    observatii: '',
    tip_decizie: 'DECIZIE',
    data_sfarsit: '',
    nr_manual: ''
  };

  const [form, setForm] = useState(initialFormState);

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result } = await supabase.from(table).select('*').order('numar_inregistrare', { ascending: false });
    setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  // Deschide formular nou (curat)
  const handleOpenNew = (type) => {
    setFormType(type);
    setEditingId(null);
    setForm(initialFormState); // Resetare completă la apăsarea +
    setShowForm(true);
  };

  // Export compatibil Excel (HTML Table format)
  const exportToExcel = () => {
    const tableHeaders = ["Tip", "Nr. Inreg.", "Data Inreg.", "Emitent", "Continut", "Destinatar", "Compartiment", "Creat De", "Data Exped.", "Conex", "Indicativ"];
    let html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`;
    
    data.forEach(i => {
      html += `<tr>
        <td>${i.tip || ''}</td><td>${i.numar_inregistrare}</td><td>${i.creat_la}</td>
        <td>${i.emitent || ''}</td><td>${i.continut || ''}</td><td>${i.destinatar || ''}</td>
        <td>${i.compartiment || ''}</td><td>${i.creat_de || ''}</td>
        <td>${i.data_expedire || ''}</td><td>${i.conex_ind || ''}</td><td>${i.indicativ_dosar || ''}</td>
      </tr>`;
    });
    html += "</table></body></html>";

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Registru_LTT_2026.xls`;
    link.click();
  };

  const handleSave = async () => {
    if (!form.continut) return alert('Conținutul este obligatoriu!');
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { 
        continut: form.continut, 
        creat_de: currentUser,
        anul: 2026,
        compartiment: form.compartiment || currentUser
      };

      if (activeTab === 'general') {
        payload = { 
          ...payload, 
          tip: formType, 
          creat_la: form.data, 
          emitent: form.emitent.toUpperCase(), 
          destinatar: form.destinatar.toUpperCase(), 
          data_expedire: form.data_exped, // Folosește data expedierii (curentă sau modificată)
          conex_ind: form.conex, 
          indicativ_dosar: form.indicativ_dosar 
        };
      }

      const { data: savedData, error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).select()
        : await supabase.from(table).insert([payload]).select();

      if (error) throw error;
      
      if (!editingId && savedData) {
        setLastRegNumber(savedData[0].numar_inregistrare); // Salvăm numărul pentru anunț
      }
      
      fetchData();
      setShowForm(false);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center border border-white">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tighter">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold outline-none border border-slate-100" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            <option value="SECRETARIAT">SECRETARIAT</option>
            <option value="CONTABILITATE">CONTABILITATE</option>
            <option value="ADMINISTRATIV">ADMINISTRATIV</option>
            <option value="DIRECTOR">DIRECTOR</option>
            <option value="ACHIZIȚII">ACHIZIȚII</option>
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold border border-slate-100 outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'liceulteius2026' && currentUser) setIsAuth(true); }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Intră în Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul teoretic teius.png" className="w-12 h-12" alt="Logo" />
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight leading-none">REGISTRATURA <span className="text-blue-500">LICEULUI TEORETIC TEIUȘ</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Creat de ing. Lefter C.</p>
                <span className="text-slate-200">|</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UTILIZATOR ACTIV: <span className="text-blue-600">{currentUser}</span></p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportToExcel} className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-[#059669] shadow-sm"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
          </div>
        </header>

        {/* CARDURI CREARE */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[ {t: 'INTRARE', c: 'bg-[#10b981]'}, {t: 'IESIRE', c: 'bg-[#3b82f6]'}, {t: 'REZERVAT', c: 'bg-[#f97316]'} ].map(card => (
              <div key={card.t} onClick={() => handleOpenNew(card.t)} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                <div className={`${card.c} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}><Plus size={24} strokeWidth={3}/></div>
                <h2 className="text-3xl font-black uppercase text-[#0f172a] leading-none">{card.t}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creare înregistrare</p>
              </div>
            ))}
          </div>
        )}

        {/* TABEL CU TOATE COLOANELE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50">
             <input type="text" placeholder="Caută în registru..." className="bg-slate-50 p-4 rounded-3xl w-full max-w-xl outline-none font-bold text-slate-600 text-sm border border-slate-100 shadow-inner" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">Tip</th><th className="px-8 py-5">Nr. Inreg.</th><th className="px-8 py-5">Data Inreg.</th>
                  <th className="px-8 py-5">Emitent</th><th className="px-8 py-5">Conținut</th><th className="px-8 py-5">Destinatar</th>
                  <th className="px-8 py-5">Compartiment</th><th className="px-8 py-5">Creat De</th><th className="px-8 py-5">Data Exped.</th><th className="px-8 py-5 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase text-white shadow-sm ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>{item.tip}</span>
                    </td>
                    <td className="px-8 py-6 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                    <td className="px-8 py-6 text-slate-500">{item.creat_la}</td>
                    <td className="px-8 py-6 uppercase">{item.emitent}</td>
                    <td className="px-8 py-6 italic">{item.continut}</td>
                    <td className="px-8 py-6 uppercase">{item.destinatar || '-'}</td>
                    <td className="px-8 py-6 uppercase">{item.compartiment}</td>
                    <td className="px-8 py-6 text-slate-400 font-black uppercase">{item.creat_de}</td>
                    <td className="px-8 py-6 text-slate-400">{item.data_expedire}</td>
                    <td className="px-8 py-6 text-center"><button onClick={() => { setEditingId(item.id); setForm({...item, data_exped: item.data_expedire || initialFormState.data_exped}); setShowForm(true); }} className="text-slate-200 hover:text-blue-500"><Edit2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ANUNȚ NUMĂR ÎNREGISTRARE (FIȘĂ) */}
      {lastRegNumber && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl animate-in zoom-in duration-300 max-w-lg w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-blue-500"></div>
            <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center text-blue-500 mx-auto mb-8 shadow-inner">
              <FileText size={48} />
            </div>
            <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[12px] mb-4">Document Înregistrat</h3>
            <p className="text-slate-800 font-black text-7xl mb-8 tracking-tighter">#{lastRegNumber}</p>
            <div className="bg-slate-50 p-6 rounded-3xl mb-10 border border-slate-100 italic font-medium text-slate-500">
               Numărul de mai sus a fost alocat în Registrul General {new Date().getFullYear()}.
            </div>
            <button onClick={() => setLastRegNumber(null)} className="w-full bg-blue-600 text-white p-7 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Închide Fișa</button>
          </div>
        </div>
      )}

      {/* FORMULAR "DATE REGISTRU" */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-[950px] shadow-2xl relative">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter">Date Registru</h2>
              <button onClick={() => setShowForm(false)} className="bg-[#f1f5f9] p-4 rounded-3xl text-slate-400 hover:text-red-500 transition-all"><X size={32}/></button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block">Data Document</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none shadow-inner" />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block">Emitent</label>
                  <input type="text" placeholder="SCRIE EMITENTUL..." className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block">Conținut / Descriere</label>
                  <textarea placeholder="DETALII..." className="w-full p-6 bg-[#f8fafc] rounded-[3rem] font-black text-xl border-none outline-none h-40 resize-none" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-3 block">Compartiment</label>
                  <input type="text" placeholder="SCRIE COMPARTIMENT..." className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none uppercase" value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block ml-4">Data Expedire</label>
                    <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-lg border-none outline-none" />
                   </div>
                   <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block ml-4">Destinatar</label>
                    <input type="text" placeholder="CĂTRE..." className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black text-lg border-none outline-none uppercase" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                   </div>
                </div>
                
                <div className="bg-[#eff6ff] p-8 rounded-[3.5rem] border border-blue-100">
                  <h3 className="text-[#3b82f6] font-black uppercase text-[10px] text-center mb-6 tracking-widest">Legături Document (Conex)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="NR. CONEX" className="w-full p-5 bg-white rounded-3xl font-black text-xl border-none outline-none text-blue-900" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} />
                    <input type="text" placeholder="INDICATIV DOSAR" className="w-full p-5 bg-white rounded-3xl font-black text-xl border-none outline-none text-blue-900" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-[#3b82f6] text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-2xl shadow-blue-200">
              {loading ? 'SE SALVEAZĂ...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
