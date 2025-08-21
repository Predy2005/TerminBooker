import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Calendar, ArrowLeft, Lock, Check, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  // Extrahuj token z URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    setToken(tokenParam);
    
    // Ověř platnost tokenu
    if (tokenParam) {
      validateToken(tokenParam);
    } else {
      setIsValidToken(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      await apiRequest("POST", "/api/auth/validate-reset-token", { token });
      setIsValidToken(true);
    } catch (error) {
      setIsValidToken(false);
      toast({
        title: "Neplatný odkaz",
        description: "Odkaz pro resetování hesla je neplatný nebo expiroval",
        variant: "destructive"
      });
    }
  };

  const resetPassword = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Heslo změněno",
        description: "Vaše heslo bylo úspěšně změněno"
      });
      // Přesměruj na login po 3 sekundách
      setTimeout(() => {
        setLocation("/app/auth/login");
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při změně hesla",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetPassword.mutate(data);
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na hlavní stránku
            </Link>
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-slate-900">Bookli.cz</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Neplatný odkaz</h1>
          </div>

          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                Odkaz pro resetování hesla je neplatný nebo expiroval.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/app/auth/forgot-password">
                    Požádat o nový odkaz
                  </Link>
                </Button>
                
                <Button variant="ghost" asChild>
                  <Link href="/app/auth/login">
                    Zpět na přihlášení
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na hlavní stránku
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-slate-900">Bookli.cz</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSuccess ? "Heslo změněno" : "Nové heslo"}
          </h1>
          <p className="text-slate-600 mt-2">
            {isSuccess 
              ? "Vaše heslo bylo úspěšně změněno" 
              : "Zadejte své nové heslo"
            }
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            {isSuccess ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="password">Nové heslo</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Zadejte nové heslo"
                    {...form.register("password")}
                    data-testid="input-password"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Zadejte heslo znovu"
                    {...form.register("confirmPassword")}
                    data-testid="input-confirm-password"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={resetPassword.isPending}
                  data-testid="button-submit"
                >
                  {resetPassword.isPending ? "Měním heslo..." : "Změnit heslo"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-slate-600">
                  Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Automaticky vás přesměrujeme na přihlášení za 3 sekundy...
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/app/auth/login">
                    Přihlásit se nyní
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}