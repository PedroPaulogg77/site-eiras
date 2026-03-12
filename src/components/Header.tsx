import { useState, forwardRef } from 'react';
import { Menu, X, Phone, Mail, Linkedin } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import logoBlack from '@/assets/logo-eiras-black.png';

const languages: { code: Language; label: string }[] = [
  { code: 'pt', label: 'PB' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export const Header = forwardRef<HTMLElement>((_, ref) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.ceo, href: '#ceo' },
    { label: t.nav.team, href: '#team' },
    { label: t.nav.contact, href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="bg-foreground text-background">
        <div className="container-eiras">
          <div className="flex items-center justify-between h-10 text-xs">
            <div className="hidden md:flex items-center gap-6">
              <a href="tel:+553197254-3961" className="flex items-center gap-2 hover:text-background/80 transition-colors">
                <Phone className="w-3 h-3" />
                <span>+55 31 97254-3961</span>
              </a>
              <a href="mailto:contato@eirasconsultoria.com.br" className="flex items-center gap-2 hover:text-background/80 transition-colors">
                <Mail className="w-3 h-3" />
                <span>contato@eirasconsultoria.com.br</span>
              </a>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden md:flex items-center gap-3">
                <a href="https://www.linkedin.com/company/eirasconsultoria/" target="_blank" rel="noopener noreferrer" className="hover:text-background/80 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>

              <div className="hidden md:block w-px h-4 bg-background/30" />

              {/* Language Switcher - Text labels */}
              <div className="flex items-center gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-xs px-2 py-0.5 font-medium transition-all duration-200 ${language === lang.code
                        ? 'opacity-100 bg-background/20'
                        : 'opacity-60 hover:opacity-100'
                      }`}
                    aria-label={`Switch to ${lang.label}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container-eiras">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex-shrink-0">
              <img src={logoBlack} alt="Eiras Consultoria" className="h-10 w-auto" />
            </a>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-foreground link-underline transition-colors hover:text-accent"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden lg:block">
              <a
                href="https://onvio.com.br/login/#/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-sm font-medium bg-foreground text-background btn-scale hover:bg-accent"
              >
                {t.nav.clientArea}
              </a>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border bg-background animate-fade-in">
              <nav className="py-6 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="px-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Idioma</p>
                  <div className="flex gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`text-sm font-medium px-3 py-2 border transition-all ${language === lang.code
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border opacity-60 hover:opacity-100 hover:border-foreground'
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 pt-4">
                  <a
                    href="https://onvio.com.br/login/#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 text-sm font-medium bg-foreground text-background"
                  >
                    {t.nav.clientArea}
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
