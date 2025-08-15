import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Check } from "lucide-react";

interface NewsletterSubscriptionProps {
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

export const NewsletterSubscription = ({ 
  title = "Inscreva-se na nossa Newsletter",
  description = "Receba novidades, dicas e oportunidades exclusivas para empreendedoras.",
  compact = false,
  className = ""
}: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, active')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        if (existing.active) {
          toast({
            title: "Já inscrito",
            description: "Este email já está inscrito na nossa newsletter.",
            variant: "default",
          });
          setIsSuccess(true);
          return;
        } else {
          // Reativar inscrição
          const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ 
              active: true, 
              name: name,
              subscribed_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) throw error;
        }
      } else {
        // Nova inscrição
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: email.toLowerCase(),
            name: name,
            source: 'website_subscription',
            origin: 'website'
          });

        if (error) throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito(a) com sucesso na nossa newsletter.",
      });

      // Limpar formulário após 3 segundos
      setTimeout(() => {
        setEmail("");
        setName("");
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Erro ao inscrever na newsletter:', error);
      toast({
        title: "Erro na inscrição",
        description: "Ocorreu um erro ao processar sua inscrição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {isSuccess ? (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Inscrição realizada com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                "Inscrevendo..."
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Inscrever-se
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSuccess ? (
          <div className="flex items-center justify-center space-x-2 text-green-600 py-8">
            <Check className="w-6 h-6" />
            <div className="text-center">
              <p className="font-medium">Inscrição realizada com sucesso!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Verifique seu email para confirmar a inscrição.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-name">Nome completo</Label>
              <Input
                id="newsletter-name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newsletter-email">Email</Label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                "Inscrevendo..."
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Inscrever-se na Newsletter
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Ao se inscrever, você concorda em receber emails com novidades, 
              dicas e oportunidades. Você pode cancelar a qualquer momento.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
};