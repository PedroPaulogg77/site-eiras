import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSiteImages() {
  return useQuery({
    queryKey: ['site-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('image_key, public_url');

      if (error) throw error;

      const map = new Map<string, string>();
      for (const row of data ?? []) {
        map.set(row.image_key, row.public_url);
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function getImageUrl(
  imagesMap: Map<string, string> | undefined,
  key: string,
  fallback: string
): string {
  return imagesMap?.get(key) ?? fallback;
}
