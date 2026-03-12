import { forwardRef } from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = forwardRef<HTMLAnchorElement>((_, ref) => {
  return (
    <a
      ref={ref}
      href="https://wa.me/5531972543961"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-foreground text-background flex items-center justify-center shadow-lg btn-scale hover:bg-accent"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
});

WhatsAppButton.displayName = 'WhatsAppButton';