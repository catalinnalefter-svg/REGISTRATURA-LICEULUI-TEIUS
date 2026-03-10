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

  // Rezolvare vizibilitate logo: Folosim calea absoluta si un cache-breaker
  const logoPath = "/liceul_teius_logo.png";

  const fetchData = useCallback(async () => {
    let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleOpenNew = (type) => {
    setFormType(type || 'INTRARE');
    setEditingId(null);
    setForm({ ...initialFormState, compartiment: currentUser });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.continut) return alert('Introduceți conținutul!');
    setLoading(true);
    try {
      let table = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registrul_registrelor');
      
      // Mapare coloane conform erorilor din poze (Supabase foloseste snake_case)
      let payload = { 
        continut: form.continut, 
        creat_de: currentUser, 
        anul: 2026,
        observatii: form.observatii
      };

      if (activeTab === 'general') {
        payload = { 
          ...payload, 
          tip: formType, 
          creat_la: form.data, 
          emitent: (form.emitent || '').toUpperCase(), 
          destinatar: (form.destinatar || '').toUpperCase(), 
          data_expedire: form.data_exped || null, 
          conex_ind: form.conex, 
          indicativ_dosar: form.indicativ_dosar, 
          compartiment: form.compartiment 
        };
      } else if (activeTab === 'decizii') {
        // Corectie pentru eroarea "violates check constraint": asiguram uppercase
        payload = { 
          ...payload, 
          tip_document: form.tip_document_spec.toUpperCase(), 
          data_emitere: form.data 
        };
      } else if (activeTab === 'registre') {
        // Aliniere cu structura tabelului pentru Registru Registre
        payload = { 
          ...payload, 
          numar_manual: form.numar_manual, // Asigura-te ca aceasta coloana exista in DB
          data_inceput: form.data, 
          data_sfarsit: form.data_final || null 
        };
      }

      const { data: saved, error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).select()
        : await supabase.from(table).insert([payload]).select();

      if (error) {
          console.error("Supabase Error:", error);
          throw new Error(error.message);
      }

      if (!editingId && saved && saved[0]) {
          setLastRegNumber(activeTab === 'registre' ? saved[0].numar_manual : saved[0].numar_inregistrare);
      }
      
      fetchData();
      setShowForm(false);
    } catch (err) { 
        alert("Eroare Bază de Date: " + err.message); 
    }
    setLoading(false);
  };

  const exportToExcel = () => {
    const fileName = `Export_${activeTab}_2026.xls`;
    let headers = activeTab === 'general' 
        ? ["Tip", "Nr", "Data", "Emitent", "Continut", "Compartiment"] 
        : ["Tip/Nr", "Data", "Continut", "Observatii"];
        
    let excelContent = `<table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    data.forEach(i => {
      excelContent += `<tr>
        <td>${i.tip || i.tip_document || i.numar_manual}</td>
        <td>${i.numar_inregistrare || i.data_inceput || ''}</td>
        <td>${i.creat_la || i.data_emitere || ''}</td>
        <td>${i.continut}</td>
        <td>${i.observatii || i.compartiment || ''}</td>
      </tr>`;
    });
    excelContent += `</table>`;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center">
          <img src={logoPath} className="w-20 h-20 mx-auto mb-4" alt="Logo" />
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase">Acces Registratură</h2>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold outline-none border" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege Departamentul...</option>
            <option value="SECRETARIAT">SECRETARIAT</option>
            <option value="CONTABILITATE">CONTABILITATE</option>
            <option value="ADMINISTRATIV">ADMINISTRATIV</option>
          </select>
          <input type="password" placeholder="Parola" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-bold outline-none border" value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={() => { if(pass === 'liceulteius2026' && currentUser) setIsAuth(true); }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg">Intră în Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border">
                <img src={logoPath} className="w-12 h-12 object-contain" alt="Logo Liceu" onError={(e) => e.target.src='https://via.placeholder.com/150?text=LOGO'} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase leading-none">REGISTRATURA <span className="text-blue-600">LICEULUI TEORETIC TEIUȘ</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 tracking-tighter">UTILIZATOR ACTIV: <span className="text-blue-600 font-black">{currentUser}</span></p>
            </div>
          </div>
          
          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl my-4 md:my-0">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}>
                {tab === 'decizii' ? 'DECIZII / NOTE' : tab === 'registre' ? 'REGISTRU REGISTRE' : 'REGISTRU GENERAL'}
              </button>
            ))}
          </nav>

          <div className="flex gap-2">
            <button onClick={exportToExcel} className="bg-[#10b981] text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2"><Download size={14}/> Export</button>
            <button onClick={() => window.location.reload()} className="bg-red-50 text-red-500 px-5 py-3 rounded-2xl font-black text-[10px] uppercase">Ieșire</button>
          </div>
        </header>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {activeTab === 'general' ? (
            ['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <div key={t} onClick={() => handleOpenNew(t)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-md cursor-pointer transition-all active:scale-95 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${t === 'INTRARE' ? 'bg-[#10b981]' : t === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}><Plus size={24}/></div>
                <h2 className="text-3xl font-black uppercase text-slate-800">{t}</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Creare înregistrare nouă</p>
              </div>
            ))
          ) : (
            <div onClick={() => handleOpenNew()} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-white hover:shadow-md cursor-pointer col-span-3 flex items-center gap-6 active:scale-[0.98] transition-all">
              <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"><Plus size={30}/></div>
              <h2 className="text-3xl font-black uppercase text-slate-800 tracking-tighter">ADĂUGARE ÎN {activeTab === 'decizii' ? 'DECIZII / NOTE' : 'REGISTRUL REGISTRELOR'}</h2>
            </div>
          )}
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-4">
             <Search className="text-slate-300" size={20}/>
             <input type="text" placeholder="Caută în tabel..." className="w-full outline-none font-bold text-slate-500" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-6 py-5">Tip</th><th className="px-6 py-5">Nr. Inreg</th><th className="px-6 py-5">Data</th><th className="px-6 py-5">Emitent</th><th className="px-6 py-5">Continut</th><th className="px-6 py-5">Compartiment</th><th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                ) : activeTab === 'decizii' ? (
                  <tr>
                    <th className="px-6 py-5">Tip</th><th className="px-6 py-5">Nr. Doc</th><th className="px-6 py-5">Data</th><th className="px-6 py-5">Continut</th><th className="px-6 py-5">Observatii</th><th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-5">Nr. Registru</th><th className="px-6 py-5">Data Inceput</th><th className="px-6 py-5">Continut</th><th className="px-6 py-5">Data Final</th><th className="px-6 py-5">Observatii</th><th className="px-6 py-5 text-center">Edit</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-6 py-5"><span className={`px-3 py-1 rounded-md text-[9px] font-black text-white ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>{item.tip}</span></td>
                        <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-5">{item.creat_la}</td>
                        <td className="px-6 py-5 uppercase">{item.emitent}</td>
                        <td className="px-6 py-5 italic max-w-xs truncate">{item.continut}</td>
                        <td className="px-6 py-5 uppercase">{item.compartiment}</td>
                      </>
                    ) : activeTab === 'decizii' ? (
                      <>
                        <td className="px-6 py-5 uppercase">{item.tip_document}</td>
                        <td className="px-6 py-5 text-blue-600 font-black">#{item.numar_inregistrare}</td>
                        <td className="px-6 py-5">{item.data_emitere}</td>
                        <td className="px-6 py-5 italic">{item.continut}</td>
                        <td className="px-6 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-5 text-blue-600 font-black">{item.numar_manual}</td>
                        <td className="px-6 py-5">{item.data_inceput}</td>
                        <td className="px-6 py-5 italic">{item.continut}</td>
                        <td className="px-6 py-5">{item.data_sfarsit || 'Deschis'}</td>
                        <td className="px-6 py-5 text-slate-400">{item.observatii || '-'}</td>
                      </>
                    )}
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.creat_la || item.data_emitere || item.data_inceput}); setShowForm(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR MODAL DINAMIC */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-[950px] shadow-2xl relative max-h-[95vh] overflow-y-auto border-4 border-blue-50">
            
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
                DATE {activeTab === 'general' ? `REGISTRU ${formType}` : activeTab === 'decizii' ? 'DECIZIE / NOTĂ' : 'REGISTRU NOU'}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500"><X size={28}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* COLOANA STANGA */}
              <div className="space-y-5">
                {activeTab === 'decizii' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Tip Document</label>
                    <div className="flex gap-2">
                      {['DECIZIE', 'NOTA DE SERVICIU'].map(t => (
                        <button key={t} onClick={() => setForm({...form, tip_document_spec: t})} className={`flex-1 py-3 rounded-xl font-black text-[10px] border-2 transition-all ${form.tip_document_spec === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Număr Registru (Manual)</label>
                    <input type="text" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border focus:border-blue-500 outline-none" placeholder="Ex: 01/2026" />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">{activeTab === 'registre' ? 'Data Începere' : 'Data Document'}</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                </div>

                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Data Terminare</label>
                    <input type="date" value={form.data_final} onChange={e => setForm({...form, data_final: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Conținut / Descriere</label>
                  <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none h-40 resize-none focus:ring-2 ring-blue-100" placeholder="Introduceți detaliile..." />
                </div>
              </div>

              {/* COLOANA DREAPTA */}
              <div className="space-y-5">
                {activeTab === 'general' ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Compartiment</label>
                      <input type="text" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Emitent</label>
                      <input type="text" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" placeholder="De la cine vine?" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Destinatar</label>
                      <input type="text" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none uppercase" placeholder="Către cine merge?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-2">Conex</label>
                            <input type="text" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-2">Dosar</label>
                            <input type="text" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none" />
                        </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Observații / Mențiuni</label>
                    <textarea value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold border outline-none h-64 resize-none" placeholder="Alte informații..." />
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-8 bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xl uppercase shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.97]">
              {loading ? 'SE SALVEAZĂ ÎN BAZA DE DATE...' : editingId ? 'SALVEAZĂ MODIFICĂRILE' : 'SALVEAZĂ ÎN REGISTRU'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUCCES NR INREGISTRARE */}
      {lastRegNumber && (
        <div className="fixed inset-0 bg-blue-900/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl max-w-sm w-full border-t-8 border-blue-500">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6"><FileText size={40} /></div>
            <p className="text-slate-400 font-black uppercase text-[10px] mb-2">Număr Acordat</p>
            <h3 className="text-slate-900 font-black text-7xl mb-8 tracking-tighter">#{lastRegNumber}</h3>
            <button onClick={() => setLastRegNumber(null)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm">Am notat</button>
          </div>
        </div>
      )}
    </div>
  );
}
