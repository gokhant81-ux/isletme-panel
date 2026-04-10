import { useState, useEffect, useRef, Component } from "react";
import { createClient } from "@supabase/supabase-js";
import { KTAnaSayfa, KTFisAc, KTFisler, KTTeslim, KTMusteriler, KTKasaRaporu, KTAyarlar, KTHazirlamaEkrani, KTMusteriSayfasi, KTFisDuzenle, KTHatirlatma, KTAsistan, ArayanPopup, TelefonBarkodGonder, UzaktanYaziciDinleyici, WhatsAppMerkezi, telefonFisYazdir } from "./KT.jsx";

// ── ERROR BOUNDARY — React hata yakalayıcı ──
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("React Hata:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f6fa",fontFamily:"'Segoe UI',sans-serif",padding:20}}>
          <div style={{background:"#fff",borderRadius:16,padding:32,maxWidth:500,width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:"1px solid #fecaca"}}>
            <div style={{fontSize:48,textAlign:"center",marginBottom:16}}>⚠️</div>
            <h2 style={{color:"#dc2626",textAlign:"center",margin:"0 0 12px",fontSize:18}}>Bir hata oluştu</h2>
            <p style={{color:"#666",fontSize:13,textAlign:"center",marginBottom:16}}>Sayfa yüklenirken bir sorun oluştu. Aşağıdaki hata detayını geliştiriciye iletin.</p>
            <div style={{background:"#fef2f2",borderRadius:10,padding:14,fontSize:12,color:"#991b1b",maxHeight:200,overflow:"auto",wordBreak:"break-all",marginBottom:16}}>
              <strong>Hata:</strong> {this.state.error?.toString()}<br/>
              <strong>Konum:</strong> {this.state.errorInfo?.componentStack?.slice(0,500)}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>this.setState({hasError:false,error:null,errorInfo:null})} style={{flex:1,padding:"10px 16px",borderRadius:10,border:"none",background:"#e94560",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:14}}>Tekrar Dene</button>
              <button onClick={()=>{localStorage.removeItem("kt_modul");window.location.reload();}} style={{flex:1,padding:"10px 16px",borderRadius:10,border:"1px solid #ddd",background:"#fff",color:"#333",cursor:"pointer",fontSize:14}}>Ana Menüye Dön</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== "undefined" && !window.responsiveVoice) {
  const s = document.createElement("script");
  s.src = "https://code.responsivevoice.org/responsivevoice.js?key=FREE";
  s.async = true;
  document.head.appendChild(s);
}

// Evrensel realtime yenileme hook
function useRealtimeYenile(tablolar, callback, deps = []) {
  useEffect(() => {
    const channels = tablolar.map((tablo, i) =>
      supabase.channel(`rt_${tablo}_${Date.now()}_${i}`)
        .on("postgres_changes", { event: "*", schema: "public", table: tablo }, () => callback())
        .subscribe()
    );
    return () => channels.forEach(ch => supabase.removeChannel(ch));
  }, deps);
}

// Global select option stili — BEYAZ TEMA
if (typeof document !== "undefined" && !document.getElementById("cicek-global-style")) {
  const style = document.createElement("style");
  style.id = "cicek-global-style";
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    body { background: #f5f6fa !important; color: #1a1a2e !important; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 15px; }
    select option { background: #fff !important; color: #222 !important; }
    select { color-scheme: light; }
    input[type="date"], input[type="time"], input[type="month"] { color-scheme: light; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f0f0f0; }
    ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    .gider-satir:hover { background: #f8f9ff !important; }
    .kart-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(233,69,96,0.12) !important; }
  `;
  document.head.appendChild(style);
}
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const para = (n) => new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(n||0)+" ₺";
const bugun = () => new Date().toISOString().split("T")[0];
const tarih = (d) => d?new Date(d).toLocaleDateString("tr-TR"):"-";

// ── BEYAZ TEMA STİL SABİTLERİ ──────────────────────────────
const inp={width:"100%",padding:"11px 14px",borderRadius:9,border:"1px solid #dde1ec",background:"#fff",color:"#1a1a2e",fontSize:14,boxSizing:"border-box",outline:"none",transition:"border-color 0.15s"};
const lbl={color:"#555",fontSize:13,display:"block",marginBottom:6,fontWeight:500};
const abtn={padding:"11px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#e94560,#c23152)",color:"#1a1a2e",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 2px 8px rgba(233,69,96,0.25)"};
const kbtn={padding:"9px 16px",borderRadius:8,border:"1px solid #dde1ec",background:"#fff",color:"#444",cursor:"pointer",fontSize:13,fontWeight:500};
const mbtn={padding:"5px 10px",borderRadius:6,border:"1px solid #dde1ec",background:"#fff",color:"#555",cursor:"pointer",fontSize:13};
const obtn={padding:"9px 18px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontSize:13,fontWeight:500};
const bstl={color:"#1a1a2e",marginTop:0,fontSize:23,fontWeight:700};
const fkrt={background:"#fff",borderRadius:14,padding:22,border:"1px solid #e8ebf5",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"};
const krt={background:"#fff",borderRadius:14,padding:18,border:"1px solid #e8ebf5",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};
const td={padding:"12px 14px",color:"#333",fontSize:13.5};

function hexRgb(h){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:"128,128,128";}

function Badge({tip,durum}){
  if(tip){const m={nakit:{l:"Nakit",c:"#00a854"},kredi_karti:{l:"Kart",c:"#1677ff"},havale:{l:"Havale",c:"#d46b08"},veresiye:{l:"Veresiye",c:"#cf1322"},teslimde:{l:"Teslimde",c:"#531dab"},acik_cari:{l:"Açık Cari",c:"#d48806"}};const d=m[tip]||{l:tip,c:"#555"};return <span style={{fontSize:11.5,padding:"3px 10px",borderRadius:12,background:`rgba(${hexRgb(d.c)},0.1)`,color:d.c,fontWeight:600,border:`1px solid rgba(${hexRgb(d.c)},0.2)`}}>{d.l}</span>;}
  const m={bekliyor:{l:"Bekliyor",c:"#d48806"},hazir:{l:"Hazır",c:"#00a854"},teslim_edildi:{l:"Teslim",c:"#1677ff"},kismi_teslim:{l:"Kısmi",c:"#d46b08"},acik:{l:"Açık",c:"#cf1322"},kismi:{l:"Kısmi",c:"#d48806"},kapali:{l:"Kapalı",c:"#1677ff"}};
  const d=m[durum]||{l:durum||"-",c:"#888"};return <span style={{fontSize:11.5,padding:"3px 10px",borderRadius:12,background:`rgba(${hexRgb(d.c)},0.1)`,color:d.c,fontWeight:600,border:`1px solid rgba(${hexRgb(d.c)},0.2)`}}>{d.l}</span>;
}

function Tablo({bas,children}){return(<div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebf5",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}><thead><tr style={{borderBottom:"1px solid #e8ebf5",background:"#f8f9fc"}}>{bas.map(h=><th key={h} style={{padding:"12px 14px",color:"#666",fontSize:12.5,textAlign:"left",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>);}

function Modal({onKapat,children,genislik}){const [gece2]=useGeceModu();const T2=getTema(gece2);return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}><div style={{background:T2.card,border:`1px solid ${T2.border}`,borderRadius:16,padding:28,width:genislik||400,maxHeight:"90vh",overflow:"auto",color:T2.text}}>{children}<button onClick={onKapat} style={{...kbtn,marginTop:10,background:T2.card,color:T2.text2,borderColor:T2.border}}>Kapat</button></div></div>);}

// Fiş yazdır
function cicekFisYazdir(satis, kalemler, ayarlar={}) {
  const firmaAdi = localStorage.getItem("kt_firma_adi") || "Çiçekçi";
  const firmaTel = localStorage.getItem("kt_firma_tel") || "";
  const firmaAdres = localStorage.getItem("kt_firma_adres") || "";
  const firmaLogo = localStorage.getItem("firma_logo") || "";
  const toplam = kalemler.reduce((t,k)=>t+k.toplam,0);
  const kdv = kalemler.reduce((t,k)=>t+(k.toplam*(k.kdv_orani||8)/(100+(k.kdv_orani||8))),0);

  const kalemHtml = kalemler.map(k=>`
    <div style="margin:5px 0;padding-top:4px;border-top:1px dotted #aaa;">
      <div style="font-weight:700;font-size:11px;">${k.urun_adi?.toUpperCase()} ${k.miktar} ${k.birim||"dal"} &nbsp;&nbsp; ${para(k.toplam)}</div>
      <div style="font-size:10px;color:#555;">${para(k.birim_fiyat)}/${k.birim||"dal"}</div>
    </div>`).join("");

  const html = `<html><head><title>Fiş #${satis.satis_no}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;font-size:10.5px;width:72mm;padding:2mm;line-height:1.5;}
    .center{text-align:center}.bold{font-weight:700}
    .line{border-top:1px dashed #000;margin:4px 0}
    .row{display:flex;justify-content:space-between;font-size:10.5px;margin:2px 0;}
  </style></head><body>
  ${firmaLogo?`<img src="${firmaLogo}" style="display:block;margin:0 auto 4px;max-height:16mm;max-width:100%;object-fit:contain;" />`:""}
  <div class="center bold" style="font-size:14px;">${firmaAdi}</div>
  ${firmaTel?`<div class="center" style="font-size:10px;">${firmaTel}</div>`:""}
  ${firmaAdres?`<div class="center" style="font-size:10px;">${firmaAdres}</div>`:""}
  <div class="line"></div>
  <div style="font-size:10.5px;font-weight:700;">Fiş No: #${satis.satis_no}</div>
  <div style="font-size:10.5px;">${new Date(satis.satis_tarihi||new Date()).toLocaleString("tr-TR")}</div>
  ${satis.musteri_ad_soyad?`<div style="font-size:10.5px;font-weight:700;">${satis.musteri_ad_soyad}</div>`:""}
  <div class="line"></div>
  ${kalemHtml}
  <div class="line"></div>
  <div class="row"><span>KDV</span><span>${para(kdv)}</span></div>
  <div class="row bold" style="font-size:13px;"><span>TOPLAM</span><span>${para(toplam)}</span></div>
  <div class="line"></div>
  <div class="center" style="font-size:10px;margin-top:4px;">Teşekkür ederiz!</div>
  <script>setTimeout(()=>window.print(),300);<\/script>
  </body></html>`;

  const w = window.open("about:blank","_blank","width=380,height=600");
  if(w){w.document.write(html);w.document.close();}
}

// GİRİŞ
// Global CSS animasyonları
if (typeof document !== "undefined" && !document.getElementById("app-anim-css")) {
  const s = document.createElement("style");
  s.id = "app-anim-css";
  s.textContent = "@keyframes salla{0%,100%{transform:rotate(0deg)}25%{transform:rotate(10deg)}75%{transform:rotate(-10deg)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}@keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}";
  document.head.appendChild(s);
}

// ── GLOBAL TOAST BİLDİRİM SİSTEMİ ──────────────────────────
function toast(mesaj, tip = "basari", sure = 3500) {
  if (typeof document === "undefined") return;
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:min(400px,calc(100vw - 32px));";
    document.body.appendChild(container);
  }
  const renkler = {
    basari: { bg: "#f0fdf4", border: "#86efac", color: "#15803d", icon: "✅" },
    hata: { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626", icon: "❌" },
    uyari: { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "⚠️" },
    bilgi: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", icon: "ℹ️" },
  };
  const r = renkler[tip] || renkler.bilgi;
  const el = document.createElement("div");
  el.style.cssText = `background:${r.bg};border:1.5px solid ${r.border};color:${r.color};padding:12px 18px;border-radius:12px;font-size:13.5px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.12);pointer-events:auto;display:flex;align-items:center;gap:8px;animation:toastIn 0.3s ease;font-family:'Segoe UI',sans-serif;cursor:pointer;`;
  el.innerHTML = `<span style="font-size:16px;flex-shrink:0">${r.icon}</span><span style="flex:1">${mesaj}</span>`;
  el.onclick = () => { el.style.animation = "toastOut 0.25s ease forwards"; setTimeout(() => el.remove(), 250); };
  container.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) { el.style.animation = "toastOut 0.3s ease forwards"; setTimeout(() => el.remove(), 300); }
  }, sure);
}
// Toast'u global yap — KT.jsx'ten de erişilebilsin
if (typeof window !== "undefined") window.toast = toast;

// ─── GECE/GÜNDÜZ MODU ─────────────────────────────────────
function useGeceModu() {
  const [gece, setGece] = useState(() => {
    try { return localStorage.getItem("kt_tema") === "gece"; } catch { return false; }
  });
  const toggle = () => {
    setGece(g => {
      const yeni = !g;
      try { localStorage.setItem("kt_tema", yeni ? "gece" : "gunduz"); } catch {}
      return yeni;
    });
  };
  return [gece, toggle];
}

// Tema renk paleti
function getTema(gece) {
  if (gece) return {
    bg: "#0f1117", card: "#1a1f2e", border: "#2a2f42",
    text: "#e8eaf6", text2: "#9aa0b4", text3: "#6b7280",
    input: "#1e2435", inputBorder: "#2e3548",
    navBg: "#13171f", shadow: "rgba(0,0,0,0.4)",
    stripeBg: "#1e2330",
  };
  return {
    bg: "#f5f6fa", card: "#ffffff", border: "#e8ebf5",
    text: "#1a1a2e", text2: "#555", text3: "#888",
    input: "#ffffff", inputBorder: "#dde1ec",
    navBg: "#ffffff", shadow: "rgba(0,0,0,0.06)",
    stripeBg: "#f8f9fc",
  };
}

function Giris({onGiris}){
  const [k,setK]=useState("");
  const [s,setS]=useState("");
  const [h,setH]=useState("");
  const [y,setY]=useState(false);
  const [lambAcik,setLambAcik]=useState(false);
  const [formGorunsun,setFormGorunsun]=useState(true); // Form her zaman görünür
  const [ipCekme,setIpCekme]=useState(0);
  const [cekiyor,setCekiyor]=useState(false);
  const basY=useRef(0);

  const giris=async(e)=>{
    e.preventDefault();setY(true);setH("");
    const{data}=await supabase.from("kullanicilar").select("*").eq("kullanici_adi",k).single();
    if(!data||data.sifre_hash!==s){setH("Hatalı kullanıcı adı veya şifre.");setY(false);return;}
    const bitis=new Date();bitis.setHours(bitis.getHours()+6);
    localStorage.setItem("kt_kullanici",JSON.stringify(data));
    localStorage.setItem("kt_oturum_bitis",bitis.toISOString());
    localStorage.setItem("kt_son_islem",Date.now().toString());
    onGiris(data);setY(false);
  };

  const baslat=(e)=>{ setCekiyor(true); basY.current=e.touches?e.touches[0].clientY:e.clientY; };
  const surukle=(e)=>{ if(!cekiyor)return; const y=e.touches?e.touches[0].clientY:e.clientY; setIpCekme(Math.max(0,Math.min(80,y-basY.current))); };
  const birak=()=>{
    if(!cekiyor)return; setCekiyor(false);
    if(ipCekme>35){ setLambAcik(l=>{ const yeni=!l; if(yeni)setTimeout(()=>setFormGorunsun(true),600); else setFormGorunsun(false); return yeni; }); }
    setIpCekme(0);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:lambAcik?"#1c1f24":"#0f1117",transition:"background 0.8s ease",
      fontFamily:"'Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}
      onMouseMove={surukle} onMouseUp={birak} onTouchMove={surukle} onTouchEnd={birak}>

      {lambAcik&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
        width:700,height:700,background:"radial-gradient(ellipse at 50% 15%, rgba(255,220,100,0.22) 0%, transparent 70%)",pointerEvents:"none"}}/>}

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28,width:"100%",padding:16}}>

        {/* LAMBA */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",userSelect:"none"}}>
          <div style={{position:"relative",width:160,height:210}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:140,height:70,
              background:lambAcik?"#f5f0e0":"#2a2d35",borderRadius:"50% 50% 0 0",
              boxShadow:lambAcik?"0 0 50px 15px rgba(255,220,100,0.7),0 0 100px 30px rgba(255,200,50,0.35)":"none",
              transition:"all 0.8s ease"}}/>
            {lambAcik&&<div style={{position:"absolute",top:68,left:"50%",transform:"translateX(-50%)",width:180,height:40,
              background:"radial-gradient(ellipse, rgba(255,220,100,0.55) 0%, transparent 70%)"}}/>}
            <div style={{position:"absolute",top:68,left:"50%",transform:"translateX(-50%)",width:12,height:95,
              background:lambAcik?"#d4c89a":"#3a3d45",transition:"background 0.8s"}}/>
            <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:100,height:18,
              background:lambAcik?"#ccc0a0":"#2e3040",borderRadius:9,transition:"background 0.8s"}}/>
            {/* İP */}
            <div onMouseDown={baslat} onTouchStart={baslat}
              style={{position:"absolute",top:66,left:"62%",cursor:cekiyor?"grabbing":"grab",display:"flex",flexDirection:"column",alignItems:"center",touchAction:"none"}}>
              <div style={{width:2,height:55+ipCekme,background:`rgba(255,255,255,${cekiyor?0.7:0.35})`,transition:cekiyor?"none":"height 0.4s ease",borderRadius:1}}/>
              <div style={{width:14,height:14,borderRadius:"50%",
                background:lambAcik?"#ffd700":cekiyor?"#bbb":"#555",
                boxShadow:lambAcik?"0 0 12px #ffd700":"none",
                transform:`translateY(${cekiyor?2:0}px)`,transition:cekiyor?"none":"all 0.4s"}}/>
            </div>
          </div>
          {!lambAcik&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginTop:12,textAlign:"center",letterSpacing:0.5}}>💡 Lambayı açmak için ipi çekin<br/>ya da formu aşağıdan doldurun</p>}
          {lambAcik&&<p style={{color:"rgba(255,220,100,0.8)",fontSize:13,marginTop:12,fontWeight:600}}>✨ Hoş geldiniz!</p>}
        </div>

        {/* GİRİŞ FORMU */}
        <div style={{
          background:lambAcik?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",
          backdropFilter:"blur(20px)",
          border:`1px solid ${lambAcik?"rgba(255,220,100,0.3)":"rgba(255,255,255,0.07)"}`,
          borderRadius:22,padding:36,width:"min(360px,94vw)",
          opacity:1,
          transform:"translateY(0)",
          transition:"all 0.6s ease",pointerEvents:"all",
          boxShadow:lambAcik?"0 20px 60px rgba(0,0,0,0.4)":"none",
        }}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:46,marginBottom:10}}>🌸</div>
            <h2 style={{color:"#fff",margin:0,fontSize:22,fontWeight:800}}>İşletme Yönetim</h2>
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:"8px 0 0"}}>Çiçekçi & Kuru Temizleme</p>
          </div>
          <form onSubmit={giris}>
            <div style={{marginBottom:14}}>
              <label style={{color:"rgba(255,255,255,0.7)",fontSize:13,display:"block",marginBottom:6,fontWeight:500}}>Kullanıcı Adı</label>
              <input value={k} onChange={e=>setK(e.target.value)} placeholder="kullanici_adi"
                style={{...inp,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff","::placeholder":{color:"rgba(255,255,255,0.4)"}}} required/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{color:"rgba(255,255,255,0.7)",fontSize:13,display:"block",marginBottom:6,fontWeight:500}}>Şifre</label>
              <input type="password" value={s} onChange={e=>setS(e.target.value)} placeholder="••••••••"
                style={{...inp,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff"}} required/>
            </div>
            {h&&<div style={{color:"#fca5a5",fontSize:13,marginBottom:10,padding:"8px 12px",background:"rgba(220,38,38,0.15)",borderRadius:8,border:"1px solid rgba(220,38,38,0.3)"}}>{h}</div>}
            <button type="submit" disabled={y}
              style={{width:"100%",padding:14,marginTop:12,borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#e94560,#c23152)",
                color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer",
                boxShadow:"0 4px 15px rgba(233,69,96,0.4)"}}>
              {y?"Giriş yapılıyor...":"🔑 Giriş Yap"}
            </button>
          </form>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:11,textAlign:"center",marginTop:18}}>6 saat oturum · aktivite ile uzar</p>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════
// OTURUM YÖNETİMİ — 6 saatlik, aktivite tabanlı
// ═══════════════════════════════════════
function oturumOku() {
  try {
    const k = localStorage.getItem("kt_kullanici");
    const bitis = localStorage.getItem("kt_oturum_bitis");
    const sonIslem = localStorage.getItem("kt_son_islem");
    if (!k || !bitis) return null;
    // Süre geçmişse at
    if (new Date() > new Date(bitis)) {
      oturumSil();
      return null;
    }
    // 6 saat işlem olmadıysa at
    if (sonIslem && Date.now() - +sonIslem > 6 * 60 * 60 * 1000) {
      oturumSil();
      return null;
    }
    return JSON.parse(k);
  } catch { return null; }
}

function oturumSil() {
  ['kt_kullanici','kt_oturum_bitis','kt_son_islem','kt_modul'].forEach(k => {
    try { localStorage.removeItem(k); } catch {}
  });
}

function oturumUzat() {
  try {
    const bitis = new Date();
    bitis.setHours(bitis.getHours() + 6);
    localStorage.setItem("kt_oturum_bitis", bitis.toISOString());
    localStorage.setItem("kt_son_islem", Date.now().toString());
  } catch {}
}

// ANA EKRAN — Gündüz/Gece + Şifreli Kasa
function Ana({kullanici,onSecim,onCikis}){
  const [ht,setHt]=useState([]);
  const [gece,geceTog]=useGeceModu();
  const tema=getTema(gece);
  // Kasa raporu şifre
  const [kasaAcik,setKasaAcik]=useState(false);
  const [kasaSifre,setKasaSifre]=useState("");
  const [kasaHata,setKasaHata]=useState(false);
  const [kasaGoster,setKasaGoster]=useState(false);
  const [kasaOzet,setKasaOzet]=useState(null);
  const kasaSifresiDoğru = () => kasaSifre === (kullanici?.sifre_hash || "1234");

  useEffect(()=>{
    const d=new Date();d.setDate(d.getDate()+3);
    supabase.from("hatirlaticilar").select("*").eq("durum","aktif").lte("etkinlik_tarihi",d.toISOString().split("T")[0]).then(({data})=>setHt(data||[]));
  },[]);

  const kasaYukle=()=>{
    const b=bugun();
    Promise.all([
      supabase.from("cicek_satislar").select("toplam_tutar,odeme_turu").gte("satis_tarihi",b+"T00:00:00"),
      supabase.from("kt_fisler").select("indirimli_tutar").eq("durum","teslim_edildi").gte("teslim_tarihi",b+"T00:00:00"),
      supabase.from("giderler").select("tutar").gte("harcama_tarihi",b).neq("belge_turu","Transfer"),
      supabase.from("cicek_siparisler").select("id").neq("durum","teslim_edildi").neq("durum","iptal"),
    ]).then(([cSat,ktFis,gid,sip])=>{
      const cCiro=(cSat.data||[]).reduce((t,x)=>t+(x.toplam_tutar||0),0);
      const cNakit=(cSat.data||[]).filter(x=>x.odeme_turu==="nakit").reduce((t,x)=>t+(x.toplam_tutar||0),0);
      const cKart=(cSat.data||[]).filter(x=>x.odeme_turu==="kredi_karti").reduce((t,x)=>t+(x.toplam_tutar||0),0);
      const cVeresiye=(cSat.data||[]).filter(x=>x.odeme_turu==="veresiye").reduce((t,x)=>t+(x.toplam_tutar||0),0);
      const ktCiro=(ktFis.data||[]).reduce((t,x)=>t+(x.indirimli_tutar||0),0);
      const gider=(gid.data||[]).reduce((t,x)=>t+(x.tutar||0),0);
      const toplam=cCiro+ktCiro;
      setKasaOzet({cCiro,cNakit,cKart,cVeresiye,ktCiro,gider,toplam,net:toplam-gider,
        cAdet:(cSat.data||[]).length,ktAdet:(ktFis.data||[]).length,
        bekSiparis:(sip.data||[]).length});
    });
  };

  const menu=[
    {k:"cicekci",  e:"🌹",b:"Çiçekçi",     a:"Satış · Stok · Fatura · Cari",c:"#e94560"},
    {k:"kuru_temizleme",e:"👔",b:"Kuru Temizleme",a:"Fiş · Teslim · Kasa",c:"#1677ff"},
    {k:"gider",    e:"💰",b:"Gider / Finans",a:"Gider · KDV · Tedarikçi Cari",c:"#d48806"},
    {k:"ayarlar",  e:"⚙️",b:"Ayarlar",       a:"Hesaplar · Kullanıcılar · Ödeme",c:"#722ed1"},
  ];

  const T=tema; // kısayol

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Segoe UI',sans-serif",transition:"background 0.3s,color 0.3s"}}>
      {/* Üst bar */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:`0 1px 6px ${T.shadow}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:28}}>🌸</span>
          <div>
            <div style={{fontWeight:700,fontSize:17,color:T.text}}>İşletme Yönetim Paneli</div>
            <div style={{fontSize:12,color:T.text3}}>Çiçekçi & Kuru Temizleme</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,color:T.text2}}>👤 {kullanici?.ad_soyad}</span>
          {/* Gece/Gündüz toggle */}
          <button onClick={geceTog} title={gece?"Gündüz Moduna Geç":"Gece Moduna Geç"}
            style={{background:gece?"#2a2f42":"#f0f2f8",border:`1px solid ${T.border}`,borderRadius:20,cursor:"pointer",fontSize:18,padding:"5px 10px",color:gece?"#ffd700":"#555",transition:"all 0.3s"}}>
            {gece?"🌙":"☀️"}
          </button>
          {/* Kasa Raporu */}
          <button onClick={()=>{setKasaAcik(true);setKasaSifre("");setKasaHata(false);}}
            style={{background:"linear-gradient(135deg,#e94560,#c23152)",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,padding:"8px 14px",color:"#fff",fontWeight:600}}>
            📊 Kasa Raporu
          </button>
          <button onClick={onCikis} style={{...kbtn,fontSize:12,padding:"6px 14px",color:"#cf1322",borderColor:"#ffa39e",background:"#fff1f0"}}>Çıkış</button>
        </div>
      </div>

      {/* Hatırlatıcılar */}
      {ht.length>0&&<div style={{margin:"14px 20px 0",background:"#fffbe6",border:"1px solid #ffe58f",borderRadius:12,padding:"10px 16px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{color:"#d48806",fontWeight:600,fontSize:13}}>⏰</span>
        {ht.map(h=><span key={h.id} style={{color:"#614700",fontSize:13}}>{h.baslik}</span>)}
      </div>}

      {/* Modül Kartları */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:18,padding:"24px 20px"}}>
        {menu.map(m=>(
          <div key={m.k} onClick={()=>onSecim(m.k)}
            style={{background:T.card,borderRadius:18,padding:"30px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",borderTop:`4px solid ${m.c}`,border:`1px solid ${T.border}`,borderTopColor:m.c,boxShadow:`0 2px 10px ${T.shadow}`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 8px 24px ${T.shadow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 2px 10px ${T.shadow}`;}}>
            <div style={{fontSize:44,marginBottom:12}}>{m.e}</div>
            <div style={{color:T.text,fontSize:16,fontWeight:700}}>{m.b}</div>
            <div style={{color:T.text3,fontSize:12,marginTop:6,lineHeight:1.5}}>{m.a}</div>
          </div>
        ))}
      </div>

      {/* KASA RAPORU MODAL — Şifreli */}
      {kasaAcik&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
        <div style={{background:T.card,borderRadius:20,padding:32,width:"min(520px,95vw)",maxHeight:"90vh",overflow:"auto",border:`1px solid ${T.border}`,boxShadow:`0 20px 60px rgba(0,0,0,0.3)`}}>
          {!kasaGoster?(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔐</div>
              <h3 style={{color:T.text,margin:"0 0 8px",fontSize:18}}>Kasa Raporu</h3>
              <p style={{color:T.text2,fontSize:13,marginBottom:20}}>Devam etmek için şifrenizi girin</p>
              <input type="password" value={kasaSifre} onChange={e=>setKasaSifre(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){if(kasaSifresiDoğru()){kasaYukle();setKasaGoster(true);setKasaHata(false);}else setKasaHata(true);}}}
                placeholder="Şifreniz..." style={{...inp,textAlign:"center",fontSize:18,letterSpacing:4,marginBottom:10}}/>
              {kasaHata&&<p style={{color:"#dc2626",fontSize:13,margin:"0 0 10px"}}>❌ Yanlış şifre</p>}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{if(kasaSifresiDoğru()){kasaYukle();setKasaGoster(true);setKasaHata(false);}else setKasaHata(true);}}
                  style={{...abtn,flex:1}}>Görüntüle</button>
                <button onClick={()=>{setKasaAcik(false);setKasaGoster(false);}} style={{...kbtn,flex:1}}>İptal</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <h3 style={{color:T.text,margin:0,fontSize:18}}>📊 Bugünkü Kasa Raporu</h3>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={kasaYukle} style={{...kbtn,fontSize:12,padding:"5px 10px"}}>🔄 Yenile</button>
                  <button onClick={()=>{setKasaAcik(false);setKasaGoster(false);setKasaSifre("");}} style={{...kbtn,fontSize:12,padding:"5px 10px",color:"#dc2626"}}>✕ Kapat</button>
                </div>
              </div>
              {kasaOzet&&<div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                  <div style={{...krt,background:"linear-gradient(135deg,#fff1f4,#ffe4e8)",border:"1px solid #fecaca"}}>
                    <div style={{color:"#dc2626",fontSize:11,fontWeight:600}}>🌹 ÇİÇEKÇİ BUGÜN</div>
                    <div style={{color:"#dc2626",fontWeight:800,fontSize:22,marginTop:4}}>{para(kasaOzet.cCiro)}</div>
                    <div style={{color:"#888",fontSize:11,marginTop:2}}>{kasaOzet.cAdet} satış</div>
                  </div>
                  <div style={{...krt,background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #bfdbfe"}}>
                    <div style={{color:"#1d4ed8",fontSize:11,fontWeight:600}}>👔 KURU TEMİZLEME BUGÜN</div>
                    <div style={{color:"#1d4ed8",fontWeight:800,fontSize:22,marginTop:4}}>{para(kasaOzet.ktCiro)}</div>
                    <div style={{color:"#888",fontSize:11,marginTop:2}}>{kasaOzet.ktAdet} fiş</div>
                  </div>
                </div>
                <div style={{...krt,background:gece?"#1a2535":"#f0fdf4",border:"1px solid #86efac",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#15803d",fontWeight:700,fontSize:15}}>💰 TOPLAM CİRO</span>
                    <span style={{color:"#15803d",fontWeight:800,fontSize:22}}>{para(kasaOzet.toplam)}</span>
                  </div>
                </div>
                {/* Çiçekçi detay */}
                <div style={{...krt,marginBottom:10}}>
                  <div style={{color:T.text2,fontSize:12,fontWeight:600,marginBottom:10}}>🌹 Çiçekçi Detay</div>
                  {[{l:"Nakit",v:kasaOzet.cNakit,c:"#00a854"},{l:"Kart",v:kasaOzet.cKart,c:"#1677ff"},{l:"Veresiye",v:kasaOzet.cVeresiye,c:"#dc2626"}].map(r=>(
                    <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{color:T.text2,fontSize:13}}>{r.l}</span>
                      <span style={{color:r.c,fontWeight:600,fontSize:13}}>{para(r.v)}</span>
                    </div>
                  ))}
                </div>
                <div style={{...krt,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                    <span style={{color:T.text2,fontSize:13}}>💸 Günlük Gider</span>
                    <span style={{color:"#dc2626",fontWeight:600,fontSize:13}}>{para(kasaOzet.gider)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0"}}>
                    <span style={{color:T.text,fontSize:14,fontWeight:700}}>📈 NET KÂR (Tahmini)</span>
                    <span style={{color:kasaOzet.net>=0?"#00a854":"#dc2626",fontWeight:800,fontSize:18}}>{para(kasaOzet.net)}</span>
                  </div>
                </div>
                {kasaOzet.bekSiparis>0&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#92400e"}}>
                  ⏳ {kasaOzet.bekSiparis} adet bekleyen sipariş var
                </div>}
              </div>}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}

// LAYOUT
function Layout({baslik,emoji,menu,aktif,setAktif,onGeri,onCikis,kullanici,children}){
  const [menuAcik,setMenuAcik]=useState(false);
  const [gece,geceTog]=useGeceModu();
  const T=getTema(gece);
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',sans-serif",background:T.bg,fontSize:14.5,transition:"background 0.3s"}}>

      {/* ÜST BAR */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",background:T.card,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:100,boxShadow:`0 1px 6px ${T.shadow}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setMenuAcik(true)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,cursor:"pointer",fontSize:18,padding:"4px 10px",lineHeight:1.3}}>☰</button>
          <span style={{fontSize:22}}>{emoji}</span>
          <span style={{color:T.text,fontWeight:700,fontSize:16}}>{baslik}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={geceTog} title={gece?"Gündüz":"Gece"}
            style={{background:gece?"#2a2f42":"#f0f2f8",border:`1px solid ${T.border}`,borderRadius:16,cursor:"pointer",fontSize:16,padding:"5px 9px",color:gece?"#ffd700":"#555"}}>
            {gece?"🌙":"☀️"}
          </button>
          <button onClick={onGeri} style={{...kbtn,fontSize:13,color:T.text2,borderColor:T.border,background:T.card}}>← Menü</button>
          <button onClick={onCikis} style={{...kbtn,fontSize:13,color:"#cf1322",borderColor:"#ffa39e",background:"#fff1f0"}}>Çıkış</button>
        </div>
      </div>

      {/* ÇEKMECE MENÜ — Tema Uyumlu */}
      {menuAcik&&<div onClick={()=>setMenuAcik(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200}}/>}
      <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:300,width:270,background:T.card,display:"flex",flexDirection:"column",transform:menuAcik?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",boxShadow:`4px 0 24px ${T.shadow}`}}>
        <div style={{padding:"20px 18px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,#667eea,#764ba2)"}}>
          <div>
            <div style={{fontSize:28}}>{emoji}</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:16,marginTop:4}}>{baslik}</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:2}}>👤 {kullanici?.ad_soyad}</div>
          </div>
          <button onClick={()=>setMenuAcik(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",cursor:"pointer",fontSize:20,padding:"4px 8px",borderRadius:8}}>✕</button>
        </div>
        <nav style={{flex:1,overflowY:"auto",paddingTop:8,paddingBottom:8,background:T.card}}>
          {menu.map(m=>(
            <button key={m.k} onClick={()=>{setAktif(m.k);setMenuAcik(false);}}
              style={{width:"100%",padding:"13px 18px",border:"none",textAlign:"left",
                background:aktif===m.k?(gece?"rgba(233,69,96,0.12)":"#f0f7ff"):"transparent",
                borderLeft:aktif===m.k?"4px solid #e94560":"4px solid transparent",
                color:aktif===m.k?"#e94560":T.text,cursor:"pointer",fontSize:14.5,
                display:"flex",alignItems:"center",gap:12,fontWeight:aktif===m.k?600:400}}>
              <span style={{fontSize:19,width:24,textAlign:"center"}}>{m.i}</span>{m.l}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:8,background:T.card}}>
          <button onClick={()=>{onGeri();setMenuAcik(false);}} style={{...kbtn,fontSize:13,width:"100%",background:T.card,color:T.text2,borderColor:T.border}}>← Ana Menü</button>
          <button onClick={onCikis} style={{...kbtn,fontSize:13,color:"#cf1322",borderColor:"#ffa39e",background:gece?"rgba(220,38,38,0.1)":"#fff1f0",width:"100%"}}>Çıkış Yap</button>
        </div>
      </div>

      {/* İÇERİK */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px",paddingBottom:75}}>
        {children}
      </div>

      {/* ALT NAV — Tema Uyumlu */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",background:T.card,borderTop:`1px solid ${T.border}`,zIndex:100,boxShadow:`0 -2px 10px ${T.shadow}`}}>
        {menu.slice(0,5).map(m=>(
          <button key={m.k} onClick={()=>setAktif(m.k)}
            style={{flex:1,padding:"7px 2px 9px",border:"none",background:"none",
              color:aktif===m.k?"#e94560":T.text3,cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:1,
              borderTop:aktif===m.k?"2px solid #e94560":"2px solid transparent"}}>
            <span style={{fontSize:21}}>{m.i}</span>
            <span style={{fontSize:9.5,lineHeight:1.2,fontWeight:aktif===m.k?600:400}}>{m.l.slice(0,6)}</span>
          </button>
        ))}
        <button onClick={()=>setMenuAcik(true)}
          style={{flex:1,padding:"7px 2px 9px",border:"none",background:"none",color:T.text3,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,borderTop:"2px solid transparent"}}>
          <span style={{fontSize:21}}>⋯</span>
          <span style={{fontSize:9.5}}>Daha</span>
        </button>
      </div>
    </div>
  );
}

// ÇİÇEKÇİ ANA SAYFA
function CAnaSayfa(){
  const [ozet,setOzet]=useState(null);const [dusukStok,setDusukStok]=useState([]);const [sonSatislar,setSonSatislar]=useState([]);
  const [teslimatUyari,setTeslimatUyari]=useState([]);

  useEffect(()=>{
    const b=bugun();
    const uc_gun_sonra=new Date();uc_gun_sonra.setDate(uc_gun_sonra.getDate()+3);
    const uc_gun_str=uc_gun_sonra.toISOString().split("T")[0];
    Promise.all([
      supabase.from("cicek_satislar").select("toplam_tutar,kdv_tutari,odeme_turu,nakit_fis").gte("satis_tarihi",b+"T00:00:00"),
      supabase.from("cicek_urunler").select("id,urun_adi,stok_miktari,min_stok_uyari,birim").eq("aktif",true),
      supabase.from("cicek_satislar").select("satis_no,musteri_ad_soyad,toplam_tutar,odeme_turu,satis_tarihi").order("satis_tarihi",{ascending:false}).limit(5),
      supabase.from("cicek_siparisler").select("*").neq("durum","teslim_edildi").neq("durum","iptal").lte("teslimat_tarihi",uc_gun_str).gte("teslimat_tarihi",b).order("teslimat_tarihi"),
    ]).then(([s,u,ss,ts])=>{
      const sat=s.data||[];
      setOzet({
        toplam:sat.reduce((t,x)=>t+x.toplam_tutar,0),
        nakit:sat.filter(x=>x.odeme_turu==="nakit").reduce((t,x)=>t+x.toplam_tutar,0),
        kart:sat.filter(x=>x.odeme_turu==="kredi_karti").reduce((t,x)=>t+x.toplam_tutar,0),
        havale:sat.filter(x=>x.odeme_turu==="havale").reduce((t,x)=>t+x.toplam_tutar,0),
        veresiye:sat.filter(x=>x.odeme_turu==="veresiye").reduce((t,x)=>t+x.toplam_tutar,0),
        adet:sat.length,
      });
      setDusukStok((u.data||[]).filter(x=>x.stok_miktari<=(x.min_stok_uyari||5)));
      setSonSatislar(ss.data||[]);
      setTeslimatUyari(ts.data||[]);
    });
  },[]);

  // Anlık yenileme
  const yenile=()=>{
    const b=bugun();
    supabase.from("cicek_satislar").select("toplam_tutar,kdv_tutari,odeme_turu").gte("satis_tarihi",b+"T00:00:00").then(({data})=>{
      const sat=data||[];
      setOzet({toplam:sat.reduce((t,x)=>t+x.toplam_tutar,0),nakit:sat.filter(x=>x.odeme_turu==="nakit").reduce((t,x)=>t+x.toplam_tutar,0),kart:sat.filter(x=>x.odeme_turu==="kredi_karti").reduce((t,x)=>t+x.toplam_tutar,0),havale:sat.filter(x=>x.odeme_turu==="havale").reduce((t,x)=>t+x.toplam_tutar,0),veresiye:sat.filter(x=>x.odeme_turu==="veresiye").reduce((t,x)=>t+x.toplam_tutar,0),adet:sat.length});
    });
    supabase.from("cicek_urunler").select("id,urun_adi,stok_miktari,min_stok_uyari,birim").eq("aktif",true).then(({data})=>setDusukStok((data||[]).filter(x=>x.stok_miktari<=(x.min_stok_uyari||5))));
  };
  useRealtimeYenile(["cicek_satislar","cicek_urunler","cicek_siparisler"],yenile);

  const gunFarki=(tarihStr)=>{
    if(!tarihStr)return 999;
    return Math.ceil((new Date(tarihStr)-new Date())/(1000*60*60*24));
  };

  return(<div>
    <h2 style={bstl}>🌹 Çiçekçi — Bugün</h2>

    {/* TESLİMAT UYARILARI — KIRMIZI */}
    {teslimatUyari.length>0&&<div style={{marginBottom:20}}>
      {teslimatUyari.map(s=>{
        const gun=gunFarki(s.teslimat_tarihi);
        const bugunMu=gun===0||gun<0;
        const yarinMi=gun===1;
        return(<div key={s.id} style={{
          background:bugunMu?"rgba(220,38,38,0.15)":yarinMi?"rgba(220,38,38,0.1)":"rgba(234,67,53,0.08)",
          border:`2px solid ${bugunMu?"#dc2626":yarinMi?"rgba(220,38,38,0.6)":"rgba(220,38,38,0.35)"}`,
          borderRadius:12,padding:"12px 16px",marginBottom:8,
          display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <div>
            <div style={{color:"#dc2626",fontWeight:700,fontSize:15}}>
              {bugunMu?"🚨🚨 BUGÜN TESLİMAT!":yarinMi?"🚨 YARIN TESLİMAT!":"⚠️ "+gun+" gün sonra teslimat"}
              {" — "}{s.musteri_adi}
            </div>
            {s.teslimat_saati&&<div style={{color:"#555",fontSize:13,marginTop:2}}>🕐 {s.teslimat_saati}</div>}
            {s.teslimat_adresi&&<div style={{color:"#555",fontSize:13,marginTop:2}}>📍 {s.teslimat_adresi}</div>}
            {s.notlar&&<div style={{color:"#777",fontSize:12,marginTop:2,fontStyle:"italic"}}>"{s.notlar}"</div>}
          </div>
          <div style={{display:"flex",gap:8,flexDirection:"column",alignItems:"flex-end"}}>
            {s.musteri_tel&&<a href={`https://wa.me/90${s.musteri_tel?.replace(/\D/g,"").slice(-10)}`} target="_blank" rel="noreferrer"
              style={{background:"#25D366",color:"#1a1a2e",padding:"5px 12px",borderRadius:16,textDecoration:"none",fontSize:12,fontWeight:600}}>📱 WA</a>}
            <span style={{color:bugunMu?"#dc2626":yarinMi?"#ff6b6b":"#ffa500",fontWeight:700,fontSize:13}}>
              {bugunMu?"BUGÜN!":yarinMi?"YARIN!":gun+" GÜN"}
            </span>
          </div>
        </div>);
      })}
    </div>}
    {ozet&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:24}}>
      {[
        {l:"Toplam Ciro",v:para(ozet.toplam),c:"#e94560",e:"💰"},
        {l:"Nakit",v:para(ozet.nakit),c:"#00c864",e:"💵"},
        {l:"Kart",v:para(ozet.kart),c:"#4ea8de",e:"💳"},
        {l:"Havale",v:para(ozet.havale),c:"#ffa500",e:"🏦"},
        {l:"Veresiye",v:para(ozet.veresiye),c:"#ff6b6b",e:"📋"},
        {l:"Satış Adedi",v:ozet.adet,c:"#9b59b6",e:"🛒"},
      ].map(s=>(<div key={s.l} style={{...krt,textAlign:"center"}}>
        <div style={{fontSize:22,marginBottom:4}}>{s.e}</div>
        <div style={{color:"#999",fontSize:11}}>{s.l}</div>
        <div style={{color:s.c,fontWeight:700,fontSize:16,marginTop:3}}>{s.v}</div>
      </div>))}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
      <div>
        <h3 style={{color:"#666",fontSize:13,marginBottom:10}}>⚠️ Düşük Stok ({dusukStok.length})</h3>
        {dusukStok.length===0?<p style={{color:"#ccc",fontSize:13}}>✅ Tüm stoklar yeterli</p>:
        dusukStok.map(u=>(<div key={u.id} style={{...krt,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px"}}>
          <span style={{color:"#1a1a2e",fontSize:13}}>{u.urun_adi}</span>
          <span style={{color:"#ff6b6b",fontWeight:700,fontSize:13}}>{u.stok_miktari} {u.birim}</span>
        </div>))}
      </div>
      <div>
        <h3 style={{color:"#666",fontSize:13,marginBottom:10}}>📋 Son Satışlar</h3>
        {sonSatislar.map(s=>(<div key={s.id} style={{...krt,marginBottom:8,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#1a1a2e",fontSize:12,fontWeight:600}}>#{s.satis_no}</span>
            <span style={{color:"#e94560",fontWeight:700,fontSize:12}}>{para(s.toplam_tutar)}</span>
          </div>
          <div style={{color:"#aaa",fontSize:11,marginTop:2}}>
            {s.musteri_ad_soyad||"Kasadan"} · {new Date(s.satis_tarihi).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}
          </div>
        </div>))}
      </div>
    </div>
  </div>);
}

// SATIŞ YAP
function CSatis({k}){
  const [urunler,setUrunler]=useState([]);const [hesaplar,setHesaplar]=useState([]);const [musteriler,setMusteriler]=useState([]);
  const [sepet,setSepet]=useState([]);const [odeme,setOdeme]=useState("nakit");const [hesapId,setHesapId]=useState("");
  const [musteriId,setMusteriId]=useState("");const [musteriAd,setMusteriAd]=useState("");const [nakitFis,setNakitFis]=useState(false);
  const [notlar,setNotlar]=useState("");const [ok,setOk]=useState(false);const [ara,setAra]=useState("");
  const [sonSatis,setSonSatis]=useState(null);const [sonKalemler,setSonKalemler]=useState([]);
  const [kategoriFiltre,setKategoriFiltre]=useState("hepsi");const [kategoriler,setKategoriler]=useState([]);
  const [receteler,setReceteler]=useState({}); // urun_id -> [{malzeme_id, malzeme_adi, miktar}]

  useEffect(()=>{
    supabase.from("cicek_urunler").select("*,cicek_kategoriler(id,kategori_adi)").eq("aktif",true).order("urun_adi").then(({data})=>setUrunler(data||[]));
    supabase.from("hesap_adlari").select("*").eq("aktif",true).then(({data})=>setHesaplar(data||[]));
    supabase.from("musteriler").select("*").then(({data})=>setMusteriler(data||[]));
    supabase.from("cicek_kategoriler").select("*").then(({data})=>setKategoriler(data||[]));
    // Reçeteleri yükle
    supabase.from("cicek_urun_receteleri").select("*,malzeme:cicek_urunler!cicek_urun_receteleri_malzeme_id_fkey(id,urun_adi,birim)").then(({data})=>{
      const r={};
      (data||[]).forEach(x=>{
        if(!r[x.urun_id])r[x.urun_id]=[];
        r[x.urun_id].push({malzeme_id:x.malzeme_id,malzeme_adi:x.malzeme?.urun_adi,birim:x.malzeme?.birim||"dal",miktar:x.miktar});
      });
      setReceteler(r);
    });
  }, []);

  const filtre=urunler.filter(u=>
    u.urun_adi.toLowerCase().includes(ara.toLowerCase()) &&
    (kategoriFiltre==="hepsi" || u.cicek_kategoriler?.id===kategoriFiltre)
  );

  const ekle=(u)=>{
    const m=sepet.find(s=>s.urun_id===u.id);
    if(m) setSepet(sepet.map(s=>s.urun_id===u.id?{...s,miktar:s.miktar+1,toplam:(s.miktar+1)*s.birim_fiyat}:s));
    else setSepet([...sepet,{urun_id:u.id,urun_adi:u.urun_adi,miktar:1,birim:u.birim||"dal",birim_fiyat:u.satis_fiyati,kdv_orani:u.kdv_orani||8,toplam:u.satis_fiyati,recete:receteler[u.id]||[]}]);
  };

  const mGuncelle=(id,miktar)=>{
    if(miktar<=0){setSepet(sepet.filter(s=>s.urun_id!==id));return;}
    setSepet(sepet.map(s=>s.urun_id===id?{...s,miktar,toplam:miktar*s.birim_fiyat}:s));
  };

  const fiyatGuncelle=(id,fiyat)=>{
    setSepet(sepet.map(s=>s.urun_id===id?{...s,birim_fiyat:+fiyat,toplam:s.miktar*+fiyat}:s));
  };

  const toplam=sepet.reduce((t,s)=>t+s.toplam,0);
  const kdv=sepet.reduce((t,s)=>t+(s.toplam*s.kdv_orani/(100+s.kdv_orani)),0);
  const hFil=hesaplar.filter(h=>h.hesap_turu===(odeme==="kredi_karti"?"kredi_karti":odeme==="havale"?"havale":"nakit"));

  const kaydet=async()=>{
    if(!sepet.length)return toast("Sepet boş!","uyari");
    if((odeme==="havale"||odeme==="kredi_karti")&&!hesapId)return toast("Hesap seçin!","uyari");
    if(odeme==="veresiye"&&!musteriAd)return toast("Müşteri adı girin!","uyari");
    const{data:s}=await supabase.from("cicek_satislar").insert({
      musteri_id:musteriId||null,musteri_ad_soyad:musteriAd||null,
      odeme_turu:odeme,hesap_id:hesapId||null,
      toplam_tutar:toplam,kdv_tutari:kdv,
      nakit_fis:nakitFis,notlar,kullanici_id:k?.id
    }).select().single();
    await supabase.from("cicek_satis_kalemleri").insert(sepet.map(x=>({satis_id:s.id,...x,recete:undefined})));

    for(const x of sepet){
      const urunRecete=x.recete||receteler[x.urun_id]||[];
      if(urunRecete.length>0){
        // Reçeteli ürün — malzemeleri stoktan düş
        for(const malzeme of urunRecete){
          const dusecek=malzeme.miktar*x.miktar;
          const{data:m}=await supabase.from("cicek_urunler").select("stok_miktari,urun_adi").eq("id",malzeme.malzeme_id).single();
          const yeniStok=Math.max(0,(m?.stok_miktari||0)-dusecek);
          await supabase.from("cicek_urunler").update({stok_miktari:yeniStok}).eq("id",malzeme.malzeme_id);
          await supabase.from("cicek_stok_hareketleri").insert({urun_id:malzeme.malzeme_id,hareket_turu:"satis",miktar:dusecek,onceki_stok:m?.stok_miktari||0,sonraki_stok:yeniStok,aciklama:`Reçete: ${x.urun_adi} x${x.miktar}`});
        }
      } else {
        // Normal ürün — direkt stoktan düş
        const{data:u}=await supabase.from("cicek_urunler").select("stok_miktari").eq("id",x.urun_id).single();
        const yeniStok=Math.max(0,(u?.stok_miktari||0)-x.miktar);
        await supabase.from("cicek_urunler").update({stok_miktari:yeniStok}).eq("id",x.urun_id);
      }
    }
    if(odeme==="veresiye") await supabase.from("cicek_cari").insert({musteri_id:musteriId||null,satis_id:s.id,tutar:toplam,odenen:0,kalan:toplam});
    setSonSatis(s);setSonKalemler([...sepet]);
    setSepet([]);setMusteriAd("");setMusteriId("");setHesapId("");setNotlar("");setNakitFis(false);
    setOk(true);setTimeout(()=>setOk(false),4000);
  };

  return(<div>
    <h2 style={bstl}>🛒 Satış Yap</h2>
    {ok&&<div style={{background:"rgba(0,200,100,0.12)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:10,padding:"10px 16px",color:"#00c864",marginBottom:14,fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span>✅ Satış kaydedildi! #{sonSatis?.satis_no}</span>
      <button onClick={()=>sonSatis&&cicekFisYazdir(sonSatis,sonKalemler)} style={{...kbtn,fontSize:11,color:"#00c864",borderColor:"rgba(0,200,100,0.3)"}}>🖨️ Fiş Yazdır</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:24}}>
      <div>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <input value={ara} onChange={e=>setAra(e.target.value)} placeholder="🔍 Ürün ara..." style={{...inp,flex:1,minWidth:150}}/>
          <select value={kategoriFiltre} onChange={e=>setKategoriFiltre(e.target.value)} style={{...inp,width:"auto"}}>
            <option value="hepsi">Tüm Kategoriler</option>
            {kategoriler.map(k=><option key={k.id} value={k.id}>{k.kategori_adi}</option>)}
          </select>
        </div>
        {filtre.length===0&&<p style={{color:"#bbb",fontSize:13}}>Ürün bulunamadı. Stok sayfasından ürün ekleyin.</p>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
          {filtre.map(u=>(<div key={u.id} onClick={()=>ekle(u)} style={{background:"#f8f9fc",border:`1px solid ${u.stok_miktari<=0?"rgba(255,107,107,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:12,cursor:u.stok_miktari<=0?"not-allowed":"pointer",opacity:u.stok_miktari<=0?0.5:1,transition:"border-color 0.2s"}}
            onMouseEnter={e=>u.stok_miktari>0&&(e.currentTarget.style.borderColor="#e94560")}
            onMouseLeave={e=>e.currentTarget.style.borderColor=u.stok_miktari<=0?"rgba(255,107,107,0.4)":"rgba(255,255,255,0.08)"}>
            <div style={{color:"#aaa",fontSize:10}}>{u.cicek_kategoriler?.kategori_adi||""}</div>
            <div style={{color:"#1a1a2e",fontWeight:600,fontSize:13,marginTop:2}}>{u.urun_adi}</div>
            <div style={{color:"#e94560",fontWeight:700,marginTop:5,fontSize:14}}>{para(u.satis_fiyati)}<span style={{color:"#aaa",fontSize:10}}>/{u.birim||"dal"}</span></div>
            <div style={{color:u.stok_miktari<=(u.min_stok_uyari||5)?"#ff6b6b":"#aaa",fontSize:10,marginTop:3}}>
              {u.stok_miktari<=0?"❌ Stok yok":`📦 ${u.stok_miktari} ${u.birim||"dal"}`}
            </div>
          </div>))}
        </div>
      </div>

      <div style={{...fkrt}}>
        <h3 style={{color:"#1a1a2e",marginTop:0,fontSize:15}}>🧺 Sepet</h3>
        {!sepet.length&&<p style={{color:"#bbb",fontSize:13}}>Ürüne tıklayarak sepete ekleyin...</p>}
        {sepet.map(s=>(<div key={s.urun_id} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{flex:1}}>
              <div style={{color:"#1a1a2e",fontSize:12,fontWeight:600}}>{s.urun_adi}
                {(s.recete||[]).length>0&&<span style={{fontSize:10,color:"#ffa500",marginLeft:6}}>📋 Reçeteli</span>}
              </div>
              {(s.recete||[]).length>0
                ?<div style={{color:"rgba(255,165,0,0.7)",fontSize:10,marginTop:2}}>{s.recete.map(r=>`${r.malzeme_adi} ×${r.miktar*s.miktar}${r.birim}`).join(" · ")}</div>
                :<div style={{color:"#aaa",fontSize:10}}>{s.birim}</div>
              }
            </div>
            <span style={{color:"#e94560",fontWeight:700,fontSize:13}}>{para(s.toplam)}</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>mGuncelle(s.urun_id,s.miktar-1)} style={mbtn}>-</button>
            <span style={{color:"#1a1a2e",fontSize:12,minWidth:20,textAlign:"center"}}>{s.miktar}</span>
            <button onClick={()=>mGuncelle(s.urun_id,s.miktar+1)} style={mbtn}>+</button>
            <input type="number" value={s.birim_fiyat} onChange={e=>fiyatGuncelle(s.urun_id,e.target.value)}
              style={{...inp,width:70,fontSize:11,padding:"4px 7px"}} />
            <span style={{color:"#aaa",fontSize:10}}>₺/{s.birim}</span>
          </div>
        </div>))}

        <div style={{marginTop:14}}>
          <label style={lbl}>Ödeme Türü</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {["nakit","kredi_karti","havale","veresiye"].map(t=>(<button key={t} onClick={()=>setOdeme(t)}
              style={{...obtn,borderColor:odeme===t?"#e94560":"#dde1ec",background:odeme===t?"rgba(233,69,96,0.08)":"transparent",color:odeme===t?"#e94560":"#666"}}>
              {t==="nakit"?"💵 Nakit":t==="kredi_karti"?"💳 Kart":t==="havale"?"🏦 Havale":"📋 Veresiye"}
            </button>))}
          </div>
          {(odeme==="havale"||odeme==="kredi_karti")&&<select value={hesapId} onChange={e=>setHesapId(e.target.value)} style={{...inp,marginBottom:8}}><option value="">Hesap seçin...</option>{hFil.map(h=><option key={h.id} value={h.id}>{h.hesap_adi}</option>)}</select>}
          {odeme==="veresiye"&&<div style={{background:"#fff8f0",border:"1px solid #ffd591",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontWeight:600,color:"#d48806",fontSize:13,marginBottom:8}}>📋 Veresiye Müşteri</div>
            {/* Kayıtlı müşteri seç */}
            <select value={musteriId} onChange={e=>{
              setMusteriId(e.target.value);
              const m=musteriler.find(x=>x.id===e.target.value);
              if(m) setMusteriAd(m.ad_soyad);
            }} style={{...inp,marginBottom:6}}>
              <option value="">Kayıtlı müşteri seç...</option>
              {musteriler.map(m=><option key={m.id} value={m.id}>{m.ad_soyad} {m.telefon?`(${m.telefon})`:""}</option>)}
            </select>
            {/* Seçili müşteri bilgisi */}
            {musteriId&&(()=>{const m=musteriler.find(x=>x.id===musteriId);return m?(
              <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"8px 12px",marginBottom:6,fontSize:13}}>
                <div style={{fontWeight:600,color:"#15803d"}}>👤 {m.ad_soyad}</div>
                {m.telefon&&<div style={{color:"#166534",fontSize:12}}>📞 {m.telefon}</div>}
                {m.adres&&<div style={{color:"#166534",fontSize:12}}>📍 {m.adres}</div>}
              </div>
            ):null;})()}
            {/* Manuel isim */}
            <input value={musteriAd} onChange={e=>{setMusteriAd(e.target.value);if(!e.target.value)setMusteriId("");}} placeholder="veya müşteri adı yazın *" style={{...inp,marginBottom:6}}/>
            {/* Yeni müşteri hızlı kayıt */}
            {musteriAd&&!musteriId&&<div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input id="hizli_tel" placeholder="Telefon (opsiyonel)" style={{...inp,flex:1,fontSize:12}}/>
              <button onClick={async()=>{
                const tel=document.getElementById("hizli_tel")?.value||"";
                const{data:yeni}=await supabase.from("musteriler").insert({ad_soyad:musteriAd,telefon:tel||null}).select().single();
                if(yeni){setMusteriId(yeni.id);supabase.from("musteriler").select("*").then(({data})=>setMusteriler(data||[]));}
              }} style={{...abtn,fontSize:12,padding:"8px 12px",whiteSpace:"nowrap"}}>
                + Kaydet
              </button>
            </div>}
          </div>}
          <label style={{display:"flex",alignItems:"center",gap:7,color:"#666",fontSize:12,margin:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={nakitFis} onChange={e=>setNakitFis(e.target.checked)}/>🧾 Nakit Fişi Kesildi
          </label>
          <input value={notlar} onChange={e=>setNotlar(e.target.value)} placeholder="Not..." style={inp}/>
          <div style={{borderTop:"1px solid #e8ebf5",marginTop:12,paddingTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",color:"#999",fontSize:12,marginBottom:3}}><span>KDV</span><span>{para(kdv)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",color:"#1a1a2e",fontWeight:700,fontSize:18}}><span>TOPLAM</span><span style={{color:"#e94560"}}>{para(toplam)}</span></div>
          </div>
          <button onClick={kaydet} style={{...abtn,width:"100%",marginTop:12}}>✅ Satışı Kaydet</button>
        </div>
      </div>
    </div>
  </div>);
}

// SATIŞ LİSTESİ
function CSatisListesi(){
  const [satislar,setSatislar]=useState([]);const [ft,setFt]=useState(bugun());const [ftBit,setFtBit]=useState(bugun());const [aralikMod,setAralikMod]=useState(false);const [fo,setFo]=useState("hepsi");
  const [secili,setSecili]=useState(null);const [seciliKalemler,setSeciliKalemler]=useState([]);
  const [duzenleMod,setDuzenleMod]=useState(false);
  const [duzenleForm,setDuzenleForm]=useState({});
  const [excelYukleniyor,setExcelYukleniyor]=useState(false);

  const yukle=()=>{
    const bas=ft;const bit=aralikMod?ftBit:ft;
    let q=supabase.from("cicek_satislar").select("*,hesap_adlari(hesap_adi)").gte("satis_tarihi",bas+"T00:00:00").lte("satis_tarihi",bit+"T23:59:59").order("satis_tarihi",{ascending:false});
    if(fo!=="hepsi")q=q.eq("odeme_turu",fo);
    q.then(({data})=>setSatislar(data||[]));
  };

  useEffect(()=>{yukle();},[ft,ftBit,aralikMod,fo]);
  useRealtimeYenile(["cicek_satislar"],yukle,[ft,ftBit,aralikMod,fo]);

  // Çiçekçi Excel Export
  const cicekExcelIndir=async()=>{
    setExcelYukleniyor(true);
    try{
      const XLSX=await (async()=>{if(window.XLSX)return window.XLSX;return new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";s.onload=()=>res(window.XLSX);s.onerror=rej;document.head.appendChild(s);});})();
      const bas=ft;const bit=aralikMod?ftBit:ft;
      const dosyaAdi=`Cicekci_Satislar_${bas}${aralikMod?"_"+bit:""}.xlsx`;
      const paraFmt=(n)=>new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(n||0);
      const tarihFmt=(d)=>d?new Date(d).toLocaleDateString("tr-TR"):"-";
      const odemeYaz=(o)=>({nakit:"Nakit",kredi_karti:"Kredi Kartı",havale:"Havale/EFT",veresiye:"Veresiye"}[o]||o||"-");

      // Satış listesi
      const satisSheet=satislar.map(s=>({
        "Satış No":"#"+s.satis_no,"Tarih":tarihFmt(s.satis_tarihi),
        "Saat":new Date(s.satis_tarihi).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}),
        "Müşteri":s.musteri_ad_soyad||"-","Ödeme Türü":odemeYaz(s.odeme_turu),
        "KDV Fişi":s.nakit_fis?"Evet":"Hayır","KDV (₺)":paraFmt(s.kdv_tutari),
        "Toplam (₺)":paraFmt(s.toplam_tutar),"Not":s.notlar||"",
      }));

      // Özet hesapla
      const exOz=satislar.reduce((t,s)=>({toplam:t.toplam+s.toplam_tutar,nakit:t.nakit+(s.odeme_turu==="nakit"?s.toplam_tutar:0),kart:t.kart+(s.odeme_turu==="kredi_karti"?s.toplam_tutar:0),havale:t.havale+(s.odeme_turu==="havale"?s.toplam_tutar:0),veresiye:t.veresiye+(s.odeme_turu==="veresiye"?s.toplam_tutar:0)}),{toplam:0,nakit:0,kart:0,havale:0,veresiye:0});
      const ozet=[
        {Alan:"Dönem",Değer:aralikMod?`${bas} - ${bit}`:bas},
        {Alan:"Toplam Satış",Değer:satislar.length},
        {Alan:"Toplam Ciro (₺)",Değer:paraFmt(exOz.toplam)},
        {Alan:"Nakit (₺)",Değer:paraFmt(exOz.nakit)},
        {Alan:"Kart (₺)",Değer:paraFmt(exOz.kart)},
        {Alan:"Havale (₺)",Değer:paraFmt(exOz.havale)},
        {Alan:"Veresiye (₺)",Değer:paraFmt(exOz.veresiye)},
        {Alan:"Rapor Tarihi",Değer:new Date().toLocaleString("tr-TR")},
      ];

      const wb=XLSX.utils.book_new();
      const wsOzet=XLSX.utils.json_to_sheet(ozet);wsOzet["!cols"]=[{wch:22},{wch:22}];
      const wsSatislar=XLSX.utils.json_to_sheet(satisSheet.length?satisSheet:[{Bilgi:"Bu dönemde satış yok."}]);
      wsSatislar["!cols"]=[{wch:10},{wch:14},{wch:8},{wch:22},{wch:14},{wch:10},{wch:12},{wch:14},{wch:24}];
      XLSX.utils.book_append_sheet(wb,wsOzet,"Özet");
      XLSX.utils.book_append_sheet(wb,wsSatislar,"Satışlar");
      XLSX.writeFile(wb,dosyaAdi);
      toast("Excel indirildi!","basari");
    }catch(e){toast("Excel hatası: "+e.message,"hata");}
    setExcelYukleniyor(false);
  };

  const satisAc=async(s)=>{
    const{data}=await supabase.from("cicek_satis_kalemleri").select("*").eq("satis_id",s.id);
    setSecili(s);setSeciliKalemler(data||[]);setDuzenleMod(false);
    setDuzenleForm({musteri_ad_soyad:s.musteri_ad_soyad||"",odeme_turu:s.odeme_turu||"nakit",toplam_tutar:s.toplam_tutar||0,notlar:s.notlar||"",nakit_fis:s.nakit_fis||false});
  };

  const satisGuncelle=async()=>{
    await supabase.from("cicek_satislar").update({
      musteri_ad_soyad:duzenleForm.musteri_ad_soyad||null,
      odeme_turu:duzenleForm.odeme_turu,
      toplam_tutar:+duzenleForm.toplam_tutar,
      notlar:duzenleForm.notlar||null,
      nakit_fis:duzenleForm.nakit_fis,
    }).eq("id",secili.id);
    setDuzenleMod(false);setSecili(null);yukle();
    toast("Satış güncellendi!","basari");
  };

  const satisSil=async(s)=>{
    if(!confirm(`#${s.satis_no} numaralı satışı silmek istediğinizden emin misiniz?\n${para(s.toplam_tutar)}`))return;
    // Stok geri yükleme — silinen satışın kalemlerini stoka geri ekle
    const{data:kalemlerData}=await supabase.from("cicek_satis_kalemleri").select("*").eq("satis_id",s.id);
    if(kalemlerData){
      for(const kl of kalemlerData){
        if(kl.urun_id){
          const{data:u}=await supabase.from("cicek_urunler").select("stok_miktari").eq("id",kl.urun_id).single();
          if(u){
            const yeniStok=(u.stok_miktari||0)+(kl.miktar||0);
            await supabase.from("cicek_urunler").update({stok_miktari:yeniStok}).eq("id",kl.urun_id);
            await supabase.from("cicek_stok_hareketleri").insert({urun_id:kl.urun_id,hareket_turu:"duzeltme",miktar:kl.miktar||0,onceki_stok:u.stok_miktari,sonraki_stok:yeniStok,aciklama:`Satış silindi: #${s.satis_no}`});
          }
        }
      }
    }
    // Veresiye kaydı varsa sil
    if(s.odeme_turu==="veresiye") await supabase.from("cicek_cari").delete().eq("satis_id",s.id);
    await supabase.from("cicek_satis_kalemleri").delete().eq("satis_id",s.id);
    await supabase.from("cicek_satislar").delete().eq("id",s.id);
    setSecili(null);yukle();
    toast("Satış silindi, stok geri yüklendi","basari");
  };

  const oz=satislar.reduce((t,s)=>({toplam:t.toplam+s.toplam_tutar,nakit:t.nakit+(s.odeme_turu==="nakit"?s.toplam_tutar:0),kart:t.kart+(s.odeme_turu==="kredi_karti"?s.toplam_tutar:0),havale:t.havale+(s.odeme_turu==="havale"?s.toplam_tutar:0),veresiye:t.veresiye+(s.odeme_turu==="veresiye"?s.toplam_tutar:0)}),{toplam:0,nakit:0,kart:0,havale:0,veresiye:0});

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h2 style={{...bstl,margin:0}}>📋 Satış Listesi</h2>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={()=>setAralikMod(!aralikMod)} style={{...kbtn,fontSize:12,background:aralikMod?"rgba(233,69,96,0.08)":"transparent",color:aralikMod?"#e94560":"#666",borderColor:aralikMod?"rgba(233,69,96,0.4)":"#dde1ec"}}>
          {aralikMod?"📅 Aralık":"📅 Tek Gün"}
        </button>
        <button onClick={cicekExcelIndir} disabled={excelYukleniyor} style={{...kbtn,background:"#16a34a",color:"#fff",border:"none",fontWeight:600,fontSize:12,opacity:excelYukleniyor?0.7:1}}>
          {excelYukleniyor?"⏳ Hazırlanıyor...":"📥 Excel İndir"}
        </button>
      </div>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
      <input type="date" value={ft} onChange={e=>setFt(e.target.value)} style={{...inp,width:"auto"}}/>
      {aralikMod&&<><span style={{color:"#888",fontSize:13}}>→</span><input type="date" value={ftBit} onChange={e=>setFtBit(e.target.value)} style={{...inp,width:"auto"}}/></>}
      <select value={fo} onChange={e=>setFo(e.target.value)} style={{...inp,width:"auto"}}>
        <option value="hepsi">Tümü</option><option value="nakit">Nakit</option><option value="kredi_karti">Kart</option><option value="havale">Havale</option><option value="veresiye">Veresiye</option>
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10,marginBottom:18}}>
      {[{l:"Toplam",v:oz.toplam,c:"#e94560"},{l:"Nakit",v:oz.nakit,c:"#00a854"},{l:"Kart",v:oz.kart,c:"#1677ff"},{l:"Havale",v:oz.havale,c:"#d48806"},{l:"Veresiye",v:oz.veresiye,c:"#dc2626"}].map(o=>(<div key={o.l} style={{...krt,textAlign:"center"}}>
        <div style={{color:"#999",fontSize:11}}>{o.l}</div>
        <div style={{color:o.c,fontWeight:700,fontSize:14,marginTop:3}}>{para(o.v)}</div>
      </div>))}
    </div>
    <Tablo bas={["No","Saat","Müşteri","Ödeme","KDV","Tutar",""]}>
      {satislar.map((s,i)=>(<tr key={s.id} style={{borderBottom:"1px solid #f0f2f8",background:i%2===0?"transparent":"#fafbff"}}>
        <td style={td}>#{s.satis_no}</td>
        <td style={td}>{new Date(s.satis_tarihi).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</td>
        <td style={td}>{s.musteri_ad_soyad||"-"}</td>
        <td style={td}><Badge tip={s.odeme_turu}/></td>
        <td style={td}>{s.nakit_fis?"✅":"-"}</td>
        <td style={{...td,color:"#e94560",fontWeight:700}}>{para(s.toplam_tutar)}</td>
        <td style={td}>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>satisAc(s)} style={{...kbtn,fontSize:11,padding:"5px 9px"}}>Detay</button>
            <button onClick={()=>satisAc(s).then(()=>setDuzenleMod(true))} style={{...kbtn,fontSize:11,padding:"5px 9px",color:"#1677ff"}}>✏️</button>
            <button onClick={()=>satisSil(s)} style={{...kbtn,fontSize:11,padding:"5px 9px",color:"#dc2626"}}>🗑</button>
          </div>
        </td>
      </tr>))}
    </Tablo>
    {secili&&<Modal onKapat={()=>{setSecili(null);setDuzenleMod(false);}} genislik={520}>
      {!duzenleMod?(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{color:"#1a1a2e",margin:0}}>Satış #{secili.satis_no}</h3>
            <button onClick={()=>setDuzenleMod(true)} style={{...kbtn,fontSize:12,color:"#1677ff"}}>✏️ Düzenle</button>
          </div>
          {seciliKalemler.map(k=>(<div key={k.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f2f8"}}>
            <span style={{color:"#333",fontSize:13}}>{k.urun_adi} × {k.miktar} {k.birim}</span>
            <span style={{color:"#e94560",fontWeight:600}}>{para(k.toplam)}</span>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"2px solid #f0f2f8"}}>
            <span style={{color:"#1a1a2e",fontWeight:700}}>TOPLAM</span>
            <span style={{color:"#e94560",fontWeight:700,fontSize:16}}>{para(secili.toplam_tutar)}</span>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>cicekFisYazdir(secili,seciliKalemler)} style={{...abtn,flex:1}}>🖨️ Fiş Yazdır</button>
            <button onClick={()=>satisSil(secili)} style={{...kbtn,flex:1,color:"#dc2626",borderColor:"#fca5a5"}}>🗑 Sil</button>
          </div>
        </div>
      ):(
        <div>
          <h3 style={{color:"#1a1a2e",marginTop:0}}>✏️ Satış Düzenle #{secili.satis_no}</h3>
          <div style={{display:"grid",gap:12,marginBottom:14}}>
            <div><label style={lbl}>Müşteri Adı</label><input value={duzenleForm.musteri_ad_soyad} onChange={e=>setDuzenleForm(f=>({...f,musteri_ad_soyad:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Ödeme Türü</label>
              <select value={duzenleForm.odeme_turu} onChange={e=>setDuzenleForm(f=>({...f,odeme_turu:e.target.value}))} style={inp}>
                <option value="nakit">💵 Nakit</option><option value="kredi_karti">💳 Kart</option><option value="havale">🏦 Havale</option><option value="veresiye">📋 Veresiye</option>
              </select>
            </div>
            <div><label style={lbl}>Toplam Tutar ₺</label><input type="number" value={duzenleForm.toplam_tutar} onChange={e=>setDuzenleForm(f=>({...f,toplam_tutar:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Not</label><input value={duzenleForm.notlar} onChange={e=>setDuzenleForm(f=>({...f,notlar:e.target.value}))} style={inp}/></div>
            <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:13}}>
              <input type="checkbox" checked={duzenleForm.nakit_fis} onChange={e=>setDuzenleForm(f=>({...f,nakit_fis:e.target.checked}))}/>
              🧾 KDV Fişi Kesildi
            </label>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={satisGuncelle} style={{...abtn,flex:2}}>💾 Kaydet</button>
            <button onClick={()=>setDuzenleMod(false)} style={{...kbtn,flex:1}}>İptal</button>
          </div>
        </div>
      )}
    </Modal>}
  </div>);
}

// STOK YÖNETİMİ — GELİŞMİŞ
function CStok(){
  const [urunler,setUrunler]=useState([]);const [kategoriler,setKategoriler]=useState([]);
  const [tab,setTab]=useState("liste");
  const [form,setForm]=useState({urun_adi:"",satis_fiyati:"",alis_fiyati:"",stok_miktari:"",birim:"dal",kdv_orani:8,min_stok_uyari:10,barkod:""});
  const [katId,setKatId]=useState("");
  const [karOrani,setKarOrani]=useState(50);
  const [girisForm,setGirisForm]=useState({urun_id:"",miktar:"",birim_fiyat:"",aciklama:""});
  const [zaiyatForm,setZaiyatForm]=useState({urun_id:"",miktar:"",neden:"Çürüme",aciklama:""});
  const [hareketler,setHareketler]=useState([]);
  const [ok,setOk]=useState("");
  // Reçete
  const [receteUrunId,setReceteUrunId]=useState("");
  const [receteKalemler,setReceteKalemler]=useState([]);
  const [mevcutReceteler,setMevcutReceteler]=useState([]);
  // ✅ Arama + Filtre + Inline Düzenleme
  const [stokAra,setStokAra]=useState("");
  const [stokKatFiltre,setStokKatFiltre]=useState("");
  const [stokDurumFiltre,setStokDurumFiltre]=useState("");
  const [duzenleId,setDuzenleId]=useState(null);
  const [duzenleData,setDuzenleData]=useState({});

  const ZAIYAT_NEDENLERI=["Çürüme","Solar","Kırılma","Çalınma","Fire","Diğer"];
  const BIRIMLER=["dal","demet","adet","buket","saksı","kg","paket","çift"];
  const KAR_ORANLARI=[{l:"Yok",v:0},{l:"+25%",v:25},{l:"+50%",v:50},{l:"+75%",v:75},{l:"+100%",v:100},{l:"+150%",v:150}];

  const yukle=()=>supabase.from("cicek_urunler").select("*,cicek_kategoriler(kategori_adi)").eq("aktif",true).order("urun_adi").then(({data})=>setUrunler(data||[]));
  useEffect(()=>{
    yukle();
    supabase.from("cicek_kategoriler").select("*").then(({data})=>setKategoriler(data||[]));
    supabase.from("cicek_stok_hareketleri").select("*,cicek_urunler(urun_adi)").order("tarih",{ascending:false}).limit(50).then(({data})=>setHareketler(data||[]));
    receteYukle();
  },[]);

  const receteYukle=()=>supabase.from("cicek_urun_receteleri").select("*,urun:cicek_urunler!cicek_urun_receteleri_urun_id_fkey(urun_adi),malzeme:cicek_urunler!cicek_urun_receteleri_malzeme_id_fkey(urun_adi,birim)").then(({data})=>setMevcutReceteler(data||[]));

  // Otomatik satış fiyatı hesapla
  const alisFiyatiDegisti=(v)=>{ const s=karOrani>0?Math.ceil(+v*(1+karOrani/100)/5)*5:+v; setForm(f=>({...f,alis_fiyati:v,satis_fiyati:s||""})); };
  const karOraniDegisti=(oran)=>{ setKarOrani(oran); if(form.alis_fiyati){ const s=oran>0?Math.ceil(+form.alis_fiyati*(1+oran/100)/5)*5:+form.alis_fiyati; setForm(f=>({...f,satis_fiyati:s})); } };

  // Inline düzenleme kaydet
  const duzenleKaydet=async(id)=>{
    if(!duzenleData.satis_fiyati)return toast("Satış fiyatı gerekli!","uyari");
    const eskiStok=urunler.find(u=>u.id===id)?.stok_miktari||0;
    const yeniStok=+duzenleData.stok_miktari||0;
    await supabase.from("cicek_urunler").update({
      urun_adi:duzenleData.urun_adi, alis_fiyati:+duzenleData.alis_fiyati||0,
      satis_fiyati:+duzenleData.satis_fiyati, stok_miktari:yeniStok,
      birim:duzenleData.birim||"dal", kdv_orani:+duzenleData.kdv_orani||8,
      min_stok_uyari:+duzenleData.min_stok_uyari||10, kategori_id:duzenleData.kategori_id||null,
    }).eq("id",id);
    if(yeniStok!==eskiStok) await supabase.from("cicek_stok_hareketleri").insert({urun_id:id,hareket_turu:"duzeltme",miktar:Math.abs(yeniStok-eskiStok),onceki_stok:eskiStok,sonraki_stok:yeniStok,aciklama:"Manuel düzeltme"});
    setDuzenleId(null);setDuzenleData({});yukle();
    setOk("✅ Ürün güncellendi!");setTimeout(()=>setOk(""),3000);
  };

  const urunSil=async(id,ad)=>{
    if(!confirm(`"${ad}" ürününü silmek istediğinizden emin misiniz?`))return;
    await supabase.from("cicek_urunler").update({aktif:false}).eq("id",id);
    yukle();
  };

  const urunKaydet=async()=>{
    if(!form.urun_adi)return toast("Ürün adı girin!","uyari");
    const otoBarkod="CK"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
    const barkod=form.barkod||otoBarkod;
    await supabase.from("cicek_urunler").insert({...form,barkod,kategori_id:katId||null,satis_fiyati:+form.satis_fiyati,alis_fiyati:+form.alis_fiyati,stok_miktari:+form.stok_miktari});
    if(+form.stok_miktari>0){
      const{data:u}=await supabase.from("cicek_urunler").select("id").eq("urun_adi",form.urun_adi).single();
      if(u) await supabase.from("cicek_stok_hareketleri").insert({urun_id:u.id,hareket_turu:"giris",miktar:+form.stok_miktari,onceki_stok:0,sonraki_stok:+form.stok_miktari,aciklama:"Başlangıç stoğu"});
    }
    setOk("✅ Ürün eklendi!");setTab("liste");yukle();setTimeout(()=>setOk(""),3000);
  };

  const stokGiris=async()=>{
    if(!girisForm.urun_id||!girisForm.miktar)return toast("Ürün ve miktar girin!","uyari");
    const u=urunler.find(x=>x.id===girisForm.urun_id);
    const onceki=u?.stok_miktari||0;const sonraki=onceki+ +girisForm.miktar;
    await supabase.from("cicek_urunler").update({stok_miktari:sonraki,alis_fiyati:girisForm.birim_fiyat?+girisForm.birim_fiyat:(u?.alis_fiyati||0)}).eq("id",girisForm.urun_id);
    await supabase.from("cicek_stok_hareketleri").insert({urun_id:girisForm.urun_id,hareket_turu:"giris",miktar:+girisForm.miktar,onceki_stok:onceki,sonraki_stok:sonraki,birim_fiyat:girisForm.birim_fiyat?+girisForm.birim_fiyat:null,aciklama:girisForm.aciklama||"Stok girişi"});
    setOk(`✅ ${u?.urun_adi} — ${girisForm.miktar} ${u?.birim||"dal"} stok eklendi!`);
    setGirisForm({urun_id:"",miktar:"",birim_fiyat:"",aciklama:""});
    yukle();setTimeout(()=>setOk(""),4000);
  };

  const zaiyatKaydet=async()=>{
    if(!zaiyatForm.urun_id||!zaiyatForm.miktar)return toast("Ürün ve miktar girin!","uyari");
    const u=urunler.find(x=>x.id===zaiyatForm.urun_id);
    const onceki=u?.stok_miktari||0;const sonraki=Math.max(0,onceki- +zaiyatForm.miktar);
    await supabase.from("cicek_urunler").update({stok_miktari:sonraki}).eq("id",zaiyatForm.urun_id);
    await supabase.from("cicek_stok_hareketleri").insert({urun_id:zaiyatForm.urun_id,hareket_turu:"zaiyat",miktar:+zaiyatForm.miktar,onceki_stok:onceki,sonraki_stok:sonraki,aciklama:`${zaiyatForm.neden}${zaiyatForm.aciklama?" - "+zaiyatForm.aciklama:""}`});
    setOk(`⚠️ ${u?.urun_adi} — ${zaiyatForm.miktar} ${u?.birim||"dal"} zaiyat kaydedildi.`);
    setZaiyatForm({urun_id:"",miktar:"",neden:"Çürüme",aciklama:""});
    yukle();setTimeout(()=>setOk(""),4000);
  };

  const receteKaydet=async()=>{
    if(!receteUrunId||!receteKalemler.length)return toast("Ürün ve en az bir malzeme seçin!","uyari");
    // Mevcut reçeteyi sil, yenisini ekle
    await supabase.from("cicek_urun_receteleri").delete().eq("urun_id",receteUrunId);
    await supabase.from("cicek_urun_receteleri").insert(receteKalemler.filter(k=>k.malzeme_id&&k.miktar>0).map(k=>({urun_id:receteUrunId,malzeme_id:k.malzeme_id,miktar:+k.miktar})));
    setOk("✅ Reçete kaydedildi!");setReceteKalemler([]);receteYukle();setTimeout(()=>setOk(""),3000);
  };

  const receteSil=async(urunId)=>{
    if(!confirm("Bu reçeteyi silmek istediğinizden emin misiniz?"))return;
    await supabase.from("cicek_urun_receteleri").delete().eq("urun_id",urunId);
    receteYukle();
  };

  // Reçeteli ürünleri grupla
  const receteGruplari={};
  mevcutReceteler.forEach(r=>{
    if(!receteGruplari[r.urun_id])receteGruplari[r.urun_id]={urun_adi:r.urun?.urun_adi,kalemler:[]};
    receteGruplari[r.urun_id].kalemler.push({malzeme_adi:r.malzeme?.urun_adi,birim:r.malzeme?.birim||"dal",miktar:r.miktar});
  });

  const tabs=[
    {k:"liste",l:"📦 Stok Listesi"},
    {k:"giris",l:"⬆️ Stok Girişi"},
    {k:"zaiyat",l:"🗑️ Zaiyat Kaydet"},
    {k:"recete",l:"📋 Reçete Tanımla"},
    {k:"ekle",l:"➕ Yeni Ürün"},
    {k:"hareketler",l:"📊 Hareketler"},
  ];

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={bstl}>📦 Stok Yönetimi</h2>
    </div>

    {ok&&<div style={{background:"rgba(0,200,100,0.12)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:10,padding:"10px 16px",color:"#00c864",marginBottom:14,fontSize:13}}>{ok}</div>}

    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {tabs.map(t=>(<button key={t.k} onClick={()=>setTab(t.k)} style={{...obtn,borderColor:tab===t.k?"#e94560":"#dde1ec",background:tab===t.k?"rgba(233,69,96,0.08)":"transparent",color:tab===t.k?"#e94560":"#666"}}>{t.l}</button>))}
    </div>

    {/* STOK LİSTESİ */}
    {tab==="liste"&&<div>
      {/* Özet */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:14}}>
        {[
          {l:"Toplam Ürün",v:urunler.length,c:"#1a1a2e"},
          {l:"✅ Stokta",v:urunler.filter(u=>u.stok_miktari>(u.min_stok_uyari||10)).length,c:"#00a854"},
          {l:"⚠️ Düşük",v:urunler.filter(u=>u.stok_miktari<=(u.min_stok_uyari||10)&&u.stok_miktari>0).length,c:"#d48806"},
          {l:"❌ Bitti",v:urunler.filter(u=>u.stok_miktari<=0).length,c:"#dc2626"},
          {l:"Stok Değeri",v:new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(urunler.reduce((t,u)=>t+(u.stok_miktari||0)*(u.alis_fiyati||0),0)),c:"#1677ff"},
        ].map(s=><div key={s.l} style={krt}><div style={{color:"#999",fontSize:10}}>{s.l}</div><div style={{color:s.c,fontWeight:700,fontSize:s.l==="Stok Değeri"?12:18,marginTop:3}}>{s.v}</div></div>)}
      </div>

      {/* Filtreler */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={stokAra} onChange={e=>setStokAra(e.target.value)} placeholder="🔍 Ürün adı veya barkod..." style={{...inp,flex:1,minWidth:160}}/>
        <select value={stokKatFiltre} onChange={e=>setStokKatFiltre(e.target.value)} style={{...inp,width:"auto"}}>
          <option value="">Tüm Kategoriler</option>
          {kategoriler.map(k=><option key={k.id} value={k.id}>{k.kategori_adi}</option>)}
        </select>
        <select value={stokDurumFiltre} onChange={e=>setStokDurumFiltre(e.target.value)} style={{...inp,width:"auto"}}>
          <option value="">Tüm Durum</option>
          <option value="var">✅ Var</option><option value="az">⚠️ Az</option><option value="bitti">❌ Bitti</option>
        </select>
      </div>

      {/* Tablo */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebf5",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"28px 2.5fr 1fr 1.2fr 1fr 1fr 1fr 0.7fr 90px",gap:4,padding:"10px 12px",borderBottom:"1px solid #e8ebf5",background:"#f8f9fc"}}>
          {["#","Ürün","Kategori","Stok","Alış ₺","Satış ₺","Kar %","Durum","İşlem"].map(h=><span key={h} style={{color:"#666",fontSize:11.5,fontWeight:600}}>{h}</span>)}
        </div>
        {(urunler||[]).filter(u=>{
          const a=!stokAra||u.urun_adi.toLowerCase().includes(stokAra.toLowerCase())||u.barkod?.includes(stokAra);
          const k=!stokKatFiltre||u.kategori_id===stokKatFiltre;
          const d=!stokDurumFiltre||(stokDurumFiltre==="var"&&u.stok_miktari>(u.min_stok_uyari||10))||(stokDurumFiltre==="az"&&u.stok_miktari<=(u.min_stok_uyari||10)&&u.stok_miktari>0)||(stokDurumFiltre==="bitti"&&u.stok_miktari<=0);
          return a&&k&&d;
        }).map((u,i)=>{
          const duz=duzenleId===u.id;
          const karPct=u.alis_fiyati&&u.satis_fiyati?((u.satis_fiyati-u.alis_fiyati)/u.alis_fiyati*100).toFixed(0):null;
          const inp2={padding:"4px 7px",borderRadius:6,border:"1px solid #dde1ec",background:"#fff",color:"#1a1a2e",fontSize:11.5,width:"100%"};
          return(
          <div key={u.id} style={{borderBottom:"1px solid #f0f2f8",background:duz?"#fffbeb":i%2===0?"#fff":"#fafbff"}}>
            {!duz&&<div style={{display:"grid",gridTemplateColumns:"28px 2.5fr 1fr 1.2fr 1fr 1fr 1fr 0.7fr 90px",gap:4,padding:"9px 12px",alignItems:"center"}}>
              <span style={{color:"#bbb",fontSize:10}}>{i+1}</span>
              <div>
                <div style={{color:"#1a1a2e",fontSize:12.5,fontWeight:600}}>{u.urun_adi}</div>
                {u.barkod&&<div style={{color:"#ccc",fontSize:10}}>{u.barkod}</div>}
              </div>
              <span style={{color:"#777",fontSize:11}}>{u.cicek_kategoriler?.kategori_adi||"-"}</span>
              <div onClick={()=>{setDuzenleId(u.id);setDuzenleData({...u});}} style={{cursor:"pointer",display:"flex",gap:4,alignItems:"center"}} title="Tıkla düzenle">
                <span style={{fontWeight:700,color:u.stok_miktari<=0?"#dc2626":u.stok_miktari<=(u.min_stok_uyari||10)?"#d48806":"#00a854"}}>{u.stok_miktari}</span>
                <span style={{color:"#aaa",fontSize:10}}>{u.birim||"dal"} ✏️</span>
              </div>
              <span style={{color:"#555",fontSize:12}}>{para(u.alis_fiyati)}</span>
              <span style={{color:"#e94560",fontSize:12,fontWeight:700}}>{para(u.satis_fiyati)}</span>
              <span style={{fontSize:11,fontWeight:600,color:karPct>=50?"#00a854":karPct>=25?"#d48806":"#dc2626"}}>{karPct?`%${karPct}`:"-"}</span>
              <div>{u.stok_miktari<=0?<span style={{color:"#dc2626",fontSize:10,fontWeight:700}}>❌</span>:u.stok_miktari<=(u.min_stok_uyari||10)?<span style={{color:"#d48806",fontSize:10}}>⚠️</span>:<span style={{color:"#00a854",fontSize:10}}>✅</span>}</div>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>{setDuzenleId(u.id);setDuzenleData({...u});}} style={{...kbtn,fontSize:10,padding:"3px 7px",color:"#1677ff"}}>✏️</button>
                <button onClick={()=>barkodEtiketYazdir(u)} style={{...kbtn,fontSize:10,padding:"3px 6px"}}>🏷️</button>
                <button onClick={()=>urunSil(u.id,u.urun_adi)} style={{...kbtn,fontSize:10,padding:"3px 6px",color:"#dc2626"}}>🗑</button>
              </div>
            </div>}

            {/* Inline Düzenleme Formu */}
            {duz&&<div style={{padding:"14px 16px",borderLeft:"3px solid #e94560",background:"#fffbeb"}}>
              <div style={{color:"#e94560",fontWeight:700,fontSize:12.5,marginBottom:10}}>✏️ {u.urun_adi} — Düzenleniyor</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:10}}>
                <div><label style={{...lbl,fontSize:10}}>Ürün Adı</label><input value={duzenleData.urun_adi||""} onChange={e=>setDuzenleData(d=>({...d,urun_adi:e.target.value}))} style={inp2}/></div>
                <div><label style={{...lbl,fontSize:10}}>Kategori</label>
                  <select value={duzenleData.kategori_id||""} onChange={e=>setDuzenleData(d=>({...d,kategori_id:e.target.value||null}))} style={{...inp2,background:"#fff"}}>
                    <option value="">Yok</option>{kategoriler.map(k=><option key={k.id} value={k.id}>{k.kategori_adi}</option>)}
                  </select></div>
                <div><label style={{...lbl,fontSize:10}}>Birim</label>
                  <select value={duzenleData.birim||"dal"} onChange={e=>setDuzenleData(d=>({...d,birim:e.target.value}))} style={{...inp2,background:"#fff"}}>
                    {["dal","demet","adet","buket","saksı","kg"].map(b=><option key={b}>{b}</option>)}
                  </select></div>
                <div><label style={{...lbl,fontSize:10}}>Stok Miktarı</label><input type="number" value={duzenleData.stok_miktari??""} onChange={e=>setDuzenleData(d=>({...d,stok_miktari:e.target.value}))} style={inp2}/></div>
                <div><label style={{...lbl,fontSize:10}}>Alış Fiyatı ₺</label><input type="number" value={duzenleData.alis_fiyati??""} onChange={e=>setDuzenleData(d=>({...d,alis_fiyati:e.target.value}))} style={inp2}/></div>
                <div><label style={{...lbl,fontSize:10}}>Satış Fiyatı ₺</label><input type="number" value={duzenleData.satis_fiyati??""} onChange={e=>setDuzenleData(d=>({...d,satis_fiyati:e.target.value}))} style={inp2}/></div>
                <div>
                  <label style={{...lbl,fontSize:10}}>Otomatik Kar</label>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {[25,50,75,100,150].map(oran=>(
                      <button key={oran} onClick={()=>{const s=Math.ceil((+duzenleData.alis_fiyati||0)*(1+oran/100)/5)*5;setDuzenleData(d=>({...d,satis_fiyati:s}));}}
                        style={{padding:"2px 7px",borderRadius:5,border:"1px solid #dde1ec",background:"#fff",fontSize:10,cursor:"pointer"}}>+{oran}%</button>
                    ))}
                  </div>
                </div>
                <div><label style={{...lbl,fontSize:10}}>Min. Stok</label><input type="number" value={duzenleData.min_stok_uyari??10} onChange={e=>setDuzenleData(d=>({...d,min_stok_uyari:+e.target.value}))} style={inp2}/></div>
              </div>
              {duzenleData.alis_fiyati&&duzenleData.satis_fiyati&&<div style={{fontSize:11,color:"#555",marginBottom:8,background:"#f0fdf4",padding:"6px 10px",borderRadius:7}}>
                Kâr/birim: <strong style={{color:"#00a854"}}>{para(+duzenleData.satis_fiyati-(+duzenleData.alis_fiyati||0))}</strong> — 
                %{((+duzenleData.satis_fiyati-(+duzenleData.alis_fiyati||0))/(+duzenleData.alis_fiyati||1)*100).toFixed(0)} kâr
              </div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>duzenleKaydet(u.id)} style={{...abtn,fontSize:12,padding:"8px 16px"}}>💾 Kaydet</button>
                <button onClick={()=>{setDuzenleId(null);setDuzenleData({});}} style={{...kbtn,fontSize:12}}>İptal</button>
              </div>
            </div>}
          </div>);
        })}
        {!urunler.length&&<div style={{padding:40,textAlign:"center",color:"#bbb",fontSize:13}}>Stok ürünü yok. "Yeni Ürün" sekmesinden ekleyin.</div>}
      </div>
    </div>}

    {/* STOK GİRİŞİ */}
    {tab==="giris"&&<div style={{maxWidth:500}}>
      <h3 style={{color:"#555",marginTop:0,fontSize:15}}>⬆️ Tedarikçiden Stok Girişi</h3>
      <p style={{color:"#aaa",fontSize:12,marginBottom:16}}>Dal, demet veya adet olarak stok ekleyin. Alış fiyatını güncelleyebilirsiniz.</p>
      <div style={{...fkrt}}>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Ürün *</label>
          <select value={girisForm.urun_id} onChange={e=>setGirisForm({...girisForm,urun_id:e.target.value})} style={inp}>
            <option value="">Ürün seçin...</option>
            {urunler.map(u=><option key={u.id} value={u.id}>{u.urun_adi} (Mevcut: {u.stok_miktari} {u.birim||"dal"})</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <label style={lbl}>Giren Miktar ({urunler.find(u=>u.id===girisForm.urun_id)?.birim||"dal"}) *</label>
            <input type="number" value={girisForm.miktar} onChange={e=>setGirisForm({...girisForm,miktar:e.target.value})} style={inp} placeholder="0"/>
          </div>
          <div>
            <label style={lbl}>Alış Fiyatı (opsiyonel)</label>
            <input type="number" value={girisForm.birim_fiyat} onChange={e=>setGirisForm({...girisForm,birim_fiyat:e.target.value})} style={inp} placeholder="dal başına"/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Açıklama</label>
          <input value={girisForm.aciklama} onChange={e=>setGirisForm({...girisForm,aciklama:e.target.value})} style={inp} placeholder="Örn: Hollanda malı, Pazardan..."/>
        </div>
        {girisForm.urun_id&&girisForm.miktar&&<div style={{background:"rgba(0,200,100,0.08)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#555"}}>
          Mevcut: <strong style={{color:"#1a1a2e"}}>{urunler.find(u=>u.id===girisForm.urun_id)?.stok_miktari||0}</strong> → 
          Yeni: <strong style={{color:"#00c864"}}>{(urunler.find(u=>u.id===girisForm.urun_id)?.stok_miktari||0)+ +girisForm.miktar}</strong> {urunler.find(u=>u.id===girisForm.urun_id)?.birim||"dal"}
        </div>}
        <button onClick={stokGiris} style={{...abtn,width:"100%"}}>⬆️ Stok Ekle</button>
      </div>
    </div>}

    {/* ZAİYAT */}
    {tab==="zaiyat"&&<div style={{maxWidth:500}}>
      <h3 style={{color:"#555",marginTop:0,fontSize:15}}>🗑️ Zaiyat Kaydı</h3>
      <p style={{color:"#aaa",fontSize:12,marginBottom:16}}>Çürüyen, solar, kırılan veya fire olan çiçekleri buradan düşün. Stok otomatik azalır.</p>
      <div style={{...fkrt}}>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Ürün *</label>
          <select value={zaiyatForm.urun_id} onChange={e=>setZaiyatForm({...zaiyatForm,urun_id:e.target.value})} style={inp}>
            <option value="">Ürün seçin...</option>
            {urunler.map(u=><option key={u.id} value={u.id}>{u.urun_adi} (Stok: {u.stok_miktari} {u.birim||"dal"})</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <label style={lbl}>Zaiyat Miktarı *</label>
            <input type="number" value={zaiyatForm.miktar} onChange={e=>setZaiyatForm({...zaiyatForm,miktar:e.target.value})} style={inp} placeholder="0"/>
          </div>
          <div>
            <label style={lbl}>Neden</label>
            <select value={zaiyatForm.neden} onChange={e=>setZaiyatForm({...zaiyatForm,neden:e.target.value})} style={inp}>
              {ZAIYAT_NEDENLERI.map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Ek Açıklama</label>
          <input value={zaiyatForm.aciklama} onChange={e=>setZaiyatForm({...zaiyatForm,aciklama:e.target.value})} style={inp} placeholder="Opsiyonel..."/>
        </div>
        {zaiyatForm.urun_id&&zaiyatForm.miktar&&<div style={{background:"rgba(255,107,107,0.08)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#555"}}>
          Mevcut: <strong style={{color:"#1a1a2e"}}>{urunler.find(u=>u.id===zaiyatForm.urun_id)?.stok_miktari||0}</strong> → 
          Yeni: <strong style={{color:"#ff6b6b"}}>{Math.max(0,(urunler.find(u=>u.id===zaiyatForm.urun_id)?.stok_miktari||0)- +zaiyatForm.miktar)}</strong> {urunler.find(u=>u.id===zaiyatForm.urun_id)?.birim||"dal"}
        </div>}
        <button onClick={zaiyatKaydet} style={{...abtn,width:"100%",background:"linear-gradient(135deg,#ff6b6b,#cc4444)"}}>🗑️ Zaiyat Kaydet</button>
      </div>
    </div>}

    {/* YENİ ÜRÜN */}
    {tab==="ekle"&&<div style={{maxWidth:600}}>
      <h3 style={{color:"#555",marginTop:0,fontSize:15}}>➕ Yeni Ürün Ekle</h3>
      <div style={{...fkrt}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Ürün Adı *</label><input value={form.urun_adi} onChange={e=>setForm({...form,urun_adi:e.target.value})} style={inp} placeholder="Gül, Lale, Karanfil..."/></div>
          <div><label style={lbl}>Kategori</label><select value={katId} onChange={e=>setKatId(e.target.value)} style={inp}><option value="">Seç...</option>{kategoriler.map(k=><option key={k.id} value={k.id}>{k.kategori_adi}</option>)}</select></div>
          <div><label style={lbl}>Birim</label><select value={form.birim} onChange={e=>setForm({...form,birim:e.target.value})} style={inp}>{["dal","demet","adet","kg","çift"].map(b=><option key={b}>{b}</option>)}</select></div>
          <div><label style={lbl}>Başlangıç Stok</label><input type="number" value={form.stok_miktari} onChange={e=>setForm({...form,stok_miktari:e.target.value})} style={inp} placeholder="0"/></div>
          <div><label style={lbl}>Alış Fiyatı ({form.birim})</label><input type="number" value={form.alis_fiyati} onChange={e=>setForm({...form,alis_fiyati:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Satış Fiyatı ({form.birim})</label><input type="number" value={form.satis_fiyati} onChange={e=>setForm({...form,satis_fiyati:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>KDV %</label><input type="number" value={form.kdv_orani} onChange={e=>setForm({...form,kdv_orani:+e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Min. Stok Uyarısı ({form.birim})</label><input type="number" value={form.min_stok_uyari} onChange={e=>setForm({...form,min_stok_uyari:+e.target.value})} style={inp}/></div>
        </div>
        <button onClick={urunKaydet} style={{...abtn,width:"100%"}}>💾 Ürün Kaydet</button>
      </div>
    </div>}

    {/* REÇETE TANIMLA */}
    {tab==="recete"&&<div>
      <h3 style={{color:"#555",marginTop:0,fontSize:15,marginBottom:6}}>📋 Reçete Tanımla</h3>
      <p style={{color:"#999",fontSize:12,marginBottom:16}}>
        Buket veya aranjman gibi birden fazla çiçekten oluşan ürünlerin içeriğini tanımlayın.<br/>
        Satış yapıldığında stok otomatik olarak reçetedeki miktarlara göre düşer.
      </p>

      <div style={{...fkrt,marginBottom:20}}>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Ürün (Buket / Aranjman) *</label>
          <select value={receteUrunId} onChange={e=>{setReceteUrunId(e.target.value);setReceteKalemler([]);}} style={inp}>
            <option value="">Reçete tanımlanacak ürünü seçin...</option>
            {urunler.map(u=><option key={u.id} value={u.id}>{u.urun_adi} ({u.birim||"adet"})</option>)}
          </select>
        </div>

        {receteUrunId&&<>
          <div style={{color:"#666",fontSize:12,marginBottom:10,fontWeight:600}}>İçerik (Malzemeler):</div>
          {receteKalemler.map((k,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 30px",gap:8,marginBottom:8}}>
            <select value={k.malzeme_id} onChange={e=>setReceteKalemler(receteKalemler.map((x,j)=>j===i?{...x,malzeme_id:e.target.value}:x))} style={inp}>
              <option value="">Malzeme seçin (dal/demet)...</option>
              {urunler.filter(u=>u.id!==receteUrunId).map(u=><option key={u.id} value={u.id}>{u.urun_adi} ({u.birim||"dal"})</option>)}
            </select>
            <input type="number" placeholder="Kaç dal?" value={k.miktar} onChange={e=>setReceteKalemler(receteKalemler.map((x,j)=>j===i?{...x,miktar:+e.target.value}:x))} style={inp} min="1"/>
            <button onClick={()=>setReceteKalemler(receteKalemler.filter((_,j)=>j!==i))} style={mbtn}>✕</button>
          </div>))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>setReceteKalemler([...receteKalemler,{malzeme_id:"",miktar:1}])} style={kbtn}>+ Malzeme Ekle</button>
            {receteKalemler.length>0&&<button onClick={receteKaydet} style={abtn}>💾 Reçeteyi Kaydet</button>}
          </div>
        </>}
      </div>

      {/* Mevcut Reçeteler */}
      <h4 style={{color:"#666",fontSize:14,marginBottom:12}}>Kayıtlı Reçeteler</h4>
      {Object.keys(receteGruplari).length===0&&<p style={{color:"#ccc",fontSize:13}}>Henüz reçete tanımlanmamış.</p>}
      {Object.entries(receteGruplari).map(([urunId,r])=>(<div key={urunId} style={{...krt,marginBottom:10,padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>🌸 {r.urun_adi}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setReceteUrunId(urunId);setReceteKalemler(r.kalemler.map(k=>({malzeme_id:urunler.find(u=>u.urun_adi===k.malzeme_adi)?.id||"",miktar:k.miktar})));}} style={{...kbtn,fontSize:11}}>✏️ Düzenle</button>
            <button onClick={()=>receteSil(urunId)} style={{...kbtn,fontSize:11,color:"#ff6b6b",borderColor:"rgba(255,107,107,0.3)"}}>🗑️ Sil</button>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {r.kalemler.map((k,i)=>(<span key={i} style={{background:"rgba(255,165,0,0.1)",border:"1px solid rgba(255,165,0,0.25)",borderRadius:8,padding:"4px 10px",fontSize:12,color:"#ffa500"}}>
            {k.malzeme_adi} × <strong>{k.miktar}</strong> {k.birim}
          </span>))}
        </div>
      </div>))}
    </div>}

    {/* HAREKETLER */}
    {tab==="hareketler"&&<div>
      <h3 style={{color:"#555",marginTop:0,fontSize:15,marginBottom:14}}>📊 Stok Hareketleri (Son 50)</h3>
      <Tablo bas={["Tarih","Ürün","Tür","Miktar","Önce","Sonra","Açıklama"]}>
        {hareketler.map((h,i)=>(<tr key={h.id} style={{borderBottom:"1px solid #f0f2f8",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
          <td style={td}>{tarih(h.tarih)}</td>
          <td style={{...td,fontWeight:600}}>{h.cicek_urunler?.urun_adi||"-"}</td>
          <td style={td}>
            <span style={{padding:"2px 8px",borderRadius:8,fontSize:11,background:h.hareket_turu==="giris"?"rgba(0,200,100,0.15)":h.hareket_turu==="zaiyat"?"rgba(255,107,107,0.15)":"rgba(78,168,222,0.15)",color:h.hareket_turu==="giris"?"#00c864":h.hareket_turu==="zaiyat"?"#ff6b6b":"#4ea8de"}}>
              {h.hareket_turu==="giris"?"⬆️ Giriş":h.hareket_turu==="zaiyat"?"🗑️ Zaiyat":"⬇️ Satış"}
            </span>
          </td>
          <td style={{...td,fontWeight:700,color:h.hareket_turu==="giris"?"#00c864":"#ff6b6b"}}>{h.hareket_turu==="giris"?"+":"-"}{h.miktar}</td>
          <td style={td}>{h.onceki_stok}</td>
          <td style={{...td,fontWeight:700}}>{h.sonraki_stok}</td>
          <td style={{...td,color:"#888"}}>{h.aciklama||"-"}</td>
        </tr>))}
      </Tablo>
    </div>}
  </div>);
}

// FATURA
function CFatura({k}){
  const [faturalar,setFaturalar]=useState([]);const [urunler,setUrunler]=useState([]);const [hesaplar,setHesaplar]=useState([]);
  const [form,setForm]=useState({firma_adi:"",fatura_no:"",fatura_tarihi:bugun(),odeme_turu:"nakit"});const [hesapId,setHesapId]=useState("");const [kalemler,setKalemler]=useState([]);const [acik,setAcik]=useState(false);
  // OCR
  const [ocrYukleniyor,setOcrYukleniyor]=useState(false);const [ocrSonuc,setOcrSonuc]=useState(null);const [ocrHata,setOcrHata]=useState("");const [ocrOnizleme,setOcrOnizleme]=useState(null);
  const dosyaRef=useRef(null);

  const yukle=()=>supabase.from("cicek_faturalar").select("*").order("fatura_tarihi",{ascending:false}).limit(20).then(({data})=>setFaturalar(data||[]));
  useEffect(()=>{yukle();supabase.from("cicek_urunler").select("*").eq("aktif",true).then(({data})=>setUrunler(data||[]));supabase.from("hesap_adlari").select("*").eq("aktif",true).then(({data})=>setHesaplar(data||[]));}, []);

  const ocrIsle=async(dosya)=>{
    if(!dosya)return;
    setOcrYukleniyor(true);setOcrHata("");setOcrSonuc(null);
    const isPdf=dosya.type==="application/pdf";
    if(!isPdf){const r=new FileReader();r.onload=e=>setOcrOnizleme(e.target.result);r.readAsDataURL(dosya);}
    else setOcrOnizleme("pdf");
    try{
      let body;
      if(isPdf){
        const ab=await dosya.arrayBuffer();const u8=new Uint8Array(ab);
        if(!window.pdfjsLib){await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";}
        const pdf=await window.pdfjsLib.getDocument({data:u8}).promise;let metin="";
        for(let i=1;i<=Math.min(pdf.numPages,5);i++){const p=await pdf.getPage(i);const tc=await p.getTextContent();metin+=tc.items.map(x=>x.str).join(" ")+"\n";}
        body=JSON.stringify({pdfText:metin});
      } else {
        const b64=await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result.split(",")[1]);r.readAsDataURL(dosya);});
        body=JSON.stringify({image:b64,mimeType:dosya.type||"image/jpeg"});
      }
      const resp=await fetch("/api/ocr",{method:"POST",headers:{"Content-Type":"application/json"},body});
      const data=await resp.json();
      if(data.parsed){
        const p=data.parsed;setOcrSonuc(p);
        setForm(f=>({...f,firma_adi:p.firma_adi||f.firma_adi,fatura_no:p.fatura_no||f.fatura_no,fatura_tarihi:p.tarih||f.fatura_tarihi,odeme_turu:p.odeme_turu||f.odeme_turu}));
        // Kalemleri forma doldur
        if(p.kalemler?.length>0){
          setKalemler(p.kalemler.map(kl=>({urun_id:"",urun_adi:kl.aciklama||"",birim:"dal",miktar:kl.miktar||1,birim_fiyat:kl.birim_fiyat||0,kdv_orani:8,toplam:kl.toplam||(kl.miktar||1)*(kl.birim_fiyat||0)})));
        }
      } else setOcrHata("Fatura okunamadı. Manuel doldurun.");
    } catch(e){setOcrHata("OCR hatası: "+e.message);}
    setOcrYukleniyor(false);
  };

  const kaydet=async()=>{
    if(!kalemler.length)return toast("En az bir kalem ekleyin!","uyari");
    const t=kalemler.reduce((x,k)=>x+k.toplam,0);
    const kd=kalemler.reduce((x,k)=>x+k.toplam*(k.kdv_orani||8)/(100+(k.kdv_orani||8)),0);
    const{data:f}=await supabase.from("cicek_faturalar").insert({...form,hesap_id:hesapId||null,toplam_tutar:t,kdv_tutari:kd}).select().single();
    await supabase.from("cicek_fatura_kalemleri").insert(kalemler.map(kl=>({...kl,fatura_id:f.id})));
    // Otomatik gider kaydı — islem_turu kolonu yok, belge_turu ile ayırt edilir
    await supabase.from("giderler").insert({
      harcama_tarihi:form.fatura_tarihi,islem_tarihi:form.fatura_tarihi,
      belge_turu:"Fatura",belge_no:form.fatura_no||null,
      firma_adi:form.firma_adi,isletme:"cicekci",
      aciklama:`Çiçek alımı — ${kalemler.map(kl=>kl.urun_adi).join(", ")}`,
      kdv_tutari:kd,tutar:t,odeme_turu:form.odeme_turu,
      hesap_id:hesapId||null,kullanici_id:k?.id,
    });
    for(const kl of kalemler){
      if(kl.urun_id){
        const{data:u}=await supabase.from("cicek_urunler").select("stok_miktari").eq("id",kl.urun_id).single();
        const onceki=u?.stok_miktari||0;const sonraki=onceki+kl.miktar;
        await supabase.from("cicek_urunler").update({stok_miktari:sonraki,alis_fiyati:kl.birim_fiyat}).eq("id",kl.urun_id);
        await supabase.from("cicek_stok_hareketleri").insert({urun_id:kl.urun_id,hareket_turu:"giris",miktar:kl.miktar,onceki_stok:onceki,sonraki_stok:sonraki,birim_fiyat:kl.birim_fiyat,aciklama:`Fatura: ${form.firma_adi} #${form.fatura_no}`});
      }
    }
    setAcik(false);setKalemler([]);setOcrSonuc(null);setOcrOnizleme(null);yukle();
    toast(`Fatura kaydedildi! Toplam: ${para(t)}`,"basari");
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h2 style={bstl}>📄 Fatura Girişi</h2><button onClick={()=>setAcik(!acik)} style={abtn}>+ Fatura Gir</button></div>
    <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#166534"}}>
      💡 Fatura kaydettiğinizde stok otomatik artar ve giderler sayfasına da otomatik eklenir.
    </div>
    {acik&&<div style={{...fkrt,marginBottom:16}}>

      {/* OCR — Fatura Fotoğrafı */}
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{color:"#1d4ed8",fontWeight:700,fontSize:14,marginBottom:8}}>📷 Fatura Fotoğrafı ile Otomatik Doldur</div>
        <p style={{color:"#1e40af",fontSize:12,marginBottom:10}}>Faturanın fotoğrafını veya PDF'ini yükleyin — AI okuyup formu dolduracak.</p>
        <input ref={dosyaRef} type="file" accept="image/*,application/pdf" onChange={e=>ocrIsle(e.target.files[0])} style={{display:"none"}}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>{dosyaRef.current.removeAttribute("capture");dosyaRef.current.click();}} style={{...abtn,background:"linear-gradient(135deg,#1d4ed8,#1e40af)",fontSize:13}}>📁 Fotoğraf / PDF Seç</button>
          <button onClick={()=>{dosyaRef.current.setAttribute("capture","environment");dosyaRef.current.click();}} style={{...kbtn,fontSize:13,color:"#1d4ed8",borderColor:"#bfdbfe"}}>📷 Kamera ile Çek</button>
        </div>
        {ocrYukleniyor&&<div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,color:"#1d4ed8",fontSize:13}}><div style={{width:16,height:16,border:"2px solid #1d4ed8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Fatura okunuyor...</div>}
        {ocrHata&&<div style={{marginTop:8,color:"#dc2626",fontSize:12,padding:"7px 10px",background:"#fef2f2",borderRadius:7,border:"1px solid #fca5a5"}}>{ocrHata}</div>}
        {ocrSonuc&&!ocrYukleniyor&&<div style={{marginTop:10,background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"10px 12px"}}>
          <div style={{color:"#15803d",fontWeight:600,fontSize:13,marginBottom:6}}>✅ Fatura okundu! Form dolduruldu.</div>
          {ocrSonuc.kalemler?.length>0&&<div style={{color:"#166534",fontSize:12}}>{ocrSonuc.kalemler.length} kalem otomatik eklendi.</div>}
        </div>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:14}}>
        <div><label style={lbl}>Firma *</label><input value={form.firma_adi} onChange={e=>setForm({...form,firma_adi:e.target.value})} style={inp} placeholder="Çiçek Pazarı..."/></div>
        <div><label style={lbl}>Fatura No</label><input value={form.fatura_no} onChange={e=>setForm({...form,fatura_no:e.target.value})} style={inp}/></div>
        <div><label style={lbl}>Tarih</label><input type="date" value={form.fatura_tarihi} onChange={e=>setForm({...form,fatura_tarihi:e.target.value})} style={inp}/></div>
        <div><label style={lbl}>Ödeme</label><select value={form.odeme_turu} onChange={e=>setForm({...form,odeme_turu:e.target.value})} style={inp}><option value="nakit">Nakit</option><option value="kredi_karti">Kart</option><option value="havale">Havale</option><option value="acik_cari">Açık Cari (Veresiye)</option></select></div>
        <div><label style={lbl}>Hesap</label><select value={hesapId} onChange={e=>setHesapId(e.target.value)} style={inp}><option value="">Seç...</option>{hesaplar.map(h=><option key={h.id} value={h.id}>{h.hesap_adi}</option>)}</select></div>
      </div>
      {kalemler.map((kl,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 80px 30px",gap:8,marginBottom:8}}>
        <select value={kl.urun_id} onChange={e=>{const u=urunler.find(x=>x.id===e.target.value);setKalemler(kalemler.map((x,j)=>j===i?{...x,urun_id:e.target.value,urun_adi:u?.urun_adi||"",birim:u?.birim||"dal",birim_fiyat:u?.alis_fiyati||0,kdv_orani:u?.kdv_orani||8,toplam:(u?.alis_fiyati||0)*x.miktar}:x));}} style={inp}><option value="">Ürün seçin</option>{urunler.map(u=><option key={u.id} value={u.id}>{u.urun_adi} ({u.birim||"dal"})</option>)}</select>
        <input type="number" placeholder="Miktar" value={kl.miktar} onChange={e=>setKalemler(kalemler.map((x,j)=>j===i?{...x,miktar:+e.target.value,toplam:x.birim_fiyat*+e.target.value}:x))} style={inp}/>
        <input type="number" placeholder="Birim Fiyat" value={kl.birim_fiyat} onChange={e=>setKalemler(kalemler.map((x,j)=>j===i?{...x,birim_fiyat:+e.target.value,toplam:+e.target.value*x.miktar}:x))} style={inp}/>
        <div style={{...inp,color:"#e94560",fontWeight:600,display:"flex",alignItems:"center"}}>{para(kl.toplam)}</div>
        <button onClick={()=>setKalemler(kalemler.filter((_,j)=>j!==i))} style={mbtn}>✕</button>
      </div>))}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
        <button onClick={()=>setKalemler([...kalemler,{urun_id:"",urun_adi:"",birim:"dal",miktar:1,birim_fiyat:0,kdv_orani:8,toplam:0}])} style={kbtn}>+ Kalem Ekle</button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {kalemler.length>0&&<span style={{color:"#888",fontSize:13}}>Toplam: <strong style={{color:"#e94560"}}>{para(kalemler.reduce((t,k)=>t+k.toplam,0))}</strong></span>}
          <button onClick={kaydet} style={abtn}>💾 Kaydet & Stok + Gider Güncelle</button>
        </div>
      </div>
    </div>}
    <Tablo bas={["Tarih","Firma","Fatura No","Ödeme","Tutar"]}>
      {faturalar.map(f=>(<tr key={f.id} style={{borderBottom:"1px solid #f0f2f8"}}>
        <td style={td}>{tarih(f.fatura_tarihi)}</td><td style={td}>{f.firma_adi}</td><td style={td}>{f.fatura_no||"-"}</td><td style={td}>{f.odeme_turu}</td><td style={{...td,color:"#e94560",fontWeight:700}}>{para(f.toplam_tutar)}</td>
      </tr>))}
    </Tablo>
  </div>);
}

// CARİ/VERESİYE
function CCari(){
  const [sekme,setSekme]=useState("musteri");
  const [cariler,setCariler]=useState([]);const [secili,setSecili]=useState(null);const [tutar,setTutar]=useState("");const [gecmis,setGecmis]=useState([]);
  const [tedarikciler,setTedarikciler]=useState([]);
  const [tSecili,setTSecili]=useState(null);const [tTutar,setTTutar]=useState("");

  const yukle=()=>{
    supabase.from("cicek_cari").select("*,musteriler(*),cicek_satislar(satis_no,satis_tarihi,toplam_tutar)").neq("durum","kapali").order("olusturma_tarihi",{ascending:false}).then(({data})=>setCariler(data||[]));
    supabase.from("giderler").select("*").eq("odeme_turu","acik_cari").order("harcama_tarihi",{ascending:false}).then(({data})=>setTedarikciler(data||[]));
  };
  useEffect(()=>{yukle();supabase.from("cicek_cari").select("*,musteriler(*),cicek_satislar(satis_no,satis_tarihi)").eq("durum","kapali").order("olusturma_tarihi",{ascending:false}).limit(20).then(({data})=>setGecmis(data||[]));}, []);

  const ode=async()=>{
    if(!secili||!tutar)return;
    const yo=(secili.odened||0)+ +tutar;const yk=secili.tutar-yo;
    await supabase.from("cicek_cari").update({odened:yo,kalan:yk,durum:yk<=0?"kapali":"kismi"}).eq("id",secili.id);
    setSecili(null);setTutar("");yukle();
  };

  const tedariOde=async()=>{
    if(!tSecili||!tTutar)return;
    const yeniAciklama=(tSecili.aciklama||"")+" [ÖDEME: "+new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(+tTutar)+" ₺ — "+new Date().toLocaleDateString("tr-TR")+"]";
    const kalanTutar=Math.max(0,(tSecili.tutar||0)- +tTutar);
    await supabase.from("giderler").update({aciklama:yeniAciklama,odeme_turu:kalanTutar<=0?"nakit":"acik_cari"}).eq("id",tSecili.id);
    await supabase.from("giderler").insert({harcama_tarihi:bugun(),islem_tarihi:bugun(),belge_turu:"Cari Ödeme",firma_adi:tSecili.firma_adi,isletme:tSecili.isletme||"cicekci",aciklama:`Açık cari ödeme: ${tSecili.firma_adi}`,tutar:+tTutar,odeme_turu:"nakit",kdv_tutari:0});
    setTSecili(null);setTTutar("");yukle();
  };

  const toplamAcik=cariler.reduce((t,c)=>t+(c.kalan||0),0);
  const toplamTedari=tedarikciler.reduce((t,g)=>t+(g.tutar||0),0);

  return(<div>
    <h2 style={bstl}>👤 Cari / Veresiye</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
      <div style={{...krt,background:"#fef2f2",border:"1px solid #fecaca"}}><div style={{color:"#666",fontSize:12}}>Müşteri Alacaklarım</div><div style={{color:"#dc2626",fontWeight:700,fontSize:22,marginTop:4}}>{para(toplamAcik)}</div><div style={{color:"#aaa",fontSize:12}}>{cariler.length} açık hesap</div></div>
      <div style={{...krt,background:"#fff7ed",border:"1px solid #fed7aa"}}><div style={{color:"#666",fontSize:12}}>Tedarikçi Borçlarım</div><div style={{color:"#c2410c",fontWeight:700,fontSize:22,marginTop:4}}>{para(toplamTedari)}</div><div style={{color:"#aaa",fontSize:12}}>{tedarikciler.length} firma</div></div>
    </div>
    <div style={{display:"flex",background:"#f5f6fa",borderRadius:10,padding:3,border:"1px solid #e8ebf5",marginBottom:20,width:"fit-content"}}>
      {[{k:"musteri",l:"👤 Müşteri Veresiye"},{k:"tedari",l:"🏪 Tedarikçi Açık Cari"}].map(s=>(<button key={s.k} onClick={()=>setSekme(s.k)} style={{padding:"8px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:sekme===s.k?700:400,background:sekme===s.k?"#fff":"transparent",color:sekme===s.k?"#e94560":"#666",cursor:"pointer",boxShadow:sekme===s.k?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{s.l}</button>))}
    </div>
    {sekme==="musteri"&&<div>
      {cariler.length===0?<p style={{color:"#aaa"}}>✅ Açık veresiye yok.</p>:
      <Tablo bas={["Müşteri","Satış","Tarih","Toplam","Ödenen","Kalan","Durum",""]}>
        {cariler.map(c=>(<tr key={c.id} style={{borderBottom:"1px solid #f0f2f8"}}>
          <td style={{...td,fontWeight:600}}>{c.musteri_ad_soyad||c.musteriler?.ad_soyad||"-"}</td>
          <td style={td}>#{c.cicek_satislar?.satis_no}</td>
          <td style={td}>{tarih(c.cicek_satislar?.satis_tarihi)}</td>
          <td style={td}>{para(c.tutar)}</td>
          <td style={{...td,color:"#00a854"}}>{para(c.odened||0)}</td>
          <td style={{...td,color:"#dc2626",fontWeight:700}}>{para(c.kalan)}</td>
          <td style={td}><Badge durum={c.durum}/></td>
          <td style={td}><button onClick={()=>setSecili(c)} style={{...kbtn,color:"#00a854",borderColor:"#86efac",fontSize:12}}>💰 Ödeme Al</button></td>
        </tr>))}
      </Tablo>}
      {secili&&<Modal onKapat={()=>setSecili(null)}>
        <h3 style={{color:"#1a1a2e",marginTop:0}}>💰 Ödeme Al — {secili.musteri_ad_soyad}</h3>
        <p style={{color:"#666",fontSize:13}}>Kalan: <strong style={{color:"#dc2626",fontSize:16}}>{para(secili.kalan)}</strong></p>
        <input type="number" value={tutar} onChange={e=>setTutar(e.target.value)} placeholder="Ödenen tutar" style={{...inp,marginBottom:10}} max={secili.kalan}/>
        <button onClick={()=>setTutar(secili.kalan.toString())} style={{...kbtn,marginBottom:14,fontSize:12,width:"100%"}}>Tamamını öde ({para(secili.kalan)})</button>
        <button onClick={ode} style={{...abtn,width:"100%"}}>✅ Kaydet</button>
      </Modal>}
    </div>}
    {sekme==="tedari"&&<div>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#92400e"}}>💡 Gider sayfasında ödeme türü <strong>"📋 Açık Cari"</strong> seçilince buraya düşer. Ödeme yaptığınızda işleyin.</div>
      {tedarikciler.length===0?<p style={{color:"#aaa"}}>✅ Açık tedarikçi borcu yok.</p>:
      <Tablo bas={["Tarih","Firma","Açıklama","Tutar",""]}>
        {tedarikciler.map(g=>(<tr key={g.id} style={{borderBottom:"1px solid #f0f2f8"}}>
          <td style={td}>{tarih(g.harcama_tarihi)}</td>
          <td style={{...td,fontWeight:600}}>{g.firma_adi||"-"}</td>
          <td style={{...td,color:"#555",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.aciklama||"-"}</td>
          <td style={{...td,color:"#c2410c",fontWeight:700}}>{para(g.tutar)}</td>
          <td style={td}><button onClick={()=>setTSecili(g)} style={{...kbtn,color:"#00a854",borderColor:"#86efac",fontSize:12}}>💰 Öde</button></td>
        </tr>))}
      </Tablo>}
      {tSecili&&<Modal onKapat={()=>setTSecili(null)}>
        <h3 style={{color:"#1a1a2e",marginTop:0}}>💰 Tedarikçi Ödeme — {tSecili.firma_adi}</h3>
        <p style={{color:"#666",fontSize:13}}>Borç: <strong style={{color:"#c2410c",fontSize:16}}>{para(tSecili.tutar)}</strong></p>
        <input type="number" value={tTutar} onChange={e=>setTTutar(e.target.value)} placeholder="Ödeme tutarı" style={{...inp,marginBottom:10}}/>
        <button onClick={()=>setTTutar(tSecili.tutar.toString())} style={{...kbtn,marginBottom:14,fontSize:12,width:"100%"}}>Tamamını öde ({para(tSecili.tutar)})</button>
        <button onClick={tedariOde} style={{...abtn,width:"100%"}}>✅ Ödeme Kaydet</button>
      </Modal>}
    </div>}
  </div>);
}

// AI ASİSTAN
function CAsistan(){
  const [mesajlar,setMesajlar]=useState([{rol:"assistant",icerik:"Merhaba! Ben çiçekçi işletmeni analiz eden AI asistanınım. 🌹\n\nSana şunlarda yardımcı olabilirim:\n• Bugünkü satış ve ciro analizi\n• Stok durumu ve öneriler\n• Veresiye takibi\n• Zaiyat analizi\n• İşletme tavsiyeleri\n\nNe öğrenmek istersin?"}]);
  const [input,setInput]=useState("");const [yukleniyor,setYukleniyor]=useState(false);
  const [baglam,setBaglam]=useState(null);const [veriYuk,setVeriYuk]=useState(true);
  const altRef=useRef(null);

  useEffect(()=>{
    const topla=async()=>{
      const b=bugun();const ayBas=b.slice(0,7)+"-01";
      const [sat,stok,cari,zaiyat]=await Promise.all([
        supabase.from("cicek_satislar").select("toplam_tutar,odeme_turu,satis_tarihi,nakit_fis").gte("satis_tarihi",ayBas+"T00:00:00"),
        supabase.from("cicek_urunler").select("urun_adi,stok_miktari,min_stok_uyari,birim,satis_fiyati,alis_fiyati").eq("aktif",true),
        supabase.from("cicek_cari").select("tutar,kalan,musteri_ad_soyad").neq("durum","kapali"),
        supabase.from("cicek_stok_hareketleri").select("miktar,aciklama,cicek_urunler(urun_adi)").eq("hareket_turu","zaiyat").gte("tarih",ayBas),
      ]);
      const s=sat.data||[];const st=stok.data||[];const cr=cari.data||[];const z=zaiyat.data||[];
      const bugunSat=s.filter(x=>x.satis_tarihi?.startsWith(b));
      setBaglam({
        bugunCiro:bugunSat.reduce((t,x)=>t+x.toplam_tutar,0),
        bugunAdet:bugunSat.length,
        ayCiro:s.reduce((t,x)=>t+x.toplam_tutar,0),
        dusukStok:st.filter(x=>x.stok_miktari<=(x.min_stok_uyari||10)),
        bitmisStok:st.filter(x=>x.stok_miktari<=0),
        acikCari:cr.reduce((t,x)=>t+x.kalan,0),
        cariSayisi:cr.length,
        zaiyatAdet:z.reduce((t,x)=>t+x.miktar,0),
        zaiyatSayisi:z.length,
        stokDegeri:st.reduce((t,x)=>t+(x.stok_miktari*(x.alis_fiyati||0)),0),
        enYuksekStok:st.sort((a,b)=>b.stok_miktari-a.stok_miktari).slice(0,5).map(x=>`${x.urun_adi}: ${x.stok_miktari} ${x.birim||"dal"}`),
      });
      setVeriYuk(false);
    };
    topla();
  },[]);

  useEffect(()=>{altRef.current?.scrollIntoView({behavior:"smooth"});},[mesajlar]);

  const gonder=async()=>{
    if(!input.trim()||yukleniyor)return;
    const yeni={rol:"user",icerik:input.trim()};
    const guncellenmis=[...mesajlar,yeni];
    setMesajlar(guncellenmis);setInput("");setYukleniyor(true);
    const b=baglam;
    const sistem=`Sen bir çiçekçi işletmesinin deneyimli AI asistanısın. Türkçe konuş, kısa ve net cevap ver. Kibar ve samimi ol.

İŞLETME VERİLERİ:
Bugün: ${bugun()}
Bugün Ciro: ${para(b?.bugunCiro)} (${b?.bugunAdet} satış)
Bu Ay Ciro: ${para(b?.ayCiro)}
Açık Veresiye: ${para(b?.acikCari)} (${b?.cariSayisi} kişi)
Bu Ay Zaiyat: ${b?.zaiyatAdet} dal/adet (${b?.zaiyatSayisi} kayıt)
Stok Değeri: ${para(b?.stokDegeri)}
Düşük Stok: ${b?.dusukStok?.map(x=>x.urun_adi).join(", ")||"yok"}
Biten Stok: ${b?.bitmisStok?.map(x=>x.urun_adi).join(", ")||"yok"}
En Yüksek Stoklar: ${b?.enYuksekStok?.join(", ")}

WhatsApp mesajı istenirse kibar ve etkili yaz. Tavsiye istenirse verilerden yola çık.`;

    try{
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sistem,messages:guncellenmis.map(m=>({role:m.rol==="user"?"user":"assistant",content:m.icerik}))})});
      const data=await res.json();
      const cevap=data.content?.[0]?.text||"Yanıt alınamadı.";
      setMesajlar(prev=>[...prev,{rol:"assistant",icerik:cevap}]);
    }catch(e){setMesajlar(prev=>[...prev,{rol:"assistant",icerik:"❌ Bağlantı hatası."}]);}
    setYukleniyor(false);
  };

  const sorular=["Bugün özet","Zaiyat analizi","Stok uyarıları","Veresiye durumu","Ne satmalıyım?"];

  return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",maxWidth:700}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <h2 style={{...bstl,marginBottom:0}}>🤖 AI Asistan</h2>
      {veriYuk?<span style={{fontSize:11,color:"#888",background:"#f5f7ff",padding:"3px 8px",borderRadius:20}}>⏳ Yükleniyor...</span>:
      <span style={{fontSize:11,color:"#00c864",background:"rgba(0,200,100,0.1)",padding:"3px 8px",borderRadius:20}}>✅ Hazır</span>}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {sorular.map(s=>(<button key={s} onClick={()=>setInput(s)} style={{...kbtn,fontSize:11,padding:"5px 10px",borderRadius:20,background:"rgba(233,69,96,0.08)",color:"#e94560",borderColor:"rgba(233,69,96,0.2)"}}>{s}</button>))}
    </div>
    <div style={{flex:1,overflowY:"auto",background:"#fff",borderRadius:12,border:"1px solid #e8ebf5",padding:16,display:"flex",flexDirection:"column",gap:12}}>
      {mesajlar.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.rol==="user"?"flex-end":"flex-start"}}>
        <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.rol==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.rol==="user"?"linear-gradient(135deg,#e94560,#c23152)":"#f8f9fc",color:"#1a1a2e",fontSize:13,lineHeight:1.6,border:m.rol==="user"?"none":"1px solid rgba(255,255,255,0.1)",whiteSpace:"pre-wrap"}}>{m.icerik}</div>
      </div>))}
      {yukleniyor&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"10px 14px",borderRadius:18,background:"#f5f7ff",color:"#888",fontSize:13}}>⏳ Düşünüyor...</div></div>}
      <div ref={altRef}/>
    </div>
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&gonder()} placeholder="Bir şey sor..." style={{...inp,flex:1}}/>
      <button onClick={gonder} disabled={yukleniyor||!input.trim()} style={{...abtn,padding:"9px 20px"}}>Gönder</button>
    </div>
  </div>);
}

// KDV
function KDV({isletme}){
  const [ay,setAy]=useState(new Date().toISOString().slice(0,7));const [satislar,setSatislar]=useState([]);const [giderler,setGiderler]=useState([]);
  useEffect(()=>{const b=ay+"-01",bi=ay+"-31";if(isletme==="cicekci")supabase.from("cicek_satislar").select("*").gte("satis_tarihi",b).lte("satis_tarihi",bi+"T23:59:59").then(({data})=>setSatislar(data||[]));supabase.from("giderler").select("*").gte("harcama_tarihi",b).lte("harcama_tarihi",bi).then(({data})=>setGiderler(data||[]));}, [ay,isletme]);
  const nkdv=satislar.filter(s=>s.nakit_fis).reduce((t,s)=>t+s.kdv_tutari,0);const gkdv=giderler.reduce((t,g)=>t+(g.kdv_tutari||0),0);
  return(<div><h2 style={bstl}>🧾 KDV & Rapor</h2><input type="month" value={ay} onChange={e=>setAy(e.target.value)} style={{...inp,width:"auto",marginBottom:24}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div style={krt}><h3 style={{color:"#888",fontSize:13,margin:"0 0 14px"}}>SATIŞ ÖZET</h3>{[{l:"Toplam Satış",v:satislar.reduce((t,s)=>t+s.toplam_tutar,0),c:"#00c864"},{l:"Nakit",v:satislar.filter(s=>s.odeme_turu==="nakit").reduce((t,s)=>t+s.toplam_tutar,0),c:"#00a854"},{l:"Kart",v:satislar.filter(s=>s.odeme_turu==="kredi_karti").reduce((t,s)=>t+s.toplam_tutar,0),c:"#4ea8de"},{l:"Veresiye",v:satislar.filter(s=>s.odeme_turu==="veresiye").reduce((t,s)=>t+s.toplam_tutar,0),c:"#ff6b6b"}].map(r=>(<div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#777",fontSize:13}}>{r.l}</span><span style={{color:r.c,fontWeight:500}}>{para(r.v)}</span></div>))}</div><div style={krt}><h3 style={{color:"#888",fontSize:13,margin:"0 0 14px"}}>KDV</h3>{[{l:"Fiş Kesilen KDV",v:nkdv,c:"#ffa500"},{l:"Gider KDV (indirim)",v:gkdv,c:"#4ea8de"},{l:"ÖDENECEK KDV",v:nkdv-gkdv,c:(nkdv-gkdv)>0?"#ff6b6b":"#00c864",b:true}].map(r=>(<div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#777",fontSize:13}}>{r.l}</span><span style={{color:r.c,fontWeight:r.b?700:500}}>{para(r.v)}</span></div>))}</div></div></div>);
}

function Hatirlaticilar({k}){
  const [liste,setListe]=useState([]);const [form,setForm]=useState({baslik:"",aciklama:"",etkinlik_tarihi:"",hatirlat_gun_once:3,isletme:"ortak"});const [acik,setAcik]=useState(false);
  const yukle=()=>supabase.from("hatirlaticilar").select("*").eq("durum","aktif").order("etkinlik_tarihi").then(({data})=>setListe(data||[]));
  useEffect(()=>{yukle();}, []);
  const kaydet=async()=>{await supabase.from("hatirlaticilar").insert({...form,kullanici_id:k?.id});setAcik(false);yukle();};
  const tamamla=async(id)=>{await supabase.from("hatirlaticilar").update({durum:"tamamlandi"}).eq("id",id);setListe(liste.filter(h=>h.id!==id));};
  const kalan=(t)=>Math.ceil((new Date(t)-new Date())/(1000*60*60*24));
  return(<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h2 style={bstl}>⏰ Hatırlatıcılar</h2><button onClick={()=>setAcik(!acik)} style={abtn}>+ Ekle</button></div>{acik&&<div style={{background:"#f5f7ff",borderRadius:14,padding:18,marginBottom:16,border:"1px solid #e8ebf5"}}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10}}><div><label style={lbl}>Başlık</label><input value={form.baslik} onChange={e=>setForm({...form,baslik:e.target.value})} style={inp}/></div><div><label style={lbl}>Tarih</label><input type="date" value={form.etkinlik_tarihi} onChange={e=>setForm({...form,etkinlik_tarihi:e.target.value})} style={inp}/></div><div><label style={lbl}>Gün Önce</label><input type="number" value={form.hatirlat_gun_once} onChange={e=>setForm({...form,hatirlat_gun_once:+e.target.value})} style={inp}/></div><div><label style={lbl}>İşletme</label><select value={form.isletme} onChange={e=>setForm({...form,isletme:e.target.value})} style={inp}><option value="ortak">Ortak</option><option value="cicekci">Çiçekçi</option><option value="kuru_temizleme">Kuru Temizleme</option></select></div></div><input value={form.aciklama} onChange={e=>setForm({...form,aciklama:e.target.value})} placeholder="Açıklama" style={{...inp,marginTop:8}}/><button onClick={kaydet} style={{...abtn,marginTop:10}}>Kaydet</button></div>}<div style={{display:"flex",flexDirection:"column",gap:10}}>{liste.map(h=>{const k2=kalan(h.etkinlik_tarihi);return(<div key={h.id} style={{background:k2<=3?"rgba(255,165,0,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${k2<=3?"rgba(255,165,0,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:14}}><div style={{flex:1}}><div style={{color:"#1a1a2e",fontWeight:600}}>{h.baslik}</div>{h.aciklama&&<div style={{color:"#999",fontSize:12}}>{h.aciklama}</div>}<div style={{color:k2<=0?"#ff6b6b":k2<=3?"#ffa500":"rgba(255,255,255,0.45)",fontSize:12,marginTop:3}}>📅 {new Date(h.etkinlik_tarihi).toLocaleDateString("tr-TR")} {k2<=0?"• GEÇTİ!":k2<=3?`• ${k2} gün kaldı!`:`• ${k2} gün`}</div></div><button onClick={()=>tamamla(h.id)} style={{...kbtn,background:"rgba(0,200,100,0.1)",color:"#00c864",border:"1px solid rgba(0,200,100,0.2)"}}>✓ Tamam</button></div>);})} {!liste.length&&<p style={{color:"#bbb"}}>Aktif hatırlatıcı yok.</p>}</div></div>);
}

function Gider({k,isletme}){
  const [giderler,setGiderler]=useState([]);const [hesaplar,setHesaplar]=useState([]);const [acik,setAcik]=useState(false);
  const [ay,setAy]=useState(new Date().toISOString().slice(0,7));
  const [form,setForm]=useState({islem_tarihi:bugun(),harcama_tarihi:bugun(),belge_turu:"Fiş",belge_no:"",isletme:isletme||"ortak",firma_adi:"",aciklama:"",kdv_tutari:0,tutar:"",odeme_turu:""});
  const [hesapId,setHesapId]=useState(""),[transferId,setTransferId]=useState("");
  // OCR
  const [ocrYukleniyor,setOcrYukleniyor]=useState(false);
  const [ocrOnizleme,setOcrOnizleme]=useState(null);
  const [ocrSonuc,setOcrSonuc]=useState(null);
  const [ocrHata,setOcrHata]=useState("");
  const dosyaRef=useRef(null);

  useEffect(()=>{supabase.from("hesap_adlari").select("*").eq("aktif",true).then(({data})=>setHesaplar(data||[]));}, []);
  useEffect(()=>{supabase.from("giderler").select("*,hesap_adlari!giderler_hesap_id_fkey(hesap_adi)").gte("harcama_tarihi",ay+"-01").lte("harcama_tarihi",ay+"-31").order("harcama_tarihi",{ascending:false}).then(({data})=>setGiderler(data||[]));}, [ay]);

  const kaydet=async()=>{
    if(!form.tutar||+form.tutar<=0){toast("Tutar girilmedi!","uyari");return;}
    if(!form.odeme_turu){toast("Ödeme türü seçilmeli!","uyari");return;}

    const bugunStr=form.harcama_tarihi||bugun();
    // islem_turu DB'de YOK — form'dan çıkar
    const{islem_turu:_ign,...formTemiz}=form;
    const{error}=await supabase.from("giderler").insert({
      ...formTemiz,
      harcama_tarihi:bugunStr,
      islem_tarihi:bugunStr,  // NOT NULL kolonu
      tutar:+form.tutar,
      kdv_tutari:+form.kdv_tutari||0,
      hesap_id:hesapId||null,
      transfer_hesap_id:form.islem_turu==="transfer"?transferId||null:null,
      kullanici_id:k?.id,
    });

    if(error){toast("Kayıt hatası: "+error.message,"hata");return;}

    setAcik(false);setOcrOnizleme(null);setOcrSonuc(null);
    supabase.from("giderler").select("*,hesap_adlari!giderler_hesap_id_fkey(hesap_adi)").gte("harcama_tarihi",ay+"-01").lte("harcama_tarihi",ay+"-31").order("harcama_tarihi",{ascending:false}).then(({data})=>setGiderler(data||[]));
  };

  const ocrIsle=async(dosya)=>{
    if(!dosya)return;
    setOcrYukleniyor(true);setOcrHata("");setOcrSonuc(null);

    const isPdf=dosya.type==="application/pdf";

    // Önizleme
    if(!isPdf){
      const reader=new FileReader();
      reader.onload=(e)=>setOcrOnizleme(e.target.result);
      reader.readAsDataURL(dosya);
    } else {
      setOcrOnizleme("pdf");
    }

    try{
      let body;
      if(isPdf){
        // PDF — pdfjs ile metin çıkar, sonra Groq'a gönder
        const arrayBuffer=await dosya.arrayBuffer();
        const uint8=new Uint8Array(arrayBuffer);
        // PDF.js CDN'den yükle
        if(!window.pdfjsLib){
          await new Promise((res,rej)=>{
            const s=document.createElement("script");
            s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload=res;s.onerror=rej;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const pdfDoc=await window.pdfjsLib.getDocument({data:uint8}).promise;
        let metin="";
        for(let i=1;i<=Math.min(pdfDoc.numPages,5);i++){
          const page=await pdfDoc.getPage(i);
          const tc=await page.getTextContent();
          metin+=tc.items.map(x=>x.str).join(" ")+"\n";
        }
        body=JSON.stringify({pdfText:metin});
      } else {
        // Görsel — base64
        const b64=await new Promise((res)=>{
          const r=new FileReader();
          r.onload=(e)=>res(e.target.result.split(",")[1]);
          r.readAsDataURL(dosya);
        });
        body=JSON.stringify({image:b64,mimeType:dosya.type||"image/jpeg"});
      }

      const resp=await fetch("/api/ocr",{method:"POST",headers:{"Content-Type":"application/json"},body});
      const data=await resp.json();

      if(data.parsed){
        const p=data.parsed;
        setOcrSonuc(p);
        setForm(f=>({...f,
          belge_turu:p.belge_turu?.includes("E-Fatura")?"E-Fatura":p.belge_turu?.includes("atura")?"Fatura":"Fiş",
          belge_no:p.fatura_no||"",
          firma_adi:p.firma_adi||"",
          harcama_tarihi:p.tarih||bugun(),
          tutar:p.toplam_tutar?.toString()||"",
          kdv_tutari:p.kdv_tutari||0,
          odeme_turu:p.odeme_turu==="kredi_karti"?"kredi_karti":p.odeme_turu==="havale"?"havale":"nakit",
          aciklama:p.kalemler?.map(k=>k.aciklama).filter(Boolean).join(", ")||"",
          isletme:p.onerilen_isletme||isletme||"ortak",
        }));
      } else {
        setOcrHata("Belge okunamadı. Manuel girin veya daha net bir fotoğraf deneyin.");
      }
    }catch(e){
      setOcrHata("OCR hatası: "+e.message);
    }
    setOcrYukleniyor(false);
  };

  const top=giderler.filter(g=>g.islem_turu!=="transfer").reduce((t,g)=>t+g.tutar,0);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,alignItems:"center"}}>
      <h2 style={bstl}>💸 Giderler</h2>
      <div style={{display:"flex",gap:10}}>
        <input type="month" value={ay} onChange={e=>setAy(e.target.value)} style={{...inp,width:"auto"}}/>
        <button onClick={()=>setAcik(!acik)} style={abtn}>+ Ekle</button>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      {[{l:"Toplam Gider",v:para(top),c:"#ff6b6b"},{l:"KDV Tutarı",v:para(giderler.reduce((t,g)=>t+(g.kdv_tutari||0),0)),c:"#ffa500"},{l:"İşlem Sayısı",v:giderler.length,c:"#4ea8de"}].map(s=>(<div key={s.l} style={{background:"#f5f7ff",borderRadius:12,padding:"13px 16px"}}>
        <div style={{color:"#999",fontSize:11}}>{s.l}</div>
        <div style={{color:s.c,fontWeight:700,fontSize:16,marginTop:3}}>{s.v}</div>
      </div>))}
    </div>

    {acik&&<div style={{background:"#f8f9fc",borderRadius:14,padding:18,marginBottom:16,border:"1px solid #e8ebf5"}}>

      {/* OCR Bölümü */}
      <div style={{background:"rgba(78,168,222,0.08)",border:"1px solid rgba(78,168,222,0.2)",borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{color:"#4ea8de",fontWeight:700,fontSize:14,marginBottom:8}}>📷 Fiş / Fatura Fotoğrafı ile Otomatik Doldur</div>
        <p style={{color:"#888",fontSize:12,marginBottom:12}}>Fişin veya faturanın fotoğrafını yükleyin — AI otomatik okuyup formu dolduracak.</p>

        <input ref={dosyaRef} type="file" accept="image/*,application/pdf" capture="environment" onChange={e=>ocrIsle(e.target.files[0])} style={{display:"none"}}/>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>{dosyaRef.current.removeAttribute("capture");dosyaRef.current.click();}}
            style={{...abtn,background:"linear-gradient(135deg,#4ea8de,#2563eb)",fontSize:13}}>
            📁 Fotoğraf / PDF Seç
          </button>
          <button onClick={()=>{dosyaRef.current.setAttribute("capture","environment");dosyaRef.current.click();}}
            style={{...kbtn,fontSize:13,background:"rgba(78,168,222,0.1)",color:"#4ea8de",borderColor:"rgba(78,168,222,0.3)"}}>
            📷 Kamerayla Çek
          </button>
        </div>

        {ocrYukleniyor&&<div style={{marginTop:12,display:"flex",alignItems:"center",gap:10,color:"#4ea8de",fontSize:13}}>
          <div style={{width:18,height:18,border:"2px solid #4ea8de",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          AI fişi okuyor, lütfen bekleyin...
        </div>}

        {ocrHata&&<div style={{marginTop:10,color:"#ff6b6b",fontSize:12,background:"rgba(255,107,107,0.1)",padding:"8px 12px",borderRadius:8}}>{ocrHata}</div>}

        {ocrOnizleme&&!ocrYukleniyor&&<div style={{marginTop:12,display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
          {ocrOnizleme==="pdf"
            ?<div style={{width:80,height:100,borderRadius:8,border:"1px solid #dde1ec",background:"rgba(255,100,100,0.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <span style={{fontSize:32}}>📄</span>
              <span style={{color:"#ff6b6b",fontSize:10,fontWeight:700}}>PDF</span>
            </div>
            :<img src={ocrOnizleme} alt="belge" style={{maxWidth:160,maxHeight:200,borderRadius:8,border:"1px solid #e0e4f0",objectFit:"contain"}}/>
          }
          {ocrSonuc&&<div style={{flex:1,minWidth:200}}>
            <div style={{color:"#00c864",fontWeight:600,fontSize:13,marginBottom:8}}>✅ Başarıyla okundu!</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {[
                {l:"Firma",v:ocrSonuc.firma_adi},
                {l:"Tarih",v:ocrSonuc.tarih},
                {l:"Toplam",v:ocrSonuc.toplam_tutar?para(ocrSonuc.toplam_tutar):""},
                {l:"KDV",v:ocrSonuc.kdv_tutari?para(ocrSonuc.kdv_tutari):""},
                {l:"Belge No",v:ocrSonuc.fatura_no},
                {l:"Ödeme",v:ocrSonuc.odeme_turu},
                {l:"İşletme",v:ocrSonuc.onerilen_isletme==="cicekci"?"🌹 Çiçekçi":ocrSonuc.onerilen_isletme==="kuru_temizleme"?"👔 K.Temizleme":ocrSonuc.onerilen_isletme?"🏢 Ortak":null},
              ].filter(x=>x.v).map(x=>(<div key={x.l} style={{display:"flex",gap:8,fontSize:12}}>
                <span style={{color:"#999",minWidth:70}}>{x.l}:</span>
                <span style={{color:x.l==="İşletme"?"#ffa500":"#333",fontWeight:600}}>{x.v}</span>
              </div>))}
            </div>
            {ocrSonuc.kalemler?.length>0&&<div style={{marginTop:8}}>
              <div style={{color:"#888",fontSize:11,marginBottom:4}}>Kalemler:</div>
              {ocrSonuc.kalemler.slice(0,5).map((kl,i)=>(<div key={i} style={{fontSize:11,color:"#555",marginBottom:2}}>
                • {kl.aciklama} {kl.toplam?`— ${para(kl.toplam)}`:""}
              </div>))}
            </div>}
          </div>}
        </div>}
      </div>

      {/* Manuel Form */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{v:"gider",l:"💸 Gider"},{v:"transfer",l:"🔄 Hesap Transferi"}].map(t=>(<button key={t.v} onClick={()=>setForm({...form,islem_turu:t.v})}
          style={{...obtn,borderColor:form.islem_turu===t.v?"#e94560":"#dde1ec",background:form.islem_turu===t.v?"rgba(233,69,96,0.08)":"transparent",color:form.islem_turu===t.v?"#e94560":"#666"}}>{t.l}</button>))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        <div><label style={lbl}>Tarih</label><input type="date" value={form.harcama_tarihi} onChange={e=>setForm({...form,harcama_tarihi:e.target.value})} style={inp}/></div>
        {form.islem_turu==="gider"&&<>
          <div><label style={lbl}>Belge Türü</label><select value={form.belge_turu} onChange={e=>setForm({...form,belge_turu:e.target.value})} style={inp}>{["Fiş","Fatura","E-Fatura","Dekont"].map(b=><option key={b}>{b}</option>)}</select></div>
          <div><label style={lbl}>Belge No</label><input value={form.belge_no} onChange={e=>setForm({...form,belge_no:e.target.value})} style={inp} placeholder="Opsiyonel"/></div>
          <div><label style={lbl}>Firma / Mağaza</label><input value={form.firma_adi} onChange={e=>setForm({...form,firma_adi:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>İşletme</label><select value={form.isletme} onChange={e=>setForm({...form,isletme:e.target.value})} style={inp}><option value="cicekci">Çiçekçi</option><option value="kuru_temizleme">K.Temizleme</option><option value="ortak">Ortak</option></select></div>
        </>}
        <div><label style={lbl}>Tutar ₺</label><input type="number" value={form.tutar} onChange={e=>setForm({...form,tutar:e.target.value})} style={inp}/></div>
        <div><label style={lbl}>Ödeme Türü *</label><select value={form.odeme_turu} onChange={e=>setForm({...form,odeme_turu:e.target.value})} style={inp}><option value="">-- Seçiniz (Zorunlu) --</option><option value="nakit">💵 Nakit</option><option value="kredi_karti">💳 Kart</option><option value="havale">🏦 Havale/EFT</option><option value="acik_cari">📋 Açık Cari (Sonra Öde)</option></select></div>
        <div><label style={lbl}>Hesap</label><select value={hesapId} onChange={e=>setHesapId(e.target.value)} style={inp}><option value="">Seç...</option>{hesaplar.map(h=><option key={h.id} value={h.id}>{h.hesap_adi}</option>)}</select></div>
        {form.islem_turu==="transfer"&&<div><label style={lbl}>Hedef Hesap</label><select value={transferId} onChange={e=>setTransferId(e.target.value)} style={inp}><option value="">Seç...</option>{hesaplar.map(h=><option key={h.id} value={h.id}>{h.hesap_adi}</option>)}</select></div>}
        {form.islem_turu==="gider"&&<div><label style={lbl}>KDV Tutarı</label><input type="number" value={form.kdv_tutari} onChange={e=>setForm({...form,kdv_tutari:+e.target.value})} style={inp}/></div>}
      </div>
      {form.islem_turu==="gider"&&<input value={form.aciklama} onChange={e=>setForm({...form,aciklama:e.target.value})} placeholder="Açıklama (ürünler, not...)" style={{...inp,marginTop:10}}/>}

      <div style={{display:"flex",gap:10,marginTop:14,alignItems:"center"}}>
        <button onClick={kaydet} disabled={!form.tutar} style={{...abtn,opacity:form.tutar?1:0.5}}>💾 Kaydet</button>
        <button onClick={()=>{setAcik(false);setOcrOnizleme(null);setOcrSonuc(null);}} style={kbtn}>İptal</button>
      </div>
    </div>}

    <Tablo bas={["Tarih","Belge","Firma","İşletme","Açıklama","KDV","Tutar","Ödeme"]}>
      {giderler.map((g,i)=>(<tr key={g.id} style={{borderBottom:"1px solid #f0f2f8",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
        <td style={td}>{tarih(g.harcama_tarihi)}</td>
        <td style={td}>{g.belge_turu||"-"}</td>
        <td style={td}>{g.firma_adi||"-"}</td>
        <td style={td}><span style={{padding:"2px 8px",borderRadius:8,background:g.isletme==="cicekci"?"rgba(233,69,96,0.15)":g.isletme==="kuru_temizleme"?"rgba(78,168,222,0.15)":"rgba(255,165,0,0.15)",color:g.isletme==="cicekci"?"#e94560":g.isletme==="kuru_temizleme"?"#4ea8de":"#ffa500",fontSize:11}}>{g.isletme==="cicekci"?"Çiçek":g.isletme==="kuru_temizleme"?"K.T.":"Ortak"}</span></td>
        <td style={td}>{g.aciklama||"-"}</td>
        <td style={td}>{g.kdv_tutari?para(g.kdv_tutari):"-"}</td>
        <td style={{...td,color:g.islem_turu==="transfer"?"#4ea8de":"#ff6b6b",fontWeight:700}}>{para(g.tutar)}</td>
        <td style={td}>{g.hesap_adlari?.hesap_adi||g.odeme_turu}</td>
      </tr>))}
    </Tablo>

  </div>);
}

// BARKOD ETİKET YAZDIR
function barkodEtiketYazdir(urun) {
  const barkod = urun.barkod || ("CK"+urun.id?.slice(-8));
  const html = `<html><head><title>Etiket</title>
  <style>*{margin:0;padding:0;}body{font-family:'Courier New',monospace;width:60mm;}</style>
  </head><body>
  <div style="text-align:center;padding:4mm;">
    <div style="font-size:11px;font-weight:700;">${urun.urun_adi?.toUpperCase()}</div>
    <div style="font-size:10px;color:#555;">${para(urun.satis_fiyati)}/${urun.birim||"dal"}</div>
    <svg id="bc" style="margin:3px auto;display:block;"></svg>
    <div style="font-size:9px;">${barkod}</div>
  </div>
  <script>
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
  s.onload=function(){JsBarcode("#bc","${barkod}",{format:"CODE128",width:1.2,height:30,displayValue:false,margin:0});setTimeout(()=>window.print(),300);};
  document.head.appendChild(s);
  <\/script></body></html>`;
  const w=window.open("","",`width=300,height=200`);
  if(w){w.document.write(html);w.document.close();}
}

// MÜŞTERİ YÖNETİMİ (ÇİÇEK)
function CMusteriler({onSiparisAc}){
  const [musteriler,setMusteriler]=useState([]);const [secili,setSecili]=useState(null);
  const [gecmis,setGecmis]=useState([]);const [ozelGunler,setOzelGunler]=useState([]);
  const [ara,setAra]=useState("");const [ozelGunForm,setOzelGunForm]=useState({gun_adi:"",tarih:"",yillik:true,notlar:""});
  const [ozelGunAcik,setOzelGunAcik]=useState(false);

  useEffect(()=>{supabase.from("musteriler").select("*").order("ad_soyad").then(({data})=>setMusteriler(data||[]));}, []);

  const [ktGecmis,setKtGecmis]=useState([]);const [ktBorc,setKtBorc]=useState(0);const [cicekBorc,setCicekBorc]=useState(0);

  const musteriSec=async(m)=>{
    setSecili(m);setOzelGunAcik(false);
    // Çiçek geçmişi
    supabase.from("cicek_satislar").select("satis_no,toplam_tutar,odeme_turu,satis_tarihi").eq("musteri_id",m.id).order("satis_tarihi",{ascending:false}).limit(10).then(({data})=>setGecmis(data||[]));
    // Çiçek açık borç
    supabase.from("cicek_cari").select("kalan").eq("musteri_id",m.id).neq("durum","kapali").then(({data})=>setCicekBorc((data||[]).reduce((t,x)=>t+x.kalan,0)));
    // KT fişleri
    supabase.from("kt_fisler").select("fis_no,durum,toplam_tutar,indirimli_tutar,kalan,acilis_tarihi").eq("musteri_id",m.id).order("acilis_tarihi",{ascending:false}).limit(10).then(({data})=>setKtGecmis(data||[]));
    // KT açık borç
    supabase.from("kt_fisler").select("kalan").eq("musteri_id",m.id).gt("kalan",0).then(({data})=>setKtBorc((data||[]).reduce((t,x)=>t+(x.kalan||0),0)));
    // Özel günler
    supabase.from("hatirlaticilar").select("*").eq("musteri_id",m.id).order("etkinlik_tarihi").then(({data})=>setOzelGunler(data||[]));
  };

  const ozelGunKaydet=async()=>{
    if(!ozelGunForm.gun_adi||!ozelGunForm.tarih)return toast("Gün adı ve tarih gerekli!","uyari");
    // Bu yıl için hatırlatma oluştur
    const buYilTarih=new Date().getFullYear()+"-"+ozelGunForm.tarih.slice(5);
    const gectiMi=new Date(buYilTarih)<new Date();
    const hatirlatTarih=gectiMi?(new Date().getFullYear()+1)+"-"+ozelGunForm.tarih.slice(5):buYilTarih;
    // 3 gün öncesinde hatırlat
    const hatirlatGun=new Date(hatirlatTarih);hatirlatGun.setDate(hatirlatGun.getDate()-3);
    await supabase.from("hatirlaticilar").insert({
      baslik:`🌹 ${secili.ad_soyad} — ${ozelGunForm.gun_adi}`,
      aciklama:ozelGunForm.notlar||`${secili.ad_soyad} müşterinizin ${ozelGunForm.gun_adi} yaklaşıyor! WA mesajı gönderin.`,
      etkinlik_tarihi:hatirlatTarih,
      hatirlat_gun_once:3,
      isletme:"cicekci",
      musteri_id:secili.id,
      durum:"aktif",
      yillik:ozelGunForm.yillik,
    });
    setOzelGunAcik(false);setOzelGunForm({gun_adi:"",tarih:"",yillik:true,notlar:""});
    musteriSec(secili);
  };

  const filtreli=musteriler.filter(m=>m.ad_soyad?.toLowerCase().includes(ara.toLowerCase())||m.telefon?.includes(ara));
  const toplamCiro=gecmis.reduce((t,s)=>t+s.toplam_tutar,0);

  return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
    <div>
      <input value={ara} onChange={e=>setAra(e.target.value)} placeholder="🔍 Müşteri ara..." style={{...inp,marginBottom:10}}/>
      <div style={{maxHeight:"calc(100vh-220px)",overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
        {filtreli.map(m=>(<div key={m.id} onClick={()=>musteriSec(m)} style={{background:secili?.id===m.id?"rgba(233,69,96,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${secili?.id===m.id?"rgba(233,69,96,0.4)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer"}}>
          <div style={{color:"#1a1a2e",fontWeight:600,fontSize:13}}>{m.ad_soyad}</div>
          <div style={{color:"#999",fontSize:12}}>📞 {m.telefon||"-"}</div>
        </div>))}
      </div>
    </div>
    {secili?<div>
      <div style={krt}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <h3 style={{color:"#1a1a2e",margin:0,fontSize:17}}>{secili.ad_soyad}</h3>
            <div style={{color:"#777",fontSize:13,marginTop:4}}>📞 {secili.telefon||"-"}</div>
            {secili.email&&<div style={{color:"#999",fontSize:12}}>✉️ {secili.email}</div>}
          </div>
          {secili.telefon&&<a href={`https://wa.me/90${secili.telefon?.replace(/\D/g,"").slice(-10)}`} target="_blank" rel="noreferrer" style={{background:"#25D366",color:"#1a1a2e",padding:"7px 14px",borderRadius:20,textDecoration:"none",fontSize:12,fontWeight:600}}>📱 WA</a>}
          {onSiparisAc&&<button onClick={()=>onSiparisAc(secili)} style={{...abtn,fontSize:12,padding:"7px 14px",borderRadius:20}}>📦 Sipariş Oluştur</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {[{l:"Toplam Alış",v:para(toplamCiro),c:"#e94560"},{l:"Sipariş",v:gecmis.length,c:"#4ea8de"},{l:"Son Alış",v:gecmis[0]?tarih(gecmis[0].satis_tarihi):"-",c:"rgba(255,255,255,0.6)"}].map(s=>(<div key={s.l} style={{background:"#f5f7ff",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
            <div style={{color:"#aaa",fontSize:10}}>{s.l}</div>
            <div style={{color:s.c,fontWeight:700,fontSize:14,marginTop:2}}>{s.v}</div>
          </div>))}
        </div>

        {/* Birleşik Bakiye */}
        {(cicekBorc>0||ktBorc>0)&&<div style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:10,padding:12,marginBottom:14}}>
          <div style={{color:"#ff6b6b",fontWeight:700,fontSize:13,marginBottom:8}}>⚠️ Açık Bakiyeler</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {cicekBorc>0&&<div style={{background:"rgba(233,69,96,0.1)",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
              <div style={{color:"#888",fontSize:10}}>🌹 Çiçekçi Borcu</div>
              <div style={{color:"#e94560",fontWeight:700,fontSize:15,marginTop:3}}>{para(cicekBorc)}</div>
            </div>}
            {ktBorc>0&&<div style={{background:"rgba(78,168,222,0.1)",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
              <div style={{color:"#888",fontSize:10}}>👔 K.Temizleme Borcu</div>
              <div style={{color:"#4ea8de",fontWeight:700,fontSize:15,marginTop:3}}>{para(ktBorc)}</div>
            </div>}
            <div style={{background:"rgba(255,107,107,0.15)",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
              <div style={{color:"#888",fontSize:10}}>💰 Toplam Borç</div>
              <div style={{color:"#ff6b6b",fontWeight:800,fontSize:15,marginTop:3}}>{para(cicekBorc+ktBorc)}</div>
            </div>
          </div>
        </div>}

        {/* Özel Günler */}
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{color:"#666",fontSize:13,fontWeight:600}}>🎂 Özel Günler & Hatırlatmalar</span>
            <button onClick={()=>setOzelGunAcik(!ozelGunAcik)} style={{...kbtn,fontSize:11,background:"rgba(233,69,96,0.1)",color:"#e94560",borderColor:"rgba(233,69,96,0.3)"}}>+ Özel Gün Ekle</button>
          </div>
          {ozelGunAcik&&<div style={{background:"#f8f9fc",borderRadius:10,padding:14,marginBottom:10,border:"1px solid #e8ebf5"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <label style={lbl}>Özel Gün Adı *</label>
                <input value={ozelGunForm.gun_adi} onChange={e=>setOzelGunForm({...ozelGunForm,gun_adi:e.target.value})} style={inp} placeholder="Doğum günü, Evlilik yıldönümü..."/>
              </div>
              <div>
                <label style={lbl}>Tarih *</label>
                <input type="date" value={ozelGunForm.tarih} onChange={e=>setOzelGunForm({...ozelGunForm,tarih:e.target.value})} style={inp}/>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={lbl}>Not (WA mesajında kullanılır)</label>
              <input value={ozelGunForm.notlar} onChange={e=>setOzelGunForm({...ozelGunForm,notlar:e.target.value})} style={inp} placeholder="Eşinin doğum günü, sarı gülleri seviyor..."/>
            </div>
            <div style={{background:"rgba(255,165,0,0.08)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#777",marginBottom:10}}>
              💡 3 gün öncesinde hatırlatıcı oluşturulacak. Her yıl otomatik tekrarlar.
            </div>
            <button onClick={ozelGunKaydet} style={{...abtn,fontSize:12}}>💾 Kaydet & Hatırlatıcı Oluştur</button>
          </div>}
          {ozelGunler.length===0?<div style={{color:"#ccc",fontSize:12}}>Henüz özel gün eklenmedi.</div>:
          ozelGunler.map(og=>(<div key={og.id} style={{background:"rgba(255,165,0,0.07)",border:"1px solid rgba(255,165,0,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#ffa500",fontWeight:600,fontSize:13}}>{og.baslik}</div>
              <div style={{color:"#888",fontSize:11,marginTop:2}}>📅 {tarih(og.etkinlik_tarihi)}</div>
            </div>
            <Badge durum={og.durum}/>
          </div>))}
        </div>
      </div>

      {/* Geçmiş Alışlar */}
      <h4 style={{color:"#888",fontSize:13,margin:"16px 0 8px"}}>🌹 Çiçek Geçmişi ({gecmis.length})</h4>
      {gecmis.map(s=>(<div key={s.id} style={{...krt,marginBottom:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{color:"#1a1a2e",fontWeight:600,fontSize:13}}>#{s.satis_no}</span>
          <span style={{color:"#aaa",fontSize:12,marginLeft:10}}>{tarih(s.satis_tarihi)}</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <Badge tip={s.odeme_turu}/>
          <span style={{color:"#e94560",fontWeight:700}}>{para(s.toplam_tutar)}</span>
        </div>
      </div>))}

      {ktGecmis.length>0&&<>
        <h4 style={{color:"#888",fontSize:13,margin:"16px 0 8px"}}>👔 Kuru Temizleme Geçmişi ({ktGecmis.length})</h4>
        {ktGecmis.map(f=>(<div key={f.id} style={{...krt,marginBottom:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <span style={{color:"#1a1a2e",fontWeight:600,fontSize:13}}>#{f.fis_no}</span>
            <span style={{color:"#aaa",fontSize:12,marginLeft:10}}>{tarih(f.acilis_tarihi)}</span>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Badge durum={f.durum}/>
            <span style={{color:"#4ea8de",fontWeight:700}}>{para(f.toplam_tutar)}</span>
            {f.kalan>0&&<span style={{color:"#ff6b6b",fontSize:11}}>Borç: {para(f.kalan)}</span>}
          </div>
        </div>))}
      </>}
    </div>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#ccc"}}>← Müşteri seçin</div>}
  </div>);
}

// SİPARİŞ TAKİBİ
// ═══════════════════════════════════════════════════════════
// TASLAK SİSTEMİ — Cihazlar arası senkronizasyon
// Supabase tablosu: taslaklar (id, tablo, veri, kullanici_id, cihaz, guncelleme_tarihi)
// ═══════════════════════════════════════════════════════════
async function taslakKaydet(tablo, veri, kullaniciId) {
  const cihaz = navigator.userAgent.includes('Mobile') ? 'telefon' : 'bilgisayar';
  const { data: mevcut } = await supabase.from("taslaklar")
    .select("id").eq("tablo", tablo).eq("kullanici_id", kullaniciId).maybeSingle();
  if (mevcut) {
    await supabase.from("taslaklar").update({ veri: JSON.stringify(veri), cihaz, guncelleme_tarihi: new Date().toISOString() }).eq("id", mevcut.id);
  } else {
    await supabase.from("taslaklar").insert({ tablo, veri: JSON.stringify(veri), kullanici_id: kullaniciId, cihaz, guncelleme_tarihi: new Date().toISOString() });
  }
}
async function taslakOku(tablo, kullaniciId) {
  const { data } = await supabase.from("taslaklar").select("*").eq("tablo", tablo).eq("kullanici_id", kullaniciId).maybeSingle();
  if (!data) return null;
  try { return { veri: JSON.parse(data.veri), cihaz: data.cihaz, tarih: data.guncelleme_tarihi }; } catch { return null; }
}
async function taslakSil(tablo, kullaniciId) {
  await supabase.from("taslaklar").delete().eq("tablo", tablo).eq("kullanici_id", kullaniciId);
}

// ═══════════════════════════════════════════════════════════
// SİPARİŞ TAKİBİ + KURYE PANELİ
// ═══════════════════════════════════════════════════════════
function CSiparisler({k, onGelMusteri, onGelMusteriTemizle}){
  const [siparisler,setSiparisler]=useState([]);
  const [acik,setAcik]=useState(false);
  const [urunler,setUrunler]=useState([]);
  const [ok,setOk]=useState(false);
  const [aktifSekme,setAktifSekme]=useState("liste"); // liste | kurye
  const [taslakBilgi,setTaslakBilgi]=useState(null); // {cihaz, tarih}

  const BOSLUK = {musteri_adi:"",musteri_tel:"",teslimat_adresi:"",teslimat_tarihi:"",teslimat_saati:"",notlar:"",ozel_gun_turu:"",ozel_gun_tarihi:"",hatirlatma_olustur:false,odeme_turu:"nakit"};
  const [form,setForm]=useState(BOSLUK);
  const [kalemler,setKalemler]=useState([]);

  const OZEL_GUNLER=["Doğum Günü","Evlilik Yıldönümü","Sevgililer Günü","Anneler Günü","Babalar Günü","Mezuniyet","Diğer"];
  const DURUMLAR={bekliyor:{l:"⏳ Bekliyor",c:"#f59e0b"},hazirlaniyor:{l:"🔧 Hazırlanıyor",c:"#3b82f6"},hazir:{l:"✅ Hazır",c:"#10b981"},teslim_edildi:{l:"📦 Teslim",c:"#8b5cf6"},iptal:{l:"❌ İptal",c:"#ef4444"}};

  // Taslak otosave — form değişince Supabase'e yaz
  const taslakSaveRef = useRef(null);
  const formDegisti = (yeniForm, yeniKalemler) => {
    clearTimeout(taslakSaveRef.current);
    taslakSaveRef.current = setTimeout(async () => {
      if (k?.id && (yeniForm?.musteri_adi || (yeniKalemler||[]).length > 0)) {
        await taslakKaydet("siparis_formu", { form: yeniForm, kalemler: yeniKalemler }, k.id);
        setTaslakBilgi({ cihaz: navigator.userAgent.includes('Mobile') ? 'telefon' : 'bilgisayar', tarih: new Date().toISOString() });
      }
    }, 1500); // 1.5s debounce
  };

  useEffect(()=>{
    yukle();
    supabase.from("cicek_urunler").select("*").eq("aktif",true).then(({data})=>setUrunler(data||[]));
    // Taslak yükle
    if (k?.id) {
      taslakOku("siparis_formu", k.id).then(t => {
        if (t) {
          setTaslakBilgi({ cihaz: t.cihaz, tarih: t.tarih });
          // Taslak var ama form boşsa otomatik yükleme öner
        }
      });
    }
  },[]);

  useEffect(()=>{
    if(onGelMusteri){
      const yeniForm = {...BOSLUK, musteri_adi:onGelMusteri.ad_soyad||"", musteri_tel:onGelMusteri.telefon||"", teslimat_adresi:onGelMusteri.adres||""};
      setForm(yeniForm); setAcik(true);
      if(onGelMusteriTemizle) onGelMusteriTemizle();
    }
  },[onGelMusteri]);

  const yukle=()=>supabase.from("cicek_siparisler").select("*").order("olusturma_tarihi",{ascending:false}).limit(80).then(({data})=>setSiparisler(data||[]));

  const taslakYukle = async () => {
    const t = await taslakOku("siparis_formu", k?.id);
    if (t) { setForm(t.veri.form || BOSLUK); setKalemler(t.veri.kalemler || []); setAcik(true); }
  };

  const kaydet=async()=>{
    if(!form.musteri_adi)return toast("Müşteri adı gerekli!","uyari");
    const toplam=kalemler.reduce((t,k)=>t+k.toplam,0);
    const{data:s}=await supabase.from("cicek_siparisler").insert({
      ...form, kalemler:JSON.stringify(kalemler), toplam_tutar:toplam, odeme_turu:form.odeme_turu||"nakit", kullanici_id:k?.id
    }).select().single();

    if(form.teslimat_tarihi){
      const h=new Date(form.teslimat_tarihi);h.setDate(h.getDate()-3);
      await supabase.from("hatirlaticilar").insert({
        baslik:`🚨 TESLİMAT — ${form.musteri_adi}`,
        aciklama:`${form.musteri_adi}${form.musteri_tel?" ("+form.musteri_tel+")":""} siparişi ${form.teslimat_tarihi} tarihinde teslim.${form.teslimat_saati?" Saat:"+form.teslimat_saati:""}${form.teslimat_adresi?" Adres:"+form.teslimat_adresi:""}`,
        etkinlik_tarihi:form.teslimat_tarihi, hatirlat_gun_once:3, isletme:"cicekci", durum:"aktif",
      });
    }
    if(form.hatirlatma_olustur&&form.ozel_gun_turu&&form.ozel_gun_tarihi){
      const gelecek=(new Date().getFullYear()+1)+"-"+form.ozel_gun_tarihi.slice(5);
      await supabase.from("hatirlaticilar").insert({
        baslik:`🌹 ${form.musteri_adi} — ${form.ozel_gun_turu}`,
        aciklama:`Geçen yıl ${form.ozel_gun_turu} için sipariş vermişti.`,
        etkinlik_tarihi:gelecek, hatirlat_gun_once:7, isletme:"cicekci", durum:"aktif",
      });
    }

    // ✅ Taslağı sil — sipariş kaydedildi
    if (k?.id) await taslakSil("siparis_formu", k.id);
    setTaslakBilgi(null);
    setAcik(false); setForm(BOSLUK); setKalemler([]); setOk(true);
    setTimeout(()=>setOk(false),4000); yukle();
  };

  const durumGuncelle=async(id,yeniDurum)=>{
    const siparis=siparisler.find(s=>s.id===id);
    await supabase.from("cicek_siparisler").update({durum:yeniDurum}).eq("id",id);

    if(yeniDurum==="teslim_edildi"&&siparis){
      try{
        // Daha önce bu sipariş için satış kaydı var mı?
        let mevcutSatis=null;
        if(siparis.toplam_tutar>0){
          // siparis_id kolonu yoksa try-catch ile geç
          try{
            const{data:mv}=await supabase.from("cicek_satislar")
              .select("id").eq("siparis_id",id).maybeSingle();
            mevcutSatis=mv;
          }catch{}
        }

        if(!mevcutSatis&&siparis.toplam_tutar>0){
          // Satış kaydı oluştur
          const satisInsert={
            musteri_id:siparis.musteri_id||null,
            musteri_ad_soyad:siparis.musteri_adi||null,
            odeme_turu:siparis.odeme_turu||"nakit",
            toplam_tutar:siparis.toplam_tutar||0,
            kdv_tutari:0, nakit_fis:false,
            notlar:`🚚 Sipariş teslim — ${siparis.musteri_adi}`,
            kullanici_id:k?.id,
          };
          // siparis_id kolonu varsa ekle
          try{ satisInsert.siparis_id=id; }catch{}

          const{data:yeniSatis,error:satisErr}=await supabase
            .from("cicek_satislar").insert(satisInsert).select().single();

          if(!satisErr&&yeniSatis&&siparis.kalemler){
            try{
              const kl=JSON.parse(siparis.kalemler||"[]");
              if(kl.length>0){
                await supabase.from("cicek_satis_kalemleri").insert(
                  kl.map(x=>({
                    satis_id:yeniSatis.id,
                    urun_id:x.urun_id||null,
                    urun_adi:x.urun_adi||"Sipariş kalemi",
                    miktar:+x.miktar||1,
                    birim:x.birim||"adet",
                    birim_fiyat:+x.birim_fiyat||0,
                    toplam:+x.toplam||0,
                    kdv_orani:8,
                  }))
                );
              }
            }catch{}
          }
          if(!satisErr) console.log("✅ Sipariş satışa yansıtıldı:", yeniSatis?.id);
        }
      }catch(e){ console.error("Satış yansıtma hatası:", e); }
    }
    yukle();
  };

  const waBildir=(s)=>{
    const tel=s.musteri_tel?.replace(/\D/g,"").replace(/^0/,"");
    if(!tel){toast("Müşteri telefonu yok!","uyari");return;}
    const durum=s.durum==="hazir"?"✅ Siparişiniz HAZIR! Teslim için bekliyoruz.":s.durum==="hazirlaniyor"?"🔧 Hazırlanıyor, yakında hazır.":"🌹 Siparişiniz alındı.";
    const mesaj=`Merhaba ${s.musteri_adi}! 🌹\n\n${durum}${s.teslimat_tarihi?`\n📅 Teslimat: ${new Date(s.teslimat_tarihi).toLocaleDateString("tr-TR")}${s.teslimat_saati?" — "+s.teslimat_saati:""}`:""}${s.teslimat_adresi?`\n📍 ${s.teslimat_adresi}`:""}\n\nTeşekkürler 🌸`;
    window.open(`whatsapp://send?phone=90${tel}&text=${encodeURIComponent(mesaj)}`,"_blank");
  };

  const waTeslim=(s)=>{
    const tel=s.musteri_tel?.replace(/\D/g,"").replace(/^0/,"");
    if(!tel){toast("Müşteri telefonu yok!","uyari");return;}
    const mesaj=`Merhaba ${s.musteri_adi}! 🌹\n\n📦 Siparişiniz teslim edildi!\n\nBizi tercih ettiğiniz için teşekkür ederiz! 💝\nYorumunuz bizim için çok değerli.`;
    window.open(`whatsapp://send?phone=90${tel}&text=${encodeURIComponent(mesaj)}`,"_blank");
  };

  const kuryeWA=(s, kurye)=>{
    const tel=kurye?.replace(/\D/g,"").replace(/^0/,"");
    if(!tel){toast("Kurye telefonu girin!","uyari");return;}
    const kalemStr=s.kalemler?JSON.parse(s.kalemler||"[]").map(x=>`• ${x.urun_adi} x${x.miktar}`).join("\n"):"";
    const mesaj=`🚚 *Teslimat Görevi*\n\n👤 Müşteri: ${s.musteri_adi}\n📞 Tel: ${s.musteri_tel||"-"}\n📍 Adres: ${s.teslimat_adresi||"-"}\n⏰ Saat: ${s.teslimat_saati||"Belirtilmedi"}\n\n${kalemStr?`📦 Ürünler:\n${kalemStr}\n\n`:""}💰 Tutar: ${new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(s.toplam_tutar||0)} ₺\nÖdeme: ${s.odeme_turu||"Nakit"}\n\n🗺️ Harita: https://maps.google.com/?q=${encodeURIComponent(s.teslimat_adresi||"")}`;
    window.open(`whatsapp://send?phone=90${tel}&text=${encodeURIComponent(mesaj)}`,"_blank");
  };

  // Kurye paneli için bugünkü siparişleri sırala (dükkan: İstanbul merkez)
  const dukkanKonum = {lat:41.0082, lng:28.9784}; // Değiştirilebilir
  const bugunStr = bugun();
  // Kurye paneli: teslim edilmemiş + iptal olmayan TÜM siparişleri göster
  // (hem bugün hem gelecek tarihli, teslimat tarihsizler de dahil)
  const kurye_siparisler = siparisler
    .filter(s=>s.durum!=="teslim_edildi"&&s.durum!=="iptal")
    .sort((a,b)=>{
      // Önce tarihe, sonra saate göre sırala
      const tarA = a.teslimat_tarihi||"9999";
      const tarB = b.teslimat_tarihi||"9999";
      if(tarA!==tarB) return tarA.localeCompare(tarB);
      const saatA = a.teslimat_saati||"23:59";
      const saatB = b.teslimat_saati||"23:59";
      return saatA.localeCompare(saatB);
    });

  const now=new Date();
  const [kuryeTel, setKuryeTel]=useState("");
  const [duzenleId, setDuzenleId]=useState(null);

  const toplam=kalemler.reduce((t,k)=>t+k.toplam,0);

  return(<div>
    {/* Başlık + Sekmeler */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <h2 style={bstl}>📋 Sipariş Takibi</h2>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        {/* Taslak bildirimi */}
        {taslakBilgi&&!acik&&<div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:"6px 12px",fontSize:12,color:"#c2410c",display:"flex",gap:8,alignItems:"center"}}>
          <span>📝 {taslakBilgi.cihaz==="telefon"?"📱":"💻"} {taslakBilgi.cihaz}'dan taslak var</span>
          <button onClick={taslakYukle} style={{...kbtn,fontSize:11,padding:"3px 8px",color:"#c2410c",borderColor:"#fed7aa",background:"#fff7ed"}}>Yükle</button>
          <button onClick={()=>{taslakSil("siparis_formu",k?.id);setTaslakBilgi(null);}} style={{fontSize:11,padding:"3px 6px",border:"none",background:"none",color:"#999",cursor:"pointer"}}>✕</button>
        </div>}
        <div style={{display:"flex",background:"#f5f6fa",borderRadius:10,padding:3,border:"1px solid #e8ebf5"}}>
          {[{k:"liste",l:"📋 Siparişler"},{k:"kurye",l:"🚚 Kurye Paneli"}].map(s=>(
            <button key={s.k} onClick={()=>setAktifSekme(s.k)} style={{padding:"7px 14px",borderRadius:8,border:"none",fontSize:13,fontWeight:aktifSekme===s.k?700:400,background:aktifSekme===s.k?"#fff":"transparent",color:aktifSekme===s.k?"#e94560":"#666",cursor:"pointer",boxShadow:aktifSekme===s.k?"0 1px 4px rgba(0,0,0,0.1)":"none",transition:"all 0.15s"}}>{s.l}</button>
          ))}
        </div>
        <button onClick={()=>{setAcik(!acik);if(!acik&&taslakBilgi)taslakYukle();}} style={abtn}>+ Yeni Sipariş</button>
      </div>
    </div>

    {ok&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"10px 16px",color:"#15803d",marginBottom:14,fontSize:13,fontWeight:600}}>✅ Sipariş kaydedildi! Satış listesine de yansıyacak.</div>}

    {/* ═══ YENİ SİPARİŞ FORMU ═══ */}
    {acik&&<div style={{...fkrt,marginBottom:20,position:"relative"}}>
      {/* Taslak durum göstergesi */}
      {taslakBilgi&&<div style={{position:"absolute",top:14,right:16,background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#92400e"}}>
        💾 Otomatik kaydediliyor...
      </div>}
      <h3 style={{color:"#1a1a2e",marginTop:0,fontSize:15,marginBottom:14}}>📝 Yeni Sipariş</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:12}}>
        <div><label style={lbl}>Müşteri Adı *</label><input value={form.musteri_adi} onChange={e=>{const f={...form,musteri_adi:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}/></div>
        <div><label style={lbl}>Telefon</label><input value={form.musteri_tel} onChange={e=>{const f={...form,musteri_tel:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}/></div>
        <div><label style={lbl}>Teslimat Tarihi</label><input type="date" value={form.teslimat_tarihi} onChange={e=>{const f={...form,teslimat_tarihi:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}/></div>
        <div><label style={lbl}>Teslimat Saati</label><input type="time" value={form.teslimat_saati} onChange={e=>{const f={...form,teslimat_saati:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}/></div>
        <div style={{gridColumn:"span 2"}}><label style={lbl}>Teslimat Adresi</label><input value={form.teslimat_adresi} onChange={e=>{const f={...form,teslimat_adresi:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp} placeholder="Mahalle, Sokak, No..."/></div>
        <div><label style={lbl}>Ödeme Türü</label><select value={form.odeme_turu||"nakit"} onChange={e=>{const f={...form,odeme_turu:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}><option value="nakit">💵 Nakit</option><option value="kredi_karti">💳 Kart</option><option value="havale">🏦 Havale</option><option value="teslimde">🚚 Teslimde Al</option></select></div>
        <div><label style={lbl}>Özel Gün</label><select value={form.ozel_gun_turu} onChange={e=>{const f={...form,ozel_gun_turu:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}><option value="">Seç (opsiyonel)</option>{OZEL_GUNLER.map(g=><option key={g}>{g}</option>)}</select></div>
        {form.ozel_gun_turu&&<div><label style={lbl}>Özel Gün Tarihi</label><input type="date" value={form.ozel_gun_tarihi} onChange={e=>{const f={...form,ozel_gun_tarihi:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={inp}/></div>}
      </div>
      <div style={{marginBottom:12}}><label style={lbl}>Not / İçerik</label><textarea value={form.notlar} onChange={e=>{const f={...form,notlar:e.target.value};setForm(f);formDegisti(f,kalemler);}} style={{...inp,minHeight:60,resize:"vertical"}} placeholder="Renk tercihi, özel yazı, vs..."/></div>

      {/* Ürün Kalemleri */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <label style={{...lbl,margin:0}}>Sipariş Kalemleri</label>
          <button onClick={()=>{const kl=[...kalemler,{urun_id:"",urun_adi:"",miktar:1,birim:"adet",birim_fiyat:0,toplam:0}];setKalemler(kl);formDegisti(form,kl);}} style={{...kbtn,fontSize:12}}>+ Kalem Ekle</button>
        </div>
        {kalemler.map((kl,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 32px",gap:8,marginBottom:8,alignItems:"center"}}>
            <select value={kl.urun_id} onChange={e=>{
              const u=urunler.find(x=>x.id===e.target.value);
              const kl2=[...kalemler]; kl2[i]={...kl2[i],urun_id:e.target.value,urun_adi:u?.urun_adi||"",birim_fiyat:u?.satis_fiyati||0,birim:u?.birim||"adet",toplam:(u?.satis_fiyati||0)*kl2[i].miktar};
              setKalemler(kl2);formDegisti(form,kl2);
            }} style={inp}><option value="">Ürün seç...</option>{urunler.map(u=><option key={u.id} value={u.id}>{u.urun_adi}</option>)}</select>
            <input type="number" value={kl.miktar} min="1" onChange={e=>{const kl2=[...kalemler];kl2[i]={...kl2[i],miktar:+e.target.value,toplam:+e.target.value*kl2[i].birim_fiyat};setKalemler(kl2);formDegisti(form,kl2);}} style={{...inp,textAlign:"center"}} placeholder="Miktar"/>
            <input type="number" value={kl.birim_fiyat} onChange={e=>{const kl2=[...kalemler];kl2[i]={...kl2[i],birim_fiyat:+e.target.value,toplam:kl2[i].miktar*+e.target.value};setKalemler(kl2);formDegisti(form,kl2);}} style={inp} placeholder="Fiyat ₺"/>
            <div style={{color:"#e94560",fontWeight:700,fontSize:13}}>{new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(kl.toplam||0)} ₺</div>
            <button onClick={()=>{const kl2=kalemler.filter((_,j)=>j!==i);setKalemler(kl2);formDegisti(form,kl2);}} style={{...mbtn,color:"#ef4444",padding:"5px 8px"}}>✕</button>
          </div>
        ))}
        {kalemler.length>0&&<div style={{textAlign:"right",color:"#e94560",fontWeight:700,fontSize:14}}>TOPLAM: {new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(toplam)} ₺</div>}
      </div>

      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#444",marginBottom:14,cursor:"pointer"}}>
        <input type="checkbox" checked={form.hatirlatma_olustur} onChange={e=>{const f={...form,hatirlatma_olustur:e.target.checked};setForm(f);formDegisti(f,kalemler);}}/>
        📅 Bu siparişi gelecek yıl için hatırlat
      </label>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={kaydet} style={abtn}>💾 Kaydet</button>
        <button onClick={()=>{setAcik(false);}} style={kbtn}>İptal</button>
        {(form.musteri_adi||kalemler.length>0)&&k?.id&&<button onClick={async()=>{
          await taslakKaydet("siparis_formu",{form,kalemler},k.id);
          setTaslakBilgi({cihaz:navigator.userAgent.includes('Mobile')?'telefon':'bilgisayar',tarih:new Date().toISOString()});
          toast("Taslak kaydedildi! Diğer cihazdan devam edebilirsiniz.","basari");
        }} style={{...kbtn,color:"#d97706",borderColor:"#fcd34d",background:"#fffbeb"}}>
          💾 Taslak Kaydet
        </button>}
      </div>
    </div>}

    {/* ═══ KURYE PANELİ ═══ */}
    {aktifSekme==="kurye"&&<div>
      <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
        <div style={{fontWeight:700,color:"#c2410c",marginBottom:8,fontSize:14}}>🚚 Kurye Yönetim Paneli</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={kuryeTel} onChange={e=>setKuryeTel(e.target.value)} placeholder="Kurye telefonu (0532...)" style={{...inp,width:"auto",flex:1,maxWidth:220}}/>
          <span style={{color:"#92400e",fontSize:12}}>Tüm siparişleri WA'dan gönder:</span>
          <button onClick={()=>{
            kurye_siparisler.forEach((s,i)=>setTimeout(()=>kuryeWA(s,kuryeTel),i*300));
          }} style={{...abtn,background:"linear-gradient(135deg,#25D366,#128C7E)",fontSize:13}}>
            📱 Tümünü WA Gönder ({kurye_siparisler.length})
          </button>
        </div>
      </div>

      {/* Özet kartlar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {l:"Bugün Teslimat",v:kurye_siparisler.length,c:"#c2410c"},
          {l:"Hazır Bekliyor",v:siparisler.filter(s=>s.durum==="hazir").length,c:"#10b981"},
          {l:"Hazırlanıyor",v:siparisler.filter(s=>s.durum==="hazirlaniyor").length,c:"#3b82f6"},
          {l:"Teslim Edildi",v:siparisler.filter(s=>s.durum==="teslim_edildi").length,c:"#8b5cf6"},
        ].map(s=>(
          <div key={s.l} style={krt}>
            <div style={{color:"#888",fontSize:11}}>{s.l}</div>
            <div style={{color:s.c,fontWeight:700,fontSize:20,marginTop:4}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Sipariş listesi — saat sırasına göre, uyarılı */}
      {kurye_siparisler.length===0&&<div style={{textAlign:"center",padding:40,color:"#999",fontSize:14}}>📦 Bugün için bekleyen teslimat yok.</div>}
      {kurye_siparisler.map((s,i)=>{
        const saatFark=s.teslimat_saati?(()=>{const[h,m]=s.teslimat_saati.split(":").map(Number);const hedef=new Date();hedef.setHours(h,m,0);return(hedef-now)/60000;})():null;
        const acilMi=saatFark!==null&&saatFark<60&&saatFark>0;
        const gecti=saatFark!==null&&saatFark<0;

        return(<div key={s.id} style={{...krt,marginBottom:12,border:acilMi?"2px solid #f59e0b":gecti?"2px solid #ef4444":"1px solid #e8ebf5"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,color:"#1a1a2e"}}>#{i+1} {s.musteri_adi}</span>
                {acilMi&&<span style={{background:"#fef3c7",color:"#92400e",fontSize:11,padding:"2px 8px",borderRadius:8,fontWeight:600}}>⚡ {Math.round(saatFark)} dk kaldı</span>}
                {gecti&&<span style={{background:"#fef2f2",color:"#b91c1c",fontSize:11,padding:"2px 8px",borderRadius:8,fontWeight:600}}>⏰ Geçti!</span>}
              </div>
              {s.musteri_tel&&<div style={{fontSize:13,color:"#555"}}>📞 <a href={`tel:${s.musteri_tel}`} style={{color:"#1677ff"}}>{s.musteri_tel}</a></div>}
              {s.teslimat_adresi&&<div style={{fontSize:13,color:"#555",marginTop:2}}>📍 {s.teslimat_adresi}</div>}
              {s.teslimat_saati&&<div style={{fontSize:13,color:"#555",marginTop:2}}>⏰ {s.teslimat_saati}</div>}
              {s.notlar&&<div style={{fontSize:12,color:"#888",marginTop:4,fontStyle:"italic"}}>"{s.notlar}"</div>}
              {s.toplam_tutar>0&&<div style={{fontSize:13,color:"#e94560",fontWeight:700,marginTop:4}}>{new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(s.toplam_tutar)} ₺ — {s.odeme_turu==="teslimde"?"🚚 Teslimde tahsil et":s.odeme_turu==="nakit"?"Nakit":"Ödendi"}</div>}
            </div>
            <span style={{padding:"4px 10px",borderRadius:10,fontSize:12,fontWeight:600,background:`rgba(${hexRgb((DURUMLAR[s.durum]||{c:"#888"}).c)},0.12)`,color:(DURUMLAR[s.durum]||{c:"#888"}).c}}>{(DURUMLAR[s.durum]||{l:s.durum}).l}</span>
          </div>

          {/* Kurye aksiyonları */}
          <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
            {s.teslimat_adresi&&<a href={`https://maps.google.com/?q=${encodeURIComponent(s.teslimat_adresi)}`} target="_blank" rel="noopener noreferrer" style={{...kbtn,textDecoration:"none",fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}>🗺️ Haritada Aç</a>}
            {s.musteri_tel&&<button onClick={()=>kuryeWA(s,kuryeTel)} style={{...kbtn,fontSize:12,color:"#15803d",borderColor:"#86efac"}}>📱 Kurye Formu WA</button>}
            {s.musteri_tel&&<button onClick={()=>waBildir(s)} style={{...kbtn,fontSize:12,color:"#25D366",borderColor:"#86efac"}}>💬 Müşteriye Bildir</button>}
            <button onClick={()=>durumGuncelle(s.id,"teslim_edildi")} style={{...abtn,fontSize:12,padding:"7px 14px"}}>✅ Teslim Edildi</button>
          </div>
        </div>);
      })}
    </div>}

    {/* ═══ SİPARİŞ LİSTESİ ═══ */}
    {aktifSekme==="liste"&&<div>
      {/* Özet */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:16}}>
        {Object.entries(DURUMLAR).map(([d,{l,c}])=>(
          <div key={d} style={krt}>
            <div style={{color:"#888",fontSize:11}}>{l}</div>
            <div style={{color:c,fontWeight:700,fontSize:20,marginTop:4}}>{siparisler.filter(s=>s.durum===d).length}</div>
          </div>
        ))}
      </div>

      {siparisler.map((s)=>{
        const kalemlArr=s.kalemler?JSON.parse(s.kalemler||"[]").filter(Boolean):[];
        const saatFark=s.teslimat_saati&&s.teslimat_tarihi===bugunStr?(()=>{const[h,m]=s.teslimat_saati.split(":").map(Number);const hedef=new Date();hedef.setHours(h,m,0);return(hedef-now)/60000;})():null;
        const acilMi=saatFark!==null&&saatFark<90&&saatFark>0;

        return(<div key={s.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:12,border:acilMi?"2px solid #f59e0b":"1px solid #e8ebf5",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:8}}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:"#1a1a2e",fontSize:15}}>👤 {s.musteri_adi}</span>
                {s.musteri_tel&&<span style={{color:"#1677ff",fontSize:13}}>📞 {s.musteri_tel}</span>}
                {acilMi&&<span style={{background:"#fef3c7",color:"#92400e",fontSize:11,padding:"2px 8px",borderRadius:8,fontWeight:600}}>⚡ {Math.round(saatFark)} dk</span>}
              </div>
              {s.teslimat_adresi&&<div style={{color:"#555",fontSize:13,marginTop:3}}>📍 {s.teslimat_adresi}</div>}
              {(s.teslimat_tarihi||s.teslimat_saati)&&<div style={{color:"#555",fontSize:13,marginTop:2}}>🗓 {s.teslimat_tarihi&&new Date(s.teslimat_tarihi).toLocaleDateString("tr-TR")} {s.teslimat_saati&&"— "+s.teslimat_saati}</div>}
              {s.notlar&&<div style={{color:"#888",fontSize:12,marginTop:3,fontStyle:"italic"}}>"{s.notlar}"</div>}
              {kalemlArr.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                {kalemlArr.map((kl,i)=><span key={i} style={{fontSize:12,background:"#f0f9ff",color:"#0369a1",padding:"2px 8px",borderRadius:8,border:"1px solid #bae6fd"}}>{kl.urun_adi} ×{kl.miktar}</span>)}
              </div>}
              {s.toplam_tutar>0&&<div style={{color:"#e94560",fontWeight:700,fontSize:13,marginTop:4}}>{new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2}).format(s.toplam_tutar)} ₺</div>}
            </div>
            <span style={{padding:"4px 12px",borderRadius:10,fontSize:12,fontWeight:600,background:`rgba(${hexRgb((DURUMLAR[s.durum]||{c:"#888"}).c)},0.12)`,color:(DURUMLAR[s.durum]||{c:"#888"}).c,border:`1px solid rgba(${hexRgb((DURUMLAR[s.durum]||{c:"#888"}).c)},0.25)`}}>{(DURUMLAR[s.durum]||{l:s.durum}).l}</span>
          </div>

          {/* Durum değiştir + WA */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
            {Object.entries(DURUMLAR).filter(([d])=>d!==s.durum).map(([d,{l,c}])=>(
              <button key={d} onClick={()=>durumGuncelle(s.id,d)} style={{...kbtn,fontSize:11,padding:"5px 10px",color:c,borderColor:`rgba(${hexRgb(c)},0.35)`}}>{l}</button>
            ))}
            {s.musteri_tel&&<button onClick={()=>waBildir(s)} style={{...kbtn,fontSize:11,padding:"5px 10px",color:"#25D366",borderColor:"#86efac"}}>💬 WA Bildir</button>}
            {s.musteri_tel&&s.durum==="teslim_edildi"&&<button onClick={()=>waTeslim(s)} style={{...kbtn,fontSize:11,padding:"5px 10px",color:"#8b5cf6",borderColor:"#c4b5fd"}}>🌸 WA Teşekkür</button>}
            {s.teslimat_adresi&&<a href={`https://maps.google.com/?q=${encodeURIComponent(s.teslimat_adresi)}`} target="_blank" rel="noopener noreferrer" style={{...kbtn,textDecoration:"none",fontSize:11,padding:"5px 10px",display:"inline-flex",alignItems:"center"}}>🗺️ Harita</a>}
          </div>
        </div>);
      })}
      {!siparisler.length&&<div style={{textAlign:"center",padding:40,color:"#bbb",fontSize:14}}>Henüz sipariş yok. Üstten ekleyebilirsiniz.</div>}
    </div>}
  </div>);
}




// KASA RAPORU
function CKasaRaporu(){
  const [tarihSec,setTarihSec]=useState(bugun());const [rapor,setRapor]=useState(null);const [aylik,setAylik]=useState(false);

  useEffect(()=>{yukleRapor();},[tarihSec,aylik]);

  const yukleRapor=async()=>{
    const bas=aylik?tarihSec.slice(0,7)+"-01":tarihSec;
    const bit=aylik?tarihSec.slice(0,7)+"-31":tarihSec;
    const [satislar,giderler,cari]=await Promise.all([
      supabase.from("cicek_satislar").select("*").gte("satis_tarihi",bas+"T00:00:00").lte("satis_tarihi",bit+"T23:59:59"),
      supabase.from("giderler").select("*").eq("isletme","cicekci").gte("harcama_tarihi",bas).lte("harcama_tarihi",bit),
      supabase.from("cicek_cari").select("odenen").gte("guncelleme_tarihi",bas+"T00:00:00").lte("guncelleme_tarihi",bit+"T23:59:59"),
    ]);
    const s=satislar.data||[];const g=giderler.data||[];
    const nakit=s.filter(x=>x.odeme_turu==="nakit").reduce((t,x)=>t+x.toplam_tutar,0);
    const kart=s.filter(x=>x.odeme_turu==="kredi_karti").reduce((t,x)=>t+x.toplam_tutar,0);
    const havale=s.filter(x=>x.odeme_turu==="havale").reduce((t,x)=>t+x.toplam_tutar,0);
    const veresiye=s.filter(x=>x.odeme_turu==="veresiye").reduce((t,x)=>t+x.toplam_tutar,0);
    const toplamGiren=s.reduce((t,x)=>t+x.toplam_tutar,0);
    const toplamGider=g.filter(x=>x.islem_turu!=="transfer").reduce((t,x)=>t+x.tutar,0);
    setRapor({nakit,kart,havale,veresiye,toplamGiren,toplamGider,netKar:toplamGiren-toplamGider,satisSayisi:s.length,giderSayisi:g.length,satislar:s,giderler:g});
  };

  return(<div>
    <h2 style={bstl}>💰 Kasa Raporu</h2>
    <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
      {aylik?
        <input type="month" value={tarihSec.slice(0,7)} onChange={e=>setTarihSec(e.target.value+"-01")} style={{...inp,width:"auto"}}/>:
        <input type="date" value={tarihSec} onChange={e=>setTarihSec(e.target.value)} style={{...inp,width:"auto"}}/>
      }
      <button onClick={()=>setAylik(!aylik)} style={{...kbtn,background:aylik?"rgba(233,69,96,0.08)":"transparent",color:aylik?"#e94560":"#666",borderColor:aylik?"rgba(233,69,96,0.4)":"rgba(255,255,255,0.15)"}}>
        {aylik?"📅 Aylık":"📅 Günlük"}
      </button>
    </div>
    {rapor&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {[
          {l:"💵 Nakit Giriş",v:para(rapor.nakit),c:"#00c864"},
          {l:"💳 Kart",v:para(rapor.kart),c:"#4ea8de"},
          {l:"🏦 Havale",v:para(rapor.havale),c:"#ffa500"},
          {l:"📋 Veresiye",v:para(rapor.veresiye),c:"#ff6b6b"},
          {l:"📊 Toplam Giren",v:para(rapor.toplamGiren),c:"#e94560",bold:true},
          {l:"💸 Toplam Gider",v:para(rapor.toplamGider),c:"#ff6b6b"},
          {l:"🏆 Net Kâr",v:para(rapor.netKar),c:rapor.netKar>=0?"#00c864":"#ff6b6b",bold:true},
          {l:"🛒 Satış Adedi",v:rapor.satisSayisi,c:"rgba(255,255,255,0.7)"},
        ].map(s=>(<div key={s.l} style={{...krt,textAlign:"center"}}>
          <div style={{color:"#999",fontSize:11}}>{s.l}</div>
          <div style={{color:s.c,fontWeight:s.bold?800:700,fontSize:s.bold?18:14,marginTop:4}}>{s.v}</div>
        </div>))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <h4 style={{color:"#888",fontSize:13,marginBottom:10}}>Satışlar ({rapor.satislar.length})</h4>
          {rapor.satislar.slice(0,10).map(s=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"#f8f9fc",borderRadius:7,marginBottom:4,fontSize:12}}>
            <span style={{color:"#555"}}>#{s.satis_no} {s.musteri_ad_soyad||""}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge tip={s.odeme_turu}/><span style={{color:"#00c864",fontWeight:600}}>+{para(s.toplam_tutar)}</span></div>
          </div>))}
        </div>
        <div>
          <h4 style={{color:"#888",fontSize:13,marginBottom:10}}>Giderler ({rapor.giderler.length})</h4>
          {rapor.giderler.slice(0,10).map(g=>(<div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"#f8f9fc",borderRadius:7,marginBottom:4,fontSize:12}}>
            <span style={{color:"#555"}}>{g.aciklama||g.firma_adi||"-"}</span>
            <span style={{color:"#ff6b6b",fontWeight:600}}>-{para(g.tutar)}</span>
          </div>))}
        </div>
      </div>
    </>}
  </div>);
}

// ÇİÇEKÇİ MODÜL
function Cicekci({kullanici,onGeri,onCikis}){
  const [a,setA]=useState("anasayfa");
  const [siparisMusteri,setSiparisMusteri]=useState(null);

  const siparisAc=(musteri)=>{
    setSiparisMusteri(musteri);
    setA("siparisler");
  };

  const m=[
    {k:"anasayfa",i:"🏠",l:"Ana Sayfa"},
    {k:"satis",i:"🛒",l:"Satış Yap"},
    {k:"satislar",i:"📋",l:"Satış Listesi"},
    {k:"siparisler",i:"📦",l:"Siparişler"},
    {k:"musteriler",i:"👥",l:"Müşteriler"},
    {k:"stok",i:"🌿",l:"Stok"},
    {k:"fatura",i:"📄",l:"Fatura Girişi"},
    {k:"kasa",i:"💰",l:"Kasa Raporu"},
    {k:"cari",i:"👤",l:"Cari/Veresiye"},
    {k:"kdv",i:"🧾",l:"KDV & Rapor"},
    {k:"asistan",i:"🤖",l:"AI Asistan"},
    {k:"hatirlatici",i:"⏰",l:"Hatırlatıcılar"},
    {k:"gider",i:"💸",l:"Giderler"},
  ];
  return(<Layout baslik="Çiçekçi" emoji="🌹" menu={m} aktif={a} setAktif={(k)=>{setA(k);if(k!=="siparisler")setSiparisMusteri(null);}} onGeri={onGeri} onCikis={onCikis} kullanici={kullanici}>
    {a==="anasayfa"&&<CAnaSayfa/>}
    {a==="satis"&&<CSatis k={kullanici}/>}
    {a==="satislar"&&<CSatisListesi/>}
    {a==="siparisler"&&<CSiparisler k={kullanici} onGelMusteri={siparisMusteri} onGelMusteriTemizle={()=>setSiparisMusteri(null)}/>}
    {a==="musteriler"&&<CMusteriler onSiparisAc={siparisAc}/>}
    {a==="stok"&&<CStok/>}
    {a==="fatura"&&<CFatura k={kullanici}/>}
    {a==="kasa"&&<CKasaRaporu/>}
    {a==="cari"&&<CCari/>}
    {a==="kdv"&&<KDV isletme="cicekci"/>}
    {a==="asistan"&&<CAsistan/>}
    {a==="hatirlatici"&&<Hatirlaticilar k={kullanici}/>}
    {a==="gider"&&<Gider k={kullanici} isletme="cicekci"/>}
    {/* 🤖 AI Floating Buton — Her sayfada */}
    <AIFloatButon sayfa={m.find(x=>x.k===a)?.l||a}/>
  </Layout>);
}

function Ayarlar({kullanici,onGeri,onCikis}){
  const [a,setA]=useState("hesaplar");
  const m=[
    {k:"hesaplar",    i:"🏦",l:"Hesap & Ödeme"},
    {k:"hatirlatici", i:"⏰",l:"Hatırlatıcılar"},
    {k:"kt_hizmetler",i:"🧺",l:"KT Hizmetleri"},
    {k:"kt_urunler",  i:"👔",l:"KT Ürün Türleri"},
    {k:"cicek_kat",   i:"🌸",l:"Çiçek Kategorileri"},
    {k:"panel_ai",    i:"🤖",l:"Panel Denetçi AI"},
  ];
  return(<Layout baslik="Ayarlar" emoji="⚙️" menu={m} aktif={a} setAktif={setA} onGeri={onGeri} onCikis={onCikis} kullanici={kullanici}>
    {a==="hesaplar"&&<HesapAyar/>}
    {a==="hatirlatici"&&<Hatirlaticilar k={kullanici}/>}
    {a==="kt_hizmetler"&&<ListeYonet tablo="kt_hizmetler" baslik="KT Hizmetleri" alanlar={[{k:"hizmet_adi",l:"Hizmet Adı"},{k:"varsayilan_fiyat",l:"Fiyat",tip:"number"}]}/>}
    {a==="kt_urunler"&&<ListeYonet tablo="kt_urun_turleri" baslik="KT Ürün Türleri" alanlar={[{k:"urun_adi",l:"Ürün Adı"}]}/>}
    {a==="cicek_kat"&&<ListeYonet tablo="cicek_kategoriler" baslik="Çiçek Kategorileri" alanlar={[{k:"kategori_adi",l:"Kategori Adı"}]}/>}
    {a==="panel_ai"&&<PanelDenetciAI kullanici={kullanici}/>}
  </Layout>);
}

function HesapAyar(){
  const [hesaplar,setHesaplar]=useState([]);
  const [form,setForm]=useState({hesap_adi:"",hesap_turu:"nakit",isletme:"ortak",banka_adi:"",iban:"",kart_son4:""});
  const [acik,setAcik]=useState(false);
  const [sekme,setSekme]=useState("kasalar"); // kasalar | kartlar | banka | hepsi

  const yukle=()=>supabase.from("hesap_adlari").select("*").eq("aktif",true).order("hesap_turu").then(({data})=>setHesaplar(data||[]));
  useEffect(()=>{yukle();}, []);

  const kaydet=async()=>{
    if(!form.hesap_adi)return toast("Hesap adı girin!","uyari");
    await supabase.from("hesap_adlari").insert({
      hesap_adi:form.hesap_adi, hesap_turu:form.hesap_turu, isletme:form.isletme,
      aktif:true,
    });
    setAcik(false);setForm({hesap_adi:"",hesap_turu:"nakit",isletme:"ortak",banka_adi:"",iban:"",kart_son4:""});yukle();
  };
  const sil=async(id)=>{if(!confirm("Silmek istediğinizden emin misiniz?"))return;await supabase.from("hesap_adlari").update({aktif:false}).eq("id",id);yukle();};

  const tur_icon={nakit:"💵",havale:"🏦",kredi_karti:"💳",pos:"🖥️"};

  const filtreli=hesaplar.filter(h=>{
    if(sekme==="hepsi")return true;
    if(sekme==="kasalar")return h.hesap_turu==="nakit";
    if(sekme==="kartlar")return h.hesap_turu==="kredi_karti"||h.hesap_turu==="pos";
    if(sekme==="banka")return h.hesap_turu==="havale";
    return true;
  });

  const HESAP_TURLERI=[
    {v:"nakit",l:"💵 Nakit Kasa"},
    {v:"havale",l:"🏦 Banka / Havale"},
    {v:"kredi_karti",l:"💳 Kredi Kartı (Şirket)"},
    {v:"pos",l:"🖥️ POS Cihazı"},
  ];

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <h2 style={bstl}>🏦 Hesap & Ödeme Kanalları</h2>
      <button onClick={()=>setAcik(!acik)} style={abtn}>+ Hesap Ekle</button>
    </div>
    <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#0369a1"}}>
      💡 Burada tanımladığınız hesaplar, Gider ve Satış sayfalarındaki "Hesap" seçeneklerinde görünür. Nakit kasalar, POS cihazları, banka hesaplarınızı buradan yönetin.
    </div>

    {acik&&<div style={{...fkrt,marginBottom:16}}>
      <h3 style={{color:"#1a1a2e",marginTop:0,fontSize:14}}>Yeni Hesap/Ödeme Kanalı</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:14}}>
        <div><label style={lbl}>Hesap Adı *</label><input value={form.hesap_adi} onChange={e=>setForm({...form,hesap_adi:e.target.value})} style={inp} placeholder="Şirket Kasası, Garanti Kartı..."/></div>
        <div><label style={lbl}>Tür *</label>
          <select value={form.hesap_turu} onChange={e=>setForm({...form,hesap_turu:e.target.value})} style={inp}>
            {HESAP_TURLERI.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
          </select></div>
        <div><label style={lbl}>İşletme</label>
          <select value={form.isletme} onChange={e=>setForm({...form,isletme:e.target.value})} style={inp}>
            <option value="ortak">🏢 Ortak</option>
            <option value="cicekci">🌹 Çiçekçi</option>
            <option value="kuru_temizleme">👔 Kuru Temizleme</option>
          </select></div>
        {(form.hesap_turu==="havale")&&<div><label style={lbl}>Banka Adı</label><input value={form.banka_adi} onChange={e=>setForm({...form,banka_adi:e.target.value})} style={inp} placeholder="Garanti, Ziraat..."/></div>}
        {(form.hesap_turu==="kredi_karti"||form.hesap_turu==="pos")&&<div><label style={lbl}>Son 4 Hane</label><input value={form.kart_son4} onChange={e=>setForm({...form,kart_son4:e.target.value})} style={inp} placeholder="1234" maxLength={4}/></div>}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={kaydet} style={abtn}>💾 Kaydet</button>
        <button onClick={()=>setAcik(false)} style={kbtn}>İptal</button>
      </div>
    </div>}

    {/* Filtre sekmeleri */}
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {[{k:"hepsi",l:"Tümü"},{k:"kasalar",l:"💵 Nakit"},{k:"banka",l:"🏦 Banka"},{k:"kartlar",l:"💳 Kart/POS"}].map(s=>(
        <button key={s.k} onClick={()=>setSekme(s.k)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${sekme===s.k?"#e94560":"#dde1ec"}`,background:sekme===s.k?"#e94560":"#fff",color:sekme===s.k?"#fff":"#555",cursor:"pointer",fontSize:13}}>
          {s.l}
        </button>
      ))}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {filtreli.map(h=>(
        <div key={h.id} style={{...krt,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:20}}>{tur_icon[h.hesap_turu]||"💰"}</span>
              <span style={{fontWeight:700,color:"#1a1a2e",fontSize:14}}>{h.hesap_adi}</span>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#f0f9ff",color:"#0369a1"}}>{HESAP_TURLERI.find(t=>t.v===h.hesap_turu)?.l||h.hesap_turu}</span>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#f0fdf4",color:"#15803d"}}>{h.isletme==="cicekci"?"🌹 Çiçekçi":h.isletme==="kuru_temizleme"?"👔 KT":"🏢 Ortak"}</span>
            </div>
          </div>
          <button onClick={()=>sil(h.id)} style={{...kbtn,color:"#dc2626",borderColor:"#fca5a5",fontSize:12,padding:"5px 10px"}}>🗑</button>
        </div>
      ))}
      {!filtreli.length&&<p style={{color:"#aaa",fontSize:13,gridColumn:"span 2"}}>Bu türde hesap yok. Yukarıdan ekleyebilirsiniz.</p>}
    </div>
  </div>);
}

function ListeYonet({tablo,baslik,alanlar}){
  const [liste,setListe]=useState([]);const [form,setForm]=useState({});const [acik,setAcik]=useState(false);
  const yukle=()=>supabase.from(tablo).select("*").eq("aktif",true).then(({data})=>setListe(data||[]));
  useEffect(()=>{yukle();}, [tablo]);
  const kaydet=async()=>{await supabase.from(tablo).insert(form);setAcik(false);setForm({});yukle();};
  const sil=async(id)=>{await supabase.from(tablo).update({aktif:false}).eq("id",id);setListe(liste.filter(x=>x.id!==id));};
  return(<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h2 style={bstl}>{baslik}</h2><button onClick={()=>setAcik(!acik)} style={abtn}>+ Ekle</button></div>{acik&&<div style={{background:"#f8f9fc",borderRadius:14,padding:16,marginBottom:16,border:"1px solid #e8ebf5",display:"flex",gap:10,flexWrap:"wrap"}}>{alanlar.map(a=>(<div key={a.k}><label style={lbl}>{a.l}</label><input type={a.tip||"text"} value={form[a.k]||""} onChange={e=>setForm({...form,[a.k]:e.target.value})} style={{...inp,width:180}}/></div>))}<div style={{display:"flex",alignItems:"flex-end"}}><button onClick={kaydet} style={abtn}>Kaydet</button></div></div>}<div style={{display:"flex",flexDirection:"column",gap:8}}>{liste.map(x=>(<div key={x.id} style={{background:"#f8f9fc",border:"1px solid #e8ebf5",borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"#1a1a2e",fontSize:13}}>{alanlar.map(a=>x[a.k]).join(" - ")}</span><button onClick={()=>sil(x.id)} style={{...kbtn,color:"#ff6b6b",fontSize:11}}>Sil</button></div>))}</div></div>);
}

function KuruTemizleme({kullanici,onGeri,onCikis}){
  const [a,setA]=useState("anasayfa");
  const [fisTablari,setFisTablari]=useState([{id:1,baslik:"Fiş 1"}]);
  const [aktifFisTab,setAktifFisTab]=useState(1);
  const [fisSayac,setFisSayac]=useState(2);
  const yeniFisAc=()=>{const yeniId=fisSayac;setFisTablari(prev=>[...prev,{id:yeniId,baslik:`Fiş ${prev.length+1}`}]);setAktifFisTab(yeniId);setFisSayac(c=>c+1);setA("fis_ac");};
  const fisTabKapat=(tabId)=>{setFisTablari(prev=>{const kalan=prev.filter(t=>t.id!==tabId);if(kalan.length===0){setA("anasayfa");return [{id:1,baslik:"Fiş 1"}];}if(aktifFisTab===tabId)setAktifFisTab(kalan[kalan.length-1].id);return kalan;});};
  const m=[{k:"anasayfa",i:"🏠",l:"Ana Sayfa"},{k:"fis_ac",i:"📝",l:"Fiş Aç"},{k:"hazirla",i:"🏷️",l:"Hazırlama"},{k:"fisler",i:"📋",l:"Açık Fişler"},{k:"teslim",i:"📦",l:"Teslim Al/Ver"},{k:"musteriler",i:"👥",l:"Müşteriler"},{k:"whatsapp",i:"💬",l:"WhatsApp Merkezi"},{k:"hatirlatma",i:"🔔",l:"Hatırlatmalar"},{k:"kasa",i:"💰",l:"Kasa Raporu"},{k:"duzeltme",i:"✏️",l:"Fiş Düzeltme"},{k:"gider",i:"💸",l:"Giderler"},{k:"asistan",i:"🤖",l:"AI Asistan"},{k:"ayarlar",i:"⚙️",l:"Ayarlar"}];
  return(<Layout baslik="Kuru Temizleme" emoji="👔" menu={m} aktif={a} setAktif={setA} onGeri={onGeri} onCikis={onCikis} kullanici={kullanici}>
    <UzaktanYaziciDinleyici/>
    {a==="anasayfa"&&<KTAnaSayfa/>}
    {a==="fis_ac"&&(<div>{fisTablari.length>0&&(<div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>{fisTablari.map(t=>(<div key={t.id} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:20,border:`2px solid ${aktifFisTab===t.id?"#e94560":"#e5e7eb"}`,background:aktifFisTab===t.id?"#fef2f2":"#fff",cursor:"pointer"}} onClick={()=>setAktifFisTab(t.id)}><span style={{fontSize:12,fontWeight:600,color:aktifFisTab===t.id?"#e94560":"#555"}}>{t.baslik}</span>{fisTablari.length>1&&<span onClick={e=>{e.stopPropagation();fisTabKapat(t.id);}} style={{fontSize:10,color:"#999",marginLeft:2,cursor:"pointer",padding:"0 2px"}}>✕</span>}</div>))}{fisTablari.length<3&&(<button onClick={yeniFisAc} style={{padding:"6px 12px",borderRadius:20,border:"2px dashed #bfdbfe",background:"#eff6ff",color:"#2563eb",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Yeni Fiş Aç</button>)}</div>)}{fisTablari.map(t=>(<div key={t.id} style={{display:aktifFisTab===t.id?"block":"none"}}><KTFisAc kullanici={kullanici} onTamamla={()=>{fisTabKapat(t.id);setA("fisler");}} onYeniFis={fisTablari.length<3?yeniFisAc:null}/></div>))}</div>)}
    {a==="hazirla"&&<KTHazirlamaEkrani kullanici={kullanici}/>}
    {a==="fisler"&&<KTFisler kullanici={kullanici}/>}
    {a==="teslim"&&<KTTeslim kullanici={kullanici}/>}
    {a==="musteriler"&&<KTMusteriler/>}
    {a==="whatsapp"&&<WhatsAppMerkezi/>}
    {a==="hatirlatma"&&<KTHatirlatma/>}
    {a==="kasa"&&<KTKasaRaporu/>}
    {a==="duzeltme"&&<KTFisDuzenle/>}
    {a==="gider"&&<Gider k={kullanici} isletme="kuru_temizleme"/>}
    {a==="asistan"&&<KTAsistan/>}
    {a==="ayarlar"&&<KTAyarlar/>}
  </Layout>);
}

// ═══════════════════════════════════════════════════════════
// AI FLOATING BUTON — Her sayfada sağ altta
// ═══════════════════════════════════════════════════════════
function AIFloatButon({sayfa, ekstraVeri}){
  const [acik,setAcik]=useState(false);
  const [mesaj,setMesaj]=useState("");
  const [cevap,setCevap]=useState("");
  const [yukleniyor,setYukleniyor]=useState(false);
  const inputRef=useRef(null);

  const sor=async()=>{
    if(!mesaj.trim())return;
    setYukleniyor(true);setCevap("");
    try{
      const sistem=`Sen bir işletme yönetim asistanısın. Kullanıcı şu anda "${sayfa}" sayfasında.\n${ekstraVeri?`Mevcut veri: ${ekstraVeri}`:""}`;
      // /api/ocr endpoint'ini AI prompt için kullan (text mod)
      const resp=await fetch("/api/ocr",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({aiPrompt:mesaj, sistem, maxTokens:600})
      });
      const d=await resp.json();
      setCevap(d.cevap||d.text||d.content?.[0]?.text||"Yanıt alınamadı. Sistem yöneticisine başvurun.");
    }catch(e){setCevap("Hata: "+e.message);}
    setYukleniyor(false);
  };

  return(
    <>
      {/* Floating buton */}
      <button onClick={()=>{setAcik(!acik);if(!acik)setTimeout(()=>inputRef.current?.focus(),200);}}
        style={{position:"fixed",right:16,bottom:80,width:48,height:48,borderRadius:"50%",
          background:"linear-gradient(135deg,#667eea,#764ba2)",border:"none",cursor:"pointer",
          fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 16px rgba(102,126,234,0.5)",zIndex:500,transition:"transform 0.2s"}}
        title="AI Asistan"
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        🤖
      </button>

      {/* AI panel */}
      {acik&&<div style={{position:"fixed",right:16,bottom:136,width:"min(340px,calc(100vw - 32px))",
        background:"#fff",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
        border:"1px solid #e8ebf5",zIndex:499,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:14}}>🤖 AI Asistan — {sayfa}</span>
          <button onClick={()=>setAcik(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        {cevap&&<div style={{padding:"12px 16px",background:"#f8f9fc",maxHeight:200,overflow:"auto",fontSize:13,color:"#333",lineHeight:1.6,borderBottom:"1px solid #e8ebf5",whiteSpace:"pre-wrap"}}>{cevap}</div>}
        <div style={{padding:12,display:"flex",gap:8}}>
          <input ref={inputRef} value={mesaj} onChange={e=>setMesaj(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sor()}
            placeholder="Bu sayfa hakkında soru sor..."
            style={{...inp,flex:1,fontSize:13,padding:"8px 12px"}}/>
          <button onClick={sor} disabled={yukleniyor||!mesaj.trim()}
            style={{...abtn,padding:"8px 14px",fontSize:13,opacity:yukleniyor||!mesaj.trim()?0.6:1}}>
            {yukleniyor?"...":"→"}
          </button>
        </div>
        {/* Hızlı sorular */}
        <div style={{padding:"0 12px 12px",display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Bu sayfada ne yapabilirim?","Öneriler ver","Hataları kontrol et"].map(q=>(
            <button key={q} onClick={()=>{setMesaj(q);}} style={{fontSize:11,padding:"4px 8px",borderRadius:8,border:"1px solid #dde1ec",background:"#f5f6fa",color:"#555",cursor:"pointer"}}>{q}</button>
          ))}
        </div>
      </div>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// PANEL DENETÇİ AI — Tüm paneli analiz eder
// ═══════════════════════════════════════════════════════════
function PanelDenetciAI({kullanici}){
  const [rapor,setRapor]=useState(null);const [yukleniyor,setYukleniyor]=useState(false);const [son,setSon]=useState(null);

  const analizYap=async()=>{
    setYukleniyor(true);setRapor(null);
    try{
      // Veri topla
      const bugunStr=bugun();
      const [satislar,stok,siparisler,giderler,cari,ktFisler]=await Promise.all([
        supabase.from("cicek_satislar").select("toplam_tutar,odeme_turu,satis_tarihi").gte("satis_tarihi",bugunStr+"T00:00:00"),
        supabase.from("cicek_urunler").select("urun_adi,stok_miktari,min_stok_uyari,aktif").eq("aktif",true),
        supabase.from("cicek_siparisler").select("durum,teslimat_tarihi,musteri_adi,toplam_tutar").neq("durum","teslim_edildi").neq("durum","iptal"),
        supabase.from("giderler").select("tutar,harcama_tarihi,odeme_turu").gte("harcama_tarihi",bugunStr),
        supabase.from("cicek_cari").select("kalan,durum").neq("durum","kapali"),
        supabase.from("kt_fisler").select("durum,toplam_tutar").eq("durum","hazir"),
      ]);

      const veriOzet={
        bugun_satis:satislar.data?.length||0,
        bugun_ciro:(satislar.data||[]).reduce((t,s)=>t+(s.toplam_tutar||0),0),
        stok_biten:(stok.data||[]).filter(u=>u.stok_miktari<=0).length,
        stok_az:(stok.data||[]).filter(u=>u.stok_miktari>0&&u.stok_miktari<=(u.min_stok_uyari||10)).length,
        bekleyen_siparis:(siparisler.data||[]).length,
        bugun_gider:(giderler.data||[]).reduce((t,g)=>t+(g.tutar||0),0),
        acik_veresiye:(cari.data||[]).reduce((t,c)=>t+(c.kalan||0),0),
        hazir_kt:(ktFisler.data||[]).length,
        gecmis_teslimat:(siparisler.data||[]).filter(s=>s.teslimat_tarihi<bugunStr).length,
      };

      const prompt=`Sen bir işletme yönetim paneli denetçisisin.

Aşağıdaki gerçek zamanlı işletme verisini analiz et:
${JSON.stringify(veriOzet,null,2)}

Şunları raporla (JSON olarak):
1. "kritik" - Hemen dikkat edilmesi gereken (3-5 madde)
2. "uyarilar" - Önemli ama acil değil (3-5 madde)
3. "oneriler" - İşletme iyileştirme önerileri (3-5 madde)
4. "ozet" - Tek cümle genel durum değerlendirmesi

JSON formatında cevap ver, başka metin ekleme.`;

      const resp=await fetch("/api/ocr",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({aiPrompt:prompt, maxTokens:1200})
      });
      const d=await resp.json();
      const text=d.cevap||d.text||(d.content?.[0]?.text)||"";
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setRapor(parsed);setSon(new Date().toLocaleTimeString("tr-TR"));
    }catch(e){setRapor({kritik:["Analiz yapılırken hata: "+e.message],uyarilar:[],oneriler:[],ozet:"Analiz başarısız."});}
    setYukleniyor(false);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <div><h2 style={bstl}>🤖 Panel Denetçi AI</h2><p style={{color:"#888",fontSize:13,margin:"4px 0 0"}}>Tüm paneli tarayarak eksikleri ve kritik durumları raporlar.</p></div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        {son&&<span style={{fontSize:12,color:"#aaa"}}>Son: {son}</span>}
        <button onClick={analizYap} disabled={yukleniyor}
          style={{...abtn,background:"linear-gradient(135deg,#667eea,#764ba2)",opacity:yukleniyor?0.7:1}}>
          {yukleniyor?"⏳ Analiz ediliyor...":"🔍 Paneli Analiz Et"}
        </button>
      </div>
    </div>

    {yukleniyor&&<div style={{...fkrt,textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:12}}>🔍</div>
      <div style={{color:"#555",fontSize:14}}>Panel verilerini toplanıyor ve analiz ediliyor...</div>
      <div style={{color:"#aaa",fontSize:12,marginTop:8}}>Satışlar · Stok · Siparişler · Giderler · Cari hesaplar</div>
    </div>}

    {rapor&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Özet */}
      <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:14,padding:"16px 20px"}}>
        <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginBottom:4}}>GENEL DEĞERLENDİRME</div>
        <div style={{color:"#fff",fontSize:15,fontWeight:600}}>{rapor.ozet}</div>
      </div>

      {/* Kritik */}
      {rapor.kritik?.length>0&&<div style={{...fkrt,border:"2px solid #fecaca"}}>
        <h3 style={{color:"#dc2626",margin:"0 0 12px",fontSize:14,display:"flex",alignItems:"center",gap:6}}>🚨 Kritik Durumlar ({rapor.kritik.length})</h3>
        {rapor.kritik.map((m,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #fee2e2",alignItems:"flex-start"}}>
          <span style={{color:"#dc2626",fontSize:14,flexShrink:0}}>●</span>
          <span style={{color:"#333",fontSize:13}}>{m}</span>
        </div>)}
      </div>}

      {/* Uyarılar */}
      {rapor.uyarilar?.length>0&&<div style={{...fkrt,border:"2px solid #fde68a"}}>
        <h3 style={{color:"#d97706",margin:"0 0 12px",fontSize:14,display:"flex",alignItems:"center",gap:6}}>⚠️ Dikkat Gerektiren ({rapor.uyarilar.length})</h3>
        {rapor.uyarilar.map((m,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #fef3c7",alignItems:"flex-start"}}>
          <span style={{color:"#d97706",fontSize:14,flexShrink:0}}>●</span>
          <span style={{color:"#333",fontSize:13}}>{m}</span>
        </div>)}
      </div>}

      {/* Öneriler */}
      {rapor.oneriler?.length>0&&<div style={{...fkrt,border:"2px solid #86efac"}}>
        <h3 style={{color:"#15803d",margin:"0 0 12px",fontSize:14,display:"flex",alignItems:"center",gap:6}}>💡 İyileştirme Önerileri ({rapor.oneriler.length})</h3>
        {rapor.oneriler.map((m,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #dcfce7",alignItems:"flex-start"}}>
          <span style={{color:"#15803d",fontSize:14,flexShrink:0}}>●</span>
          <span style={{color:"#333",fontSize:13}}>{m}</span>
        </div>)}
      </div>}

      <button onClick={analizYap} style={{...kbtn,alignSelf:"flex-start"}}>🔄 Yeniden Analiz Et</button>
    </div>}

    {!rapor&&!yukleniyor&&<div style={{textAlign:"center",padding:60,color:"#bbb"}}>
      <div style={{fontSize:64,marginBottom:16}}>🤖</div>
      <div style={{fontSize:15,marginBottom:8}}>Panel Denetçi AI hazır</div>
      <div style={{fontSize:13}}>Butona tıklayın — tüm verilerinizi analiz edip rapor sunsun.</div>
    </div>}
  </div>);
}

function AppIcerik(){
  // ✅ Sayfa yenilemede oturum korunur
  const [kullanici,setKullanici]=useState(()=>oturumOku());
  const [modul,setModul]=useState(()=>{
    try{ return oturumOku()?localStorage.getItem("kt_modul")||null:null; }catch{return null;}
  });

  // Her 5 dakikada oturumu uzat (aktivite varsa)
  useEffect(()=>{
    if(!kullanici)return;
    const interval=setInterval(oturumUzat, 5*60*1000);
    // Mouse/keyboard aktivitesinde de uzat
    const aktivite=()=>oturumUzat();
    window.addEventListener("mousemove",aktivite,{passive:true});
    window.addEventListener("keydown",aktivite,{passive:true});
    window.addEventListener("touchstart",aktivite,{passive:true});
    return()=>{
      clearInterval(interval);
      window.removeEventListener("mousemove",aktivite);
      window.removeEventListener("keydown",aktivite);
      window.removeEventListener("touchstart",aktivite);
    };
  },[kullanici]);

  const cikis=()=>{
    oturumSil();
    setKullanici(null);
    setModul(null);
  };

  const girisYapildi=(data)=>{
    setKullanici(data);
  };

  const modulSec=(m)=>{
    setModul(m);
    try{localStorage.setItem("kt_modul",m||"");}catch{}
  };

  const urlParams=new URLSearchParams(window.location.search);
  const musteriToken=urlParams.get('musteri');
  const barkodOturum=urlParams.get('barkod_oturum');
  if(musteriToken)return <KTMusteriSayfasi token={musteriToken}/>;
  if(barkodOturum!==null)return <TelefonBarkodGonder/>;
  if(!kullanici)return <Giris onGiris={girisYapildi}/>;
  if(!modul)return <Ana kullanici={kullanici} onSecim={modulSec} onCikis={cikis}/>;
  if(modul==="cicekci")return <Cicekci kullanici={kullanici} onGeri={()=>modulSec(null)} onCikis={cikis}/>;
  if(modul==="kuru_temizleme")return <><ArayanPopup/><KuruTemizleme kullanici={kullanici} onGeri={()=>modulSec(null)} onCikis={cikis}/></>;
  if(modul==="gider")return(<Layout baslik="Gider/Finans" emoji="💰" menu={[{k:"gider",i:"💸",l:"Giderler"},{k:"kdv",i:"🧾",l:"KDV Raporu"}]} aktif="gider" setAktif={()=>{}} onGeri={()=>modulSec(null)} onCikis={cikis} kullanici={kullanici}><Gider k={kullanici} isletme="ortak"/></Layout>);
  if(modul==="ayarlar")return <Ayarlar kullanici={kullanici} onGeri={()=>modulSec(null)} onCikis={cikis}/>;
}

export default function App(){
  return <ErrorBoundary><AppIcerik/></ErrorBoundary>;
}
