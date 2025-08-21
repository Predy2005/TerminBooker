import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Code, Eye, Settings } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmbedGenerator() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    service: "none",
    lang: "cs",
    theme: "light",
    accent: "#3b82f6",
    width: "100%",
    height: "auto"
  });

  const { data: organization } = useQuery({
    queryKey: ["/api/org"],
    queryFn: () => apiRequest("GET", "/api/org")
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: () => apiRequest("GET", "/api/services")
  });

  const generateEmbedCode = () => {
    if (!(organization as any)?.slug) return "";

    const attributes = [
      `src="${window.location.origin}/embed.js"`,
      `data-org="${(organization as any).slug}"`,
      config.service && config.service !== "none" && `data-service="${config.service}"`,
      config.lang !== "cs" && `data-lang="${config.lang}"`,
      config.theme !== "light" && `data-theme="${config.theme}"`,
      config.accent !== "#3b82f6" && `data-accent="${config.accent}"`,
      config.width !== "100%" && `data-width="${config.width}"`,
      config.height !== "auto" && `data-height="${config.height}"`,
      `defer`
    ].filter(Boolean).join('\n  ');

    return `<script\n  ${attributes}\n></script>`;
  };

  const copyToClipboard = async () => {
    const code = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Kód zkopírován",
        description: "Embed kód byl zkopírován do schránky"
      });
    } catch (error) {
      toast({
        title: "Chyba při kopírování",
        description: "Kód se nepodařilo zkopírovat",
        variant: "destructive"
      });
    }
  };

  const previewUrl = (organization as any)?.slug 
    ? `${window.location.origin}/embed?org=${(organization as any).slug}${config.service && config.service !== "none" ? `&service=${config.service}` : ''}&lang=${config.lang}&theme=${config.theme}&accent=${encodeURIComponent(config.accent)}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Embed Widget
              </h1>
              <p className="text-slate-600 mt-1">
                Vygenerujte kód pro vložení rezervačního formuláře na vaše webové stránky
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="generator" className="space-y-6">
              <TabsList>
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Generátor kódu
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Náhled
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Finální kód
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Nastavení widgetu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="service">Předvybraná služba (volitelné)</Label>
                        <Select 
                          value={config.service} 
                          onValueChange={(value) => setConfig(prev => ({ ...prev, service: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Žádná - zákazník si vybere" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Žádná - zákazník si vybere</SelectItem>
                            {(services as any[]).map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} ({service.duration}min, {service.price}Kč)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="lang">Jazyk</Label>
                        <Select 
                          value={config.lang} 
                          onValueChange={(value) => setConfig(prev => ({ ...prev, lang: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cs">Čeština</SelectItem>
                            <SelectItem value="en">Angličtina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="theme">Barevné téma</Label>
                        <Select 
                          value={config.theme} 
                          onValueChange={(value) => setConfig(prev => ({ ...prev, theme: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Světlé</SelectItem>
                            <SelectItem value="dark">Tmavé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="accent">Barva zvýraznění</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.accent}
                            onChange={(e) => setConfig(prev => ({ ...prev, accent: e.target.value }))}
                            className="w-12 h-10 border rounded cursor-pointer"
                          />
                          <Input 
                            value={config.accent}
                            onChange={(e) => setConfig(prev => ({ ...prev, accent: e.target.value }))}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width">Šířka</Label>
                          <Input
                            value={config.width}
                            onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))}
                            placeholder="100%"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Výška</Label>
                          <Input
                            value={config.height}
                            onChange={(e) => setConfig(prev => ({ ...prev, height: e.target.value }))}
                            placeholder="auto"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informace</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Jak to funguje?</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Vložte vygenerovaný kód na vaše webové stránky</li>
                          <li>• Widget se automaticky přizpůsobí velikosti</li>
                          <li>• Podporuje platby přes Stripe</li>
                          <li>• Plně responsivní design</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-medium text-green-900 mb-2">Vaše URL adresa</h3>
                        <p className="text-sm text-green-800 font-mono break-all">
                          {(organization as any)?.slug ? `${window.location.origin}/booking/${(organization as any).slug}` : 'Načítám...'}
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h3 className="font-medium text-amber-900 mb-2">Bezpečnost</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• Widget běží v zabezpečeném iframe</li>
                          <li>• Platby se otevírají v nové záložce</li>
                          <li>• Žádné narušení vašich stránek</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Náhled widgetu</CardTitle>
                    <p className="text-sm text-slate-600">
                      Takto bude widget vypadat na vašich stránkách
                    </p>
                  </CardHeader>
                  <CardContent>
                    {previewUrl ? (
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={previewUrl}
                          style={{ 
                            width: config.width,
                            height: config.height === 'auto' ? '600px' : config.height,
                            border: 'none'
                          }}
                          sandbox="allow-forms allow-scripts allow-popups allow-top-navigation-by-user-activation allow-same-origin"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>Načítám náhled...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Vygenerovaný kód
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Kopírovat
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Zkopírujte tento kód a vložte ho na místo na vašich stránkách, kde chcete zobrazit rezervační formulář
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generateEmbedCode()}
                      readOnly
                      className="font-mono text-sm min-h-[150px]"
                      data-testid="embed-code"
                    />
                    
                    <div className="mt-4 space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Kam kód vložit?</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Do HTML kódu vaší stránky na místě, kde chcete formulář zobrazit</li>
                          <li>• Do WordPress pomocí "Custom HTML" bloku</li>
                          <li>• Do Shopify, Wix, Squarespace pomocí HTML/embed widgetu</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-medium text-green-900 mb-2">JavaScript události</h3>
                        <p className="text-sm text-green-800 mb-2">
                          Widget vysílá tyto události, které můžete zachytit:
                        </p>
                        <div className="font-mono text-xs bg-white p-2 rounded border">
                          <div>// Úspěšná rezervace</div>
                          <div>window.addEventListener('bookli:success', function(e) {"{"})</div>
                          <div className="ml-4">console.log('Booking created:', e.detail);</div>
                          <div>{"}"});</div>
                          <br />
                          <div>// Chyba rezervace</div>
                          <div>window.addEventListener('bookli:error', function(e) {"{"})</div>
                          <div className="ml-4">console.log('Booking error:', e.detail.message);</div>
                          <div>{"}"});</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}