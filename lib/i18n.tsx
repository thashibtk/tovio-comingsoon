"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Dictionary, type Lang } from "./dictionary";

type LanguageContextValue = {
  lang: Lang;
  t: Dictionary;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  function setLang(next: Lang) {
    document.cookie = `tovio_lang=${next};path=/;max-age=31536000;samesite=lax`;
    setLangState(next);
    router.refresh();
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return value;
}
