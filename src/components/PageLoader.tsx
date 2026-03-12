import { Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export const PageLoader = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      <p className="text-muted-foreground animate-pulse text-sm">
        {t.hero.subtitle ? "Carregando..." : "Loading..."}
      </p>
    </div>
  );
};
