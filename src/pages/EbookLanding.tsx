import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { FadeIn } from '@/components/animations/FadeIn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BookOpen, Download, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { getLocalizedField } from '@/lib/translatePost';
import { useToast } from '@/hooks/use-toast';

const EbookLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: ebook, isLoading } = useQuery({
    queryKey: ['public-ebook', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('slug', slug!)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const triggerDownload = async (ebookData: typeof ebook) => {
    if (!ebookData) return;
    // Increment download count
    await supabase.rpc('increment_download_count', { ebook_id: ebookData.id });
    // Open file
    window.open(ebookData.file_url, '_blank');
  };

  const handleDirectDownload = () => {
    triggerDownload(ebook);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebook || !name || !email) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('ebook_leads').insert({
        ebook_id: ebook.id,
        name,
        email,
        phone: phone || null,
        company: company || null,
      });
      if (error) throw error;

      setSubmitted(true);
      toast({ title: t.ebooks.form.success });
      triggerDownload(ebook);
    } catch {
      toast({ title: t.ebooks.form.error, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[104px] flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[104px] container-eiras py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">E-book não encontrado</h1>
          <Link to="/ebooks" className="text-sm text-muted-foreground hover:text-foreground">
            {t.ebooks.backToEbooks}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const ebookTitle = getLocalizedField(ebook, 'title', language);
  const ebookDesc = getLocalizedField(ebook, 'description', language);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[104px]">
        <div className="container-eiras py-16">
          <FadeIn>
            <Link to="/ebooks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t.ebooks.backToEbooks}
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: cover image */}
              <div>
                {ebook.cover_image_url ? (
                  <div className="aspect-[3/4] max-w-md mx-auto overflow-hidden border border-border">
                    <img src={ebook.cover_image_url} alt={ebookTitle} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[3/4] max-w-md mx-auto bg-muted flex items-center justify-center border border-border">
                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Right: info + form or download button */}
              <div>
                <div className="w-12 h-px bg-foreground mb-6" />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {ebookTitle}
                </h1>
                {ebookDesc && (
                  <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                    {ebookDesc}
                  </p>
                )}

                {ebook.requires_contact && !submitted ? (
                  <div className="border border-border bg-secondary p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {t.ebooks.form.title}
                    </h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t.ebooks.form.name} *</Label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.ebooks.form.email} *</Label>
                        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.ebooks.form.phone}</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.ebooks.form.company}</Label>
                        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.ebooks.form.submitting}</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" />{t.ebooks.form.submit}</>
                        )}
                      </Button>
                    </form>
                  </div>
                ) : submitted ? (
                  <div className="border border-border bg-secondary p-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p className="text-foreground font-medium mb-4">{t.ebooks.form.success}</p>
                    <Button onClick={handleDirectDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" /> {t.ebooks.download}
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleDirectDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    {t.ebooks.downloadFree}
                  </Button>
                )}

                {ebook.download_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-4">
                    {ebook.download_count} {t.ebooks.downloads}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default EbookLanding;
