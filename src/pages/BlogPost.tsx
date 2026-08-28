import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { SEO } from '@/components/SEO';
import { MOCK_POSTS } from '@/lib/mockPosts';
import { getLocalizedField } from '@/lib/translatePost';

interface BlogPostData {
  id: string;
  title: string;
  title_en?: string | null;
  title_es?: string | null;
  content: string;
  content_en?: string | null;
  content_es?: string | null;
  excerpt: string | null;
  excerpt_en?: string | null;
  excerpt_es?: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'pt': return ptBR;
      case 'es': return es;
      default: return enUS;
    }
  };

  const { data: post, isLoading: loading } = useQuery({
    queryKey: ['public-blog-post', slug],
    queryFn: async () => {
      if (!slug) {
        navigate('/blog');
        throw new Error("No slug provided");
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error || !data) {
        if (import.meta.env.DEV) {
          const mockPost = MOCK_POSTS.find(p => p.slug === slug);
          if (mockPost) return mockPost as BlogPostData;
        }

        console.error('Error fetching post:', error);
        navigate('/blog');
        throw error || new Error("Post not found");
      }

      return data as BlogPostData;
    },
    enabled: !!slug
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Carregando Post..." />
        <Header />
        <main className="pt-32 pb-16">
          <div className="container-eiras max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted w-3/4 mb-4" />
              <div className="h-4 bg-muted w-1/2 mb-8" />
              <div className="aspect-video bg-muted mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-muted w-full" />
                <div className="h-4 bg-muted w-full" />
                <div className="h-4 bg-muted w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={getLocalizedField(post, 'title', language)}
        description={getLocalizedField(post, 'excerpt', language) || getLocalizedField(post, 'title', language)}
        image={post.cover_image_url || undefined}
        type="article"
        url={`https://www.eirasconsultoria.com.br/blog/${slug}`}
      />
      <Header />
      <main className="pt-32 pb-16">
        <article className="container-eiras max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.blog.backToBlog}
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {getLocalizedField(post, 'title', language)}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(post.published_at || post.created_at), 'PPP', { locale: getLocale() })}
                </span>
              </div>
            </div>
          </header>

          {post.cover_image_url && (
            <div className="aspect-video mb-8 overflow-hidden">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: getLocalizedField(post, 'content', language) }}
          />
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BlogPost;
