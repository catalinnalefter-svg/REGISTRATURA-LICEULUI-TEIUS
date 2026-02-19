const handleSave = async () => {
  if (!formData.expeditor || !formData.continut) {
    alert("Te rugăm să completezi toate câmpurile!");
    return;
  }

  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('documente')
      .insert([{ 
        tip_document: tipDocument, 
        expeditor_destinatar: formData.expeditor, 
        continut_pe_scurt: formData.continut,
        data_inregistrare: formData.data,
        anul: 2026
      }])
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      // 1. Încărcăm imediat lista nouă ca să apară în tabelul din spate
      await fetchDocumente(); 
      
      // 2. Afișăm numărul generat pentru o secundă, apoi închidem totul automat
      setNumarGenerat(data[0].nr_inregistrare);
      
      setTimeout(() => {
        setShowForm(false); // Închide formularul
        setNumarGenerat(null); // Resetează starea pentru următoarea utilizare
      }, 1500); // 1.5 secunde de așteptare
    }
  } catch (err: any) {
    alert('Eroare la salvare: ' + err.message);
  } finally {
    setLoading(false);
  }
};
