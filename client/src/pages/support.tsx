import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Calendar, ArrowLeft, Mail, MessageSquare, Phone, MapPin } from "lucide-react";

const supportSchema = z.object({
  name: z.string().min(1, "Jméno je povinné"),
  email: z.string().email("Neplatný e-mail"),
  organization: z.string().optional(),
  subject: z.string().min(1, "Předmět je povinný"),
  message: z.string().min(10, "Zpráva musí mít alespoň 10 znaků")
});

type SupportForm = z.infer<typeof supportSchema>;

export default function SupportPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      subject: "Technický dotaz",
      message: ""
    }
  });

  const onSubmit = async (data: SupportForm) => {
    try {
      // Zde by byla volba na backend API pro odeslání e-mailu
      console.log("Support form data:", data);
      
      // Simulace odeslání
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast({
        title: "Zpráva odeslána",
        description: "Děkujeme, ozveme se co nejdřív na uvedený e-mail."
      });
    } catch (error) {
      toast({
        title: "Chyba při odesílání",
        description: "Zkuste to prosím znovu nebo napište přímo na support@bookli.cz",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zpět na hlavní stránku
                </Link>
              </Button>
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">Bookli.cz</span>
              <span className="ml-4 text-slate-500">/</span>
              <span className="ml-4 text-slate-600">Podpora</span>
            </div>
            <Button asChild>
              <Link href="/app/auth/register">Začít zdarma</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Podpora</h1>
          <p className="text-xl text-slate-600">Potřebujete poradit nebo chybí funkce? Jsme tu pro vás</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {!isSubmitted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kontaktní formulář</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Jméno *</Label>
                        <Input
                          id="name"
                          placeholder="Vaše jméno"
                          {...form.register("name")}
                          data-testid="input-name"
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail *</Label>
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
                    </div>

                    <div>
                      <Label htmlFor="organization">Organizace/slug (volitelné)</Label>
                      <Input
                        id="organization"
                        placeholder="vas-nazev"
                        {...form.register("organization")}
                        data-testid="input-organization"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Předmět *</Label>
                      <Select onValueChange={(value) => form.setValue("subject", value)} defaultValue="Technický dotaz">
                        <SelectTrigger data-testid="select-subject">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technický dotaz">Technický dotaz</SelectItem>
                          <SelectItem value="Platby">Platby</SelectItem>
                          <SelectItem value="Fakturace">Fakturace</SelectItem>
                          <SelectItem value="Jiný">Jiný</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.subject && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Zpráva *</Label>
                      <Textarea
                        id="message"
                        placeholder="Popište váš dotaz nebo problém..."
                        rows={6}
                        {...form.register("message")}
                        data-testid="textarea-message"
                      />
                      {form.formState.errors.message && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-submit"
                    >
                      {form.formState.isSubmitting ? "Odesílám..." : "Odeslat zprávu"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Zpráva byla odeslána</h3>
                  <p className="text-slate-600 mb-6">
                    Děkujeme za váš dotaz. Ozveme se vám co nejdříve na uvedený e-mail.
                  </p>
                  <Button asChild>
                    <Link href="/">Zpět na hlavní stránku</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  E-mailová podpora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-3">
                  Pro rychlou odpověď napište přímo na:
                </p>
                <a 
                  href="mailto:support@bookli.cz" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@bookli.cz
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumentace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-3">
                  Možná najdete odpověď v naší dokumentaci:
                </p>
                <Button variant="outline" asChild className="w-full mb-3">
                  <Link href="/docs">Zobrazit dokumentaci</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/#faq">FAQ - Často kladené dotazy</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doba odezvy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pracovní dny:</span>
                    <span className="font-medium">do 24 hodin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Víkendy:</span>
                    <span className="font-medium">do 48 hodin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">BUSINESS plán:</span>
                    <span className="font-medium text-green-600">přednostně</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}