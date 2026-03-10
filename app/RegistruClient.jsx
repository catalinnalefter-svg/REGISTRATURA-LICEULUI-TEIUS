'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Download, FileText, Edit2 } from 'lucide-react';
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
  const [lastRegNumber, setLastRegNumber] = useState(null);

  const initialFormState = {
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
  };

  const [form, setForm] = useState(initialFormState);

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('numar_inregistrare', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleOpenNew = (type) => {
    setFormType(type || 'INTRARE');
    setEditingId(null);
    setForm({ ...initialFormState, compartiment: currentUser });
    setShowForm(true);
  };

  const exportToExcel = () => {
    const fileName = `Registru_${activeTab}_2026.xls`;
    let headers = activeTab === 'general' 
      ? ["Tip", "Nr", "Data", "Emitent", "Continut", "Compartiment", "Creat De", "Destinatar", "Data Exped.", "Conex/Ind"]
      : activeTab === 'decizii' 
        ? ["Nr", "Tip", "Data Emitere", "Continut", "Observatii", "Creat De"]
        : ["Nr", "Data Incepere", "Data Terminare", "Continut", "Observatii", "Creat De"];

    let html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    data.forEach(i => {
      if (activeTab === 'general') {
        html += `<tr><td>${i.tip}</td><td>${i.numar_inregistrare}</td><td>${i.creat_la}</td><td>${i.emitent}</td><td>${i.continut}</td><td>${i.compartiment}</td><td>${i.creat_de}</td><td>${i.destinatar}</td><td>${i.data_expedire}</td><td>${i.conex_ind}</td></tr>`;
      } else if (activeTab === 'decizii') {
        html += `<tr><td>${i.numar_inregistrare}</td><td>${i.tip_document}</td><td>${i.data_emitere}</td><td>${i.continut}</td><td>${i.observatii}</td><td>${i.creat_de}</td></tr>`;
      } else {
        html += `<tr><td>${i.numar_manual}</td><td>${i.data_inceput}</td><td>${i.data_sfarsit}</td><td>${i.continut}</td><td>${i.observatii}</td><td>${i.creat_de}</td></tr>`;
      }
    });
    html += "</table></body></html>";

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleSave = async () => {
    if (!form.continut) return alert('Introduceți conținutul!');
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { continut: form.continut, creat_de: currentUser, anul: 2026 };

      if (activeTab === 'general') {
        payload = { ...payload, tip: formType, creat_la: form.data, emitent: form.emitent.toUpperCase(), destinatar: form.destinatar.toUpperCase(), data_expedire: form.data_exped, conex_ind: form.conex, indicativ_dosar: form.indicativ_dosar, compartiment: form.compartiment };
      } else if (activeTab === 'decizii') {
        payload = { ...payload, tip_document: form.tip_document_spec, data_emitere: form.data, observatii: form.observatii };
      } else {
        payload = { ...payload, numar_manual: form.numar_manual, data_inceput: form.data, data_sfarsit: form.data_final, observatii: form.observatii };
      }

      const { data: saved, error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).select()
        : await supabase.from(table).insert([payload]).select();

      if (error) throw error;
      if (!editingId && saved) setLastRegNumber(activeTab === 'registre' ? saved[0].numar_manual : saved[0].numar_inregistrare);
      
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
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border border-slate-100 outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
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
      <div className="max-w-[1700px] mx-auto">
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo Liceu" />
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase leading-none">REGISTRATURA <span className="text-blue-500">LICEULUI TEORETIC TEIUȘ</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Utilizator: <span className="text-blue-600">{currentUser}</span></p>
            </div>
          </div>
          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                {tab === 'decizii' ? 'DECIZII / NOTE' : `REGISTRU ${tab}`}
              </button>
            ))}
          </nav>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-sm"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
          </div>
        </header>

        {/* ADAUGARE REGISTRE SPECIFICE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {activeTab === 'general' ? (
            ['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <div key={t} onClick={() => handleOpenNew(t)} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${t === 'INTRARE' ? 'bg-[#10b981]' : t === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}><Plus size={24}/></div>
                <h2 className="text-3xl font-black uppercase">{t}</h2>
              </div>
            ))
          ) : (
            <div onClick={() => handleOpenNew()} className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group col-span-3 flex items-center gap-6">
              <div className="bg-blue-600 w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-lg"><Plus size={32}/></div>
              <h2 className="text-4xl font-black uppercase text-[#0f172a]">ADĂUGARE ÎN {activeTab === 'decizii' ? 'DECIZII / NOTE' : 'REGISTRUL REGISTRELOR'}</h2>
            </div>
          )}
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
             <Search className="text-slate-300" size={20}/>
             <input type="text" placeholder="Caută în tabel..." className="w-full outline-none font-bold text-slate-600" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-5">Nr. / Tip</th>
                  <th className="px-6 py-5">Data</th>
                  <th className="px-6 py-5">Conținut</th>
                  <th className="px-6 py-5">Compartiment / Obs</th>
                  <th className="px-6 py-5">Creat De</th>
                  <th className="px-6 py-5 text-center">Editare</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                    <td className="px-6 py-6 text-blue-600 text-sm">#{item.numar_inregistrare || item.numar_manual} <span className="text-[9px] text-slate-300 ml-2">{item.tip || item.tip_document || ''}</span></td>
                    <td className="px-6 py-6 text-slate-500">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                    <td className="px-6 py-6 italic truncate max-w-xs">{item.continut}</td>
                    <td className="px-6 py-6 uppercase font-black">{item.compartiment || item.observatii || '-'}</td>
                    <td className="px-6 py-6 text-slate-400">{item.creat_de}</td>
                    <td className="px-6 py-6 text-center"><button onClick={() => { setEditingId(item.id); setForm(item); setShowForm(true); }} className="text-slate-200 hover:text-blue-500"><Edit2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR DINAMIC */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-[1000px] shadow-2xl relative">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-4xl font-black text-[#1e293b] uppercase tracking-tighter">
                {activeTab === 'general' ? 'Date Registru' : activeTab === 'decizii' ? 'Decizii / Note' : 'Registru Nou'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-[#f1f5f9] p-4 rounded-3xl text-slate-400 hover:text-red-500 transition-all"><X size={32}/></button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-6">
                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block">Număr Registru (Manual)</label>
                    <input type="text" placeholder="EX: 01/2026" className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} />
                  </div>
                )}
                {activeTab === 'decizii' && (
                  <div>
                    <label className="text-[11px] font-black uppercase mb-2 block">Tip Document</label>
                    <div className="flex gap-2">
                        {['DECIZIE', 'NOTA SERVICIU'].map(t => (
                            <button key={t} onClick={() => setForm({...form, tip_document_spec: t})} className={`px-6 py-3 rounded-xl font-black text-[10px] ${form.tip_document_spec === t ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>{t}</button>
                        ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase mb-2 block">
                    {activeTab === 'registre' ? 'Data Începere' : 'Data Document'}
                  </label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none" />
                </div>
                {activeTab === 'registre' && (
                   <div>
                    <label className="text-[11px] font-black uppercase mb-2 block">Data Terminare</label>
                    <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none" />
                   </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase mb-2 block">Conținut</label>
                  <textarea placeholder="DETALII..." className="w-full p-6 bg-[#f8fafc] rounded-[3rem] font-black text-xl outline-none h-40 resize-none" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
                </div>
              </div>

              <div className="space-y-6">
                {activeTab === 'general' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-black uppercase mb-2 block">Compartiment</label>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {['SECRETARIAT', 'CONTABILITATE', 'ACHIZIȚII', 'ADMINISTRATIV', 'DIRECTOR'].map(c => (
                          <button key={c} onClick={() => setForm({...form, compartment: c})} className={`px-4 py-2 rounded-xl font-black text-[10px] ${form.compartiment === c ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}>{c}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="SCRIE COMPARTIMENT..." className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none uppercase" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="DESTINATAR" className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none uppercase" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                       <input type="text" placeholder="NR. CONEX" className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none shadow-sm" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[11px] font-black uppercase mb-2 block">Observații</label>
                    <textarea placeholder="ALTE MENȚIUNI..." className="w-full p-6 bg-[#f8fafc] rounded-[3rem] font-black text-xl outline-none h-40 resize-none" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-[#3b82f6] text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-2xl hover:scale-[1.01] transition-all">
              {loading ? 'SE SALVEAZĂ...' : 'Salvează Înregistrarea'}
            </button>
          </div>
        </div>
      )}

      {/* ANUNT NUMAR */}
      {lastRegNumber && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl max-w-lg w-full">
            <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-8"><FileText size={48} /></div>
            <h3 className="text-slate-400 font-black uppercase text-[12px] mb-4">Înregistrat cu Succes</h3>
            <p className="text-slate-900 font-black text-8xl mb-10 tracking-tighter">#{lastRegNumber}</p>
            <button onClick={() => setLastRegNumber(null)} className="w-full bg-blue-600 text-white p-7 rounded-3xl font-black uppercase shadow-xl hover:bg-blue-700 transition-all">Închide</button>
          </div>
        </div>
      )}
    </div>
  );
}
