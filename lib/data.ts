import type { Lang } from "./dictionary";

export const DISTRICTS = [
  { id: "thiruvananthapuram", en: "Thiruvananthapuram", hi: "तिरुवनंतपुरम" },
  { id: "kollam", en: "Kollam", hi: "कोल्लम" },
  { id: "pathanamthitta", en: "Pathanamthitta", hi: "पथनमथिट्टा" },
  { id: "alappuzha", en: "Alappuzha", hi: "अलप्पुझा" },
  { id: "kottayam", en: "Kottayam", hi: "कोट्टायम" },
  { id: "idukki", en: "Idukki", hi: "इडुक्की" },
  { id: "ernakulam", en: "Ernakulam", hi: "एर्नाकुलम" },
  { id: "thrissur", en: "Thrissur", hi: "त्रिशूर" },
  { id: "palakkad", en: "Palakkad", hi: "पालक्काड" },
  { id: "malappuram", en: "Malappuram", hi: "मलप्पुरम" },
  { id: "kozhikode", en: "Kozhikode", hi: "कोझिकोड" },
  { id: "wayanad", en: "Wayanad", hi: "वायनाड" },
  { id: "kannur", en: "Kannur", hi: "कन्नूर" },
  { id: "kasaragod", en: "Kasaragod", hi: "कासरगोड" },
] as const;

export const FALLBACK_CATEGORIES = [
  { slug: "mason", en: "Mason", hi: "राजमिस्त्री" },
  { slug: "mason-helper", en: "Mason Helper", hi: "राजमिस्त्री सहायक" },
  { slug: "general-worker", en: "General Construction Worker", hi: "सामान्य निर्माण श्रमिक" },
  { slug: "carpenter", en: "Carpenter", hi: "बढ़ई" },
  { slug: "shuttering-carpenter", en: "Shuttering Carpenter", hi: "शटरिंग बढ़ई" },
  { slug: "steel-fixer", en: "Steel Fixer / Bar Bender", hi: "सरिया बांधने वाला" },
  { slug: "electrician", en: "Electrician", hi: "इलेक्ट्रीशियन" },
  { slug: "plumber", en: "Plumber", hi: "प्लंबर" },
  { slug: "painter", en: "Painter", hi: "पेंटर" },
  { slug: "tile-worker", en: "Tile Worker", hi: "टाइल श्रमिक" },
  { slug: "welder", en: "Welder", hi: "वेल्डर" },
  { slug: "scaffolding", en: "Scaffolding Worker", hi: "मचान श्रमिक" },
  { slug: "machine-operator", en: "Machine Operator", hi: "मशीन ऑपरेटर" },
  { slug: "site-supervisor", en: "Site Supervisor", hi: "साइट सुपरवाइजर" },
  { slug: "cleaning", en: "Cleaning Worker", hi: "सफाई श्रमिक" },
  { slug: "other", en: "Other", hi: "अन्य" },
] as const;

export function districtName(id: string, lang: Lang) {
  const match = DISTRICTS.find((district) => district.id === id);
  return match ? match[lang] : id;
}

export function safePath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return null;
  }
  return value;
}
