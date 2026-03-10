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
    nr_registru_manual: '',
    emitent: '', continut: '', destinatar: '', 
    data_expediere: '', conex: '', indicativ_dosar: '', 
    compartiment: '', observatii: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    let tableName = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registru_registre');
    const { data: result, error } = await supabase.from(tableName).select('*').order('id', { ascending: false });
    if (!error) setData(result || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (pass === 'liceulteius2026' && currentUser) setIsAuth(true);
    else alert("Date incorecte!");
  };

  const exportToExcel = () => {
    const headers = activeTab === 'registre' 
      ? ['Nr. Registru', 'Data Inceput', 'Continut', 'Data Terminare', 'Observatii']
      : activeTab === 'decizii' ? ['Tip', 'Nr', 'Data', 'Continut', 'Observatii'] : [];
    
    const rows = data.map(i => {
      if (activeTab === 'registre') {
        return `<Row>
          <Cell><Data ss:Type="String">${i.numar_inregistrare || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${i.data_inceput || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${(i.continut || '').replace(/&/g, '&amp;')}</Data></Cell>
          <Cell><Data ss:Type="String">${i.data_sfarsit || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${(i.observatii || '').replace(/&/g, '&amp;')}</Data></Cell>
        </Row>`;
      }
      // ... restul logicii de export
      return '';
    }).join('');

    const excelTemplate = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Export"><Table>${rows}</Table></Worksheet></Workbook>`;
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Export_${activeTab}.xls`;
    link.click();
  };

  const handleSave = async () => {
    setLoading(true);
    const tableName = activeTab === 'general' ? 'documente' : (activeTab === 'decizii' ? 'registrul_deciziilor' : 'registru_registre');
    let payload = {};

    if (activeTab === 'registre') {
      payload = {
        numar_inregistrare: form.nr_registru_manual,
        data_inceput: form.data,
        continut: form.continut.toUpperCase(),
        data_sfarsit: form.data_sfarsit || null,
        observatii: form.observatii.toUpperCase(),
        creat_de: currentUser,
        anul: new Date().getFullYear()
      };
    } else if (activeTab === 'decizii') {
      payload = {
        tip_document: decizieType,
        data_emitere: form.data,
        continut: form.continut.toUpperCase(),
        observatii: form.observatii.toUpperCase(),
        creat_de: currentUser
      };
    } else {
      payload = { tip: formType, creat_la: form.data, emitent: form.emitent.toUpperCase(), continut: form.continut.toUpperCase(), destinatar: form.destinatar.toUpperCase(), compartiment: form.compartiment.toUpperCase(), creat_de: currentUser, conex_ind: form.conex, indicativ_dosar: form.indicativ_dosar };
    }

    const { data: saved, error } = editingId ? await supabase.from(tableName).update(payload).eq('id', editingId).select() : await supabase.from(tableName).insert([payload]).select();
    if (error) alert("Eroare: " + error.message);
    else {
      if (!editingId && saved?.[0]) setAllocatedNumber(saved[0].numar_inregistrare);
      setShowForm(false); setEditingId(null); fetchData();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800">
      <div className="max-w-[98%] mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm">
          <h1 className="text-xl font-black uppercase">Sistem Registre - Liceul Teiuș</h1>
          <div className="flex gap-4">
            <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Download size={16}/> Export Excel</button>
            <button onClick={() => window.location.reload()} className="bg-slate-100 p-3 rounded-xl"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs ${activeTab === 'general' ? 'bg-white border-b-4 border-blue-600 shadow-md' : 'bg-slate-100 text-slate-400'}`}>Registru General</button>
            <button onClick={() => setActiveTab('decizii')} className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs ${activeTab === 'decizii' ? 'bg-white border-b-4 border-blue-600 shadow-md' : 'bg-slate-100 text-slate-400'}`}>Decizii / Note</button>
            <button onClick={() => setActiveTab('registre')} className={`flex-1 p-4 rounded-2xl font-black uppercase text-xs ${activeTab === 'registre' ? 'bg-white border-b-4 border-blue-600 shadow-md' : 'bg-slate-100 text-slate-400'}`}>Registru Registre</button>
        </div>

        {activeTab === 'registre' && (
          <button onClick={() => { setEditingId(null); setShowForm(true); }} className="bg-white p-6 rounded-3xl shadow-sm border mb-8 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="bg-blue-600 p-3 rounded-xl text-white"><Plus size={24}/></div>
            <span className="font-black uppercase text-slate-700">Adaugă Registru Nou</span>
          </button>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              {activeTab === 'registre' ? (
                <tr>
                  <th className="p-5">Nr. Registru</th><th className="p-5">Data Inceput</th>
                  <th className="p-5">Continut</th><th className="p-5">Data Terminare</th>
                  <th className="p-5">Observatii</th><th className="p-5 text-right">Editare</th>
                </tr>
              ) : (/* ...capete tabel pt celelalte sectiuni neschimbate... */ <tr><th className="p-5">Nr</th><th className="p-5">Continut</th></tr> )}
            </thead>
            <tbody className="divide-y text-[11px] font-bold">
              {data.filter(i => (i.continut || '').toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {activeTab === 'registre' ? (
                    <>
                      <td className="p-5 text-blue-600 font-black">{item.numar_inregistrare}</td>
                      <td className="p-5">{item.data_inceput}</td>
                      <td className="p-5 uppercase">{item.continut}</td>
                      <td className="p-5">{item.data_sfarsit || '-'}</td>
                      <td className="p-5 uppercase">{item.observatii}</td>
                    </>
                  ) : (/* ...randuri pt celelalte sectiuni... */ <td className="p-5">{item.numar_inregistrare}</td>)}
                  <td className="p-5 text-right">
                    <button onClick={() => { setEditingId(item.id); setForm({...item, data: item.data_inceput || item.data_emitere, nr_registru_manual: item.numar_inregistrare}); setShowForm(true); }}><Edit2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl relative">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-300"><X size={32}/></button>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Configurare {activeTab}</h2>
            
            {activeTab === 'registre' ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nr. Registru (Manual)</label>
                  <input type="text" value={form.nr_registru_manual} onChange={e => setForm({...form, nr_registru_manual: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black mb-4 outline-none focus:border-blue-500" placeholder="Ex: 1255" />
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data Început</label>
                  <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black mb-4" />
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data Terminare</label>
                  <input type="date" value={form.data_sfarsit} onChange={e => setForm({...form, data_sfarsit: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black" />
                </div>
                <div className="space-y-4">
                  <textarea placeholder="CONTINUT / DESCRIERE REGISTRU..." value={form.continut} onChange={e => setForm({...form, continut: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black h-32 uppercase" />
                  <textarea placeholder="OBSERVATII..." value={form.observatii} onChange={e => setForm({...form, observatii: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black h-32 uppercase" />
                </div>
              </div>
            ) : (/* Formularele neschimbate pt General/Decizii */ <div>Restul ramane intact</div>)}
            
            <button onClick={handleSave} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl mt-8 transition-all hover:bg-blue-700">Salvează Modificările</button>
          </div>
        </div>
      )}
    </div>
  );
}
