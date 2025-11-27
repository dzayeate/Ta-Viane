export const fineTuneDetailId = [
  {
    role: "user",
    content:
      "|-[susun soal gaya normal pada penumpang MRT Jakarta saat kereta berakselerasi 0,8 m/s^2]-| |-[tingkat kognitif Taksonomi Bloom C3 (Mengaplikasikan)]-| |-[bertipe PG]-|",
  },
  {
    role: "assistant",
    content:
      "Gaya Normal MRT Jakarta|->KD Dinamika Kelas X. Seorang penumpang bermassa 60 kg berdiri tegak di lantai kereta MRT Jakarta yang bergerak mendatar dan mengalami percepatan $0{,}8\\ \\text{m/s}^2$. Abaikan gesekan. Tentukan gaya normal yang bekerja pada penumpang tersebut. Tingkat kognitif: C3 (Mengaplikasikan). Pilihan:\n\nA. 470 N\nB. 510 N\nC. 530 N\nD. 560 N\nE. 600 N|->Langkah penyelesaian:\n1. Analisis gaya vertikal. Karena percepatan horizontal, sumbu $y$ tidak berakselerasi ($a_y = 0$).\n2. Terapkan Hukum II Newton: $N - mg = m a_y = 0$ sehingga $N = mg$.\n3. Substitusi massa 60 kg dan $g = 9{,}8\\ \\text{m/s}^2$: $N = 60 \\times 9{,}8 = 588\\ \\text{N}$.\n4. Dibulatkan ke opsi terdekat menjadi 600 N.\n\nJawaban benar: E. 600 N.|->Dinamika Kelas X",
  },
  {
    role: "user",
    content:
      "|-[buat soal energi mekanik tentang wisata edukasi lintasan luncur di Lembang]-| |-[tingkat kognitif Taksonomi Bloom C4 (Menganalisis)]-| |-[bertipe Esai]-|",
  },
  {
    role: "assistant",
    content:
      "Analisis Energi Luncur Lembang|->KD Usaha dan Energi Kelas X. Dalam wahana lintasan luncur di Lembang, kereta mini bermassa 120 kg (termasuk penumpang) dilepas dari ketinggian 12 m tanpa kecepatan awal. Gesekan udara menyebabkan kerugian energi sebesar 15% dari energi potensial awal. Hitung kecepatan kereta ketika berada 3 m di atas tanah. Jelaskan kaitan hasilmu dengan prinsip kekekalan energi. Tingkat kognitif: C4 (Menganalisis).|->Langkah penyelesaian:\n1. Energi potensial awal: $E_p = m g h = 120 \\times 9{,}8 \\times 12 = 14112\\ \\text{J}$.\n2. Energi yang hilang karena gesekan: $0{,}15 \\times 14112 = 2116{,}8\\ \\text{J}$.\n3. Energi mekanik tersisa: $E_m = 14112 - 2116{,}8 = 11995{,}2\\ \\text{J}$.\n4. Energi potensial pada ketinggian 3 m: $E_p' = 120 \\times 9{,}8 \\times 3 = 3528\\ \\text{J}$.\n5. Energi kinetik: $E_k = E_m - E_p' = 8467{,}2\\ \\text{J}$.\n6. Gunakan $E_k = \\frac{1}{2} m v^2$ untuk mencari $v = \\sqrt{\\frac{2E_k}{m}} \\approx 11{,}9\\ \\text{m/s}$.\n7. Simpulkan bahwa kekekalan energi tetap berlaku bila rugi energi dihitung eksplisit.\n\nHasil akhir: $v \\approx 11{,}9\\ \\text{m/s}$.|->Usaha dan Energi Kelas X",
  },
  {
    role: "user",
    content:
      "|-[susun soal analisis grafik intensitas gelombang permukaan air Waduk Jatiluhur]-| |-[tingkat kognitif Taksonomi Bloom C4 (Menganalisis)]-| |-[bertipe PG]-|",
  },
  {
    role: "assistant",
    content:
      "Grafik Interferensi Waduk Jatiluhur|->KD Gelombang Mekanik Kelas XI. Grafik berikut menunjukkan perubahan intensitas gelombang permukaan saat dua sumber identik beroperasi. Titik A berjarak 1,5 m dari sumber pertama dan 1,9 m dari sumber kedua. Panjang gelombang $\\lambda = 0{,}4\\ \\text{m}$. Tentukan karakter interferensi di titik A. Tingkat kognitif: C4 (Menganalisis).\n\nA. Maksimum penuh\nB. Minimum penuh\nC. Interferensi parsial konstruktif\nD. Interferensi parsial destruktif\nE. Tidak ada interferensi|->Langkah penyelesaian:\n1. Hitung selisih lintasan: $\\Delta r = |1{,}5 - 1{,}9| = 0{,}4\\ \\text{m}$.\n2. Karena $\\Delta r = 1\\lambda$, titik A mengalami interferensi maksimum penuh.\n\nJawaban benar: A. Maksimum penuh.|->Gelombang Mekanik Kelas XI",
  },
  {
    role: "user",
    content:
      "|-[buat soal arus induksi pada PLTA Cirata dengan format esai]-| |-[tingkat kognitif Taksonomi Bloom C5 (Mengevaluasi)]-| |-[bertipe Esai]-|",
  },
  {
    role: "assistant",
    content:
      "Evaluasi Arus Induksi PLTA Cirata|->KD Induksi Elektromagnetik Kelas XII. Turbin PLTA Cirata menyebabkan perubahan fluks rata-rata $\\Delta \\Phi = 0{,}25\\ \\text{Wb}$ dalam selang $0{,}02\\ \\text{s}$ pada kumparan 120 lilitan dengan resistansi 5 $\\Omega$. a) Hitung ggl induksi. b) Tentukan arus induksi dan nilai daya resistif. c) Jelaskan evaluasi efisiensi bila rugi resistif melebihi 8% daya induksi. Tingkat kognitif: C5 (Mengevaluasi).|->Langkah penyelesaian:\n1. Hukum Faraday: $\\mathcal{E} = -N \\frac{\\Delta \\Phi}{\\Delta t} = -120 \\times \\frac{0{,}25}{0{,}02} = -1500\\ \\text{V}$ (magnitudo 1500 V).\n2. Arus induksi: $I = \\frac{\\mathcal{E}}{R} = 300\\ \\text{A}$.\n3. Daya resistif: $P_R = I^2 R = 300^2 \\times 5 = 4{,}5 \\times 10^5\\ \\text{W}$.\n4. Jika $P_R$ adalah 8% daya total, maka $P_T = 5{,}625 \\times 10^6\\ \\text{W}$. Efisiensi turun jika rugi resistif melampaui batas ini sehingga perlu optimasi konduktor dan pendinginan.\n\nJawaban akhir: $\\mathcal{E} = 1500\\ \\text{V}$, $I = 300\\ \\text{A}$, evaluasi efisiensi berbasis ambang 8%.|->Induksi Elektromagnetik Kelas XII",
  },
];

export const fineTuneDetailEn = [
  {
    role: "user",
    content:
      "|-[create an Indonesian-context physics problem about the normal force on an MRT Jakarta passenger when acceleration is 0.8 m/s^2]-| |-[Bloom’s Taxonomy cognitive level C3 (Applying)]-| |-[MCQ type]-|",
  },
  {
    role: "assistant",
    content:
      "Normal Force in Jakarta MRT|->Grade 10 Dynamics competency. A 60 kg passenger stands on the floor of a Jakarta MRT train accelerating horizontally at $0.8\\ \\text{m/s}^2$. Neglect friction. Determine the normal force. Bloom level: C3 (Applying). Options:\n\nA. 470 N\nB. 510 N\nC. 530 N\nD. 560 N\nE. 600 N|->Solution steps:\n1. Vertical acceleration is zero, so $N - mg = 0$.\n2. $N = 60 \\times 9.8 = 588\\ \\text{N}$.\n3. Closest option: 600 N.\n\nCorrect answer: E. 600 N.|->Dynamics Grade 10",
  },
  {
    role: "user",
    content:
      "|-[design an essay problem on mechanical energy conservation for a downhill ride in Lembang]-| |-[Bloom’s Taxonomy cognitive level C4 (Analyzing)]-| |-[Essay type]-|",
  },
  {
    role: "assistant",
    content:
      "Energy Analysis at Lembang Ride|->Grade 10 Work & Energy competency. A 120 kg downhill cart starts from 12 m height with 15% energy loss due to drag. Find its speed at 3 m height and explain energy conservation. Bloom level: C4.|->Solution steps:\n1. Initial potential: $14112\\ \\text{J}$.\n2. Loss: $2116.8\\ \\text{J}$, remaining $11995.2\\ \\text{J}$.\n3. Potential at 3 m: $3528\\ \\text{J}$.\n4. Kinetic: $8467.2\\ \\text{J}$.\n5. $v = \\sqrt{2E_k/m} \\approx 11.9\\ \\text{m/s}$.\n6. Conservation holds when dissipated energy is accounted for explicitly.\n\nFinal speed $\\approx 11.9\\ \\text{m/s}$.|->Work and Energy Grade 10",
  },
  {
    role: "user",
    content:
      "|-[provide a wave interference MCQ analyzing surface intensity data from Jatiluhur Reservoir]-| |-[Bloom’s Taxonomy cognitive level C4 (Analyzing)]-| |-[MCQ type]-|",
  },
  {
    role: "assistant",
    content:
      "Jatiluhur Surface Wave Interference|->Grade 11 Mechanical Waves competency. Two coherent sources disturb the reservoir. Point A is 1.5 m from source 1 and 1.9 m from source 2 with $\\lambda = 0.4\\ \\text{m}$. Classify the interference. Bloom level: C4.\n\nA. Fully constructive\nB. Fully destructive\nC. Partially constructive\nD. Partially destructive\nE. No interference|->Solution steps:\n1. Path difference $\\Delta r = 0.4\\ \\text{m} = 1\\lambda$.\n2. Integer multiples of $\\lambda$ yield constructive interference.\n\nAnswer: A. Fully constructive.|->Mechanical Waves Grade 11",
  },
  {
    role: "user",
    content:
      "|-[write an essay question on induced current at the Cirata Hydropower Plant]-| |-[Bloom’s Taxonomy cognitive level C5 (Evaluating)]-| |-[Essay type]-|",
  },
  {
    role: "assistant",
    content:
      "Evaluating Induced Current at Cirata|->Grade 12 Electromagnetic Induction competency. A 120-turn coil, $R = 5\\ \\Omega$, experiences $\\Delta \\Phi = 0.25\\ \\text{Wb}$ over $0.02\\ \\text{s}$. a) Compute induced emf. b) Find induced current and resistive power. c) Evaluate efficiency if resistive loss exceeds 8% of total power. Bloom level: C5.|->Solution steps:\n1. $\\mathcal{E} = -N \\frac{\\Delta \\Phi}{\\Delta t} = -1500\\ \\text{V}$.\n2. $I = 300\\ \\text{A}$.\n3. $P_R = I^2 R = 4.5 \\times 10^5\\ \\text{W}$.\n4. If $P_R = 0.08 P_T$, then $P_T = 5.625 \\times 10^6\\ \\text{W}$; exceeding this indicates efficiency issues and the need for better conductors/cooling.\n\nAnswer: $\\mathcal{E} = 1500\\ \\text{V}$, $I = 300\\ \\text{A}$, efficiency discussion vs. 8% limit.|->Electromagnetic Induction Grade 12",
  },
];

export const fineTuneListEn = [
  {
    role: "user",
    content:
      "|-[generate a list of SMA physics ideas]-| |-[reference: none]-| |-[Bloom level random]-| |-[question type random]-| |-[questions numbered 1 to 5]-|",
  },
  {
    role: "assistant",
    content:
      "1. <prompt>|-><cognitive level>|-><question type><_>2. <prompt>|-><cognitive level>|-><question type><_>3. <prompt>|-><cognitive level>|-><question type><_>4. <prompt>|-><cognitive level>|-><question type><_>5. <prompt>|-><cognitive level>|-><question type>",
  },
  {
    role: "user",
    content:
      "|-[generate a list of SMA physics ideas]-| |-[reference: none]-| |-[Bloom level random]-| |-[question type random]-| |-[questions numbered 1 to 5]-|",
  },
  {
    role: "assistant",
    content:
      "1. Analyze passenger safety straps on Jakarta’s LRT to compute resultant forces during turns.|->C3|->MCQ<_>2. Explain how Kupang rooftop solar panels convert photon energy into current, emphasizing band diagrams.|->C2|->Essay<_>3. Determine the water discharge needed by PLTA Asahan to maintain 5 MW output given efficiency data.|->C4|->Essay<_>4. Discuss audio interference of two loudspeakers during a flag ceremony on a school field.|->C3|->MCQ<_>5. Evaluate coil heating risks in a homemade transformer experiment and propose mitigation.|->C5|->Essay",
  },
  {
    role: "user",
    content:
      "|-[generate a list of SMA physics ideas]-| |-[reference: none]-| |-[Bloom level random]-| |-[question type random]-| |-[questions numbered 6 to 6]-|",
  },
  {
    role: "assistant",
    content:
      "<_>6. Design a task comparing magnetic flux measured by a PLN survey drone while passing two transmission corridors.|->C4|->Essay",
  },
];

export const fineTuneListId = [
  {
    role: "user",
    content:
      "|-[buat list ide soal fisika SMA]-| |-[referensi: tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 1 sampai 5]-|",
  },
  {
    role: "assistant",
    content:
      "1. <prompt>|-><tingkat kognitif>|-><tipe soal><_>2. <prompt>|-><tingkat kognitif>|-><tipe soal><_>3. <prompt>|-><tingkat kognitif>|-><tipe soal><_>4. <prompt>|-><tingkat kognitif>|-><tipe soal><_>5. <prompt>|-><tingkat kognitif>|-><tipe soal>",
  },
  {
    role: "user",
    content:
      "|-[buat list ide soal fisika SMA]-| |-[referensi: tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 1 sampai 5]-|",
  },
  {
    role: "assistant",
    content:
      "1. Investigasi gaya sentripetal pada penumpang komidi putar Pasar Malam Bandung lengkap dengan data massa dan jari-jari.|->C3|->PG<_>2. Bandingkan tekanan hidrostatik pada keramba Danau Toba di kedalaman berbeda lalu sajikan grafik.|->C4|->Esai<_>3. Jelaskan resonansi kolom udara pada angklung dan hubungan panjang tabung dengan frekuensi nada.|->C2|->Esai<_>4. Rancang analisis konsumsi energi listrik rumah tangga Jakarta sebelum-sesudah memakai PLTS atap.|->C5|->Esai<_>5. Hitung kuat medan magnet di sekitar kabel KRL Commuterline berarus tertentu pada jarak 0,2 m.|->C3|->PG",
  },
  {
    role: "user",
    content:
      "|-[buat list ide soal fisika SMA]-| |-[referensi: tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 6 sampai 6]-|",
  },
  {
    role: "assistant",
    content:
      "<_>6. Evaluasi grafik hubungan intensitas cahaya vs tegangan keluaran pada PLTS atap laboratorium sekolah.|->C4|->Esai",
  },
];