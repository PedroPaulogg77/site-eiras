import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { FadeIn } from '@/components/animations/FadeIn';
import { BookOpen, Download, ArrowLeft } from 'lucide-react';
import { getLocalizedField } from '@/lib/translatePost';

const Ebooks = () => {
  const { t, language } = useLanguage();

  const { data: ebooks = [], isLoading } = useQuery({
    queryKey: ['public-ebooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[104px]">
        <div className="container-eiras py-16">
          <FadeIn>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t.ebooks.backToEbooks.includes('Material') ? t.blog.backToHome : t.blog.backToHome}
            </Link>

            <div className="text-center mb-12">
              <div className="w-16 h-px bg-foreground mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t.ebooks.title}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.ebooks.subtitle}
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background border border-border p-6 animate-pulse">
                    <div className="aspect-[3/4] bg-muted mb-4" />
                    <div className="h-6 bg-muted mb-2 w-3/4" />
                    <div className="h-4 bg-muted w-full" />
                  </div>
                ))}
              </div>
            ) : ebooks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map((ebook) => (
                  <Link
                    key={ebook.id}
                    to={`/ebooks/${ebook.slug}`}
                    className="group bg-background border border-border hover:border-foreground transition-colors"
                  >
                    {ebook.cover_image_url ? (
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={ebook.cover_image_url} alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {getLocalizedField(ebook, 'title', language)}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
            ) : (
              <div className="text-center py-12 bg-secondary border border-border">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t.ebooks.noEbooks}</p>
              </div>
            )}
          </FadeIn>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Ebooks;
