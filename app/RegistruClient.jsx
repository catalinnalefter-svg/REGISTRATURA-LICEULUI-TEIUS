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
  const [editingId, setEditingId] = useState(null);
  const [allocatedNumber, setAllocatedNumber] = useState(null);

  const listaCompartimente = ["SECRETARIAT", "CONTABILITATE", "ADMINISTRATIV", "DIRECTOR", "ACHIZIȚII", "RESURSE UMANE"];

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    emitent: '', continut: '', destinatar: '', 
    data_expediere: '', conex: '', indicativ_dosar: '', 
    compartiment: '', 
    observatii: ''
  });

  // FETCH DATA DINAMIC ÎN FUNCȚIE DE TAB
  const fetchData = useCallback(async () => {
    setLoading(true);
    let tableName = activeTab === 'general' ? 'documente' : 'registrul_deciziilor';
    
    const { data: result, error } = await supabase
      .from(tableName)
      .select('*')
      .order(activeTab === 'general' ? 'numar_inregistrare' : 'created_at', { ascending: false });
    
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
    const isGeneral = activeTab === 'general';
    const headers = isGeneral 
      ? ['Tip', 'Nr. Inreg', 'Data Inreg', 'Emitent', 'Continut', 'Compartiment', 'Creat De', 'Destinatar', 'Data Exped', 'Conex/Ind']
      : ['Nr. Decizie', 'Data', 'Continut', 'Observatii', 'Creat De'];
    
    const rows = data.map(i => {
      if (isGeneral) {
        return `
          <Row>
            <Cell><Data ss:Type="String">${i.tip || ''}</Data></Cell>
            <Cell><Data ss:Type="Number">${i.numar_inregistrare || 0}</Data></Cell>
            <Cell><Data ss:Type="String">${i.creat_la || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.emitent || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.continut || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.compartiment || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${i.creat_de || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.destinatar || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${i.data_expediere || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${i.conex_ind || ''}/${i.indicativ_dosar || ''}</Data></Cell>
          </Row>`;
      } else {
        return `
          <Row>
            <Cell><Data ss:Type="Number">${i.numar_inregistrare || 0}</Data></Cell>
            <Cell><Data ss:Type="String">${i.creat_la || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.continut || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${(i.observatii || '').replace(/&/g, '&amp;')}</Data></Cell>
            <Cell><Data ss:Type="String">${i.creat_de || ''}</Data></Cell>
          </Row>`;
      }
    }).join('');

    const excelTemplate = `
      <?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Worksheet ss:Name="${activeTab.toUpperCase()}">
          <Table>
            <Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>
            ${rows}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement('a'));
    link.href = url;
    link.download = `Export_${activeTab}_${new Date().toLocaleDateString()}.xls`;
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setLoading(true);
    let tableName = activeTab === 'general' ? 'documente' : 'registrul_deciziilor';
    
    const payload = activeTab === 'general' ? {
      tip: formType,
      creat_la: form.data,
      emitent: (form.emitent || '').toUpperCase(),
      continut: (form.continut || '').toUpperCase(),
      destinatar: (form.destinatar || '').toUpperCase(),
      compartiment: (form.compartiment || '').toUpperCase(),
      creat_de: currentUser,
      data_expediere: form.data_expediere || null,
      conex_ind: form.conex,
      indicativ_dosar: form.indicativ_dosar
    } : {
      creat_la: form.data,
      continut: (form.continut || '').toUpperCase(),
      observatii: (form.observatii || '').toUpperCase(),
      creat_de: currentUser
    };

    const { data: savedData, error } = editingId 
        ? await supabase.from(tableName).update(payload).eq('id', editingId).select() 
        : await supabase.from(tableName).insert([payload]).select();

    if (error) {
      alert("Eroare: " + error.message);
    } else {
      if (!editingId && savedData && savedData[0]) {
        setAllocatedNumber(savedData[0].numar_inregistrare);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ data: new Date().toISOString().split('T')[0], emitent: '', continut: '', destinatar: '', data_expediere: '', conex: '', indicativ_dosar: '', compartiment: '', observatii: '' });
      fetchData();
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border-t-8 border-blue-600">
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Acces Registre</h2>
          <p className="text-blue-600 font-bold mb-8 text-sm uppercase">Liceul Teoretic Teiuș</p>
          <select className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-bold border-2 border-slate-100 outline-none focus:border-blue-500" value={currentUser} onChange={e => setCurrentUser(e.target.value)}>
            <option value="">Alege compartimentul...</option>
            {listaCompartimente.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <input type="password" placeholder="Parolă" className="w-full p-4 bg-slate-50 rounded-2xl mb-6 text-center font-bold border-2 border-slate-100 outline-none focus:border-blue-500" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200">Intră</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800">
      <div className="max-w-[98%] mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
              <img src="/liceul_teoretic_teius.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Registratură Liceul Teoretic Teiuș</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Realizat de ing. Lefter C. (Sesiune: {currentUser})</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-lg shadow-emerald-100">
                <Download size={18}/> Export Excel
             </button>
             <button onClick={() => window.location.reload()} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'general' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Registru General</button>
            {/* ACTIVARE TAB DECIZII */}
            <button onClick={() => setActiveTab('decizii')} className={`flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs transition-all border-b-4 ${activeTab === 'decizii' ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>Decizii / Note</button>
            <button className="flex-1 p-4 rounded-[1.5rem] font-black uppercase text-xs bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed">Registru Registre</button>
        </div>

        {/* BUTON ADAUGARE PENTRU DECIZII */}
        {activeTab === 'decizii' && (
          <div className="mb-10">
            <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-xl transition-all w-full md:w-1/3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 bg-blue-600"><Plus size={24} strokeWidth={3}/></div>
              <h3 className="font-black text-2xl text-slate-800 mb-1">Adaugă Decizie / Notă</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creare înregistrare nouă în registrul deciziilor</p>
            </button>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            {['INTRARE', 'IESIRE', 'REZERVAT'].map(t => (
              <button key={t} onClick={() => { setFormType(t); setEditingId(null); setShowForm(true); }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-xl transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${t==='INTRARE'?'bg-emerald-500':t==='IESIRE'?'bg-blue-500':'bg-orange-500'}`}><Plus size={24} strokeWidth={3}/></div>
                <h3 className="font-black text-2xl text-slate-800 mb-1">{t}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creare înregistrare nouă</p>
              </button>
            ))}
          </div>
        )}

        {/* TABEL UNIVERSAL */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl w-96 border border-slate-100">
                <Search size={18} className="text-slate-300"/>
                <input type="text" placeholder="Caută..." className="bg-transparent outline-none font-bold text-slate-600 w-full text-sm" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400">
                {activeTab === 'general' ? (
                  <tr>
                    <th className="px-4 py-5">Tip</th>
                    <th className="px-4 py-5">Nr. Inreg.</th>
                    <th className="px-4 py-5">Data Inreg.</th>
                    <th className="px-4 py-5">Emitent</th>
                    <th className="px-4 py-5">Conținut</th>
                    <th className="px-4 py-5">Compartiment</th>
                    <th className="px-4 py-5">Creat De</th>
                    <th className="px-4 py-5">Destinatar</th>
                    <th className="px-4 py-5 text-right">Editare</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-5">Nr. Decizie</th>
                    <th className="px-4 py-5">Data</th>
                    <th className="px-4 py-5">Conținut Decizie</th>
                    <th className="px-4 py-5">Observații</th>
                    <th className="px-4 py-5">Creat De</th>
                    <th className="px-4 py-5 text-right">Editare</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-4 py-4"><span className={`px-3 py-1.5 rounded-xl text-[9px] font-black text-white uppercase tracking-wider ${item.tip==='INTRARE'?'bg-emerald-500':item.tip==='IESIRE'?'bg-blue-500':'bg-orange-500'}`}>{item.tip}</span></td>
                        <td className="px-4 py-4 text-blue-600 font-black">{item.numar_inregistrare}</td>
                        <td className="px-4 py-4">{item.creat_la}</td>
                        <td className="px-4 py-4 truncate max-w-[100px] uppercase">{item.emitent}</td>
                        <td className="px-4 py-4 truncate max-w-[150px] uppercase">{item.continut}</td>
                        <td className="px-4 py-4 uppercase">{item.compartiment}</td>
                        <td className="px-4 py-4 text-slate-400">{item.creat_de}</td>
                        <td className="px-4 py-4 uppercase">{item.destinatar}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4 text-blue-600 font-black">{item.numar_inregistrare}</td>
                        <td className="px-4 py-4">{item.creat_la}</td>
                        <td className="px-4 py-4 uppercase">{item.continut}</td>
                        <td className="px-4 py-4 uppercase">{item.observatii || '-'}</td>
                        <td className="px-4 py-4 text-slate-400">{item.creat_de}</td>
                      </>
                    )}
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.creat_la}); setShowForm(true); }} className="text-slate-300 hover:text-blue-600"><Edit2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {allocatedNumber && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 text-slate-900">
           <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg text-center shadow-2xl border-[12px] border-emerald-50">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={60} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Înregistrare Reușită!</h2>
              <p className="text-slate-400 font-bold mb-8 uppercase text-xs tracking-widest">Numărul alocat este:</p>
              <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 border-2 border-slate-100">
                <span className="text-7xl font-black text-blue-600 tracking-tighter">#{allocatedNumber}</span>
              </div>
              <button onClick={() => setAllocatedNumber(null)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl">Am înțeles</button>
           </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 text-slate-900">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-5xl shadow-2xl relative border-[12px] border-slate-50">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={32} strokeWidth={3}/></button>
            <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tighter">
              {activeTab === 'general' ? 'Date Registru General' : 'Date Decizii / Note'}
            </h2>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Data Document</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 outline-none focus:border-blue-500" />
                </div>
                {activeTab === 'general' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Emitent</label>
                    <input type="text" placeholder="SCRIE EMITENTUL..." value={form.emitent} onChange={e => setForm({...form, emitent: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 outline-none focus:border-blue-500 uppercase" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Conținut / Obiect</label>
                  <textarea value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 font-bold h-48 resize-none outline-none focus:border-blue-500 uppercase" />
                </div>
              </div>

              <div className="space-y-6">
                {activeTab === 'general' ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Compartiment</label>
                      <input type="text" placeholder="SCRIE COMPARTIMENT..." value={form.compartiment} onChange={e => setForm({...form, compartiment: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border-2 border-slate-100 outline-none focus:border-blue-500 uppercase" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Destinatar</label>
                      <input type="text" placeholder="DESTINATAR" value={form.destinatar} onChange={e => setForm({...form, destinatar: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black outline-none uppercase" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Observații</label>
                    <textarea value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 font-bold h-48 resize-none outline-none focus:border-blue-500 uppercase" />
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black text-lg uppercase shadow-xl shadow-blue-200 mt-10 transition-all">{loading ? 'SALVARE...' : 'Salvează în Registru'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
