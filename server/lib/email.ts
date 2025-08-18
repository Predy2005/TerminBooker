import nodemailer from "nodemailer";
import type { Booking, Organization, Service } from "@shared/schema";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.seznam.cz",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendBookingConfirmation(
  to: string,
  booking: Booking & { service: Service },
  organization: Organization
): Promise<void> {
  const subject = `Potvrzení rezervace - ${organization.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Potvrzení rezervace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Potvrzení rezervace</h1>
        </div>
        <div class="content">
          <p>Dobrý den ${booking.customerName},</p>
          <p>Vaše rezervace byla úspěšně přijata. Níže najdete detaily:</p>
          
          <div class="booking-details">
            <h3>Detaily rezervace</h3>
            <p><strong>Služba:</strong> ${booking.service.name}</p>
            <p><strong>Datum a čas:</strong> ${booking.startsAt.toLocaleDateString('cs-CZ')} v ${booking.startsAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Délka:</strong> ${booking.service.durationMin} minut</p>
            ${booking.service.priceCzk ? `<p><strong>Cena:</strong> ${booking.service.priceCzk} Kč</p>` : ''}
            ${booking.note ? `<p><strong>Poznámka:</strong> ${booking.note}</p>` : ''}
          </div>
          
          <p><strong>Organizace:</strong> ${organization.name}</p>
          <p><strong>Status:</strong> ${booking.status === 'PENDING' ? 'Čeká na potvrzení' : 'Potvrzeno'}</p>
          
          <p>V případě dotazů nás neváhejte kontaktovat.</p>
          <p>Děkujeme za Vaši důvěru!</p>
        </div>
        <div class="footer">
          <p>Toto je automatická zpráva. Neodpovídejte na ni.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (process.env.NODE_ENV === "development") {
    console.log("=== EMAIL NOTIFICATION ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Service: ${booking.service.name}`);
    console.log(`Date: ${booking.startsAt.toISOString()}`);
    console.log("=========================");
  } else {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Rezervační systém" <noreply@rezervace.cz>',
      to,
      subject,
      html
    });
  }
}

export async function sendBookingStatusChange(
  to: string,
  booking: Booking & { service: Service },
  organization: Organization,
  newStatus: string
): Promise<void> {
  const statusMap = {
    CONFIRMED: "Potvrzeno",
    CANCELLED: "Zrušeno",
    PENDING: "Čeká na potvrzení"
  };

  const subject = `Změna stavu rezervace - ${organization.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Změna stavu rezervace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .status { padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
        .status.confirmed { background: #10B981; color: white; }
        .status.cancelled { background: #EF4444; color: white; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Změna stavu rezervace</h1>
        </div>
        <div class="content">
          <p>Dobrý den ${booking.customerName},</p>
          <p>Stav Vaší rezervace byl změněn:</p>
          
          <div class="status ${newStatus.toLowerCase()}">
            ${statusMap[newStatus as keyof typeof statusMap] || newStatus}
          </div>
          
          <div class="booking-details">
            <h3>Detaily rezervace</h3>
            <p><strong>Služba:</strong> ${booking.service.name}</p>
            <p><strong>Datum a čas:</strong> ${booking.startsAt.toLocaleDateString('cs-CZ')} v ${booking.startsAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Délka:</strong> ${booking.service.durationMin} minut</p>
            ${booking.service.priceCzk ? `<p><strong>Cena:</strong> ${booking.service.priceCzk} Kč</p>` : ''}
          </div>
          
          <p>V případě dotazů nás neváhejte kontaktovat.</p>
          <p>Děkujeme!</p>
        </div>
        <div class="footer">
          <p>Toto je automatická zpráva. Neodpovídejte na ni.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (process.env.NODE_ENV === "development") {
    console.log("=== EMAIL STATUS CHANGE ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`New Status: ${newStatus}`);
    console.log("===========================");
  } else {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Rezervační systém" <noreply@rezervace.cz>',
      to,
      subject,
      html
    });
  }
}
