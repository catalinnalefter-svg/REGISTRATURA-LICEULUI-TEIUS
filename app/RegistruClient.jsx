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
    nume_prenume: '',
    ruta: '',

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
    setLoading(true);

    let tableName = 'documente';
    let columnToSort = 'numar_inregistrare';

    if (activeTab === 'decizii') tableName = 'registrul_deciziilor';
    if (activeTab === 'registre') tableName = 'registrul_registrelor';
    if (activeTab === 'delegatii') tableName = 'registrul_delegatiilor';

    const { data: result } = await supabase
      .from(tableName)
      .select('*')
      .order(columnToSort, { ascending: false });

    setData(result || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth, fetchData]);

  const handleLogin = () => {
    if (!currentUser) { alert("Alegeți un compartiment!"); return; }
    if (pass === 'liceulteius2026') setIsAuth(true);
    else alert("Parolă incorectă!");
  };

  const exportToExcel = () => {
    let headers = "";
    let rows = [];

    if (activeTab === 'delegatii') {
      headers = "Nr;Nume Prenume;Ruta;Data;Creat de";
      rows = data.map(i => `"${i.numar_inregistrare}";"${i.nume_prenume}";"${i.ruta}";"${i.data}";"${i.creat_de}"`);
    }

    const csvContent = headers + "\n" + rows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setLoading(true);

    let tableName = 'documente';
    if (activeTab === 'decizii') tableName = 'registrul_deciziilor';
    if (activeTab === 'registre') tableName = 'registrul_registrelor';
    if (activeTab === 'delegatii') tableName = 'registrul_delegatiilor';

    let payload = {};

    if (activeTab === 'delegatii') {
      payload = {
        nume_prenume: form.nume_prenume.toUpperCase(),
        ruta: form.ruta.toUpperCase(),
        data: form.data,
        creat_de: currentUser
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
      setForm({ data: new Date().toISOString().split('T')[0], nume_prenume: '', ruta: '' });
      fetchData();
    }

    setLoading(false);
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-800 flex flex-col">

      <div className="flex gap-4 mb-8">

        <button onClick={() => setActiveTab('general')} className="flex-1">Registru General</button>
        <button onClick={() => setActiveTab('decizii')} className="flex-1">Decizii</button>
        <button onClick={() => setActiveTab('registre')} className="flex-1">Registru Registre</button>
        <button onClick={() => setActiveTab('delegatii')} className="flex-1">Registru Delegații</button>

      </div>

      {activeTab === 'delegatii' && (
        <div className="mb-10">

          <button
            onClick={() => {
              setEditingId(null);
              setForm({ data: new Date().toISOString().split('T')[0], nume_prenume: '', ruta: '' });
              setShowForm(true);
            }}
          >
            <Plus /> Adaugă Delegație
          </button>

        </div>
      )}

      {activeTab === 'delegatii' && (
        <table className="w-full">
          <thead>
            <tr>
              <th>Nr</th>
              <th>Nume și Prenume</th>
              <th>Ruta</th>
              <th>Data</th>
              <th>Editare</th>
              <th>Creat de</th>
            </tr>
          </thead>

          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.numar_inregistrare}</td>
                <td>{item.nume_prenume}</td>
                <td>{item.ruta}</td>
                <td>{formatDate(item.data)}</td>
                <td>
                  <button onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      nume_prenume: item.nume_prenume,
                      ruta: item.ruta,
                      data: item.data
                    });
                    setShowForm(true);
                  }}>
                    <Edit2 size={14} />
                  </button>
                </td>
                <td>{item.creat_de}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && activeTab === 'delegatii' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-white p-10 rounded-3xl w-[600px]">

            <h2 className="text-2xl font-bold mb-6">Delegatie</h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nume și prenume"
                value={form.nume_prenume}
                onChange={e => setForm({ ...form, nume_prenume: e.target.value })}
              />

              <input
                type="text"
                placeholder="Ruta"
                value={form.ruta}
                onChange={e => setForm({ ...form, ruta: e.target.value })}
              />

              <input
                type="date"
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
              />

            </div>

            <button onClick={handleSave} className="mt-6">Salvează</button>

          </div>

        </div>
      )}

    </div>
  );
}
