import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCPFValidation } from "@/hooks/useCPFValidation";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Mail, CheckCircle, AlertTriangle } from "lucide-react";

interface UnifiedRegistrationFormProps {
  type: 'full' | 'newsletter';
  onSuccess?: () => void;
  className?: string;
}

interface ExistingUserData {
  hasNewsletter: boolean;
  hasProfile: boolean;
  profileData?: any;
  newsletterData?: any;
}

export const UnifiedRegistrationForm = ({ 
  type, 
  onSuccess, 
  className = "" 
}: UnifiedRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
    newsletterSubscribe: true
  });

  const [existingData, setExistingData] = useState<ExistingUserData | null>(null);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'evolution' | 'complete'>('initial');

  const { validateCPF, formatCPF, formatPhone, validateField, errors, setFieldError } = useCPFValidation();
  const { toast } = useToast();
  const { user } = useAuth();

  const checkExistingUser = async (email: string) => {
    if (!email) return;

    try {
      const [newsletterResult, profileResult] = await Promise.all([
        supabase
          .from('newsletter_subscribers')
          .select('*')
          .eq('email', email.toLowerCase())
          .single(),
        supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase())
          .single()
      ]);

      const existingUserData: ExistingUserData = {
        hasNewsletter: !!newsletterResult.data,
        hasProfile: !!profileResult.data,
        newsletterData: newsletterResult.data,
        profileData: profileResult.data
      };

      setExistingData(existingUserData);

      // Se tem newsletter mas não tem perfil completo, mostrar formulário de evolução
      if (existingUserData.hasNewsletter && !existingUserData.hasProfile && type === 'full') {
        setShowEvolutionForm(true);
        setFormData(prev => ({
          ...prev,
          name: existingUserData.newsletterData?.name || '',
          email: email
        }));
      }

    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && validateField('email', formData.email)) {
      checkExistingUser(formData.email);
    }
  };

  const handleNewsletterSubmit = async () => {
    if (!formData.email || !formData.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e email.",
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
        .eq('email', formData.email.toLowerCase())
        .single();

      if (existing?.active) {
        toast({
          title: "Já inscrito",
          description: "Este email já está inscrito na nossa newsletter.",
        });
        setStep('complete');
        return;
      }

      if (existing && !existing.active) {
        // Reativar
        await supabase
          .from('newsletter_subscribers')
          .update({ 
            active: true, 
            name: formData.name,
            subscribed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('newsletter_subscribers')
          .insert({
            email: formData.email.toLowerCase(),
            name: formData.name,
            source: 'unified_form',
            origin: 'website'
          });
      }

      toast({
        title: "Newsletter",
        description: "Inscrição na newsletter realizada com sucesso!",
      });

      setStep('complete');
      onSuccess?.();

    } catch (error) {
      console.error('Erro ao inscrever newsletter:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar inscrição na newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullRegistration = async () => {
    // Validações
    const requiredFields = ['email', 'name', 'cpf', 'password'];
    let hasError = false;

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        setFieldError(field, error);
        hasError = true;
      }
    });

    if (formData.password !== formData.confirmPassword) {
      setFieldError('confirmPassword', 'Senhas não coincidem');
      hasError = true;
    }

    if (formData.password.length < 6) {
      setFieldError('password', 'Senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name
          }
        }
      });

      if (authError) throw authError;

      // 2. Se existe newsletter, evoluir para perfil completo
      if (existingData?.hasNewsletter) {
        await supabase.rpc('evolve_newsletter_to_profile', {
          user_email: formData.email,
          user_cpf: formData.cpf.replace(/\D/g, ''),
          full_name: formData.name,
          phone: formData.phone || null
        });
      }

      toast({
        title: "Cadastro realizado!",
        description: "Conta criada com sucesso. Verifique seu email para confirmar.",
      });

      setStep('complete');
      onSuccess?.();

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[field]) {
      setFieldError(field, null);
    }
  };

  if (step === 'complete') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">
                {type === 'newsletter' ? 'Newsletter' : 'Cadastro'} realizado com sucesso!
              </h3>
              <p className="text-muted-foreground">
                {type === 'newsletter' 
                  ? 'Você foi inscrito(a) na nossa newsletter.'
                  : 'Verifique seu email para confirmar a conta.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {type === 'newsletter' ? <Mail className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          <span>
            {type === 'newsletter' ? 'Inscrever-se na Newsletter' : 'Criar Conta'}
          </span>
        </CardTitle>
        <CardDescription>
          {showEvolutionForm ? (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Encontramos seus dados na newsletter. Complete seu cadastro:</span>
            </div>
          ) : (
            type === 'newsletter' 
              ? 'Receba novidades e oportunidades exclusivas.'
              : 'Preencha os dados para criar sua conta.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={handleEmailBlur}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Campos adicionais para cadastro completo */}
        {type === 'full' && (
          <>
            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </>
        )}

        {/* Newsletter checkbox para cadastro completo */}
        {type === 'full' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletterSubscribe}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, newsletterSubscribe: checked as boolean }))
              }
            />
            <Label htmlFor="newsletter" className="text-sm">
              Quero receber a newsletter com novidades e oportunidades
            </Label>
          </div>
        )}

        {/* Botão de envio */}
        <Button 
          onClick={type === 'newsletter' ? handleNewsletterSubmit : handleFullRegistration}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Processando...' : (
            type === 'newsletter' ? 'Inscrever-se' : 'Criar Conta'
          )}
        </Button>

        {/* Texto legal */}
        <p className="text-xs text-muted-foreground text-center">
          Ao {type === 'newsletter' ? 'se inscrever' : 'criar uma conta'}, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </CardContent>
    </Card>
  );
};