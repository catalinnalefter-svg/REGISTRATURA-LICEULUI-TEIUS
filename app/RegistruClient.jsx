'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Edit2, LogOut, Download, Plus, CheckCircle2 } from 'lucide-react';
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
  const [decizieType, setDecizieType] = useState('DECIZIE'); 
  const [editingId, setEditingId] = useState(null);
  const [allocatedNumber, setAllocatedNumber] = useState(null);

  const listaCompartimente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII", "RESURSE UMANE"];

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    data_sfarsit: '',
    nr_manual: '',
    emitent: '',
    continut: '',
    destinatar: '',
    data_expediere: '',
    conex: '',
    indicativ_dosar: '',
    compartiment: '',
    observatii: ''
  });

  const fetchData = useCallback(async () => {
    let tableName = 'documente';
    if (activeTab === 'decizii') tableName = 'registrul_deciziilor';
    if (activeTab === 'registre') tableName = 'registrul_registrelor';
    if (activeTab === 'delegatii') tableName = 'registrul_delegatiilor';

    const { data: result, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: false });

    if (!error) setData(result);
  }, [activeTab]);

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (pass === 'teius2024' && currentUser !== '') {
      setIsAuth(true);
    } else {
      alert('Parolă incorectă sau compartiment neselectat!');
    }
  };

  const handleExport = () => {
    let headers = "";
    let rows = [];

    if (activeTab === 'general') {
      headers = "Tip;Nr;Data;Emitent;Continut;Compartiment;Destinatar;Data Expediere;Conex";
      rows = data.map(i => `"${i.tip_document}";"${i.numar_inregistrare}";"${i.creat_la}";"${i.emitent}";"${i.continut}";"${i.compartiment}";"${i.destinatar}";"${i.data_expediere}";"${i.conex_ind}"`);
    } else if (activeTab === 'registre') {
      headers = "Nr Registru;Data Inceput;Continut;Data Terminare;Observatii";
      rows = data.map(i => `"${i.numar_inregistrare}";"${i.data_inceput}";"${i.continut}";"${i.data_sfarsit}";"${i.observatii}"`);
    } else if (activeTab === 'delegatii') {
      headers = "Nr;Nume si Prenume;Ruta;Data";
      rows = data.map(i => `"${i.numar_inregistrare}";"${i.nume_prenume}";"${i.ruta}";"${i.data_delegatie}"`);
    } else {
      headers = "Tip;Nr Document;Data;Continut;Observatii";
      rows = data.map(i => `"${i.tip_document}";"${i.numar_inregistrare}";"${i.data_emitere}";"${i.continut}";"${i.observatii}"`);
    }

    const csvContent = "\uFEFF" + headers + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `registru_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let payload = {};
      let tableName = 'documente';

      if (activeTab === 'general') {
        tableName = 'documente';
        payload = {
          tip_document: formType,
          creat_la: form.data,
          emitent: form.emitent.toUpperCase(),
          continut: form.continut.toUpperCase(),
          destinatar: form.destinatar.toUpperCase(),
          compartiment: form.compartiment.toUpperCase(),
          creat_de: currentUser
        };
      } else if (activeTab === 'registre') {
        tableName = 'registrul_registrelor';
        payload = {
          numar_inregistrare: form.nr_manual,
          data_inceput: form.data,
          continut: form.continut.toUpperCase(),
          data_sfarsit: form.data_sfarsit || null,
          observatii: form.observatii.toUpperCase(),
          creat_de: currentUser
        };
      } else if (activeTab === 'delegatii') {
        tableName = 'registrul_delegatiilor';
        payload = {
          nume_prenume: form.emitent.toUpperCase(),
          ruta: form.continut.toUpperCase(),
          data_delegatie: form.data,
          creat_de: currentUser
        };
      } else {
        tableName = 'registrul_deciziilor';
        payload = {
          tip_document: decizieType,
          data_emitere: form.data,
          continut: form.continut.toUpperCase(),
          observatii: form.observatii.toUpperCase(),
          creat_de: currentUser
        };
      }

      if (editingId) {
        await supabase.from(tableName).update(payload).eq('id', editingId);
      } else {
        const { data: res } = await supabase.from(tableName).insert([payload]).select();
        if (res && res[0]) setAllocatedNumber(res[0].numar_inregistrare);
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-black mb-6 uppercase">Acces Registre</h2>
          <select className="w-full p-4 bg-slate-50 rounded-xl mb-4 outline-none border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege compartimentul...</option>
            {listaCompartimente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parolă" className="w-full p-4 bg-slate-50 rounded-xl mb-6 text-center outline-none border" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase hover:bg-blue-700">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl font-black uppercase text-slate-800">Liceul Teoretic Teiuș</h1>
            <p className="text-xs font-bold text-blue-600 uppercase">Utilizator: {currentUser}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleExport} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2"><Download size={16}/> Export CSV</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-400 p-2 rounded-xl"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          {['general', 'decizii', 'registre', 'delegatii'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 p-4 rounded-xl font-black uppercase text-xs transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>{tab}</button>
          ))}
        </div>

        <button onClick={() => { setEditingId(null); setShowForm(true); }} className="w-full mb-8 bg-white p-6 rounded-2xl shadow-sm border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 transition-all"><Plus size={20}/> Adaugă Înregistrare Nouă</button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                <Search size={18} className="text-slate-400"/>
                <input type="text" placeholder="Caută în conținut..." className="bg-transparent outline-none w-full font-medium" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                            <th className="p-4">Nr.</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Detalii / Conținut</th>
                            <th className="p-4 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {data.filter(i => (i.continut || i.nume_prenume || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-black text-blue-600">{item.numar_inregistrare}</td>
                                <td className="p-4">{formatDate(item.creat_la || item.data_emitere || item.data_inceput || item.data_delegatie)}</td>
                                <td className="p-4 uppercase font-medium">{item.continut || item.nume_prenume}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => { setEditingId(item.id); setForm(item); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-black mb-6 uppercase">Detalii Înregistrare</h2>
            <div className="space-y-4">
                <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" />
                <input type="text" placeholder="EMITENT / NUME" value={form.emitent || form.nume_prenume} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold uppercase" />
                <textarea placeholder="CONȚINUT / RUTĂ" value={form.continut || form.ruta} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold uppercase h-32" />
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase shadow-lg hover:bg-blue-700 transition-all">
                    {loading ? 'Se salvează...' : 'Salvează'}
                </button>
            </div>
          </div>
        </div>
      )}

      {allocatedNumber && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 text-slate-900">
           <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg text-center border-[12px] border-emerald-50 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
              <h2 className="text-xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Înregistrare Reușită!</h2>
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border-2 border-slate-100">
                <span className="block text-xs font-black text-slate-400 uppercase mb-1">Număr Alocat</span>
                <span className="text-6xl font-black text-blue-600 tracking-tighter">{allocatedNumber}</span>
              </div>
              <button onClick={() => setAllocatedNumber(null)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase hover:bg-slate-800 transition-all">Închide</button>
           </div>
        </div>
      )}
    </div>
  );
}
