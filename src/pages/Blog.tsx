import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { SEO } from '@/components/SEO';
import { MOCK_POSTS } from '@/lib/mockPosts';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const { t, language } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'pt': return ptBR;
      case 'es': return es;
      default: return enUS;
    }
  };

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return MOCK_POSTS as BlogPost[];
      }
      return data as BlogPost[];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t.blog.title} description={t.blog.subtitle} url="https://eirasconsultoria.com.br/blog" />
      <Header />
      <main className="pt-32 pb-16">
        <div className="container-eiras">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.blog.backToHome}
          </Link>

          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.blog.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {t.blog.subtitle}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-secondary border border-border p-6 animate-pulse">
                  <div className="aspect-video bg-muted mb-4" />
                  <div className="h-6 bg-muted mb-2 w-3/4" />
                  <div className="h-4 bg-muted w-full" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-secondary border border-border hover:border-foreground transition-colors"
                >
                  {post.cover_image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Blog</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(post.published_at || post.created_at), 'PPP', { locale: getLocale() })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary border border-border">
              <p className="text-muted-foreground">{t.blog.noPosts}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blog;
