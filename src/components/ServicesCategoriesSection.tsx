import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { Building2, Globe, ArrowRight } from 'lucide-react';

export const ServicesCategoriesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background border-t border-border/50 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-eiras relative z-10">
        <FadeIn>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* National */}
            <div className="group relative bg-secondary hover:bg-secondary/80 p-10 md:p-14 transition-all duration-500 overflow-hidden ring-1 ring-border shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-background flex items-center justify-center mb-8 ring-1 ring-border group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="w-8 h-8 text-foreground" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                  {t.servicesCategories.national.title}
                </h3>

                <p className="text-lg text-muted-foreground mb-12 leading-relaxed flex-grow">
                  {t.servicesCategories.national.description}
                </p>

                <button
                  onClick={() => {
                    const el = document.querySelector('#services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-base font-semibold text-foreground group-hover:text-accent transition-colors mt-auto w-fit"
                >
                  {t.servicesCategories.national.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* International */}
            <div className="group relative bg-foreground p-10 md:p-14 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
              {/* Subtle overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-background/10 backdrop-blur-md flex items-center justify-center mb-8 ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-8 h-8 text-background" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-background mb-4 tracking-tight">
                  {t.servicesCategories.international.title}
                </h3>

                <p className="text-lg text-background/80 mb-12 leading-relaxed flex-grow">
                  {t.servicesCategories.international.description}
                </p>

                <button
                  onClick={() => {
                    const el = document.querySelector('#services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-base font-semibold text-background group-hover:text-white transition-colors mt-auto w-fit"
                >
                  {t.servicesCategories.international.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
};
