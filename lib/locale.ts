import { cookies } from "next/headers";
import { dictionaries, type Lang } from "./dictionary";

export function getLang(): Lang {
  return cookies().get("tovio_lang")?.value === "hi" ? "hi" : "en";
}

export function getDict(lang: Lang = getLang()) {
  return dictionaries[lang];
}
