import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/i18n/translations';

export function useSiteContent(language: Language) {
  return useQuery({
    queryKey: ['site-content', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('section, value')
        .eq('lang', language);

      if (error) throw error;

      const map = new Map<string, unknown>();
      for (const row of data ?? []) {
        map.set(row.section, row.value);
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}
