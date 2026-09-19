/**
 * Site ve Daire Katılım Kodu (Davet Kodu) Yardımcı Fonksiyonları
 */

function toAsciiUpper(str: string): string {
  return str
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toUpperCase();
}

/**
 * Bir site adı veya ID'sinden akılda kalıcı, benzersiz ve ASCII uyumlu Site Katılım Kodu üretir.
 * Örnekler: "Güneş Apartmanı" -> "GUNES-8421", "Çiçek Sitesi" -> "CICEK-3912"
 */
export function generateSiteInviteCode(siteName: string, siteId?: string): string {
  const ascii = toAsciiUpper(siteName);
  const cleanName = ascii
    .replace(/[^A-Z0-9]/g, "")
    .replace(/SITESI|APARTMANI|KONUTLARI|REZIDANS|EVLERI|BLOKLARI|SIT|APT/g, "")
    .trim();

  const prefix = cleanName.length >= 3 ? cleanName.slice(0, 6) : "SITE";
  
  // 4 haneli rastgele veya id bazlı sayı
  let numPart = "";
  if (siteId && siteId.length >= 4) {
    const hex = siteId.replace(/[^a-f0-9]/gi, "");
    const sub = hex.slice(0, 4);
    numPart = (parseInt(sub, 16) % 9000 + 1000).toString();
  } else {
    numPart = Math.floor(1000 + Math.random() * 9000).toString();
  }

  return `${prefix}-${numPart}`;
}

/**
 * Kullanıcının girdiği katılım kodunu normalize eder ve ayrıştırır.
 * Desteklenen formatlar:
 * 1. Saf Site Kodu: "gunes-8421" veya "GÜNEŞ-8421" -> { siteCodeOnly: "GUNES-8421", apartmentNo: null }
 * 2. Daireli Kod: "GUNES-8421-D12" veya "GUNES-8421/12" -> { siteCodeOnly: "GUNES-8421", apartmentNo: "12" }
 */
export function parseInviteCodeInput(rawInput: string): {
  normalizedCode: string;
  siteCodeOnly: string;
  apartmentNo: string | null;
} {
  const ascii = toAsciiUpper(rawInput.trim());
  if (!ascii) {
    return { normalizedCode: "", siteCodeOnly: "", apartmentNo: null };
  }

  let siteCodeOnly = ascii;
  let apartmentNo: string | null = null;

  // 1. Slash ayracı: "GUNES-8421/12" veya "GUNES-8421/D12"
  if (ascii.includes("/")) {
    const parts = ascii.split("/");
    siteCodeOnly = parts[0].trim();
    const aptPart = parts[1]?.trim() || "";
    apartmentNo = aptPart.replace(/^D(?:AIRE)?/i, "").trim() || aptPart;
  }
  // 2. -D12 veya -DAIRE12 ayracı: "GUNES-8421-D12" veya "GUNES-8421-DAIRE-12"
  else if (/-D(?:AIRE)?-?(\w+)/i.test(ascii)) {
    const match = ascii.match(/^(.*?)-D(?:AIRE)?-?(\w+)$/i);
    if (match) {
      siteCodeOnly = match[1].trim();
      apartmentNo = match[2].trim();
    }
  }

  return {
    normalizedCode: ascii,
    siteCodeOnly: siteCodeOnly.replace(/\s+/g, "-"),
    apartmentNo,
  };
}
