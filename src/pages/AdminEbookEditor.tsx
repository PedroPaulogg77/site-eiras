import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, ArrowLeft, Save, Upload } from 'lucide-react';
import logoBlack from '@/assets/logo-eiras-black.png';

const AdminEbookEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [requiresContact, setRequiresContact] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/admin/login');
  }, [user, isAdmin, authLoading, navigate]);

  const { isLoading } = useQuery({
    queryKey: ['admin-ebook', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from('ebooks').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAdmin && !isNew,
    onSuccess: (data) => {
      if (!data) return;
      setTitle(data.title);
      setTitleEn(data.title_en ?? '');
      setTitleEs(data.title_es ?? '');
      setDescription(data.description ?? '');
      setDescriptionEn(data.description_en ?? '');
      setDescriptionEs(data.description_es ?? '');
      setSlug(data.slug);
      setCoverImageUrl(data.cover_image_url ?? '');
      setFileUrl(data.file_url);
      setRequiresContact(data.requires_contact);
      setShowOnHomepage(data.show_on_homepage);
    },
  });

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNew) setSlug(generateSlug(value));
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    setLoading: (v: boolean) => void,
    onSuccess: (url: string) => void
  ) => {
    try {
      setLoading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onSuccess(publicUrl);
      toast({ title: 'Arquivo enviado com sucesso!' });
    } catch (err: unknown) {
      toast({ title: 'Erro no upload', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title || !slug || !fileUrl) {
      toast({ title: 'Preencha título, slug e arquivo do PDF.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        title_en: titleEn || null,
        title_es: titleEs || null,
        description,
        description_en: descriptionEn || null,
        description_es: descriptionEs || null,
        slug,
        cover_image_url: coverImageUrl || null,
        file_url: fileUrl,
        requires_contact: requiresContact,
        show_on_homepage: showOnHomepage,
        is_published: publish,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase.from('ebooks').insert(payload);
        if (error) throw error;
        toast({ title: publish ? 'E-book publicado!' : 'Rascunho salvo!' });
      } else {
        const { error } = await supabase.from('ebooks').update(payload).eq('id', id!);
        if (error) throw error;
        toast({ title: 'E-book salvo!' });
      }

      queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
      navigate('/admin/ebooks');
    } catch (err: unknown) {
      toast({ title: 'Erro ao salvar', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container-eiras py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><img src={logoBlack} alt="Eiras Consultoria" className="h-8" /></Link>
            <span className="text-sm text-muted-foreground">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Site
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="container-eiras py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin/ebooks" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> E-books
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-xl font-bold text-foreground">{isNew ? 'Novo E-book' : 'Editar E-book'}</h1>
        </div>

        <div className="space-y-6">
          {/* Cover image */}
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <div className="flex items-center gap-4">
              {coverImageUrl && <img src={coverImageUrl} alt="Capa" className="w-24 h-32 object-cover border border-border" />}
              <div>
                <input type="file" accept="image/*" className="hidden" id="cover-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(f, 'ebook-files', setUploadingCover, setCoverImageUrl);
                  }} />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('cover-upload')?.click()}
                  disabled={uploadingCover}>
                  {uploadingCover ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />Upload Capa</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Ou cole a URL abaixo:</p>
                <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </div>
          </div>

          {/* PDF file */}
          <div className="space-y-2">
            <Label>Arquivo PDF *</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input type="file" accept=".pdf" className="hidden" id="pdf-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(f, 'ebook-files', setUploadingPdf, setFileUrl);
                  }} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pdf-upload')?.click()}
                    disabled={uploadingPdf}>
                    {uploadingPdf ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />Upload PDF</>}
                  </Button>
                  {fileUrl && <span className="text-xs text-green-700 self-center">PDF carregado</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ou cole o link externo:</p>
                <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 border border-border p-4 bg-secondary">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={requiresContact} onChange={(e) => setRequiresContact(e.target.checked)}
                className="w-4 h-4 accent-foreground" />
              <span className="text-sm font-medium text-foreground">Exigir dados de contato para baixar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showOnHomepage} onChange={(e) => setShowOnHomepage(e.target.checked)}
                className="w-4 h-4 accent-foreground" />
              <span className="text-sm font-medium text-foreground">Mostrar na página inicial</span>
            </label>
          </div>

          {/* PT */}
          <div className="border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Português</p>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Guia de Tributação no Brasil" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="guia-tributacao-brasil" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do e-book que aparece na página de download..." />
            </div>
          </div>

          {/* EN */}
          <div className="border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">English</p>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Brazil Tax Guide" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
            </div>
          </div>

          {/* ES */}
          <div className="border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Español</p>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} placeholder="Guía de Tributación en Brasil" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={4} value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Publicar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEbookEditor;
