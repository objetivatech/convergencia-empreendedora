import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  bucket: 'business-logos' | 'business-covers' | 'business-gallery';
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ImageUpload = ({ 
  bucket, 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved,
  label,
  accept = "image/*",
  maxSize = 5,
  className 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Erro",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;

    try {
      // Extract path from URL
      const urlParts = previewUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const filePath = `${user.id}/${fileName}`;
        
        // Remove from storage
        await supabase.storage
          .from(bucket)
          .remove([filePath]);
      }

      setPreviewUrl(null);
      onImageRemoved?.();

      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a imagem",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={`upload-${bucket}`} className="text-sm font-medium">
        {label}
      </Label>
      
      <Card className="mt-2">
        <CardContent className="p-4">
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Clique para selecionar uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo {maxSize}MB • JPG, PNG, WebP
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${bucket}`}
            disabled={uploading}
          />
          
          {!previewUrl && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Imagem
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload;