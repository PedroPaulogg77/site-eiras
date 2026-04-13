import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ImageUploaderProps {
  imageKey: string;
  currentUrl: string;
  label?: string;
}

export const ImageUploader = ({ imageKey, currentUrl, label = 'Trocar Foto' }: ImageUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${imageKey}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('site_images')
        .upsert({
          image_key: imageKey,
          storage_path: fileName,
          public_url: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }, { onConflict: 'image_key' });

      if (dbError) throw dbError;

      setPreviewUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
      toast({ title: 'Foto atualizada com sucesso!' });
    } catch (error: unknown) {
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={imageKey}
          className="w-16 h-16 object-cover border border-border"
        />
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />{label}</>
          )}
        </Button>
      </div>
    </div>
  );
};
