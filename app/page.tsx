// Adaugă acest import la începutul fișierului
import { supabase } from '@/lib/supabase';

// În interiorul componentei, adaugă această funcție:
const handleSave = async () => {
  const { data, error } = await supabase
    .from('documente')
    .insert([
      { 
        tip_document: tipDocument, 
        expeditor_destinatar: formData.expeditor, 
        continut_pe_scurt: formData.continut,
        data_inregistrare: formData.data,
        anul: 2026
      }
    ]);

  if (error) {
    alert('Eroare la salvare: ' + error.message);
  } else {
    alert('Document salvat cu succes! Numărul a fost generat.');
    setShowForm(false);
  }
};

// Modifică butonul de salvare să arate așa:
<button 
  onClick={handleSave}
  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
>
  <Save size={20} /> Salvează în Registru
</button>
