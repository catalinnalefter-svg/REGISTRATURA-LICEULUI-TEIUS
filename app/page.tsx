// ... (restul codului ramane la fel pana la sectiunea MODAL FORMULAR) ...

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            {!numarGenerat ? (
              <div className="space-y-6">
                <button onClick={() => { setShowForm(false); setIsEditing(false); }} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icons.X size={28} /></button>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
                    {isEditing ? 'Modifică Înregistrarea' : 'Înregistrare Nouă'}
                  </h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Selectați tipul documentului:</p>
                </div>

                {/* SELECTOR TIP DOCUMENT - Acum disponibil și la editare */}
                <div className="grid grid-cols-3 gap-2">
                  {['intrare', 'iesire', 'rezervat'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipDocument(t)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        tipDocument === t 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data Documentului</label>
                    <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Emitent / Destinatar</label>
                    <input type="text" placeholder="Ex: Ministerul Educației" value={formData.expeditor} onChange={(e) => setFormData({...formData, expeditor: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descriere Conținut</label>
                    <textarea placeholder="Ex: Adresă privind bugetul..." value={formData.continut} onChange={(e) => setFormData({...formData, continut: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium" rows={3} />
                  </div>
                </div>

                <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:bg-slate-300 uppercase tracking-widest text-sm">
                  {loading ? 'Se procesează...' : isEditing ? 'Actualizează în Registru' : 'Alocă Număr Înregistrare'}
                </button>
              </div>
            ) : (
              // ... (sectiunea cu succes ramane neschimbata) ...
