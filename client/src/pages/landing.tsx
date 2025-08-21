import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Shield, 
  Check, 
  ChevronRight,
  Users,
  Scissors,
  Camera,
  Stethoscope,
  MessageSquare,
  CreditCard,
  Download,
  Globe,
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">Bookli.cz</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#funkce" className="text-slate-600 hover:text-slate-900">Funkce</a>
              <a href="#cenik" className="text-slate-600 hover:text-slate-900">Ceník</a>
              <Link href="/docs" className="text-slate-600 hover:text-slate-900">Dokumentace</Link>
              <Link href="/app/auth/login" className="text-slate-600 hover:text-slate-900">Přihlásit se</Link>
              <Button asChild>
                <Link href="/app/auth/register">Vyzkoušet zdarma</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Jednoduchý online rezervační kalendář pro malé provozy
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Zveřejni volné termíny, přijímej rezervace a měj vše přehledně na jednom místě. 
                CZ lokalizace, e‑maily, export do CSV.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/app/auth/register">
                    Vyzkoušet zdarma
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                  <Link href="/demo-salon">Ukázka (demo)</Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Bez závazku
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Běží v cloudu
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Odesílá potvrzovací e‑maily
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Dashboard přehled</h3>
                  <Badge variant="secondary">DEMO</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Střih vlasů</span>
                    </div>
                    <span className="text-sm text-slate-600">60 min • 800 Kč</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">3 rezervace dnes</span>
                    </div>
                    <span className="text-sm text-slate-600">9:00, 14:00, 16:30</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-slate-600 mr-2" />
                      <span className="text-sm font-medium">E-maily odeslány</span>
                    </div>
                    <span className="text-sm text-slate-600">Potvrzení ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro koho je */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pro koho je tento nástroj</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { icon: Users, title: "Trenéři a lektoři", description: "individuální i skupinové termíny" },
              { icon: Scissors, title: "Kadeřníci a kosmetika", description: "rychlé objednání na konkrétní čas" },
              { icon: Camera, title: "Fotografové a malé ateliéry", description: "správa fotografických služeb" },
              { icon: Stethoscope, title: "Malé kliniky a ordinace", description: "zdravotní služby a konzultace" },
              { icon: MessageSquare, title: "Konzultanti a poradci", description: "odborné poradenství" }
            ].map((item, index) => (
              <Card key={index} className="text-center border-2 hover:border-blue-200 transition-colors">
                <CardContent className="pt-6">
                  <item.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hodnota a benefity */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Méně telefonátů, více času na práci</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: "Jasné volné termíny",
                description: "Zákazník si sám vybere čas, tobě přijde potvrzení."
              },
              {
                icon: Clock,
                title: "Jednoduchá správa", 
                description: "Přehled dne/týdne, filtry, exporty."
              },
              {
                icon: Mail,
                title: "CZ e‑maily",
                description: "Potvrzení rezervace, změny stavu, expirace plateb."
              },
              {
                icon: Shield,
                title: "Bezpečnost",
                description: "Přihlášení přes cookie, rate‑limit, kontrola kolizí."
              }
            ].map((benefit, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <benefit.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jak to funguje */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Jak to funguje</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Vytvoř si účet",
                description: "zvol název organizace a časové pásmo."
              },
              {
                step: "2", 
                title: "Přidej služby a dostupnost",
                description: "nastav délku, cenu a okna dostupnosti."
              },
              {
                step: "3",
                title: "Sdílej odkaz na svou veřejnou stránku",
                description: "a začni přijímat rezervace."
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
                {index < 2 && (
                  <ChevronRight className="h-6 w-6 text-slate-400 absolute top-6 -right-3 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funkce */}
      <section id="funkce" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Funkce v základu</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, text: "Veřejná stránka organizace /:orgSlug" },
              { icon: Clock, text: "Služby (název, délka, cena, aktivita)" },
              { icon: Calendar, text: "Týdenní šablony dostupnosti + Blackouty" },
              { icon: Check, text: "Rezervace (PENDING/CONFIRMED/CANCELLED)" },
              { icon: Download, text: "Export do CSV" },
              { icon: Mail, text: "Potvrzovací e‑maily (dev log/SMTP)" },
              { icon: Shield, text: "Rate‑limit a anti‑spam" },
              { icon: Star, text: "CZ lokalizace, časová zóna Europe/Prague" }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <feature.icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-600">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online platby */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Online platby přes Stripe (volitelné)</h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Zapni platbu při rezervaci jako vypnutou, volitelnou nebo povinnou. 
            U povinné platby se slot drží 15 minut a rezervace se potvrdí automaticky po zaplacení.
          </p>
          <Button variant="outline" asChild>
            <Link href="/docs#platby">
              <CreditCard className="mr-2 h-4 w-4" />
              Přečíst, jak fungují platby
            </Link>
          </Button>
        </div>
      </section>

      {/* Ceník */}
      <section id="cenik" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Jednoduché a férové ceny</h2>
            <p className="text-xl text-slate-600">Všechny plány můžeš kdykoli změnit. Ceny vč. DPH.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE */}
            <Card className="relative border-2">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">FREE</h3>
                  <div className="text-4xl font-bold text-slate-900">0 Kč</div>
                  <div className="text-slate-600">/ měsíc</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">1 organizace</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">max. 1 služba</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">max. 50 rezervací / měsíc</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Veřejná stránka /:orgSlug</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">E‑mail potvrzení (plain)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Export CSV</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Branding v patičce</span>
                  </li>
                </ul>
                
                <Button className="w-full" asChild>
                  <Link href="/app/auth/register">Začít zdarma</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PRO */}
            <Card className="relative border-2 border-blue-500 shadow-lg transform scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Nejoblíbenější</Badge>
              </div>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">PRO</h3>
                  <div className="text-4xl font-bold text-blue-600">229 Kč</div>
                  <div className="text-slate-600">/ měsíc</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">1 organizace</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">až 5 služeb</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">1000 rezervací / měsíc</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Vypnutí brandingu</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Vylepšené e‑maily (logo, odesílatel)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Blackouty + týdenní šablony</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Lepší rate‑limit</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/app/auth/register?plan=pro">Přejít na PRO</Link>
                </Button>
              </CardContent>
            </Card>

            {/* BUSINESS */}
            <Card className="relative border-2">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">BUSINESS</h3>
                  <div className="text-4xl font-bold text-slate-900">649 Kč</div>
                  <div className="text-slate-600">/ měsíc</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Neomezené služby</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Neomezené rezervace*</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Až 5 admin uživatelů</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Integrace (Google Calendar, webhooks)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Přednostní podpora</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/app/auth/register?plan=business">Přejít na BUSINESS</Link>
                </Button>
                
                <p className="text-xs text-slate-500 mt-2 text-center">*Neomezené v rámci férového používání.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Často kladené dotazy</h2>
          </div>
          
          <div className="space-y-8">
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Je Free plán opravdu zdarma?</h3>
              <p className="text-slate-600">Ano. Free plán je bez časového omezení, s limity: 1 služba a 50 rezervací/měsíc.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Můžu kdykoliv přejít na PRO nebo BUSINESS?</h3>
              <p className="text-slate-600">Ano. Upgrade proběhne přes Stripe – přesměrování na zabezpečenou platební stránku.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Potřebuji vlastní web?</h3>
              <p className="text-slate-600">Ne. Dostaneš veřejnou stránku /:orgSlug, odkaz můžeš sdílet na sociálních sítích, Google firemním profilu nebo vložit na svůj web.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Jak fungují online platby?</h3>
              <p className="text-slate-600">V administraci zapneš režim plateb (OFF/OPTIONAL/REQUIRED). V REQUIRED vznikne dočasná „držák" rezervace, která se potvrdí po zaplacení. Nezaplacené držáky expirují.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Můžu exportovat rezervace?</h3>
              <p className="text-slate-600">Ano, přes CSV export v administraci.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Je systém v češtině?</h3>
              <p className="text-slate-600">Ano. CZ lokalizace a časové zóny.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Jak řešíte bezpečnost?</h3>
              <p className="text-slate-600">Přihlášení přes httpOnly cookie, kontrola kolizí rezervací, rate‑limit na veřejných endpointech.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Můžu skrýt branding?</h3>
              <p className="text-slate-600">Ano, od plánu PRO.</p>
            </div>
            
            <div className="border-b border-slate-200 pb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Podporujete Google Calendar nebo iCal?</h3>
              <p className="text-slate-600">V Business plánu je připravená integrace (postupně rozšiřujeme).</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Kde získám pomoc?</h3>
              <p className="text-slate-600">Napiš na support@bookli.cz nebo použitím formuláře na stránce /support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA opakování */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Začni přijímat rezervace ještě dnes</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" asChild>
              <Link href="/app/auth/register">Vytvořit účet zdarma</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/demo-salon">Podívat se na ukázku</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-semibold">Bookli.cz</span>
              </div>
              <p className="text-slate-400 text-sm">
                Jednoduchý rezervační systém pro malé provozy s českou lokalizací.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#funkce" className="hover:text-white">Funkce</a></li>
                <li><a href="#cenik" className="hover:text-white">Ceník</a></li>
                <li><Link href="/docs" className="hover:text-white">Dokumentace</Link></li>
                <li><Link href="/demo-salon" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Podpora</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/support" className="hover:text-white">Kontakt</Link></li>
                <li><a href="mailto:support@bookli.cz" className="hover:text-white">support@bookli.cz</a></li>
                <li><Link href="/docs#faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Právní</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terms" className="hover:text-white">Obchodní podmínky</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Ochrana údajů</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Bookli.cz. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}