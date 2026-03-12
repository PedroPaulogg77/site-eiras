import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

import { MOCK_POSTS } from '@/lib/mockPosts';

export const BlogSection = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocale = () => {
    switch (language) {
      case 'pt': return ptBR;
      case 'es': return es;
      default: return enUS;
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error || !data || data.length === 0) {
        setPosts(MOCK_POSTS);
      } else {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <section id="blog" className="section-padding bg-secondary">
      <div className="container-eiras">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="w-16 h-px bg-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.blog.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.blog.subtitle}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background border border-border p-6 animate-pulse">
                  <div className="aspect-video bg-muted mb-4" />
                  <div className="h-6 bg-muted mb-2 w-3/4" />
                  <div className="h-4 bg-muted w-full" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-background border border-border hover:border-foreground transition-colors"
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
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background border border-border">
              <p className="text-muted-foreground">{t.blog.noPosts}</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium border border-foreground text-foreground btn-scale hover:bg-foreground hover:text-background"
            >
              {t.blog.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
