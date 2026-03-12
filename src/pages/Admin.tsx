import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
  ArrowLeft,
  FileText
} from 'lucide-react';
import logoBlack from '@/assets/logo-eiras-black.png';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const Admin = () => {
  const { t } = useLanguage();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, is_published, published_at, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: t.admin.error,
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      return data as BlogPost[];
    },
    enabled: !!user && !!isAdmin,
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      const newPublishedStatus = !post.is_published;
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: newPublishedStatus,
          published_at: newPublishedStatus ? new Date().toISOString() : null,
        })
        .eq('id', post.id);

      if (error) throw error;
      return newPublishedStatus;
    },
    onSuccess: (isPublished) => {
      toast({
        title: isPublished ? t.admin.posts.published : t.admin.posts.unpublished,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: t.admin.error,
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      toast({
        title: t.admin.posts.deleted,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: t.admin.error,
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });

  const togglePublish = (post: BlogPost) => {
    togglePublishMutation.mutate(post);
  };

  const deletePost = (id: string) => {
    deletePostMutation.mutate(id);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container-eiras py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logoBlack} alt="Eiras Consultoria" className="h-8" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {t.admin.dashboard}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.admin.backToSite}
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t.admin.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-eiras py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {t.admin.posts.title}
            </h1>
            <p className="text-muted-foreground">
              {t.admin.posts.subtitle}
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              {t.admin.posts.new}
            </Link>
          </Button>
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length > 0 ? (
          <div className="border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {t.admin.posts.table.title}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {t.admin.posts.table.status}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {t.admin.posts.table.date}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    {t.admin.posts.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-border">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${post.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {post.is_published ? t.admin.posts.statusPublished : t.admin.posts.statusDraft}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(post.created_at), 'PP')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish(post)}
                          title={post.is_published ? t.admin.posts.unpublish : t.admin.posts.publish}
                        >
                          {post.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/admin/posts/${post.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 border border-border bg-secondary">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{t.admin.posts.noPosts}</p>
            <Button asChild>
              <Link to="/admin/posts/new">
                <Plus className="w-4 h-4 mr-2" />
                {t.admin.posts.createFirst}
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
