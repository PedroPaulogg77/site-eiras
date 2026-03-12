import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import micheleEiras from '@/assets/michele-eiras.jpg';

export const CEOSection = () => {
  const { t } = useLanguage();

  const paragraphs = t.ceo.content.split('\n\n');

  return (
    <section id="ceo" className="section-padding bg-secondary">
      <div className="container-eiras">
        <FadeIn>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-2 order-1 lg:order-1">
              <div className="aspect-[3/4] max-w-sm mx-auto lg:mx-0 overflow-hidden">
                <img
                  src={micheleEiras}
                  alt="Michele Eiras - CEO da Eiras Consultoria"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-3 order-2 lg:order-2">
              <div className="w-12 h-px bg-foreground mb-6" />
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {t.ceo.title}
              </p>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6">
                {t.ceo.subtitle}
              </h2>

              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm text-muted-foreground leading-relaxed text-justify"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
