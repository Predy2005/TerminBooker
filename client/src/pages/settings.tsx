import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save, Building2 } from "lucide-react";
import { organizationApi } from "@/lib/api";

const organizationSchema = z.object({
  name: z.string().min(1, "Název organizace je povinný"),
  slug: z.string().min(1, "URL adresa je povinná").regex(/^[a-z0-9-]+$/, "URL může obsahovat pouze malá písmena, číslice a pomlčky"),
  timezone: z.string().min(1, "Časové pásmo je povinné"),
  language: z.string().min(1, "Jazyk je povinný")
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organization, isLoading } = useQuery({
    queryKey: ["/api/org"],
    queryFn: organizationApi.get
  });

  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: "Europe/Prague",
      language: "cs"
    }
  });

  // Update form when organization data loads
  React.useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone || "Europe/Prague",
        language: organization.language || "cs"
      });
    }
  }, [organization, form]);

  const updateOrganization = useMutation({
    mutationFn: organizationApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org"] });
      toast({
        title: "Nastavení bylo uloženo",
        description: "Změny byly úspěšně uloženy."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při ukládání",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof organizationSchema>) => {
    updateOrganization.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <Building2 className="mr-3 h-6 w-6 text-slate-500" />
              <h1 className="text-2xl font-bold text-slate-900" data-testid="text-settings-title">
                Nastavení organizace
              </h1>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="p-6">
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Základní informace</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Název organizace</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Název vaší firmy" data-testid="input-org-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL adresa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="moje-firma" data-testid="input-org-slug" />
                          </FormControl>
                          <p className="text-sm text-slate-500">
                            Zákazníci budą navštěvovat: {window.location.origin}/booking/{field.value || "moje-firma"}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Časové pásmo</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-timezone">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Europe/Prague">Praha (UTC+1)</SelectItem>
                                <SelectItem value="Europe/Vienna">Vídeň (UTC+1)</SelectItem>
                                <SelectItem value="Europe/Berlin">Berlín (UTC+1)</SelectItem>
                                <SelectItem value="Europe/London">Londýn (UTC+0)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jazyk</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-language">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cs">Čeština</SelectItem>
                                <SelectItem value="sk">Slovenčina</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateOrganization.isPending} data-testid="button-save-settings">
                        <Save className="mr-2 h-4 w-4" />
                        {updateOrganization.isPending ? "Ukládám..." : "Uložit změny"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Test Login Info */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Testovací přístup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>E-mail:</strong> admin@salonkrasy.cz</p>
                  <p><strong>Heslo:</strong> admin123</p>
                  <p><strong>Booking URL:</strong> {window.location.origin}/booking/salon-krasy</p>
                  <p className="text-blue-600 mt-3">
                    Použijte tyto údaje pro přihlášení a testování rezervačního systému.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}