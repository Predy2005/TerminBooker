import Stripe from "stripe";
import { storage } from "../storage";
import type { PaymentMode, Service, Organization, Booking } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export function determinePaymentMode(service: Service, organization: Organization): PaymentMode {
  // Service-level setting overrides organization-level setting
  if (service.requirePayment !== "ORG_DEFAULT") {
    return service.requirePayment as PaymentMode;
  }
  
  // For now, default to OFF since we don't have organization-level payment settings yet
  // TODO: Add organization payment settings
  return "OFF";
}

export async function createCheckoutSession(
  booking: Booking,
  service: Service,
  organization: Organization
): Promise<{ url: string; sessionId: string }> {
  if (!service.priceCzk) {
    throw new Error("Service does not have a price set");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "czk",
          product_data: {
            name: service.name,
            description: `Rezervace na ${new Date(booking.startsAt).toLocaleString("cs-CZ")}`,
          },
          unit_amount: service.priceCzk * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      organizationId: organization.id,
      serviceId: service.id,
    },
    success_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:5000"}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:5000"}/booking/cancel?booking_id=${booking.id}`,
    expires_at: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
  });

  // Update booking with payment external ID
  await storage.updateBooking(booking.id, {
    paymentExternalId: session.id,
    paymentProvider: "stripe",
  });

  // Create booking payment record
  await storage.createBookingPayment({
    bookingId: booking.id,
    provider: "stripe",
    externalId: session.id,
    amountCents: service.priceCzk * 100,
    currency: "CZK",
    status: "created",
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Store webhook event for idempotency
  await storage.createWebhookEvent({
    provider: "stripe",
    eventType: event.type,
    payload: event as any,
  });

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error("No booking ID found in session metadata");
    return;
  }

  const booking = await storage.getBooking(bookingId);
  if (!booking) {
    console.error(`Booking not found: ${bookingId}`);
    return;
  }

  // Update booking payment status
  await storage.updateBooking(bookingId, {
    paymentStatus: "PAID",
    status: "CONFIRMED",
    holdExpiresAt: null, // Clear hold
  });

  // Update booking payment record
  await storage.updateBookingPaymentByExternalId(session.id, {
    status: "paid",
    paidAt: new Date(),
    rawPayload: session as any,
  });

  console.log(`✓ Payment confirmed for booking ${bookingId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // This might be called after checkout.session.completed, so we should handle it gracefully
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);
}

export { stripe };