import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(1, "Heslo je povinné"),
  remember: z.boolean().optional()
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false
    }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync({
        email: data.email,
        password: data.password
      });
      
      toast({
        title: "Úspěšné přihlášení",
        description: "Vítejte zpět!"
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Chyba při přihlašování",
        description: error.message || "Neplatné přihlašovací údaje",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Rezervační systém</h1>
          <p className="mt-2 text-slate-600">Přihlaste se ke svému účtu</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Přihlášení</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email">E-mail</Label>
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
              </div>
              
              <div>
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    {...form.register("remember")}
                    data-testid="checkbox-remember"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600">
                    Zapamatovat si mě
                  </Label>
                </div>
                <Link href="/forgot-password">
                  <Button variant="link" className="text-sm p-0">
                    Zapomenuté heslo?
                  </Button>
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={login.isPending}
                data-testid="button-login"
              >
                {login.isPending ? "Přihlašuji..." : "Přihlásit se"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Nemáte účet?{" "}
                <Link href="/register">
                  <Button variant="link" className="p-0 font-medium">
                    Zaregistrujte se
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
