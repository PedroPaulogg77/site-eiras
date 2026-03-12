import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { ChevronDown, ChevronUp } from 'lucide-react';
import annaImg from '@/assets/anna-galvao.jpg';
import larissaImg from '@/assets/larissa-gomes.jpeg';
import silasImg from '@/assets/silas-muniz.jpeg';
import davidsonImg from '@/assets/davidson-frigeri.webp';

const memberPhotos = [annaImg, larissaImg, silasImg, davidsonImg];

export const TeamSection = () => {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="team" className="section-padding">
      <div className="container-eiras">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.team.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.team.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.team.members.map((member, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square mb-6 overflow-hidden">
                  <img
                    src={memberPhotos[index]}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {member.role}
                </p>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-accent transition-colors link-underline"
                >
                  {t.team.learnMore}
                  {expandedIndex === index ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {expandedIndex === index && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4 text-justify animate-fade-in">
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
