import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegister } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  organizationName: z.string().min(2, "Název organizace musí mít alespoň 2 znaky"),
  slug: z.string().min(2, "URL adresa musí mít alespoň 2 znaky").regex(/^[a-z0-9-]+$/, "URL adresa může obsahovat pouze malá písmena, číslice a pomlčky"),
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  timezone: z.string(),
  language: z.string(),
  terms: z.boolean().refine(val => val, "Musíte souhlasit s podmínkami použití")
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      slug: "",
      email: "",
      password: "",
      timezone: "Europe/Prague",
      language: "cs-CZ",
      terms: false
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register.mutateAsync({
        organizationName: data.organizationName,
        slug: data.slug,
        email: data.email,
        password: data.password,
        timezone: data.timezone,
        language: data.language
      });
      
      toast({
        title: "Úspěšná registrace",
        description: "Váš účet byl vytvořen. Vítejte!"
      });
      
      setLocation("/app");
    } catch (error: any) {
      toast({
        title: "Chyba při registraci",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Rezervační systém</h1>
          <p className="mt-2 text-slate-600">Vytvořte si nový účet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrace</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="organizationName">Název organizace</Label>
                <Input
                  id="organizationName"
                  placeholder="Název vaší firmy"
                  {...form.register("organizationName")}
                  data-testid="input-organizationName"
                />
                {form.formState.errors.organizationName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.organizationName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="slug">URL adresa (slug)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                    rezervace.cz/
                  </span>
                  <Input
                    id="slug"
                    placeholder="vas-nazev"
                    className="rounded-l-none"
                    {...form.register("slug")}
                    data-testid="input-slug"
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
              
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Časové pásmo</Label>
                  <Select onValueChange={(value) => form.setValue("timezone", value)} defaultValue="Europe/Prague">
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Prague">Praha (UTC+1)</SelectItem>
                      <SelectItem value="Europe/Vienna">Vídeň (UTC+1)</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlín (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Jazyk</Label>
                  <Select onValueChange={(value) => form.setValue("language", value)} defaultValue="cs-CZ">
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs-CZ">Čeština</SelectItem>
                      <SelectItem value="sk-SK">Slovenčina</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  {...form.register("terms")}
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm text-slate-600">
                  Souhlasím s{" "}
                  <Link href="/terms">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      podmínkami použití
                    </Button>
                  </Link>
                </Label>
              </div>
              {form.formState.errors.terms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.terms.message}
                </p>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={register.isPending}
                data-testid="button-register"
              >
                {register.isPending ? "Vytvářím účet..." : "Vytvořit účet"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Již máte účet?{" "}
                <Link href="/app/auth/login">
                  <Button variant="link" className="p-0 font-medium">
                    Přihlaste se
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
