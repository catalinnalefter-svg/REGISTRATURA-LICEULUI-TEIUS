'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Hash, Download, Search, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RegistraturaLiceu() {
  const [documente, setDocumente] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <header className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Registratura electronica</h1>
        <div className="bg-white border px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2">
           <Calendar size={16} /> 2026
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-10">
        <button className="bg-[#22c55e] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
          <Plus size={20} /> Adaugă document intrare / intern
        </button>
        <button className="bg-[#007bff] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
          <Plus size={20} /> Adaugă document ieșire
        </button>
        <button className="bg-[#f39c12] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
          <Hash size={20} /> Rezervă numere
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border p-20 text-center text-slate-400">
        În Registratura Generala nu există niciun document pentru anul 2026
      </div>
    </div>
  );
}
