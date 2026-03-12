import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  FileText,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  ChevronRight,
  X
} from 'lucide-react';

const serviceIcons = [
  Scale,
  FileText,
  Users,
  Building2,
  MapPin,
  TrendingUp,
];

export const ServicesSection = () => {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleService = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="services" className="section-padding bg-background relative">
      <div className="container-eiras relative z-10">
        <FadeIn>
          <div className="w-full mb-16 text-left">
            <div className="w-16 h-px bg-foreground mb-6" />
            <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3 block">
              Expertise
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight">
              {t.services.title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
              {t.services.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service, index) => {
              const Icon = serviceIcons[index] || TrendingUp;
              const isExpanded = expandedIndex === index;

              return (
                <motion.div
                  layout
                  key={index}
                  onClick={() => toggleService(index)}
                  className={`group relative overflow-hidden flex flex-col transition-all duration-300 cursor-pointer ${isExpanded
                    ? 'bg-secondary md:col-span-2 lg:col-span-3 shadow-2xl ring-1 ring-border p-8 md:p-12'
                    : 'bg-background border border-border p-8 hover:bg-secondary/50 hover:shadow-lg'
                    }`}
                >
                  <AnimatePresence mode="popLayout">
                    {isExpanded && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-6 right-6 p-2 hover:bg-background transition-colors z-20 text-muted-foreground hover:text-foreground shadow-sm bg-background/50 border border-border"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedIndex(null);
                        }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="popLayout">
                    {!isExpanded ? (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col h-full"
                      >
                        <div className="mb-8 p-4 bg-secondary inline-flex w-fit ring-1 ring-border group-hover:ring-foreground/20 transition-all">
                          <Icon className="w-8 h-8 text-foreground group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-sm text-muted-foreground font-semibold tracking-widest mb-3 block uppercase">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight group-hover:text-accent transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-base text-muted-foreground leading-relaxed mb-8 flex-grow line-clamp-3">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors mt-auto">
                          <span>{t.services.learnMore}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="pt-2"
                      >
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 pb-8 border-b border-border/50">
                          <div className="p-5 bg-background h-fit ring-1 ring-border shadow-sm">
                            <Icon className="w-10 h-10 text-foreground" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold tracking-widest mb-3 block text-muted-foreground uppercase">
                              Serviço {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                              {service.title}
                            </h3>
                          </div>
                        </div>

                        <div className="max-w-4xl space-y-6 pl-0 md:pl-[6rem]">
                          {service.fullContent.split('\n\n').map((paragraph, pIndex) => (
                            <p
                              key={pIndex}
                              className="text-base md:text-lg leading-relaxed text-muted-foreground/90"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        <div className="mt-12 pl-0 md:pl-[6rem]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const contactSection = document.getElementById('contact');
                              if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold bg-foreground text-background btn-scale hover:bg-accent transition-all"
                          >
                            Falar com Especialista
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
