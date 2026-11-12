import type { Lang } from "./dictionary";
import { JOB_GROUPS, JOB_TRADES } from "./jobs";

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

export type DistrictId = (typeof DISTRICTS)[number]["id"];

export const DISTRICT_TOWNS: Record<DistrictId, { en: string; hi: string }[]> = {
  thiruvananthapuram: [
    { en: "Thiruvananthapuram", hi: "तिरुवनंतपुरम" },
    { en: "Neyyattinkara", hi: "नेय्याट्टिंकरा" },
    { en: "Attingal", hi: "अट्टिंगल" },
    { en: "Varkala", hi: "वरकला" },
    { en: "Nedumangad", hi: "नेडुमंगड" },
    { en: "Kazhakkoottam", hi: "कषक्कूट्टम" },
  ],
  kollam: [
    { en: "Kollam", hi: "कोल्लम" },
    { en: "Karunagappally", hi: "करुनागप्पल्ली" },
    { en: "Kottarakkara", hi: "कोट्टारक्करा" },
    { en: "Punalur", hi: "पुनलूर" },
    { en: "Paravur", hi: "परावूर" },
    { en: "Chavara", hi: "चवरा" },
  ],
  pathanamthitta: [
    { en: "Pathanamthitta", hi: "पथनमथिट्टा" },
    { en: "Thiruvalla", hi: "तिरुवल्ला" },
    { en: "Adoor", hi: "अडूर" },
    { en: "Pandalam", hi: "पंडलं" },
    { en: "Ranni", hi: "रन्नी" },
    { en: "Konni", hi: "कोन्नी" },
  ],
  alappuzha: [
    { en: "Alappuzha", hi: "अलप्पुझा" },
    { en: "Cherthala", hi: "चेर्तला" },
    { en: "Kayamkulam", hi: "कायमकुलम" },
    { en: "Haripad", hi: "हरिपाद" },
    { en: "Mavelikkara", hi: "मवेलिक्करा" },
    { en: "Chengannur", hi: "चेंगन्नूर" },
  ],
  kottayam: [
    { en: "Kottayam", hi: "कोट्टायम" },
    { en: "Changanassery", hi: "चंगनाश्शेरी" },
    { en: "Pala", hi: "पाला" },
    { en: "Vaikom", hi: "वैकोम" },
    { en: "Ettumanoor", hi: "एट्टुमनूर" },
    { en: "Erattupetta", hi: "एराट्टुपेट्टा" },
  ],
  idukki: [
    { en: "Thodupuzha", hi: "तोडुपुझा" },
    { en: "Munnar", hi: "मुन्नार" },
    { en: "Kattappana", hi: "कट्टप्पाना" },
    { en: "Adimali", hi: "अडिमाली" },
    { en: "Peerumade", hi: "पीरुमेड" },
    { en: "Nedumkandam", hi: "नेडुमकंडम" },
  ],
  ernakulam: [
    { en: "Kochi", hi: "कोच्चि" },
    { en: "Ernakulam", hi: "एर्नाकुलम" },
    { en: "Aluva", hi: "अलुवा" },
    { en: "Perumbavoor", hi: "पेरुम्बावूर" },
    { en: "Muvattupuzha", hi: "मुवट्टुपुझा" },
    { en: "Kothamangalam", hi: "कोथामंगलम" },
    { en: "Angamaly", hi: "अंगामली" },
    { en: "Tripunithura", hi: "त्रिपुणितुरा" },
  ],
  thrissur: [
    { en: "Thrissur", hi: "त्रिशूर" },
    { en: "Guruvayur", hi: "गुरुवायूर" },
    { en: "Chalakudy", hi: "चलाकुडी" },
    { en: "Kodungallur", hi: "कोडुंगल्लूर" },
    { en: "Irinjalakuda", hi: "इरिंजालकुडा" },
    { en: "Kunnamkulam", hi: "कुन्नमकुलम" },
  ],
  palakkad: [
    { en: "Palakkad", hi: "पालक्काड" },
    { en: "Ottapalam", hi: "ओट्टापालम" },
    { en: "Shoranur", hi: "शोरानूर" },
    { en: "Chittur", hi: "चित्तर" },
    { en: "Mannarkkad", hi: "मन्नारक्काड" },
    { en: "Alathur", hi: "अलत्तूर" },
  ],
  malappuram: [
    { en: "Malappuram", hi: "मलप्पुरम" },
    { en: "Manjeri", hi: "मंजेरी" },
    { en: "Perinthalmanna", hi: "पेरिन्तलमन्ना" },
    { en: "Tirur", hi: "तिरूर" },
    { en: "Ponnani", hi: "पोन्नानी" },
    { en: "Nilambur", hi: "निलंबूर" },
    { en: "Kondotty", hi: "कोंडोट्टी" },
    { en: "Kottakkal", hi: "कोट्टक्कल" },
  ],
  kozhikode: [
    { en: "Kozhikode", hi: "कोझिकोड" },
    { en: "Vadakara", hi: "वडकरा" },
    { en: "Quilandy", hi: "क्विलान्डी" },
    { en: "Ramanattukara", hi: "रामनाट्टुकरा" },
    { en: "Feroke", hi: "फेरोक" },
    { en: "Balussery", hi: "बलुस्सेरी" },
  ],
  wayanad: [
    { en: "Kalpetta", hi: "कल्पेट्टा" },
    { en: "Sultan Bathery", hi: "सुल्तान बठेरी" },
    { en: "Mananthavady", hi: "मनंतवाडी" },
    { en: "Meenangadi", hi: "मीनांगडी" },
    { en: "Vythiri", hi: "व्यतिरी" },
  ],
  kannur: [
    { en: "Kannur", hi: "कन्नूर" },
    { en: "Thalassery", hi: "तलश्शेरी" },
    { en: "Payyanur", hi: "पय्यन्नूर" },
    { en: "Taliparamba", hi: "तलिप्परंबा" },
    { en: "Mattannur", hi: "मट्टन्नूर" },
    { en: "Iritty", hi: "इरिट्टी" },
  ],
  kasaragod: [
    { en: "Kasaragod", hi: "कासरगोड" },
    { en: "Kanhangad", hi: "कान्हंगड" },
    { en: "Nileshwar", hi: "नीलेश्वर" },
    { en: "Bekal", hi: "बेकल" },
    { en: "Manjeshwar", hi: "मंजेस्वर" },
  ],
};

export function townsForDistrict(districtId: string) {
  if (!(districtId in DISTRICT_TOWNS)) return [];
  return DISTRICT_TOWNS[districtId as DistrictId];
}

export function townInDistrict(districtId: string, town: string) {
  return townsForDistrict(districtId).some((item) => item.en === town);
}

export const FALLBACK_CATEGORIES = JOB_TRADES.map((job) => ({
  slug: job.slug,
  en: job.en,
  hi: job.hi,
  group: job.group,
}));

export const FALLBACK_JOB_GROUPS = JOB_GROUPS;

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
