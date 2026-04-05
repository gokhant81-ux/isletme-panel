// api/ocr.js — Vercel Serverless Function
// Hem fatura OCR hem de AI prompt çağrıları için kullanılır

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "API key eksik" });
  }

  const body = req.body;

  // ── MOD 1: Düz AI Prompt (AIFloatButon, PanelDenetciAI) ──────
  if (body.aiPrompt) {
    try {
      const messages = [{ role: "user", content: body.aiPrompt }];
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: body.maxTokens || 1000,
          system: body.sistem || "Sen işletme yönetim asistanısın.",
          messages,
        }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "";
      return res.status(200).json({ cevap: text, text });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── MOD 2: Fatura/Fiş OCR (mevcut işlevsellik) ───────────────
  try {
    let userContent = [];

    if (body.image) {
      userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: body.mimeType || "image/jpeg",
            data: body.image,
          },
        },
        {
          type: "text",
          text: `Bu fatura/fiş görüntüsünü analiz et ve aşağıdaki JSON formatında döndür:
{
  "firma_adi": "firma adı",
  "fatura_no": "fatura/belge numarası",
  "tarih": "YYYY-MM-DD formatında",
  "toplam_tutar": sayı,
  "kdv_tutari": sayı,
  "belge_turu": "Fatura/E-Fatura/Fiş",
  "odeme_turu": "nakit/kredi_karti/havale",
  "onerilen_isletme": "cicekci/kuru_temizleme/ortak",
  "kalemler": [
    {
      "aciklama": "ürün adı",
      "miktar": sayı,
      "birim": "adet/dal/kg",
      "birim_fiyat": sayı,
      "toplam": sayı
    }
  ]
}
Sadece JSON döndür, başka metin ekleme.`,
        },
      ];
    } else if (body.pdfText) {
      userContent = [
        {
          type: "text",
          text: `Aşağıdaki fatura metnini analiz et ve JSON formatında döndür:

${body.pdfText}

Format:
{
  "firma_adi": "firma adı",
  "fatura_no": "numara",
  "tarih": "YYYY-MM-DD",
  "toplam_tutar": sayı,
  "kdv_tutari": sayı,
  "belge_turu": "Fatura/E-Fatura/Fiş",
  "odeme_turu": "nakit/kredi_karti/havale",
  "onerilen_isletme": "cicekci/kuru_temizleme/ortak",
  "kalemler": [{"aciklama":"","miktar":0,"birim":"adet","birim_fiyat":0,"toplam":0}]
}
Sadece JSON döndür.`,
        },
      ];
    } else {
      return res.status(400).json({ error: "image, pdfText veya aiPrompt gerekli" });
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    const data = await resp.json();
    const text = data.content?.[0]?.text || "";

    // JSON parse et
    const clean = text.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json({ parsed, raw: text });
    } catch {
      // JSON parse başarısız — ham metni döndür
      return res.status(200).json({ parsed: null, raw: text, error: "JSON parse edilemedi" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
