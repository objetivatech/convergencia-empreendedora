import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, KeyRound, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Turnstile from "react-turnstile";

// Detectar ambiente e usar chave apropriada
// ATENÇÃO: Para produção, você precisa configurar a chave real do Turnstile
// Obtenha sua chave em: https://developers.cloudflare.com/turnstile/
const isProduction = window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1");
// Use a chave real do seu domínio mulheresemconvergencia.com.br
const TURNSTILE_SITE_KEY = isProduction ? "0x4AAAAAABsq-CKjZDmfk-F7" : "0x4AAAAAABaZhkau8iAe2i5DR84rmmRoVQQ";

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const [allowWithoutCaptcha, setAllowWithoutCaptcha] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
    setError("");
    setTurnstileLoaded(false);
    setTurnstileFailed(false);
    setAllowWithoutCaptcha(false);
  }, [activeTab]);

  // Timeout para detectar falha do Turnstile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!turnstileLoaded && !captchaToken) {
        setTurnstileFailed(true);
        setAllowWithoutCaptcha(true);
      }
    }, 10000); // 10 segundos para timeout

    return () => clearTimeout(timer);
  }, [turnstileLoaded, captchaToken, captchaKey]);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    newsletterSubscribed: true
  });

  const [recoveryForm, setRecoveryForm] = useState({
    email: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!captchaToken && !allowWithoutCaptcha) {
        setError("Por favor, complete o CAPTCHA ou aguarde...");
        return;
      }

      const signInOptions: any = {
        email: loginForm.email,
        password: loginForm.password,
      };

      // Só incluir captchaToken se estiver disponível
      if (captchaToken) {
        signInOptions.options = { captchaToken: captchaToken };
      }

      const { data, error } = await supabase.auth.signInWithPassword(signInOptions);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login");
        } else if (error.message.includes("captcha")) {
          setError("Falha na verificação do CAPTCHA. Tente novamente.");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      if (!captchaToken && !allowWithoutCaptcha) {
        setError("Por favor, complete o CAPTCHA ou aguarde...");
        return;
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const signUpOptions: any = {
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupForm.fullName,
            phone: signupForm.phone,
            newsletter_subscribed: signupForm.newsletterSubscribed
          }
        }
      };

      // Só incluir captchaToken se estiver disponível
      if (captchaToken) {
        signUpOptions.options.captchaToken = captchaToken;
      }
      
      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else if (error.message.includes("captcha")) {
          setError("Falha na verificação do CAPTCHA. Tente novamente.");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user && !data.session) {
        toast.success("Cadastro realizado! Verifique seu email para confirmar a conta.");
      } else if (data.session) {
        toast.success("Cadastro realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!captchaToken && !allowWithoutCaptcha) {
        setError("Por favor, complete o CAPTCHA ou aguarde...");
        return;
      }

      const resetOptions: any = {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      };

      // Só incluir captchaToken se estiver disponível
      if (captchaToken) {
        resetOptions.captchaToken = captchaToken;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(recoveryForm.email, resetOptions);

      if (error) {
        setError(error.message);
        return;
      }

      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setRecoveryForm({ email: "" });
    } catch (error) {
      console.error("Error in password recovery:", error);
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Entre na Comunidade
            </h1>
            <p className="text-muted-foreground">
              Acesse sua conta ou crie uma nova
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              <TabsTrigger value="recovery">Recuperar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Entrar na Conta
                  </CardTitle>
                  <CardDescription>
                    Entre com seu email e senha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, password: e.target.value })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-2">
                      {turnstileFailed ? (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            O sistema de verificação não carregou. Você pode prosseguir com o login.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <Turnstile
                            key={captchaKey}
                            sitekey={TURNSTILE_SITE_KEY}
                            onVerify={(token) => {
                              setCaptchaToken(token);
                              setTurnstileLoaded(true);
                            }}
                            onExpire={() => setCaptchaKey((k) => k + 1)}
                            onError={() => {
                              setTurnstileFailed(true);
                              setAllowWithoutCaptcha(true);
                            }}
                            theme="auto"
                          />
                          {!turnstileLoaded && !turnstileFailed && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Carregando verificação de segurança...
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || (!captchaToken && !allowWithoutCaptcha)}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="link" 
                      className="text-sm text-muted-foreground hover:text-primary p-0"
                      onClick={() => setActiveTab("recovery")}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Criar Conta
                  </CardTitle>
                  <CardDescription>
                    Crie sua conta para acessar todos os recursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={signupForm.fullName}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, fullName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupForm.email}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Telefone (opcional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={signupForm.phone}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, password: e.target.value })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={signupForm.confirmPassword}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={signupForm.newsletterSubscribed}
                        onCheckedChange={(checked) =>
                          setSignupForm({ ...signupForm, newsletterSubscribed: checked as boolean })
                        }
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Quero receber novidades e atualizações por email
                      </Label>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-2">
                      {turnstileFailed ? (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            O sistema de verificação não carregou. Você pode prosseguir com o cadastro.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <Turnstile
                            key={captchaKey}
                            sitekey={TURNSTILE_SITE_KEY}
                            onVerify={(token) => {
                              setCaptchaToken(token);
                              setTurnstileLoaded(true);
                            }}
                            onExpire={() => setCaptchaKey((k) => k + 1)}
                            onError={() => {
                              setTurnstileFailed(true);
                              setAllowWithoutCaptcha(true);
                            }}
                            theme="auto"
                          />
                          {!turnstileLoaded && !turnstileFailed && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Carregando verificação de segurança...
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || (!captchaToken && !allowWithoutCaptcha)}>
                      {loading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recovery">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Recuperar Senha
                  </CardTitle>
                  <CardDescription>
                    Digite seu email para receber as instruções de recuperação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordRecovery} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-email">Email</Label>
                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={recoveryForm.email}
                        onChange={(e) =>
                          setRecoveryForm({ ...recoveryForm, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-2">
                      {turnstileFailed ? (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            O sistema de verificação não carregou. Você pode prosseguir com a recuperação.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <Turnstile
                            key={captchaKey}
                            sitekey={TURNSTILE_SITE_KEY}
                            onVerify={(token) => {
                              setCaptchaToken(token);
                              setTurnstileLoaded(true);
                            }}
                            onExpire={() => setCaptchaKey((k) => k + 1)}
                            onError={() => {
                              setTurnstileFailed(true);
                              setAllowWithoutCaptcha(true);
                            }}
                            theme="auto"
                          />
                          {!turnstileLoaded && !turnstileFailed && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Carregando verificação de segurança...
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || (!captchaToken && !allowWithoutCaptcha)}>
                      {loading ? "Enviando..." : "Enviar Email de Recuperação"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}