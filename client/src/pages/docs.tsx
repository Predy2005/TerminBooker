import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calendar, 
  BookOpen, 
  Settings, 
  CreditCard, 
  Shield, 
  HelpCircle,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
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
              <span className="ml-4 text-slate-600">Dokumentace</span>
            </div>
            <Button asChild>
              <Link href="/app/auth/register">Začít zdarma</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Dokumentace</h1>
          <p className="text-xl text-slate-600">Vše, co potřebujete vědět o Bookli.cz rezervačním systému</p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Začínáme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">První kroky s rezervačním systémem</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#vytvoreni-uctu" className="text-blue-600 hover:underline">Vytvoření účtu a organizace</a></li>
                <li><a href="#prvni-sluzba" className="text-blue-600 hover:underline">Přidání první služby</a></li>
                <li><a href="#dostupnost" className="text-blue-600 hover:underline">Nastavení dostupnosti</a></li>
                <li><a href="#verejna-stranka" className="text-blue-600 hover:underline">Sdílení veřejné stránky</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Rezervace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Správa rezervací a jejich stavů</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#stavy-rezervaci" className="text-blue-600 hover:underline">Stavy rezervací</a></li>
                <li><a href="#export-csv" className="text-blue-600 hover:underline">Export do CSV</a></li>
                <li><a href="#filtrovani" className="text-blue-600 hover:underline">Filtrování v dashboardu</a></li>
                <li><a href="#blackouty" className="text-blue-600 hover:underline">Blackouty a výluky</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Platby (Stripe)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Online platby a jejich nastavení</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#rezimy-plateb" className="text-blue-600 hover:underline">Režimy OFF/OPTIONAL/REQUIRED</a></li>
                <li><a href="#drzak-rezervace" className="text-blue-600 hover:underline">Držák 15 minut a expirace</a></li>
                <li><a href="#navratove-url" className="text-blue-600 hover:underline">Návratové URL</a></li>
                <li><a href="#testovaci-karta" className="text-blue-600 hover:underline">Testovací platební karta</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Limity a plány
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Cenové plány a jejich omezení</p>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">Free:</span> 1 služba, 50 rezervací/měsíc</li>
                <li><span className="font-medium">PRO:</span> 5 služeb, 1000 rezervací/měsíc</li>
                <li><span className="font-medium">BUSINESS:</span> neomezeně (férové použití)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Bezpečnost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Ochrana údajů a soukromí</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#jwt-cookies" className="text-blue-600 hover:underline">JWT v httpOnly cookie</a></li>
                <li><a href="#smtp-emaily" className="text-blue-600 hover:underline">SMTP e‑maily</a></li>
                <li><a href="#ulozeni-dat" className="text-blue-600 hover:underline">Ukládání dat v EU</a></li>
                <li><a href="#rate-limiting" className="text-blue-600 hover:underline">Rate limiting</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Často kladené dotazy</p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/#faq">
                  Zobrazit FAQ
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* Začínáme */}
          <section id="vytvoreni-uctu" className="border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Začínáme</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Vytvoření účtu a organizace</h3>
                <div className="prose prose-slate max-w-none">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Navštivte <Link href="/app/auth/register" className="text-blue-600 hover:underline">registrační stránku</Link></li>
                    <li>Vyplňte název své organizace (např. "Kadeřnictví Petra")</li>
                    <li>Zvolte URL slug (např. "kadernictvi-petra")</li>
                    <li>Zadejte svůj e-mail a zvolte bezpečné heslo</li>
                    <li>Vyberte časové pásmo (většinou Europe/Prague)</li>
                    <li>Souhlaste s podmínkami použití a klikněte na "Vytvořit účet"</li>
                  </ol>
                </div>
              </div>

              <div id="prvni-sluzba">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Přidání první služby</h3>
                <div className="prose prose-slate max-w-none">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>V administraci přejděte na sekci "Služby"</li>
                    <li>Klikněte na "Přidat službu"</li>
                    <li>Zadejte název služby (např. "Střih vlasů")</li>
                    <li>Nastavte délku trvání v minutách (např. 60)</li>
                    <li>Volitelně zadejte cenu v Kč</li>
                    <li>Vyberte režim platby (Výchozí, Bez platby, Volitelná, Povinná)</li>
                    <li>Uložte službu</li>
                  </ol>
                </div>
              </div>

              <div id="dostupnost">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Nastavení dostupnosti a blackoutů</h3>
                <div className="prose prose-slate max-w-none">
                  <p className="mb-4">Dostupnost můžete nastavit dvěma způsoby:</p>
                  <h4 className="font-semibold mb-2">Týdenní šablony:</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                    <li>Nastavte pravidelné pracovní hodiny pro každý den v týdnu</li>
                    <li>Například: Pondělí 9:00-17:00, Úterý 10:00-18:00</li>
                    <li>Šablona se automaticky opakuje každý týden</li>
                  </ul>
                  <h4 className="font-semibold mb-2">Blackouty (výluky):</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pro jednorázové uzavření (dovolená, nemoc)</li>
                    <li>Zadejte datum a čas od-do</li>
                    <li>V této době nebudou zobrazeny volné termíny</li>
                  </ul>
                </div>
              </div>

              <div id="verejna-stranka">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Sdílení veřejné stránky</h3>
                <div className="prose prose-slate max-w-none">
                  <p className="mb-4">Vaše veřejná stránka má adresu: <code className="bg-slate-100 px-2 py-1 rounded">bookli.cz/vas-slug</code></p>
                  <p className="mb-4">Tuto adresu můžete:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sdílet na sociálních sítích</li>
                    <li>Přidat do Google firemního profilu</li>
                    <li>Vložit na svůj web jako odkaz</li>
                    <li>Poslat zákazníkům přes e-mail nebo SMS</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Rezervace */}
          <section id="stavy-rezervaci" className="border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Rezervace</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Stavy rezervací</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="font-semibold">PENDING</span>
                      </div>
                      <p className="text-sm text-slate-600">Čeká na potvrzení (nová rezervace)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">CONFIRMED</span>
                      </div>
                      <p className="text-sm text-slate-600">Potvrzená rezervace</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="font-semibold">CANCELLED</span>
                      </div>
                      <p className="text-sm text-slate-600">Zrušená rezervace</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="export-csv">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Export do CSV</h3>
                <p className="text-slate-600">V sekci rezervací najdete tlačítko "Export CSV", které stáhne všechny rezervace v tabulkovém formátu pro další zpracování v Excelu nebo Google Sheets.</p>
              </div>
            </div>
          </section>

          {/* Platby */}
          <section id="rezimy-plateb" className="border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Platby přes Stripe</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Režimy plateb</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Výchozí</h4>
                      <p className="text-sm text-slate-600">Použije se nastavení z organizace</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Bez platby (OFF)</h4>
                      <p className="text-sm text-slate-600">Žádná platba, rezervace se potvrdí hned</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Volitelná</h4>
                      <p className="text-sm text-slate-600">Zákazník si může vybrat, zda zaplatí</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Povinná</h4>
                      <p className="text-sm text-slate-600">Nutná okamžitá platba, jinak se slot uvolní</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="testovaci-karta">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Testovací platební karta</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-mono text-lg mb-2">4242 4242 4242 4242</p>
                  <p className="text-sm text-slate-600">Použijte tuto testovací kartu pro ověření platebního procesu. Jako datum expirace zadejte jakékoli budoucí datum a jako CVC jakékoli 3 číslice.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section className="border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Potřebujete pomoc?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">E-mailová podpora</h3>
                  <p className="text-slate-600 mb-4">Máte dotaz nebo potřebujete pomoct s nastavením?</p>
                  <a href="mailto:support@bookli.cz" className="text-blue-600 hover:underline font-medium">
                    support@bookli.cz
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Kontaktní formulář</h3>
                  <p className="text-slate-600 mb-4">Preferujete formulář? Napište nám přes náš kontaktní formulář.</p>
                  <Button variant="outline" asChild>
                    <Link href="/support">Kontaktní formulář</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}