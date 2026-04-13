import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, ArrowLeft, Download } from 'lucide-react';
import logoBlack from '@/assets/logo-eiras-black.png';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  created_at: string;
}

const AdminEbookLeads = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/admin/login');
  }, [user, isAdmin, authLoading, navigate]);

  const { data: ebook } = useQuery({
    queryKey: ['admin-ebook-title', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('ebooks').select('title').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAdmin,
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-ebook-leads', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ebook_leads')
        .select('*')
        .eq('ebook_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user && !!isAdmin,
  });

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Data'];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone ?? '',
      l.company ?? '',
      format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${ebook?.title ?? 'ebook'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

      <main className="container-eiras py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/admin/ebooks" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> E-books
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold text-foreground">Leads: {ebook?.title}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={leads.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        {leads.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">{leads.length} lead(s) capturado(s)</p>
            <div className="border border-border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Telefone</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empresa</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-border">
                      <td className="p-4 text-sm text-foreground">{lead.name}</td>
                      <td className="p-4 text-sm text-foreground">{lead.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">{lead.phone ?? '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{lead.company ?? '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-16 border border-border bg-secondary">
            <p className="text-muted-foreground">Nenhum lead capturado para este e-book ainda.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEbookLeads;
