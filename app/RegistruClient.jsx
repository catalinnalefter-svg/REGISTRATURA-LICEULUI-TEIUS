'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, LogOut, Download } from 'lucide-react';
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
  const [formType, setFormType] = useState('INTRARE');
  const [editingId, setEditingId] = useState(null);

  const listaEmitenti = ["ISJ ALBA", "MINISTERUL EDUCAȚIEI", "PRIMĂRIA TEIUȘ", "ALTA INSTITUȚIE", "PERSOANĂ FIZICĂ"];
  const listaCompartimente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII", "RESURSE UMANE"];

  const [form, setForm] = useState({
    numar_manual: '', data: new Date().toISOString().split('T')[0], data_final: '',
    emitent: '', continut: '', destinatar: '', data_exped: '', conex: '',
    indicativ_dosar: '', compartiment: '', observatii: '', tip_document_spec: 'DECIZIE'
  });

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  // EXPORT CSV (Fără pachete externe, compatibil Excel)
  const exportToExcel = () => {
    let headers = [];
    let rows = [];

    if (activeTab === 'general') {
      headers = ['Tip', 'Nr_Inreg', 'Data', 'Emitent', 'Continut', 'Compartiment'];
      rows = data.map(i => [i.tip, i.numar_inregistrare, i.creat_la, i.emitent, i.continut, i.compartiment]);
    } else if (activeTab === 'decizii') {
      headers = ['Tip', 'Nr_Doc', 'Data', 'Continut', 'Observatii'];
      rows = data.map(i => [i.tip_document, i.numar_inregistrare, i.data_emitere, i.continut, i.observatii]);
    } else {
      headers = ['Nr_Reg', 'Data_Inceput', 'Continut', 'Data_Sfarsit', 'Observatii'];
      rows = data.map(i => [i.numar_manual, i.data_inceput, i.continut, i.data_sfarsit, i.observatii]);
    }

    const content = [headers, ...rows].map(e => e.map(v => `"${v || ''}"`).join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Registru_${activeTab}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      let payload = { continut: form.continut, creat_de: currentUser, anul: 2026, observatii: form.observatii };

      if (activeTab === 'general') {
        Object.assign(payload, {
          tip: formType, creat_la: form.data, emitent: form.emitent, destinatar: form.destinatar,
          data_expedire: form.data_exped || null, conex_ind: form.conex, indicativ_dosar: form.indicativ_dosar, compartiment: form.compartiment
        });
      } else if (activeTab === 'decizii') {
        Object.assign(payload, { tip_document: form.tip_document_spec, data_emitere: form.data });
      } else if (activeTab === 'registre') {
        Object.assign(payload, { numar_manual: form.numar_manual, data_inceput: form.data, data_sfarsit: form.data_final || null });
      }

      const { error } = editingId ? await supabase.from(table).update(payload).eq('id', editingId) : await supabase.from(table).insert([payload]);
      if (error) throw error;
      fetchData();
      setShowForm(false);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-sm text-center">
          <h2 className="text-lg font-black text-blue-600 mb-6 uppercase">Login Gestiune L.T. Teiuș</h2>
          <select className="w-full p-3 bg-slate-50 rounded-xl mb-4 font-bold border outline-none" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            {listaCompartimente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parola" className="w-full p-3 bg-slate-50 rounded-xl mb-4 text-center font-bold border outline-none" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => pass === 'liceulteius2026' ? setIsAuth(true) : alert("Eronat")} className="w-full bg-blue-600 text-white p-3 rounded-xl font-black uppercase">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-800">
      <div className="max-w-[1700px] mx-auto">
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs">LTT</div>
            <div>
              <h1 className="text-md font-black text-blue-900 uppercase leading-none">LICEUL TEORETIC TEIUȘ</h1>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Realizat de ing. Lefter C.</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                {tab === 'decizii' ? 'Decizii / Note' : tab === 'registre' ? 'Registru Registre' : 'Registru General'}
              </button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={18}/></button>
        </header>

        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button onClick={() => { setEditingId(null); setFormType('INTRARE'); setShowForm(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-md">
                  <Plus size={16} strokeWidth={3}/> Adaugă Înregistrare
              </button>
              <button onClick={exportToExcel} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-md">
                  <Download size={16} strokeWidth={3}/> Export
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border w-80">
                <Search size={16} className="text-slate-300"/>
                <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
              {activeTab === 'general' ? (
                <tr><th className="px-6 py-4">Tip</th><th className="px-6 py-4">Nr.</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Emitent</th><th className="px-6 py-4">Conținut</th><th className="px-6 py-4 text-center">Edit</th></tr>
              ) : activeTab === 'decizii' ? (
                <tr><th className="px-6 py-4">Tip</th><th className="px-6 py-4">Nr.</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Conținut</th><th className="px-6 py-4 text-center">Edit</th></tr>
              ) : (
                <tr><th className="px-6 py-4">Nr. Reg</th><th className="px-6 py-4">Început</th><th className="px-6 py-4">Conținut</th><th className="px-6 py-4">Terminare</th><th className="px-6 py-4 text-center">Edit</th></tr>
              )}
            </thead>
            <tbody className="divide-y text-[10px] font-bold text-slate-600">
              {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  {activeTab === 'general' ? (
                    <>
                      <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[8px] text-white ${item.tip === 'INTRARE' ? 'bg-emerald-500' : 'bg-blue-500'}`}>{item.tip}</span></td>
                      <td className="px-6 py-3 text-blue-600">#{item.numar_inregistrare}</td>
                      <td className="px-6 py-3">{item.creat_la}</td>
                      <td className="px-6 py-3 uppercase">{item.emitent}</td>
                      <td className="px-6 py-3 italic truncate max-w-xs">{item.continut}</td>
                    </>
                  ) : activeTab === 'decizii' ? (
                    <>
                      <td className="px-6 py-3 uppercase">{item.tip_document}</td>
                      <td className="px-6 py-3 text-blue-600">#{item.numar_inregistrare}</td>
                      <td className="px-6 py-3">{item.data_emitere}</td>
                      <td className="px-6 py-3 italic truncate max-w-xs">{item.continut}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 font-black text-blue-600">{item.numar_manual}</td>
                      <td className="px-6 py-3">{item.data_inceput}</td>
                      <td className="px-6 py-3 italic truncate max-w-xs">{item.continut}</td>
                      <td className="px-6 py-3">{item.data_sfarsit || 'Deschis'}</td>
                    </>
                  )}
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => { setEditingId(item.id); setForm({...item}); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-[2rem] p-6 w-full ${activeTab === 'general' ? 'max-w-3xl' : 'max-w-lg'} shadow-2xl relative border-[6px] border-slate-50`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase">Gestiune {activeTab}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>

            {activeTab === 'general' && (
              <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
                {['INTRARE', 'IEȘIRE', 'REZERVAT'].map(t => (
                  <button key={t} onClick={() => setFormType(t)} className={`px-4 py-1.5 rounded-lg font-black text-[9px] ${formType === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>{t}</button>
                ))}
              </div>
            )}

            <div className={`grid ${activeTab === 'general' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
              <div className="space-y-3">
                <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs" />
                {activeTab === 'general' ? (
                  <select value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs">
                    <option value="">Alege Emitent...</option>
                    {listaEmitenti.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                ) : activeTab === 'decizii' ? (
                  <select value={form.tip_document_spec} onChange={e => setForm({...form, tip_document_spec: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs">
                    <option value="DECIZIE">DECIZIE</option>
                    <option value="NOTA DE SERVICIU">NOTĂ DE SERVICIU</option>
                  </select>
                ) : (
                  <input type="text" placeholder="Număr Registru" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs" />
                )}
                <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg border font-bold h-24 resize-none outline-none text-xs" placeholder="Conținut..." />
              </div>

              <div className="space-y-3">
                {activeTab === 'general' ? (
                  <>
                    <select value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs">
                      <option value="">Compartiment Destinat...</option>
                      {listaCompartimente.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Destinatar" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nr. Conex" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-2 bg-white rounded-lg border font-bold text-xs outline-none" />
                      <input type="text" placeholder="Ind. Dosar" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-2 bg-white rounded-lg border font-bold text-xs outline-none" />
                    </div>
                  </>
                ) : (
                  <>
                    {activeTab === 'registre' && <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold border outline-none text-xs" />}
                    <input type="text" placeholder="Observații" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl font-bold border outline-none text-xs" />
                  </>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-black text-xs uppercase shadow-md">
              {loading ? 'Salvare...' : 'Confirmă'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
