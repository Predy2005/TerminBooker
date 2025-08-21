import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Calendar, ArrowLeft, Mail, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
  email: z.string().email("Neplatný e-mail")
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const forgotPassword = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "E-mail odeslán",
        description: "Zkontrolujte svou poštu pro odkaz k resetování hesla"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při odesílání",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPassword.mutate(data);
  };

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
            {isEmailSent ? "E-mail odeslán" : "Zapomenuté heslo"}
          </h1>
          <p className="text-slate-600 mt-2">
            {isEmailSent 
              ? "Zkontrolujte svou e-mailovou schránku" 
              : "Zadejte svůj e-mail pro resetování hesla"
            }
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            {isEmailSent ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {!isEmailSent ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email">E-mailová adresa</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vas@email.cz"
                    {...form.register("email")}
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-2">
                    Pošleme vám odkaz pro vytvoření nového hesla
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={forgotPassword.isPending}
                  data-testid="button-submit"
                >
                  {forgotPassword.isPending ? "Odesílám..." : "Odeslat odkaz"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-slate-600">
                    Poslali jsme vám e-mail s odkazem k resetování hesla na adresu:
                  </p>
                  <p className="font-medium text-slate-900">{form.getValues("email")}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Co dělat dál?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>1. Zkontrolujte svou e-mailovou schránku</li>
                    <li>2. Pokud e-mail nevidíte, podívejte se do spamu</li>
                    <li>3. Klikněte na odkaz v e-mailu</li>
                    <li>4. Zadejte nové heslo</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEmailSent(false);
                      form.reset();
                    }}
                    data-testid="button-resend"
                  >
                    Odeslat znovu
                  </Button>
                  
                  <Button variant="ghost" asChild>
                    <Link href="/app/auth/login">
                      Zpět na přihlášení
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!isEmailSent && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Vzpomněli jste si heslo?{" "}
                  <Link href="/app/auth/login">
                    <Button variant="link" className="p-0 font-medium">
                      Přihlásit se
                    </Button>
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}