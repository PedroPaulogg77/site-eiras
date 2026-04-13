import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalizedField } from '@/lib/translatePost';

export const EbooksSection = () => {
  const { t, language } = useLanguage();

  const { data: ebooks = [] } = useQuery({
    queryKey: ['homepage-ebooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_published', true)
        .eq('show_on_homepage', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (ebooks.length === 0) return null;

  return (
    <section id="ebooks" className="section-padding">
      <div className="container-eiras">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="w-16 h-px bg-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.ebooks.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.ebooks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ebooks.map((ebook) => (
              <Link
                key={ebook.id}
                to={`/ebooks/${ebook.slug}`}
                className="group bg-background border border-border hover:border-foreground transition-colors"
              >
                {ebook.cover_image_url ? (
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={ebook.cover_image_url}
                      alt={ebook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {getLocalizedField(ebook, 'title', language)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {getLocalizedField(ebook, 'description', language)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Download className="w-4 h-4" />
                    {ebook.requires_contact ? t.ebooks.download : t.ebooks.downloadFree}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/ebooks"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium border border-foreground text-foreground btn-scale hover:bg-foreground hover:text-background"
            >
              {t.ebooks.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
