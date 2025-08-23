import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";
import type { Invoice } from "@/types";

interface InvoicePreviewProps {
  invoice: Invoice;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
    plan: string;
    businessAddress?: string;
    businessCity?: string;
    businessZip?: string;
    businessCountry?: string;
    businessIco?: string;
    businessDic?: string;
  };
}

export function InvoicePreview({ invoice, organization }: InvoicePreviewProps) {
  const showLogo = organization?.logoUrl && (organization.plan === 'PRO' || organization.plan === 'BUSINESS');

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-6">
        {/* Header s logem */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {showLogo && (
              <img 
                src={organization.logoUrl!.startsWith('/objects/') ? `/api${organization.logoUrl}` : organization.logoUrl} 
                alt={`${organization.name} logo`}
                className="h-16 w-auto object-contain"
                data-testid="img-invoice-logo"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">FAKTURA</h1>
              <p className="text-slate-600">#{invoice.id}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Stáhnout PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Tisknout
            </Button>
          </div>
        </div>

        {/* Informace o faktuře */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Dodavatel:</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">Bookli.cz s.r.o.</p>
              <p>Václavské náměstí 1</p>
              <p>110 00 Praha 1</p>
              <p>Česká republika</p>
              <p>IČO: 12345678</p>
              <p>DIČ: CZ12345678</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Odběratel:</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{organization?.name}</p>
              {organization?.businessAddress && <p>{organization.businessAddress}</p>}
              {organization?.businessCity && organization?.businessZip && (
                <p>{organization.businessZip} {organization.businessCity}</p>
              )}
              {organization?.businessCountry && <p>{organization.businessCountry}</p>}
              {organization?.businessIco && <p>IČO: {organization.businessIco}</p>}
              {organization?.businessDic && <p>DIČ: {organization.businessDic}</p>}
            </div>
          </div>
        </div>

        {/* Detaily faktury */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Datum vystavení:</span>
              <span>{new Date(invoice.createdAt).toLocaleDateString('cs-CZ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Datum splatnosti:</span>
              <span>{new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Měna:</span>
              <span>{invoice.currency}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stav:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {invoice.status === 'paid' ? 'Zaplaceno' :
                 invoice.status === 'overdue' ? 'Po splatnosti' :
                 invoice.status === 'sent' ? 'Odesláno' :
                 invoice.status === 'draft' ? 'Koncept' : 'Zrušeno'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Položky faktury */}
        <div className="space-y-4">
          <h3 className="font-semibold">Položky:</h3>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-medium">Popis</th>
                  <th className="text-right p-3 font-medium">Množství</th>
                  <th className="text-right p-3 font-medium">Jednotková cena</th>
                  <th className="text-right p-3 font-medium">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{item.unitPrice.toFixed(2)} {invoice.currency}</td>
                    <td className="p-3 text-right font-medium">{item.total.toFixed(2)} {invoice.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Celková částka */}
          <div className="flex justify-end">
            <div className="space-y-2 min-w-64">
              <div className="flex justify-between text-lg font-bold">
                <span>Celkem k úhradě:</span>
                <span>{invoice.amount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Poznámky */}
        <div className="mt-8 pt-4 border-t text-sm text-slate-600">
          <p>Děkujeme za vaši důvěru v naše služby.</p>
          <p className="mt-2">Tato faktura byla vygenerována automaticky systémem Bookli.cz.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoicePreview;