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
import { Save, Building2, Upload, Palette, Shield, CreditCard, CheckCircle, XCircle, Loader2, Cog, Edit } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { organizationApi } from "@/lib/api";

const organizationSchema = z.object({
  name: z.string().min(1, "Název organizace je povinný"),
  slug: z.string().min(1, "URL adresa je povinná").regex(/^[a-z0-9-]+$/, "URL může obsahovat pouze malá písmena, číslice a pomlčky"),
  timezone: z.string().min(1, "Časové pásmo je povinné"),
  language: z.string().min(1, "Jazyk je povinný"),
  // Business verification fields
  businessIco: z.string().optional(),
  businessDic: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessZip: z.string().optional(),
  businessCountry: z.string().optional(),
  businessPhone: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankCode: z.string().optional(),
  // Visual customization
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional()
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

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
      language: "cs",
      businessCountry: "CZ",
      primaryColor: "#0f172a",
      secondaryColor: "#64748b", 
      accentColor: "#3b82f6"
    }
  });

  // Update form when organization data loads
  React.useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone || "Europe/Prague",
        language: organization.language || "cs",
        businessIco: organization.businessIco || "",
        businessDic: organization.businessDic || "",
        businessAddress: organization.businessAddress || "",
        businessCity: organization.businessCity || "",
        businessZip: organization.businessZip || "",
        businessCountry: organization.businessCountry || "CZ",
        businessPhone: organization.businessPhone || "",
        bankAccountNumber: organization.bankAccountNumber || "",
        bankCode: organization.bankCode || "",
        primaryColor: organization.primaryColor || "#0f172a",
        secondaryColor: organization.secondaryColor || "#64748b",
        accentColor: organization.accentColor || "#3b82f6"
      });
      setLogoUrl(organization.logoUrl || "");
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

  // Logo upload handlers
  const handleGetUploadParameters = async () => {
    const response: any = await apiRequest("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleLogoUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const logoURL = uploadedFile.uploadURL;
      
      try {
        // Update logo on server
        const response: any = await apiRequest("PUT", "/api/logo", { logoURL });
        setLogoUrl(response.logoUrl);
        
        // Invalidate organization query to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/org"] });
        
        toast({
          title: "Logo nahráno",
          description: "Logo bylo úspěšně nahráno a uloženo."
        });
      } catch (error: any) {
        toast({
          title: "Chyba při ukládání loga",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  React.useEffect(() => {
    if (organization?.logoUrl) {
      setLogoUrl(organization.logoUrl);
    }
  }, [organization]);

  // Auto-generate slug when name changes
  const handleNameChange = async (name: string) => {
    if (name && name.trim().length > 0) {
      try {
        const response: any = await apiRequest("POST", "/api/org/generate-slug", { name: name.trim() });
        if (response.slug) {
          form.setValue("slug", response.slug);
          await checkSlugAvailability(response.slug);
        }
      } catch (error) {
        console.error("Error generating slug:", error);
      }
    }
  };

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    setSlugChecking(true);
    try {
      const response: any = await apiRequest("GET", `/api/org/check-slug/${slug}`);
      setSlugAvailable(response.available);
    } catch (error) {
      setSlugAvailable(false);
    } finally {
      setSlugChecking(false);
    }
  };

  // Debounced slug check
  React.useEffect(() => {
    const slug = form.watch("slug");
    if (slug) {
      const timer = setTimeout(() => {
        checkSlugAvailability(slug);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSlugAvailable(null);
    }
  }, [form.watch("slug")]);

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
                            <Input 
                              {...field} 
                              placeholder="Název vaší firmy" 
                              data-testid="input-org-name"
                              onChange={(e) => {
                                field.onChange(e);
                                handleNameChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <p className="text-sm text-slate-500">
                            URL adresa se automaticky vygeneruje z názvu organizace
                          </p>
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
                            <div className="relative">
                              <Input 
                                {...field} 
                                placeholder="moje-firma" 
                                data-testid="input-org-slug"
                                className={`pr-10 ${
                                  slugAvailable === false ? 'border-red-500 focus:ring-red-500' : 
                                  slugAvailable === true ? 'border-green-500 focus:ring-green-500' : ''
                                }`}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {slugChecking ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                ) : slugAvailable === true ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : slugAvailable === false ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : null}
                              </div>
                            </div>
                          </FormControl>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-500">
                              Zákazníci budou navštěvovat: {window.location.origin}/booking/{field.value || "moje-firma"}
                            </p>
                            {slugAvailable === false && (
                              <p className="text-sm text-red-600">
                                Tato URL adresa je již používána
                              </p>
                            )}
                            {slugAvailable === true && (
                              <p className="text-sm text-green-600">
                                URL adresa je dostupná
                              </p>
                            )}
                          </div>
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

            {/* Logo Upload Section - PRO/BUSINESS Only */}
            <Card className="mt-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Upload className="h-5 w-5" />
                  Logo organizace
                  <span className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                    PRO
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization?.plan === 'PRO' || organization?.plan === 'BUSINESS' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-purple-700">
                      Nahrajte logo které se zobrazí na rezervačních formulářích a fakturách.
                    </p>
                    
                    {logoUrl && (
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-purple-200">
                        <img 
                          src={logoUrl.startsWith('/objects/') ? `/api${logoUrl}` : logoUrl} 
                          alt="Logo organizace" 
                          className="w-16 h-16 object-contain bg-white rounded border" 
                        />
                        <div className="text-sm text-purple-700">
                          <p>Aktuální logo</p>
                          <p className="text-xs text-purple-500">Nahráno</p>
                        </div>
                      </div>
                    )}
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880} // 5MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleLogoUploadComplete}
                      buttonClassName="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {logoUrl ? "Změnit logo" : "Nahrát logo"}
                      </div>
                    </ObjectUploader>
                    <p className="text-sm text-purple-600">
                      Podporované formáty: PNG, JPG, SVG. Maximální velikost: 5MB.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Vlastní logo</h3>
                    <p className="text-purple-600 mb-4">
                      Nahrajte své logo pro zobrazení na rezervačních formulářích a fakturách. Funkce je dostupná pouze pro PRO a BUSINESS předplatitele.
                    </p>
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      Upgradovat na PRO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Verification Section */}
            <Card className="mt-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Shield className="h-5 w-5" />
                  Ověření podnikatelských údajů
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-6">
                    <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium mb-2">
                        Proč potřebujeme tyto údaje?
                      </p>
                      <p className="text-sm text-orange-700">
                        Pro prevenci podvodných prodejů požadujeme ověření všech obchodních údajů. 
                        Tyto informace budou automaticky použity při vytváření Stripe platební brány a nebudou sdíleny s třetími stranami.
                      </p>
                      <p className="text-sm text-orange-700 mt-2">
                        <strong>Důležité:</strong> Vyplňte tyto údaje před nastavením platební brány ve Stripe Connect.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessIco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IČO</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345678" data-testid="input-business-ico" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessDic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DIČ</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CZ12345678" data-testid="input-business-dic" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+420 123 456 789" data-testid="input-business-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Země</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value} data-testid="select-business-country">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CZ">Česká republika</SelectItem>
                                  <SelectItem value="SK">Slovensko</SelectItem>
                                  <SelectItem value="AT">Rakousko</SelectItem>
                                  <SelectItem value="DE">Německo</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Wenceslas Square 1" data-testid="input-business-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Město</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Praha" data-testid="input-business-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PSČ</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="110 00" data-testid="input-business-zip" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Bank Account Section */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <CreditCard className="h-5 w-5" />
                  Bankovní údaje pro ověření
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-6">
                    <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        Bankovní účet pro anti-fraud ověření
                      </p>
                      <p className="text-sm text-blue-700">
                        Bankovní údaje používáme pouze pro ověření totožnosti a prevenci podvodů. 
                        Nebudeme z tohoto účtu nic strhávat ani na něj posílat.
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        <strong>Poznámka:</strong> Tyto údaje pomohou urychlit nastavení Stripe platební brány.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Číslo účtu</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123456789/0100" data-testid="input-bank-account" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kód banky</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value} data-testid="select-bank-code">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0100">Komerční banka (0100)</SelectItem>
                                  <SelectItem value="0300">Československá obchodní banka (0300)</SelectItem>
                                  <SelectItem value="0600">GE Money Bank (0600)</SelectItem>
                                  <SelectItem value="2010">Fio banka (2010)</SelectItem>
                                  <SelectItem value="2700">UniCredit Bank (2700)</SelectItem>
                                  <SelectItem value="5500">Raiffeisenbank (5500)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Form Editor Section - PRO only */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Edit className="h-5 w-5" />
                  Editor rezervačního formuláře
                  <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    PRO
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization?.plan === 'PRO' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-blue-700">
                      Přizpůsobte si layout a pole vašeho rezervačního formuláře podle vašich potřeb.
                    </p>
                    
                    <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">Drag & Drop Editor</p>
                        <p className="text-sm text-blue-700">
                          Přesouvejte kroky, upravujte pole a vytvářejte vlastní presety formuláře
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => window.location.href = "/app/form-editor"}
                      >
                        <Cog className="w-4 h-4 mr-2" />
                        Upravit formulář
                      </Button>
                    </div>
                    
                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                      <strong>Možnosti úprav:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Přesouvání kroků (služba → datum → čas → kontakty)</li>
                        <li>Přidávání a úprava polí formuláře</li>
                        <li>Nastavení povinných polí a validace</li>
                        <li>Uložení vlastních presetů</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Edit className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Editor rezervačního formuláře
                    </h3>
                    <p className="text-blue-600 mb-4">
                      Přizpůsobte si layout formuláře pomocí drag & drop editoru. Dostupné pouze v PRO plánu.
                    </p>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Upgradovat na PRO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Customization Section - PRO only */}
            <Card className="mt-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Palette className="h-5 w-5" />
                  Přizpůsobení barev
                  <span className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                    PRO
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization?.plan === 'pro' ? (
                  <Form {...form}>
                    <div className="space-y-6">
                      <p className="text-sm text-purple-700">
                        Přizpůsobte barvy pro vaši rezervační stránku podle vašeho brandingu.
                      </p>

                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hlavní barva</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={field.value || "#0f172a"}
                                    onChange={field.onChange}
                                    className="w-12 h-10 border rounded cursor-pointer"
                                    data-testid="input-primary-color"
                                  />
                                  <Input 
                                    {...field} 
                                    placeholder="#0f172a"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Druhá barva</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={field.value || "#64748b"}
                                    onChange={field.onChange}
                                    className="w-12 h-10 border rounded cursor-pointer"
                                    data-testid="input-secondary-color"
                                  />
                                  <Input 
                                    {...field} 
                                    placeholder="#64748b"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Akcentová barva</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={field.value || "#3b82f6"}
                                    onChange={field.onChange}
                                    className="w-12 h-10 border rounded cursor-pointer"
                                    data-testid="input-accent-color"
                                  />
                                  <Input 
                                    {...field} 
                                    placeholder="#3b82f6"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Form>
                ) : (
                  <div className="text-center py-8">
                    <Palette className="mx-auto h-12 w-12 text-purple-300 mb-4" />
                    <h3 className="text-lg font-medium text-purple-800 mb-2">
                      Přizpůsobení barev
                    </h3>
                    <p className="text-purple-600 mb-4">
                      Tato funkce je dostupná pouze pro PRO předplatitele.
                    </p>
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      Upgradovat na PRO
                    </Button>
                  </div>
                )}
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