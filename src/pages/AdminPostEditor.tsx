import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import logoBlack from '@/assets/logo-eiras-black.png';

const AdminPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const { t } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const { data: profileId } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!user,
  });

  const { isLoading: loadingPost } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      if (isNew) return null;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: t.admin.error,
          description: error?.message || 'Post not found',
          variant: 'destructive',
        });
        navigate('/admin');
        throw error || new Error('Post not found');
      }

      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setCoverImageUrl(data.cover_image_url || '');
      setIsPublished(data.is_published);

      return data;
    },
    enabled: !!id && !!user && !!isAdmin,
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNew) {
      setSlug(generateSlug(value));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
      toast({
        title: t.admin.editor.uploadSuccess,
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const savePostMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!title.trim() || !slug.trim() || !content.trim()) {
        throw new Error(t.admin.editor.requiredFields);
      }

      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image_url: coverImageUrl.trim() || null,
        is_published: publish ? true : isPublished,
        published_at: publish ? new Date().toISOString() : null,
        author_id: profileId,
      };

      if (isNew) {
        const { error } = await supabase.from('blog_posts').insert(postData);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
        if (error) throw error;
      }

      return publish;
    },
    onSuccess: () => {
      toast({
        title: isNew ? t.admin.editor.created : t.admin.editor.saved,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: ['public-blog-post', slug] });
        queryClient.invalidateQueries({ queryKey: ['admin-blog-post', id] });
      }
      navigate('/admin');
    },
    onError: (error: any) => {
      toast({
        title: t.admin.error,
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSave = (publish: boolean = false) => {
    savePostMutation.mutate(publish);
  };

  if (authLoading || loadingPost) {
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
            <Link to="/admin">
              <img src={logoBlack} alt="Eiras Consultoria" className="h-8" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {isNew ? t.admin.editor.newPost : t.admin.editor.editPost}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={savePostMutation.isPending}
            >
              {savePostMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t.admin.editor.saveDraft}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={savePostMutation.isPending}
            >
              {savePostMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {t.admin.editor.publish}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-eiras py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.admin.editor.back}
        </Link>

        <div className="max-w-3xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.admin.editor.title}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t.admin.editor.titlePlaceholder}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t.admin.editor.slug}</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="meu-artigo"
              />
              <p className="text-xs text-muted-foreground">
                {t.admin.editor.slugHelp}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">{t.admin.editor.excerpt}</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t.admin.editor.excerptPlaceholder}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="coverImage">{t.admin.editor.coverImage}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {t.admin.editor.uploadImage}
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    id="coverImage"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {coverImageUrl && (
                  <div className="w-24 h-12 border border-border rounded overflow-hidden bg-secondary">
                    <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pb-20">
              <Label htmlFor="content">{t.admin.editor.content}</Label>
              <div className="bg-white text-black min-h-[400px]">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder={t.admin.editor.contentPlaceholder}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'blockquote', 'code-block'],
                      ['clean']
                    ],
                  }}
                  className="h-[350px]"
                />
              </div>
              <p className="text-xs text-muted-foreground pt-12">
                {t.admin.editor.contentHelp}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPostEditor;
