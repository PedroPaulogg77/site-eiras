import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Edit, Trash2, Eye, EyeOff, LogOut, Loader2, ArrowLeft,
  BookOpen, Download, Users, Home, HomeIcon
} from 'lucide-react';
import logoBlack from '@/assets/logo-eiras-black.png';
import { format } from 'date-fns';

interface Ebook {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  requires_contact: boolean;
  show_on_homepage: boolean;
  download_count: number;
  created_at: string;
  lead_count?: number;
}

const AdminEbooks = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const { data: ebooks = [], isLoading } = useQuery({
    queryKey: ['admin-ebooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch lead counts per ebook
      const { data: leads } = await supabase
        .from('ebook_leads')
        .select('ebook_id');

      const leadCounts = new Map<string, number>();
      for (const lead of leads ?? []) {
        leadCounts.set(lead.ebook_id, (leadCounts.get(lead.ebook_id) ?? 0) + 1);
      }

      return (data ?? []).map((eb) => ({
        ...eb,
        lead_count: leadCounts.get(eb.id) ?? 0,
      })) as Ebook[];
    },
    enabled: !!user && !!isAdmin,
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (ebook: Ebook) => {
      const { error } = await supabase
        .from('ebooks')
        .update({ is_published: !ebook.is_published, updated_at: new Date().toISOString() })
        .eq('id', ebook.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
      toast({ title: 'Status atualizado!' });
    },
  });

  const toggleHomepageMutation = useMutation({
    mutationFn: async (ebook: Ebook) => {
      const { error } = await supabase
        .from('ebooks')
        .update({ show_on_homepage: !ebook.show_on_homepage, updated_at: new Date().toISOString() })
        .eq('id', ebook.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
      toast({ title: 'Visibilidade na home atualizada!' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ebooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
      toast({ title: 'Ebook excluído!' });
    },
  });

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

      <main className="container-eiras py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Gerenciar E-books</h1>
            <p className="text-muted-foreground">Crie e gerencie seus materiais para download</p>
          </div>
          <Button asChild>
            <Link to="/admin/ebooks/new">
              <Plus className="w-4 h-4 mr-2" /> Novo E-book
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : ebooks.length > 0 ? (
          <div className="border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Título</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Home</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Downloads</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Leads</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ebooks.map((ebook) => (
                  <tr key={ebook.id} className="border-t border-border">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{ebook.title}</p>
                      <p className="text-xs text-muted-foreground">/ebooks/{ebook.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                        ebook.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ebook.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                        ebook.show_on_homepage ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ebook.show_on_homepage ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download className="w-3 h-3" /> {ebook.download_count}
                      </span>
                    </td>
                    <td className="p-4">
                      {ebook.requires_contact ? (
                        <Link
                          to={`/admin/ebooks/${ebook.id}/leads`}
                          className="flex items-center gap-1 text-sm text-foreground hover:text-accent transition-colors"
                        >
                          <Users className="w-3 h-3" /> {ebook.lead_count}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => togglePublishMutation.mutate(ebook)}
                          title={ebook.is_published ? 'Despublicar' : 'Publicar'}>
                          {ebook.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleHomepageMutation.mutate(ebook)}
                          title={ebook.show_on_homepage ? 'Remover da home' : 'Mostrar na home'}>
                          <HomeIcon className={`w-4 h-4 ${ebook.show_on_homepage ? 'text-blue-600' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/ebooks/${ebook.id}`}><Edit className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(ebook.id)}
                          disabled={deleteMutation.isPending}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhum e-book criado ainda.</p>
            <Button asChild>
              <Link to="/admin/ebooks/new"><Plus className="w-4 h-4 mr-2" /> Criar Primeiro E-book</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEbooks;
