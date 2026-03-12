import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ServicesCategoriesSection } from '@/components/ServicesCategoriesSection';
import { ServicesSection } from '@/components/ServicesSection';
import { CEOSection } from '@/components/CEOSection';
import { TeamSection } from '@/components/TeamSection';
import { BlogSection } from '@/components/BlogSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SEO } from '@/components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesCategoriesSection />
        <ServicesSection />
        <CEOSection />
        <TeamSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
