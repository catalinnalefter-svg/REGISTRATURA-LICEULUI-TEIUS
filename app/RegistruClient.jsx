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

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    data_sfarsit: '',
    nr_manual: '',
    emitent: '', continut: '', destinatar: '', 
    data_expediere: '', conex: '', indicativ_dosar: '', 
    compartiment: '', observatii: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    let tableName = 'documente';
    if (activeTab === 'decizii') tableName = 'registrul_deciziilor';
    if (activeTab === 'registre') tableName = 'registrul_registrelor';

    const { data: result, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: false });
    
    if (!error) setData(result || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (!currentUser) { alert("Alegeți un compartiment!"); return; }
    if (pass === 'liceulteius2026') setIsAuth(true);
    else alert("Parolă incorectă!");
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = "";
    let rows = [];

    if (activeTab === 'general') {
      headers = "Tip,Nr Inregistrare,Data,Emitent,Continut,Compartiment,Destinatar";
      rows = data.map(i => `"${i.tip}","${i.numar_inregistrare}","${i.creat_la}","${i.emitent}","${i.continut}","${i.compartiment}","${i.destinatar}"`);
    } else if (activeTab === 'decizii') {
      headers = "Tip,Nr Document,Data,Continut,Observatii";
      rows = data.map(i => `"${i.tip_document}","${i.numar_inregistrare}","${i.data_emitere}","${i.continut}","${i.observatii}"`);
    } else {
      headers = "Nr Registru,Data Inceput,Continut,Data Terminare,Observatii";
      rows = data.map(i => `"${i.numar_inregistrare}","${i.data_inceput}","${i.continut}","${i.data_sfarsit}","${i.observatii}"`);
    }

    const finalCsv = csvContent + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(finalCsv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_${activeTab}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (activeTab === 'registre' && isNaN(form.nr_manual) && form.nr_manual !== '') {
        alert("Eroare: Câmpul 'Nr. Registru' trebuie să conțină doar cifre!");
        return;
    }

    setLoading(true);
    const tableName = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    
    let payload = {};

    if (activeTab === 'general') {
      payload = {
        tip: formType,
        creat_la: form.data,
        emitent: form.emitent.toUpperCase(),
        continut: form.continut.toUpperCase(),
        destinatar: form.destinatar.toUpperCase(),
        compartiment: form.compartiment.toUpperCase(),
        creat_de: currentUser,
        data_expediere: form.data_expediere || null,
        conex_ind: form.conex,
        indicativ_dosar: form.indicativ_dosar
      };
    } else if (activeTab === 'registre') {
      payload = {
        numar_inregistrare: parseInt(form.nr_manual) || null,
        data_inceput: form.data,
        data_sfarsit: form.data_sfarsit || null,
        continut: form.continut.toUpperCase(),
        observatii: form.observatii.toUpperCase(),
        creat_de: currentUser,
        anul: new Date().getFullYear(),
        compartiment: currentUser
      };
    } else {
      payload = {
        tip_document: activeTab === 'decizii' ? decizieType : 'REGISTRU',
        data_emitere: form.data,
        continut: form.continut.toUpperCase(),
        observatii: form.observatii.toUpperCase(),
        creat_de: currentUser,
        anul: new Date().getFullYear(),
        compartiment: currentUser
      };
    }

    const { data: savedData, error } = editingId 
        ? await supabase.from(tableName).update(payload).eq('id', editingId).select() 
        : await supabase.from(tableName).insert([payload]).select();

    if (error) {
      alert("Eroare: " + error.message);
    } else {
      if (!editingId && savedData?.[0]) setAllocatedNumber(savedData[0].numar_inregistrare);
      setShowForm(false);
      setEditingId(null);
      setForm({ data: new Date().toISOString().split('T')[0], data_sfarsit: '', nr_manual: '', emitent: '', continut: '', destinatar: '', data_expediere: '', conex: '', indicativ_dosar: '', compartiment: '', observatii: '' });
      fetchData();
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border-t-8 border-blue-600">
          {/* LOGO IN LOGIN */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center border-2 border-blue-100 shadow-inner">
               <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" onError={(e) => e.target.src="https://cdn-icons-png.flaticon.com/512/2641/2641409.png"} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Acces Registre</h2>
          <p className="text-blue-600 font-bold mb-8 text-sm uppercase">Liceul Teoretic Teiuș</p>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border-2 border-slate-100 outline-none text-slate-900" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege compartimentul...</option>
            {listaCompartimente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parolă" className="w-full p-4 bg-slate-50 rounded-2xl mb-6 text-center font-bold border-2 border-slate-100 outline-none text-slate-900" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Intră</button>
          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Realizat de ing. Lefter C.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800 flex flex-col">
      <div className="max-w-[98%] mx-auto flex-grow">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
             {/* LOGO IN HEADER */}
             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.src="https://cdn-icons-png.flaticon.com/512/2641/2641409.png"} />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Liceul Teoretic Teiuș</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sistem de Gestiune Registre</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4 hidden md:block">
                <p className="text-[9px] font-black text-slate-300 uppercase">Utilizator Activ</p>
                <p className="text-sm font-black text-slate-700 uppercase">{currentUser}</p>
            </div>
            <button onClick={exportToExcel} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
              <Download size={16}/> Export Excel
            </button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={20}/></button>
          </div>
        </header>

        {/* TAB-URI */}
        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'general' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru General</button>
            <button onClick={() => setActiveTab('decizii')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'decizii' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Decizii / Note</button>
            <button onClick={() => setActiveTab('registre')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'registre' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru Registre</button>
        </div>

        {/* ... (Restul secțiunilor de Adăugare și Tabel rămân neschimbate) ... */}
        
        {/* REZUMATUL TABELULUI (pentru scurtare am păstrat doar logica) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl w-96 border border-slate-100">
                    <Search size={18} className="text-slate-300"/>
                    <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            {/* ... Aici vine tabelul din răspunsul anterior ... */}
        </div>
      </div>

      {/* FOOTER SEMNĂTURĂ */}
      <footer className="mt-10 py-6 text-center border-t border-slate-100">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Realizat de ing. Lefter C. © 2026</p>
      </footer>

      {/* ... (Include aici și Modalele de Formular și Succes din codul anterior) ... */}
    </div>
  );
}
