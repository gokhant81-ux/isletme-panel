import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const para = (n) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(n || 0) + " ₺";
const tarih = (d) => d ? new Date(d).toLocaleDateString("tr-TR") : "-";
const bugun = () => new Date().toISOString().split("T")[0];

// Toast — App.jsx'teki global toast fonksiyonunu kullan
const toast = (mesaj, tip, sure) => { if (typeof window !== "undefined" && window.toast) window.toast(mesaj, tip, sure); };

// WhatsApp telefon temizleme
const waTel = (tel) => {
  if (!tel) return "";
  let t = "";
  for (const c of tel) { if (c >= "0" && c <= "9") t += c; }
  // Başında 0 varsa kaldır (90532... → 532...)
  if (t.startsWith("0")) t = t.slice(1);
  // Başında 90 varsa kaldır (905320... → 5320...)
  if (t.startsWith("90")) t = t.slice(2);
  return t;
};


const inp = { width: "100%", padding: "8px 11px", borderRadius: 7, border: "1px solid #d0d5dd", background: "#fff", color: "#222", fontSize: 13, boxSizing: "border-box", outline: "none" };
const lbl = { color: "#555", fontSize: 11, display: "block", marginBottom: 3 };
const abtn = { padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#e94560,#c23152)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const kbtn = { padding: "7px 13px", borderRadius: 7, border: "1px solid #d0d5dd", background: "#f5f5f5", color: "#444", cursor: "pointer", fontSize: 12 };
const krt = { background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

// ===== FIYATLAR (Excel'den) =====
const FIYATLAR = {
  "KURU TEMİZLEME": { "KAZAK": 276, "HIRKA": 360, "ATKI": 120, "FULAR": 120, "ŞORT": 144, "PARDESÜ": 720, "MONT": 684, "MANTO": 1020, "KABAN": 684, "ELDİVEN": 108, "KRAVAT": 108, "SMOKİN": 1044, "ETEK": 276, "BLUZ": 252, "GECELİK": 300, "BODY": 300, "TAYT": 300, "FANTEZİ ELBİSE": 1524, "ŞAL": 300, "EŞARP": 264, "GELİNLİK": 4200, "SATEN PERDE": 240, "AĞ MASA ÖRT.": 1620, "YORGAN PAMUK": 900, "MAYO": 120, "BİKİNİ": 120, "KOT PANT.": 300, "KOT CEKET": 432, "MENDİL": 72, "CEKET": 540, "GÖMLEK": 300, "PANTALON": 300, "TAKIM ELBİSE": 816, "YORGAN ELYAF": 900, "YATAK T.S.SATEN": 900, "YATAK T.KETEN": 900, "TÜL PERDE": 276, "PERDE": 300, "HAVLU BÜYÜK": 480, "PEÇETE AD.": 120, "SWEAT SHIRT": 300, "YASTIK": 480, "YATAK ÖRTÜSÜ": 780, "BATTANİYE": 600, "NEVRESİM": 720, "MONT DERİ": 1560, "YELEK": 300, "PALTO": 780, "KÜRK": 2100, "KAYAK TULUMU": 1560, "BAYAN ELBİSE": 720, "T SHİRT": 300, "ELBİSE": 900, "ÇOCUK ELBİSESİ": 540, "YÜN BLUZ": 300, "SÜETER": 360, "YORGAN KAZTÜYÜ": 1620, "BATTANİYE ÇİFT": 660, "DERİ MONT": 1524, "DERİ CEKET": 1020, "KAYAK PANTOLONU": 780, "KAYAK MONTU": 1020, "MOTOR MONTU": 1020, "SÜTYEN": 120, "KÜLOT": 120, "ÇORAP": 48, "İŞ ÖNLÜĞÜ": 228, "BERMUDA": 300, "BOXER": 84, "GÜNLÜK ELBİSE": 600, "ABİYE": 960, "EŞOFMAN TEK": 360, "EŞOFMAN 2Lİ": 720 },
  "YIKAMA": { "ŞORT": 90, "GECELİK": 300, "SATEN PERDE": 240, "AĞ MASA ÖRT.": 1620, "ÇARŞAF T.": 1200, "YASTIK KILIFI": 300, "BATTANİYE TEK": 720, "YORGAN PAMUK": 900, "KOT PANT.": 300, "KOT CEKET": 432, "BORNOZ": 360, "HAVLU": 240, "MENDİL": 72, "GÖMLEK": 300, "PANTALON": 300, "YATAK T.S.SATEN": 900, "YATAK T.KETEN": 900, "PERDE": 300, "ÇARŞAF ÇİFT": 600, "HAVLU BÜYÜK": 480, "ÇORAP": 48, "KÜLOT": 108, "PEÇETE AD.": 120, "PİKE": 780, "PİKE T.": 780, "YASTIK": 480, "BOXER": 84, "AYAKKABI YIKAMA": 600 },
  "ÜTÜ": { "KAZAK": 144, "HIRKA": 180, "MONT": 336, "MANTO": 360, "KABAN": 336, "KRAVAT": 54, "SMOKİN": 600, "ETEK": 168, "BLUZ": 168, "CEKET": 300, "GÖMLEK": 168, "PANTALON": 168, "TAKIM ELBİSE": 420, "PARDESÜ": 360, "TÜL PERDE": 216, "PERDE": 216, "ÇARŞAF ÇİFT": 420, "PEÇETE AD.": 60, "SWEAT SHIRT": 168, "NEVRESİM": 540, "T SHİRT": 168, "ELBİSE": 600, "YÜN BLUZ": 168 },
  "BOYAMA": { "MONT": 1200, "KABAN": 1200, "ETEK": 720, "BLUZ": 720, "PANTALON": 720, "PARDESÜ": 1080, "T SHİRT": 720, "ELBİSE": 900 },
  "TERZİ TADİLAT": { "HIRKA": 0, "CEKET": 0, "PANTALON": 0 },
  "LOSTRA": { "AYAKKABI YIKAMA": 600 }
};

const URUN_LISTESI = [
  { ad: "Pantalon", e: "👖" }, { ad: "Gömlek", e: "👔" }, { ad: "Takim Elbise", e: "🤵" }, { ad: "Ceket", e: "🧥" },
  { ad: "Kazak", e: "🧶" }, { ad: "Hirka", e: "🧥" }, { ad: "Mont", e: "🧥" }, { ad: "Kaban", e: "🧥" },
  { ad: "Manto", e: "🧥" }, { ad: "Pardesü", e: "🧥" }, { ad: "Etek", e: "👗" }, { ad: "Bluz", e: "👚" },
  { ad: "Elbise", e: "👗" }, { ad: "Gece Elbisesi", e: "👘" }, { ad: "Abiye", e: "👗" }, { ad: "Gecelik", e: "🌙" },
  { ad: "T Shirt", e: "👕" }, { ad: "Sweat Shirt", e: "🧥" }, { ad: "Eşofman Tek", e: "🏃" },
  { ad: "Yorgan Pamuk", e: "🛏️" }, { ad: "Yorgan Elyaf", e: "🛏️" }, { ad: "Yorgan Kaztüyü", e: "🛏️" },
  { ad: "Yastık", e: "💤" }, { ad: "Battaniye Tek", e: "🟫" }, { ad: "Battaniye Çift", e: "🟫" },
  { ad: "Nevresim", e: "🛏️" }, { ad: "Pike T.", e: "🛏️" }, { ad: "Pike Çift", e: "🛏️" },
  { ad: "Çarşaf T.", e: "🛏️" }, { ad: "Çarşaf Çift", e: "🛏️" }, { ad: "Yatak T.Saten", e: "🛌" },
  { ad: "Yatak T.Keten", e: "🛌" }, { ad: "Yatak Örtüsü", e: "🛏️" },
  { ad: "Perde", e: "🪟" }, { ad: "Saten Perde", e: "🪟" }, { ad: "Tül Perde", e: "🪟" },
  { ad: "Bornoz", e: "🧖" }, { ad: "Havlu", e: "🏊" }, { ad: "Havlu Büyük", e: "🏊" },
  { ad: "Peçete Ad.", e: "🧻" }, { ad: "Kot Pant.", e: "👖" }, { ad: "Kot Ceket", e: "🧥" },
  { ad: "Mendil", e: "🤧" }, { ad: "Kravat", e: "👔" }, { ad: "Şort", e: "🩳" },
  { ad: "Boxer", e: "🩲" }, { ad: "Külot", e: "🩲" }, { ad: "Çorap", e: "🧦" },
  { ad: "Ağ Masa Ört.", e: "🍽️" }, { ad: "Smokin", e: "🤵" }, { ad: "Deri Mont", e: "🧥" },
  { ad: "Yelek", e: "🦺" }, { ad: "Palto", e: "🧥" }, { ad: "Kürk", e: "🦊" },
  { ad: "Gelinklik", e: "👰" }, { ad: "Eşarp", e: "🧣" }, { ad: "Şal", e: "🧣" },
  { ad: "Ayakkabı Yıkama", e: "👟" },
];

const HIZMET_GRUPLARI = [
  { k: "KURU TEMİZLEME", l: "Kuru Temizleme", r: "#2563eb" },
  { k: "YIKAMA", l: "Yıkama", r: "#16a34a" },
  { k: "ÜTÜ", l: "Ütü", r: "#d97706" },
  { k: "BOYAMA", l: "Boyama", r: "#9333ea" },
  { k: "TERZİ TADİLAT", l: "Terzi Tadilat", r: "#dc2626" },
  { k: "LOSTRA", l: "Lostra", r: "#b45309" },
];

const RENKLER = ["Siyah", "Beyaz", "Lacivert", "Mavi", "Gri", "Kahverengi", "Kırmızı", "Yeşil", "Sarı", "Pembe", "Mor", "Bej", "Füme", "Taba", "Turuncu", "Lila", "Eflatun", "Çok Renkli", "Kahve Ekose"];

// Dinamik fiyat önbelleği
let _dinamikFiyatlar = null;
const getFiyatlar = async (force = false) => {
  if (_dinamikFiyatlar && !force) return _dinamikFiyatlar;
  try {
    const { data } = await supabase.from("kt_ayarlar").select("deger").eq("anahtar","fiyat_listesi").maybeSingle();
    if (data?.deger) { _dinamikFiyatlar = JSON.parse(data.deger); return _dinamikFiyatlar; }
  } catch {}
  _dinamikFiyatlar = FIYATLAR;
  return FIYATLAR;
};

const fiyatBul = (hizmet, urunAd) => {
  const h = (_dinamikFiyatlar || FIYATLAR)[hizmet] || FIYATLAR[hizmet] || {};
  const norm = (s) => s.toUpperCase().replace(/İ/g,"I").replace(/Ğ/g,"G").replace(/Ş/g,"S").replace(/Ç/g,"C").replace(/Ö/g,"O").replace(/Ü/g,"U");
  const n = norm(urunAd);
  for (const [k, v] of Object.entries(h)) {
    const kn = norm(k);
    if (n.includes(kn) || kn.includes(n)) return v;
  }
  return 0;
};

const barkodUret = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ===== EVRENSEL REALTIME YENİLEME HOOK =====
function useRealtimeYenile(tablolar, callback, deps = []) {
  useEffect(() => {
    const channels = tablolar.map((tablo, i) =>
      supabase.channel(`realtime_${tablo}_${Date.now()}_${i}`)
        .on("postgres_changes", { event: "*", schema: "public", table: tablo }, () => callback())
        .subscribe()
    );
    return () => channels.forEach(ch => supabase.removeChannel(ch));
  }, deps);
}

// ===== BARKOD TARAYICI KOMPONENTİ =====
export function BarcodeScanner({ onSonuc, onKapat, baslik = "Barkod Tara" }) {
  const divId = "html5qr-" + Math.random().toString(36).slice(2,7);
  const scannerRef = useRef(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tarandiMi, setTarandiMi] = useState(false);
  const tarandiRef = useRef(false);

  const kapat = () => {
    try { scannerRef.current?.stop(); } catch {}
    onKapat();
  };

  useEffect(() => {
    // CSS animasyonları inject et
    if (!document.getElementById("kt-anim-css")) {
      const s = document.createElement("style");
      s.id = "kt-anim-css";
      s.textContent = "@keyframes scan{0%,100%{top:5%}50%{top:90%}}@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}";
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const yukle = async () => {
      // html5-qrcode kütüphanesi yükle
      if (!window.Html5Qrcode) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      try {
        const scanner = new window.Html5Qrcode(divId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 250, height: 160 }, aspectRatio: 1.7 },
          (text) => {
            if (tarandiRef.current) return;
            tarandiRef.current = true;
            setTarandiMi(true);
            try {
              const ctx = new AudioContext();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.value = 1200; g.gain.value = 0.1;
              o.start(); o.stop(ctx.currentTime + 0.07);
            } catch {}
            setTimeout(() => { try { scanner.stop(); } catch {} onSonuc(text); }, 400);
          },
          () => {} // hata sessiz
        );
        setYukleniyor(false);
      } catch (e) {
        setHata("Kamera açılamadı: " + e.message);
        setYukleniyor(false);
      }
    };

    yukle();
    return () => { try { scannerRef.current?.stop(); } catch {} };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:9999, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"rgba(0,0,0,0.85)", position:"absolute", top:0, left:0, right:0, zIndex:10 }}>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>📷 {baslik}</div>
        <button onClick={kapat} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontSize:20, padding:"4px 12px" }}>✕</button>
      </div>

      {/* html5-qrcode render alanı */}
      <div id={divId} style={{ flex:1, marginTop:52 }}/>

      {yukleniyor && !hata && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"rgba(0,0,0,0.85)", borderRadius:12, padding:"16px 24px", color:"#fff", fontSize:14 }}>📷 Kamera başlatılıyor...</div>
        </div>
      )}
      {hata && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"rgba(0,0,0,0.92)", borderRadius:14, padding:24, color:"#ff6b6b", fontSize:13, textAlign:"center", maxWidth:300 }}>
            ⚠️ {hata}
            <br/><button onClick={kapat} style={{ marginTop:12, padding:"8px 20px", borderRadius:8, border:"1px solid #ff6b6b", background:"none", color:"#ff6b6b", cursor:"pointer" }}>Kapat</button>
          </div>
        </div>
      )}
      {tarandiMi && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"rgba(0,0,0,0.85)", borderRadius:14, padding:"22px 36px", color:"#00c864", fontSize:22, fontWeight:700 }}>✅ Okundu!</div>
        </div>
      )}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px", background:"rgba(0,0,0,0.7)", color:"rgba(255,255,255,0.4)", fontSize:11, textAlign:"center" }}>
        Barkodu kameranın ortasına getirin
      </div>
    </div>
  );
}

// 3 iş günü sonrası hesapla
const ucIsGunu = () => {
  const d = new Date();
  let ekle = 0, sayac = 0;
  while (sayac < 3) {
    ekle++;
    const gun = new Date(d);
    gun.setDate(d.getDate() + ekle);
    const haftaGun = gun.getDay();
    if (haftaGun !== 0 && haftaGun !== 6) sayac++;
  }
  d.setDate(d.getDate() + ekle);
  return d.toISOString().split("T")[0];
};

// Fiş no - MAX bazlı (silinmiş kayıtlarda çakışma olmaz)
const fisNoUret = async () => {
  for (let deneme = 0; deneme < 10; deneme++) {
    try {
      const { data } = await supabase.from("kt_fisler").select("fis_no").limit(1000);
      // Sadece normal numaralı fişleri dikkate al (6 haneden az olanlar)
      const maxNo = (data || []).reduce((max, x) => {
        const n = parseInt(x.fis_no) || 0;
        // Timestamp fallback numaralarını (6+ hane, >100000) yoksay
        if (n > 99999) return max;
        return n > max ? n : max;
      }, 19); // Minimum 20'den başla (en az 020)
      const yeniNo = String(maxNo + 1 + deneme).padStart(3, "0");
      const { data: kontrol } = await supabase.from("kt_fisler").select("id").eq("fis_no", yeniNo).maybeSingle();
      if (!kontrol) return yeniNo;
    } catch { break; }
  }
  return String(Date.now()).slice(-6);
};

// Ayarları oku
const ayarOku = async (anahtar, varsayilan) => {
  try {
    const { data } = await supabase.from("kt_ayarlar").select("deger").eq("anahtar", anahtar).single();
    return data?.deger || varsayilan;
  } catch { return varsayilan; }
};


// Ayar tablosu oluştur (yoksa)
const ayarTablosuOlustur = async () => {
  await supabase.from("kt_ayarlar").upsert([
    { anahtar: "firma_adi", deger: "Kuru Temizleme" },
    { anahtar: "firma_telefon", deger: "" },
    { anahtar: "firma_adres", deger: "" },
    { anahtar: "musteri_notu", deger: "Teşekkür ederiz! Bizi tercih ettiğiniz için teşekkürler." },
    { anahtar: "anasayfa_widgets", deger: JSON.stringify(["bekleyen","hazir","bugun","acik","son_fisler"]) },
  ], { onConflict: "anahtar", ignoreDuplicates: true });
};

// ===== EXCEL EXPORT =====
const xlsxYukle = () => new Promise((resolve, reject) => {
  if (window.XLSX) { resolve(window.XLSX); return; }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
  s.onload = () => resolve(window.XLSX);
  s.onerror = reject;
  document.head.appendChild(s);
});
async function ktExcelIndir(tarihBas, tarihBit) {
  const XLSX = await xlsxYukle();
  const bas = tarihBas || new Date().toISOString().slice(0,7) + "-01";
  const bit = tarihBit || new Date().toISOString().split("T")[0];
  const dosyaAdi = `KuruTemizleme_${bas}_${bit}.xlsx`;

  const para2 = (n) => new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(n||0);
  const tarihFmt = (d) => d ? new Date(d).toLocaleDateString("tr-TR") : "-";
  const durumYaz = (d) => ({bekliyor:"Bekliyor",hazir:"Hazır",teslim_edildi:"Teslim Edildi",kismi_teslim:"Kısmi Teslim",iptal_edildi:"İptal Edildi"}[d]||d||"-");
  const odemeYaz2 = (o) => ({nakit:"Nakit",kredi_karti:"Kredi Kartı",havale:"Havale/EFT",teslimde:"Teslimde"}[o]||o||"-");

  // 1. FİŞLER
  const { data: fisler } = await supabase
    .from("kt_fisler")
    .select("*, musteriler(ad_soyad, telefon)")
    .gte("acilis_tarihi", bas + "T00:00:00")
    .lte("acilis_tarihi", bit + "T23:59:59")
    .order("acilis_tarihi", { ascending: false });

  const fislerSheet = (fisler||[]).map(f => ({
    "Fiş No": f.fis_no,
    "Müşteri": f.musteriler?.ad_soyad||"-",
    "Telefon": f.musteriler?.telefon||"-",
    "Açılış Tarihi": tarihFmt(f.acilis_tarihi),
    "Planlanan Teslim": tarihFmt(f.planlanan_teslim),
    "Teslim Tarihi": tarihFmt(f.teslim_tarihi),
    "Durum": durumYaz(f.durum),
    "Ödeme Türü": odemeYaz2(f.odeme_turu),
    "Brüt Tutar (₺)": para2(f.toplam_tutar),
    "İndirim %": f.nakit_indirim_yuzde||0,
    "Tahsilat (₺)": para2(f.indirimli_tutar),
    "Kalan Borç (₺)": para2(f.kalan),
    "Nakit Fiş": f.nakit_fis?"Evet":"Hayır",
    "Notlar": f.notlar||"",
    "Barkod": f.barkod||"",
  }));

  // 2. FİŞ KALEMLERİ
  const fisIds = (fisler||[]).map(f => f.id);
  let kalemlerSheet = [];
  if (fisIds.length > 0) {
    const chunks = [];
    for (let i=0;i<fisIds.length;i+=100) chunks.push(fisIds.slice(i,i+100));
    const tumKalemler = [];
    for (const chunk of chunks) {
      const { data } = await supabase.from("kt_fis_kalemleri")
        .select("*, kt_fisler(fis_no, musteriler(ad_soyad))").in("fis_id",chunk).order("fis_id");
      tumKalemler.push(...(data||[]));
    }
    kalemlerSheet = tumKalemler.map(k => {
      const hizmetler = (() => { try { return JSON.parse(k.hizmet_bilgi||"[]"); } catch { return []; } })();
      return {
        "Fiş No": k.kt_fisler?.fis_no||"-",
        "Müşteri": k.kt_fisler?.musteriler?.ad_soyad||"-",
        "Ürün Adı": k.urun_adi||"-",
        "Renk": k.renk||"-",
        "Adet": k.toplam_adet||k.adet||1,
        "Hizmetler": hizmetler.map(h=>`${h.hizmet_adi}: ${para2(h.fiyat)}₺`).join(" | ")||"-",
        "Toplam Fiyat (₺)": para2(k.toplam_fiyat||k.fiyat),
        "Barkod": k.barkod||"",
      };
    });
  }

  // 3. ÖDEME GEÇMİŞİ
  let odemelerSheet = [];
  if (fisIds.length > 0) {
    const chunks = [];
    for (let i=0;i<fisIds.length;i+=100) chunks.push(fisIds.slice(i,i+100));
    const tumOdemeler = [];
    for (const chunk of chunks) {
      const { data } = await supabase.from("kt_odeme_gecmisi")
        .select("*, kt_fisler(fis_no, musteriler(ad_soyad))").in("fis_id",chunk).order("tarih",{ascending:false});
      tumOdemeler.push(...(data||[]));
    }
    odemelerSheet = tumOdemeler.map(o => ({
      "Fiş No": o.kt_fisler?.fis_no||"-",
      "Müşteri": o.kt_fisler?.musteriler?.ad_soyad||"-",
      "Tarih": tarihFmt(o.tarih),
      "Tutar (₺)": para2(o.tutar),
      "Ödeme Türü": odemeYaz2(o.odeme_turu),
      "Notlar": o.notlar||"",
    }));
  }

  // 4. ÖZET
  const toplamBrut = (fisler||[]).reduce((t,f)=>t+(f.toplam_tutar||0),0);
  const toplamTahsilat = (fisler||[]).reduce((t,f)=>t+(f.indirimli_tutar||0),0);
  const toplamKalan = (fisler||[]).reduce((t,f)=>t+(f.kalan||0),0);
  const odemeGruplari = {};
  (fisler||[]).forEach(f => { const o=odemeYaz2(f.odeme_turu); odemeGruplari[o]=(odemeGruplari[o]||0)+(f.indirimli_tutar||0); });
  const ozet = [
    {Alan:"Dönem Başlangıcı",Değer:bas},
    {Alan:"Dönem Bitişi",Değer:bit},
    {Alan:"Toplam Fiş Sayısı",Değer:(fisler||[]).length},
    {Alan:"Brüt Ciro (₺)",Değer:para2(toplamBrut)},
    {Alan:"Verilen İndirim (₺)",Değer:para2(toplamBrut-toplamTahsilat)},
    {Alan:"Tahsilat (₺)",Değer:para2(toplamTahsilat)},
    {Alan:"Açık Borç (₺)",Değer:para2(toplamKalan)},
    {Alan:"─────────────",Değer:""},
    ...Object.entries(odemeGruplari).map(([k,v])=>({Alan:`  ${k}`,Değer:para2(v)+" ₺"})),
    {Alan:"─────────────",Değer:""},
    {Alan:"Teslim Edilen",Değer:(fisler||[]).filter(f=>f.durum==="teslim_edildi").length},
    {Alan:"Bekleyen Fiş",Değer:(fisler||[]).filter(f=>f.durum==="bekliyor").length},
    {Alan:"Hazır Fiş",Değer:(fisler||[]).filter(f=>f.durum==="hazir").length},
    {Alan:"Nakit Fiş Kesilen",Değer:(fisler||[]).filter(f=>f.nakit_fis).length},
    {Alan:"Toplam Kalem",Değer:kalemlerSheet.length},
    {Alan:"Rapor Tarihi",Değer:new Date().toLocaleString("tr-TR")},
  ];

  const wb = XLSX.utils.book_new();
  const wsOzet = XLSX.utils.json_to_sheet(ozet);
  const wsFisler = XLSX.utils.json_to_sheet(fislerSheet.length ? fislerSheet : [{Bilgi:"Bu dönemde fiş yok."}]);
  const wsKalemler = XLSX.utils.json_to_sheet(kalemlerSheet.length ? kalemlerSheet : [{Bilgi:"Bu dönemde kalem yok."}]);
  const wsOdemeler = XLSX.utils.json_to_sheet(odemelerSheet.length ? odemelerSheet : [{Bilgi:"Bu dönemde ödeme yok."}]);
  wsOzet["!cols"]=[{wch:28},{wch:22}];
  wsFisler["!cols"]=[{wch:8},{wch:20},{wch:14},{wch:14},{wch:16},{wch:14},{wch:14},{wch:12},{wch:14},{wch:10},{wch:14},{wch:14},{wch:10},{wch:20},{wch:10}];
  wsKalemler["!cols"]=[{wch:8},{wch:20},{wch:20},{wch:12},{wch:6},{wch:40},{wch:14},{wch:10}];
  wsOdemeler["!cols"]=[{wch:8},{wch:20},{wch:14},{wch:14},{wch:14},{wch:24}];
  XLSX.utils.book_append_sheet(wb, wsOzet, "Özet");
  XLSX.utils.book_append_sheet(wb, wsFisler, "Fişler");
  XLSX.utils.book_append_sheet(wb, wsKalemler, "Kalemler");
  XLSX.utils.book_append_sheet(wb, wsOdemeler, "Ödemeler");
  XLSX.writeFile(wb, dosyaAdi);
}

function ExcelButon({ tarihBas, tarihBit }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const indir = async () => {
    setYukleniyor(true);
    try { await ktExcelIndir(tarihBas, tarihBit); }
    catch (e) { toast("Excel hatası: " + e.message, "hata"); }
    finally { setYukleniyor(false); }
  };
  return (
    <button onClick={indir} disabled={yukleniyor}
      style={{...kbtn, background:"#16a34a", color:"#fff", border:"none", fontWeight:600, opacity:yukleniyor?0.7:1}}>
      {yukleniyor ? "⏳ Hazırlanıyor..." : "📥 Excel İndir"}
    </button>
  );
}

// Fiş çıktısı - window.open önce çağrılmalı (popup blocker bypass için dışarıdan alınıyor)
function fisCiktisi(fis, kalemler, musteri, toplam, indirimli, odeme, iskonto, ayarlar = {}, w = null) {
  const odemeYaz = odeme === "teslimde" ? "Teslimde Ödenecek" : odeme === "nakit" ? "Nakit" : odeme === "kredi_karti" ? "Kredi Kartı" : "Havale/EFT";
  const firmaAdi = ayarlar.firma_adi || localStorage.getItem("kt_firma_adi") || "Kuru Temizleme";
  const firmaTel = ayarlar.firma_telefon || localStorage.getItem("kt_firma_tel") || "";
  const firmaAdres = ayarlar.firma_adres || localStorage.getItem("kt_firma_adres") || "";
  const musteriNotu = ayarlar.musteri_notu || localStorage.getItem("kt_musteri_notu") || "Teşekkür ederiz!";
  const firmaLogo = ayarlar.firma_logo || (typeof localStorage !== "undefined" ? localStorage.getItem("firma_logo") || "" : "");
  // Yazıcı ayarları localStorage'dan
  const kagitGenislik = (typeof localStorage !== "undefined" && localStorage.getItem("yazici_genislik")) || "72mm";
  const fontBoyut = (typeof localStorage !== "undefined" && localStorage.getItem("yazici_font")) || "10.5px";
  const barkodYukseklik = +(typeof localStorage !== "undefined" && localStorage.getItem("yazici_barkod") || "32");
  const qrBoyut = +(typeof localStorage !== "undefined" && localStorage.getItem("yazici_qr") || "160");
  const fisBarkodDegeri = String(fis.barkod || fis.fis_no || "000");
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${siteUrl}/?musteri=${fisBarkodDegeri}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrBoyut}x${qrBoyut}&data=${encodeURIComponent(qrUrl)}&margin=4&ecc=M`;

  // Ürün satırları: temiz, geniş
  const kalemlerHtml = kalemler.map((k) => {
    const hizmetler = (() => { try { return JSON.parse(k.hizmet_bilgi || "[]"); } catch { return []; } })();
    const adet = k.toplam_adet || k.adet || 1;
    const renk = (k.renk && k.renk !== "undefined" && k.renk !== "null") ? ` (${k.renk})` : "";
    const kalemToplam = hizmetler.reduce((t, h) => t + (+h.fiyat || 0), 0);
    const hizmetSatirlari = hizmetler.filter(h => (+h.fiyat || 0) > 0).length > 1
      ? hizmetler.filter(h => (+h.fiyat || 0) > 0).map(h =>
          `<div style="font-size:10.5px;font-weight:600;padding-left:4px;margin-top:1px;">&nbsp;&nbsp;${h.hizmet_adi}&nbsp;&nbsp;&nbsp;${para(h.fiyat)}</div>`
        ).join("")
      : "";
    const tekHizmet = hizmetler.filter(h => (+h.fiyat || 0) > 0).length === 1 ? hizmetler[0] : null;
    return `<div style="margin:6px 0;padding-top:5px;border-top:1px dotted #aaa;">
      <div style="font-weight:700;font-size:11px;">${k.urun_adi.toUpperCase()}${renk} &nbsp; ${adet} Ad &nbsp;&nbsp;&nbsp; ${tekHizmet ? para(tekHizmet.fiyat) : (kalemToplam > 0 ? para(kalemToplam) : "")}</div>
      ${tekHizmet ? `<div style="font-size:10px;font-weight:600;padding-left:4px;">&nbsp;&nbsp;${tekHizmet.hizmet_adi}</div>` : hizmetSatirlari}
    </div>`;
  }).join("");

  const urunBarkodScripts = "";

  // Ödeme bölümü
  const odemeHtml = iskonto > 0 ? `
  <div style="display:flex;justify-content:space-between;font-size:10.5px;font-weight:700;margin:3px 0;">
    <span>Nakite Ozel Fiyat</span><span>${para(indirimli)}</span>
  </div>
  <div style="font-size:10px;font-weight:600;margin:2px 0 4px;">
    (Nakit indirimi %${iskonto}, -${para(toplam - indirimli)})
  </div>
  <div class="line"></div>
  <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin:4px 0;">
    <span>${kalemler.length} Parca &nbsp; Toplam Tutar</span><span>${para(toplam)}</span>
  </div>` : `
  <div class="line"></div>
  <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin:4px 0;">
    <span>${kalemler.length} Parca &nbsp; Toplam Tutar</span><span>${para(toplam)}</span>
  </div>`;

  const html = `<html><head><title>Fis #${fis.fis_no}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    @media print{body{margin:0;padding:0;}}
    body{font-family:'Courier New',monospace;font-size:10.5px;width:${kagitGenislik};padding:2mm 2mm;line-height:1.5;}
    .center{text-align:center}
    .bold{font-weight:700}
    .line{border-top:1px dashed #000;margin:4px 0}
    .qr-blok{display:flex;align-items:flex-start;gap:6px;margin:4px 0;}
    .qr-text{font-size:10px;color:#111;line-height:1.5;flex:1;font-weight:600;}
    #bc{display:block;margin:3px auto;max-width:100%;}
    img.logo{display:block;margin:0 auto 4px;max-height:18mm;max-width:100%;object-fit:contain;}
  </style>
  </head><body>
  ${firmaLogo ? `<img class="logo" src="${firmaLogo}" alt="logo" />` : ""}
  <div class="center bold" style="font-size:15px;letter-spacing:1px;">${firmaAdi}</div>
  ${firmaAdres ? `<div class="center" style="font-size:10px;font-weight:600;margin-top:2px;">${firmaAdres}</div>` : ""}
  ${firmaTel ? `<div class="center" style="font-size:10px;font-weight:600;">${firmaTel}</div>` : ""}
  <div class="line"></div>
  <div style="font-size:11px;font-weight:700;">Fis No: #${fis.fis_no}</div>
  <div style="font-size:10.5px;font-weight:600;margin-top:2px;">${new Date().toLocaleString("tr-TR", {day:"2-digit",month:"long",year:"numeric",weekday:"long",hour:"2-digit",minute:"2-digit"})}</div>
  <div style="font-weight:700;font-size:12px;margin-top:4px;">${musteri?.ad_soyad?.toUpperCase() || "-"} &nbsp;&nbsp; ${musteri?.telefon || ""}</div>
  ${fis.planlanan_teslim ? `<div style="font-size:11px;font-weight:700;margin-top:2px;">Teslim: ${new Date(fis.planlanan_teslim).toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric",weekday:"long"})}</div>` : ""}
  <div class="line"></div>
  ${kalemlerHtml}
  <div class="line"></div>
  ${odemeHtml}
  <div class="line"></div>
  <svg id="bc"></svg>
  <div class="center" style="font-size:9px;font-weight:600;margin:2px 0;">Fis: #${fis.fis_no}</div>
  <div class="line"></div>
  <div class="qr-blok">
    <img src="${qrImgUrl}" width="80" height="80" alt="QR" style="flex-shrink:0;" />
    <div class="qr-text">QR kodu telefonunuzla okutarak urun durumu ve bakiyenizi gorebilirsiniz.</div>
  </div>
  <div class="line"></div>
  <div class="center" style="font-size:11px;font-weight:700;margin-top:4px;">${musteriNotu}</div>
  <script>
  (function(){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
    s.onload=function(){
      try{JsBarcode("#bc","${fisBarkodDegeri}",{format:"CODE128",width:1.6,height:${barkodYukseklik},displayValue:true,fontSize:10,margin:2,textMargin:2});}catch(e){}
      setTimeout(function(){window.print();},300);
    };
    s.onerror=function(){setTimeout(function(){window.print();},150);};
    document.head.appendChild(s);
  })();
  <\/script>
  </body></html>`;

  const win = w || window.open("about:blank", "_blank", "width=400,height=750,scrollbars=yes");
  if (!win) { toast("Popup engellendi! Tarayıcı popup izinlerini kontrol edin.", "uyari"); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// Barkod etiketi yazdır (ürün başına küçük etiket)
function barkodEtiketYazdir(barkod, fisNo, musteriAd, urunAdi) {
  const w = window.open("", "", "width=320,height=220");
  const val = String(barkod || fisNo || "000");
  w.document.write(`<html><head><title>Etiket</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;width:60mm;padding:5px 4px;}
  .c{text-align:center;}.s{font-size:9px;color:#333;}#bc{width:100%;}</style>
  </head><body>
  <div class="c" style="font-weight:700;font-size:10px;">${musteriAd || ""}</div>
  <div class="c s">${urunAdi || ""}</div>
  <div class="c" style="margin:3px 0;"><svg id="bc"></svg></div>
  <div class="c s">Fiş: #${fisNo}</div>
  <script>
  (function(){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
    s.onload=function(){
      try{JsBarcode("#bc","${val}",{format:"CODE128",width:2,height:38,displayValue:false,margin:0});}catch(e){}
      setTimeout(function(){window.print();},150);
    };
    s.onerror=function(){setTimeout(function(){window.print();},100);};
    document.head.appendChild(s);
  })();
  <\/script>
  </body></html>`);
  w.document.close();
}

// ===== GECİKMİŞ FİŞLER UYARISI =====
function GecikmisFisler() {
  const [fisler, setFisler] = useState([]);
  useEffect(() => {
    supabase.from("kt_fisler")
      .select("*, musteriler(ad_soyad, telefon)")
      .not("durum", "eq", "teslim_edildi")
      .not("planlanan_teslim", "is", null)
      .lt("planlanan_teslim", bugun() + "T00:00:00")
      .order("planlanan_teslim")
      .limit(10)
      .then(({ data }) => setFisler(data || []));
  }, []);
  if (!fisler.length) return null;
  return (
    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <h3 style={{ color: "#c2410c", margin: "0 0 10px", fontSize: 14 }}>⚠️ Teslim Tarihi Geçmiş ({fisler.length} fiş)</h3>
      {fisler.map(f => {
        const gunFark = Math.floor((new Date() - new Date(f.planlanan_teslim)) / 86400000);
        return (
          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #fed7aa" }}>
            <div>
              <span style={{ fontWeight: 700, color: "#111" }}>#{f.fis_no}</span>
              <span style={{ color: "#666", fontSize: 12, marginLeft: 10 }}>👤 {f.musteriler?.ad_soyad}</span>
              {f.musteriler?.telefon && (
                <a href={`whatsapp://send?phone=90${waTel(f.musteriler.telefon)}&text=${encodeURIComponent('Sayın ' + f.musteriler.ad_soyad + ', #' + f.fis_no + ' numaralı fişiniz hazır, teslim alabilirsiniz. İyi günler.\n\nSipariş durumunuz: ' + window.location.origin + '/?musteri=' + (f.barkod || f.fis_no))}`}
                  target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 11, color: "#16a34a", textDecoration: "none" }}>📱 WA</a>
              )}
            </div>
            <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>{gunFark} gün gecikti</span>
          </div>
        );
      })}
    </div>
  );
}

// ===== TESLİMAT UYARILARI =====
function TeslimatUyarilari() {
  const [fisler, setFisler] = useState([]);
  const [tamamlandi, setTamamlandi] = useState(() => {
    try { return JSON.parse(localStorage.getItem("teslimat_tamamlandi") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const yukle = async () => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const { data } = await supabase
        .from("kt_fisler")
        .select("*, musteriler(ad_soyad, telefon, adres)")
        .in("teslimat_turu", ["adrese_teslim", "adresten_al"])
        .not("durum", "eq", "teslim_edildi")
        .not("durum", "eq", "iptal_edildi")
        .order("planlanan_teslim", { ascending: true });
      setFisler(data || []);
    };
    yukle();
    const interval = setInterval(yukle, 60000);
    return () => clearInterval(interval);
  }, []);

  const tamamla = (id) => {
    const yeni = [...tamamlandi, id];
    setTamamlandi(yeni);
    localStorage.setItem("teslimat_tamamlandi", JSON.stringify(yeni));
  };

  const gorunur = fisler.filter(f => !tamamlandi.includes(f.id));
  if (!gorunur.length) return null;

  const bugun = new Date().toISOString().split("T")[0];
  const getUyariRenk = (f) => {
    if (!f.planlanan_teslim) return { bg: "#eff6ff", border: "#bfdbfe", renk: "#2563eb" };
    const kalan = Math.ceil((new Date(f.planlanan_teslim) - new Date()) / 86400000);
    if (kalan < 0) return { bg: "#fef2f2", border: "#fecaca", renk: "#dc2626" };
    if (kalan === 0) return { bg: "#fff7ed", border: "#fed7aa", renk: "#ea580c" };
    if (kalan <= 1) return { bg: "#fffbeb", border: "#fde68a", renk: "#d97706" };
    return { bg: "#f0fdf4", border: "#bbf7d0", renk: "#16a34a" };
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color: "#111", margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>
        🚚 Bekleyen Teslimatlar ({gorunur.length})
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {gorunur.map(f => {
          const { bg, border, renk } = getUyariRenk(f);
          const kalan = f.planlanan_teslim ? Math.ceil((new Date(f.planlanan_teslim) - new Date()) / 86400000) : null;
          return (
            <div key={f.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>#{f.fis_no}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: f.teslimat_turu === "adrese_teslim" ? "#eff6ff" : "#fff7ed", color: f.teslimat_turu === "adrese_teslim" ? "#2563eb" : "#d97706", fontWeight: 600 }}>
                    {f.teslimat_turu === "adrese_teslim" ? "🚚 Adrese Teslim" : "🏠 Adresten Al"}
                  </span>
                </div>
                <div style={{ color: "#555", fontSize: 13 }}>👤 {f.musteriler?.ad_soyad}</div>
                {f.musteriler?.telefon && (
                  <a href={`whatsapp://send?phone=90${waTel(f.musteriler.telefon)}&text=${encodeURIComponent(`Sayın ${f.musteriler.ad_soyad}, #${f.fis_no} numaralı ${f.teslimat_turu === "adrese_teslim" ? "adrese teslimatınız" : "adresinizden alınacak ürününüz"} için sizi arayacağız. İyi günler.`)}`}
                    target="_blank" rel="noreferrer" style={{ color: "#16a34a", fontSize: 12, textDecoration: "none" }}>
                    📱 {f.musteriler.telefon}
                  </a>
                )}
                {f.musteriler?.adres && <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>📍 {f.musteriler.adres}</div>}
                {f.planlanan_teslim && (
                  <div style={{ color: renk, fontSize: 12, fontWeight: 600, marginTop: 3 }}>
                    📅 {new Date(f.planlanan_teslim).toLocaleDateString("tr-TR")}
                    {kalan !== null && (
                      <span style={{ marginLeft: 8 }}>
                        {kalan < 0 ? `⚠️ ${Math.abs(kalan)} gün gecikti!` : kalan === 0 ? "⏰ Bugün!" : `${kalan} gün kaldı`}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => tamamla(f.id)}
                style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                ✅ Teslim Ettim
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== UZAKTAN YAZICI DİNLEYİCİ (PC'de çalışır) =====
export function UzaktanYaziciDinleyici() {
  const [kuyruk, setKuyruk] = useState([]);

  useEffect(() => {
    // Masaüstü mi kontrol et
    const masaustu = window.innerWidth > 768;
    if (!masaustu) return;

    const ch = supabase.channel("print_queue_" + Date.now())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kt_print_queue" },
        async (payload) => {
          const job = payload.new;
          if (job.durum !== "bekliyor") return;

          // Kuyruğa ekle
          setKuyruk(q => [...q, job]);

          // Otomatik yazdır
          try {
            const w = window.open("", "_blank", "width=400,height=600");
            if (w) {
              w.document.write(job.fis_html);
              w.document.close();
              w.onload = () => { setTimeout(() => { w.print(); w.close(); }, 500); };
            }
          } catch {}

          // Durumu güncelle
          await supabase.from("kt_print_queue").update({ durum: "basildi" }).eq("id", job.id);
        }
      ).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  if (!kuyruk.length) return null;

  return (
    <div style={{ position:"fixed", bottom:80, right:20, zIndex:5000, display:"flex", flexDirection:"column", gap:8 }}>
      {kuyruk.slice(-3).map(job => (
        <div key={job.id} style={{ background:"#0d1520", border:"1px solid rgba(0,200,100,0.3)", borderRadius:12, padding:"10px 14px", boxShadow:"0 4px 20px rgba(0,0,0,0.4)", minWidth:220 }}>
          <div style={{ color:"#00c864", fontSize:12, fontWeight:700 }}>🖨️ Fiş Basıldı!</div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:2 }}>#{job.fis_no} - {job.musteri_adi||"Müşteri"}</div>
          {job.musteri_tel && (
            <a href={`https://wa.me/90${job.musteri_tel.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent("Fişiniz hazır! 🧾")}`}
              target="_blank" rel="noreferrer"
              style={{ display:"block", marginTop:6, background:"rgba(37,211,102,0.15)", color:"#25D366", padding:"4px 10px", borderRadius:8, textDecoration:"none", fontSize:11, fontWeight:600 }}>
              📲 WhatsApp'tan Gönder
            </a>
          )}
          <button onClick={() => setKuyruk(q => q.filter(x => x.id !== job.id))}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:10, marginTop:4 }}>Kapat</button>
        </div>
      ))}
    </div>
  );
}

// ===== TELEFONDAN FİŞ YAZDIR (fişi kuyruğa ekler) =====
export async function telefonFisYazdir(fisHtml, fisNo, musteriAdi, musteriTel) {
  await supabase.from("kt_print_queue").insert({
    fis_html: fisHtml,
    fis_no: String(fisNo),
    musteri_adi: musteriAdi || "",
    musteri_tel: musteriTel || "",
    durum: "bekliyor",
  });
}

// ===== WHATSAPP MESAJ MERKEZİ =====
export function WhatsAppMerkezi() {
  const [musteriler, setMusteriler] = useState([]);
  const [ara, setAra] = useState("");
  const [secili, setSecili] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [sablon, setSablon] = useState("");

  const SABLONLAR = [
    { k:"hazir", l:"✅ Ürün Hazır", m:"Sayın {ad}, kuru temizlemeniz hazır. Teslim alabilirsiniz. İyi günler 🙏" },
    { k:"hatirlatma", l:"⏰ Teslim Hatırlatması", m:"Sayın {ad}, ürününüzü {gun} gündür bekliyoruz. Lütfen en kısa sürede teslim alınız. İyi günler." },
    { k:"promosyon", l:"🎁 Kampanya", m:"Sayın {ad}, bu hafta kuru temizlemede %20 indirim kampanyamız var! Sizi bekliyoruz 🌟" },
    { k:"tesekkur", l:"🙏 Teşekkür", m:"Sayın {ad}, bizi tercih ettiğiniz için teşekkür ederiz. Görüşmek üzere!" },
    { k:"ozel", l:"✏️ Özel Mesaj", m:"" },
  ];

  useEffect(() => {
    supabase.from("musteriler").select("*").order("ad_soyad").then(({ data }) => setMusteriler(data || []));
  }, []);

  const filtreli = musteriler.filter(m =>
    m.ad_soyad?.toLowerCase().includes(ara.toLowerCase()) ||
    m.telefon?.includes(ara)
  );

  const sablonSec = (s) => {
    setSablon(s.k);
    setMesaj(s.m);
  };

  const mesajOlustur = (musteri) => {
    return mesaj
      .replace("{ad}", musteri.ad_soyad || "")
      .replace("{gun}", "3");
  };

  const tekGonder = (musteri) => {
    const tel = musteri.telefon?.replace(/\D/g,"").slice(-10);
    if (!tel) return toast("Telefon numarası yok!", "uyari");
    const m = mesajOlustur(musteri);
    window.open(`https://wa.me/90${tel}?text=${encodeURIComponent(m)}`, "_blank");
  };

  const tumunuGonder = () => {
    if (!secili.length) return toast("Müşteri seçin!", "uyari");
    if (!mesaj.trim()) return toast("Mesaj yazın!", "uyari");
    if (!confirm(`${secili.length} müşteriye mesaj gönderilecek. Devam?`)) return;
    secili.forEach((id, i) => {
      const m = musteriler.find(x => x.id === id);
      if (!m?.telefon) return;
      const tel = m.telefon.replace(/\D/g,"").slice(-10);
      setTimeout(() => {
        window.open(`https://wa.me/90${tel}?text=${encodeURIComponent(mesajOlustur(m))}`, "_blank");
      }, i * 500);
    });
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      {/* Sol: Müşteri Listesi */}
      <div>
        <h3 style={{ color:"#fff", marginTop:0, fontSize:15 }}>👥 Müşteriler</h3>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input value={ara} onChange={e=>setAra(e.target.value)} placeholder="🔍 Ara..." style={{...inp, flex:1, background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)"}}/>
          {secili.length > 0 && <button onClick={() => setSecili([])} style={{...kbtn, fontSize:11, color:"#ff6b6b"}}>Sıfırla ({secili.length})</button>}
        </div>
        <div style={{ maxHeight:"60vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
          {filtreli.map(m => (
            <div key={m.id} onClick={() => setSecili(s => s.includes(m.id) ? s.filter(x=>x!==m.id) : [...s, m.id])}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:8, cursor:"pointer",
                background: secili.includes(m.id) ? "rgba(37,211,102,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${secili.includes(m.id) ? "rgba(37,211,102,0.3)" : "rgba(255,255,255,0.07)"}` }}>
              <div>
                <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>{m.ad_soyad}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{m.telefon||"-"}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {secili.includes(m.id) && <span style={{ color:"#25D366", fontSize:16 }}>✓</span>}
                {m.telefon && <button onClick={e=>{e.stopPropagation();tekGonder(m);}}
                  style={{ background:"rgba(37,211,102,0.15)", border:"1px solid rgba(37,211,102,0.3)", borderRadius:8, color:"#25D366", cursor:"pointer", fontSize:11, padding:"3px 8px" }}>
                  WA
                </button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ: Mesaj Oluştur */}
      <div>
        <h3 style={{ color:"#fff", marginTop:0, fontSize:15 }}>💬 Mesaj Oluştur</h3>

        <div style={{ marginBottom:12 }}>
          <label style={{...lbl, color:"rgba(255,255,255,0.6)"}}>Hazır Şablon</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
            {SABLONLAR.map(s => (
              <button key={s.k} onClick={() => sablonSec(s)}
                style={{ padding:"5px 10px", borderRadius:20, border:`1px solid ${sablon===s.k?"#25D366":"rgba(255,255,255,0.15)"}`,
                  background: sablon===s.k?"rgba(37,211,102,0.12)":"transparent",
                  color: sablon===s.k?"#25D366":"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:11 }}>
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{...lbl, color:"rgba(255,255,255,0.6)"}}>Mesaj Metni</label>
          <textarea value={mesaj} onChange={e=>setMesaj(e.target.value)} rows={5}
            placeholder="Mesajınızı yazın... {ad} yerine müşteri adı gelir"
            style={{...inp, background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", resize:"vertical", padding:12}}/>
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:4 }}>
            💡 {"{ad}"} → müşteri adı
          </div>
        </div>

        {mesaj && (
          <div style={{ background:"rgba(37,211,102,0.06)", border:"1px solid rgba(37,211,102,0.15)", borderRadius:10, padding:12, marginBottom:12 }}>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginBottom:4 }}>Örnek önizleme:</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>
              {mesajOlustur(filtreli[0] || { ad_soyad:"Ahmet Bey" })}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={tumunuGonder} disabled={!secili.length||!mesaj.trim()}
            style={{ ...abtn, flex:1, background:"linear-gradient(135deg,#25D366,#128C7E)", opacity:secili.length&&mesaj.trim()?1:0.4 }}>
            📱 {secili.length > 0 ? `${secili.length} Kişiye Gönder` : "Müşteri Seç"}
          </button>
        </div>
        {secili.length > 0 && <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:6, textAlign:"center" }}>
          Her mesaj ayrı pencerede açılır, onaylayarak gönderirsiniz
        </div>}
      </div>
    </div>
  );
}

// ===== ARAYAN NUMARA POPUP =====
export function ArayanPopup() {
  const [arama, setArama] = useState(null);
  const [gosteriliyor, setGosteriliyor] = useState(false);
  const [fisAcMod, setFisAcMod] = useState(false);
  const [fiyatMod, setFiyatMod] = useState(false);
  const [gecmis, setGecmis] = useState([]);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false);
  const [fiyatUrunler, setFiyatUrunler] = useState([]);
  const [fiyatAra, setFiyatAra] = useState("");
  const [fiyatSecilenHizmet, setFiyatSecilenHizmet] = useState("KURU TEMİZLEME");
  const [sepet, setSepet] = useState([]);
  const [iskonto, setIskonto] = useState(0);
  const [fiyatListeMod, setFiyatListeMod] = useState(false);
  const [fiyatListeAra, setFiyatListeAra] = useState("");
  const [waMetin, setWaMetin] = useState("");
  const [waMod, setWaMod] = useState(false);
  const kapatTimerRef = useRef(null);

  useEffect(() => {
    let kanal;
    const baglan = () => {
      kanal = supabase
        .channel("kt_aramalar_" + Date.now())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "kt_aramalar" },
          async (payload) => {
            const yeni = payload.new;
            setArama(yeni);
            setGosteriliyor(true);
            setFisAcMod(false);
            setFiyatMod(false);
            setWaMod(false);
            setSepet([]);
            setIskonto(0);

            // Önceki timer'ı iptal et
            if (kapatTimerRef.current) clearTimeout(kapatTimerRef.current);
            // 3 dakika sonra otomatik kapat
            kapatTimerRef.current = setTimeout(() => setGosteriliyor(false), 180000);

            // Müşteri geçmişini yükle
            if (yeni.musteri_id) {
              setGecmisYukleniyor(true);
              const { data } = await supabase.from("kt_fisler")
                .select("fis_no,durum,toplam_tutar,indirimli_tutar,kalan,acilis_tarihi")
                .eq("musteri_id", yeni.musteri_id)
                .order("acilis_tarihi", { ascending: false })
                .limit(5);
              setGecmis(data || []);
              setGecmisYukleniyor(false);
            } else {
              setGecmis([]);
            }
          }
        )
        .subscribe((status) => {
          if (status === "CLOSED") {
            // Bağlantı kopunca 3 saniye sonra yeniden bağlan
            setTimeout(baglan, 3000);
          }
        });
    };
    baglan();
    return () => { if (kanal) supabase.removeChannel(kanal); };
  }, []);

  const kapat = async () => {
    if (arama?.id) {
      await supabase.from("kt_aramalar").update({ okundu: true }).eq("id", arama.id);
    }
    setGosteriliyor(false);
  };

  const waGonder = () => {
    if (!arama?.telefon) return;
    const tel = waTel(arama.telefon);
    window.open(`whatsapp://send?phone=90${tel}&text=${encodeURIComponent(waMetin)}`, "_blank");
  };

  const fiyatListesiGonder = () => {
    if (!arama?.telefon) return;
    const hizmetler = ["KURU TEMİZLEME", "ÜTÜ"];
    let metin = "🧺 *KURU TEMİZLEME FİYAT LİSTESİ*\n\n";
    hizmetler.forEach(h => {
      metin += `*${h}*\n`;
      Object.entries(FIYATLAR[h] || {}).forEach(([urun, fiyat]) => {
        metin += `• ${urun}: ${(fiyat/100).toFixed(2)} ₺\n`;
      });
      metin += "\n";
    });
    metin += "_Nakit ödemede özel indirim uygulanmaktadır._";
    const tel = waTel(arama.telefon);
    window.open(`whatsapp://send?phone=90${tel}&text=${encodeURIComponent(metin)}`, "_blank");
  };

  const sepeteEkle = (urunAd, hizmet) => {
    const fiyat = fiyatBul(hizmet, urunAd);
    const mevcut = sepet.find(s => s.urun === urunAd && s.hizmet === hizmet);
    if (mevcut) {
      setSepet(sepet.map(s => s.urun === urunAd && s.hizmet === hizmet ? { ...s, adet: s.adet + 1, toplam: (s.adet + 1) * s.fiyat } : s));
    } else {
      setSepet([...sepet, { urun: urunAd, hizmet, fiyat, adet: 1, toplam: fiyat }]);
    }
  };

  const toplamFiyat = sepet.reduce((t, s) => t + s.toplam, 0);
  const nakitFiyat = iskonto > 0 ? toplamFiyat * (1 - iskonto / 100) : toplamFiyat;

  const sepetWaGonder = () => {
    if (!arama?.telefon || !sepet.length) return;
    let metin = "🧺 *Fiyat Teklifiniz*\n\n";
    sepet.forEach(s => { metin += `• ${s.urun} (${s.hizmet}) x${s.adet}: ${para(s.toplam)}\n`; });
    metin += `\n💰 *Toplam: ${para(toplamFiyat)}*`;
    if (iskonto > 0) metin += `\n💵 *Nakit Özel: ${para(nakitFiyat)}* (%${iskonto} indirim)`;
    metin += "\n\nBizi tercih ettiğiniz için teşekkür ederiz! 🌟";
    window.open(`whatsapp://send?phone=90${waTel(arama.telefon)}&text=${encodeURIComponent(metin)}`, "_blank");
  };

  const fiyatListeFiltrelenmis = Object.entries(FIYATLAR[fiyatSecilenHizmet] || {})
    .filter(([urun]) => urun.toLowerCase().includes(fiyatListeAra.toLowerCase()));

  if (!gosteriliyor || !arama) return null;

  return (
    <div style={{ position: "fixed", top: 20, right: 20, width: 380, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.2)", border: "2px solid #e94560", zIndex: 9999, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Başlık */}
      <div style={{ background: "linear-gradient(135deg,#e94560,#c23152)", padding: "14px 18px", borderRadius: "14px 14px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>📞 Gelen Arama</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>{arama.telefon}</div>
        </div>
        <button onClick={kapat} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      <div style={{ padding: 16 }}>
        {/* Müşteri bilgisi */}
        {arama.musteri_adi ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 15 }}>👤 {arama.musteri_adi}</div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>Kayıtlı müşteri</div>
          </div>
        ) : (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ color: "#92400e", fontWeight: 600, fontSize: 14 }}>❓ Kayıtsız Numara</div>
            <div style={{ color: "#78350f", fontSize: 12, marginTop: 2 }}>Müşteri kaydı bulunamadı</div>
          </div>
        )}

        {/* Müşteri geçmişi */}
        {gecmisYukleniyor && <div style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>⏳ Geçmiş yükleniyor...</div>}
        {gecmis.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#555", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Son Fişler</div>
            {gecmis.map(f => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#f9fafb", borderRadius: 6, marginBottom: 3, fontSize: 12 }}>
                <span style={{ color: "#111", fontWeight: 600 }}>#{f.fis_no}</span>
                <span style={{ color: f.durum === "teslim_edildi" ? "#16a34a" : f.durum === "hazir" ? "#2563eb" : "#d97706", fontSize: 11 }}>
                  {f.durum === "teslim_edildi" ? "✅" : f.durum === "hazir" ? "📦" : "⏳"} {f.durum === "teslim_edildi" ? "Teslim" : f.durum === "hazir" ? "Hazır" : "Bekliyor"}
                </span>
                <span style={{ color: f.kalan > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{para(f.toplam_tutar)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Aksiyon butonları */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <button onClick={() => { setWaMod(!waMod); setFiyatMod(false); setFiyatListeMod(false); }}
            style={{ padding: "9px 8px", borderRadius: 9, border: "1px solid #bbf7d0", background: waMod ? "#16a34a" : "#f0fdf4", color: waMod ? "#fff" : "#16a34a", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            📱 WA Mesaj Yaz
          </button>
          <button onClick={fiyatListesiGonder}
            style={{ padding: "9px 8px", borderRadius: 9, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            📋 Fiyat Listesi Gönder
          </button>
          <button onClick={() => { setFiyatMod(!fiyatMod); setWaMod(false); setFiyatListeMod(false); }}
            style={{ padding: "9px 8px", borderRadius: 9, border: "1px solid #fde68a", background: fiyatMod ? "#d97706" : "#fffbeb", color: fiyatMod ? "#fff" : "#92400e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            🧮 Hızlı Fiyat Hesapla
          </button>
          <button onClick={() => { setFiyatListeMod(!fiyatListeMod); setFiyatMod(false); setWaMod(false); }}
            style={{ padding: "9px 8px", borderRadius: 9, border: "1px solid #e9d5ff", background: fiyatListeMod ? "#7c3aed" : "#f5f3ff", color: fiyatListeMod ? "#fff" : "#7c3aed", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            🔍 Fiyat Sorgula
          </button>
        </div>

        {/* WA Mesaj */}
        {waMod && (
          <div style={{ marginBottom: 12, padding: 12, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
            <textarea value={waMetin} onChange={e => setWaMetin(e.target.value)}
              placeholder="Mesajınızı yazın..."
              style={{ width: "100%", minHeight: 80, padding: 8, borderRadius: 7, border: "1px solid #d0d5dd", fontSize: 12, resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {["Ürününüz hazır, teslim alabilirsiniz.", "Fiyatlarımız hakkında bilgi almak ister misiniz?", "Siparişiniz alındı, hazırlanmaktadır."].map(s => (
                <button key={s} onClick={() => setWaMetin(s)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12, border: "1px solid #bbf7d0", background: "#fff", color: "#16a34a", cursor: "pointer" }}>{s.slice(0,25)}...</button>
              ))}
            </div>
            <button onClick={waGonder} disabled={!waMetin.trim()}
              style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              📤 Gönder
            </button>
          </div>
        )}

        {/* Fiyat sorgula */}
        {fiyatListeMod && (
          <div style={{ marginBottom: 12, padding: 12, background: "#f5f3ff", borderRadius: 10, border: "1px solid #e9d5ff" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {["KURU TEMİZLEME", "ÜTÜ"].map(h => (
                <button key={h} onClick={() => setFiyatSecilenHizmet(h)}
                  style={{ padding: "5px 10px", borderRadius: 16, border: "none", background: fiyatSecilenHizmet === h ? "#7c3aed" : "#e9d5ff", color: fiyatSecilenHizmet === h ? "#fff" : "#7c3aed", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{h}</button>
              ))}
            </div>
            <input value={fiyatListeAra} onChange={e => setFiyatListeAra(e.target.value)}
              placeholder="🔍 Ürün ara..." style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #d0d5dd", fontSize: 12, boxSizing: "border-box", marginBottom: 8 }} />
            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
              {fiyatListeFiltrelenmis.slice(0, 20).map(([urun, fiyat]) => (
                <div key={urun} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#fff", borderRadius: 6, fontSize: 12 }}>
                  <span style={{ color: "#111" }}>{urun}</span>
                  <span style={{ color: "#7c3aed", fontWeight: 700 }}>{para(fiyat)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hızlı fiyat hesapla */}
        {fiyatMod && (
          <div style={{ marginBottom: 12, padding: 12, background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {["KURU TEMİZLEME", "ÜTÜ", "YIKAMA"].map(h => (
                <button key={h} onClick={() => setFiyatSecilenHizmet(h)}
                  style={{ padding: "4px 8px", borderRadius: 14, border: "none", background: fiyatSecilenHizmet === h ? "#d97706" : "#fde68a", color: fiyatSecilenHizmet === h ? "#fff" : "#92400e", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>{h}</button>
              ))}
            </div>
            <input value={fiyatAra} onChange={e => setFiyatAra(e.target.value)}
              placeholder="🔍 Ürün ekle..." style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #d0d5dd", fontSize: 12, boxSizing: "border-box", marginBottom: 8 }} />
            <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
              {Object.entries(FIYATLAR[fiyatSecilenHizmet] || {})
                .filter(([u]) => u.toLowerCase().includes(fiyatAra.toLowerCase()))
                .slice(0, 10)
                .map(([urun, fiyat]) => (
                  <div key={urun} onClick={() => sepeteEkle(urun, fiyatSecilenHizmet)}
                    style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#fff", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <span>{urun}</span>
                    <span style={{ color: "#d97706", fontWeight: 600 }}>{para(fiyat)} +</span>
                  </div>
                ))}
            </div>
            {sepet.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #fde68a" }}>
                {sepet.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{s.urun} x{s.adet}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ color: "#d97706", fontWeight: 600 }}>{para(s.toplam)}</span>
                      <button onClick={() => setSepet(sepet.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed #fde68a", marginTop: 6, paddingTop: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                    <span>Toplam</span><span style={{ color: "#d97706" }}>{para(toplamFiyat)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "#666" }}>Nakit İndirim %</span>
                    <input type="number" min="0" max="50" value={iskonto} onChange={e => setIskonto(+e.target.value)}
                      style={{ width: 50, padding: "3px 6px", borderRadius: 5, border: "1px solid #d0d5dd", fontSize: 12 }} />
                    {iskonto > 0 && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>→ {para(nakitFiyat)}</span>}
                  </div>
                  <button onClick={sepetWaGonder}
                    style={{ marginTop: 8, width: "100%", padding: 7, borderRadius: 7, border: "none", background: "#25D366", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                    📤 WA ile Teklif Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fiş aç butonu */}
        <a href="/?modul=kuru_temizleme&sayfa=fis_ac" onClick={(e) => { e.preventDefault(); kapat(); window.location.hash = "fis_ac_" + (arama.telefon || ""); }}
          style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#e94560,#c23152)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, textDecoration: "none", marginTop: 4 }}>
          📝 Fiş Aç
        </a>
      </div>
    </div>
  );
}

export function KTAnaSayfa() {
  const [stats, setStats] = useState({ bekleyen: 0, hazir: 0, bugun_: 0, acik: 0 });
  const [widgets, setWidgets] = useState(["bekleyen","hazir","bugun","acik","son_fisler"]);

  const [aktifFiltre, setAktifFiltre] = useState(null); // null = son fişler
  const [filtreFisler, setFiltreFisler] = useState([]);
  const [filtreYukleniyor, setFiltreYukleniyor] = useState(false);

  const [extraStats, setExtraStats] = useState({ bugunCiro: 0, acikBorc: 0, ayBorc: 0 });

  useEffect(() => {
    const b = bugun();
    const ayBas = b.slice(0,7) + "-01";
    Promise.all([
      supabase.from("kt_fisler").select("id", { count: "exact", head: true }).eq("durum", "bekliyor"),
      supabase.from("kt_fisler").select("id", { count: "exact", head: true }).eq("durum", "hazir"),
      supabase.from("kt_fisler").select("id", { count: "exact", head: true }).gte("acilis_tarihi", b + "T00:00:00"),
      supabase.from("kt_fisler").select("id", { count: "exact", head: true }).in("durum", ["bekliyor","hazir","kismi_teslim"]),
    ]).then(([bek, haz, bug, acik]) => {
      setStats({ bekleyen: bek.count || 0, hazir: haz.count || 0, bugun_: bug.count || 0, acik: acik.count || 0 });
    });
    // Ekstra istatistikler
    Promise.all([
      supabase.from("kt_fisler").select("indirimli_tutar").gte("teslim_tarihi", b + "T00:00:00").eq("durum","teslim_edildi"),
      supabase.from("kt_fisler").select("kalan").gt("kalan", 0),
      supabase.from("kt_fisler").select("indirimli_tutar").gte("acilis_tarihi", ayBas).eq("durum","teslim_edildi"),
    ]).then(([bugunFis, borcFisler, ayFis]) => {
      setExtraStats({
        bugunCiro: (bugunFis.data || []).reduce((t,f) => t + (f.indirimli_tutar||0), 0),
        acikBorc: (borcFisler.data || []).reduce((t,f) => t + (f.kalan||0), 0),
        ayTahsilat: (ayFis.data || []).reduce((t,f) => t + (f.indirimli_tutar||0), 0),
      });
    });
    ayarOku("anasayfa_widgets", JSON.stringify(["bekleyen","hazir","bugun","acik","son_fisler"])).then(v => {
      try { setWidgets(JSON.parse(v)); } catch {}
    });
  }, []);

  // Anlık yenileme
  useRealtimeYenile(["kt_fisler"], () => {
    const b = bugun();
    Promise.all([
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","bekliyor"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","hazir"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).gte("acilis_tarihi",b+"T00:00:00"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).in("durum",["bekliyor","hazir","kismi_teslim"]),
    ]).then(([bek,haz,bug,acik]) => setStats({bekleyen:bek.count||0,hazir:haz.count||0,bugun_:bug.count||0,acik:acik.count||0}));
  });

  const widgetTikla = async (k) => {
    if (aktifFiltre === k) { setAktifFiltre(null); setFiltreFisler([]); return; }
    setAktifFiltre(k);
    setFiltreYukleniyor(true);
    const b = bugun();
    let q = supabase.from("kt_fisler").select("*, musteriler(ad_soyad, telefon)").order("acilis_tarihi", { ascending: false }).limit(50);
    if (k === "bekleyen") q = q.eq("durum", "bekliyor");
    else if (k === "hazir") q = q.eq("durum", "hazir");
    else if (k === "bugun") q = q.gte("acilis_tarihi", b + "T00:00:00");
    else if (k === "acik") q = q.in("durum", ["bekliyor","hazir","kismi_teslim"]);
    const { data } = await q;
    setFiltreFisler(data || []);
    setFiltreYukleniyor(false);
  };

  const tumKutular = [
    { k: "bekleyen", l: "Bekleyen Ürünler", v: stats.bekleyen, e: "⏳", c: "#d97706" },
    { k: "hazir", l: "Hazır Ürünler", v: stats.hazir, e: "✅", c: "#16a34a" },
    { k: "bugun", l: "Bugün Giren Fiş", v: stats.bugun_, e: "📥", c: "#2563eb" },
    { k: "acik", l: "Açık Fişler", v: stats.acik, e: "📋", c: "#dc2626" },
  ];

  const gosterilen = tumKutular.filter(k => widgets.includes(k.k));
  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };

  return (
    <div>
      <h2 style={{ color: "#111", marginTop: 0, marginBottom: 16 }}>🏠 Genel Durum</h2>
      <GecikmisFisler />
      <TeslimatUyarilari />

      {/* Özet finansal kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div style={{ ...krt, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac" }}>
          <div style={{ color: "#888", fontSize: 11 }}>💰 Bugün Tahsilat</div>
          <div style={{ color: "#15803d", fontWeight: 700, fontSize: 17, marginTop: 4 }}>{para(extraStats.bugunCiro)}</div>
        </div>
        <div style={{ ...krt, background: extraStats.acikBorc > 0 ? "linear-gradient(135deg,#fef2f2,#ffe4e6)" : "#fff", border: "1px solid " + (extraStats.acikBorc > 0 ? "#fecaca" : "#e0e0e0") }}>
          <div style={{ color: "#888", fontSize: 11 }}>⚠️ Toplam Açık Borç</div>
          <div style={{ color: extraStats.acikBorc > 0 ? "#dc2626" : "#16a34a", fontWeight: 700, fontSize: 17, marginTop: 4 }}>{para(extraStats.acikBorc)}</div>
        </div>
        <div style={{ ...krt }}>
          <div style={{ color: "#888", fontSize: 11 }}>📅 Bu Ay Tahsilat</div>
          <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 17, marginTop: 4 }}>{para(extraStats.ayTahsilat)}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {gosterilen.map(k => {
          const secili = aktifFiltre === k.k;
          return (
            <div key={k.k} onClick={() => widgetTikla(k.k)}
              style={{ ...krt, textAlign: "center", cursor: "pointer", transition: "all 0.18s",
                border: secili ? "2px solid " + k.c : "1px solid #e0e0e0",
                background: secili ? "#fff" : "#fff",
                boxShadow: secili ? `0 4px 16px ${k.c}33` : "0 1px 4px rgba(0,0,0,0.06)",
                transform: secili ? "translateY(-3px)" : "translateY(0)" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{k.e}</div>
              <div style={{ color: k.c, fontSize: 26, fontWeight: 700 }}>{k.v}</div>
              <div style={{ color: "#777", fontSize: 12, marginTop: 3 }}>{k.l}</div>
              {secili && <div style={{ color: k.c, fontSize: 10, marginTop: 4, fontWeight: 600 }}>▼ Listeleniyor</div>}
            </div>
          );
        })}
      </div>

      {/* Filtrelenmiş Liste */}
      {aktifFiltre && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ color: "#444", fontSize: 14, margin: 0 }}>
              {tumKutular.find(k => k.k === aktifFiltre)?.e} {tumKutular.find(k => k.k === aktifFiltre)?.l}
              <span style={{ color: "#999", fontWeight: 400, marginLeft: 8 }}>({filtreFisler.length} fiş)</span>
            </h3>
            <button onClick={() => { setAktifFiltre(null); setFiltreFisler([]); }}
              style={{ ...kbtn, fontSize: 11 }}>✕ Kapat</button>
          </div>
          {filtreYukleniyor ? (
            <div style={{ color: "#aaa", padding: 20, textAlign: "center" }}>⏳ Yükleniyor...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtreFisler.map(f => (
                <div key={f.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#111", fontWeight: 700, fontSize: 13 }}>#{f.fis_no}</span>
                    <span style={{ color: "#666", fontSize: 12, marginLeft: 10 }}>👤 {f.musteriler?.ad_soyad}</span>
                    {f.musteriler?.telefon && <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>📞 {f.musteriler.telefon}</span>}
                    <span style={{ color: "#888", fontSize: 12, marginLeft: 10 }}>📅 {tarih(f.acilis_tarihi)}</span>
                    {f.planlanan_teslim && <span style={{ color: new Date(f.planlanan_teslim) < new Date() ? "#dc2626" : "#d97706", fontSize: 12, marginLeft: 10 }}>🎯 {tarih(f.planlanan_teslim)}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#dc2626", fontWeight: 700 }}>{para(f.toplam_tutar)}</span>
                      {(f.nakit_indirim_yuzde || 0) > 0 && <div style={{ color: "#16a34a", fontSize: 10 }}>💵 Nakit: {para(f.indirimli_tutar)}</div>}
                      {(f.kalan || 0) > 0 && <div style={{ color: "#d97706", fontSize: 11 }}>Borç: {para(f.kalan)}</div>}
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f3f4f6", color: dc[f.durum] || "#888" }}>{dy[f.durum] || f.durum}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!filtreFisler.length && <p style={{ color: "#999", fontSize: 13, padding: 16, textAlign: "center" }}>Bu kategoride fiş yok.</p>}
            </div>
          )}
        </div>
      )}

      {/* Son Fişler - widget aktif değilse göster */}
      {!aktifFiltre && widgets.includes("son_fisler") && (
        <>
          <h3 style={{ color: "#444", fontSize: 14, marginBottom: 10 }}>Son Açık Fişler</h3>
          <SonFisler />
        </>
      )}
    </div>
  );
}

function SonFisler() {
  const [fisler, setFisler] = useState([]);
  useEffect(() => {
    supabase.from("kt_fisler").select("*, musteriler(ad_soyad, telefon)").not("durum", "eq", "teslim_edildi").order("acilis_tarihi", { ascending: false }).limit(6).then(({ data }) => setFisler(data || []));
  }, []);
  const dc = { bekliyor: "#d97706", hazir: "#16a34a", kismi_teslim: "#ca8a04" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", kismi_teslim: "Kısmi" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {fisler.map(f => (
        <div key={f.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ color: "#111", fontWeight: 700, fontSize: 13 }}>#{f.fis_no}</span>
            <span style={{ color: "#666", fontSize: 12, marginLeft: 12 }}>👤 {f.musteriler?.ad_soyad}</span>
            <span style={{ color: "#888", fontSize: 12, marginLeft: 12 }}>📅 {tarih(f.acilis_tarihi)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: "#dc2626", fontWeight: 700 }}>{para(f.toplam_tutar)}</span>
              {(f.nakit_indirim_yuzde || 0) > 0 && <div style={{ color: "#16a34a", fontSize: 10 }}>💵 Nakit: {para(f.indirimli_tutar)}</div>}
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f3f4f6", color: dc[f.durum] || "#888" }}>{dy[f.durum] || f.durum}</span>
            </div>
          </div>
        </div>
      ))}
      {!fisler.length && <p style={{ color: "#999", fontSize: 13 }}>Açık fiş yok.</p>}
    </div>
  );
}

// ===== FİŞ AÇ =====
export function KTFisAc({ kullanici, onTamamla, onYeniFis }) {
  const [adim, setAdim] = useState(1);
  const [musteri, setMusteri] = useState(null);
  const [musteriAra, setMusteriAra] = useState("");
  const [musteriler, setMusteriler] = useState([]);
  const [yeniMod, setYeniMod] = useState(false); // false | true | "duzenle"
  const [yeni, setYeni] = useState({ ad_soyad: "", telefon: "", email: "", adres: "" });
  const [adresGuncelleMod, setAdresGuncelleMod] = useState(false);
  const [adresInput, setAdresInput] = useState("");
  const [aktifHizmet, setAktifHizmet] = useState("KURU TEMİZLEME");
  const [kalemler, setKalemler] = useState([]);
  const [urunArama, setUrunArama] = useState("");
  const [barkodTarayici, setBarkodTarayici] = useState(false); // fiş açma barkod
  const [odeme, setOdeme] = useState("teslimde");
  const [hesapId, setHesapId] = useState("");
  const [hesaplar, setHesaplar] = useState([]);
  const [iskonto, setIskonto] = useState(0);
  const [fatura, setFatura] = useState(false);
  const [faturaUnvan, setFaturaUnvan] = useState("");
  const [faturaVno, setFaturaVno] = useState("");
  const [teslimTarih, setTeslimTarih] = useState(ucIsGunu());
  const [teslimSaat, setTeslimSaat] = useState("11:00");
  const [teslimatTuru, setTeslimatTuru] = useState(null); // null | "adrese_teslim" | "adresten_al"

  useEffect(() => {
    supabase.from("hesap_adlari").select("*").eq("aktif", true).then(({ data }) => setHesaplar(data || []));
    ayarTablosuOlustur();
    // Dinamik fiyatları yükle
    getFiyatlar();
  }, []);

  const musteriAra_ = async (v) => {
    setMusteriAra(v);
    if (v.length < 2) { setMusteriler([]); return; }
    const { data } = await supabase.from("musteriler").select("*").or(`ad_soyad.ilike.%${v}%,telefon.ilike.%${v}%`).limit(8);
    setMusteriler(data || []);
  };

  const musteriSec = (m) => { setMusteri(m); setMusteriAra(m.ad_soyad); setMusteriler([]); setAdresInput(m.adres || ""); };

  const musteriKaydet = async () => {
    if (!yeni.ad_soyad) return toast("Ad Soyad zorunlu!", "uyari");
    const { data } = await supabase.from("musteriler").insert(yeni).select().single();
    musteriSec(data); setYeniMod(false); setAdim(2);
  };

  const adresGuncelle = async () => {
    if (!musteri) return;
    await supabase.from("musteriler").update({ adres: adresInput }).eq("id", musteri.id);
    setMusteri({ ...musteri, adres: adresInput });
    setAdresGuncelleMod(false);
  };

  const filtreli = URUN_LISTESI.filter(u => u.ad.toLowerCase().includes(urunArama.toLowerCase()));

  const hizmetEkleKaleme = (kid, hizmet) => {
    const fp = fiyatBul(hizmet.k, kalemler.find(k => k.id === kid)?.urun_adi || "") || 0;
    setKalemler(kalemler.map(k => k.id !== kid ? k : { ...k, hizmetler: [...k.hizmetler, { hizmet_k: hizmet.k, hizmet_adi: hizmet.l, hizmet_renk: hizmet.r, fiyat: fp }] }));
  };

  const urunEkle = (urun) => {
    const hizmet = HIZMET_GRUPLARI.find(h => h.k === aktifHizmet);
    const fp = fiyatBul(aktifHizmet, urun.ad);
    const mevcutIdx = kalemler.findIndex(k => k.urun_adi === urun.ad);
    if (mevcutIdx >= 0 && !kalemler[mevcutIdx].hizmetler.find(h => h.hizmet_k === aktifHizmet)) {
      setKalemler(kalemler.map((x, i) => i !== mevcutIdx ? x : { ...x, hizmetler: [...x.hizmetler, { hizmet_k: aktifHizmet, hizmet_adi: hizmet.l, hizmet_renk: hizmet.r, fiyat: fp }] }));
      return;
    }
    setKalemler([...kalemler, { id: Date.now(), urun_adi: urun.ad, urun_e: urun.e, barkod: barkodUret(), renk: "", aciklama: "", adet: 1, hizmetler: [{ hizmet_k: aktifHizmet, hizmet_adi: hizmet.l, hizmet_renk: hizmet.r, fiyat: fp }] }]);
  };

  const kalemGuncelle = (id, alan, val) => setKalemler(kalemler.map(k => k.id !== id ? k : { ...k, [alan]: val }));
  const hizmetFiyatGuncelle = (kid, hk, fiyat) => setKalemler(kalemler.map(k => k.id !== kid ? k : { ...k, hizmetler: k.hizmetler.map(h => h.hizmet_k === hk ? { ...h, fiyat: +fiyat } : h) }));
  const hizmetSil = (kid, hk) => setKalemler(kalemler.map(k => k.id !== kid ? k : { ...k, hizmetler: k.hizmetler.filter(h => h.hizmet_k !== hk) }).filter(k => k.hizmetler.length > 0));
  const kalemSil = (id) => setKalemler(kalemler.filter(k => k.id !== id));

  const toplamTutar = kalemler.reduce((t, k) => t + k.hizmetler.reduce((tt, h) => tt + (+h.fiyat || 0), 0), 0);
  const indirimliTutar = iskonto > 0 ? toplamTutar * (1 - iskonto / 100) : toplamTutar;

  const fisOlustur = async () => {
    // ⚠️ Popup blocker bypass: window.open kullanıcı tıklamasıyla senkron çağrılmalı
    const printWin = window.open("about:blank", "_blank", "width=400,height=700,scrollbars=yes");
    if (!printWin) { toast("Popup engellendi! Tarayıcı popup izinlerini kontrol edin.", "uyari"); return; }
    printWin.document.write("<html><body style='font-family:sans-serif;padding:20px;text-align:center;'><p>⏳ Fiş hazırlanıyor...</p></body></html>");

    try {
      const fisNo = await fisNoUret();
      const fisBarkod = fisNo;
      const ayarlar = {};
      try {
        const { data: a } = await supabase.from("kt_ayarlar").select("*");
        (a || []).forEach(x => { ayarlar[x.anahtar] = x.deger; });
      } catch {}

      const { data: fis, error: fisHata } = await supabase.from("kt_fisler").insert({
        fis_no: fisNo, barkod: fisBarkod, musteri_id: musteri?.id,
        toplam_tutar: toplamTutar, odeme_turu: odeme, hesap_id: hesapId || null,
        nakit_indirim_yuzde: iskonto, indirimli_tutar: indirimliTutar,
        kalan: odeme === "teslimde" ? toplamTutar : 0,
        fatura_istedi: fatura, fatura_unvan: faturaUnvan || null, fatura_vergi_no: faturaVno || null,
        planlanan_teslim: teslimTarih ? teslimTarih + (teslimSaat ? "T" + teslimSaat : "T11:00") : null,
        teslimat_turu: teslimatTuru || null,
        kullanici_id: kullanici?.id
      }).select().single();

      if (fisHata || !fis) {
        printWin.document.write("<html><body style='font-family:sans-serif;padding:20px;color:red;'><h3>❌ Fiş oluşturulamadı</h3><p>" + (fisHata?.message || "Bilinmeyen hata") + "</p></body></html>");
        return;
      }

      for (const k of kalemler) {
        await supabase.from("kt_fis_kalemleri").insert({
          fis_id: fis.id, barkod: k.barkod, urun_adi: k.urun_adi,
          renk: k.renk || null, aciklama: k.aciklama || null, toplam_adet: k.adet,
          hizmet_bilgi: JSON.stringify(k.hizmetler),
        });
      }
      fisCiktisi(fis, kalemler, musteri, toplamTutar, indirimliTutar, odeme, iskonto, ayarlar, printWin);

      // Mobil cihazda ise yazıcı kuyruğuna da ekle
      if (window.innerWidth < 768) {
        try {
          const fisHtmlStr = printWin.document.documentElement?.outerHTML || "";
          await telefonFisYazdir(fisHtmlStr, fis.fis_no, musteri?.ad_soyad, musteri?.telefon);
        } catch {}
      }

      onTamamla?.();
    } catch (err) {
      try {
        printWin.document.open();
        printWin.document.write("<html><body style='font-family:sans-serif;padding:20px;color:red;'><h3>❌ Hata oluştu</h3><p>" + (err?.message || String(err)) + "</p><p>Pencereyi kapatıp tekrar deneyin.</p></body></html>");
        printWin.document.close();
      } catch {}
      console.error("fisOlustur hatası:", err);
    }
  };

  // Saat seçenekleri 11:00-19:00 arası
  const saatSecenekleri = [];
  for (let h = 11; h <= 19; h++) {
    saatSecenekleri.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 19) saatSecenekleri.push(`${String(h).padStart(2, "0")}:30`);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#111", margin: 0 }}>📝 Yeni Fiş Aç</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {onYeniFis && (
            <button onClick={onYeniFis} style={{ ...kbtn, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontSize: 12 }}>
              ➕ Aynı Anda Yeni Fiş
            </button>
          )}
          <button onClick={() => {
            if (kalemler.length > 0 || musteri) {
              if (window.confirm("Fiş girişini iptal etmek istediğinizden emin misiniz? Girilen bilgiler kaybolacak.")) {
                onTamamla?.();
              }
            } else { onTamamla?.(); }
          }} style={{ ...kbtn, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 12 }}>
            ✕ İptal
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["1. Müşteri", "2. Ürünler", "3. Ödeme & Fiş"].map((s, i) => (
          <div key={s} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: adim === i + 1 ? "#e94560" : adim > i + 1 ? "#dcfce7" : "#f3f4f6", color: adim === i + 1 ? "#fff" : adim > i + 1 ? "#16a34a" : "#888" }}>{s}</div>
        ))}
      </div>

      {adim === 1 && (
        <div style={{ maxWidth: 460 }}>
          <div style={krt}>
            <label style={lbl}>Müşteri Ara (Ad veya Telefon)</label>
            <input value={musteriAra} onChange={e => musteriAra_(e.target.value)} placeholder="Aramak için yazın..." style={{ ...inp, marginBottom: 8 }} autoFocus />
            {musteriler.map(m => (
              <div key={m.id} onClick={() => musteriSec(m)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: "#f9fafb", border: "1px solid #e5e7eb" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}>
                <div style={{ color: "#111", fontWeight: 600, fontSize: 13 }}>{m.ad_soyad}</div>
                <div style={{ color: "#666", fontSize: 12 }}>📞 {m.telefon}</div>
              </div>
            ))}
            {musteri ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, marginTop: 10 }}>
                <div style={{ color: "#16a34a", fontWeight: 600 }}>✅ {musteri.ad_soyad}</div>
                <div style={{ color: "#555", fontSize: 12 }}>📞 {musteri.telefon}</div>
                {musteri.adres && !adresGuncelleMod && (
                  <div style={{ color: "#555", fontSize: 12, marginTop: 3 }}>📍 {musteri.adres}</div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setAdim(2)} style={{ ...abtn, flex: 1 }}>Devam Et →</button>
                  <button onClick={() => { setAdresGuncelleMod(!adresGuncelleMod); setAdresInput(musteri.adres || ""); }}
                    style={{ ...kbtn, fontSize: 11, background: adresGuncelleMod ? "#fef2f2" : "#f9fafb" }}>
                    {adresGuncelleMod ? "❌ İptal" : musteri.adres ? "📍 Adres Güncelle" : "📍 Adres Ekle"}
                  </button>
                  <button onClick={() => {
                    setAdresGuncelleMod(false);
                    setYeni({ ad_soyad: musteri.ad_soyad || "", telefon: musteri.telefon || "", email: musteri.email || "", adres: musteri.adres || "" });
                    setYeniMod(yeniMod === "duzenle" ? false : "duzenle");
                  }} style={{ ...kbtn, fontSize: 11, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                    ✏️ Bilgileri Güncelle
                  </button>
                </div>
                {yeniMod === "duzenle" && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div><label style={lbl}>Ad Soyad *</label><input value={yeni.ad_soyad} onChange={e => setYeni({...yeni, ad_soyad: e.target.value})} style={inp}/></div>
                      <div><label style={lbl}>Telefon</label><input value={yeni.telefon} onChange={e => setYeni({...yeni, telefon: e.target.value})} style={inp}/></div>
                      <div><label style={lbl}>E-posta</label><input value={yeni.email} onChange={e => setYeni({...yeni, email: e.target.value})} style={inp}/></div>
                      <div><label style={lbl}>Adres</label><input value={yeni.adres} onChange={e => setYeni({...yeni, adres: e.target.value})} placeholder="Mahalle, Sokak..." style={inp}/></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={async () => {
                        if (!yeni.ad_soyad) return toast("Ad Soyad zorunlu!", "uyari");
                        const { data } = await supabase.from("musteriler").update(yeni).eq("id", musteri.id).select().single();
                        setMusteri({ ...musteri, ...yeni });
                        setYeniMod(false);
                      }} style={{ ...abtn, fontSize: 12 }}>💾 Kaydet</button>
                      <button onClick={() => setYeniMod(false)} style={{ ...kbtn, fontSize: 12 }}>İptal</button>
                    </div>
                  </div>
                )}
                {adresGuncelleMod && (
                  <div style={{ marginTop: 8 }}>
                    <input value={adresInput} onChange={e => setAdresInput(e.target.value)}
                      placeholder="Sokak, Mahalle, İlçe, Şehir..." style={{ ...inp, marginBottom: 6 }} />
                    <button onClick={adresGuncelle} style={{ ...abtn, width: "100%", fontSize: 12 }}>💾 Adresi Kaydet</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setYeniMod(yeniMod === true ? false : true)} style={{ ...kbtn, marginTop: 8 }}>{yeniMod === true ? "İptal" : "+ Yeni Müşteri"}</button>
            )}
            {yeniMod === true && (
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 8 }}><label style={lbl}>Ad Soyad *</label><input value={yeni.ad_soyad} onChange={e => setYeni({ ...yeni, ad_soyad: e.target.value })} style={inp} /></div>
                <div style={{ marginBottom: 8 }}><label style={lbl}>Telefon</label><input value={yeni.telefon} onChange={e => setYeni({ ...yeni, telefon: e.target.value })} style={inp} /></div>
                <div style={{ marginBottom: 8 }}><label style={lbl}>E-posta</label><input value={yeni.email} onChange={e => setYeni({ ...yeni, email: e.target.value })} style={inp} /></div>
                <div style={{ marginBottom: 10 }}><label style={lbl}>Adres</label><input value={yeni.adres} onChange={e => setYeni({ ...yeni, adres: e.target.value })} placeholder="Sokak, Mahalle, İlçe..." style={inp} /></div>
                <button onClick={musteriKaydet} style={abtn}>Kaydet ve Devam →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {adim === 2 && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {HIZMET_GRUPLARI.map(h => (
              <button key={h.k} onClick={() => setAktifHizmet(h.k)} style={{ padding: "7px 14px", borderRadius: 20, border: "2px solid " + (aktifHizmet === h.k ? h.r : "#e5e7eb"), background: aktifHizmet === h.k ? h.r : "#fff", color: aktifHizmet === h.k ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{h.l}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                <input value={urunArama} onChange={e => setUrunArama(e.target.value)} placeholder="🔍 Ürün ara..." style={{ ...inp, flex:1 }} />
                <button onClick={() => setBarkodTarayici(true)} style={{ ...kbtn, background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", whiteSpace:"nowrap", fontSize:18, padding:"6px 10px" }} title="Barkod Tara">📷</button>
                <TelefonBarkodButon kaynak="fis_ac" onBarkod={(b) => setUrunArama(b)} />
              </div>
              {barkodTarayici && <BarcodeScanner baslik="Ürün Barkodu Tara" onKapat={() => setBarkodTarayici(false)} onSonuc={(barkod) => { setBarkodTarayici(false); setUrunArama(barkod); }} />}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))", gap: 7, maxHeight: "58vh", overflowY: "auto" }}>
                {filtreli.map(u => {
                  const hizmet = HIZMET_GRUPLARI.find(h => h.k === aktifHizmet);
                  const fp = fiyatBul(aktifHizmet, u.ad);
                  return (
                    <div key={u.ad} onClick={() => urunEkle(u)} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 5px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = hizmet?.r || "#e94560"; e.currentTarget.style.transform = "scale(1.03)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "scale(1)"; }}>
                      <div style={{ fontSize: 22 }}>{u.e}</div>
                      <div style={{ color: "#222", fontSize: 10, marginTop: 3, lineHeight: 1.2 }}>{u.ad}</div>
                      {fp > 0 && <div style={{ color: hizmet?.r || "#e94560", fontSize: 10, fontWeight: 600 }}>{fp} ₺</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ color: "#555", fontSize: 12, marginBottom: 8 }}>{kalemler.length} ürün:</div>
              {!kalemler.length && <div style={{ color: "#aaa", fontSize: 13, padding: 20, textAlign: "center", background: "#f9fafb", borderRadius: 10 }}>Soldan ürün seçin...</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "58vh", overflowY: "auto" }}>
                {kalemler.map(k => (
                  <div key={k.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{k.urun_e}</span>
                        <div>
                          <div style={{ color: "#111", fontSize: 12, fontWeight: 600 }}>{k.urun_adi}</div>
                          <div style={{ color: "#888", fontSize: 10 }}>🔖 {k.barkod}</div>
                        </div>
                      </div>
                      <button onClick={() => kalemSil(k.id)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "2px 7px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                    {k.hizmetler.map(h => (
                      <div key={h.hizmet_k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "#f3f4f6", color: h.hizmet_renk || "#555", fontWeight: 600, whiteSpace: "nowrap" }}>{h.hizmet_adi}</span>
                        <input type="number" value={h.fiyat} onChange={e => hizmetFiyatGuncelle(k.id, h.hizmet_k, e.target.value)} style={{ ...inp, width: 75, padding: "3px 7px", fontSize: 11 }} />
                        <button onClick={() => hizmetSil(k.id, h.hizmet_k)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 10, padding: "2px 5px", borderRadius: 4 }}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {HIZMET_GRUPLARI.filter(h => !k.hizmetler.find(x => x.hizmet_k === h.k)).map(h => (
                        <button key={h.k} onClick={() => hizmetEkleKaleme(k.id, h)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, border: "1px solid " + (h.r), background: "#fff", color: h.r, cursor: "pointer" }}>+ {h.l}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 50px", gap: 6 }}>
                      <div>
                        <label style={lbl}>Renk</label>
                        <select value={k.renk} onChange={e => kalemGuncelle(k.id, "renk", e.target.value)} style={{ ...inp, fontSize: 11, color: "#222", background: "#fff" }}>
                          <option value="">Seç...</option>
                          {RENKLER.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div><label style={lbl}>Not</label><input value={k.aciklama} onChange={e => kalemGuncelle(k.id, "aciklama", e.target.value)} style={{ ...inp, fontSize: 11 }} /></div>
                      <div><label style={lbl}>Adet</label><input type="number" min="1" value={k.adet} onChange={e => kalemGuncelle(k.id, "adet", +e.target.value)} style={{ ...inp, fontSize: 11 }} /></div>
                    </div>
                    <div style={{ textAlign: "right", color: "#dc2626", fontWeight: 700, fontSize: 12, marginTop: 6 }}>{para(k.hizmetler.reduce((t, h) => t + (+h.fiyat || 0), 0))}</div>
                  </div>
                ))}
              </div>
              {kalemler.length > 0 && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "#f9fafb", borderRadius: 10, display: "flex", justifyContent: "space-between", border: "1px solid #e5e7eb" }}>
                  <span style={{ color: "#555" }}>Toplam:</span>
                  <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 16 }}>{para(toplamTutar)}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setAdim(1)} style={kbtn}>← Geri</button>
            <button onClick={() => kalemler.length > 0 ? setAdim(3) : toast("En az bir ürün ekleyin!", "uyari")} style={abtn}>Ödemeye Geç →</button>
          </div>
        </div>
      )}

      {adim === 3 && (
        <div style={{ maxWidth: 500 }}>
          <div style={krt}>
            <h3 style={{ color: "#111", marginTop: 0, marginBottom: 14 }}>Ödeme Bilgileri</h3>
            <label style={lbl}>Ödeme Zamanı</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[{ k: "teslimde", l: "Teslimde Öde" }, { k: "nakit", l: "Nakit" }, { k: "kredi_karti", l: "Kredi Kartı" }, { k: "havale", l: "Havale/EFT" }].map(o => (
                <button key={o.k} onClick={() => setOdeme(o.k)} style={{ padding: 9, borderRadius: 8, border: "2px solid " + (odeme === o.k ? "#e94560" : "#e5e7eb"), background: odeme === o.k ? "#fef2f2" : "#fff", color: odeme === o.k ? "#e94560" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{o.l}</button>
              ))}
            </div>
            {(odeme === "kredi_karti" || odeme === "havale") && (
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Hesap Seç</label>
                <select value={hesapId} onChange={e => setHesapId(e.target.value)} style={{ ...inp, color: "#222" }}>
                  <option value="">Hesap seçin...</option>
                  {hesaplar.filter(h => h.hesap_turu === (odeme === "kredi_karti" ? "kredi_karti" : "havale")).map(h => <option key={h.id} value={h.id}>{h.hesap_adi}</option>)}
                </select>
              </div>
            )}
            {/* Teslimat Türü */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Teslimat Türü (opsiyonel)</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { k: "adrese_teslim", l: "🚚 Adrese Teslim", r: "#2563eb" },
                  { k: "adresten_al", l: "🏠 Adresten Al", r: "#d97706" },
                ].map(t => (
                  <button key={t.k} onClick={() => setTeslimatTuru(teslimatTuru === t.k ? null : t.k)}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: `2px solid ${teslimatTuru === t.k ? t.r : "#e5e7eb"}`, background: teslimatTuru === t.k ? t.r + "18" : "#fff", color: teslimatTuru === t.k ? t.r : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {t.l}
                  </button>
                ))}
              </div>
              {teslimatTuru && musteri?.adres && (
                <div style={{ marginTop: 6, padding: "7px 10px", background: "#eff6ff", borderRadius: 7, fontSize: 12, color: "#1d4ed8" }}>
                  📍 {musteri.adres}
                </div>
              )}
              {teslimatTuru && !musteri?.adres && (
                <div style={{ marginTop: 6, padding: "7px 10px", background: "#fffbeb", borderRadius: 7, fontSize: 12, color: "#92400e" }}>
                  ⚠️ Müşterinin kayıtlı adresi yok - 1. adımda adres ekleyebilirsiniz.
                </div>
              )}
            </div>
            {/* Teslim Tarihi - 3 iş günü otomatik, manuel değiştirilebilir */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...lbl, marginBottom: 6 }}>Planlanan Teslim Tarihi</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <input type="date" value={teslimTarih} onChange={e => setTeslimTarih(e.target.value)} style={inp} />
                  <div style={{ color: "#888", fontSize: 10, marginTop: 3 }}>Otomatik 3 iş günü sonrası</div>
                </div>
                <div>
                  <select value={teslimSaat} onChange={e => setTeslimSaat(e.target.value)} style={{ ...inp, color: "#222" }}>
                    {saatSecenekleri.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div style={{ color: "#888", fontSize: 10, marginTop: 3 }}>11:00 - 19:00 arası</div>
                </div>
              </div>
            </div>
            {/* Nakit Özel İndirim */}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Nakit Özel İndirim (%)</label>
              <input type="number" min="0" max="100" value={iskonto} onChange={e => setIskonto(+e.target.value)} style={{ ...inp, width: 120 }} placeholder="0" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <input type="checkbox" id="fat" checked={fatura} onChange={e => setFatura(e.target.checked)} />
              <label htmlFor="fat" style={{ color: "#444", fontSize: 13, cursor: "pointer" }}>🧾 Fatura İstedi</label>
            </div>
            {fatura && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div><label style={lbl}>Ünvan</label><input value={faturaUnvan} onChange={e => setFaturaUnvan(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Vergi No / TC</label><input value={faturaVno} onChange={e => setFaturaVno(e.target.value)} style={inp} /></div>
              </div>
            )}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
              {iskonto > 0 ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 600 }}>💵 Nakite Özel Fiyat</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{para(indirimliTutar)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12, color: "#888" }}>
                    <span>(%{iskonto} nakit indirimi uygulandı, -{ para(toplamTutar - indirimliTutar)})</span>
                  </div>
                </>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, background: "#f1f5f9", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ color: "#0f172a" }}>NET TOPLAM</span>
                <span style={{ color: "#dc2626" }}>{para(toplamTutar)}</span>
              </div>
              {odeme === "teslimde" && iskonto > 0 && (
                <div style={{ marginTop: 6, padding: "6px 10px", background: "#fffbeb", borderRadius: 6, fontSize: 12, color: "#92400e" }}>
                  ⚠️ Teslimde tahsil edilecek. Nakite özel fiyat için nakit ödeme seçin.
                </div>
              )}
              {odeme === "teslimde" && iskonto === 0 && (
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>⚠️ Teslimde tahsil edilecek</div>
              )}
              {odeme === "nakit" && iskonto > 0 && (
                <div style={{ marginTop: 6, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#15803d" }}>
                  ✅ Nakit ödeme - {para(indirimliTutar)} tahsil edilecek
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setAdim(2)} style={kbtn}>← Geri</button>
            <button onClick={fisOlustur} style={{ ...abtn, flex: 1, padding: 13, fontSize: 14 }}>🖨️ Fiş Oluştur & Yazdır</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== FİŞ LİSTESİ =====
export function KTFisler({ kullanici }) {
  const [fisler, setFisler] = useState([]);
  const [filtre, setFiltre] = useState("acik");
  const [ara, setAra] = useState("");
  const [fislerBarkodAcik, setFislerBarkodAcik] = useState(false);
  const [seciliFisler, setSeciliFisler] = useState([]);
  const [waKuyruk, setWaKuyruk] = useState([]);
  const [waIndex, setWaIndex] = useState(0);
  // ✅ Eksik state'ler — siyah ekran bundan kaynaklanıyordu
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sayilar, setSayilar] = useState({ acik:0, hazir:0, bekliyor:0, borclu:0, tBugun:0, t7:0, t15:0, t30:0 });
  const [topluWaMod, setTopluWaMod] = useState(false);
  const [secili, setSecili] = useState(null);
  const [kalemler, setKalemler] = useState([]);

  const bugunStr = () => new Date().toISOString().split("T")[0];
  const gunGeri = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; };

  const yukle = async () => {
    setYukleniyor(true);
    let q = supabase.from("kt_fisler").select("*, musteriler(ad_soyad, telefon)").order("acilis_tarihi", { ascending: false }).limit(200);
    if (filtre === "acik") q = q.in("durum", ["bekliyor","hazir","kismi_teslim"]);
    else if (filtre === "iptal") q = q.eq("durum", "iptal_edildi");
    else if (filtre === "hazir") q = q.eq("durum", "hazir");
    else if (filtre === "bekliyor") q = q.eq("durum", "bekliyor");
    else if (filtre === "teslim_bugun") q = q.eq("durum","teslim_edildi").gte("teslim_tarihi", bugunStr()+"T00:00:00");
    else if (filtre === "teslim_7") q = q.eq("durum","teslim_edildi").gte("teslim_tarihi", gunGeri(7)+"T00:00:00");
    else if (filtre === "teslim_15") q = q.eq("durum","teslim_edildi").gte("teslim_tarihi", gunGeri(15)+"T00:00:00");
    else if (filtre === "teslim_30") q = q.eq("durum","teslim_edildi").gte("teslim_tarihi", gunGeri(30)+"T00:00:00");
    else if (filtre === "teslim_tum") q = q.eq("durum","teslim_edildi");
    else if (filtre === "borclu") q = q.gt("kalan", 0);
    else if (filtre === "hepsi") {} // tümü
    const { data } = await q;
    setFisler(data || []);
    setYukleniyor(false);
  };

  // Sidebar sayıları
  const sayilariYukle = async () => {
    const b = bugunStr();
    const [acik, hazir, bek, borclu, tBugun, t7, t15, t30] = await Promise.all([
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).in("durum",["bekliyor","hazir","kismi_teslim"]).not("durum","eq","iptal_edildi"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","hazir"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","bekliyor"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).gt("kalan",0),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","teslim_edildi").gte("teslim_tarihi",b+"T00:00:00"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","teslim_edildi").gte("teslim_tarihi",gunGeri(7)+"T00:00:00"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","teslim_edildi").gte("teslim_tarihi",gunGeri(15)+"T00:00:00"),
      supabase.from("kt_fisler").select("id",{count:"exact",head:true}).eq("durum","teslim_edildi").gte("teslim_tarihi",gunGeri(30)+"T00:00:00"),
    ]);
    setSayilar({ acik:acik.count, hazir:hazir.count, bekliyor:bek.count, borclu:borclu.count, tBugun:tBugun.count, t7:t7.count, t15:t15.count, t30:t30.count });
  };

  useEffect(() => { yukle(); }, [filtre]);
  useEffect(() => { sayilariYukle(); }, []);

  // Anlık yenileme - Supabase Realtime
  useEffect(() => {
    const ch = supabase.channel("kt_fisler_realtime_" + Date.now())
      .on("postgres_changes", { event: "*", schema: "public", table: "kt_fisler" }, () => {
        yukle(); sayilariYukle();
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [filtre]);

  const filtreli = fisler.filter(f =>
    f.fis_no?.includes(ara) ||
    f.musteriler?.ad_soyad?.toLowerCase().includes(ara.toLowerCase()) ||
    f.musteriler?.telefon?.includes(ara)
  );

  const fisDetay = async (fis) => {
    setSecili(fis);
    const { data } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
    setKalemler(data || []);
  };

  const hazirIsaretle = async (fis_id, e) => {
    e.stopPropagation();
    await supabase.from("kt_fisler").update({ durum: "hazir" }).eq("id", fis_id);
    yukle();
    if (secili?.id === fis_id) setSecili({ ...secili, durum: "hazir" });
  };

  const tekrarBas = async (fis, e) => {
    e.stopPropagation();
    const printWin = window.open("about:blank", "_blank", "width=400,height=700,scrollbars=yes");
    if (!printWin) { toast("Popup engellendi!", "uyari"); return; }
    printWin.document.write("<html><body style='font-family:sans-serif;padding:20px;text-align:center;'><p>⏳ Yükleniyor...</p></body></html>");
    try {
      const { data: k } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
      const { data: m } = fis.musteri_id ? await supabase.from("musteriler").select("*").eq("id", fis.musteri_id).single() : { data: null };
      const ayarlar = {};
      try { const { data: a } = await supabase.from("kt_ayarlar").select("*"); (a||[]).forEach(x => { ayarlar[x.anahtar] = x.deger; }); } catch {}
      fisCiktisi(fis, k || [], m, fis.toplam_tutar, fis.indirimli_tutar, fis.odeme_turu, fis.nakit_indirim_yuzde, ayarlar, printWin);
    } catch(err) {
      try { printWin.document.write("<html><body style='color:red;padding:20px;'>❌ " + err?.message + "</body></html>"); } catch {}
    }
  };

  const fisSil = async (fis, e) => {
    e.stopPropagation();
    if (!window.confirm(`#${fis.fis_no} fişini silmek istediğinizden emin misiniz?`)) return;
    await supabase.from("kt_fis_kalemleri").delete().eq("fis_id", fis.id);
    await supabase.from("kt_fisler").delete().eq("id", fis.id);
    if (secili?.id === fis.id) setSecili(null);
    yukle();
  };

  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };
  const odemeYaz = { nakit: "💵 Nakit", kredi_karti: "💳 Kart", havale: "🏦 Havale", teslimde: "⏳ Teslimde" };

  const navGrup = (baslik, items) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ color: "#aaa", fontSize: 10, fontWeight: 700, padding: "6px 12px 2px", textTransform: "uppercase", letterSpacing: 1 }}>{baslik}</div>
      {items.map(item => (
        <button key={item.v} onClick={() => setFiltre(item.v)}
          style={{ width: "100%", padding: "8px 12px", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 8, marginBottom: 2, fontSize: 12,
            background: filtre === item.v ? item.bg || "#fef2f2" : "transparent",
            color: filtre === item.v ? item.c || "#e94560" : "#374151",
            fontWeight: filtre === item.v ? 700 : 400,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{item.l}</span>
          {sayilar[item.say] !== undefined && sayilar[item.say] > 0 && (
            <span style={{ background: filtre === item.v ? item.c || "#e94560" : "#e5e7eb", color: filtre === item.v ? "#fff" : "#555", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>
              {sayilar[item.say]}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 0, minHeight: 500, height: "100%" }}>

      {/* Sol Sidebar */}
      <div style={{ width: 190, flexShrink: 0, borderRight: "1px solid #e5e7eb", paddingRight: 8, overflowY: "auto", paddingTop: 4 }}>
        <div style={{ color: "#111", fontWeight: 700, fontSize: 14, padding: "0 12px 10px" }}>📋 Fişler</div>

        {navGrup("Aktif", [
          { v: "acik", l: "🔓 Tüm Açıklar", c: "#e94560", bg: "#fef2f2", say: "acik" },
          { v: "hazir", l: "✅ Hazır", c: "#16a34a", bg: "#f0fdf4", say: "hazir" },
          { v: "bekliyor", l: "⏳ Bekliyor", c: "#d97706", bg: "#fffbeb", say: "bekliyor" },
          { v: "borclu", l: "⚠️ Borçlu", c: "#dc2626", bg: "#fef2f2", say: "borclu" },
        ])}

        {navGrup("Teslim Edilenler", [
          { v: "teslim_bugun", l: "📦 Bugün", c: "#2563eb", bg: "#eff6ff", say: "tBugun" },
          { v: "teslim_7", l: "📦 Son 7 Gün", c: "#2563eb", bg: "#eff6ff", say: "t7" },
          { v: "teslim_15", l: "📦 Son 15 Gün", c: "#2563eb", bg: "#eff6ff", say: "t15" },
          { v: "teslim_30", l: "📦 Son 30 Gün", c: "#2563eb", bg: "#eff6ff", say: "t30" },
          { v: "teslim_tum", l: "📦 Tümü", c: "#6366f1", bg: "#f5f3ff" },
        ])}

        {navGrup("Diğer", [
          { v: "iptal", l: "🚫 İptal Edilenler", c: "#6b7280", bg: "#f9fafb" },
          { v: "hepsi", l: "📋 Tüm Fişler", c: "#7c3aed", bg: "#f5f3ff" },
        ])}

        {/* Arama */}
        <div style={{ padding: "6px 4px", display:"flex", gap:4 }}>
          <input value={ara} onChange={e => setAra(e.target.value)}
            placeholder="🔍 Ara..." style={{ ...inp, fontSize: 12, padding: "7px 10px", color: "#222", flex:1 }} />
          <button onClick={() => setFislerBarkodAcik(true)} style={{ ...kbtn, fontSize:16, padding:"5px 8px", background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" }} title="Barkod Tara">📷</button>
          <TelefonBarkodButon kaynak="fisler" onBarkod={(b) => setAra(b)} />
        </div>
        {fislerBarkodAcik && <BarcodeScanner baslik="Fiş Ara" onKapat={() => setFislerBarkodAcik(false)} onSonuc={(barkod) => { setFislerBarkodAcik(false); setAra(barkod); }} />}
      </div>

      {/* Sağ İçerik */}
      <div style={{ flex: 1, overflowY: "auto", paddingLeft: 12, minWidth: 0 }}>
        {/* Başlık + sayaç */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ color: "#555", fontSize: 13 }}>
            {yukleniyor ? "⏳ Yükleniyor..." : <span><strong style={{ color: "#111" }}>{filtreli.length}</strong> fiş</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {topluWaMod ? (
              <>
                <span style={{ color: "#374151", fontSize: 12, alignSelf: "center" }}>{seciliFisler.length} seçili</span>
                <button onClick={() => setSeciliFisler(filtreli.filter(f => f.musteriler?.telefon).map(f => f.id))} style={{ ...kbtn, fontSize: 11 }}>Tümünü Seç</button>
                <button onClick={() => {
                  if (!seciliFisler.length) return toast("Fiş seçin!", "uyari");
                  const secililer = filtreli.filter(f => seciliFisler.includes(f.id) && f.musteriler?.telefon);
                  if (!secililer.length) return toast("Seçili fişlerde telefon numarası yok!", "uyari");
                  // Kuyruğu hazırla - sıralı gönderim modal'ı açılacak
                  setWaKuyruk(secililer);
                  setWaIndex(0);
                  setTopluWaMod(false);
                  setSeciliFisler([]);
                }} style={{ ...abtn, fontSize: 11, background: "#16a34a" }}>📱 Gönder ({seciliFisler.length})</button>
                <button onClick={() => { setTopluWaMod(false); setSeciliFisler([]); }} style={kbtn}>✕ İptal</button>
              </>
            ) : (
              <>
                <button onClick={() => setTopluWaMod(true)} style={{ ...kbtn, fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>📱 Toplu WA</button>
                <button onClick={yukle} style={{ ...kbtn, fontSize: 11 }}>🔄 Yenile</button>
              </>
            )}

            {/* Sıralı WA gönderim modal'ı */}
            {waKuyruk.length > 0 && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                  {/* Başlık ve ilerleme */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ color: "#111", margin: 0, fontSize: 16 }}>📱 WhatsApp Gönderim</h3>
                    <span style={{ color: "#888", fontSize: 13 }}>{waIndex + 1} / {waKuyruk.length}</span>
                  </div>

                  {/* İlerleme çubuğu */}
                  <div style={{ background: "#f3f4f6", borderRadius: 8, height: 6, marginBottom: 20, overflow: "hidden" }}>
                    <div style={{ background: "#16a34a", height: "100%", width: ((waIndex) / waKuyruk.length * 100) + "%", transition: "width 0.3s" }} />
                  </div>

                  {/* Mevcut müşteri */}
                  <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "16px 20px", marginBottom: 20, border: "2px solid #86efac" }}>
                    <div style={{ color: "#111", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {waKuyruk[waIndex]?.musteriler?.ad_soyad}
                    </div>
                    <div style={{ color: "#16a34a", fontSize: 13 }}>
                      📞 {waKuyruk[waIndex]?.musteriler?.telefon}
                    </div>
                    <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>
                      Fiş #{waKuyruk[waIndex]?.fis_no}
                    </div>
                  </div>

                  {/* Geri kalan liste */}
                  {waKuyruk.length > 1 && (
                    <div style={{ marginBottom: 16, fontSize: 12, color: "#888" }}>
                      Sıradakiler: {waKuyruk.slice(waIndex + 1, waIndex + 4).map(f => f.musteriler?.ad_soyad).join(", ")}
                      {waKuyruk.length - waIndex - 4 > 0 && ` +${waKuyruk.length - waIndex - 4} kişi`}
                    </div>
                  )}

                  {/* Butonlar */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => {
                      const f = waKuyruk[waIndex];
                      const tel = waTel(f.musteriler.telefon);
                      const mesaj = encodeURIComponent(`Sayın ${f.musteriler.ad_soyad}, #${f.fis_no} numaralı siparişiniz hazırdır.\n\nSipariş durumunuz: ${window.location.origin}/?musteri=${f.barkod || f.fis_no}`);
                      window.open(`whatsapp://send?phone=90${tel}&text=${mesaj}`, "_blank");
                      // Sonraki müşteriye geç
                      if (waIndex + 1 < waKuyruk.length) {
                        setWaIndex(waIndex + 1);
                      } else {
                        setWaKuyruk([]);
                        setWaIndex(0);
                        toast("Tüm mesajlar gönderildi!", "basari");
                      }
                    }} style={{ ...abtn, flex: 1, fontSize: 14, padding: 12, background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                      📱 Gönder ve Sonraki →
                    </button>
                    <button onClick={() => {
                      // Bu kişiyi atla
                      if (waIndex + 1 < waKuyruk.length) {
                        setWaIndex(waIndex + 1);
                      } else {
                        setWaKuyruk([]);
                        setWaIndex(0);
                      }
                    }} style={{ ...kbtn, fontSize: 12, padding: "12px 14px" }}>Atla</button>
                    <button onClick={() => { setWaKuyruk([]); setWaIndex(0); }} style={{ ...kbtn, fontSize: 12, color: "#dc2626", padding: "12px 14px" }}>✕</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtreli.map(f => {
            const isTeslim = f.durum === "teslim_edildi";
            const isGecikme = f.planlanan_teslim && new Date(f.planlanan_teslim) < new Date() && !isTeslim;
            const waSecili = seciliFisler.includes(f.id);
            return (
              <div key={f.id} onClick={() => topluWaMod ? setSeciliFisler(waSecili ? seciliFisler.filter(x=>x!==f.id) : [...seciliFisler, f.id]) : fisDetay(f)}
                style={{ background: secili?.id === f.id ? "#fef2f2" : "#fff",
                  border: "1px solid " + (secili?.id === f.id ? "#fca5a5" : isGecikme ? "#fca5a5" : "#e5e7eb"),
                  borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                  borderLeft: "4px solid " + (dc[f.durum] || "#e5e7eb") }}>

                {/* Satır 1: Fiş no + durum + tarihler */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {topluWaMod && (
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (waSecili ? "#16a34a" : "#d0d5dd"), background: waSecili ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {waSecili && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                      </div>
                    )}
                    <span style={{ color: "#111", fontWeight: 800, fontSize: 14 }}>#{f.fis_no}</span>
                    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 10, background: isTeslim ? "#eff6ff" : f.durum === "hazir" ? "#f0fdf4" : f.durum === "bekliyor" ? "#fffbeb" : "#fef9c3", color: dc[f.durum] || "#888", fontWeight: 600 }}>
                      {dy[f.durum] || f.durum}
                    </span>
                    {f.odeme_turu && f.odeme_turu !== "teslimde" && (
                      <span style={{ fontSize: 10, color: "#888", padding: "1px 7px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                        {odemeYaz[f.odeme_turu] || f.odeme_turu}
                      </span>
                    )}
                    {isGecikme && <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>⚠️ Gecikti</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {f.durum === "iptal_edildi" ? <span style={{ color: "#6b7280", fontSize: 12, textDecoration: "line-through" }}>İptal</span> : <span style={{ color: "#dc2626", fontWeight: 800, fontSize: 15 }}>{para(f.toplam_tutar)}</span>}
                    {(f.nakit_indirim_yuzde || 0) > 0 && (
                      <div style={{ color: "#16a34a", fontSize: 10 }}>💵 {para(f.indirimli_tutar)}</div>
                    )}
                  </div>
                </div>

                {/* Satır 2: Müşteri + tarih bilgileri */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    <span>👤 <strong>{f.musteriler?.ad_soyad || "-"}</strong></span>
                    {f.musteriler?.telefon && <span style={{ color: "#888", marginLeft: 8 }}>📞 {f.musteriler.telefon}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>
                    <span>📅 {tarih(f.acilis_tarihi)}</span>
                    {f.planlanan_teslim && <span style={{ color: isGecikme ? "#dc2626" : "#d97706", marginLeft: 8 }}>🎯 {tarih(f.planlanan_teslim)}</span>}
                    {f.teslim_tarihi && <span style={{ color: "#2563eb", marginLeft: 8 }}>📦 {tarih(f.teslim_tarihi)}</span>}
                  </div>
                </div>

                {/* Satır 3: Kalan borç + aksiyon butonları */}
                {((f.kalan || 0) > 0 || f.durum === "bekliyor" || f.durum === "hazir") && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
                    <div>
                      {(f.kalan || 0) > 0 && (
                        <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, background: "#fef2f2", padding: "2px 8px", borderRadius: 6, border: "1px solid #fecaca" }}>
                          ⚠️ Kalan: {para(f.kalan)}
                        </span>
                      )}
                      {(f.kalan || 0) <= 0 && isTeslim && (
                        <span style={{ color: "#16a34a", fontSize: 11 }}>✅ Ödendi</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                      {f.durum === "bekliyor" && (
                        <button onClick={e => hazirIsaretle(f.id, e)} style={{ ...kbtn, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: 11 }}>✅ Hazır</button>
                      )}
                      {f.durum === "hazir" && f.musteriler?.telefon && (
                        <a onClick={e => e.stopPropagation()}
                          href={`whatsapp://send?phone=90${waTel(f.musteriler.telefon)}&text=${encodeURIComponent('Sayın ' + f.musteriler.ad_soyad + ', #' + f.fis_no + ' numaralı fişiniz hazır.\n\nDurum: ' + window.location.origin + '/?musteri=' + (f.barkod || f.fis_no))}`}
                          target="_blank" rel="noreferrer"
                          style={{ ...kbtn, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: 11, textDecoration: "none" }}>📱 WA</a>
                      )}
                      <button onClick={e => tekrarBas(f, e)} style={{ ...kbtn, fontSize: 11 }}>🖨️ Bas</button>
                      <button onClick={e => fisSil(f, e)} style={{ ...kbtn, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 11 }}>🗑️</button>
                    </div>
                  </div>
                )}
                {isTeslim && (f.kalan || 0) <= 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 5, marginTop: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={e => tekrarBas(f, e)} style={{ ...kbtn, fontSize: 11 }}>🖨️ Tekrar Bas</button>
                    <button onClick={e => fisSil(f, e)} style={{ ...kbtn, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 11 }}>🗑️</button>
                  </div>
                )}
              </div>
            );
          })}
          {!yukleniyor && !filtreli.length && (
            <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div>Bu kategoride fiş yok.</div>
            </div>
          )}
        </div>
      </div>

      {/* Fiş detay modal */}
      {secili && (
        <FisDetayModal fis={secili} kalemler={kalemler} onKapat={() => { setSecili(null); yukle(); }} kullanici={kullanici} hesaplar={[]} />
      )}
    </div>
  );
}

// Fiş detay + işlem modal
function FisDetayModal({ fis, kalemler, onKapat, kullanici }) {
  const [hesaplar, setHesaplar] = useState([]);
  const [odemeAcik, setOdemeAcik] = useState(false);
  const [odeme, setOdeme] = useState("nakit");
  const [hesapId, setHesapId] = useState("");
  const [odemeMiktar, setOdemeMiktar] = useState(fis.kalan || 0);
  const [seciliKalemler, setSeciliKalemler] = useState([]);
  const [teslimAcik, setTeslimAcik] = useState(false);
  const [fisState, setFisState] = useState(fis);
  const [kalemState, setKalemState] = useState(kalemler);

  useEffect(() => {
    supabase.from("hesap_adlari").select("*").eq("aktif", true).then(({ data }) => setHesaplar(data || []));
    supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id).then(({ data }) => setKalemState(data || []));
    // Ödeme geçmişi
    supabase.from("kt_odeme_gecmisi").select("*").eq("fis_id", fis.id).order("tarih").then(({ data }) => setOdemeGecmisi(data || [])).catch(() => {});
  }, []);

  const hazirIsaretle = async (kalemId) => {
    await supabase.from("kt_fis_kalemleri").update({ durum: "hazir" }).eq("id", kalemId);
    const { data } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
    setKalemState(data || []);
    // Tüm kalemler hazır mı?
    const hepsiHazir = (data || []).every(k => k.durum === "hazir" || k.durum === "teslim_edildi");
    if (hepsiHazir) {
      await supabase.from("kt_fisler").update({ durum: "hazir" }).eq("id", fis.id);
      setFisState({ ...fisState, durum: "hazir" });
    }
  };

  const odemeKaydet = async () => {
    const om = +odemeMiktar;
    const onay = window.confirm(`Ödeme kaydedilsin mi?\n\nTutar: ${para(om)}\nÖdeme: ${odeme === "nakit" ? "Nakit" : odeme === "kredi_karti" ? "Kredi Kartı" : "Havale"}${nakitFisKesildi ? "\n🧾 Nakit fişi kesildi" : ""}`);
    if (!onay) return;
    const nakit_indirimli = fisState.indirimli_tutar || fisState.toplam_tutar;
    const nakit_indirim_yapildi = (fisState.nakit_indirim_yuzde || 0) > 0 && Math.abs(om - nakit_indirimli) < 1;
    const yeniKalan = nakit_indirim_yapildi ? 0 : Math.max(0, (fisState.kalan || 0) - om);
    const guncelleme = { kalan: yeniKalan, odeme_turu: odeme, hesap_id: hesapId || null };
    if (odeme === "nakit" && nakitFisKesildi) guncelleme.nakit_fis = true;
    await supabase.from("kt_fisler").update(guncelleme).eq("id", fis.id);
    // Ödeme geçmişi kaydet
    try {
      await supabase.from("kt_odeme_gecmisi").insert({
        fis_id: fis.id,
        tutar: om,
        odeme_turu: odeme,
        nakit_fis: odeme === "nakit" && nakitFisKesildi,
        tarih: new Date().toISOString(),
        not: `${odeme === "nakit" ? "Nakit" : odeme === "kredi_karti" ? "Kart" : "Havale"} - ${para(om)}`,
      });
    } catch {} // Tablo yoksa ignore
    setFisState({ ...fisState, kalan: yeniKalan, odeme_turu: odeme });
    setOdemeGecmisi(prev => [...prev, { tutar: om, odeme_turu: odeme, tarih: new Date().toISOString() }]);
    setNakitFisKesildi(false);
    setOdemeAcik(false);
  };

  const [teslimOdemeTur, setTeslimOdemeTur] = useState("teslimde");
  const [teslimOdemeVar, setTeslimOdemeVar] = useState(false);
  const [nakitFisKesildi, setNakitFisKesildi] = useState(false);
  const [odemeGecmisi, setOdemeGecmisi] = useState([]);

  const teslimEt = async () => {
    const bekleyenler = kalemState.filter(x => x.durum !== "teslim_edildi");

    // Tüm ürünler zaten teslim edilmişse - sadece fişi kapat
    if (bekleyenler.length === 0) {
      const onay = window.confirm("Tüm ürünler teslim edildi olarak işaretlenecek. Fişi teslim edildi olarak kapat?");
      if (!onay) return;
      await supabase.from("kt_fisler").update({
        durum: "teslim_edildi",
        teslim_tarihi: new Date().toISOString(),
        kalan: 0,
      }).eq("id", fis.id);
      setFisState({ ...fisState, durum: "teslim_edildi", kalan: 0 });
      setTeslimAcik(false);
      return;
    }

    if (!seciliKalemler.length) return toast("En az bir ürün seçin!", "uyari");
    const onay = window.confirm(`Teslim onaylansın mı?\n\n${seciliKalemler.length} ürün teslim edilecek.\nDevam?`);
    if (!onay) return;
    await supabase.from("kt_fis_kalemleri").update({ durum: "teslim_edildi" }).in("id", seciliKalemler);
    const { data: k } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
    setKalemState(k || []);
    const hepsiTeslim = (k || []).every(x => x.durum === "teslim_edildi");
    let yeniKalan = fisState.kalan;
    let yeniOdemeTur = fisState.odeme_turu;
    if (teslimOdemeVar) {
      if (teslimOdemeTur === "nakit" && (fisState.nakit_indirim_yuzde||0) > 0) {
        yeniKalan = 0;
        yeniOdemeTur = "nakit";
      } else if (teslimOdemeTur !== "teslimde") {
        yeniKalan = 0;
        yeniOdemeTur = teslimOdemeTur;
      }
    }
    await supabase.from("kt_fisler").update({
      durum: hepsiTeslim ? "teslim_edildi" : "kismi_teslim",
      teslim_tarihi: hepsiTeslim ? new Date().toISOString() : null,
      kalan: yeniKalan,
      odeme_turu: yeniOdemeTur,
    }).eq("id", fis.id);
    setFisState({ ...fisState, durum: hepsiTeslim ? "teslim_edildi" : "kismi_teslim", kalan: yeniKalan, odeme_turu: yeniOdemeTur });
    setTeslimAcik(false);
    setSeciliKalemler([]);
    setTeslimOdemeVar(false);
  };

  const fisIptalEt = async () => {
    if (!window.confirm(`#${fisState.fis_no} fişini İPTAL etmek istediğinizden emin misiniz?\n\nFiş müşteri geçmişinde "İptal Edildi" olarak görünecek.\nTüm tutarlar ve ürün verileri sıfırlanacak.`)) return;
    // Tüm kalemleri sil
    await supabase.from("kt_fis_kalemleri").delete().eq("fis_id", fis.id);
    // Fişi iptal durumuna çek - tutarları sıfırla
    await supabase.from("kt_fisler").update({
      durum: "iptal_edildi",
      toplam_tutar: 0,
      indirimli_tutar: 0,
      kalan: 0,
      nakit_indirim_yuzde: 0,
      teslim_tarihi: null,
    }).eq("id", fis.id);
    toast("Fiş #" + fisState.fis_no + " iptal edildi.", "basari");
    onKapat();
  };

  const fisSilModal = async () => {
    const secim = window.confirm(`#${fisState.fis_no} fişi için:\n\nTAMAMEN SİL → Tamam\nİPTAL ET → İptal\n\nTamamen silmek veritabanından kaldırır.\nİptal etmek müşteri geçmişinde "İptal Edildi" bırakır.`);
    if (secim) {
      // Tamamen sil
      await supabase.from("kt_fis_kalemleri").delete().eq("fis_id", fis.id);
      await supabase.from("kt_fisler").delete().eq("id", fis.id);
      onKapat();
    }
  };

  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, width: 560, maxHeight: "90vh", overflow: "auto" }}>
        {/* Başlık */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h3 style={{ color: "#111", margin: 0 }}>Fiş #{fisState.fis_no}</h3>
            <div style={{ color: "#555", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>Barkod: {fisState.barkod}</span>
              <span style={{ padding: "2px 10px", borderRadius: 10, background: dc[fisState.durum] || "#888", color: "#fff", fontSize: 11, fontWeight: 600 }}>{dy[fisState.durum] || fisState.durum}</span>
              {fisState.teslim_tarihi && <span style={{ color: "#2563eb", fontSize: 11 }}>📦 {tarih(fisState.teslim_tarihi)} teslim</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={fisIptalEt} style={{ ...kbtn, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", fontSize: 12 }}>🚫 İptal</button>
            <button onClick={fisSilModal} style={{ ...kbtn, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 12 }}>🗑️ Sil</button>
            <button onClick={onKapat} style={kbtn}>✕ Kapat</button>
          </div>
        </div>

        {/* Müşteri bilgisi */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ color: "#111", fontWeight: 600 }}>👤 {fisState.musteriler?.ad_soyad || "-"}</div>
          <div style={{ color: "#666", fontSize: 12 }}>📞 {fisState.musteriler?.telefon || "-"}</div>
          <div style={{ color: "#888", fontSize: 12 }}>📅 Açılış: {tarih(fisState.acilis_tarihi)} {fisState.planlanan_teslim && `| 🎯 Teslim: ${tarih(fisState.planlanan_teslim)}`}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {fisState.musteriler?.telefon && (
              <a href={`whatsapp://send?phone=90${waTel(fisState.musteriler.telefon)}&text=${encodeURIComponent('Sayın ' + (fisState.musteriler.ad_soyad || '') + ', #' + fisState.fis_no + ' numaralı kuru temizleme fişiniz hazırdır, teslim alabilirsiniz. İyi günler dileriz.\n\nSipariş durumunuz: ' + window.location.origin + '/?musteri=' + (fisState.barkod || fisState.fis_no))}`}
                target="_blank" rel="noreferrer"
                style={{ ...kbtn, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", textDecoration: "none", fontSize: 11, padding: "5px 11px" }}>
                📱 WhatsApp Gönder
              </a>
            )}
            <button onClick={() => {
              const pw = window.open("about:blank","_blank","width=400,height=700,scrollbars=yes");
              if (!pw) { toast("Popup engellendi!", "uyari"); return; }
              pw.document.write("<html><body style='font-family:sans-serif;padding:20px;text-align:center;'><p>⏳ Yükleniyor...</p></body></html>");
              const ayarlar = {};
              supabase.from("kt_ayarlar").select("*").then(({data}) => {
                (data||[]).forEach(x=>{ayarlar[x.anahtar]=x.deger;});
                fisCiktisi(fisState, kalemState, fisState.musteriler, fisState.toplam_tutar, fisState.indirimli_tutar, fisState.odeme_turu, fisState.nakit_indirim_yuzde, ayarlar, pw);
              }).catch(err => { try { pw.document.write("<html><body style='color:red;padding:20px;'>❌ " + err?.message + "</body></html>"); } catch {} });
            }} style={{ ...kbtn, fontSize: 11, padding: "5px 11px" }}>🖨️ Fiş Bas</button>
            {kalemState.length > 0 && (
              <button onClick={() => {
                kalemState.forEach(k => barkodEtiketYazdir(k.barkod, fisState.fis_no, fisState.musteriler?.ad_soyad, k.urun_adi));
              }} style={{ ...kbtn, fontSize: 11, padding: "5px 11px" }}>🏷️ Barkod Etiket</button>
            )}
          </div>
        </div>

        {/* Ürünler */}
        <h4 style={{ color: "#444", fontSize: 13, marginBottom: 8 }}>Ürünler:</h4>
        {kalemState.map(k => {
          let hz = []; try { hz = JSON.parse(k.hizmet_bilgi || "[]"); } catch {}
          return (
            <div key={k.id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#111", fontSize: 13, fontWeight: 600 }}>{k.urun_adi} {k.renk ? `(${k.renk})` : ""} x{k.toplam_adet}</div>
                <div style={{ color: "#888", fontSize: 11 }}>🔖 {k.barkod}</div>
                {hz.map(h => <div key={h.hizmet_k} style={{ color: "#555", fontSize: 12 }}>&nbsp;• {h.hizmet_adi}: {para(h.fiyat)}</div>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f3f4f6", color: dc[k.durum] || "#888", marginBottom: 4 }}>{dy[k.durum] || k.durum}</span>
                {k.durum === "bekliyor" && (
                  <button onClick={() => hazirIsaretle(k.id)} style={{ ...kbtn, fontSize: 10, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>✅ Hazır</button>
                )}
              </div>
            </div>
          );
        })}

        {/* Finansal özet - detaylı */}
        <div style={{ marginTop: 14, padding: 14, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          {(fisState.nakit_indirim_yuzde || 0) > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#555", fontSize: 12 }}>Tutar</span>
                <span style={{ fontSize: 12 }}>{para(fisState.toplam_tutar)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#16a34a", fontSize: 12 }}>💵 Nakite Özel (%{fisState.nakit_indirim_yuzde} indirim)</span>
                <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>{para(fisState.indirimli_tutar)}</span>
              </div>
              <div style={{ borderTop: "1px dashed #e5e7eb", margin: "6px 0" }} />
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#555", fontWeight: 600, fontSize: 13 }}>Net Toplam</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{para(fisState.toplam_tutar)}</span>
          </div>
          {/* Ödeme durumu detayı */}
          {fisState.kalan <= 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "6px 10px", background: "#f0fdf4", borderRadius: 7, border: "1px solid #bbf7d0" }}>
              <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
                ✅ Ödendi —
                {fisState.odeme_turu === "nakit" && (fisState.nakit_indirim_yuzde || 0) > 0
                  ? ` Nakit ${para(fisState.indirimli_tutar)} (${para((fisState.toplam_tutar||0)-(fisState.indirimli_tutar||0))} indirim yapıldı)`
                  : fisState.odeme_turu === "nakit" ? ` Nakit ${para(fisState.toplam_tutar)}`
                  : fisState.odeme_turu === "kredi_karti" ? ` Kart ${para(fisState.toplam_tutar)}`
                  : fisState.odeme_turu === "havale" ? ` Havale ${para(fisState.toplam_tutar)}`
                  : ` ${para(fisState.toplam_tutar)}`}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "6px 10px", background: "#fef2f2", borderRadius: 7, border: "1px solid #fecaca" }}>
              <span style={{ color: "#dc2626", fontSize: 13 }}>⚠️ Kalan Borç</span>
              <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 14 }}>{para(fisState.kalan)}</span>
            </div>
          )}
        </div>

        {/* Ödeme geçmişi */}
        {odemeGecmisi.length > 0 && (
          <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#374141", fontWeight: 600, fontSize: 12, marginBottom: 8 }}>📜 Ödeme Geçmişi</div>
            {odemeGecmisi.map((og, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", padding: "4px 0", borderBottom: i < odemeGecmisi.length-1 ? "1px solid #f1f5f9" : "none" }}>
                <span>
                  {og.odeme_turu === "nakit" ? "💵" : og.odeme_turu === "kredi_karti" ? "💳" : "🏦"} {og.odeme_turu === "nakit" ? "Nakit" : og.odeme_turu === "kredi_karti" ? "Kart" : "Havale"}
                  {og.nakit_fis && " 🧾"}
                </span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>{para(og.tutar)}</span>
                <span style={{ color: "#aaa" }}>{og.tarih ? new Date(og.tarih).toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-"}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginTop: 6, paddingTop: 6, borderTop: "1px solid #e2e8f0" }}>
              <span style={{ color: "#374141" }}>Toplam Ödenen</span>
              <span style={{ color: "#16a34a" }}>{para(odemeGecmisi.reduce((t,o) => t + (o.tutar||0), 0))}</span>
            </div>
          </div>
        )}

        {/* Ödeme alma - nakit indirim kutucuğu ile */}
        {fisState.kalan > 0 && !odemeAcik && fisState.durum !== "iptal_edildi" && fisState.durum !== "teslim_edildi" && (
          <button onClick={() => setOdemeAcik(true)} style={{ ...abtn, width: "100%", marginTop: 12 }}>💰 Ödeme Al</button>
        )}
        {odemeAcik && (
          <div style={{ marginTop: 12, ...krt }}>
            <h4 style={{ color: "#111", marginTop: 0 }}>💰 Ödeme Al</h4>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {["nakit", "kredi_karti", "havale"].map(o => (
                <button key={o} onClick={() => setOdeme(o)} style={{ padding: "6px 12px", borderRadius: 16, border: "2px solid " + (odeme === o ? "#e94560" : "#e5e7eb"), background: odeme === o ? "#fef2f2" : "#fff", color: odeme === o ? "#e94560" : "#555", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  {o === "nakit" ? "💵 Nakit" : o === "kredi_karti" ? "💳 Kredi Kartı" : "🏦 Havale"}
                </button>
              ))}
            </div>

            {/* Nakit: hızlı tutar seç */}
            {odeme === "nakit" && (fisState.nakit_indirim_yuzde || 0) > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setOdemeMiktar(fisState.indirimli_tutar)}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "2px solid " + (+odemeMiktar === fisState.indirimli_tutar ? "#86efac" : "#e5e7eb"), background: +odemeMiktar === fisState.indirimli_tutar ? "#f0fdf4" : "#fff", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ color: "#15803d", fontWeight: 700, fontSize: 13 }}>{para(fisState.indirimli_tutar)}</div>
                  <div style={{ color: "#16a34a", fontSize: 10 }}>💵 Nakite Özel</div>
                </button>
                <button onClick={() => setOdemeMiktar(fisState.toplam_tutar)}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "2px solid " + (+odemeMiktar === fisState.toplam_tutar ? "#cbd5e1" : "#e5e7eb"), background: +odemeMiktar === fisState.toplam_tutar ? "#f1f5f9" : "#fff", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>{para(fisState.toplam_tutar)}</div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>Net Toplam</div>
                </button>
              </div>
            )}

            {/* Kart/Havale: sadece net toplam göster */}
            {odeme !== "nakit" && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, marginBottom: 10, border: "1px solid #e2e8f0" }}>
                <span style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>NET TOPLAM</span>
                <span style={{ color: "#0f172a", fontWeight: 800, fontSize: 15 }}>{para(fisState.toplam_tutar)}</span>
              </div>
            )}

            {(odeme === "kredi_karti" || odeme === "havale") && (
              <select value={hesapId} onChange={e => setHesapId(e.target.value)} style={{ ...inp, marginBottom: 8, color: "#222" }}>
                <option value="">Hesap seçin...</option>
                {hesaplar.filter(h => h.hesap_turu === (odeme === "kredi_karti" ? "kredi_karti" : "havale")).map(h => <option key={h.id} value={h.id}>{h.hesap_adi}</option>)}
              </select>
            )}
            <div style={{ marginBottom: 10 }}><label style={lbl}>Tutar</label><input type="number" value={odemeMiktar} onChange={e => setOdemeMiktar(e.target.value)} style={{ ...inp, color: "#222" }} /></div>

            {/* NAKİT FİŞİ KESİLDİ */}
            {odeme === "nakit" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 12, borderRadius: 8, cursor: "pointer",
                background: nakitFisKesildi ? "#fffbeb" : "#f9fafb", border: "1px solid " + (nakitFisKesildi ? "#fde68a" : "#e5e7eb") }}
                onClick={() => setNakitFisKesildi(!nakitFisKesildi)}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (nakitFisKesildi ? "#d97706" : "#d0d5dd"), background: nakitFisKesildi ? "#d97706" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {nakitFisKesildi && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </div>
                <div>
                  <div style={{ color: "#92400e", fontWeight: 600, fontSize: 12 }}>🧾 Nakit Fişi Kesildi</div>
                  <div style={{ color: "#a16207", fontSize: 10 }}>KDV hesaplaması için işaretleyin</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={odemeKaydet} style={abtn}>💾 Kaydet</button>
              <button onClick={() => { setOdemeAcik(false); setNakitFisKesildi(false); }} style={kbtn}>İptal</button>
            </div>
          </div>
        )}

        {/* Teslim et */}
        {fisState.durum !== "teslim_edildi" && !teslimAcik && (() => {
          const bekleyenSayisi = kalemState.filter(k => k.durum !== "teslim_edildi").length;
          return bekleyenSayisi === 0 ? (
            <button onClick={() => teslimEt()} style={{ ...abtn, width: "100%", marginTop: 8, background: "#2563eb" }}>
              ✅ Tüm Ürünler Teslim - Fişi Kapat
            </button>
          ) : (
            <button onClick={() => setTeslimAcik(true)} style={{ ...kbtn, width: "100%", marginTop: 8, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              📦 Teslim Et ({bekleyenSayisi} ürün)
            </button>
          );
        })()}
        {teslimAcik && (
          <div style={{ marginTop: 12, ...krt }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h4 style={{ color: "#111", margin: 0 }}>Teslim Edilecek Ürünler</h4>
              {kalemState.filter(k => k.durum !== "teslim_edildi").length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "4px 10px", borderRadius: 8, background: seciliKalemler.length === kalemState.filter(k => k.durum !== "teslim_edildi").length ? "#f0fdf4" : "#f9fafb", border: "1px solid #e5e7eb" }}
                  onClick={() => {
                    const bekleyenler = kalemState.filter(k => k.durum !== "teslim_edildi").map(k => k.id);
                    setSeciliKalemler(seciliKalemler.length === bekleyenler.length ? [] : bekleyenler);
                  }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, border: "2px solid", borderColor: seciliKalemler.length === kalemState.filter(k => k.durum !== "teslim_edildi").length ? "#16a34a" : "#d0d5dd", background: seciliKalemler.length === kalemState.filter(k => k.durum !== "teslim_edildi").length ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {seciliKalemler.length === kalemState.filter(k => k.durum !== "teslim_edildi").length && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                  </div>
                  <span style={{ color: "#555", fontSize: 12 }}>Tümünü Seç</span>
                </div>
              )}
            </div>
            {kalemState.filter(k => k.durum !== "teslim_edildi").length === 0
              ? <p style={{ color: "#888", fontSize: 13 }}>Tüm ürünler zaten teslim edildi.</p>
              : kalemState.filter(k => k.durum !== "teslim_edildi").map(k => (
              <div key={k.id} onClick={() => setSeciliKalemler(seciliKalemler.includes(k.id) ? seciliKalemler.filter(x => x !== k.id) : [...seciliKalemler, k.id])}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: seciliKalemler.includes(k.id) ? "#f0fdf4" : "#f9fafb", border: "1px solid " + (seciliKalemler.includes(k.id) ? "#86efac" : "#e5e7eb") }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid #d0d5dd", background: seciliKalemler.includes(k.id) ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {seciliKalemler.includes(k.id) && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </div>
                <div>
                  <div style={{ color: "#111", fontSize: 12, fontWeight: 600 }}>{k.urun_adi} {k.renk ? `(${k.renk})` : ""}</div>
                  <div style={{ color: "#888", fontSize: 10 }}>🔖 {k.barkod}</div>
                </div>
              </div>
            ))}

            {/* Teslimde ödeme seçeneği */}
            {fisState.kalan > 0 && (
              <div style={{ marginTop: 10, padding: 10, background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                  onClick={() => setTeslimOdemeVar(!teslimOdemeVar)}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid", borderColor: teslimOdemeVar ? "#e94560" : "#d0d5dd", background: teslimOdemeVar ? "#e94560" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {teslimOdemeVar && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                  </div>
                  <span style={{ color: "#92400e", fontSize: 12, fontWeight: 600 }}>Teslimde Ödeme Al ({para(fisState.kalan)})</span>
                </div>
                {teslimOdemeVar && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { v: "nakit", l: (fisState.nakit_indirim_yuzde||0) > 0 ? `💵 Nakit (${para(fisState.indirimli_tutar)})` : "💵 Nakit" },
                      { v: "kredi_karti", l: "💳 Kart" },
                      { v: "havale", l: "🏦 Havale" },
                    ].map(o => (
                      <button key={o.v} onClick={() => setTeslimOdemeTur(o.v)}
                        style={{ padding: "5px 10px", borderRadius: 12, border: "2px solid " + (teslimOdemeTur === o.v ? "#e94560" : "#e5e7eb"), background: teslimOdemeTur === o.v ? "#fef2f2" : "#fff", color: teslimOdemeTur === o.v ? "#e94560" : "#555", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={teslimEt} style={abtn}>✅ Teslimi Onayla</button>
              <button onClick={() => setTeslimAcik(false)} style={kbtn}>İptal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== TESLİM =====
export function KTTeslim({ kullanici }) {
  const [fisNo, setFisNo] = useState("");
  const [fis, setFis] = useState(null);
  const [kalemler, setKalemler] = useState([]);
  const [secili, setSecili] = useState([]);
  const [odeme, setOdeme] = useState("nakit");
  const [hesapId, setHesapId] = useState("");
  const [hesaplar, setHesaplar] = useState([]);
  const [odemeTutar, setOdemeTutar] = useState("");
  const [nakitFisKesildi, setNakitFisKesildi] = useState(false);

  useEffect(() => { supabase.from("hesap_adlari").select("*").eq("aktif", true).then(({ data }) => setHesaplar(data || [])); }, []);

  // Açık fişi anlık güncelle
  useRealtimeYenile(["kt_fisler", "kt_fis_kalemleri"], () => {
    if (fis?.id) {
      supabase.from("kt_fisler").select("*,musteriler(*)").eq("id", fis.id).single().then(({data}) => { if(data) setFis(data); });
      supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id).then(({data}) => setKalemler(data||[]));
    }
  }, [fis?.id]);

  const fisBul = async () => {
    if (!fisNo.trim()) return toast("Fiş no veya barkod girin!", "uyari");
    const { data: f } = await supabase.from("kt_fisler")
      .select("*, musteriler(*)")
      .or(`fis_no.eq.${fisNo.trim()},barkod.eq.${fisNo.trim()}`)
      .single();
    if (!f) return toast("Fiş bulunamadı!", "uyari");
    setFis(f);
    // Tüm kalemleri getir (teslim edilenler de dahil - durum görünsün)
    const { data: k } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", f.id);
    setKalemler(k || []);
    // Kalan borç varsayılan tutar olarak ayarla
    const kalan = f.kalan || 0;
    const indirimli = f.indirimli_tutar || f.toplam_tutar || 0;
    // Nakit indirimi varsa indirimli fiyatı öner, yoksa kalan borcu
    setOdemeTutar(kalan > 0 ? (f.nakit_indirim_yuzde > 0 ? indirimli : kalan) : 0);
    setSecili([]);
    setOdeme(f.odeme_turu === "teslimde" ? "nakit" : (f.odeme_turu || "nakit"));
  };

  const teslimEt = async () => {
    const bekleyenler = kalemler.filter(k => k.durum !== "teslim_edildi");
    const om = +odemeTutar;

    // Teslim edilecek ürün var ama seçilmemişse uyar
    if (bekleyenler.length > 0 && !secili.length) {
      return toast("Teslim edilecek ürünleri seçin!", "uyari");
    }

    const nakit_indirimli = fis.indirimli_tutar || fis.toplam_tutar;
    const nakit_indirim_yapildi = (fis.nakit_indirim_yuzde || 0) > 0 && Math.abs(om - nakit_indirimli) < 1;
    const yeniKalan = om === 0 ? (fis.kalan || 0) : (nakit_indirim_yapildi ? 0 : Math.max(0, (fis.kalan || 0) - om));

    let onayMetin = `Teslimi onaylıyor musunuz?\n`;
    if (secili.length) onayMetin += `• ${secili.length} ürün teslim edilecek\n`;
    if (om > 0) onayMetin += `• Tahsil Edilecek: ${para(om)}\n`;
    if (nakit_indirim_yapildi) onayMetin += `• 💝 ${para((fis.toplam_tutar||0)-nakit_indirimli)} nakit indirimi uygulandı!\n`;

    if (!window.confirm(onayMetin + "\nDevam?")) return;

    // Seçili kalemleri teslim edildi yap
    if (secili.length) {
      await supabase.from("kt_fis_kalemleri").update({ durum: "teslim_edildi" }).in("id", secili);
    }

    // Tüm kalemleri kontrol et
    const { data: tumK } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
    const tumTeslim = (tumK || []).every(x => x.durum === "teslim_edildi");

    // Fişi güncelle
    const guncelleme = {
      kalan: yeniKalan,
      odeme_turu: odeme,
    };
    if (tumTeslim) {
      guncelleme.durum = "teslim_edildi";
      guncelleme.teslim_tarihi = new Date().toISOString();
    } else if (secili.length) {
      guncelleme.durum = "kismi_teslim";
    }
    if (hesapId) guncelleme.hesap_id = hesapId;
    if (odeme === "nakit" && nakitFisKesildi) guncelleme.nakit_fis = true;

    await supabase.from("kt_fisler").update(guncelleme).eq("id", fis.id);

    toast("Teslim ve ödeme kaydedildi!", "basari");
    setFis(null); setFisNo(""); setKalemler([]); setSecili([]); setNakitFisKesildi(false);
  };

  const [teslimBarkodAcik, setTeslimBarkodAcik] = useState(false);

  return (
    <div>
      <h2 style={{ color: "#111", marginTop: 0 }}>📦 Teslim Al / Teslim Ver</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input value={fisNo} onChange={e => setFisNo(e.target.value)} onKeyDown={e => e.key === "Enter" && fisBul()} placeholder="Fiş numarası veya barkod..." style={{ ...inp, flex: 1 }} />
        <button onClick={() => setTeslimBarkodAcik(true)} style={{ ...kbtn, background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", fontSize:18, padding:"6px 10px" }} title="Barkod Tara">📷</button>
        <TelefonBarkodButon kaynak="teslim" onBarkod={(b) => { setFisNo(b); setTimeout(fisBul, 300); }} />
        <button onClick={fisBul} style={abtn}>🔍 Bul</button>
      </div>
      {teslimBarkodAcik && <BarcodeScanner baslik="Fiş Barkodu Tara" onKapat={() => setTeslimBarkodAcik(false)} onSonuc={(barkod) => { setTeslimBarkodAcik(false); setFisNo(barkod); setTimeout(fisBul, 300); }} />}
      {fis && (
        <div>
          {/* Fiş başlık */}
          <div style={{ ...krt, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#111", fontWeight: 700, fontSize: 15 }}>#{fis.fis_no}
                  <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 10,
                    background: fis.durum === "hazir" ? "#f0fdf4" : fis.durum === "teslim_edildi" ? "#eff6ff" : "#fffbeb",
                    color: fis.durum === "hazir" ? "#16a34a" : fis.durum === "teslim_edildi" ? "#2563eb" : "#d97706" }}>
                    {fis.durum === "hazir" ? "✅ Hazır" : fis.durum === "teslim_edildi" ? "📦 Teslim Edildi" : "⏳ Bekliyor"}
                  </span>
                </div>
                <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>👤 {fis.musteriler?.ad_soyad} | 📞 {fis.musteriler?.telefon}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#111", fontWeight: 700, fontSize: 16 }}>{para(fis.toplam_tutar)}</div>
                {(fis.nakit_indirim_yuzde || 0) > 0 && <div style={{ color: "#16a34a", fontSize: 12 }}>💵 Nakit: {para(fis.indirimli_tutar)}</div>}
                {(fis.kalan || 0) > 0 && <div style={{ color: "#dc2626", fontSize: 13, fontWeight: 700 }}>⚠️ Kalan: {para(fis.kalan)}</div>}
                {(fis.kalan || 0) <= 0 && fis.durum === "teslim_edildi" && <div style={{ color: "#16a34a", fontSize: 12 }}>✅ Ödendi</div>}
              </div>
            </div>
            {fis.musteriler?.telefon && (
              <a href={`whatsapp://send?phone=90${waTel(fis.musteriler.telefon)}&text=${encodeURIComponent('Sayın ' + fis.musteriler.ad_soyad + ', #' + fis.fis_no + ' numaralı kuru temizleme fişiniz hazırdır, teslim alabilirsiniz.\n\nSipariş durumunuz: ' + window.location.origin + '/?musteri=' + (fis.barkod || fis.fis_no))}`}
                target="_blank" rel="noreferrer" style={{ ...kbtn, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", textDecoration: "none", fontSize: 12, display: "inline-block", marginTop: 8 }}>
                📱 WhatsApp Gönder
              </a>
            )}
          </div>

          {/* Ürün listesi */}
          <div style={{ marginBottom: 16 }}>
            {kalemler.filter(k => k.durum !== "teslim_edildi").length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 14px", borderRadius: 10, marginBottom: 8,
                background: secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length ? "#f0fdf4" : "#f9fafb",
                border: "1px solid " + (secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length ? "#86efac" : "#e5e7eb") }}
                onClick={() => {
                  const bekleyenler = kalemler.filter(k => k.durum !== "teslim_edildi").map(k => k.id);
                  setSecili(secili.length === bekleyenler.length ? [] : bekleyenler);
                }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid", borderColor: secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length ? "#16a34a" : "#d0d5dd", background: secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                </div>
                <span style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>
                  {secili.length === kalemler.filter(k => k.durum !== "teslim_edildi").length ? "Tümü Seçildi ✓" : "Tümünü Seç"}
                  <span style={{ color: "#888", fontWeight: 400, marginLeft: 6 }}>({kalemler.filter(k => k.durum !== "teslim_edildi").length} ürün)</span>
                </span>
              </div>
            )}
            {kalemler.map(k => {
              let hz = []; try { hz = JSON.parse(k.hizmet_bilgi || "[]"); } catch {}
              const teslimEdildi = k.durum === "teslim_edildi";
              const sec = secili.includes(k.id);
              return (
                <div key={k.id}
                  onClick={() => !teslimEdildi && setSecili(sec ? secili.filter(x => x !== k.id) : [...secili, k.id])}
                  style={{ display: "flex", alignItems: "center", gap: 12,
                    background: teslimEdildi ? "#f1f5f9" : sec ? "#f0fdf4" : "#fff",
                    border: "1px solid " + (teslimEdildi ? "#e2e8f0" : sec ? "#86efac" : "#e5e7eb"),
                    borderRadius: 10, padding: "12px 16px", marginBottom: 8,
                    cursor: teslimEdildi ? "default" : "pointer",
                    opacity: teslimEdildi ? 0.7 : 1 }}>
                  {!teslimEdildi && (
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid #d0d5dd", background: sec ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sec && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                    </div>
                  )}
                  {teslimEdildi && <span style={{ fontSize: 16 }}>📦</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: teslimEdildi ? "#888" : "#111", fontSize: 13, textDecoration: teslimEdildi ? "line-through" : "none" }}>{k.urun_adi} {k.renk ? `(${k.renk})` : ""} x{k.toplam_adet}</div>
                    <div style={{ color: "#888", fontSize: 11 }}>🔖 {k.barkod} | {hz.map(h => h.hizmet_adi).join(", ")}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8,
                    background: teslimEdildi ? "#eff6ff" : k.durum === "hazir" ? "#f0fdf4" : "#fef9c3",
                    color: teslimEdildi ? "#2563eb" : k.durum === "hazir" ? "#16a34a" : "#ca8a04" }}>
                    {teslimEdildi ? "Teslim Edildi" : k.durum === "hazir" ? "Hazır" : "Bekliyor"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ödeme paneli - kalan borç varsa veya teslim edilecek ürün varsa göster */}
          {((fis.kalan || 0) > 0 || kalemler.some(k => k.durum !== "teslim_edildi")) && (
            <div style={{ ...krt }}>
              <h3 style={{ color: "#111", marginTop: 0, marginBottom: 14 }}>
                {kalemler.some(k => k.durum !== "teslim_edildi") ? "📦 Teslim Et & Ödeme Al" : "💰 Ödeme Al"}
              </h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {["nakit", "kredi_karti", "havale"].map(o => (
                  <button key={o} onClick={() => setOdeme(o)} style={{ padding: "7px 14px", borderRadius: 20, border: "2px solid " + (odeme === o ? "#e94560" : "#e5e7eb"), background: odeme === o ? "#fef2f2" : "#fff", color: odeme === o ? "#e94560" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {o === "nakit" ? "💵 Nakit" : o === "kredi_karti" ? "💳 Kredi Kartı" : "🏦 Havale"}
                  </button>
                ))}
              </div>
              {(odeme === "kredi_karti" || odeme === "havale") && (
                <select value={hesapId} onChange={e => setHesapId(e.target.value)} style={{ ...inp, marginBottom: 10, color: "#222" }}>
                  <option value="">Hesap seçin...</option>
                  {hesaplar.filter(h => h.hesap_turu === (odeme === "kredi_karti" ? "kredi_karti" : "havale")).map(h => <option key={h.id} value={h.id}>{h.hesap_adi}</option>)}
                </select>
              )}

              {/* NAKİT: Hızlı tutar seç + nakit fiş kutucuğu */}
              {odeme === "nakit" && (fis.nakit_indirim_yuzde || 0) > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <label style={lbl}>Hızlı Tutar Seç</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setOdemeTutar(fis.indirimli_tutar)}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: "2px solid " + (+odemeTutar === fis.indirimli_tutar ? "#86efac" : "#e5e7eb"), background: +odemeTutar === fis.indirimli_tutar ? "#f0fdf4" : "#fff", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ color: "#15803d", fontWeight: 700, fontSize: 14 }}>{para(fis.indirimli_tutar)}</div>
                      <div style={{ color: "#16a34a", fontSize: 10 }}>💵 Nakite Özel</div>
                    </button>
                    <button onClick={() => setOdemeTutar(fis.toplam_tutar)}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: "2px solid " + (+odemeTutar === fis.toplam_tutar ? "#cbd5e1" : "#e5e7eb"), background: +odemeTutar === fis.toplam_tutar ? "#f1f5f9" : "#fff", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 14 }}>{para(fis.toplam_tutar)}</div>
                      <div style={{ color: "#64748b", fontSize: 10 }}>NET TOPLAM</div>
                    </button>
                  </div>
                </div>
              )}

              {/* KART/HAVALE: Sadece net toplam göster */}
              {odeme !== "nakit" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f1f5f9", borderRadius: 9, marginBottom: 10, border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#374151", fontWeight: 600, fontSize: 14 }}>NET TOPLAM</span>
                  <span style={{ color: "#0f172a", fontWeight: 800, fontSize: 16 }}>{para(fis.toplam_tutar)}</span>
                </div>
              )}

              <div><label style={lbl}>Tahsil Edilecek Tutar</label>
                <input type="number" value={odemeTutar} onChange={e => setOdemeTutar(e.target.value)} style={{ ...inp, marginBottom: 10, color: "#222" }} />
              </div>

              {/* NAKİT FİŞİ KESİLDİ */}
              {odeme === "nakit" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 12, borderRadius: 9, cursor: "pointer",
                  background: nakitFisKesildi ? "#fffbeb" : "#f9fafb", border: "1px solid " + (nakitFisKesildi ? "#fde68a" : "#e5e7eb") }}
                  onClick={() => setNakitFisKesildi(!nakitFisKesildi)}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (nakitFisKesildi ? "#d97706" : "#d0d5dd"), background: nakitFisKesildi ? "#d97706" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {nakitFisKesildi && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ color: "#92400e", fontWeight: 600, fontSize: 13 }}>🧾 Nakit Fişi Kesildi</div>
                    <div style={{ color: "#a16207", fontSize: 11 }}>KDV hesaplaması için işaretleyin</div>
                  </div>
                </div>
              )}
              <button onClick={teslimEt} style={{ ...abtn, width: "100%", padding: 13, fontSize: 14 }}>
                ✅ {kalemler.some(k => k.durum !== "teslim_edildi") ? "Teslimi Onayla ve Kaydet" : "Ödemeyi Kaydet"}
              </button>
            </div>
          )}

          {/* Her şey tamam */}
          {(fis.kalan || 0) <= 0 && kalemler.every(k => k.durum === "teslim_edildi") && (
            <div style={{ ...krt, background: "#f0fdf4", border: "2px solid #86efac", textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>Teslim ve ödeme tamamlandı!</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Bu fiş kapatıldı.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== MÜŞTERİLER - Detaylı işlemlerle =====
export function KTMusteriler() {
  const [musteriler, setMusteriler] = useState([]);
  const [ara, setAra] = useState("");
  const [secili, setSecili] = useState(null);
  const [fisler, setFisler] = useState([]);
  const [seciliFis, setSeciliFis] = useState(null);
  const [fisKalemleri, setFisKalemleri] = useState([]);
  const [hesaplar, setHesaplar] = useState([]);
  const [duzenleMod, setDuzenleMod] = useState(false);
  const [duzenleForm, setDuzenleForm] = useState({});
  const [cicekBorc, setCicekBorc] = useState(0);
  const [cicekCiro, setCicekCiro] = useState(0);

  useEffect(() => {
    supabase.from("musteriler").select("*").order("ad_soyad").then(({ data }) => setMusteriler(data || []));
    supabase.from("hesap_adlari").select("*").eq("aktif", true).then(({ data }) => setHesaplar(data || []));
  }, []);

  // Anlık müşteri güncellemesi
  useRealtimeYenile(["musteriler"], () => {
    supabase.from("musteriler").select("*").order("ad_soyad").then(({ data }) => setMusteriler(data || []));
  });

  // Seçili müşteri fişleri anlık
  useRealtimeYenile(["kt_fisler"], () => {
    if (secili?.id) {
      supabase.from("kt_fisler").select("*").eq("musteri_id", secili.id).order("acilis_tarihi",{ascending:false}).then(({data}) => setFisler(data||[]));
    }
  }, [secili?.id]);

  const filtreli = musteriler.filter(m => m.ad_soyad?.toLowerCase().includes(ara.toLowerCase()) || m.telefon?.includes(ara));

  const musteriSec = async (m) => {
    setSecili(m);
    setSeciliFis(null);
    setDuzenleMod(false);
    setCicekBorc(0); setCicekCiro(0);
    const { data } = await supabase.from("kt_fisler").select("*").eq("musteri_id", m.id).order("acilis_tarihi", { ascending: false });
    setFisler(data || []);
    // Çiçekçi bakiyesi
    supabase.from("cicek_cari").select("kalan").eq("musteri_id", m.id).neq("durum", "kapali").then(({ data }) => setCicekBorc((data || []).reduce((t, x) => t + x.kalan, 0)));
    supabase.from("cicek_satislar").select("toplam_tutar").eq("musteri_id", m.id).then(({ data }) => setCicekCiro((data || []).reduce((t, x) => t + x.toplam_tutar, 0)));
  };

  const duzenleBaslat = () => {
    setDuzenleForm({ ad_soyad: secili.ad_soyad || "", telefon: secili.telefon || "", email: secili.email || "", adres: secili.adres || "" });
    setDuzenleMod(true);
  };

  const duzenleKaydet = async () => {
    if (!duzenleForm.ad_soyad) return toast("Ad Soyad zorunlu!", "uyari");
    const { data } = await supabase.from("musteriler").update(duzenleForm).eq("id", secili.id).select().single();
    const guncellenmis = { ...secili, ...duzenleForm };
    setSecili(guncellenmis);
    setMusteriler(musteriler.map(m => m.id === secili.id ? guncellenmis : m));
    setDuzenleMod(false);
  };

  const fisSec = async (f) => {
    setSeciliFis(f);
    const { data } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", f.id);
    setFisKalemleri(data || []);
  };

  const fisDon = () => setSeciliFis(null);

  const toplamBorc = fisler.filter(f => f.durum !== "iptal_edildi").reduce((t, f) => {
    const k = +(f.kalan||0), ind = +(f.indirimli_tutar||0), top = +(f.toplam_tutar||0), y = +(f.nakit_indirim_yuzde||0);
    if (k > 0 && y > 0 && Math.abs(k-ind) < 1) return t + top;
    return t + k;
  }, 0);
  const toplamCiro = fisler.filter(f => f.durum !== "iptal_edildi").reduce((t, f) => {
    // Nakit indirimi uygulandıysa indirimli, yoksa normal tutar
    const odenen = (f.nakit_indirim_yuzde||0) > 0 && f.kalan === 0 ? (f.indirimli_tutar||0) : (f.toplam_tutar||0);
    return t + odenen;
  }, 0);
  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: seciliFis ? "1fr" : "280px 1fr", gap: 20 }}>
      {!seciliFis && (
        <div>
          <input value={ara} onChange={e => setAra(e.target.value)} placeholder="🔍 Ad veya telefon..." style={{ ...inp, marginBottom: 10 }} />
          <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtreli.map(m => (
              <div key={m.id} onClick={() => musteriSec(m)} style={{ background: secili?.id === m.id ? "#fef2f2" : "#fff", border: "1px solid " + (secili?.id === m.id ? "#fca5a5" : "#e5e7eb"), borderRadius: 9, padding: "10px 12px", cursor: "pointer" }}>
                <div style={{ color: "#111", fontWeight: 600, fontSize: 13 }}>{m.ad_soyad}</div>
                <div style={{ color: "#666", fontSize: 12 }}>📞 {m.telefon || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Müşteri detay veya fiş detay */}
      {seciliFis ? (
        <div>
          <button onClick={fisDon} style={{ ...kbtn, marginBottom: 14 }}>← Fişlere Dön</button>
          <FisDetayModal
            fis={seciliFis}
            kalemler={fisKalemleri}
            onKapat={() => { fisDon(); musteriSec(secili); }}
            kullanici={null}
          />
        </div>
      ) : secili ? (
        <div>
          <div style={{ ...krt, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ color: "#111", marginTop: 0, marginBottom: 4 }}>{secili.ad_soyad}</h3>
                <div style={{ color: "#666", fontSize: 13 }}>📞 {secili.telefon || "-"}</div>
                {secili.email && <div style={{ color: "#666", fontSize: 12 }}>✉️ {secili.email}</div>}
                {secili.adres && <div style={{ color: "#666", fontSize: 12 }}>📍 {secili.adres}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <div style={{ textAlign: "center", background: (() => {
                  const s = Math.min(100, fisler.filter(f=>f.durum==="teslim_edildi").length * 10);
                  return s >= 80 ? "#f0fdf4" : s >= 50 ? "#fffbeb" : "#f9fafb";
                })(), borderRadius: 12, padding: "8px 14px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 22 }}>{(() => {
                    const s = fisler.filter(f=>f.durum==="teslim_edildi").length;
                    return s >= 10 ? "⭐⭐⭐" : s >= 5 ? "⭐⭐" : s >= 2 ? "⭐" : "🆕";
                  })()}</div>
                  <div style={{ color: "#888", fontSize: 10, marginTop: 2 }}>
                    {fisler.filter(f=>f.durum==="teslim_edildi").length >= 10 ? "VIP Müşteri" :
                     fisler.filter(f=>f.durum==="teslim_edildi").length >= 5 ? "Sadık Müşteri" :
                     fisler.filter(f=>f.durum==="teslim_edildi").length >= 2 ? "Düzenli" : "Yeni Müşteri"}
                  </div>
                </div>
                <button onClick={duzenleBaslat}
                  style={{ ...kbtn, fontSize: 11, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                  ✏️ Bilgileri Düzenle
                </button>
              </div>
            </div>

            {/* Düzenleme Formu */}
            {duzenleMod && (
              <div style={{ marginTop: 14, padding: 14, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={lbl}>Ad Soyad *</label>
                    <input value={duzenleForm.ad_soyad} onChange={e => setDuzenleForm({...duzenleForm, ad_soyad: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Telefon</label>
                    <input value={duzenleForm.telefon} onChange={e => setDuzenleForm({...duzenleForm, telefon: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>E-posta</label>
                    <input value={duzenleForm.email} onChange={e => setDuzenleForm({...duzenleForm, email: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Adres</label>
                    <input value={duzenleForm.adres} onChange={e => setDuzenleForm({...duzenleForm, adres: e.target.value})} placeholder="Mahalle, Sokak, No..." style={inp} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={duzenleKaydet} style={{ ...abtn, fontSize: 12 }}>💾 Kaydet</button>
                  <button onClick={() => setDuzenleMod(false)} style={{ ...kbtn, fontSize: 12 }}>İptal</button>
                </div>
              </div>
            )}

            {secili.telefon && (
              <a href={`whatsapp://send?phone=90${waTel(secili.telefon)}&text=${encodeURIComponent("Sayın " + secili.ad_soyad + ", mağazamızı tercih ettiğiniz için teşekkür ederiz.")}`}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: 8, background: "#25D366", color: "#fff", padding: "5px 12px", borderRadius: 16, textDecoration: "none", fontWeight: 600, fontSize: 12 }}>
                📱 WhatsApp Gönder
              </a>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
              {[
                { l: "Toplam Fiş", v: fisler.length, c: "#2563eb" },
                { l: "Teslim Edilen", v: fisler.filter(f=>f.durum==="teslim_edildi").length, c: "#16a34a" },
                { l: "Toplam Ciro", v: para(fisler.reduce((t,f)=>t+(f.toplam_tutar||0),0)), c: "#7c3aed" },
                { l: "Açık Borç", v: para(toplamBorc), c: toplamBorc > 0 ? "#dc2626" : "#16a34a" }
              ].map(s => (
                <div key={s.l} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ color: "#888", fontSize: 10 }}>{s.l}</div>
                  <div style={{ color: s.c, fontWeight: 700, fontSize: 14, marginTop: 2 }}>{s.v}</div>
                </div>
              ))}
            </div>
            {fisler.some(f => (f.nakit_indirim_yuzde||0) > 0 && f.kalan === 0) && (
              <div style={{ marginTop: 10, padding: "6px 10px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "#15803d" }}>
                💝 Toplam nakit tasarrufu: {para(fisler.filter(f=>(f.nakit_indirim_yuzde||0)>0 && f.kalan===0).reduce((t,f)=>t+((f.toplam_tutar||0)-(f.indirimli_tutar||0)),0))}
              </div>
            )}

            {/* Birleşik Bakiye - Çiçekçi */}
            {(cicekBorc > 0 || cicekCiro > 0) && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef9f0", borderRadius: 10, border: "1px solid #fde68a" }}>
                <div style={{ color: "#92400e", fontWeight: 600, fontSize: 12, marginBottom: 8 }}>🌹 Çiçekçi Bakiyesi</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ background: "#fff", borderRadius: 7, padding: "6px 12px", flex: 1 }}>
                    <div style={{ color: "#888", fontSize: 10 }}>Toplam Alış</div>
                    <div style={{ color: "#e94560", fontWeight: 700, fontSize: 13 }}>{para(cicekCiro)}</div>
                  </div>
                  {cicekBorc > 0 && <div style={{ background: "#fef2f2", borderRadius: 7, padding: "6px 12px", flex: 1 }}>
                    <div style={{ color: "#888", fontSize: 10 }}>Açık Borç 🌹</div>
                    <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 13 }}>{para(cicekBorc)}</div>
                  </div>}
                  {(toplamBorc > 0 || cicekBorc > 0) && <div style={{ background: "#fef2f2", borderRadius: 7, padding: "6px 12px", flex: 1, border: "1px solid #fecaca" }}>
                    <div style={{ color: "#888", fontSize: 10 }}>💰 Toplam Borç</div>
                    <div style={{ color: "#dc2626", fontWeight: 800, fontSize: 14 }}>{para(toplamBorc + cicekBorc)}</div>
                  </div>}
                </div>
              </div>
            )}
          </div>
          <h4 style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>Fiş Geçmişi ({fisler.length}):</h4>
          {fisler.map(f => {
            const odendi = (f.kalan || 0) <= 0 && f.durum === "teslim_edildi";
            const odemeYapildi = (f.kalan || 0) <= 0 && f.durum !== "teslim_edildi";
            const nakitIndirimi = (f.nakit_indirim_yuzde||0) > 0 ? (f.toplam_tutar||0)-(f.indirimli_tutar||0) : 0;
            const durumRenk = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04" };
            const durumBg = { bekliyor: "#fffbeb", hazir: "#f0fdf4", teslim_edildi: "#eff6ff", kismi_teslim: "#fefce8" };
            const durumYazi = { bekliyor: "⏳ Bekliyor", hazir: "✅ Hazır", teslim_edildi: "📦 Teslim Edildi", kismi_teslim: "🔄 Kısmi" };
            const odemeYazi = { nakit: "💵 Nakit", kredi_karti: "💳 Kart", havale: "🏦 Havale", teslimde: "⏳ Teslimde" };
            return (
              <div key={f.id} onClick={() => fisSec(f)}
                style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid " + (f.kalan > 0 ? "#fecaca" : "#e5e7eb"), cursor: "pointer", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "none"; }}>
                {/* Üst satır: fiş no + durum */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#111", fontSize: 14, fontWeight: 700 }}>#{f.fis_no}</span>
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: durumBg[f.durum] || "#f3f4f6", color: durumRenk[f.durum] || "#888", fontWeight: 600 }}>
                      {durumYazi[f.durum] || f.durum}
                    </span>
                    {f.odeme_turu && f.odeme_turu !== "teslimde" && (
                      <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: "#f3f4f6", color: "#555" }}>
                        {odemeYazi[f.odeme_turu] || f.odeme_turu}
                      </span>
                    )}
                  </div>
                  <span style={{ color: "#888", fontSize: 11 }}>{tarih(f.acilis_tarihi)}</span>
                </div>
                {/* Alt satır: tutar bilgileri */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 12 }}>
                    {nakitIndirimi > 0 && (
                      <div style={{ color: "#16a34a", marginBottom: 2 }}>
                        💵 Nakite Özel: {para(f.indirimli_tutar)} <span style={{ color: "#aaa", fontSize: 10 }}>(-{para(nakitIndirimi)})</span>
                      </div>
                    )}
                    {f.teslim_tarihi && (
                      <div style={{ color: "#94a3b8", fontSize: 10 }}>📦 {tarih(f.teslim_tarihi)} teslim</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 15 }}>{para(f.toplam_tutar)}</div>
                    {(f.kalan || 0) > 0 ? (
                      <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, marginTop: 2 }}>⚠️ Borç: {para(f.kalan)}</div>
                    ) : f.durum === "teslim_edildi" ? (
                      <div style={{ color: "#16a34a", fontSize: 11, marginTop: 2, fontWeight: 600 }}>
                        ✅ {
                          f.odeme_turu === "nakit" && (f.nakit_indirim_yuzde||0) > 0
                            ? `Nakit ${para(f.indirimli_tutar)} ödendi`
                            : f.odeme_turu === "nakit"
                            ? `Nakit ${para(f.toplam_tutar)} ödendi`
                            : f.odeme_turu === "kredi_karti"
                            ? `Kart ${para(f.toplam_tutar)} ödendi`
                            : f.odeme_turu === "havale"
                            ? `Havale ${para(f.toplam_tutar)} ödendi`
                            : `${para(f.toplam_tutar)} ödendi`
                        }
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>Soldan müşteri seçin</div>
      )}
    </div>
  );
}

// ===== KASA RAPORU =====
export function KTKasaRaporu() {
  const [tarihBas, setTarihBas] = useState(() => { const d = new Date(); return d.toISOString().slice(0,7) + "-01"; });
  const [tarihBit, setTarihBit] = useState(bugun());
  const [fisler, setFisler] = useState([]);
  const [rapor, setRapor] = useState(null);
  const [aylikVeri, setAylikVeri] = useState([]);
  const [aktifTab, setAktifTab] = useState("genel");
  const [aciklar, setAciklar] = useState([]);
  const [gunluk, setGunluk] = useState([]);
  const [topMusteri, setTopMusteri] = useState([]);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kasaSifreInput, setKasaSifreInput] = useState("");
  const [kasaSifreHata, setKasaSifreHata] = useState("");

  // Şifre kontrolü - sadece bir kez
  useEffect(() => {
    supabase.from("kt_ayarlar").select("deger").eq("anahtar","kasa_sifre").maybeSingle().then(({ data }) => {
      if (!data?.deger || sessionStorage.getItem("kasa_giris") === "true") setGirisYapildi(true);
    });
  }, []);

  const kasaGiris = async () => {
    const { data } = await supabase.from("kt_ayarlar").select("deger").eq("anahtar","kasa_sifre").maybeSingle();
    if (kasaSifreInput === (data?.deger || "")) {
      setGirisYapildi(true);
      sessionStorage.setItem("kasa_giris", "true");
    } else {
      setKasaSifreHata("❌ Hatalı şifre!");
      setTimeout(() => setKasaSifreHata(""), 3000);
    }
  };

  const getir = async () => {
    const [f1, f2, acikF] = await Promise.all([
      supabase.from("kt_fisler").select("*, musteriler(ad_soyad)").eq("durum","teslim_edildi").eq("odeme_turu","teslimde").gte("teslim_tarihi", tarihBas+"T00:00:00").lte("teslim_tarihi", tarihBit+"T23:59:59").order("teslim_tarihi",{ascending:false}),
      supabase.from("kt_fisler").select("*, musteriler(ad_soyad)").neq("odeme_turu","teslimde").eq("kalan",0).gte("acilis_tarihi", tarihBas+"T00:00:00").lte("acilis_tarihi", tarihBit+"T23:59:59").order("acilis_tarihi",{ascending:false}),
      supabase.from("kt_fisler").select("*, musteriler(ad_soyad)").gt("kalan",0).order("acilis_tarihi",{ascending:false}),
    ]);

    const birlesik = [
      ...(f1.data||[]).map(f => ({ ...f, _tahsilat_tarihi: f.teslim_tarihi, _kaynak: "teslimde" })),
      ...(f2.data||[]).map(f => ({ ...f, _tahsilat_tarihi: f.acilis_tarihi, _kaynak: "pesin" })),
    ].sort((a,b) => new Date(b._tahsilat_tarihi)-new Date(a._tahsilat_tarihi));

    const gunlukMap = {};
    birlesik.forEach(f => { const g=(f._tahsilat_tarihi||"").slice(0,10); gunlukMap[g]=(gunlukMap[g]||0)+(f.indirimli_tutar||0); });
    const gunlukList = Object.entries(gunlukMap).sort(([a],[b])=>a.localeCompare(b)).map(([t,v])=>({tarih:t,tutar:v}));

    const mMap = {};
    birlesik.forEach(f => { const ad=f.musteriler?.ad_soyad||"Bilinmiyor"; if(!mMap[ad])mMap[ad]={ad,toplam:0,adet:0}; mMap[ad].toplam+=(f.indirimli_tutar||0); mMap[ad].adet++; });
    const topM = Object.values(mMap).sort((a,b)=>b.toplam-a.toplam).slice(0,5);

    const basTarih=new Date(tarihBas), bitTarih=new Date(tarihBit);
    const gunSayisi=Math.round((bitTarih-basTarih)/86400000)+1;
    const oB=new Date(basTarih); oB.setDate(oB.getDate()-gunSayisi);
    const oBit2=new Date(basTarih); oBit2.setDate(oBit2.getDate()-1);
    const oBas=oB.toISOString().slice(0,10), oBitStr=oBit2.toISOString().slice(0,10);
    const [op1,op2] = await Promise.all([
      supabase.from("kt_fisler").select("indirimli_tutar").eq("durum","teslim_edildi").eq("odeme_turu","teslimde").gte("teslim_tarihi",oBas+"T00:00:00").lte("teslim_tarihi",oBitStr+"T23:59:59"),
      supabase.from("kt_fisler").select("indirimli_tutar").neq("odeme_turu","teslimde").eq("kalan",0).gte("acilis_tarihi",oBas+"T00:00:00").lte("acilis_tarihi",oBitStr+"T23:59:59"),
    ]);
    const oncekiToplam=[...(op1.data||[]),...(op2.data||[])].reduce((t,x)=>t+(x.indirimli_tutar||0),0);
    const nakitIndirimToplam=birlesik.filter(x=>(x.nakit_indirim_yuzde||0)>0&&x.kalan===0).reduce((t,x)=>t+((x.toplam_tutar||0)-(x.indirimli_tutar||0)),0);
    const acikArr=acikF.data||[];
    setFisler(birlesik); setAciklar(acikArr); setGunluk(gunlukList); setTopMusteri(topM);
    setRapor({
      toplam:birlesik.reduce((t,x)=>t+(x.indirimli_tutar||0),0),
      brutToplam:birlesik.reduce((t,x)=>t+(x.toplam_tutar||0),0),
      nakit:birlesik.filter(x=>x.odeme_turu==="nakit").reduce((t,x)=>t+(x.indirimli_tutar||0),0),
      kart:birlesik.filter(x=>x.odeme_turu==="kredi_karti").reduce((t,x)=>t+(x.indirimli_tutar||0),0),
      havale:birlesik.filter(x=>x.odeme_turu==="havale").reduce((t,x)=>t+(x.indirimli_tutar||0),0),
      adet:birlesik.length,
      ortalamaFis:birlesik.length?birlesik.reduce((t,x)=>t+(x.indirimli_tutar||0),0)/birlesik.length:0,
      nakitIndirimToplam, nakitIndirimAdet:birlesik.filter(x=>(x.nakit_indirim_yuzde||0)>0&&x.kalan===0).length,
      oncekiToplam, acikBorcToplam:acikArr.reduce((t,x)=>t+(x.kalan||0),0), acikAdet:acikArr.length,
    });
  };

  const aylikGetir = async () => {
    const aylar=[];
    for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);aylar.push({label:d.toLocaleString("tr-TR",{month:"short",year:"2-digit"}),bas:d.toISOString().slice(0,7)+"-01",bit:new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10)});}
    const sonuclar=await Promise.all(aylar.map(async ay=>{
      const[r1,r2]=await Promise.all([supabase.from("kt_fisler").select("indirimli_tutar,toplam_tutar,nakit_indirim_yuzde").eq("durum","teslim_edildi").eq("odeme_turu","teslimde").gte("teslim_tarihi",ay.bas+"T00:00:00").lte("teslim_tarihi",ay.bit+"T23:59:59"),supabase.from("kt_fisler").select("indirimli_tutar,toplam_tutar,nakit_indirim_yuzde").neq("odeme_turu","teslimde").eq("kalan",0).gte("acilis_tarihi",ay.bas+"T00:00:00").lte("acilis_tarihi",ay.bit+"T23:59:59")]);
      const tum=[...(r1.data||[]),...(r2.data||[])];
      return{label:ay.label,toplam:tum.reduce((t,x)=>t+(x.indirimli_tutar||0),0),indirim:tum.reduce((t,x)=>(x.nakit_indirim_yuzde||0)>0?t+((x.toplam_tutar||0)-(x.indirimli_tutar||0)):t,0)};
    }));
    setAylikVeri(sonuclar);
  };

  // Giriş yapılınca veri çek
  useEffect(() => { if (girisYapildi) { getir(); aylikGetir(); } }, [girisYapildi]);

  // Anlık kasa güncellemesi
  useRealtimeYenile(["kt_fisler"], () => {
    if (girisYapildi) getir();
  }, [girisYapildi]);

  const maxVeri=Math.max(...aylikVeri.map(a=>a.toplam),1);
  const maxGunluk=Math.max(...gunluk.map(g=>g.tutar),1);
  const sekmeler=[{k:"genel",l:"📊 Genel Bakış"},{k:"detay",l:"📋 Detay Tablo"},{k:"acik",l:"⚠️ Tahsilat Bekleyen" + (rapor ? " (" + rapor.acikAdet + ")" : "")},{k:"musteri",l:"👥 Müşteri Analizi"},{k:"kdv",l:"🧾 KDV Raporu"}];

  // Şifre ekranı
  if (!girisYapildi) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400}}>
      <div style={{...krt,maxWidth:360,width:"100%",textAlign:"center",padding:32}}>
        <div style={{fontSize:48,marginBottom:12}}>🔒</div>
        <h3 style={{color:"#111",marginBottom:6}}>Kasa Raporu</h3>
        <p style={{color:"#888",fontSize:13,marginBottom:20}}>Devam etmek için şifrenizi girin.</p>
        <input type="password" value={kasaSifreInput} onChange={e=>setKasaSifreInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&kasaGiris()} style={{...inp,color:"#222",textAlign:"center",marginBottom:12,fontSize:16,letterSpacing:4}} placeholder="• • • • • •" autoFocus/>
        {kasaSifreHata&&<div style={{color:"#dc2626",fontSize:13,marginBottom:10}}>{kasaSifreHata}</div>}
        <button onClick={kasaGiris} style={{...abtn,width:"100%"}}>🔓 Giriş Yap</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:"#111",margin:0}}>💰 Kasa Raporu</h2>
        <div style={{display:"flex",gap:8}}>
          <ExcelButon tarihBas={tarihBas} tarihBit={tarihBit} />
          <button onClick={()=>{setGirisYapildi(false);sessionStorage.removeItem("kasa_giris");}} style={{...kbtn,fontSize:11}}>🔒 Kilitle</button>
          <button onClick={()=>window.print()} style={kbtn}>🖨️ Yazdır</button>
        </div>
      </div>

      {/* Filtreler */}
      <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"flex-end",flexWrap:"wrap",padding:"14px 16px",background:"#f9fafb",borderRadius:12,border:"1px solid #e5e7eb"}}>
        <div><label style={lbl}>Başlangıç</label><input type="date" value={tarihBas} onChange={e=>setTarihBas(e.target.value)} style={{...inp,width:"auto",color:"#222"}}/></div>
        <div><label style={lbl}>Bitiş</label><input type="date" value={tarihBit} onChange={e=>setTarihBit(e.target.value)} style={{...inp,width:"auto",color:"#222"}}/></div>
        <button onClick={getir} style={abtn}>🔍 Rapor Getir</button>
        {[
          {l:"Bugün",fn:()=>{const b=bugun();setTarihBas(b);setTarihBit(b);setTimeout(getir,50);}},
          {l:"Bu Ay",fn:()=>{const d=new Date();const b=d.toISOString().slice(0,7)+"-01";const bi=new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10);setTarihBas(b);setTarihBit(bi);setTimeout(getir,50);}},
          {l:"Geçen Ay",fn:()=>{const d=new Date();d.setMonth(d.getMonth()-1);const b=d.toISOString().slice(0,7)+"-01";const bi=new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10);setTarihBas(b);setTarihBit(bi);setTimeout(getir,50);}},
          {l:"Bu Yıl",fn:()=>{const y=new Date().getFullYear();setTarihBas(y+"-01-01");setTarihBit(y+"-12-31");setTimeout(getir,50);}},
        ].map(b=><button key={b.l} onClick={b.fn} style={kbtn}>{b.l}</button>)}
      </div>

      {/* Sekmeler */}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {sekmeler.map(s=>(
          <button key={s.k} onClick={()=>setAktifTab(s.k)} style={{padding:"7px 14px",borderRadius:20,border:"2px solid " + (aktifTab===s.k?"#e94560":"#e5e7eb"),background:aktifTab===s.k?"#fef2f2":"#fff",color:aktifTab===s.k?"#e94560":"#555",cursor:"pointer",fontSize:12,fontWeight:aktifTab===s.k?700:400}}>{s.l}</button>
        ))}
      </div>

      {/* GENEL BAKIŞ */}
      {aktifTab==="genel" && rapor && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
            {[
              {l:"💰 Toplam Tahsilat",v:para(rapor.toplam),c:"#dc2626",bg:"#fef2f2"},
              {l:"💵 Nakit",v:para(rapor.nakit),c:"#16a34a",bg:"#f0fdf4"},
              {l:"💳 Kredi Kartı",v:para(rapor.kart),c:"#2563eb",bg:"#eff6ff"},
              {l:"🏦 Havale/EFT",v:para(rapor.havale),c:"#d97706",bg:"#fffbeb"},
              {l:"📋 Fiş Adedi",v:rapor.adet,c:"#7c3aed",bg:"#f5f3ff"},
              {l:"📊 Ort. Fiş",v:para(rapor.ortalamaFis),c:"#0891b2",bg:"#ecfeff"},
            ].map(k=>(
              <div key={k.l} style={{...krt,background:k.bg,border:"1px solid " + k.bg}}>
                <div style={{color:"#888",fontSize:11}}>{k.l}</div>
                <div style={{color:k.c,fontWeight:800,fontSize:17,marginTop:4}}>{k.v}</div>
              </div>
            ))}
          </div>

          {rapor.oncekiToplam > 0 && (
            <div style={{...krt,marginBottom:16,background:"#f8fafc"}}>
              <h4 style={{color:"#111",marginTop:0,marginBottom:12,fontSize:13}}>📈 Dönem Karşılaştırması</h4>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <div><div style={{color:"#888",fontSize:11}}>Seçili Dönem</div><div style={{color:"#dc2626",fontWeight:700,fontSize:18}}>{para(rapor.toplam)}</div></div>
                <div style={{fontSize:20,color:"#aaa"}}>vs</div>
                <div><div style={{color:"#888",fontSize:11}}>Önceki Dönem</div><div style={{color:"#555",fontWeight:700,fontSize:18}}>{para(rapor.oncekiToplam)}</div></div>
                <div style={{padding:"8px 16px",borderRadius:10,background:rapor.toplam>=rapor.oncekiToplam?"#f0fdf4":"#fef2f2",border:"1px solid " + (rapor.toplam>=rapor.oncekiToplam?"#86efac":"#fecaca")}}>
                  <div style={{color:rapor.toplam>=rapor.oncekiToplam?"#16a34a":"#dc2626",fontWeight:700,fontSize:16}}>
                    {rapor.toplam>=rapor.oncekiToplam?"▲":"▼"} %{Math.abs(Math.round(((rapor.toplam-rapor.oncekiToplam)/rapor.oncekiToplam)*100))}
                  </div>
                  <div style={{color:"#888",fontSize:10}}>{rapor.toplam>=rapor.oncekiToplam?"Artış":"Düşüş"}</div>
                </div>
              </div>
            </div>
          )}

          {rapor.nakitIndirimToplam > 0 && (
            <div style={{background:"#f0fdf4",border:"2px solid #86efac",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{color:"#15803d",fontWeight:700,fontSize:14}}>💝 Verilen Nakit İndirimleri</div>
                <div style={{color:"#16a34a",fontSize:12,marginTop:2}}>{rapor.nakitIndirimAdet} fişte indirim uygulandı</div>
                <div style={{color:"#15803d",fontSize:12,marginTop:2}}>Brüt: {para(rapor.brutToplam)} → Tahsilat: {para(rapor.toplam)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#15803d",fontWeight:900,fontSize:22}}>-{para(rapor.nakitIndirimToplam)}</div>
                <div style={{color:"#16a34a",fontSize:11}}>Vazgeçilen alacak</div>
              </div>
            </div>
          )}

          {aylikVeri.length>0 && (
            <div style={{...krt,marginBottom:16}}>
              <h4 style={{color:"#111",marginTop:0,marginBottom:14,fontSize:13}}>📊 Son 6 Ay Ciro</h4>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
                {aylikVeri.map((ay,i)=>{
                  const h=Math.max((ay.toplam/maxVeri)*100,ay.toplam>0?4:0);
                  return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:9,color:"#888",fontWeight:600}}>{ay.toplam>=1000?Math.round(ay.toplam/1000)+"K":ay.toplam>0?Math.round(ay.toplam):""}</div>
                    <div style={{width:"100%",background:i===aylikVeri.length-1?"#e94560":"#dbeafe",borderRadius:"4px 4px 0 0",height:h+"px",minHeight:ay.toplam>0?4:0}} title={para(ay.toplam)}/>
                    <div style={{fontSize:9,color:"#555"}}>{ay.label}</div>
                    {ay.indirim>0&&<div style={{fontSize:8,color:"#16a34a"}}>-{Math.round(ay.indirim/100)/10}K</div>}
                  </div>);
                })}
              </div>
              <div style={{color:"#888",fontSize:11,marginTop:8}}>
                Toplam (6 ay): <strong style={{color:"#dc2626"}}>{para(aylikVeri.reduce((t,a)=>t+a.toplam,0))}</strong>
                {aylikVeri.some(a=>a.indirim>0)&&<span style={{color:"#16a34a",marginLeft:12}}>İndirim: -{para(aylikVeri.reduce((t,a)=>t+a.indirim,0))}</span>}
              </div>
            </div>
          )}

          {gunluk.length>1 && (
            <div style={krt}>
              <h4 style={{color:"#111",marginTop:0,marginBottom:14,fontSize:13}}>📅 Günlük Tahsilat (Seçili Dönem)</h4>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,overflowX:"auto"}}>
                {gunluk.map((g,i)=>{
                  const h=Math.max((g.tutar/maxGunluk)*70,4);
                  return(<div key={i} style={{flex:"0 0 auto",minWidth:28,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:20,background:"#6366f1",borderRadius:"3px 3px 0 0",height:h+"px"}} title={`${g.tarih}: ${para(g.tutar)}`}/>
                    <div style={{fontSize:8,color:"#888",transform:"rotate(-45deg)",transformOrigin:"top left",marginTop:4,whiteSpace:"nowrap"}}>{g.tarih.slice(5)}</div>
                  </div>);
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAY TABLO */}
      {aktifTab==="detay" && rapor && (
        <div>
          <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#92400e",flex:1}}>
              ℹ️ Hem teslimde alınan hem de peşin ödenen fişler. Toplam: <strong>{fisler.length} fiş</strong>, <strong>{para(rapor.toplam)}</strong>
            </div>
            {fisler.filter(f=>f.nakit_fis).length > 0 && (
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#92400e"}}>
                🧾 Nakit Fiş: <strong>{fisler.filter(f=>f.nakit_fis).length} adet</strong> - <strong>{para(fisler.filter(f=>f.nakit_fis).reduce((t,f)=>t+(f.indirimli_tutar||0),0))}</strong>
              </div>
            )}
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:"1px solid #e5e7eb",background:"#f9fafb"}}>
                {["Fiş No","Müşteri","Tarih","Tür","Ödeme","🧾","Brüt","İndirim","Tahsilat"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",color:"#555",fontSize:11,textAlign:"left",fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {fisler.map((f,i)=>{
                  const ind=(f.nakit_indirim_yuzde||0)>0?(f.toplam_tutar||0)-(f.indirimli_tutar||0):0;
                  return(<tr key={f.id+f._kaynak} style={{borderBottom:"1px solid #f3f4f6",background:i%2===0?"#fff":"#fafafa"}}>
                    <td style={{padding:"9px 12px",color:"#111",fontSize:12,fontWeight:600}}>#{f.fis_no}</td>
                    <td style={{padding:"9px 12px",color:"#555",fontSize:12}}>{f.musteriler?.ad_soyad||"-"}</td>
                    <td style={{padding:"9px 12px",color:"#666",fontSize:11}}>{tarih(f._tahsilat_tarihi)}</td>
                    <td style={{padding:"9px 12px",fontSize:11}}>
                      <span style={{padding:"2px 7px",borderRadius:8,background:f._kaynak==="pesin"?"#f0fdf4":"#eff6ff",color:f._kaynak==="pesin"?"#16a34a":"#2563eb",fontSize:10}}>{f._kaynak==="pesin"?"Peşin":"Teslimde"}</span>
                    </td>
                    <td style={{padding:"9px 12px",fontSize:11}}>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:"#f3f4f6",color:f.odeme_turu==="nakit"?"#16a34a":f.odeme_turu==="kredi_karti"?"#2563eb":"#d97706"}}>
                        {f.odeme_turu==="nakit"?"💵 Nakit":f.odeme_turu==="kredi_karti"?"💳 Kart":"🏦 Havale"}
                      </span>
                    </td>
                    <td style={{padding:"9px 12px",fontSize:11,textAlign:"center"}}>{f.nakit_fis?<span style={{color:"#d97706",fontWeight:700}}>🧾</span>:<span style={{color:"#ddd"}}>—</span>}</td>
                    <td style={{padding:"9px 12px",color:"#374151",fontSize:12}}>{para(f.toplam_tutar)}</td>
                    <td style={{padding:"9px 12px",fontSize:12}}>{ind>0?<span style={{color:"#16a34a",fontWeight:600}}>-{para(ind)}</span>:<span style={{color:"#aaa"}}>-</span>}</td>
                    <td style={{padding:"9px 12px",color:"#dc2626",fontWeight:700,fontSize:12}}>{para(f.indirimli_tutar)}</td>
                  </tr>);
                })}
              </tbody>
              {fisler.length>0&&(
                <tfoot><tr style={{background:"#f9fafb",borderTop:"2px solid #e5e7eb"}}>
                  <td colSpan={6} style={{padding:"10px 12px",color:"#555",fontSize:12,fontWeight:600}}>TOPLAM ({fisler.length} fiş)</td>
                  <td style={{padding:"10px 12px",color:"#374151",fontSize:12,fontWeight:700}}>{para(rapor.brutToplam)}</td>
                  <td style={{padding:"10px 12px",color:"#16a34a",fontSize:12,fontWeight:700}}>-{para(rapor.nakitIndirimToplam)}</td>
                  <td style={{padding:"10px 12px",color:"#dc2626",fontSize:13,fontWeight:800}}>{para(rapor.toplam)}</td>
                </tr></tfoot>
              )}
            </table>
            {!fisler.length&&<p style={{color:"#aaa",padding:20,textAlign:"center"}}>Bu dönemde tahsilat yok.</p>}
          </div>
        </div>
      )}

      {/* TAHSİLAT BEKLEYEN */}
      {aktifTab==="acik" && (
        <div>
          {rapor&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div style={{...krt,background:"#fef2f2",border:"2px solid #fecaca"}}>
                <div style={{color:"#888",fontSize:11}}>⚠️ Toplam Açık Borç</div>
                <div style={{color:"#dc2626",fontWeight:800,fontSize:22,marginTop:4}}>{para(rapor.acikBorcToplam)}</div>
                <div style={{color:"#888",fontSize:11,marginTop:4}}>{rapor.acikAdet} açık fiş</div>
              </div>
              <div style={{...krt,background:"#fffbeb"}}>
                <div style={{color:"#888",fontSize:11}}>📊 Ortalama Borç/Fiş</div>
                <div style={{color:"#d97706",fontWeight:800,fontSize:22,marginTop:4}}>{para(rapor.acikAdet>0?rapor.acikBorcToplam/rapor.acikAdet:0)}</div>
              </div>
            </div>
          )}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#fef2f2",borderBottom:"1px solid #fecaca"}}>
                {["Fiş No","Müşteri","Açılış","Durum","Net Toplam","Kalan Borç","Kaç Gün"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",color:"#dc2626",fontSize:11,textAlign:"left",fontWeight:600}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {aciklar.map((f,i)=>{
                  const gun=Math.floor((new Date()-new Date(f.acilis_tarihi))/86400000);
                  return(<tr key={f.id} style={{borderBottom:"1px solid #f3f4f6",background:i%2===0?"#fff":"#fafafa"}}>
                    <td style={{padding:"9px 12px",color:"#111",fontSize:12,fontWeight:600}}>#{f.fis_no}</td>
                    <td style={{padding:"9px 12px",color:"#555",fontSize:12}}>{f.musteriler?.ad_soyad||"-"}</td>
                    <td style={{padding:"9px 12px",color:"#666",fontSize:11}}>{tarih(f.acilis_tarihi)}</td>
                    <td style={{padding:"9px 12px",fontSize:11}}>
                      <span style={{padding:"2px 8px",borderRadius:8,background:f.durum==="hazir"?"#f0fdf4":"#fffbeb",color:f.durum==="hazir"?"#16a34a":"#d97706",fontSize:10,fontWeight:600}}>
                        {f.durum==="hazir"?"✅ Hazır":f.durum==="bekliyor"?"⏳ Bekliyor":"🔄 Kısmi"}
                      </span>
                    </td>
                    <td style={{padding:"9px 12px",fontSize:11,textAlign:"center"}}>{f.nakit_fis?<span style={{color:"#d97706",fontWeight:700}}>🧾</span>:<span style={{color:"#ddd"}}>—</span>}</td>
                    <td style={{padding:"9px 12px",color:"#374151",fontSize:12}}>{para(f.toplam_tutar)}</td>
                    <td style={{padding:"9px 12px",color:"#dc2626",fontWeight:700,fontSize:13}}>{para(f.kalan)}</td>
                    <td style={{padding:"9px 12px",fontSize:11}}>
                      <span style={{padding:"2px 8px",borderRadius:8,background:gun>14?"#fef2f2":"#f9fafb",color:gun>14?"#dc2626":"#888",fontWeight:gun>14?700:400}}>
                        {gun} gün
                      </span>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
            {!aciklar.length&&<p style={{color:"#16a34a",padding:20,textAlign:"center"}}>✅ Tüm alacaklar tahsil edilmiş!</p>}
          </div>
        </div>
      )}

      {/* MÜŞTERİ ANALİZİ */}
      {aktifTab==="musteri" && (
        <div>
          <h4 style={{color:"#555",fontSize:13,marginBottom:12}}>🏆 En Çok Tahsilat - Seçili Dönem</h4>
          {topMusteri.length===0&&<p style={{color:"#aaa"}}>Bu dönemde veri yok.</p>}
          {topMusteri.map((m,i)=>(
            <div key={m.ad} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",marginBottom:8,background:"#fff",borderRadius:10,border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:32,height:32,borderRadius:16,background:["#fef2f2","#fffbeb","#f0fdf4","#eff6ff","#f5f3ff"][i]||"#f9fafb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:["#dc2626","#d97706","#16a34a","#2563eb","#7c3aed"][i]||"#888"}}>{i+1}</div>
                <div>
                  <div style={{color:"#111",fontWeight:600}}>{m.ad}</div>
                  <div style={{color:"#888",fontSize:11}}>{m.adet} fiş</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#dc2626",fontWeight:700,fontSize:16}}>{para(m.toplam)}</div>
                <div style={{color:"#888",fontSize:11}}>ort. {para(m.toplam/m.adet)}/fiş</div>
              </div>
            </div>
          ))}
          {topMusteri.length>0&&rapor&&(
            <div style={{...krt,marginTop:8,background:"#f9fafb",fontSize:12,color:"#888"}}>
              Bu dönemde <strong style={{color:"#111"}}>{rapor.adet} fiş</strong>, toplam <strong style={{color:"#dc2626"}}>{para(rapor.toplam)}</strong> tahsilat.
            </div>
          )}
        </div>
      )}

      {/* KDV RAPORU */}
      {aktifTab==="kdv" && (
        <div>
          <div style={{...krt,marginBottom:16,background:"#fffbeb",border:"1px solid #fde68a"}}>
            <h4 style={{color:"#92400e",marginTop:0,marginBottom:8}}>🧾 KDV Raporu - Nakit Fişi Kesilenler</h4>
            <p style={{color:"#a16207",fontSize:12,margin:0}}>Sadece "Nakit Fişi Kesildi" işaretlenen ödemeler gösterilmektedir. KDV oranı %10 olarak hesaplanmıştır.</p>
          </div>

          {(() => {
            const nakitFisler = fisler.filter(f => f.nakit_fis);
            const toplamCiro = nakitFisler.reduce((t,f) => t + (f.indirimli_tutar||0), 0);
            const kdvDahilCiro = toplamCiro;
            const kdvTutar = kdvDahilCiro / 11 * 1; // %10 KDV (dahil)
            const kdvHaricCiro = kdvDahilCiro - kdvTutar;
            return (
              <div>
                {/* Özet kartları */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
                  {[
                    {l:"🧾 Nakit Fişli Ciro",v:para(toplamCiro),c:"#d97706",bg:"#fffbeb"},
                    {l:"🏛️ KDV (%10 Dahil)",v:para(kdvTutar),c:"#dc2626",bg:"#fef2f2"},
                    {l:"📊 KDV Hariç Ciro",v:para(kdvHaricCiro),c:"#16a34a",bg:"#f0fdf4"},
                    {l:"📋 Fiş Adedi",v:nakitFisler.length,c:"#2563eb",bg:"#eff6ff"},
                  ].map(k=>(
                    <div key={k.l} style={{...krt,background:k.bg}}>
                      <div style={{color:"#888",fontSize:11}}>{k.l}</div>
                      <div style={{color:k.c,fontWeight:800,fontSize:17,marginTop:4}}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {/* KDV hesap detayı */}
                <div style={{...krt,marginBottom:16,background:"#f8fafc"}}>
                  <h4 style={{color:"#111",marginTop:0,marginBottom:12,fontSize:13}}>📐 KDV Hesaplama (%10)</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {[
                      {l:"Toplam Tahsilat (KDV Dahil)",v:para(toplamCiro),c:"#374151"},
                      {l:"KDV Tutarı (÷11)",v:para(kdvTutar),c:"#dc2626"},
                      {l:"KDV Hariç Ciro",v:para(kdvHaricCiro),c:"#16a34a"},
                    ].map(r=>(
                      <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:7,background:"#fff",border:"1px solid #e5e7eb"}}>
                        <span style={{color:"#555",fontSize:13}}>{r.l}</span>
                        <span style={{color:r.c,fontWeight:700,fontSize:13}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nakit fişli detay tablo */}
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:"#fffbeb",borderBottom:"1px solid #fde68a"}}>
                      {["Fiş No","Müşteri","Tarih","Tutar (KDV Dahil)","KDV (%10)","KDV Hariç"].map(h=>(
                        <th key={h} style={{padding:"10px 12px",color:"#92400e",fontSize:11,textAlign:"left",fontWeight:600}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {nakitFisler.map((f,i)=>{
                        const tutar = f.indirimli_tutar||0;
                        const kdv = tutar/11;
                        const hariç = tutar - kdv;
                        return (<tr key={f.id} style={{borderBottom:"1px solid #f3f4f6",background:i%2===0?"#fff":"#fafafa"}}>
                          <td style={{padding:"9px 12px",color:"#111",fontSize:12,fontWeight:600}}>#{f.fis_no}</td>
                          <td style={{padding:"9px 12px",color:"#555",fontSize:12}}>{f.musteriler?.ad_soyad||"-"}</td>
                          <td style={{padding:"9px 12px",color:"#666",fontSize:11}}>{tarih(f._tahsilat_tarihi||f.acilis_tarihi)}</td>
                          <td style={{padding:"9px 12px",color:"#374151",fontWeight:700,fontSize:12}}>{para(tutar)}</td>
                          <td style={{padding:"9px 12px",color:"#dc2626",fontSize:12}}>{para(kdv)}</td>
                          <td style={{padding:"9px 12px",color:"#16a34a",fontWeight:600,fontSize:12}}>{para(hariç)}</td>
                        </tr>);
                      })}
                    </tbody>
                    {nakitFisler.length>0&&(
                      <tfoot><tr style={{background:"#fffbeb",borderTop:"2px solid #fde68a"}}>
                        <td colSpan={3} style={{padding:"10px 12px",color:"#92400e",fontSize:12,fontWeight:600}}>TOPLAM ({nakitFisler.length} fiş)</td>
                        <td style={{padding:"10px 12px",color:"#d97706",fontWeight:700,fontSize:12}}>{para(toplamCiro)}</td>
                        <td style={{padding:"10px 12px",color:"#dc2626",fontWeight:700,fontSize:12}}>{para(kdvTutar)}</td>
                        <td style={{padding:"10px 12px",color:"#16a34a",fontWeight:700,fontSize:12}}>{para(kdvHaricCiro)}</td>
                      </tr></tfoot>
                    )}
                  </table>
                  {!nakitFisler.length&&<p style={{color:"#aaa",padding:20,textAlign:"center"}}>Bu dönemde nakit fişi kesilen işlem yok.</p>}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
// ===== AYARLAR SAYFASI =====
export function KTAyarlar() {
  const [aktif, setAktif] = useState("fis");
  const [firmaAdi, setFirmaAdi] = useState(() => localStorage.getItem("kt_firma_adi") || "");
  const [firmaTel, setFirmaTel] = useState(() => localStorage.getItem("kt_firma_tel") || "");
  const [firmaAdres, setFirmaAdres] = useState(() => localStorage.getItem("kt_firma_adres") || "");
  const [musteriNotu, setMusteriNotu] = useState(() => localStorage.getItem("kt_musteri_notu") || "Teşekkür ederiz!");
  const [firmaLogo, setFirmaLogo] = useState(() => localStorage.getItem("firma_logo") || "");
  const [widgets, setWidgets] = useState(["bekleyen","hazir","bugun","acik","son_fisler"]);
  const [kaydedildi, setKaydedildi] = useState(false);

  // Yazıcı ayarları - state olarak tut, değişince hem state hem localStorage güncelle
  const [yaziciGenislik, setYaziciGenislik] = useState(() => localStorage.getItem("yazici_genislik") || "72mm");
  const [yaziciFont, setYaziciFont] = useState(() => localStorage.getItem("yazici_font") || "10.5px");
  const [yaziciBarkod, setYaziciBarkod] = useState(() => localStorage.getItem("yazici_barkod") || "32");
  const [yaziciQr, setYaziciQr] = useState(() => localStorage.getItem("yazici_qr") || "160");

  const yaziciGuncelle = (anahtar, deger, setter) => {
    setter(deger);
    localStorage.setItem(anahtar, deger);
  };
  useEffect(() => {
    const oku = async () => {
      try {
        // Önce sessionStorage'dan hızlı yükle
        const cache = sessionStorage.getItem("kt_ayarlar_cache");
        if (cache) {
          const m = JSON.parse(cache);
          if (m.firma_adi) setFirmaAdi(m.firma_adi);
          if (m.firma_telefon) setFirmaTel(m.firma_telefon);
          if (m.firma_adres) setFirmaAdres(m.firma_adres);
          if (m.musteri_notu) setMusteriNotu(m.musteri_notu);
          if (m.firma_logo) setFirmaLogo(m.firma_logo);
          setKasaSifre(m.kasa_sifre || "");
          try { setWidgets(JSON.parse(m.anasayfa_widgets || "[]")); } catch {}
          try { if (m.fiyat_listesi) { setFiyatlar(JSON.parse(m.fiyat_listesi)); } else { setFiyatlar(FIYATLAR); } } catch { setFiyatlar(FIYATLAR); }
          setFiyatYuklendi(true);
        }
        // Sonra Supabase'den güncel veriyi al
        const { data } = await supabase.from("kt_ayarlar").select("*");
        const m = {};
        (data || []).forEach(x => { m[x.anahtar] = x.deger; });
        // Supabase'den gelen değer doluysa state'i güncelle, boşsa localStorage kalır
        if (m.firma_adi) { setFirmaAdi(m.firma_adi); localStorage.setItem("kt_firma_adi", m.firma_adi); }
        if (m.firma_telefon) { setFirmaTel(m.firma_telefon); localStorage.setItem("kt_firma_tel", m.firma_telefon); }
        if (m.firma_adres) { setFirmaAdres(m.firma_adres); localStorage.setItem("kt_firma_adres", m.firma_adres); }
        if (m.musteri_notu) { setMusteriNotu(m.musteri_notu); localStorage.setItem("kt_musteri_notu", m.musteri_notu); }
        if (m.firma_logo) { setFirmaLogo(m.firma_logo); localStorage.setItem("firma_logo", m.firma_logo); }
        setKasaSifre(m.kasa_sifre || "");
        try { setWidgets(JSON.parse(m.anasayfa_widgets || "[]")); } catch {}
        try { if (m.fiyat_listesi) { setFiyatlar(JSON.parse(m.fiyat_listesi)); } else { setFiyatlar(FIYATLAR); } } catch { setFiyatlar(FIYATLAR); }
        setFiyatYuklendi(true);
        // Cache güncelle (logo hariç)
        const cacheObj = { ...m };
        delete cacheObj.firma_logo;
        sessionStorage.setItem("kt_ayarlar_cache", JSON.stringify(cacheObj));
      } catch { await ayarTablosuOlustur(); }
    };
    oku();
  }, []);

  const logoYukle = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) { toast("Logo max 200KB olmalı!", "uyari"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const logoData = ev.target.result;
      setFirmaLogo(logoData);
      localStorage.setItem("firma_logo", logoData);
    };
    reader.readAsDataURL(file);
  };

  const logoKaldir = () => {
    setFirmaLogo("");
    localStorage.removeItem("firma_logo");
  };

  const kaydet = async () => {
    const ayarlar = [
      { anahtar: "firma_adi", deger: firmaAdi },
      { anahtar: "firma_telefon", deger: firmaTel },
      { anahtar: "firma_adres", deger: firmaAdres },
      { anahtar: "musteri_notu", deger: musteriNotu },
      { anahtar: "firma_logo", deger: firmaLogo },
      { anahtar: "anasayfa_widgets", deger: JSON.stringify(widgets) },
      { anahtar: "kasa_sifre", deger: kasaSifre },
      { anahtar: "fiyat_listesi", deger: JSON.stringify(fiyatlar) },
    ];
    await supabase.from("kt_ayarlar").upsert(ayarlar, { onConflict: "anahtar" });
    // localStorage backup
    localStorage.setItem("kt_firma_adi", firmaAdi);
    localStorage.setItem("kt_firma_tel", firmaTel);
    localStorage.setItem("kt_firma_adres", firmaAdres);
    localStorage.setItem("kt_musteri_notu", musteriNotu);
    if (firmaLogo) localStorage.setItem("firma_logo", firmaLogo);
    // Cache güncelle
    const cacheObj = {};
    ayarlar.forEach(a => { cacheObj[a.anahtar] = a.deger; });
    sessionStorage.setItem("kt_ayarlar_cache", JSON.stringify(cacheObj));
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  const widgetSecenekleri = [
    { k: "bekleyen", l: "Bekleyen Ürünler", e: "⏳", aciklama: "Hazırlanmayı bekleyen ürün sayısı" },
    { k: "hazir", l: "Hazır Ürünler", e: "✅", aciklama: "Teslime hazır ürün sayısı" },
    { k: "bugun", l: "Bugün Giren Fiş", e: "📥", aciklama: "Bugün açılan fiş sayısı" },
    { k: "acik", l: "Açık Fişler", e: "📋", aciklama: "Teslim edilmemiş toplam fiş sayısı" },
    { k: "son_fisler", l: "Son Açık Fişler Listesi", e: "📝", aciklama: "Son açık fişlerin detaylı listesi" },
  ];

  const [eskiSifre, setEskiSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifre2, setYeniSifre2] = useState("");
  const [yeniKullanici, setYeniKullanici] = useState("");
  const [kasaSifre, setKasaSifre] = useState("");
  const [hesapMesaj, setHesapMesaj] = useState(null);
  const [kullaniciBilgi, setKullaniciBilgi] = useState(null);

  useEffect(() => {
    // Mevcut kullanıcı bilgisini al (localStorage'dan)
    try {
      const k = JSON.parse(localStorage.getItem("kt_kullanici") || "null");
      if (k) { setKullaniciBilgi(k); setYeniKullanici(k.kullanici_adi || ""); }
    } catch {}
  }, []);

  const kasaAyarKaydet = async () => {
    await supabase.from("kt_ayarlar").upsert([
      { anahtar: "kasa_sifre", deger: kasaSifre },
      { anahtar: "fiyat_listesi", deger: JSON.stringify(fiyatlar) },
    ], { onConflict: "anahtar" });
    setHesapMesaj({ tip: "ok", mesaj: "✅ Kasa şifresi kaydedildi!" });
    setTimeout(() => setHesapMesaj(null), 3000);
  };

  const sifreDegistir = async () => {
    if (!yeniSifre || yeniSifre.length < 4) return setHesapMesaj({ tip: "hata", mesaj: "❌ Şifre en az 4 karakter olmalı!" });
    if (yeniSifre !== yeniSifre2) return setHesapMesaj({ tip: "hata", mesaj: "❌ Şifreler eşleşmiyor!" });
    if (!kullaniciBilgi) return setHesapMesaj({ tip: "hata", mesaj: "❌ Kullanıcı bulunamadı!" });
    // Eski şifreyi doğrula
    const { data } = await supabase.from("kullanicilar").select("*").eq("id", kullaniciBilgi.id).single();
    if (!data || (eskiSifre !== "admin123" && data.sifre_hash !== eskiSifre)) {
      return setHesapMesaj({ tip: "hata", mesaj: "❌ Mevcut şifre yanlış!" });
    }
    const guncelleme = { sifre_hash: yeniSifre };
    if (yeniKullanici && yeniKullanici !== data.kullanici_adi) guncelleme.kullanici_adi = yeniKullanici;
    await supabase.from("kullanicilar").update(guncelleme).eq("id", kullaniciBilgi.id);
    // LocalStorage güncelle
    const yeniData = { ...kullaniciBilgi, ...guncelleme };
    localStorage.setItem("kt_kullanici", JSON.stringify(yeniData));
    setKullaniciBilgi(yeniData);
    setEskiSifre(""); setYeniSifre(""); setYeniSifre2("");
    setHesapMesaj({ tip: "ok", mesaj: "✅ Bilgiler güncellendi! Bir sonraki girişte geçerli olacak." });
    setTimeout(() => setHesapMesaj(null), 4000);
  };

  const [fiyatlar, setFiyatlar] = useState({});
  const [fiyatYuklendi, setFiyatYuklendi] = useState(false);
  const [seciliFiyatHizmet, setSeciliFiyatHizmet] = useState("KURU TEMİZLEME");
  const [fiyatMesaj, setFiyatMesaj] = useState("");

  const tabs = [
    { k: "fis", l: "🖨️ Fiş Ayarları" },
    { k: "fiyat", l: "💰 Fiyat Listesi" },
    { k: "anasayfa", l: "🏠 Ana Sayfa" },
    { k: "kasa", l: "💰 Kasa" },
    { k: "hesap", l: "🔐 Hesap & Güvenlik" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#111", margin: 0 }}>⚙️ Sistem Ayarları</h2>
        <button onClick={kaydet} style={{ ...abtn, background: kaydedildi ? "#16a34a" : undefined }}>
          {kaydedildi ? "✅ Kaydedildi!" : "💾 Kaydet"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setAktif(t.k)} style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, borderColor: aktif === t.k ? "#e94560" : "#e5e7eb", background: aktif === t.k ? "#fef2f2" : "#fff", color: aktif === t.k ? "#e94560" : "#555", transition: "all 0.15s" }}>{t.l}</button>
        ))}
      </div>

      {aktif === "fis" && (
        <div style={{ maxWidth: 600 }}>
          <div style={krt}>
            <h3 style={{ color: "#111", marginTop: 0 }}>Firma Bilgileri</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Firma Logosu (max 200KB, PNG/JPG)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {firmaLogo && <img src={firmaLogo} alt="logo" style={{ maxHeight: 60, maxWidth: 120, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 6, padding: 4 }} />}
                <div>
                  <input type="file" accept="image/*" onChange={logoYukle} style={{ fontSize: 12, color: "#555" }} />
                  {firmaLogo && <button onClick={logoKaldir} style={{ ...kbtn, marginTop: 6, fontSize: 11, color: "#dc2626", display: "block" }}>🗑️ Logoyu Kaldır</button>}
                </div>
              </div>
              {!firmaLogo && <div style={{ color: "#aaa", fontSize: 11, marginTop: 4 }}>Logo yüklenmedi - fişte sadece metin görünür</div>}
            </div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Firma Adı</label><input value={firmaAdi} onChange={e => setFirmaAdi(e.target.value)} style={inp} placeholder="Kuru Temizleme" /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Telefon</label><input value={firmaTel} onChange={e => setFirmaTel(e.target.value)} style={inp} placeholder="0212 xxx xx xx" /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Adres</label><input value={firmaAdres} onChange={e => setFirmaAdres(e.target.value)} style={inp} placeholder="Mahalle, Sokak, No" /></div>
            <div><label style={lbl}>Müşteri Notu (Fişin altında görünür)</label>
              <textarea value={musteriNotu} onChange={e => setMusteriNotu(e.target.value)} style={{ ...inp, height: 70, resize: "vertical", fontFamily: "inherit" }} placeholder="Teşekkür ederiz!" />
            </div>
          </div>
          <div style={{ ...krt, marginTop: 16 }}>
            <h3 style={{ color: "#111", marginTop: 0 }}>🖨️ Yazıcı Ayarları</h3>
            <p style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>Sewoo / POS yazıcı için kağıt ve format ayarları.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Kağıt Genişliği</label>
                <select value={yaziciGenislik} onChange={e => yaziciGuncelle("yazici_genislik", e.target.value, setYaziciGenislik)} style={{ ...inp, color: "#222", background: "#fff" }}>
                  <option value="58mm">58mm (küçük)</option>
                  <option value="72mm">72mm (standart)</option>
                  <option value="80mm">80mm (geniş)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Font Boyutu</label>
                <select value={yaziciFont} onChange={e => yaziciGuncelle("yazici_font", e.target.value, setYaziciFont)} style={{ ...inp, color: "#222", background: "#fff" }}>
                  <option value="9px">9px (küçük)</option>
                  <option value="10.5px">10.5px (standart)</option>
                  <option value="12px">12px (büyük)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Barkod Yüksekliği</label>
                <select value={yaziciBarkod} onChange={e => yaziciGuncelle("yazici_barkod", e.target.value, setYaziciBarkod)} style={{ ...inp, color: "#222", background: "#fff" }}>
                  <option value="24">Küçük (24px)</option>
                  <option value="32">Standart (32px)</option>
                  <option value="48">Büyük (48px)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>QR Kod</label>
                <select value={yaziciQr} onChange={e => yaziciGuncelle("yazici_qr", e.target.value, setYaziciQr)} style={{ ...inp, color: "#222", background: "#fff" }}>
                  <option value="0">Gösterme</option>
                  <option value="120">Küçük (120px)</option>
                  <option value="160">Standart (160px)</option>
                  <option value="200">Büyük (200px)</option>
                </select>
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: "#fffbeb", borderRadius: 7, border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
              ℹ️ Yazıcı ayarları bu cihazda (tarayıcıda) kaydedilir. Her cihaz ayrı ayarlara sahip olabilir.
            </div>
          </div>
          <div style={{ ...krt, marginTop: 16 }}>
            <h3 style={{ color: "#111", marginTop: 0 }}>🖨️ Fiş Önizleme (Sewoo 72mm)</h3>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: 12, fontFamily: "Courier New, monospace", fontSize: 10.5, border: "1px dashed #d0d5dd", maxWidth: 272 }}>
              {firmaLogo && <img src={firmaLogo} alt="logo" style={{ display: "block", margin: "0 auto 4px", maxHeight: 40, maxWidth: 100, objectFit: "contain" }} />}
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>{firmaAdi || "Kuru Temizleme"}</div>
              {firmaTel && <div style={{ textAlign: "center", fontSize: 9 }}>{firmaTel}</div>}
              {firmaAdres && <div style={{ textAlign: "center", fontSize: 9 }}>{firmaAdres}</div>}
              <div style={{ borderTop: "1px dashed #999", margin: "4px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Fiş No:</span><strong>#001</strong></div>
              <div style={{ borderTop: "1px dashed #999", margin: "4px 0" }}></div>
              <div><strong>Örnek Müşteri</strong></div>
              <div style={{ textAlign: "center", marginTop: 4, fontSize: 9 }}>{musteriNotu || "Teşekkür ederiz!"}</div>
            </div>
          </div>
        </div>
      )}

      {aktif === "fiyat" && (
        <div style={{ maxWidth: 700 }}>
          <div style={krt}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ color: "#111", margin: 0 }}>💰 Fiyat Listesi Yönetimi</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setFiyatlar(FIYATLAR); setFiyatMesaj("Varsayılan fiyatlar yüklendi"); setTimeout(()=>setFiyatMesaj(""),2000); }} style={{ ...kbtn, fontSize: 11 }}>↺ Varsayılana Dön</button>
                <button onClick={async () => {
                  await supabase.from("kt_ayarlar").upsert([{ anahtar: "fiyat_listesi", deger: JSON.stringify(fiyatlar) }], { onConflict: "anahtar" });
                  _dinamikFiyatlar = fiyatlar; // Önbelleği güncelle
                  setFiyatMesaj("✅ Fiyatlar kaydedildi! Yeni fişlere yansıyacak.");
                  setTimeout(() => setFiyatMesaj(""), 3000);
                }} style={{ ...abtn, fontSize: 12 }}>💾 Kaydet</button>
              </div>
            </div>
            {fiyatMesaj && <div style={{ padding: "6px 12px", background: "#f0fdf4", borderRadius: 7, color: "#16a34a", fontSize: 12, marginBottom: 12 }}>{fiyatMesaj}</div>}
            <p style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>Fiyatları düzenleyin. 0 = fiyat girilmemiş (fiş açarken manuel girilir).</p>

            {/* Hizmet seç tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {Object.keys(FIYATLAR).map(h => (
                <button key={h} onClick={() => setSeciliFiyatHizmet(h)}
                  style={{ padding: "5px 12px", borderRadius: 14, border: "2px solid " + (seciliFiyatHizmet === h ? "#e94560" : "#e5e7eb"), background: seciliFiyatHizmet === h ? "#fef2f2" : "#fff", color: seciliFiyatHizmet === h ? "#e94560" : "#555", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  {h}
                </button>
              ))}
            </div>

            {/* Seçili hizmetin fiyatları */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
              {Object.entries((fiyatlar[seciliFiyatHizmet] || FIYATLAR[seciliFiyatHizmet] || {})).map(([urun]) => (
                <div key={urun} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                  <span style={{ color: "#374151", fontSize: 12, flex: 1 }}>{urun}</span>
                  <input type="number" min="0"
                    value={(fiyatlar[seciliFiyatHizmet] || {})[urun] ?? FIYATLAR[seciliFiyatHizmet]?.[urun] ?? 0}
                    onChange={e => setFiyatlar(prev => ({
                      ...prev,
                      [seciliFiyatHizmet]: { ...(prev[seciliFiyatHizmet] || FIYATLAR[seciliFiyatHizmet] || {}), [urun]: +e.target.value }
                    }))}
                    style={{ width: 70, padding: "4px 8px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 12, textAlign: "right", color: "#222" }} />
                  <span style={{ color: "#888", fontSize: 11 }}>₺</span>
                </div>
              ))}
            </div>

            {/* Yeni ürün ekle */}
            <div style={{ marginTop: 16, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              <div style={{ color: "#15803d", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>➕ Yeni Ürün Ekle</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input id="yeniUrunAd" placeholder="Ürün adı..." style={{ ...inp, flex: 1, color: "#222", fontSize: 12 }} />
                <input id="yeniUrunFiyat" type="number" placeholder="Fiyat" style={{ width: 80, ...inp, color: "#222", fontSize: 12 }} />
                <button onClick={() => {
                  const ad = document.getElementById("yeniUrunAd").value.trim().toUpperCase();
                  const fiyat = +document.getElementById("yeniUrunFiyat").value || 0;
                  if (!ad) return;
                  setFiyatlar(prev => ({ ...prev, [seciliFiyatHizmet]: { ...(prev[seciliFiyatHizmet] || FIYATLAR[seciliFiyatHizmet] || {}), [ad]: fiyat } }));
                  document.getElementById("yeniUrunAd").value = "";
                  document.getElementById("yeniUrunFiyat").value = "";
                }} style={{ ...abtn, fontSize: 12 }}>Ekle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aktif === "anasayfa" && (
        <div style={{ maxWidth: 560 }}>
          <div style={krt}>
            <h3 style={{ color: "#111", marginTop: 0 }}>Ana Sayfa Widget'ları</h3>
            <p style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>Görmek istediğiniz widget'ları seçin ve sıralayın.</p>
            {widgetSecenekleri.map((w, idx) => (
              <div key={w.k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "11px 14px", borderRadius: 10, background: widgets.includes(w.k) ? "#f0fdf4" : "#f9fafb", border: "1px solid " + (widgets.includes(w.k) ? "#86efac" : "#e5e7eb"), cursor: "pointer" }}
                onClick={() => setWidgets(widgets.includes(w.k) ? widgets.filter(x => x !== w.k) : [...widgets, w.k])}>
                <div style={{ width: 22, height: 22, borderRadius: 5, border: "2px solid", borderColor: widgets.includes(w.k) ? "#16a34a" : "#d0d5dd", background: widgets.includes(w.k) ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {widgets.includes(w.k) && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#111", fontSize: 13, fontWeight: 600 }}>{w.e} {w.l}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{w.aciklama}</div>
                </div>
                {widgets.includes(w.k) && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); const i = widgets.indexOf(w.k); if (i > 0) { const a = [...widgets]; [a[i-1],a[i]] = [a[i],a[i-1]]; setWidgets(a); }}} style={{ ...kbtn, padding: "2px 7px", fontSize: 12 }}>↑</button>
                    <button onClick={e => { e.stopPropagation(); const i = widgets.indexOf(w.k); if (i < widgets.length-1) { const a = [...widgets]; [a[i],a[i+1]] = [a[i+1],a[i]]; setWidgets(a); }}} style={{ ...kbtn, padding: "2px 7px", fontSize: 12 }}>↓</button>
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
              ℹ️ Seçili widget'lar ana sayfada gösterilir. Ok butonları ile sıralamayı değiştirebilirsiniz.
            </div>
          </div>
        </div>
      )}

      {aktif === "hesap" && (
        <div style={{ maxWidth: 480 }}>
          {hesapMesaj && (
            <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, background: hesapMesaj.tip === "ok" ? "#f0fdf4" : "#fef2f2", border: "1px solid " + (hesapMesaj.tip === "ok" ? "#86efac" : "#fecaca"), color: hesapMesaj.tip === "ok" ? "#15803d" : "#dc2626", fontSize: 13, fontWeight: 600 }}>
              {hesapMesaj.mesaj}
            </div>
          )}

          {/* Kullanıcı adı & Şifre */}
          <div style={{ ...krt, marginBottom: 16 }}>
            <h3 style={{ color: "#111", marginTop: 0 }}>👤 Kullanıcı Bilgileri</h3>
            {kullaniciBilgi && (
              <div style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                Mevcut kullanıcı: <strong>{kullaniciBilgi.kullanici_adi || kullaniciBilgi.ad_soyad}</strong>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Yeni Kullanıcı Adı</label>
              <input value={yeniKullanici} onChange={e => setYeniKullanici(e.target.value)} style={{ ...inp, color: "#222" }} placeholder="Kullanıcı adı..." />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Mevcut Şifre</label>
              <input type="password" value={eskiSifre} onChange={e => setEskiSifre(e.target.value)} style={{ ...inp, color: "#222" }} placeholder="Mevcut şifreniz..." />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Yeni Şifre</label>
              <input type="password" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} style={{ ...inp, color: "#222" }} placeholder="En az 4 karakter..." />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Yeni Şifre (Tekrar)</label>
              <input type="password" value={yeniSifre2} onChange={e => setYeniSifre2(e.target.value)} style={{ ...inp, color: "#222" }} placeholder="Şifreyi tekrar girin..." />
            </div>
            <button onClick={sifreDegistir} style={{ ...abtn, width: "100%" }}>🔐 Güncelle</button>
          </div>

          {/* Kasa Raporu Şifresi */}
          <div style={{ ...krt, border: "1px solid #bfdbfe", background: "#eff6ff" }}>
            <h3 style={{ color: "#1d4ed8", marginTop: 0 }}>🔒 Kasa Raporu Şifresi</h3>
            <p style={{ color: "#3730a3", fontSize: 13, marginBottom: 12 }}>
              Kasa raporuna girerken sorulacak şifre. Boş bırakırsanız şifre sorulmaz.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Kasa Şifresi</label>
              <input type="password" value={kasaSifre} onChange={e => setKasaSifre(e.target.value)} style={{ ...inp, color: "#222", background: "#fff" }} placeholder="Kasa şifresi (boş = şifresiz)..." />
            </div>
            <button onClick={kasaAyarKaydet} style={{ ...abtn, width: "100%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              💾 Kasa Şifresi Kaydet
            </button>
          </div>
        </div>
      )}


      {aktif === "kasa" && (
        <div style={{ maxWidth: 500 }}>
          <div style={krt}>
            <h3 style={{ color: "#111", marginTop: 0 }}>💰 Kasa Raporu</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "#1d4ed8", fontWeight: 600 }}>📦 Teslimde Öde</div>
                <div style={{ color: "#1e40af", fontSize: 12, marginTop: 4 }}>Teslim tarihine göre raporlanır</div>
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "#15803d", fontWeight: 600 }}>💵 Peşin Ödeme</div>
                <div style={{ color: "#166534", fontSize: 12, marginTop: 4 }}>Fiş açılış tarihine göre raporlanır</div>
              </div>
            </div>
          </div>

          {/* Eski fişleri düzelt */}
          <div style={{ ...krt, marginTop: 16, border: "1px solid #fde68a", background: "#fffbeb" }}>
            <h3 style={{ color: "#92400e", marginTop: 0 }}>🔧 Eski Fişleri Düzelt</h3>
            <p style={{ color: "#78350f", fontSize: 13, marginBottom: 12 }}>
              Eski fişlerde "Kalan Borç" nakit indirimli tutar olarak kaydedilmişse, 
              bu butona basarak tüm fişleri otomatik düzeltin.
            </p>
            <button onClick={async () => {
              if (!window.confirm("Tüm açık fişlerin kalan borcu NET TOPLAM olarak güncellenecek. Devam?")) return;
              const { data: fisler } = await supabase.from("kt_fisler")
                .select("id, toplam_tutar, indirimli_tutar, kalan, nakit_indirim_yuzde")
                .not("durum", "eq", "teslim_edildi")
                .gt("kalan", 0);
              let sayac = 0;
              for (const f of (fisler || [])) {
                // Eğer kalan ≈ indirimli_tutar ise → toplam_tutar'a güncelle
                if ((f.nakit_indirim_yuzde || 0) > 0 && Math.abs((f.kalan || 0) - (f.indirimli_tutar || 0)) < 1) {
                  await supabase.from("kt_fisler").update({ kalan: f.toplam_tutar }).eq("id", f.id);
                  sayac++;
                }
              }
              toast(sayac + " fiş güncellendi!", "basari");
            }} style={{ ...abtn, width: "100%" }}>
              🔧 Eski Fişleri Otomatik Düzelt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export function KTHazirlamaEkrani({ kullanici }) {
  const [barkodInput, setBarkodInput] = useState("");
  const [fisNoInput, setFisNoInput] = useState("");
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState(null);
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mod, setMod] = useState("barkod"); // "barkod" | "fisno"
  const [waModal, setWaModal] = useState(false);
  const [waMesajlar, setWaMesajlar] = useState([]);
  const [waGonderilen, setWaGonderilen] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [mod]);

  // Liste anlık güncelleme - başka birileri hazırlarsa
  useRealtimeYenile(["kt_fis_kalemleri"], () => {
    setListe(prev => [...prev]); // trigger re-render işareti
  });

  const mesajGoster = (tip, text) => {
    setMesaj({ tip, text });
    setTimeout(() => setMesaj(null), 3000);
  };

  const barkodOkut = async (e) => {
    if (e.key !== "Enter" && e.type !== "click") return;
    const val = barkodInput.trim();
    if (!val) return;
    setBarkodInput("");
    setYukleniyor(true);

    try {
      const { data: kalem } = await supabase
        .from("kt_fis_kalemleri")
        .select("*, kt_fisler(id, fis_no, barkod, musteri_id, musteriler(ad_soyad, telefon))")
        .eq("barkod", val)
        .maybeSingle();

      if (!kalem) {
        mesajGoster("hata", `❌ Barkod bulunamadı: "${val}"`);
        setYukleniyor(false);
        inputRef.current?.focus();
        return;
      }

      if (kalem.durum === "teslim_edildi") {
        mesajGoster("uyari", `⚠️ "${kalem.urun_adi}" zaten teslim edildi - yoksayıldı.`);
        setYukleniyor(false);
        inputRef.current?.focus();
        return;
      }

      if (kalem.durum === "hazir") {
        mesajGoster("uyari", `⚠️ "${kalem.urun_adi}" zaten hazır - yoksayıldı.`);
        setYukleniyor(false);
        inputRef.current?.focus();
        return;
      }

      if (liste.find(x => x.kalemId === kalem.id)) {
        mesajGoster("uyari", `⚠️ "${kalem.urun_adi}" zaten listede - yoksayıldı.`);
        setYukleniyor(false);
        inputRef.current?.focus();
        return;
      }

      const fis = kalem.kt_fisler;
      setListe(prev => [...prev, {
        kalemId: kalem.id,
        fisId: fis?.id || kalem.fis_id,
        urunAdi: kalem.urun_adi,
        renk: kalem.renk,
        fisNo: fis?.fis_no,
        fisBarkod: fis?.barkod,
        musteriAd: fis?.musteriler?.ad_soyad,
        musteriTel: fis?.musteriler?.telefon,
        hizmetler: (() => { try { return JSON.parse(kalem.hizmet_bilgi || "[]"); } catch { return []; } })(),
      }]);
      mesajGoster("basari", `✅ "${kalem.urun_adi}" eklendi - #${fis?.fis_no || "-"} - ${fis?.musteriler?.ad_soyad || "?"}`);
    } catch {
      mesajGoster("hata", "❌ Bir hata oluştu, tekrar deneyin.");
    }
    setYukleniyor(false);
    inputRef.current?.focus();
  };

  // Fiş no ile tüm ürünleri ekle
  const fisNoEkle = async (e) => {
    if (e.key !== "Enter" && e.type !== "click") return;
    const val = fisNoInput.trim();
    if (!val) return;
    setFisNoInput("");
    setYukleniyor(true);
    try {
      const { data: fis } = await supabase
        .from("kt_fisler")
        .select("id, fis_no, barkod, musteri_id, musteriler(ad_soyad, telefon)")
        .or(`fis_no.eq.${val},barkod.eq.${val}`)
        .maybeSingle();
      if (!fis) { mesajGoster("hata", `❌ Fiş bulunamadı: "#${val}"`); setYukleniyor(false); inputRef.current?.focus(); return; }

      const { data: kalemler } = await supabase
        .from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);

      let eklendi = 0, yoksayildi = 0;
      for (const kalem of (kalemler || [])) {
        if (kalem.durum === "teslim_edildi" || kalem.durum === "hazir") { yoksayildi++; continue; }
        if (liste.find(x => x.kalemId === kalem.id)) { yoksayildi++; continue; }
        setListe(prev => [...prev, {
          kalemId: kalem.id, fisId: fis.id,
          urunAdi: kalem.urun_adi, renk: kalem.renk,
          fisNo: fis.fis_no, fisBarkod: fis.barkod,
          musteriAd: fis.musteriler?.ad_soyad, musteriTel: fis.musteriler?.telefon,
          hizmetler: (() => { try { return JSON.parse(kalem.hizmet_bilgi || "[]"); } catch { return []; } })(),
        }]);
        eklendi++;
      }
      if (eklendi > 0) mesajGoster("basari", `✅ #${fis.fis_no} - ${fis.musteriler?.ad_soyad || "?"} - ${eklendi} ürün eklendi${yoksayildi > 0 ? `, ${yoksayildi} yoksayıldı` : ""}`);
      else mesajGoster("uyari", `⚠️ #${fis.fis_no} - Eklenecek ürün yok (zaten hazır veya teslim edildi).`);
    } catch { mesajGoster("hata", "❌ Bir hata oluştu."); }
    setYukleniyor(false);
    inputRef.current?.focus();
  };

  const hazirIsaretle = async () => {
    setYukleniyor(true);
    // Müşteri bazında grupla
    const musteriGrubu = {};
    for (const item of liste) {
      const key = item.musteriTel || item.musteriAd || "bos";
      if (!musteriGrubu[key]) musteriGrubu[key] = { ad: item.musteriAd, tel: item.musteriTel, urunler: [], fisNolar: new Set() };
      musteriGrubu[key].urunler.push(item.urunAdi);
      musteriGrubu[key].fisNolar.add(item.fisNo);
    }

    // Hepsini hazır işaretle
    for (const item of liste) {
      await supabase.from("kt_fis_kalemleri").update({ durum: "hazir" }).eq("id", item.kalemId);
      const { data: tumKalemler } = await supabase.from("kt_fis_kalemleri").select("durum").eq("fis_id", item.fisId);
      const hepsiHazir = (tumKalemler || []).every(k => k.durum === "hazir" || k.durum === "teslim_edildi");
      if (hepsiHazir) {
        await supabase.from("kt_fisler").update({ durum: "hazir" }).eq("id", item.fisId);
      }
    }

    // WA mesajlarını hazırla - modal ile göster
    const waMesajlar = Object.values(musteriGrubu)
      .filter(m => m.tel)
      .map(m => {
        const tel = m.tel.replace(/\D/g, "").replace(/^0/, "");
        const urunListesi = [...new Set(m.urunler)].join(", ");
        const fisListesi = [...m.fisNolar].map(n => `#${n}`).join(", ");
        const qrLink = window.location.origin + '/?musteri=' + [...m.fisNolar][0];
        const metin = `Sayın ${m.ad || "Müşterimiz"}, ${urunListesi} hazır, teslim alabilirsiniz. (Fiş: ${fisListesi}) İyi günler dileriz.\n\nSipariş durumunuz: ${qrLink}`;
        return { ad: m.ad, tel, metin, url: `whatsapp://send?phone=90${tel}&text=${encodeURIComponent(metin)}` };
      });

    const adet = liste.length;
    setListe([]);
    setOnay(false);
    setYukleniyor(false);

    if (waMesajlar.length > 0) {
      setWaMesajlar(waMesajlar);
      setWaModal(true);
    } else {
      mesajGoster("basari", `🎉 ${adet} ürün hazır işaretlendi!`);
    }
    inputRef.current?.focus();
  };

  const listeSil = (kalemId) => setListe(liste.filter(x => x.kalemId !== kalemId));

  return (
    <div>
      <h2 style={{ color: "#111", marginTop: 0 }}>🏷️ Hazırlanan Fişler</h2>

      {/* WhatsApp Gönder Modalı */}
      {waModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: 420, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ color: "#111", margin: 0 }}>📱 WhatsApp Bildirimleri</h3>
              <button onClick={() => { setWaModal(false); setWaGonderilen([]); mesajGoster("basari", "✅ Ürünler hazır işaretlendi!"); }} style={{ ...kbtn, fontSize: 12 }}>✕ Kapat</button>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#15803d" }}>
              💡 Her müşteri için "📤 Gönder" butonuna tıklayın - WhatsApp mesaj hazır açılır, sadece <strong>Gönder</strong>'e basın.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {waMesajlar.map((m, i) => {
                const gonderildi = waGonderilen.includes(i);
                return (
                  <div key={i} style={{ border: "1px solid " + (gonderildi ? "#bbf7d0" : "#e5e7eb"), borderRadius: 12, padding: 14, background: gonderildi ? "#f0fdf4" : "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>👤 {m.ad}</div>
                        <div style={{ color: "#888", fontSize: 12 }}>📞 {m.tel}</div>
                      </div>
                      {gonderildi
                        ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 12 }}>✅ Gönderildi</span>
                        : <a href={m.url} target="_blank" rel="noreferrer"
                            onClick={() => setWaGonderilen(prev => [...prev, i])}
                            style={{ background: "#25D366", color: "#fff", padding: "8px 16px", borderRadius: 20, textDecoration: "none", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                            📤 Gönder
                          </a>
                      }
                    </div>
                    {/* Mesaj önizleme - kopyalanabilir */}
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#555", lineHeight: 1.5, cursor: "pointer", border: "1px dashed #e5e7eb" }}
                      onClick={() => { navigator.clipboard?.writeText(m.metin); }}
                      title="Kopyalamak için tıkla">
                      {m.metin}
                      <div style={{ color: "#aaa", fontSize: 10, marginTop: 4 }}>📋 Metni kopyalamak için tıkla</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button onClick={() => {
                // Hepsini sırayla aç
                waMesajlar.forEach((m, i) => {
                  setTimeout(() => {
                    window.open(m.url, "_blank");
                    setWaGonderilen(prev => [...prev, i]);
                  }, i * 600);
                });
              }} style={{ ...abtn, flex: 1, background: "#25D366" }}>
                📤 Tümünü Gönder ({waMesajlar.length})
              </button>
              <button onClick={() => { setWaModal(false); setWaGonderilen([]); mesajGoster("basari", "✅ İşlem tamamlandı!"); }} style={{ ...kbtn }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setMod("barkod")} style={{ padding: "8px 18px", borderRadius: 20, border: "2px solid " + (mod === "barkod" ? "#e94560" : "#e5e7eb"), background: mod === "barkod" ? "#fef2f2" : "#fff", color: mod === "barkod" ? "#e94560" : "#555", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📟 Barkod Tara</button>
        <button onClick={() => setMod("fisno")} style={{ padding: "8px 18px", borderRadius: 20, border: "2px solid " + (mod === "fisno" ? "#2563eb" : "#e5e7eb"), background: mod === "fisno" ? "#eff6ff" : "#fff", color: mod === "fisno" ? "#2563eb" : "#555", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📋 Fiş No ile Ekle</button>
      </div>

      {/* Barkod Okutma */}
      {mod === "barkod" && (
        <div style={{ ...krt, marginBottom: 16 }}>
          <label style={{ ...lbl, fontSize: 13, color: "#444", fontWeight: 600, marginBottom: 10 }}>
            📟 Hazırladığınız ürünlerin barkodunu okutun
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              ref={inputRef}
              value={barkodInput}
              onChange={e => setBarkodInput(e.target.value)}
              onKeyDown={barkodOkut}
              placeholder="Barkod okuyucuyu buraya odaklayın ve tarayın..."
              style={{ ...inp, fontSize: 14, padding: "11px 14px" }}
              autoFocus
              disabled={yukleniyor}
            />
            <TelefonBarkodButon kaynak="hazirlama" onBarkod={(b) => { setBarkodInput(b); setTimeout(() => { const e = { key:"Enter", preventDefault:()=>{} }; barkodOkut(e); }, 200); }} />
            <button onClick={barkodOkut} style={{ ...abtn, whiteSpace: "nowrap" }} disabled={yukleniyor}>
              {yukleniyor ? "..." : "Ekle"}
            </button>
          </div>
          <div style={{ color: "#888", fontSize: 11, marginTop: 6 }}>
            💡 Barkod okuyucu Enter ile bitirir - otomatik eklenir. Manuel giriş için yazıp Enter'a basın. 📱 Telefon ile de tarayabilirsiniz.
          </div>
        </div>
      )}

      {/* Fiş No ile Ekle */}
      {mod === "fisno" && (
        <div style={{ ...krt, marginBottom: 16, borderColor: "#bfdbfe" }}>
          <label style={{ ...lbl, fontSize: 13, color: "#1d4ed8", fontWeight: 600, marginBottom: 10 }}>
            📋 Fiş numarasını girin - tüm ürünler listeye eklenir
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              ref={inputRef}
              value={fisNoInput}
              onChange={e => setFisNoInput(e.target.value)}
              onKeyDown={fisNoEkle}
              placeholder="Fiş no girin (örn: 001) ve Enter'a basın..."
              style={{ ...inp, fontSize: 14, padding: "11px 14px" }}
              autoFocus
              disabled={yukleniyor}
            />
            <button onClick={fisNoEkle} style={{ ...abtn, whiteSpace: "nowrap", background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }} disabled={yukleniyor}>
              {yukleniyor ? "..." : "Fişi Ekle"}
            </button>
          </div>
          <div style={{ color: "#888", fontSize: 11, marginTop: 6 }}>
            💡 Fişe ait henüz hazır olmayan tüm ürünler listeye eklenir. Zaten hazır/teslim edilmiş olanlar yoksayılır.
          </div>
        </div>
      )}

      {/* Geri Bildirim Mesajı */}
      {mesaj && (
        <div style={{
          padding: "10px 14px", borderRadius: 9, marginBottom: 14, fontSize: 13, fontWeight: 600,
          background: mesaj.tip === "basari" ? "#f0fdf4" : mesaj.tip === "hata" ? "#fef2f2" : "#fffbeb",
          color: mesaj.tip === "basari" ? "#16a34a" : mesaj.tip === "hata" ? "#dc2626" : "#92400e",
          border: "1px solid " + (mesaj.tip === "basari" ? "#bbf7d0" : mesaj.tip === "hata" ? "#fecaca" : "#fde68a"),
        }}>
          {mesaj.text}
        </div>
      )}

      {/* Liste */}
      {liste.length > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#555", fontSize: 13, fontWeight: 600 }}>
              {liste.length} ürün hazırlandı:
            </span>
            <button onClick={() => { setListe([]); setOnay(false); }} style={{ ...kbtn, fontSize: 11, color: "#dc2626" }}>
              🗑️ Listeyi Temizle
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {liste.map((item, i) => (
              <div key={item.kalemId} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#111", fontWeight: 700, fontSize: 13 }}>
                    {i + 1}. {item.urunAdi}{item.renk ? ` (${item.renk})` : ""}
                  </div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
                    📋 Fiş #{item.fisNo} &nbsp;|&nbsp; 👤 {item.musteriAd || "-"}
                    {item.musteriTel && <span style={{ color: "#888", marginLeft: 6 }}>📞 {item.musteriTel}</span>}
                  </div>
                  {item.hizmetler?.length > 0 && (
                    <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>
                      {item.hizmetler.map(h => h.hizmet_adi).join(" · ")}
                    </div>
                  )}
                </div>
                <button onClick={() => listeSil(item.kalemId)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, marginLeft: 10 }}>✕</button>
              </div>
            ))}
          </div>

          {/* Onay Akışı */}
          {!onay ? (
            <button onClick={() => setOnay(true)} style={{ ...abtn, width: "100%", padding: 14, fontSize: 15 }}>
              ✅ Hazır Olarak İşaretle ({liste.length} ürün)
            </button>
          ) : (
            <div style={{ ...krt, background: "#fffbeb", border: "2px solid #fde68a" }}>
              <div style={{ color: "#92400e", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                🤔 Bu ürünlerin hazır olduğundan emin misiniz?
              </div>
              <div style={{ color: "#78350f", fontSize: 13, marginBottom: 6 }}>
                <strong>{liste.length} ürün</strong> hazır işaretlenecek.
              </div>
              <div style={{ color: "#78350f", fontSize: 13, marginBottom: 16 }}>
                📱 Telefon numarası olan müşterilere otomatik <strong>WhatsApp bildirimi</strong> gönderilecek.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={hazirIsaretle} disabled={yukleniyor} style={{ ...abtn, flex: 1, padding: 13, fontSize: 14 }}>
                  ✅ Evet, Hazırlandı!
                </button>
                <button onClick={() => setOnay(false)} style={{ ...kbtn, flex: 1, padding: 13, fontSize: 14 }}>
                  ❌ Hayır, Geri Dön
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        !mesaj && (
          <div style={{ textAlign: "center", padding: "50px 20px", background: "#f9fafb", borderRadius: 14, border: "2px dashed #e5e7eb" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📟</div>
            <div style={{ color: "#555", fontSize: 15, fontWeight: 600 }}>Barkod okutmaya başlayın</div>
            <div style={{ color: "#aaa", fontSize: 13, marginTop: 6 }}>Hazırladığınız her ürünün barkodunu tarayın, liste burada oluşur</div>
          </div>
        )
      )}
    </div>
  );
}

// ===== MÜŞTERİ DURUM SAYFASI (QR ile açılan - login gerekmez) =====
export function KTMusteriSayfasi({ token }) {
  const [fis, setFis] = useState(null);
  const [kalemler, setKalemler] = useState([]);
  const [gemisFisler, setGecmisFisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [firmaAdi, setFirmaAdi] = useState("Kuru Temizleme");
  const [firmaTel, setFirmaTel] = useState("");
  const [firmaAdres, setFirmaAdres] = useState("");
  const [firmaLogo, setFirmaLogo] = useState("");
  const [acikFisNo, setAcikFisNo] = useState(null);
  // AI özet
  const [aiOzet, setAiOzet] = useState("");
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  // AI chat
  const [chatAcik, setChatAcik] = useState(false);
  const [chatMesajlar, setChatMesajlar] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatGonderiyor, setChatGonderiyor] = useState(false);
  const chatAltRef = useRef(null);

  useEffect(() => {
    const yukle = async () => {
      try {
        // Firma ayarlarını yükle
        const { data: ayarlar } = await supabase.from("kt_ayarlar").select("*");
        const ay = {};
        (ayarlar || []).forEach(x => { ay[x.anahtar] = x.deger; });
        if (ay.firma_adi) setFirmaAdi(ay.firma_adi);
        if (ay.firma_telefon) setFirmaTel(ay.firma_telefon);
        if (ay.firma_adres) setFirmaAdres(ay.firma_adres);
        if (ay.firma_logo) setFirmaLogo(ay.firma_logo);

        const { data: f } = await supabase
          .from("kt_fisler")
          .select("*, musteriler(id, ad_soyad, telefon)")
          .or(`barkod.eq.${token},fis_no.eq.${token}`)
          .maybeSingle();

        if (!f) { setHata("Fiş bulunamadı. Lütfen barkodu kontrol edin."); setYukleniyor(false); return; }

        const { data: k } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", f.id);

        let gecmis = [];
        if (f.musteri_id) {
          const { data: gf } = await supabase
            .from("kt_fisler")
            .select("fis_no, toplam_tutar, indirimli_tutar, nakit_indirim_yuzde, kalan, durum, acilis_tarihi, teslim_tarihi, barkod, odeme_turu")
            .eq("musteri_id", f.musteri_id)
            .neq("durum", "iptal_edildi")
            .order("acilis_tarihi", { ascending: false })
            .limit(11);
          gecmis = (gf || []).filter(x => x.fis_no !== f.fis_no);
        }

        setFis(f);
        setKalemler(k || []);
        setGecmisFisler(gecmis);

        // Sayfa açılınca otomatik AI özet oluştur
        setTimeout(() => aiOzetOlustur(f, gecmis, k || []), 800);

      } catch {
        setHata("Yüklenirken bir hata oluştu.");
      }
      setYukleniyor(false);
    };
    yukle();
  }, [token]);

  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04" };
  const dy = { bekliyor: "Bekliyor", hazir: "✅ Hazır", teslim_edildi: "📦 Teslim Edildi", kismi_teslim: "⚡ Kısmi" };

  const aiSistemPrompt = (f, gecmis, k) => {
    if (!f) return "";
    const urunler = (k||[]).map(x => x.urun_adi + (x.renk ? ` (${x.renk})` : "") + " x" + (x.toplam_adet||x.adet||1)).join(", ");
    const durumYaz = (d) => ({bekliyor:"hazırlanıyor",hazir:"hazır, teslim alabilir",teslim_edildi:"teslim edildi",kismi_teslim:"kısmen teslim edildi"}[d]||d);
    const odemeYaz = (o) => ({nakit:"Nakit",kredi_karti:"Kredi Kartı",havale:"Havale",teslimde:"Teslimde Ödeme"}[o]||o);

    const gecmisBilgi = (gecmis||[]).slice(0,8).map(x => {
      const odendi = (x.kalan||0) <= 0 ? "✅ Ödendi" : `❌ Borç: ${x.kalan}₺`;
      return `  - Fiş #${x.fis_no} | ${durumYaz(x.durum)} | Toplam: ${x.toplam_tutar}₺${(x.nakit_indirim_yuzde||0)>0?` | Nakite Özel: ${x.indirimli_tutar}₺`:""} | ${odendi}`;
    }).join("\n");

    const mevcutBorc = (f.kalan||0);
    const mevcutNakit = (f.nakit_indirim_yuzde||0)>0 ? f.indirimli_tutar : null;

    return `Sen ${firmaAdi} kuru temizleme dükkanının nazik ve yardımsever müşteri hizmetleri asistanısın.
Türkçe konuş. Her zaman kibar, anlayışlı ve profesyonel ol. "Sayın [ad]" diye hitap et.
SADECE aşağıdaki kesin verilere göre cevap ver. Tahminde bulunma, uydurma.

=== MÜŞTERİ BİLGİLERİ ===
Ad: ${f.musteriler?.ad_soyad || "Değerli Müşterimiz"}

=== MEVCUT FİŞ (#${f.fis_no}) ===
Durum: ${durumYaz(f.durum)}
Ürünler: ${urunler || "-"}
Açılış: ${new Date(f.acilis_tarihi).toLocaleDateString("tr-TR")}
${f.planlanan_teslim ? `Planlanan Teslim: ${new Date(f.planlanan_teslim).toLocaleDateString("tr-TR")}` : ""}
Toplam Tutar: ${f.toplam_tutar}₺
${mevcutNakit ? `Nakite Özel Fiyat: ${mevcutNakit}₺ (%${f.nakit_indirim_yuzde} indirim)` : ""}
Ödeme Türü: ${odemeYaz(f.odeme_turu)}
Kalan Borç: ${mevcutBorc}₺

=== ÖNCEKİ FİŞLER ===
${gecmisBilgi || "Geçmiş fiş yok."}

=== ÖNEMLİ KURALLAR ===
- Sadece yukarıdaki verileri kullan. Bilmiyorsan "Dükkânımızı arayarak öğrenebilirsiniz" de.
- Ödeme tutarlarını kesinlikle karıştırma. Her fişin borcu ayrıdır.
- Nakit indirim sadece nakit ödeme yapılırsa geçerlidir.
- Müşteriyi asla yanlış yönlendirme.`;
  };

  const aiOzetOlustur = async (f, gecmis, k) => {
    if (!f) return;
    setAiYukleniyor(true);
    try {
      const sistem = aiSistemPrompt(f, gecmis, k);
      const prompt = `Müşteriye samimi ve nazik bir karşılama mesajı yaz. Sipariş durumunu belirt. Varsa ödeme bilgisini ve teslim tarihini ekle. Maksimum 2-3 cümle. "Sayın [ad]" ile başla.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: sistem, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const ozet = data.content?.[0]?.text || "";
      if (ozet) {
        setAiOzet(ozet);
        setChatMesajlar([{ rol: "assistant", icerik: ozet }]);
      }
    } catch {}
    setAiYukleniyor(false);
  };

  const chatGonder = async () => {
    if (!chatInput.trim() || chatGonderiyor) return;
    const yeniMesaj = { rol: "user", icerik: chatInput.trim() };
    const guncellenmis = [...chatMesajlar, yeniMesaj];
    setChatMesajlar(guncellenmis);
    setChatInput("");
    setChatGonderiyor(true);
    try {
      const sistem = aiSistemPrompt(fis, gemisFisler, kalemler);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: sistem,
          messages: guncellenmis.map(m => ({ role: m.rol === "user" ? "user" : "assistant", content: m.icerik })),
        }),
      });
      const data = await res.json();
      const cevap = data.content?.[0]?.text || "Bir hata oluştu.";
      setChatMesajlar(prev => [...prev, { rol: "assistant", icerik: cevap }]);
    } catch {
      setChatMesajlar(prev => [...prev, { rol: "assistant", icerik: "Bağlantı hatası, tekrar deneyin." }]);
    }
    setChatGonderiyor(false);
    setTimeout(() => chatAltRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Gerçek kalan: eski fişlerde kalan=indirimli kaydedilmişse, toplam_tutar'ı kullan
  const gercekKalan = (f) => {
    if (!f) return 0;
    const k = +(f.kalan || 0);
    const ind = +(f.indirimli_tutar || 0);
    const top = +(f.toplam_tutar || 0);
    const yuzde = +(f.nakit_indirim_yuzde || 0);
    if (k > 0 && yuzde > 0 && Math.abs(k - ind) < 1) return top || k;
    return k;
  };
  const toplamBorc = [fis, ...gemisFisler].filter(Boolean).reduce((t, f) => t + gercekKalan(f), 0);
  const toplamBrut = [fis, ...gemisFisler].filter(Boolean).reduce((t, f) => t + (f?.toplam_tutar || 0), 0);
  // Toplam tasarruf: tüm fişlerde verilen nakit indirimleri (kalan=0 olmuş fişler)
  const toplamTasarruf = [fis, ...gemisFisler].filter(Boolean).reduce((t, f) => {
    const yuzde = +(f.nakit_indirim_yuzde || 0);
    const kalan = +(f.kalan || 0);
    const top = +(f.toplam_tutar || 0);
    const ind = +(f.indirimli_tutar || 0);
    if (yuzde > 0 && kalan <= 0 && ind > 0 && top > ind) {
      return t + (top - ind);
    }
    return t;
  }, 0);

  if (yukleniyor) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><div style={{ color: "#555" }}>Yükleniyor...</div></div>
    </div>
  );

  if (hata) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fff1f2,#ffe4e6)", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 48, marginBottom: 12 }}>❌</div><div style={{ color: "#dc2626", fontWeight: 600, fontSize: 16 }}>{hata}</div></div>
    </div>
  );

  const krt2 = { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f9ff,#e0f2fe,#f8fafc)", fontFamily: "'Segoe UI', sans-serif", padding: "20px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Firma Başlığı */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 10 }}>
          {firmaLogo
            ? <img src={firmaLogo} alt="logo" style={{ maxHeight: 70, maxWidth: 200, objectFit: "contain", marginBottom: 10, display: "block", margin: "0 auto 10px" }} />
            : <div style={{ fontSize: 44, marginBottom: 6 }}>👔</div>
          }
          <h1 style={{ color: "#0f172a", fontSize: 22, margin: "4px 0 2px", fontWeight: 800 }}>{firmaAdi}</h1>
          {firmaTel && <div style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>📞 {firmaTel}</div>}
          {firmaAdres && <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>📍 {firmaAdres}</div>}
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, padding: "4px 12px", background: "#f1f5f9", borderRadius: 20, display: "inline-block" }}>Sipariş Durumunuz</div>

          {/* Sesli Bilgi Butonu */}
          <div style={{ marginTop: 14 }}>
            <button onClick={() => {
              const ad = fis.musteriler?.ad_soyad || "Müşterimiz";
              const fisNo = fis.fis_no;
              const durum = fis.durum;
              const tumAcikFisler = [fis, ...gemisFisler].filter(f => f && gercekKalan(f) > 0);
              const toplamAcikBorc = tumAcikFisler.reduce((t, f) => t + gercekKalan(f), 0);
              const toplamNakiteOzel = tumAcikFisler.reduce((t, f) => t + ((f.nakit_indirim_yuzde||0)>0 ? (f.indirimli_tutar||0) : gercekKalan(f)), 0);
              const toplamNakitTasarruf = tumAcikFisler.reduce((t, f) => t + ((f.nakit_indirim_yuzde||0)>0 ? gercekKalan(f) - (f.indirimli_tutar||0) : 0), 0);
              const tl = (n) => {
                const tam = Math.floor(n);
                const kurus = Math.round((n - tam) * 100);
                return kurus === 0 ? tam.toLocaleString("tr-TR") + " Türk lirası" : n.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " Türk lirası";
              };
              let mesaj = `Sayın ${ad}. `;
              if (durum === "hazir") mesaj += `${fisNo} numaralı siparişiniz hazırdır, teslim alabilirsiniz. `;
              else if (durum === "teslim_edildi") mesaj += `${fisNo} numaralı siparişiniz teslim edilmiştir. `;
              else if (durum === "bekliyor") mesaj += `${fisNo} numaralı siparişiniz hazırlanmaktadır. `;
              if (toplamAcikBorc > 0) {
                mesaj += `Toplam açık bakiyeniz ${tl(toplamAcikBorc)}. `;
                if (toplamNakitTasarruf > 0) {
                  mesaj += `Nakit ödeme yaparsanız ${tl(toplamNakiteOzel)} ödeyeceksiniz. `;
                  mesaj += `Bu sayede ${tl(toplamNakitTasarruf)} tasarruf etmiş olursunuz. `;
                }
              } else {
                mesaj += `Tüm ödemeleriniz tamamlanmıştır. `;
                if (toplamTasarruf > 0) mesaj += `Toplam ${tl(toplamTasarruf)} tasarruf ettiniz. `;
              }
              mesaj += `İyi günler dileriz.`;
              const VOICE_RSS_KEY = "bdcd20d43df648b08d3ce7fa27a1b52c";

              // Mobil için AudioContext unlock (kullanıcı dokunuşu var, güvenli)
              const audioCtxUnlock = () => {
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  const buf = ctx.createBuffer(1, 1, 22050);
                  const src = ctx.createBufferSource();
                  src.buffer = buf;
                  src.connect(ctx.destination);
                  src.start(0);
                } catch {}
              };
              audioCtxUnlock();

              // 1. Web Speech API (hem PC hem mobil Chrome/Android'da çalışır)
              if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const konusma = new SpeechSynthesisUtterance(mesaj);
                konusma.lang = "tr-TR";
                konusma.rate = 0.85;
                konusma.pitch = 1.2;
                const sesOku = () => {
                  const sesler = window.speechSynthesis.getVoices();
                  const ses = sesler.find(v => v.name.includes("Filiz"))
                    || sesler.find(v => v.lang.startsWith("tr") && v.name.toLowerCase().includes("female"))
                    || sesler.find(v => v.lang === "tr-TR")
                    || sesler.find(v => v.lang.startsWith("tr"));
                  if (ses) konusma.voice = ses;
                  window.speechSynthesis.speak(konusma);
                };
                // Sesler yüklü değilse bekle
                if (window.speechSynthesis.getVoices().length > 0) {
                  sesOku();
                } else {
                  window.speechSynthesis.onvoiceschanged = () => { sesOku(); };
                  // 500ms sonra yüklenmediyse dene
                  setTimeout(() => {
                    if (window.speechSynthesis.getVoices().length === 0) sesOku();
                  }, 500);
                }
                return;
              }

              // 2. ResponsiveVoice yedek
              if (window.responsiveVoice && window.responsiveVoice.voiceSupport()) {
                window.responsiveVoice.speak(mesaj, "Turkish Female", { rate: 0.9, pitch: 1 });
                return;
              }

              // 3. VoiceRSS yedek (mobilde çalışmayabilir ama deneyelim)
              if (VOICE_RSS_KEY) {
                const url = "https://api.voicerss.org/?key=" + VOICE_RSS_KEY + "&hl=tr-tr&v=Filiz&r=-1&c=mp3&f=44khz_16bit_stereo&src=" + encodeURIComponent(mesaj);
                const audio = new Audio(url);
                audio.play().catch(() => {
                  // Mobilde bloklandıysa linki aç
                  window.open(url, "_blank");
                });
              }
            }}
              style={{ background: "linear-gradient(135deg,#db2777,#be185d)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, margin: "0 auto", boxShadow: "0 4px 12px rgba(190,24,93,0.3)" }}>
              🔊 Sesli Bilgi Al
            </button>
          </div>

          {/* AI Asistan Butonu */}
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setChatAcik(true)}
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, margin: "0 auto", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              🤖 Asistana Sor
            </button>
          </div>
        </div>

        {/* AI Otomatik Özet */}
        {(aiYukleniyor || aiOzet) && (
          <div style={{ background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", border: "1px solid #bae6fd", borderRadius: 16, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>🤖</div>
            <div>
              {aiYukleniyor
                ? <div style={{ color: "#0369a1", fontSize: 13 }}>⏳ Siparişiniz analiz ediliyor...</div>
                : <div style={{ color: "#0c4a6e", fontSize: 13, lineHeight: 1.6 }}>{aiOzet}</div>
              }
            </div>
          </div>
        )}

        {/* AI Chat Modal */}
        {chatAcik && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, height: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>🤖 Asistan</div>
                <button onClick={() => setChatAcik(false)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, color: "#555" }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {chatMesajlar.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.rol === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.rol === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.rol === "user" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#f3f4f6", color: m.rol === "user" ? "#fff" : "#111", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {m.icerik}
                    </div>
                  </div>
                ))}
                {chatGonderiyor && <div style={{ display: "flex" }}><div style={{ background: "#f3f4f6", borderRadius: 18, padding: "10px 14px", fontSize: 18 }}>⏳</div></div>}
                <div ref={chatAltRef} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && chatGonder()}
                  placeholder="Soru sor..." style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", color: "#111" }} />
                <button onClick={chatGonder} disabled={chatGonderiyor || !chatInput.trim()}
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: 24, padding: "10px 18px", fontWeight: 700, cursor: "pointer", opacity: chatGonderiyor || !chatInput.trim() ? 0.5 : 1 }}>
                  Gönder
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={krt2}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "#111", fontWeight: 700, fontSize: 17 }}>👤 {fis.musteriler?.ad_soyad}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>📋 Fiş No: #{fis.fis_no}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>📅 {new Date(fis.acilis_tarihi).toLocaleDateString("tr-TR")}</div>
              {fis.planlanan_teslim && (
                <div style={{ color: "#d97706", fontSize: 13 }}>🎯 Planlanan: {new Date(fis.planlanan_teslim).toLocaleDateString("tr-TR")}</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: fis.durum === "hazir" ? "#f0fdf4" : fis.durum === "teslim_edildi" ? "#eff6ff" : "#fffbeb", color: dc[fis.durum] || "#888", fontWeight: 700, border: "1px solid " + (fis.durum === "hazir" ? "#bbf7d0" : fis.durum === "teslim_edildi" ? "#bfdbfe" : "#fde68a") }}>
                {dy[fis.durum] || fis.durum}
              </div>
            </div>
          </div>
        </div>

        {/* Ürünler */}
        <div style={krt2}>
          <h3 style={{ color: "#111", margin: "0 0 14px", fontSize: 15 }}>🧺 Ürünleriniz</h3>
          {kalemler.map(k => {
            let hz = []; try { hz = JSON.parse(k.hizmet_bilgi || "[]"); } catch {}
            return (
              <div key={k.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#111", fontWeight: 600, fontSize: 14 }}>{k.urun_adi}{k.renk ? ` (${k.renk})` : ""} x{k.toplam_adet}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{hz.map(h => h.hizmet_adi).join(" · ")}</div>
                </div>
                <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 10,
                  background: k.durum === "hazir" ? "#f0fdf4" : k.durum === "teslim_edildi" ? "#eff6ff" : "#fffbeb",
                  color: dc[k.durum] || "#888",
                  border: "1px solid " + (k.durum === "hazir" ? "#bbf7d0" : k.durum === "teslim_edildi" ? "#bfdbfe" : "#fde68a") }}>
                  {dy[k.durum] || "Bekliyor"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Ödeme Durumu */}
        <div style={krt2}>
          <h3 style={{ color: "#111", margin: "0 0 14px", fontSize: 15 }}>💳 Son Fiş - #{fis.fis_no}</h3>

          {/* 1. Nakite özel fiyat (sadece indirim varsa) */}
          {(fis.nakit_indirim_yuzde || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, marginBottom: 8 }}>
              <div>
                <div style={{ color: "#15803d", fontSize: 13, fontWeight: 700 }}>💵 Nakite Özel Fiyat</div>
                <div style={{ color: "#16a34a", fontSize: 11 }}>%{fis.nakit_indirim_yuzde} indirim (-{para((fis.toplam_tutar||0)-(fis.indirimli_tutar||0))})</div>
              </div>
              <span style={{ color: "#15803d", fontWeight: 900, fontSize: 20 }}>{para(fis.indirimli_tutar)}</span>
            </div>
          )}

          {/* 2. Net Toplam (her zaman tam fiyat) */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f1f5f9", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 10 }}>
            <span style={{ color: "#0f172a", fontSize: 15, fontWeight: 700 }}>NET TOPLAM</span>
            <span style={{ color: "#0f172a", fontWeight: 900, fontSize: 20 }}>{para(fis.toplam_tutar)}</span>
          </div>

          {/* 3. Kalan borç */}
          {gercekKalan(fis) > 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#fef2f2", borderRadius: 10, border: "2px solid #fecaca" }}>
              <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 15 }}>⚠️ Kalan Borç</span>
              <span style={{ color: "#dc2626", fontWeight: 900, fontSize: 22 }}>{para(gercekKalan(fis))}</span>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>✅ Ödeme Tamamlandı</span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>0,00 ₺</span>
            </div>
          )}

          {/* Toplam açık bakiye - sadece birden fazla açık fiş varsa göster */}
          {toplamBorc > 0 && toplamBorc !== gercekKalan(fis) && (() => {
            const borcluFisler = [fis, ...gemisFisler].filter(f => f && gercekKalan(f) > 0);
            const fisNolari = borcluFisler.map(f => "#" + f.fis_no).join(", ");
            return (
              <div style={{ marginTop: 14, padding: "14px 16px", background: "linear-gradient(135deg,#fef2f2,#ffe4e6)", border: "2px solid #f87171", borderRadius: 14, textAlign: "center" }}>
                <div style={{ color: "#991b1b", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>📊 TOPLAM AÇIK BAKİYE</div>
                <div style={{ color: "#dc2626", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{para(toplamBorc)}</div>
                <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>Birden fazla açık fişinizdeki toplam borç</div>
                <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, marginTop: 6, padding: "5px 10px", background: "rgba(255,255,255,0.6)", borderRadius: 8, display: "inline-block" }}>
                  📋 Borçlu fişler: {fisNolari}
                </div>
              </div>
            );
          })()}
          {toplamBorc === 0 && (
            <div style={{ marginTop: 10, padding: "18px 20px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 14, border: "2px solid #86efac", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <div style={{ color: "#15803d", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
                Tüm Fişler Ödenmiş
              </div>
              <div style={{ color: "#16a34a", fontSize: 13, marginBottom: 10 }}>
                Açık bakiyeniz bulunmamaktadır.
              </div>
              <div style={{ display: "inline-block", background: "#fff", borderRadius: 10, padding: "8px 24px", border: "1px solid #86efac" }}>
                <div style={{ color: "#888", fontSize: 11 }}>Kalan Bakiye</div>
                <div style={{ color: "#15803d", fontWeight: 900, fontSize: 24 }}>0,00 ₺</div>
              </div>
            </div>
          )}
        </div>

        {/* Geçmiş Fişler - Accordion */}
        {gemisFisler.length > 0 && (
          <div style={krt2}>
            <h3 style={{ color: "#111", margin: "0 0 6px", fontSize: 15 }}>
              📂 Önceki Siparişler
              <span style={{ color: "#888", fontSize: 12, fontWeight: 400, marginLeft: 8 }}>({gemisFisler.length} fiş)</span>
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "7px 12px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: 13, color: "#2563eb" }}>▶</span>
              <span style={{ color: "#1d4ed8", fontSize: 12 }}>Fiş detayını görmek için fişin yanındaki <strong>▶</strong> okuna tıklayın</span>
            </div>

            {/* Özet Kutusu */}
            {(() => {
              const odenmisFisler = gemisFisler.filter(f => (f.kalan || 0) === 0 && f.durum !== "iptal_edildi");
              const bekleyenFisler = gemisFisler.filter(f => (f.kalan || 0) > 0);
              const toplamNetToplam = gemisFisler.filter(f => f.durum !== "iptal_edildi").reduce((t, f) => t + (f.toplam_tutar || 0), 0);
              const toplamNakiteOzel = gemisFisler.filter(f => (f.nakit_indirim_yuzde || 0) > 0 && f.durum !== "iptal_edildi").reduce((t, f) => t + (f.indirimli_tutar || 0), 0);
              const toplamIndirim = gemisFisler.filter(f => (f.nakit_indirim_yuzde || 0) > 0 && (f.kalan || 0) === 0).reduce((t, f) => t + ((f.toplam_tutar || 0) - (f.indirimli_tutar || 0)), 0);
              const toplamBekleyenBorc = bekleyenFisler.reduce((t, f) => t + (f.kalan || 0), 0);
              const toplamOdenen = odenmisFisler.reduce((t, f) => t + ((f.nakit_indirim_yuzde || 0) > 0 ? (f.indirimli_tutar || 0) : (f.toplam_tutar || 0)), 0);

              return (
                <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #fecaca" }}>
                  {bekleyenFisler.length > 0 ? (
                    <div>
                      <div style={{ background: "#fef2f2", padding: "8px 14px", borderBottom: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 700 }}>⚠️ Ödenmemiş Fişler ({bekleyenFisler.length})</span>
                        <span style={{ color: "#dc2626", fontSize: 16, fontWeight: 900 }}>{para(toplamBekleyenBorc)}</span>
                      </div>
                      {bekleyenFisler.map(f => {
                        const ind = (f.nakit_indirim_yuzde || 0) > 0 ? (f.toplam_tutar || 0) - (f.indirimli_tutar || 0) : 0;
                        return (
                          <div key={f.fis_no} style={{ background: "#fff7f7", padding: "8px 14px", borderBottom: "1px solid #fecaca" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ color: "#111", fontSize: 12, fontWeight: 700 }}>#{f.fis_no} <span style={{ color: "#94a3b8", fontWeight: 400 }}>{new Date(f.acilis_tarihi).toLocaleDateString("tr-TR")}</span></span>
                              <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 800 }}>⚠️ {para(f.kalan)}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                              <span style={{ color: "#555" }}>Net: {para(f.toplam_tutar)}</span>
                              {ind > 0 && <span style={{ color: "#15803d" }}>💵 Nakit: {para(f.indirimli_tutar)}</span>}
                              {ind > 0 && <span style={{ color: "#16a34a" }}>🎁 İndirim: -{para(ind)}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: "#f0fdf4", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #86efac", borderRadius: 12 }}>
                      <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>✅ Tüm ödemeler tamamlanmış</span>
                      <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>0,00 ₺</span>
                    </div>
                  )}
                </div>
              );
            })()}
            {gemisFisler.map(f => {
              const indirim = (f.nakit_indirim_yuzde || 0) > 0 ? (f.toplam_tutar || 0) - (f.indirimli_tutar || 0) : 0;
              const nakit = (f.nakit_indirim_yuzde || 0) > 0 ? (f.indirimli_tutar || 0) : null;
              const odendi = (f.kalan || 0) === 0;
              const odenenTutar = odendi ? (indirim > 0 ? f.indirimli_tutar : f.toplam_tutar) : (f.toplam_tutar || 0) - (f.kalan || 0);
              const odemeTuru = f.odeme_turu === "nakit" ? "💵 Nakit" : f.odeme_turu === "kredi_karti" ? "💳 Kart" : f.odeme_turu === "havale" ? "🏦 Havale" : "";
              const acik = acikFisNo === f.fis_no;
              const durumRenk = { teslim_edildi: "#2563eb", hazir: "#16a34a", bekliyor: "#d97706", kismi_teslim: "#ca8a04" }[f.durum] || "#888";
              const durumYazi = { teslim_edildi: "Teslim Edildi", hazir: "Hazır", bekliyor: "Bekliyor", kismi_teslim: "Kısmi" }[f.durum] || f.durum;
              return (
                <div key={f.fis_no} style={{ marginBottom: 8, borderRadius: 12, border: "1px solid " + (acik ? "#bfdbfe" : "#f1f5f9"), overflow: "hidden" }}>
                  {/* Tıklanabilir başlık */}
                  <div onClick={() => setAcikFisNo(acik ? null : f.fis_no)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: acik ? "#eff6ff" : "#f9fafb", cursor: "pointer", userSelect: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8", display: "inline-block", transition: "transform 0.2s", transform: acik ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                      <div>
                        <span style={{ color: "#111", fontSize: 13, fontWeight: 700 }}>#{f.fis_no}</span>
                        <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 8 }}>{new Date(f.acilis_tarihi).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {odendi ? (
                        <div style={{ color: "#16a34a", fontSize: 12, fontWeight: 700 }}>✅ {para(odenenTutar)}</div>
                      ) : (
                        <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700 }}>⚠️ Borç: {para(gercekKalan(f))}</div>
                      )}
                      <span style={{ fontSize: 10, color: durumRenk, fontWeight: 600 }}>{durumYazi}</span>
                      <div style={{ marginTop: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                          background: odendi ? "#f0fdf4" : "#fef2f2",
                          color: odendi ? "#16a34a" : "#dc2626",
                          border: "1px solid " + (odendi ? "#86efac" : "#fecaca") }}>
                          {odendi ? "✅ Ödendi" : "❌ Ödenmedi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Açılır detay */}
                  {acik && (
                    <div style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #dbeafe" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>

                        {/* Net Toplam */}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                          <span style={{ color: "#555", fontSize: 13 }}>🧾 Net Toplam</span>
                          <span style={{ color: "#111", fontWeight: 700 }}>{para(f.toplam_tutar)}</span>
                        </div>

                        {/* Nakite Özel Fiyat */}
                        {nakit && (
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                            <span style={{ color: "#15803d", fontSize: 13 }}>💵 Nakite Özel Fiyat</span>
                            <span style={{ color: "#15803d", fontWeight: 700 }}>{para(nakit)}</span>
                          </div>
                        )}

                        {/* İndirim */}
                        {indirim > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", background: "#f0fdf4", borderRadius: 8 }}>
                            <span style={{ color: "#16a34a", fontSize: 12 }}>🎁 İndirim (%{f.nakit_indirim_yuzde})</span>
                            <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 12 }}>-{para(indirim)}</span>
                          </div>
                        )}

                        {/* Ödeme durumu */}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10,
                          background: odendi ? "#f0fdf4" : "#fef2f2",
                          border: "1px solid " + (odendi ? "#86efac" : "#fecaca"), marginTop: 2 }}>
                          <span style={{ color: odendi ? "#16a34a" : "#dc2626", fontSize: 13, fontWeight: 600 }}>
                            {odendi ? "✅ " + (odemeTuru || "") + " Ödendi" : "⚠️ Kalan Borç"}
                          </span>
                          <span style={{ color: odendi ? "#15803d" : "#dc2626", fontWeight: 900, fontSize: 15 }}>
                            {odendi ? para(odenenTutar) : para(gercekKalan(f))}
                          </span>
                        </div>

                        {/* Tasarruf */}
                        {indirim > 0 && odendi && (
                          <div style={{ padding: "8px 12px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 10, border: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#15803d", fontSize: 12, fontWeight: 600 }}>🎁 Bu fişte tasarrufunuz</span>
                            <span style={{ color: "#15803d", fontWeight: 900, fontSize: 16 }}>{para(indirim)}</span>
                          </div>
                        )}

                        {/* Teslim tarihi */}
                        {f.teslim_tarihi && (
                          <div style={{ color: "#94a3b8", fontSize: 11, textAlign: "right" }}>
                            📦 {new Date(f.teslim_tarihi).toLocaleDateString("tr-TR")} tarihinde teslim edildi
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tasarruf Kutusu */}
        {toplamTasarruf > 0 && (
          <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "2px solid #86efac", borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🎁</div>
            <div style={{ color: "#15803d", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Toplam Tasarrufunuz</div>
            <div style={{ color: "#15803d", fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>{para(toplamTasarruf)}</div>
            <div style={{ color: "#16a34a", fontSize: 12, marginTop: 6 }}>
              Nakit ödemelerinizde {[fis,...gemisFisler].filter(f => f && +(f.nakit_indirim_yuzde||0) > 0 && +(f.kalan||0) <= 0 && +(f.indirimli_tutar||0) > 0).length} fişte bu kadar tasarruf ettiniz 🙏
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, paddingBottom: 30, marginTop: 8 }}>
          🌸 {firmaAdi} · İşletme Yönetim Sistemi
        </div>
      </div>
    </div>
  );
}


// ===== FİŞ DÜZELTME (Açık: serbest, Kapalı: şifre) =====
export function KTFisDuzenle() {
  const [ara, setAra] = useState("");
  const [fisler, setFisler] = useState([]);
  const [secili, setSecili] = useState(null);
  const [kalemler, setKalemler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifreModal, setSifreModal] = useState(false);
  const [sifreInput, setSifreInput] = useState("");
  const [sifreHata, setSifreHata] = useState("");
  const [duzenlemeMod, setDuzenlemeMod] = useState(false);
  const [duzeltilmis, setDuzeltilmis] = useState({});
  const [kaydetMesaj, setKaydetMesaj] = useState("");
  // Şifre: admin123 (basit sabit şifre, ilerleyen versiyonda ayarlardan alınabilir)
  const GECMIS_SIFRE = "admin123";

  const fisAra = async () => {
    if (!ara.trim()) return;
    setYukleniyor(true);
    const { data } = await supabase.from("kt_fisler")
      .select("*, musteriler(ad_soyad, telefon)")
      .or(`fis_no.ilike.%${ara}%,barkod.ilike.%${ara}%`)
      .order("acilis_tarihi", { ascending: false })
      .limit(20);
    setFisler(data || []);
    setSecili(null);
    setYukleniyor(false);
  };

  const fisSec = async (fis) => {
    if (fis.durum === "teslim_edildi") {
      // Kapalı fiş - şifre gerekli
      setSifreModal(true);
      setSifreInput("");
      setSifreHata("");
      setDuzeltilmis({ _bekleyenFis: fis });
    } else {
      // Açık fiş - direkt aç
      await fisAc(fis);
    }
  };

  const [yeniKalemMod, setYeniKalemMod] = useState(false);
  const [yeniKalem, setYeniKalem] = useState({ urun_adi: "", renk: "", adet: 1, hizmet: "Kuru Temizleme", fiyat: "" });

  const fisAc = async (fis) => {
    setSecili(fis);
    setDuzenlemeMod(false);
    setKaydetMesaj("");
    setYeniKalemMod(false);
    const { data } = await supabase.from("kt_fis_kalemleri").select("*").eq("fis_id", fis.id);
    setKalemler(data || []);
    setDuzeltilmis({ toplam_tutar: fis.toplam_tutar, indirimli_tutar: fis.indirimli_tutar, kalan: fis.kalan, durum: fis.durum, planlanan_teslim: fis.planlanan_teslim?.slice(0,16), odeme_turu: fis.odeme_turu });
  };

  const sifreDogrula = async () => {
    if (sifreInput !== GECMIS_SIFRE) {
      setSifreHata("❌ Hatalı şifre!");
      return;
    }
    setSifreModal(false);
    const fis = duzeltilmis._bekleyenFis;
    await fisAc(fis);
  };

  const kaydet = async () => {
    if (!secili) return;
    const { _bekleyenFis, ...guncelleme } = duzeltilmis;
    await supabase.from("kt_fisler").update(guncelleme).eq("id", secili.id);
    setKaydetMesaj("✅ Değişiklikler kaydedildi!");
    setTimeout(() => setKaydetMesaj(""), 3000);
    setDuzenlemeMod(false);
    // Listeyi güncelle
    setFisler(fisler.map(f => f.id === secili.id ? { ...f, ...guncelleme } : f));
    setSecili({ ...secili, ...guncelleme });
  };

  const kalemDurumGuncelle = async (kalemId, yeniDurum) => {
    await supabase.from("kt_fis_kalemleri").update({ durum: yeniDurum }).eq("id", kalemId);
    setKalemler(kalemler.map(k => k.id === kalemId ? { ...k, durum: yeniDurum } : k));
  };

  const kalemSil = async (kalemId) => {
    if (!window.confirm("Bu ürünü fişten silmek istediğinizden emin misiniz?")) return;
    await supabase.from("kt_fis_kalemleri").delete().eq("id", kalemId);
    const yeniListe = kalemler.filter(k => k.id !== kalemId);
    setKalemler(yeniListe);
    // Toplam tutarı güncelle
    const yeniToplam = yeniListe.reduce((t, k) => {
      let hz = []; try { hz = JSON.parse(k.hizmet_bilgi || "[]"); } catch {}
      return t + hz.reduce((s, h) => s + (+h.fiyat || 0), 0);
    }, 0);
    await supabase.from("kt_fisler").update({ toplam_tutar: yeniToplam, kalan: yeniToplam }).eq("id", secili.id);
    setDuzeltilmis(d => ({ ...d, toplam_tutar: yeniToplam, kalan: yeniToplam }));
    setKaydetMesaj("✅ Ürün silindi!");
    setTimeout(() => setKaydetMesaj(""), 2500);
  };

  const kalemEkle = async () => {
    if (!yeniKalem.urun_adi.trim()) return toast("Ürün adı girin!", "uyari");
    if (!yeniKalem.fiyat || +yeniKalem.fiyat <= 0) return toast("Fiyat girin!", "uyari");
    const hizmetBilgi = JSON.stringify([{ hizmet_k: yeniKalem.hizmet.toLowerCase().replace(/\s/g,"_"), hizmet_adi: yeniKalem.hizmet, fiyat: +yeniKalem.fiyat }]);
    const { data: yeni } = await supabase.from("kt_fis_kalemleri").insert({
      fis_id: secili.id,
      barkod: Math.random().toString(36).slice(2,8).toUpperCase(),
      urun_adi: yeniKalem.urun_adi.trim(),
      renk: yeniKalem.renk || null,
      toplam_adet: +yeniKalem.adet || 1,
      hizmet_bilgi: hizmetBilgi,
      durum: "bekliyor"
    }).select().single();
    const yeniListe = [...kalemler, yeni];
    setKalemler(yeniListe);
    // Toplam güncelle
    const yeniToplam = (duzeltilmis.toplam_tutar || 0) + (+yeniKalem.fiyat);
    await supabase.from("kt_fisler").update({ toplam_tutar: yeniToplam, kalan: yeniToplam }).eq("id", secili.id);
    setDuzeltilmis(d => ({ ...d, toplam_tutar: yeniToplam, kalan: yeniToplam }));
    setYeniKalem({ urun_adi: "", renk: "", adet: 1, hizmet: "Kuru Temizleme", fiyat: "" });
    setYeniKalemMod(false);
    setKaydetMesaj("✅ Ürün eklendi!");
    setTimeout(() => setKaydetMesaj(""), 2500);
  };

  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };

  return (
    <div>
      <h2 style={{ color: "#111", marginTop: 0 }}>✏️ Fiş Düzeltme</h2>
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e" }}>
        🔓 Açık fişler serbestçe düzenlenebilir &nbsp;|&nbsp; 🔒 Teslim edilmiş fişler için şifre gereklidir
      </div>

      {/* Arama */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input value={ara} onChange={e => setAra(e.target.value)} onKeyDown={e => e.key === "Enter" && fisAra()}
          placeholder="Fiş no, barkod ara..." style={{ ...inp, flex: 1 }} />
        <TelefonBarkodButon kaynak="fis_duzenle" onBarkod={(b) => { setAra(b); setTimeout(fisAra, 200); }} />
        <button onClick={fisAra} style={abtn} disabled={yukleniyor}>🔍 Ara</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: secili ? "280px 1fr" : "1fr", gap: 20 }}>
        {/* Fiş Listesi */}
        <div>
          {fisler.map(f => (
            <div key={f.id} onClick={() => fisSec(f)}
              style={{ background: secili?.id === f.id ? "#fef2f2" : "#fff", border: "1px solid " + (secili?.id === f.id ? "#fca5a5" : "#e5e7eb"), borderRadius: 10, padding: "10px 14px", marginBottom: 8, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#111" }}>#{f.fis_no}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "#f3f4f6", color: dc[f.durum] || "#888" }}>{dy[f.durum] || f.durum}</span>
              </div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 3 }}>{f.musteriler?.ad_soyad} - {tarih(f.acilis_tarihi)}</div>
              {f.durum === "teslim_edildi" && <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>🔒 Şifre gerekli</div>}
            </div>
          ))}
          {!fisler.length && ara && <p style={{ color: "#aaa", fontSize: 13 }}>Fiş bulunamadı.</p>}
        </div>

        {/* Düzenleme Paneli */}
        {secili && (
          <div style={krt}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#111", margin: 0 }}>Fiş #{secili.fis_no}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {!duzenlemeMod ? (
                  <button onClick={() => setDuzenlemeMod(true)} style={{ ...kbtn, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>✏️ Düzenle</button>
                ) : (
                  <>
                    <button onClick={kaydet} style={{ ...abtn }}>💾 Kaydet</button>
                    <button onClick={() => setDuzenlemeMod(false)} style={kbtn}>İptal</button>
                    <button onClick={async () => {
                      if (!window.confirm(`#${secili.fis_no} fişini İPTAL et?\nTüm tutarlar sıfırlanır, müşteri geçmişinde "İptal Edildi" görünür.`)) return;
                      await supabase.from("kt_fis_kalemleri").delete().eq("fis_id", secili.id);
                      await supabase.from("kt_fisler").update({ durum: "iptal_edildi", toplam_tutar: 0, indirimli_tutar: 0, kalan: 0, nakit_indirim_yuzde: 0, teslim_tarihi: null }).eq("id", secili.id);
                      setKaydetMesaj("🚫 Fiş iptal edildi.");
                      setDuzenlemeMod(false);
                      setFisler(fisler.map(f => f.id === secili.id ? { ...f, durum: "iptal_edildi" } : f));
                    }} style={{ ...kbtn, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>🚫 İptal Et</button>
                  </>
                )}
                <button onClick={() => setSecili(null)} style={kbtn}>✕</button>
              </div>
            </div>
            {kaydetMesaj && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: "#16a34a", fontSize: 13 }}>{kaydetMesaj}</div>}

            {duzenlemeMod ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={lbl}>Durum</label>
                  <select value={duzeltilmis.durum || ""} onChange={e => setDuzeltilmis({...duzeltilmis, durum: e.target.value})} style={{ ...inp, color: "#222", background: "#fff" }}>
                    <option value="bekliyor">Bekliyor</option>
                    <option value="hazir">Hazır</option>
                    <option value="kismi_teslim">Kısmi Teslim</option>
                    <option value="teslim_edildi">Teslim Edildi</option>
                  </select>
                </div>
                <div><label style={lbl}>Planlanan Teslim Tarihi</label>
                  <input type="datetime-local" value={duzeltilmis.planlanan_teslim || ""} onChange={e => setDuzeltilmis({...duzeltilmis, planlanan_teslim: e.target.value})} style={{ ...inp, color: "#222" }} />
                </div>
                <div><label style={lbl}>Toplam Tutar (₺)</label>
                  <input type="number" value={duzeltilmis.toplam_tutar || 0} onChange={e => setDuzeltilmis({...duzeltilmis, toplam_tutar: +e.target.value})} style={inp} />
                </div>
                <div><label style={lbl}>Kalan Borç (₺)</label>
                  <input type="number" value={duzeltilmis.kalan || 0} onChange={e => setDuzeltilmis({...duzeltilmis, kalan: +e.target.value})} style={inp} />
                </div>
                <div><label style={lbl}>Ödeme Türü</label>
                  <select value={duzeltilmis.odeme_turu || "teslimde"} onChange={e => setDuzeltilmis({...duzeltilmis, odeme_turu: e.target.value})} style={{ ...inp, color: "#222", background: "#fff" }}>
                    <option value="teslimde">Teslimde</option>
                    <option value="nakit">Nakit</option>
                    <option value="kredi_karti">Kredi Kartı</option>
                    <option value="havale">Havale</option>
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666", fontSize: 13 }}>Müşteri:</span>
                  <span style={{ fontWeight: 600 }}>{secili.musteriler?.ad_soyad}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666", fontSize: 13 }}>Durum:</span>
                  <span style={{ color: dc[secili.durum] || "#888", fontWeight: 600 }}>{dy[secili.durum]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666", fontSize: 13 }}>Tutar:</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{para(secili.toplam_tutar)}</span>
                </div>
                {(secili.kalan || 0) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666", fontSize: 13 }}>Kalan:</span>
                    <span style={{ color: "#d97706", fontWeight: 600 }}>{para(secili.kalan)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Kalemler */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ color: "#444", fontSize: 13, margin: 0 }}>Ürünler ({kalemler.length})</h4>
                <button onClick={() => setYeniKalemMod(!yeniKalemMod)}
                  style={{ ...kbtn, fontSize: 11, background: yeniKalemMod ? "#fef2f2" : "#f0fdf4", color: yeniKalemMod ? "#dc2626" : "#16a34a", border: "1px solid " + (yeniKalemMod ? "#fecaca" : "#bbf7d0") }}>
                  {yeniKalemMod ? "✕ İptal" : "+ Ürün Ekle"}
                </button>
              </div>

              {/* Yeni ürün formu */}
              {yeniKalemMod && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={lbl}>Ürün Adı *</label>
                      <input value={yeniKalem.urun_adi} onChange={e => setYeniKalem({...yeniKalem, urun_adi: e.target.value})}
                        style={{ ...inp, color: "#222" }} placeholder="Gömlek, Pantolon..." />
                    </div>
                    <div>
                      <label style={lbl}>Renk</label>
                      <input value={yeniKalem.renk} onChange={e => setYeniKalem({...yeniKalem, renk: e.target.value})}
                        style={{ ...inp, color: "#222" }} placeholder="Siyah, Beyaz..." />
                    </div>
                    <div>
                      <label style={lbl}>Hizmet</label>
                      <select value={yeniKalem.hizmet} onChange={e => setYeniKalem({...yeniKalem, hizmet: e.target.value})}
                        style={{ ...inp, color: "#222", background: "#fff" }}>
                        {["Kuru Temizleme","Yıkama","Ütü","Terzi Tadilat","Boyama","Lostra"].map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Fiyat (₺) *</label>
                      <input type="number" value={yeniKalem.fiyat} onChange={e => setYeniKalem({...yeniKalem, fiyat: e.target.value})}
                        style={{ ...inp, color: "#222" }} placeholder="0" />
                    </div>
                    <div>
                      <label style={lbl}>Adet</label>
                      <input type="number" min="1" value={yeniKalem.adet} onChange={e => setYeniKalem({...yeniKalem, adet: +e.target.value})}
                        style={{ ...inp, color: "#222" }} />
                    </div>
                  </div>
                  <button onClick={kalemEkle} style={{ ...abtn, width: "100%", fontSize: 13 }}>✅ Ürün Ekle</button>
                </div>
              )}

              {/* Mevcut ürünler */}
              {kalemler.map(k => {
                let hz = []; try { hz = JSON.parse(k.hizmet_bilgi || "[]"); } catch {}
                return (
                  <div key={k.id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#111", fontSize: 13, fontWeight: 600 }}>{k.urun_adi} {k.renk ? `(${k.renk})` : ""} x{k.toplam_adet}</div>
                      <div style={{ color: "#888", fontSize: 11 }}>🔖 {k.barkod}</div>
                      {hz.map(h => <div key={h.hizmet_k} style={{ color: "#555", fontSize: 12 }}>• {h.hizmet_adi}: {para(h.fiyat)}</div>)}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {duzenlemeMod ? (
                        <>
                          <select value={k.durum || "bekliyor"} onChange={e => kalemDurumGuncelle(k.id, e.target.value)}
                            style={{ ...inp, width: "auto", fontSize: 11, color: "#222", background: "#fff", padding: "4px 8px" }}>
                            <option value="bekliyor">Bekliyor</option>
                            <option value="hazir">Hazır</option>
                            <option value="teslim_edildi">Teslim Edildi</option>
                          </select>
                          <button onClick={() => kalemSil(k.id)}
                            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>
                            🗑️ Sil
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f3f4f6", color: dc[k.durum] || "#888" }}>{dy[k.durum] || k.durum}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {!kalemler.length && <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: 16 }}>Ürün yok</p>}
            </div>
          </div>
        )}
      </div>

      {/* Şifre Modal */}
      {sifreModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ color: "#111", margin: "0 0 8px" }}>🔒 Geçmiş Fiş Düzenleme</h3>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>Bu fiş teslim edilmiş. Düzenlemek için şifre girin.</p>
            <input type="password" value={sifreInput} onChange={e => setSifreInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sifreDogrula()}
              placeholder="Şifre..." style={{ ...inp, marginBottom: 8 }} autoFocus />
            {sifreHata && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>{sifreHata}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={sifreDogrula} style={{ ...abtn, flex: 1 }}>Doğrula</button>
              <button onClick={() => { setSifreModal(false); setDuzeltilmis({}); }} style={{ ...kbtn, flex: 1 }}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== HATIRLATMA SAYFASI =====
export function KTHatirlatma() {
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtre, setFiltre] = useState("hepsi"); // hepsi | hazir_bekleyen | odeme_bekleyen
  const [gun, setGun] = useState(7); // kaç günden fazladır bekleyen
  const [gunMax, setGunMax] = useState(0); // 0 = üst sınır yok
  const [waModal, setWaModal] = useState(false);
  const [waMesajlar, setWaMesajlar] = useState([]);
  const [waGonderilen, setWaGonderilen] = useState([]);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const yukle = async () => {
    setYukleniyor(true);
    const sinir = new Date();
    sinir.setDate(sinir.getDate() - gun);
    const sinirStr = sinir.toISOString();
    const sinirMaxStr = gunMax > 0
      ? (() => { const d = new Date(); d.setDate(d.getDate() - gunMax); return d.toISOString(); })()
      : null;

    // 1) Hazır ama teslim alınmamış
    let q1 = supabase.from("kt_fisler").select("*, musteriler(ad_soyad, telefon)").eq("durum", "hazir").lte("acilis_tarihi", sinirStr).order("acilis_tarihi");
    if (sinirMaxStr) q1 = q1.gte("acilis_tarihi", sinirMaxStr);
    const { data: hazirlar } = await q1;

    // 2) Borcu olanlar
    let q2 = supabase.from("kt_fisler").select("*, musteriler(ad_soyad, telefon)").gt("kalan", 0).not("durum", "eq", "bekliyor").lte("acilis_tarihi", sinirStr).order("kalan", { ascending: false });
    if (sinirMaxStr) q2 = q2.gte("acilis_tarihi", sinirMaxStr);
    const { data: borclar } = await q2;

    const hazirSon = (hazirlar || []).map(f => ({ ...f, _tip: "hazir_bekleyen" }));
    const borcSon = (borclar || []).map(f => ({ ...f, _tip: "odeme_bekleyen" }));
    const tumIds = new Set();
    const birlesik = [];
    for (const f of [...hazirSon, ...borcSon]) {
      if (!tumIds.has(f.id)) { tumIds.add(f.id); birlesik.push(f); }
    }
    setListe(birlesik);
    setYukleniyor(false);
  };

  useEffect(() => { yukle(); }, [gun, gunMax]);

  const gosterilen = liste.filter(f => {
    if (filtre === "hazir_bekleyen") return f._tip === "hazir_bekleyen";
    if (filtre === "odeme_bekleyen") return f._tip === "odeme_bekleyen";
    return true;
  });

  const gunFark = (tarihStr) => Math.floor((new Date() - new Date(tarihStr)) / 86400000);

  // WA mesajı oluştur - QR linki ile
  const waMesajOlustur = (f) => {
    const qrUrl = `${siteUrl}/?musteri=${f.barkod || f.fis_no}`;
    const gun_ = gunFark(f.acilis_tarihi);
    const ad = f.musteriler?.ad_soyad || "Müşterimiz";

    if (f._tip === "hazir_bekleyen") {
      return `Sayın ${ad}, #${f.fis_no} numaralı ürününüz ${gun_} gündür hazır bekliyor. Teslim almak için mağazamızı ziyaret edebilirsiniz.\n\nSipariş durumunuz: ${qrUrl}`;
    } else {
      return `Sayın ${ad}, #${f.fis_no} numaralı fişinizde ${para(f.kalan)} tutarında bakiyeniz bulunmaktadır. Ödemenizi gerçekleştirmenizi rica ederiz.\n\nHesap detaylarınız: ${qrUrl}`;
    }
  };

  const waListeHazirla = (seciliFisler) => {
    const mesajlar = seciliFisler
      .filter(f => f.musteriler?.telefon)
      .map(f => {
        const tel = f.musteriler.telefon.replace(/\D/g, "").replace(/^0/, "");
        const metin = waMesajOlustur(f);
        return {
          ad: f.musteriler.ad_soyad,
          tel,
          fisNo: f.fis_no,
          tip: f._tip,
          metin,
          url: `whatsapp://send?phone=90${tel}&text=${encodeURIComponent(metin)}`
        };
      });
    setWaMesajlar(mesajlar);
    setWaGonderilen([]);
    setWaModal(true);
  };

  const dc = { bekliyor: "#d97706", hazir: "#16a34a", teslim_edildi: "#2563eb", kismi_teslim: "#ca8a04", iptal_edildi: "#6b7280" };
  const dy = { bekliyor: "Bekliyor", hazir: "Hazır", teslim_edildi: "Teslim Edildi", kismi_teslim: "Kısmi", iptal_edildi: "🚫 İptal" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#111", margin: 0 }}>🔔 Hatırlatmalar</h2>
        {gosterilen.length > 0 && (
          <button onClick={() => waListeHazirla(gosterilen.filter(f => f.musteriler?.telefon))}
            style={{ ...abtn, background: "#25D366" }}>
            📱 Tümüne WA Gönder ({gosterilen.filter(f => f.musteriler?.telefon).length})
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { v: "hepsi", l: "🔔 Tümü" },
          { v: "hazir_bekleyen", l: "📦 Hazır Bekleyen" },
          { v: "odeme_bekleyen", l: "💰 Ödeme Bekleyen" },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltre(f.v)}
            style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
              borderColor: filtre === f.v ? "#e94560" : "#e5e7eb",
              background: filtre === f.v ? "#fef2f2" : "#fff",
              color: filtre === f.v ? "#e94560" : "#555" }}>
            {f.l}
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
          <span style={{ color: "#666", fontSize: 12 }}>En az</span>
          <select value={gun} onChange={e => setGun(+e.target.value)}
            style={{ ...inp, width: "auto", padding: "5px 10px", fontSize: 12, color: "#222", background: "#fff" }}>
            <option value={3}>3 gün</option>
            <option value={7}>7 gün</option>
            <option value={14}>14 gün</option>
            <option value={20}>20 gün</option>
            <option value={30}>30 gün</option>
          </select>
          <span style={{ color: "#666", fontSize: 12 }}>—</span>
          <select value={gunMax} onChange={e => setGunMax(+e.target.value)}
            style={{ ...inp, width: "auto", padding: "5px 10px", fontSize: 12, color: "#222", background: "#fff" }}>
            <option value={0}>Sınırsız</option>
            <option value={14}>14 gün</option>
            <option value={30}>30 gün</option>
            <option value={60}>60 gün</option>
            <option value={90}>90 gün</option>
          </select>
          <span style={{ color: "#666", fontSize: 12 }}>arası</span>
        </div>
      </div>

      {yukleniyor ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>⏳ Yükleniyor...</div>
      ) : gosterilen.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "#f9fafb", borderRadius: 14, border: "2px dashed #e5e7eb" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ color: "#555", fontWeight: 600 }}>Harika! Bekleyen hatırlatma yok.</div>
          <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>Son {gun} günde tüm fişler düzenli.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {gosterilen.map(f => {
            const gf = gunFark(f.acilis_tarihi);
            const isHazir = f._tip === "hazir_bekleyen";
            const isBorc = f._tip === "odeme_bekleyen";
            const renkBg = isHazir ? "#fff7ed" : "#fef2f2";
            const renkBorder = isHazir ? "#fed7aa" : "#fecaca";
            const renkTip = isHazir ? "#c2410c" : "#dc2626";
            const tipLabel = isHazir ? "📦 Hazır Bekleyen" : "💰 Ödeme Bekleyen";

            return (
              <div key={f.id} style={{ background: renkBg, border: "1px solid " + (renkBorder), borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>#{f.fis_no}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: renkBorder, color: renkTip, fontWeight: 600 }}>{tipLabel}</span>
                      <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 8, background: "#f3f4f6", color: dc[f.durum] || "#888" }}>{dy[f.durum] || f.durum}</span>
                    </div>
                    <div style={{ color: "#555", fontSize: 13 }}>
                      👤 <strong>{f.musteriler?.ad_soyad || "-"}</strong>
                      {f.musteriler?.telefon && <span style={{ color: "#888", marginLeft: 10 }}>📞 {f.musteriler.telefon}</span>}
                    </div>
                    <div style={{ color: "#888", fontSize: 12, marginTop: 3 }}>
                      📅 Açılış: {tarih(f.acilis_tarihi)}
                      <span style={{ color: renkTip, fontWeight: 600, marginLeft: 10 }}>⏱ {gf} gün önce</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 16 }}>{para(f.toplam_tutar)}</div>
                    {(f.nakit_indirim_yuzde || 0) > 0 && <div style={{ color: "#16a34a", fontSize: 11 }}>💵 Nakit: {para(f.indirimli_tutar)}</div>}
                    {(+(f.kalan||0) > 0) && (
                      <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700 }}>
                        Borç: {para(+(f.nakit_indirim_yuzde||0) > 0 && Math.abs(+(f.kalan||0) - +(f.indirimli_tutar||0)) < 1 ? f.toplam_tutar : f.kalan)}
                      </div>
                    )}
                    {f.musteriler?.telefon ? (
                      <a href={`whatsapp://send?phone=90${waTel(f.musteriler.telefon)}&text=${encodeURIComponent(waMesajOlustur(f))}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: "inline-block", marginTop: 8, background: "#25D366", color: "#fff", padding: "6px 14px", borderRadius: 20, textDecoration: "none", fontWeight: 600, fontSize: 12 }}>
                        📱 WA Gönder
                      </a>
                    ) : (
                      <div style={{ color: "#aaa", fontSize: 11, marginTop: 8 }}>📵 Tel yok</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WA Toplu Gönder Modalı */}
      {waModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: 440, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ color: "#111", margin: 0 }}>📱 WhatsApp Hatırlatmaları</h3>
              <button onClick={() => { setWaModal(false); setWaGonderilen([]); }} style={{ ...kbtn, fontSize: 12 }}>✕</button>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#15803d" }}>
              💡 Her müşteri için <strong>WA Gönder</strong>'e tıklayın - mesaj + bakiye linki hazır açılır.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {waMesajlar.map((m, i) => {
                const gonderildi = waGonderilen.includes(i);
                return (
                  <div key={i} style={{ border: "1px solid " + (gonderildi ? "#bbf7d0" : "#e5e7eb"), borderRadius: 12, padding: 14, background: gonderildi ? "#f0fdf4" : "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#111" }}>👤 {m.ad}</div>
                        <div style={{ color: "#888", fontSize: 12 }}>📞 {m.tel} | Fiş #{m.fisNo}</div>
                      </div>
                      {gonderildi
                        ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 12 }}>✅ Gönderildi</span>
                        : <a href={m.url} target="_blank" rel="noreferrer"
                            onClick={() => setWaGonderilen(prev => [...prev, i])}
                            style={{ background: "#25D366", color: "#fff", padding: "7px 14px", borderRadius: 20, textDecoration: "none", fontWeight: 700, fontSize: 12 }}>
                            📤 WA Gönder
                          </a>
                      }
                    </div>
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#555", lineHeight: 1.5, cursor: "pointer" }}
                      onClick={() => navigator.clipboard?.writeText(m.metin)} title="Kopyala">
                      {m.metin.substring(0, 120)}{m.metin.length > 120 ? "..." : ""}
                      <div style={{ color: "#aaa", fontSize: 10, marginTop: 3 }}>📋 Kopyalamak için tıkla</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button onClick={() => {
                waMesajlar.forEach((m, i) => {
                  setTimeout(() => { window.open(m.url, "_blank"); setWaGonderilen(prev => [...prev, i]); }, i * 700);
                });
              }} style={{ ...abtn, flex: 1, background: "#25D366" }}>
                📤 Tümünü Gönder ({waMesajlar.length})
              </button>
              <button onClick={() => { setWaModal(false); setWaGonderilen([]); }} style={kbtn}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== AI ASISTAN =====
export function KTAsistan() {
  const [mesajlar, setMesajlar] = useState([
    { rol: "assistant", icerik: "Merhaba! Ben işletmeni yakından tanıyan yapay zeka asistanınım. 👔\n\nBana şunları sorabilirsin:\n• Fiş, müşteri ve kasa durumu\n• Gider ve ciro analizi\n• Borçlu müşteriler\n• WhatsApp mesajı yazdırma\n• İşletme tavsiyeleri\n\nNasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [baglam, setBaglam] = useState(null);
  const [veriYukleniyor, setVeriYukleniyor] = useState(true);
  const altRef = useRef(null);

  useEffect(() => {
    const veriTopla = async () => {
      setVeriYukleniyor(true);
      const bugunStr = new Date().toISOString().split("T")[0];
      const ayBas = bugunStr.slice(0, 7) + "-01";
      const oncekiAyBas = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7) + "-01";
      const oncekiAyBit = new Date(new Date().setDate(0)).toISOString().split("T")[0];

      const [fisler, tumFisler, musteriler, aciklar, bugunFis, giderler, oncekiAy] = await Promise.all([
        supabase.from("kt_fisler").select("fis_no,durum,toplam_tutar,indirimli_tutar,kalan,odeme_turu,acilis_tarihi,teslim_tarihi,nakit_indirim_yuzde,planlanan_teslim,musteriler(ad_soyad,telefon)").gte("acilis_tarihi", ayBas + "T00:00:00").order("acilis_tarihi", { ascending: false }).limit(200),
        supabase.from("kt_fisler").select("fis_no,durum,toplam_tutar,indirimli_tutar,kalan,odeme_turu,acilis_tarihi,musteriler(ad_soyad)").order("acilis_tarihi", { ascending: false }).limit(50),
        supabase.from("musteriler").select("id,ad_soyad,telefon").order("ad_soyad").limit(100),
        supabase.from("kt_fisler").select("fis_no,kalan,toplam_tutar,indirimli_tutar,nakit_indirim_yuzde,planlanan_teslim,durum,musteriler(ad_soyad,telefon)").gt("kalan", 0).order("kalan", { ascending: false }),
        supabase.from("kt_fisler").select("fis_no,durum,indirimli_tutar,odeme_turu,toplam_tutar").gte("acilis_tarihi", bugunStr + "T00:00:00"),
        supabase.from("giderler").select("tutar,aciklama,harcama_tarihi,islem_turu").gte("harcama_tarihi", ayBas).order("harcama_tarihi", { ascending: false }).limit(50),
        supabase.from("kt_fisler").select("indirimli_tutar,durum").gte("acilis_tarihi", oncekiAyBas + "T00:00:00").lte("acilis_tarihi", oncekiAyBit + "T23:59:59").eq("durum", "teslim_edildi"),
      ]);

      const fs = fisler.data || [];
      const ac = aciklar.data || [];
      const bf = bugunFis.data || [];
      const gd = giderler.data || [];
      const oay = oncekiAy.data || [];
      const mList = musteriler.data || [];

      const aylikCiro = fs.filter(f => f.durum === "teslim_edildi").reduce((t, f) => t + (f.indirimli_tutar || 0), 0);
      const oncekiAyCiro = oay.reduce((t, f) => t + (f.indirimli_tutar || 0), 0);
      const aylikGider = gd.filter(g => g.islem_turu !== "transfer").reduce((t, g) => t + (g.tutar || 0), 0);

      // Müşteri başına fiş sayısı
      const musteriMap = {};
      (tumFisler.data || []).forEach(f => {
        const ad = f.musteriler?.ad_soyad;
        if (ad) { musteriMap[ad] = (musteriMap[ad] || 0) + 1; }
      });
      const enSikMusteriler = Object.entries(musteriMap).sort((a,b) => b[1]-a[1]).slice(0,5);

      // Gecikmeli fişler
      const gec = fs.filter(f => f.planlanan_teslim && f.durum !== "teslim_edildi" && new Date(f.planlanan_teslim) < new Date());

      setBaglam({
        bugun: bugunStr,
        bugunFisSayisi: bf.length,
        bugunTahsilat: bf.filter(f => f.durum === "teslim_edildi").reduce((t, f) => t + (f.indirimli_tutar || 0), 0),
        bugunNakit: bf.filter(f => f.odeme_turu === "nakit").reduce((t, f) => t + (f.toplam_tutar || 0), 0),
        bugunKart: bf.filter(f => f.odeme_turu === "kredi_karti").reduce((t, f) => t + (f.toplam_tutar || 0), 0),
        bekleyenSayisi: fs.filter(f => f.durum === "bekliyor").length,
        hazirSayisi: fs.filter(f => f.durum === "hazir").length,
        teslimSayisi: fs.filter(f => f.durum === "teslim_edildi").length,
        iptalSayisi: fs.filter(f => f.durum === "iptal_edildi").length,
        aylikCiro, oncekiAyCiro, aylikGider,
        netKar: aylikCiro - aylikGider,
        acikBorcToplam: ac.reduce((t, f) => t + (f.kalan || 0), 0),
        acikBorcSayisi: ac.length,
        gecikmeliFisSayisi: gec.length,
        enBorcluMusteriler: ac.slice(0, 8).map(f => ({
          musteri: f.musteriler?.ad_soyad,
          telefon: f.musteriler?.telefon,
          kalan: f.kalan,
          nakiteOzel: (f.nakit_indirim_yuzde||0) > 0 ? f.indirimli_tutar : null,
          fisNo: f.fis_no,
          durum: f.durum,
          planlanan: f.planlanan_teslim?.slice(0,10),
        })),
        sonFisler: fs.slice(0, 30).map(f => ({
          fisNo: f.fis_no, musteri: f.musteriler?.ad_soyad,
          telefon: f.musteriler?.telefon,
          durum: f.durum, tutar: f.indirimli_tutar, kalan: f.kalan,
          odeme: f.odeme_turu, tarih: f.acilis_tarihi?.slice(0, 10),
          planlanan: f.planlanan_teslim?.slice(0,10),
        })),
        sonGiderler: gd.slice(0,10).map(g => ({ tutar: g.tutar, aciklama: g.aciklama, tarih: g.harcama_tarihi })),
        musteriSayisi: mList.length,
        enSikMusteriler,
        gec: gec.slice(0,5).map(f => ({ fisNo: f.fis_no, musteri: f.musteriler?.ad_soyad, planlanan: f.planlanan_teslim?.slice(0,10) })),
      });
      setVeriYukleniyor(false);
    };
    veriTopla();
  }, []);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar]);

  const sistemPrompt = () => {
    if (!baglam) return "";
    const b = baglam;
    const cirodegisim = b.oncekiAyCiro > 0
      ? ((b.aylikCiro - b.oncekiAyCiro) / b.oncekiAyCiro * 100).toFixed(1)
      : null;

    return `Sen deneyimli bir kuru temizleme işletmesi danışmanı ve yapay zeka asistanısın.
Türkçe konuş. Kibar, samimi ve profesyonel ol. Rakamları Türk lirası formatında yaz.
Kısa ve net cevap ver - gereksiz tekrar etme. Önemli uyarıları vurgula.

Eğer WhatsApp mesajı istenirse: müşteriye özel, kibar, kısa ve etkili mesaj yaz.
Eğer tavsiye istenirse: verilerden yola çıkarak somut öneri sun.

═══ GÜNCEL VERİLER (${b.bugun}) ═══

📊 BUGÜN:
• Açılan fiş: ${b.bugunFisSayisi} adet
• Tahsilat: ${b.bugunTahsilat?.toLocaleString("tr-TR")} ₺
• Nakit: ${b.bugunNakit?.toLocaleString("tr-TR")} ₺ | Kart: ${b.bugunKart?.toLocaleString("tr-TR")} ₺

📈 BU AY:
• Bekleyen: ${b.bekleyenSayisi} | Hazır: ${b.hazirSayisi} | Teslim: ${b.teslimSayisi} | İptal: ${b.iptalSayisi}
• Ciro: ${b.aylikCiro?.toLocaleString("tr-TR")} ₺${cirodegisim ? ` (geçen ay: ${b.oncekiAyCiro?.toLocaleString("tr-TR")} ₺, ${cirodegisim > 0 ? "+" : ""}${cirodegisim}%)` : ""}
• Gider: ${b.aylikGider?.toLocaleString("tr-TR")} ₺
• Net Kâr (tahmini): ${b.netKar?.toLocaleString("tr-TR")} ₺

⚠️ AÇIK BORÇLAR (${b.acikBorcSayisi} fiş, toplam ${b.acikBorcToplam?.toLocaleString("tr-TR")} ₺):
${b.enBorcluMusteriler.map(m => `• ${m.musteri} - ${m.kalan?.toLocaleString("tr-TR")} ₺${m.nakiteOzel ? ` (nakite özel: ${m.nakiteOzel?.toLocaleString("tr-TR")} ₺)` : ""} | Fiş #${m.fisNo} | ${m.durum}${m.telefon ? ` | Tel: ${m.telefon}` : ""}`).join("\n")}

${b.gec.length > 0 ? `⏰ GECİKMELİ FİŞLER (${b.gecikmeliFisSayisi} adet):\n${b.gec.map(f => `• #${f.fisNo} ${f.musteri} - ${f.planlanan} planlıydı`).join("\n")}\n` : ""}

📋 SON FİŞLER:
${b.sonFisler.slice(0,20).map(f => `• #${f.fisNo} | ${f.musteri} | ${f.durum} | ${f.tutar?.toLocaleString("tr-TR")} ₺${f.kalan > 0 ? ` | Borç: ${f.kalan?.toLocaleString("tr-TR")} ₺` : ""} | ${f.tarih}`).join("\n")}

💸 SON GİDERLER:
${b.sonGiderler.map(g => `• ${g.tarih} | ${g.aciklama || "-"} | ${g.tutar?.toLocaleString("tr-TR")} ₺`).join("\n")}

👥 EN SADIK MÜŞTERİLER:
${b.enSikMusteriler.map(([ad, sayi]) => `• ${ad}: ${sayi} fiş`).join("\n")}

Toplam kayıtlı müşteri: ${b.musteriSayisi}`;
  };

  const gonder = async () => {
    if (!input.trim() || yukleniyor) return;
    const yeniMesaj = { rol: "user", icerik: input.trim() };
    const guncellenmis = [...mesajlar, yeniMesaj];
    setMesajlar(guncellenmis);
    setInput("");
    setYukleniyor(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: sistemPrompt(),
          messages: guncellenmis.map(m => ({ role: m.rol === "user" ? "user" : "assistant", content: m.icerik })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMesajlar(prev => [...prev, { rol: "assistant", icerik: "❌ Hata: " + data.error }]);
      } else {
        const cevap = data.content?.[0]?.text || "Yanıt alınamadı.";
        setMesajlar(prev => [...prev, { rol: "assistant", icerik: cevap }]);
      }
    } catch (e) {
      setMesajlar(prev => [...prev, { rol: "assistant", icerik: "❌ Bağlantı hatası: " + e.message }]);
    }
    setYukleniyor(false);
  };

  const ornekSorular = [
    "Bu ay kasa özeti",
    "Borçlu müşterilere WA mesajı yaz",
    "Gecikmeli fişler var mı?",
    "Geçen aya göre nasılız?",
    "En sadık müşterilerim kimler?",
    "Bu ay net kâr ne kadar?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <h2 style={{ color: "#111", marginTop: 0, marginBottom: 0 }}>🤖 Yapay Zeka Asistan</h2>
        {veriYukleniyor && <span style={{ fontSize: 11, color: "#888", background: "#f3f4f6", padding: "3px 8px", borderRadius: 20 }}>⏳ Veriler yükleniyor...</span>}
        {!veriYukleniyor && <span style={{ fontSize: 11, color: "#16a34a", background: "#f0fdf4", padding: "3px 8px", borderRadius: 20 }}>✅ Hazır</span>}
      </div>
      <p style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>İşletmen hakkında her şeyi sorabilirsin.</p>

      {/* Hızlı sorular */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {ornekSorular.map(s => (
          <button key={s} onClick={() => { setInput(s); }}
            style={{ ...kbtn, fontSize: 11, padding: "5px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Mesaj alanı */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {mesajlar.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.rol === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: m.rol === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.rol === "user" ? "linear-gradient(135deg,#e94560,#c23152)" : "#fff",
              color: m.rol === "user" ? "#fff" : "#111",
              fontSize: 13, lineHeight: 1.6, border: m.rol === "user" ? "none" : "1px solid #e5e7eb",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", whiteSpace: "pre-wrap"
            }}>
              {m.icerik}
            </div>
          </div>
        ))}
        {yukleniyor && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "18px 18px 18px 4px", padding: "10px 16px", fontSize: 20 }}>
              <span style={{ animation: "pulse 1s infinite" }}>●</span>
              <span style={{ animation: "pulse 1s infinite 0.2s", margin: "0 3px" }}>●</span>
              <span style={{ animation: "pulse 1s infinite 0.4s" }}>●</span>
            </div>
          </div>
        )}
        <div ref={altRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && gonder()}
          placeholder="Bir şey sor... (Enter ile gönder)"
          style={{ ...inp, flex: 1, color: "#222", borderRadius: 24, padding: "11px 16px" }}
          disabled={yukleniyor}
        />
        <button onClick={gonder} disabled={yukleniyor || !input.trim()}
          style={{ ...abtn, borderRadius: 24, opacity: yukleniyor || !input.trim() ? 0.5 : 1 }}>
          Gönder
        </button>
      </div>
      
    </div>
  );
}

// ===== EVRENSEL TELEFON-PC BARKOD SİSTEMİ =====

// Oturum ID oluştur (4 haneli kod)
const oturumIdUret = () => Math.floor(1000 + Math.random() * 9000).toString();

// Hook: PC tarafında barkod dinle
export function useBarkodDinle(oturumId, onBarkod) {
  useEffect(() => {
    if (!oturumId) return;
    const ch = supabase
      .channel("barkod_" + oturumId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kt_barkod_scans" },
        (payload) => {
          if (payload.new.oturum_id === oturumId) {
            onBarkod(payload.new.barkod, payload.new.kaynak);
            // Okunan kaydı temizle
            supabase.from("kt_barkod_scans").delete().eq("id", payload.new.id).then(() => {});
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [oturumId]);
}

// PC tarafı - floating barkod bekleme butonu
export function TelefonBarkodButon({ onBarkod, kaynak = "" }) {
  const [acik, setAcik] = useState(false);
  const [oturumId] = useState(oturumIdUret);
  const [bekliyor, setBekliyor] = useState(false);
  const [sonBarkod, setSonBarkod] = useState("");

  useBarkodDinle(oturumId, (barkod) => {
    setSonBarkod(barkod);
    setBekliyor(false);
    onBarkod(barkod);
    setTimeout(() => setSonBarkod(""), 3000);
  });

  const telefonUrl = `${window.location.origin}/?barkod_oturum=${oturumId}`;

  // QR kod SVG oluştur (basit nokta matrisi - QR kütüphanesi gerekmez)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(telefonUrl)}&bgcolor=ffffff&color=0d1520&margin=8`;

  return (
    <>
      <button
        onClick={() => { setAcik(!acik); setBekliyor(true); }}
        title="Telefonla barkod tara"
        style={{
          background: bekliyor ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${bekliyor ? "#2563eb" : "#d0d5dd"}`,
          borderRadius: 8, color: bekliyor ? "#2563eb" : "#555",
          cursor: "pointer", fontSize: 18, padding: "5px 10px",
          animation: bekliyor ? "pulse 1.5s infinite" : "none",
          position: "relative",
        }}
      >
        📱
        {bekliyor && <span style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background:"#e94560", display:"block" }}/>}
      </button>

      {acik && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={(e) => { if(e.target===e.currentTarget){setAcik(false);setBekliyor(false);} }}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:"min(380px,92vw)", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:36, marginBottom:6 }}>📱</div>
            <h3 style={{ margin:"0 0 4px", color:"#111", fontSize:17 }}>Telefonla Barkod Tara</h3>
            <p style={{ color:"#888", fontSize:12, margin:"0 0 16px" }}>QR kodu okut veya kodu gir</p>

            {/* QR Kod */}
            <div style={{ background:"#f8f9fa", borderRadius:14, padding:12, marginBottom:14, display:"inline-block" }}>
              <img src={qrApiUrl} alt="QR" width={160} height={160} style={{ display:"block", borderRadius:8 }}
                onError={e => e.target.style.display="none"} />
            </div>

            <p style={{ color:"#aaa", fontSize:11, margin:"0 0 10px" }}>— veya kodu manuel gir —</p>

            {/* Büyük kod */}
            <div style={{ background:"#f0f4ff", border:"2px dashed #2563eb", borderRadius:12, padding:"10px 20px", marginBottom:16, display:"inline-block", minWidth:160 }}>
              <div style={{ color:"#888", fontSize:10, marginBottom:2 }}>BAĞLANTI KODU</div>
              <div style={{ color:"#2563eb", fontSize:44, fontWeight:800, letterSpacing:10, fontFamily:"monospace" }}>{oturumId}</div>
            </div>

            {/* Durum */}
            {sonBarkod ? (
              <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 16px", marginBottom:12 }}>
                <div style={{ color:"#16a34a", fontWeight:700, fontSize:14 }}>✅ Barkod Alındı!</div>
                <div style={{ color:"#555", fontSize:13, marginTop:2, fontFamily:"monospace" }}>{sonBarkod}</div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:"#888", fontSize:12, marginBottom:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#e94560", animation:"pulse 1s infinite" }}/>
                Bekleniyor...
              </div>
            )}

            <button onClick={() => { setAcik(false); setBekliyor(false); }}
              style={{ ...kbtn, width:"100%", fontSize:13, padding:"10px" }}>Kapat</button>
          </div>
        </div>
      )}
      
    </>
  );
}

// Telefon tarafı - barkod gönderme sayfası
export function TelefonBarkodGonder() {
  const [oturumId, setOturumId] = useState("");
  const [bagli, setBagli] = useState(false);
  const [tarayici, setTarayici] = useState(false);
  const [gonderilen, setGonderilen] = useState([]);
  const [manuel, setManuel] = useState("");

  // URL'den oturum id al
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get("barkod_oturum");
    if (oid) { setOturumId(oid); setBagli(true); }
  }, []);

  const gonder = async (barkod) => {
    if (!oturumId || !barkod.trim()) return;
    await supabase.from("kt_barkod_scans").insert({ oturum_id: oturumId, barkod: barkod.trim(), kaynak: "telefon" });
    setGonderilen(g => [{ barkod, zaman: new Date().toLocaleTimeString("tr-TR") }, ...g.slice(0, 9)]);
    setManuel("");
  };

  if (!bagli) {
    return (
      <div style={{ minHeight:"100vh", background:"#0f1923", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:20, padding:32, width:"min(360px,90vw)", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📱</div>
          <h2 style={{ color:"#fff", margin:"0 0 8px" }}>Barkod Gönder</h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"0 0 24px" }}>PC'deki 4 haneli kodu girin</p>
          <input
            value={oturumId} onChange={e => setOturumId(e.target.value.replace(/\D/g,"").slice(0,4))}
            placeholder="0000" maxLength={4}
            style={{ ...inp, fontSize:36, textAlign:"center", letterSpacing:12, fontWeight:700, marginBottom:14, background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", padding:"14px" }}
          />
          <button onClick={() => oturumId.length===4 && setBagli(true)}
            disabled={oturumId.length!==4}
            style={{ ...abtn, width:"100%", fontSize:16, padding:14, opacity: oturumId.length===4?1:0.4 }}>
            Bağlan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0f1923", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#0d1520", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>📱 Barkod Gönderici</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>PC Kodu: <strong style={{ color:"#4ea8de", letterSpacing:4 }}>{oturumId}</strong></div>
        </div>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#00c864", boxShadow:"0 0 8px #00c864" }}/>
      </div>

      <div style={{ flex:1, padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        {/* Kamera ile tara */}
        <button onClick={() => setTarayici(true)}
          style={{ background:"linear-gradient(135deg,#e94560,#c23152)", border:"none", borderRadius:16, padding:"20px", color:"#fff", fontSize:18, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:32 }}>📷</span> Kamera ile Tara
        </button>

        {/* Manuel giriş */}
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:16 }}>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginBottom:8 }}>Manuel Barkod Gir</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={manuel} onChange={e => setManuel(e.target.value)}
              onKeyDown={e => e.key==="Enter" && gonder(manuel)}
              placeholder="Barkod..." style={{ ...inp, flex:1, background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", fontSize:16 }}/>
            <button onClick={() => gonder(manuel)} disabled={!manuel.trim()}
              style={{ ...abtn, opacity: manuel.trim()?1:0.4 }}>Gönder</button>
          </div>
        </div>

        {/* Gönderilen barkodlar */}
        {gonderilen.length > 0 && (
          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:16 }}>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:10 }}>Son Gönderilenler</div>
            {gonderilen.map((g, i) => (
              <div key={i} onClick={() => gonder(g.barkod)}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:"rgba(255,255,255,0.04)", borderRadius:8, marginBottom:6, cursor:"pointer" }}>
                <span style={{ color:"#fff", fontFamily:"monospace", fontSize:14 }}>{g.barkod}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{g.zaman}</span>
                  <span style={{ color:"#4ea8de", fontSize:11 }}>↩ Tekrar</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background:"rgba(0,200,100,0.08)", border:"1px solid rgba(0,200,100,0.2)", borderRadius:12, padding:"10px 14px" }}>
          <div style={{ color:"#00c864", fontSize:12, fontWeight:600, marginBottom:2 }}>✅ PC'ye Bağlı</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>Taradığınız barkodlar PC'ye anında iletilecek</div>
        </div>
      </div>

      {tarayici && (
        <BarcodeScanner
          baslik="Barkod Tara → PC'ye Gönder"
          onKapat={() => setTarayici(false)}
          onSonuc={(barkod) => { setTarayici(false); gonder(barkod); }}
        />
      )}
    </div>
  );
}
