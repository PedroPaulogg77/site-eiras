import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { translations } from '@/i18n/translations';
import { AdminNav } from '@/components/admin/AdminNav';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, ArrowLeft, Save, RotateCcw } from 'lucide-react';
import logoBlack from '@/assets/logo-eiras-black.png';
import micheleEiras from '@/assets/michele-eiras.jpg';
import annaImg from '@/assets/anna-galvao.jpg';
import larissaImg from '@/assets/larissa-gomes.jpeg';
import silasImg from '@/assets/silas-muniz.jpeg';
import { useSiteImages, getImageUrl } from '@/hooks/useSiteImages';

type Lang = 'pt' | 'en' | 'es';
const LANGS: { code: Lang; label: string }[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  about: 'Sobre',
  ceo: 'CEO',
  services: 'Serviços',
  team: 'Equipe',
  testimonials: 'Depoimentos',
  contact: 'Contato',
};

function cloneSection(section: string, lang: Lang): unknown {
  const base = translations[lang] as Record<string, unknown>;
  return JSON.parse(JSON.stringify(base[section] ?? {}));
}

const AdminContentEditor = () => {
  const { section = '' } = useParams<{ section: string }>();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeLang, setActiveLang] = useState<Lang>('pt');
  const [formData, setFormData] = useState<Record<Lang, unknown>>({
    pt: cloneSection(section, 'pt'),
    en: cloneSection(section, 'en'),
    es: cloneSection(section, 'es'),
  });

  const { data: imagesMap } = useSiteImages();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load existing DB content for all 3 languages
  const { isLoading: loadingContent } = useQuery({
    queryKey: ['admin-site-content', section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('lang, value')
        .eq('section', section);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAdmin && !!section,
    onSuccess: (data) => {
      if (!data || data.length === 0) return;
      setFormData((prev) => {
        const next = { ...prev };
        for (const row of data) {
          if (row.lang === 'pt' || row.lang === 'en' || row.lang === 'es') {
            next[row.lang as Lang] = mergeWithBase(section, row.lang as Lang, row.value);
          }
        }
        return next;
      });
    },
  });

  function mergeWithBase(sec: string, lang: Lang, dbValue: unknown): unknown {
    const base = cloneSection(sec, lang) as Record<string, unknown>;
    if (!dbValue || typeof dbValue !== 'object') return base;
    return { ...base, ...(dbValue as Record<string, unknown>) };
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const rows = LANGS.map(({ code }) => ({
        section,
        lang: code,
        value: formData[code] as Record<string, unknown>,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }));

      const { error } = await supabase
        .from('site_content')
        .upsert(rows, { onConflict: 'section,lang' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-content', section] });
      toast({ title: 'Conteúdo salvo com sucesso!' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('section', section);
      if (error) throw error;
    },
    onSuccess: () => {
      setFormData({
        pt: cloneSection(section, 'pt'),
        en: cloneSection(section, 'en'),
        es: cloneSection(section, 'es'),
      });
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-content', section] });
      toast({ title: 'Conteúdo restaurado para o padrão.' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao restaurar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const update = useCallback((lang: Lang, key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: { ...(prev[lang] as Record<string, unknown>), [key]: value },
    }));
  }, []);

  const updateNested = useCallback((lang: Lang, parentKey: string, index: number, key: string, value: string) => {
    setFormData((prev) => {
      const parent = (prev[lang] as Record<string, unknown>)[parentKey] as unknown[];
      const updated = parent.map((item, i) =>
        i === index ? { ...(item as Record<string, unknown>), [key]: value } : item
      );
      return { ...prev, [lang]: { ...(prev[lang] as Record<string, unknown>), [parentKey]: updated } };
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loadingContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const data = formData[activeLang] as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container-eiras py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logoBlack} alt="Eiras Consultoria" className="h-8" />
            </Link>
            <span className="text-sm text-muted-foreground">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Site
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="container-eiras py-8 max-w-3xl">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/content"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Seções
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold text-foreground">{SECTION_LABELS[section] ?? section}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><RotateCcw className="w-4 h-4 mr-2" />Restaurar Padrão</>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Conteúdo
            </Button>
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-border mb-8">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeLang === code
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Section-specific forms */}
        <div className="space-y-6">
          {section === 'hero' && <HeroForm lang={activeLang} data={data} update={update} />}
          {section === 'about' && <AboutForm lang={activeLang} data={data} update={update} />}
          {section === 'ceo' && (
            <CeoForm lang={activeLang} data={data} update={update} imagesMap={imagesMap} />
          )}
          {section === 'services' && (
            <ServicesForm lang={activeLang} data={data} update={update} updateNested={updateNested} />
          )}
          {section === 'team' && (
            <TeamForm lang={activeLang} data={data} update={update} updateNested={updateNested} imagesMap={imagesMap} />
          )}
          {section === 'testimonials' && (
            <TestimonialsForm lang={activeLang} data={data} update={update} updateNested={updateNested} formData={formData} setFormData={setFormData} />
          )}
          {section === 'contact' && <ContactForm lang={activeLang} data={data} update={update} />}
        </div>
      </main>
    </div>
  );
};

// ── Section forms ──────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function HeroForm({ lang, data, update }: { lang: Lang; data: Record<string, unknown>; update: (l: Lang, k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Tagline (texto acima do título)">
        <Input value={(data.tagline as string) ?? ''} onChange={(e) => update(lang, 'tagline', e.target.value)} />
      </Field>
      <Field label="Título Principal">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Subtítulo">
        <Textarea rows={3} value={(data.subtitle as string) ?? ''} onChange={(e) => update(lang, 'subtitle', e.target.value)} />
      </Field>
      <Field label="Texto do Botão de Contato">
        <Input value={(data.cta as string) ?? ''} onChange={(e) => update(lang, 'cta', e.target.value)} />
      </Field>
    </>
  );
}

function AboutForm({ lang, data, update }: { lang: Lang; data: Record<string, unknown>; update: (l: Lang, k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Título">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Conteúdo">
        <Textarea rows={12} value={(data.content as string) ?? ''} onChange={(e) => update(lang, 'content', e.target.value)} className="font-mono text-xs" />
      </Field>
    </>
  );
}

function CeoForm({ lang, data, update, imagesMap }: {
  lang: Lang;
  data: Record<string, unknown>;
  update: (l: Lang, k: string, v: unknown) => void;
  imagesMap: Map<string, string> | undefined;
}) {
  return (
    <>
      {lang === 'pt' && (
        <Field label="Foto da CEO">
          <ImageUploader
            imageKey="ceo-photo"
            currentUrl={getImageUrl(imagesMap, 'ceo-photo', micheleEiras)}
            label="Trocar Foto da CEO"
          />
        </Field>
      )}
      <Field label="Rótulo (ex: CEO)">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Nome">
        <Input value={(data.subtitle as string) ?? ''} onChange={(e) => update(lang, 'subtitle', e.target.value)} />
      </Field>
      <Field label="Bio">
        <Textarea rows={14} value={(data.content as string) ?? ''} onChange={(e) => update(lang, 'content', e.target.value)} className="font-mono text-xs" />
      </Field>
    </>
  );
}

function ServicesForm({ lang, data, update, updateNested }: {
  lang: Lang;
  data: Record<string, unknown>;
  update: (l: Lang, k: string, v: unknown) => void;
  updateNested: (l: Lang, parent: string, i: number, k: string, v: string) => void;
}) {
  const items = (data.items as Array<Record<string, string>>) ?? [];
  return (
    <>
      <Field label="Título da Seção">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Subtítulo da Seção">
        <Textarea rows={4} value={(data.subtitle as string) ?? ''} onChange={(e) => update(lang, 'subtitle', e.target.value)} />
      </Field>
      <div className="border-t border-border pt-6 space-y-8">
        {items.map((item, i) => (
          <div key={i} className="border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serviço {i + 1}</p>
            <Field label="Título">
              <Input value={item.title ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'title', e.target.value)} />
            </Field>
            <Field label="Descrição curta (card)">
              <Textarea rows={3} value={item.description ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'description', e.target.value)} />
            </Field>
            <Field label="Conteúdo completo (modal)">
              <Textarea rows={8} value={item.fullContent ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'fullContent', e.target.value)} className="font-mono text-xs" />
            </Field>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamForm({ lang, data, update, updateNested, imagesMap }: {
  lang: Lang;
  data: Record<string, unknown>;
  update: (l: Lang, k: string, v: unknown) => void;
  updateNested: (l: Lang, parent: string, i: number, k: string, v: string) => void;
  imagesMap: Map<string, string> | undefined;
}) {
  const fallbacks = [annaImg, larissaImg, silasImg];
  const members = (data.members as Array<Record<string, string>>) ?? [];
  return (
    <>
      <Field label="Título da Seção">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Subtítulo da Seção">
        <Input value={(data.subtitle as string) ?? ''} onChange={(e) => update(lang, 'subtitle', e.target.value)} />
      </Field>
      <div className="border-t border-border pt-6 space-y-8">
        {members.map((member, i) => (
          <div key={i} className="border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Membro {i + 1}</p>
            {lang === 'pt' && (
              <Field label="Foto">
                <ImageUploader
                  imageKey={`team-${i}`}
                  currentUrl={getImageUrl(imagesMap, `team-${i}`, fallbacks[i])}
                  label="Trocar Foto"
                />
              </Field>
            )}
            <Field label="Nome">
              <Input value={member.name ?? ''} onChange={(e) => updateNested(lang, 'members', i, 'name', e.target.value)} />
            </Field>
            <Field label="Cargo">
              <Input value={member.role ?? ''} onChange={(e) => updateNested(lang, 'members', i, 'role', e.target.value)} />
            </Field>
            <Field label="Bio">
              <Textarea rows={5} value={member.bio ?? ''} onChange={(e) => updateNested(lang, 'members', i, 'bio', e.target.value)} />
            </Field>
          </div>
        ))}
      </div>
    </>
  );
}

function TestimonialsForm({ lang, data, update, updateNested, formData, setFormData }: {
  lang: Lang;
  data: Record<string, unknown>;
  update: (l: Lang, k: string, v: unknown) => void;
  updateNested: (l: Lang, parent: string, i: number, k: string, v: string) => void;
  formData: Record<Lang, unknown>;
  setFormData: React.Dispatch<React.SetStateAction<Record<Lang, unknown>>>;
}) {
  const items = (data.items as Array<Record<string, string>>) ?? [];

  const addItem = () => {
    setFormData((prev) => {
      const current = (prev[lang] as Record<string, unknown>);
      const currentItems = (current.items as Array<Record<string, string>>) ?? [];
      return {
        ...prev,
        [lang]: { ...current, items: [...currentItems, { quote: '', author: '', company: '' }] },
      };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev) => {
      const current = (prev[lang] as Record<string, unknown>);
      const currentItems = (current.items as Array<Record<string, string>>) ?? [];
      return {
        ...prev,
        [lang]: { ...current, items: currentItems.filter((_, i) => i !== index) },
      };
    });
  };

  return (
    <>
      <Field label="Título da Seção">
        <Input value={(data.title as string) ?? ''} onChange={(e) => update(lang, 'title', e.target.value)} />
      </Field>
      <Field label="Subtítulo da Seção">
        <Input value={(data.subtitle as string) ?? ''} onChange={(e) => update(lang, 'subtitle', e.target.value)} />
      </Field>
      <div className="border-t border-border pt-6 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Depoimento {i + 1}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                Remover
              </Button>
            </div>
            <Field label="Citação">
              <Textarea rows={3} value={item.quote ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'quote', e.target.value)} />
            </Field>
            <Field label="Nome do autor">
              <Input value={item.author ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'author', e.target.value)} />
            </Field>
            <Field label="Empresa">
              <Input value={item.company ?? ''} onChange={(e) => updateNested(lang, 'items', i, 'company', e.target.value)} />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          + Adicionar Depoimento
        </Button>
      </div>
    </>
  );
}

function ContactForm({ lang, data, update }: { lang: Lang; data: Record<string, unknown>; update: (l: Lang, k: string, v: unknown) => void }) {
  const info = (data.info as Record<string, string>) ?? {};
  const updateInfo = (key: string, value: string) => {
    update(lang, 'info', { ...info, [key]: value });
  };
  return (
    <>
      <Field label="Email">
        <Input value={info.email ?? ''} onChange={(e) => updateInfo('email', e.target.value)} />
      </Field>
      <Field label="WhatsApp">
        <Input value={info.whatsapp ?? ''} onChange={(e) => updateInfo('whatsapp', e.target.value)} />
      </Field>
      <Field label="Endereço">
        <Textarea rows={3} value={info.address ?? ''} onChange={(e) => updateInfo('address', e.target.value)} />
      </Field>
      <Field label="Rótulo do escritório (ex: Escritório Principal)">
        <Input value={info.mainOffice ?? ''} onChange={(e) => updateInfo('mainOffice', e.target.value)} />
      </Field>
    </>
  );
}

export default AdminContentEditor;
