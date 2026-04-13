import { Link, useLocation } from 'react-router-dom';
import { FileText, Layout } from 'lucide-react';

const tabs = [
  { label: 'Blog', icon: FileText, href: '/admin' },
  { label: 'Conteúdo do Site', icon: Layout, href: '/admin/content' },
];

export const AdminNav = () => {
  const { pathname } = useLocation();

  return (
    <div className="border-b border-border bg-secondary">
      <div className="container-eiras flex gap-0">
        {tabs.map(({ label, icon: Icon, href }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
