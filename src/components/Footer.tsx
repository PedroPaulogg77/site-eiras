import { forwardRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Linkedin } from 'lucide-react';
import logoWhite from '@/assets/logo-eiras-white.png';

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.ceo, href: '#ceo' },
    { label: t.nav.team, href: '#team' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={ref} className="bg-foreground text-background py-16">
      <div className="container-eiras">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src={logoWhite} alt="Eiras Consultoria" className="h-10 w-auto mb-6" />
            <p className="text-background/70 text-sm leading-relaxed">
              {t.contact.info.address}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6">Navigation</h4>
            <nav className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="block text-sm text-background/70 hover:text-background transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-bold mb-6">{t.contact.title}</h4>
            <div className="space-y-3 mb-6">
              <a 
                href={`mailto:${t.contact.info.email}`}
                className="block text-sm text-background/70 hover:text-background transition-colors"
              >
                {t.contact.info.email}
              </a>
              <a 
                href="https://wa.me/5531972543961"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/70 hover:text-background transition-colors"
              >
                {t.contact.info.whatsapp}
              </a>
            </div>

            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/eirasconsultoria/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <p className="text-sm text-background/70 text-center">
            {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
