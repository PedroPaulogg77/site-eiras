import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/admin/AdminNav';
import { Loader2, LogOut, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoBlack from '@/assets/logo-eiras-black.png';

const sections = [
  { key: 'hero', label: 'Hero', desc: 'Tagline, título principal, subtítulo e botão de contato' },
  { key: 'about', label: 'Sobre', desc: 'Texto institucional da Eiras Consultoria' },
  { key: 'ceo', label: 'CEO', desc: 'Título, bio e foto da Michele Eiras' },
  { key: 'services', label: 'Serviços', desc: 'Títulos, descrições e conteúdo completo dos 6 serviços' },
  { key: 'team', label: 'Equipe', desc: 'Nome, cargo, bio e foto dos membros do time' },
  { key: 'testimonials', label: 'Depoimentos', desc: 'Citações, autores e empresas dos depoimentos' },
  { key: 'contact', label: 'Contato', desc: 'Email, WhatsApp e endereço do escritório' },
];

const AdminContent = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

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

      <main className="container-eiras py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Conteúdo do Site</h1>
          <p className="text-muted-foreground">
            Clique em uma seção para editar os textos e imagens. As alterações aparecem no site imediatamente após salvar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ key, label, desc }) => (
            <Link
              key={key}
              to={`/admin/content/${key}`}
              className="group border border-border bg-background hover:border-foreground p-6 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {label}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminContent;
