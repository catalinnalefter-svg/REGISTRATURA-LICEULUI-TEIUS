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
    let headers = ["Tip", "Nr. Inreg.", "Data Inreg.", "Emitent", "Continut", "Compartiment", "Creat De", "Destinatar", "Data Exped.", "Conex/Ind"];
    
    let excelContent = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Worksheet ss:Name="Registru"><Table>`;
    excelContent += `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;
    
    data.forEach(i => {
      excelContent += `<Row>
        <Cell><Data ss:Type="String">${i.tip || i.tip_document || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.numar_inregistrare || i.numar_manual || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.creat_la || i.data_emitere || i.data_inceput || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.emitent || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.continut || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.compartiment || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.creat_de || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.destinatar || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.data_expedire || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${i.conex_ind || ''}</Data></Cell>
      </Row>`;
    });
    excelContent += `</Table></Worksheet></Workbook>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
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
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl w-full max-w-md text-center border border-white">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-widest">Acces Registratură</h2>
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
    <div className="min-h-screen bg-[#edf2f7] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER ACTUALIZAT - DESIGN image_880bbb.png */}
        <header className="bg-white rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-transparent flex items-center justify-center">
                <img src="/liceul_teius_logo.png" className="w-14 h-14 object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight leading-none">REGISTRATURA <span className="text-blue-600">LICEULUI TEORETIC TEIUȘ</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creat de ing. Lefter C.</p>
                <span className="text-slate-200">|</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">UTILIZATOR ACTIV: <span className="text-blue-600 font-black">{currentUser}</span></p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {['general', 'decizii', 'registre'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>
                {tab === 'decizii' ? 'DECIZII / NOTE' : `REGISTRU ${tab}`}
              </button>
            ))}
          </nav>

          <div className="flex gap-2">
            <button onClick={exportToExcel} className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-[#059669] shadow-sm"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:text-red-500 transition-all">Ieșire</button>
          </div>
        </header>

        {/* CARDURI ACTIUNE - DESIGN image_880bbb.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {activeTab === 'general' ? (
            [
                {t: 'INTRARE', c: 'bg-[#10b981]', sub: 'CREARE ÎNREGISTRARE'},
                {t: 'IESIRE', c: 'bg-[#3b82f6]', sub: 'CREARE ÎNREGISTRARE'},
                {t: 'REZERVAT', c: 'bg-[#f97316]', sub: 'CREARE ÎNREGISTRARE'}
            ].map(card => (
              <div key={card.t} onClick={() => handleOpenNew(card.t)} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group">
                <div className={`${card.c} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}><Plus size={28} strokeWidth={3}/></div>
                <h2 className="text-4xl font-black uppercase text-[#0f172a] tracking-tighter leading-none">{card.t}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{card.sub}</p>
              </div>
            ))
          ) : (
            <div onClick={() => handleOpenNew()} className="bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-md transition-all cursor-pointer group col-span-3 flex items-center gap-8">
              <div className="bg-blue-600 w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-90 transition-transform"><Plus size={36} strokeWidth={3}/></div>
              <div>
                <h2 className="text-4xl font-black uppercase text-[#0f172a] tracking-tighter">ADĂUGARE ÎN {activeTab === 'decizii' ? 'DECIZII / NOTE' : 'REGISTRUL REGISTRELOR'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apasă pentru a introduce o înregistrare nouă în acest registru</p>
              </div>
            </div>
          )}
        </div>

        {/* TABEL COMPLET CU 11 COLOANE - DESIGN image_880bbb.png */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4">
             <div className="bg-slate-50 p-3 rounded-2xl text-slate-300"><Search size={22}/></div>
             <input type="text" placeholder="Caută după nr, emitent sau conținut..." className="w-full outline-none font-bold text-slate-600 text-base" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                  <th className="px-6 py-6">Tip</th>
                  <th className="px-6 py-6">Nr. Înregistrare</th>
                  <th className="px-6 py-6">Data Inreg.</th>
                  <th className="px-6 py-6">Emitent</th>
                  <th className="px-6 py-6">Conținut</th>
                  <th className="px-6 py-6">Compartiment</th>
                  <th className="px-6 py-6">Creat De</th>
                  <th className="px-6 py-6">Destinatar</th>
                  <th className="px-6 py-6">Data Exped.</th>
                  <th className="px-6 py-6">Conex/Ind.</th>
                  <th className="px-6 py-6 text-center">Editare</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase text-white shadow-sm ${item.tip === 'INTRARE' ? 'bg-[#10b981]' : item.tip === 'IESIRE' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`}>{item.tip || item.tip_document || 'DOC'}</span>
                    </td>
                    <td className="px-6 py-6 text-blue-600 font-black text-sm">#{item.numar_inregistrare || item.numar_manual}</td>
                    <td className="px-6 py-6 text-slate-500">{item.creat_la || item.data_emitere || item.data_inceput}</td>
                    <td className="px-6 py-6 uppercase tracking-tight">{item.emitent || '-'}</td>
                    <td className="px-6 py-6 italic text-slate-600 max-w-[250px] truncate">{item.continut}</td>
                    <td className="px-6 py-6 uppercase"><span className="bg-slate-100 px-3 py-1.5 rounded-lg text-[9px] tracking-widest">{item.compartiment || '-'}</span></td>
                    <td className="px-6 py-6 text-slate-400 font-black uppercase">{item.creat_de}</td>
                    <td className="px-6 py-6 uppercase">{item.destinatar || '-'}</td>
                    <td className="px-6 py-6 text-slate-400">{item.data_expedire || '-'}</td>
                    <td className="px-6 py-6 text-blue-400">{item.conex_ind || '-'}</td>
                    <td className="px-6 py-6 text-center"><button onClick={() => { setEditingId(item.id); setForm(item); setShowForm(true); }} className="text-slate-200 hover:text-blue-500 transition-all"><Edit2 size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULAR DINAMIC - DESIGN image_86badd.png */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-[1000px] shadow-2xl relative animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-5xl font-black text-[#1e293b] uppercase tracking-tighter mb-4">Date Registru</h2>
                {activeTab === 'general' && (
                    <div className="flex gap-2">
                        {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
                            <button key={t} onClick={() => setFormType(t)} className={`px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm ${formType === t ? 'bg-[#3b82f6] text-white shadow-blue-100' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>{t}</button>
                        ))}
                    </div>
                )}
              </div>
              <button onClick={() => setShowForm(false)} className="bg-[#f1f5f9] p-5 rounded-[2rem] text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={36}/></button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                {activeTab === 'registre' && (
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">Număr Registru (Manual)</label>
                    <input type="text" placeholder="EX: 01/2026" className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none shadow-inner" value={form.numar_manual} onChange={e => setForm({...form, numar_manual: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">{activeTab === 'registre' ? 'Data Începere (Z-L-A)' : 'Data Document (Z-L-A)'}</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl border-none outline-none shadow-inner" />
                </div>
                {activeTab === 'general' && (
                    <div>
                        <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">Emitent</label>
                        <div className="flex gap-2 mb-3">
                            {['DIN OFICIU', 'ISJ ALBA', 'MINISTERUL EDUCAȚIEI'].map(e => (
                                <button key={e} onClick={() => setForm({...form, emitent: e})} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[9px] uppercase hover:bg-blue-100 transition-colors">{e}</button>
                            ))}
                        </div>
                        <input type="text" placeholder="SCRIE EMITENTUL..." className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none uppercase" value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} />
                    </div>
                )}
                <div>
                  <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">Conținut / Descriere</label>
                  <textarea placeholder="DETALII DESPRE DOCUMENT..." className="w-full p-7 bg-[#f8fafc] rounded-[3rem] font-black text-xl outline-none h-48 resize-none shadow-inner" value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} />
                </div>
              </div>

              <div className="space-y-6">
                {activeTab === 'general' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">Compartiment</label>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {['SECRETARIAT', 'CONTABILITATE', 'APP', 'ALTELE'].map(c => (
                          <button key={c} onClick={() => setForm({...form, compartment: c})} className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-colors ${form.compartiment === c ? 'bg-orange-500 text-white shadow-md shadow-orange-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>{c}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="SCRIE COMPARTIMENT..." className="w-full p-6 bg-[#f8fafc] rounded-[2rem] font-black text-xl outline-none uppercase" value={form.compartiment} onChange={e => setForm({...form, compartment: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-4">Data Expediere</label>
                        <input type="date" value={form.data_exped} onChange={e => setForm({...form, data_exped: e.target.value})} className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none shadow-inner" />
                       </div>
                       <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-4">Destinatar</label>
                        <input type="text" placeholder="CĂTRE..." className="w-full p-5 bg-[#f8fafc] rounded-2xl font-black outline-none uppercase shadow-inner" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} />
                       </div>
                    </div>
                    <div className="bg-[#eff6ff] p-8 rounded-[3.5rem] border border-blue-100 shadow-sm">
                      <h3 className="text-[#3b82f6] font-black uppercase text-[10px] text-center mb-6 tracking-widest">Legături Document (Conex/Dosar)</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[8px] font-black text-blue-400 uppercase mb-2 ml-4">Nr. Conex</p>
                            <input type="text" placeholder="EX: 45" className="w-full p-5 bg-white rounded-3xl font-black text-xl text-blue-900 shadow-inner outline-none" value={form.conex} onChange={e => setForm({...form, conex: e.target.value})} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-blue-400 uppercase mb-2 ml-4">Indicativ Dosar</p>
                            <input type="text" placeholder="EX: IV-C" className="w-full p-5 bg-white rounded-3xl font-black text-xl text-blue-900 shadow-inner outline-none" value={form.indicativ_dosar} onChange={e => setForm({...form, indicativ_dosar: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#1e293b] mb-2 block ml-4 tracking-widest">Observații / Mențiuni</label>
                    <textarea placeholder="ALTE DETALII..." className="w-full p-7 bg-[#f8fafc] rounded-[3rem] font-black text-xl outline-none h-full min-h-[300px] resize-none shadow-inner" value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full mt-10 bg-[#3b82f6] text-white p-10 rounded-[2.5rem] font-black text-3xl uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-[1.01] active:scale-[0.98] transition-all">
              {loading ? 'SE SALVEAZĂ...' : 'Salvează în Registru'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUCCES - DESIGN image_880bbb.png */}
      {lastRegNumber && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl animate-in zoom-in duration-300 max-w-lg w-full border-4 border-blue-50">
            <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner"><FileText size={48} /></div>
            <h3 className="text-slate-400 font-black uppercase tracking-widest text-[12px] mb-4">Document Înregistrat</h3>
            <p className="text-slate-900 font-black text-8xl mb-10 tracking-tighter">#{lastRegNumber}</p>
            <button onClick={() => setLastRegNumber(null)} className="w-full bg-blue-600 text-white p-8 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Închide Fișa</button>
          </div>
        </div>
      )}
    </div>
  );
}
