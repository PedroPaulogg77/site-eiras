import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';

export const AboutSection = () => {
  const { t } = useLanguage();

  const paragraphs = t.about.content.split('\n\n');

  return (
    <section id="about" className="section-padding bg-secondary">
      <div className="container-eiras">
        <FadeIn className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-12">
            {t.about.title}
          </h2>

          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base md:text-lg text-muted-foreground leading-relaxed text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
