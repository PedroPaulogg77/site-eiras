import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ContactSection = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    jobFunction: '',
    jobTitle: '',
    company: '',
    email: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          company: formData.company,
          message: `Job Function: ${formData.jobFunction}\nJob Title: ${formData.jobTitle}\nLocation: ${formData.location}`,
        },
      });

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', jobFunction: '', jobTitle: '', company: '', email: '', location: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-secondary">
      <div className="container-eiras">
        <FadeIn>
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t.contact.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-12">
                {t.contact.subtitle}
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${t.contact.info.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      {t.contact.info.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/5531972543961`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      {t.contact.info.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      {t.contact.info.mainOffice}
                    </p>
                    <p className="text-muted-foreground">
                      {t.contact.info.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-background p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t.contact.speakWithTeam}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t.contact.speakWithTeamDesc}
              </p>

              <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Contact Details
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                      {t.contact.form.firstName} *
                    </label>
                    <input type="text" id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                      {t.contact.form.lastName} *
                    </label>
                    <input type="text" id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobFunction" className="block text-sm font-medium text-foreground mb-1">
                      {t.contact.form.jobFunction}
                    </label>
                    <input type="text" id="jobFunction" name="jobFunction" value={formData.jobFunction} onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-1">
                      {t.contact.form.jobTitle}
                    </label>
                    <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1">
                    {t.contact.form.company} *
                  </label>
                  <input type="text" id="company" name="company" required value={formData.company} onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    {t.contact.form.email} *
                  </label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                    {t.contact.form.location}
                  </label>
                  <input type="text" id="location" name="location" value={formData.location} onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 text-base font-medium bg-foreground text-background btn-scale hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.contact.form.sending : t.contact.form.submit}
                </button>

                {submitStatus === 'success' && (
                  <p className="text-center text-foreground font-medium">
                    {t.contact.form.success}
                  </p>
                )}

                {submitStatus === 'error' && (
                  <p className="text-center text-destructive font-medium">
                    {t.contact.form.error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
