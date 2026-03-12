import { useLanguage } from '@/i18n/LanguageContext';
import { FadeIn } from '@/components/animations/FadeIn';
import { Quote } from 'lucide-react';

const placeholderTestimonials = [
  {
    quote: '"Placeholder testimonial text. Real testimonial coming soon."',
    author: 'Client Name',
    company: 'Company Name',
  },
  {
    quote: '"Placeholder testimonial text. Real testimonial coming soon."',
    author: 'Client Name',
    company: 'Company Name',
  },
  {
    quote: '"Placeholder testimonial text. Real testimonial coming soon."',
    author: 'Client Name',
    company: 'Company Name',
  },
];

export const TestimonialsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="section-padding bg-secondary">
      <div className="container-eiras">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t.testimonials.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {placeholderTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background p-8 border border-border"
              >
                <Quote className="w-8 h-8 text-muted-foreground mb-6" />
                <p className="text-foreground mb-6 italic">
                  {testimonial.quote}
                </p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-12 italic">
            {t.testimonials.placeholder}
          </p>
        </FadeIn>
      </div>
    </section>
  );
};
